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
SUPABASE_TABLE = os.getenv("SUPABASE_TABLE")

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
            table=SUPABASE_TABLE,
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
