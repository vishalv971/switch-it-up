from fastapi import FastAPI, HTTPException, Request, Header
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import hmac
import hashlib
from pathlib import Path


from api.src.db.supabase import (
    insert_data,
    select_data
)

# Load environment variables from .env.local in parent directory
env_path = Path(__file__).parent.parent / '.env.local'
load_dotenv(env_path)

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)
SUPABASE_TABLE = os.environ.get("SUPABASE_TABLE")


### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}


@app.post("/api/webhooks/clerk")
async def clerk_webhook(request: Request, svix_id: str = Header(None), svix_timestamp: str = Header(None), svix_signature: str = Header(None)):
    try:

        # Get the webhook signing secret from your environment variables
        signing_secret = os.environ.get("CLERK_WEBHOOK_SECRET")

        # Get the raw request body
        payload = await request.body()

        print(signing_secret)
        print(payload)

        # Verify the webhook signature
        signature_header = svix_signature.split(" ")
        signatures = [sig.split(",")[1] for sig in signature_header]

        # Create message to verify
        message = f"{svix_id}.{svix_timestamp}.{payload.decode()}"

        print(message)

        # Verify at least one signature matches
        is_valid = False
        for signature in signatures:
            hmac_obj = hmac.new(signing_secret.encode(), message.encode(), hashlib.sha256)
            calculated_signature = hmac_obj.hexdigest()
            if hmac.compare_digest(calculated_signature, signature):
                is_valid = True
                break

        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid signature")

        print("Valid signature")

        # Parse the webhook payload
        webhook_data = await request.json()

        # Handle the webhook event
        if webhook_data["type"] == "user.created":

            print("User created if block")
            # Extract user data
            user_data = webhook_data["data"]

            print(user_data)

            # Insert the user into your database
            result = insert_data(
                supabase=supabase,
                table=SUPABASE_TABLE,
                data={
                    "user_id": user_data["id"],
                    "email": user_data["email_addresses"][0]["email_address"],
                    "name": user_data.get("first_name", "") + " " + user_data.get("last_name", ""),
                }
            )

            print(result)

            if not result['success']:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to create user record: {result['error']}"
                )

        return {"status": "success"}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )

@app.post("/api/db/getUser")
async def db_select_user(request: Request):
    try:
        request_data = await request.json()
        # validated_data = validate_select_request(request_data)

        data = select_data(
            supabase=supabase,
            table=SUPABASE_TABLE,
            columns=request_data.get('columns', '*'),
            filters=request_data.get('filters', None),
            order_by=request_data.get('order_by', None),
            limit=request_data.get('limit', None),
            offset=request_data.get('offset', None)
        )

        return {
            "status": "success",
            "data": data,
            "count": len(data)
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )

@app.post("/api/db/updateUser")
async def db_update_user(request: Request):
    try:
        request_data = await request.json()
        # validated_data = validate_insert_request(request_data)

        result = insert_data(
            supabase=supabase,
            table=SUPABASE_TABLE,
            data=request_data.get("data",None),
            upsert=request_data.get("upsert", False)
        )

        if not result['success']:
            raise HTTPException(
                status_code=400,
                detail=f"Upsert failed: {result['error']}"
            )

        return {
            "status": "success",
            "data": result['data'],
            "count": result['count']
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )
