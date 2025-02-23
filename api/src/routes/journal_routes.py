from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import json
from ..services.journal_service import JournalService
import httpx

router = APIRouter(prefix="/api/py/journal", tags=["journal"])
journal_service = JournalService()

class JournalRequest(BaseModel):
    user_id: str
    conversation_id: str

@router.post("/create")
async def create_journal(request: Request):
    """
    Create a journal entry from an ElevenLabs conversation.
    
    Args:
        request: Request containing conversation_id
        
    Returns:
        Journal entry and related data
    """
    try:
        request = await request.json()
        print(request)
        result = await journal_service.create_journal_entry(request['user_id'], request['conversation_id'])
        print(result)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        # Save to Notion using the add-conv-hist endpoint
        async with httpx.AsyncClient() as client:
            notion_data = {
                "user_id": request['user_id'],
                "title": result['journal_entry']['title'],
                "content": result['journal_entry']['content']
            }
            print('--------------------------------')
            print(notion_data)
            print('--------------------------------')
            notion_response = await client.post(
                "http://localhost:3000/api/py/add-conv-hist",
                json=notion_data
            )
            if notion_response.status_code != 200:
                print(f"Warning: Failed to save to Notion: {notion_response.text}")
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 