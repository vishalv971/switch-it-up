import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel    

from api.src.config.calendar_config import DEFAULT_TIME_ZONE
from api.src.services.gcal_service import GoogleCalendarService
from api.src.db.supabase import select_data
from api.index import supabase
router = APIRouter(prefix="/api/py/calendar", tags=["calendar"])

class Attendee(BaseModel):
    email: str

class EventCreate(BaseModel):
    user_id: str
    summary: str
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    location: Optional[str] = None
    attendees: Optional[List[Attendee]] = None
    timezone: Optional[str] = None

class EventUpdate(BaseModel):
    user_id: str
    summary: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    description: Optional[str] = None
    location: Optional[str] = None
    attendees: Optional[List[Attendee]] = None
    timezone: Optional[str] = None

def get_auth_token(user_id: str) -> str:
    """
    Get Google Calendar auth token for the user from database.
    
    Args:
        user_id: User ID to fetch auth token for
        
    Returns:
        Google Calendar auth token
    
    Raises:
        HTTPException: If auth token not found for user
    """
    result = select_data(
        supabase=supabase,  # It will use default client
        table='google_integrations',
        columns='access_token',
        filters={'user_id': user_id}
    )
    
    if not result or len(result) == 0:
        raise HTTPException(
            status_code=404,
            detail=f"No Google Calendar integration found for user {user_id}"
        )
    
    return result[0]['access_token']

def get_calendar_service(user_id: str) -> GoogleCalendarService:
    """
    Create a new calendar service instance for the user.
    
    Args:
        user_id: User ID to create service for
        
    Returns:
        GoogleCalendarService instance
    """
    auth_token = get_auth_token(user_id)
    return GoogleCalendarService(auth_token=auth_token)

@router.get("/events")
async def list_events(user_id: str, max_results: int = 10):
    """List upcoming calendar events."""
    try:
        calendar_service = get_calendar_service(user_id)
        events = calendar_service.list_upcoming_events(max_results=max_results)
        return {"events": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/events")
async def create_event(event: Request):
    """Create a new calendar event."""
    try:
        event = await event.json()
        print('--------------------------------')
        print(event)
        print('--------------------------------')
        calendar_service = get_calendar_service(event['user_id'])
        # attendees_dict = [{"email": attendee.email} for attendee in (event.attendees or [])]
        
        created_event = calendar_service.create_event(
            summary=event['summary'],
            start_time=datetime.fromisoformat(event['start_time']),
            end_time=datetime.fromisoformat(event['end_time']),
            # description=event.get('description'),
            # location=event.get('location'),
            # attendees=event.get('attendees'),
            # timezone=event.get('timezone', DEFAULT_TIME_ZONE)
        )
        print('--------------------------------')
        print(created_event)
        print('--------------------------------')
        return created_event
    except Exception as e:
        print('--------------------------------')
        print(e)
        print('--------------------------------')
        raise HTTPException(status_code=500, detail=str(e))

# @router.put("/events/{event_id}")
# async def update_event(event_id: str, event: EventUpdate):
#     """Update an existing calendar event."""
#     try:
#         calendar_service = get_calendar_service(event.user_id)
#         attendees_dict = None
#         if event.attendees:
#             attendees_dict = [{"email": attendee.email} for attendee in event.attendees]
        
#         updated_event = calendar_service.update_event(
#             event_id=event_id,
#             summary=event.summary,
#             start_time=event.start_time,
#             end_time=event.end_time,
#             description=event.description,
#             location=event.location,
#             attendees=attendees_dict,
#             timezone=event.timezone or "UTC"
#         )
#         return updated_event
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.delete("/events/{event_id}")
async def delete_event(event_id: str, user_id: str):
    """Delete a calendar event."""
    try:
        calendar_service = get_calendar_service(user_id)
        success = calendar_service.delete_event(event_id)
        if success:
            return {"message": "Event deleted successfully"}
        raise HTTPException(status_code=404, detail="Event not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
    

