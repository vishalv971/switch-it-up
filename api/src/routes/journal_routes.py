from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import json
from ..services.journal_service import JournalService

router = APIRouter(prefix="/api/py/journal", tags=["journal"])
journal_service = JournalService()

class JournalRequest(BaseModel):
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
        result = await journal_service.create_journal_entry(request['conversation_id'])
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 