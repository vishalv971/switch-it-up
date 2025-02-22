from fastapi import FastAPI, HTTPException, Request, Header
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import hmac
import hashlib
from pathlib import Path
import logging


from api.src.db.supabase import (
    insert_data,
    select_data
)

# Load environment variables from .env.local in parent directory
env_path = Path(__file__).parent.parent / '.env.local'
load_dotenv(env_path)

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}


@app.post("/api/py/user")
async def user(request: Request):
    try:
        data = await request.json()

        # Insert the user into your database
        result = insert_data(
            supabase=supabase,
            table="users",
            data={
                "user_id": data['user_id'],
                "email": data['email'],
                "name": data['name'],
            },
            upsert=True
        )

        logger.info(f"Database insert result: {result}")

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


@app.post("/api/py/conversations")
async def user(request: Request):
    try:
        data = await request.json()

        # Insert the conversations into your database
        result = insert_data(
            supabase=supabase,
            table="conversations",
            data={
                "user_id": data['user_id'],
                "conversation_id": data['conversation_id']
            },
            upsert=True
        )

        logger.info(f"Database insert result: {result}")

        if not result['success']:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create conversation record: {result['error']}"
            )

        return {"status": "success"}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )


@app.get("/api/py/conversations/{user_id}")
async def get_user_conversations(user_id, limit = None, offset = None):
    try:
        # Set up the query parameters
        filters = {"user_id": user_id}
        order_by = {"created_at": "desc"}

        # Query the database using your wrapper function
        result = select_data(
            supabase=supabase,
            table="conversations",
            columns="conversation_id",
            filters=filters,
            order_by=order_by,
            limit=limit,
            offset=offset
        )

        # Extract conversation IDs from the result
        conversation_ids = [row["conversation_id"] for row in result]

        return {"conversation_ids": conversation_ids}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch conversations: {str(e)}"
        )
