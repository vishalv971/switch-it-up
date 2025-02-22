from fastapi import FastAPI, HTTPException, Request, Header
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import hmac
import hashlib
from pathlib import Path
import logging
import httpx
import base64


from api.src.db.supabase import (
    insert_data,
    select_data
)

# Load environment variables from .env.local in parent directory
env_path = Path(__file__).parent.parent / '.env.local'
load_dotenv(env_path)

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
notion_client_id: str = os.getenv("NOTION_CLIENT_ID")
notion_client_secret: str = os.getenv("NOTION_CLIENT_SECRET")
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


@app.post("/api/py/notion/callback")
async def notion_callback(request: Request):
    try:
        data = await request.json()
        code = data.get('code')
        user_id = data.get('user_id')
        redirect_uri = data.get('redirect_uri')

        logger.info(f"Received notion callback data: {data}")

        if not code or not user_id or not redirect_uri:
            raise HTTPException(
                status_code=400,
                detail="Missing required parameters"
            )

        if not notion_client_id or not notion_client_secret:
            logger.error("Missing Notion credentials in environment")
            raise HTTPException(
                status_code=500,
                detail="Server configuration error"
            )

        # Exchange the code for an access token
        async with httpx.AsyncClient() as client:
            headers = {
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            }

            logger.info(f"Making request to Notion with redirect_uri: {redirect_uri}")

            payload = {
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': redirect_uri
            }

            logger.info(f"Request payload: {payload}")

            response = await client.post(
                'https://api.notion.com/v1/oauth/token',
                headers=headers,
                json=payload,
                auth=(notion_client_id, notion_client_secret)
            )

            try:
                response_data = response.json()
                logger.info(f"Response status: {response.status_code}")
                logger.info(f"Response headers: {response.headers}")
                logger.info(f"Response data: {response_data}")
            except Exception as e:
                logger.error(f"Failed to parse response as JSON: {response.text}")
                raise HTTPException(
                    status_code=500,
                    detail="Failed to parse Notion response"
                )

            if response.status_code != 200:
                error_msg = response_data.get('error_description', response_data.get('error', 'Unknown error'))
                logger.error(f"Notion API error: {response_data}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to exchange code for token: {error_msg}"
                )

            logger.info("Successfully obtained Notion access token")

            print(response_data)

            # Store the access token in the database
            result = insert_data(
                supabase=supabase,
                table="notion_integrations",
                data={
                    "user_id": user_id,
                    "access_token": response_data['access_token'],
                    "workspace_id": response_data['workspace_id'],
                    "workspace_name": response_data.get('workspace_name', ''),
                    "bot_id": response_data['bot_id']
                },
                upsert=True
            )

            print(result)

            if not result['success']:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to store Notion integration"
                )

            return {"status": "success"}

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in notion callback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )


@app.get("/api/py/notion/status/{user_id}")
async def get_notion_status(user_id: str):
    try:
        # Query the database for notion integration
        result = select_data(
            supabase=supabase,
            table="notion_integrations",
            columns="*",
            filters={"user_id": user_id},
            limit=1
        )

        logger.info(f"Notion status query result: {result}")

        is_connected = len(result) > 0
        workspace_name = result[0].get('workspace_name', '') if is_connected else None

        return {
            "is_connected": is_connected,
            "workspace_name": workspace_name
        }

    except Exception as e:
        logger.error(f"Error checking Notion status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to check Notion integration status: {str(e)}"
        )
