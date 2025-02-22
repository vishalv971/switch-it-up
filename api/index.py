from fastapi import FastAPI, HTTPException, Request
from supabase import create_client, Client
import os
from dotenv import load_dotenv, find_dotenv


from api.src.db.supabase import (
    insert_data,
    select_data

load_dotenv(find_dotenv())

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)
SUPABASE_TABLE = os.environ.get("SUPABASE_TABLE")


### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}


@app.post("/api/db/insertUser")
async def db_insert_user(request: Request):
    try:
        request_data = await request.json()
        # validated_data = validate_insert_request(request_data)
        print(request_data)
        result = insert_data(
            supabase=supabase,
            table=SUPABASE_TABLE,
            data=request_data
        )
        
        if not result['success']:
            raise HTTPException(
                status_code=400,
                detail=f"Insert failed: {result['error']}"
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