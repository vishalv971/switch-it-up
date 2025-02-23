import os
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from ..config.calendar_config import (
    SCOPES,
    CALENDAR_API_VERSION,
    CALENDAR_SERVICE_NAME,
    DATETIME_FORMAT,
    DEFAULT_MAX_RESULTS,
    DEFAULT_TIME_ZONE
)

class GoogleCalendarService:
    def __init__(self, auth_token: str):
        """
        Initialize the Google Calendar service with an auth token.
        
        Args:
            auth_token: The Google OAuth2 token
        """
        self.auth_token = auth_token
        self.service = None
        self.initialize_service()

    def initialize_service(self) -> None:
        """Initialize the Google Calendar service with token authentication."""
        try:
            # Create credentials from the auth token
            creds = Credentials(
                token=self.auth_token,
                scopes=SCOPES
            )
            
            self.service = build(CALENDAR_SERVICE_NAME, CALENDAR_API_VERSION, credentials=creds)
        except Exception as e:
            raise Exception(f"Failed to initialize calendar service: {str(e)}")

    def list_upcoming_events(
        self,
        max_results: int = DEFAULT_MAX_RESULTS,
        time_min: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """
        List upcoming calendar events.
        
        Args:
            max_results: Maximum number of events to return
            time_min: Start time for fetching events (defaults to now)
            
        Returns:
            List of calendar events
        """
        try:
            if not time_min:
                time_min = datetime.utcnow()

            events_result = self.service.events().list(
                calendarId='primary',
                timeMin=time_min.isoformat() + 'Z',
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            return events
        except HttpError as error:
            print(f'An error occurred: {error}')
            return []

    def create_event(
        self,
        summary: str,
        start_time: datetime,
        end_time: datetime,
        description: Optional[str] = None,
        location: Optional[str] = None,
        attendees: Optional[List[Dict[str, str]]] = None,
        timezone: str = DEFAULT_TIME_ZONE
    ) -> Dict[str, Any]:
        """
        Create a new calendar event.
        
        Args:
            summary: Event title
            start_time: Event start time
            end_time: Event end time
            description: Event description
            location: Event location
            attendees: List of attendees ({email: str})
            timezone: Timezone for the event
            
        Returns:
            Created event details
        """
        try:
            event = {
                'summary': summary,
                'location': location,
                'description': description,
                'start': {
                    'dateTime': start_time.strftime(DATETIME_FORMAT),
                    'timeZone': timezone,
                },
                'end': {
                    'dateTime': end_time.strftime(DATETIME_FORMAT),
                    'timeZone': timezone,
                }
            }

            if attendees:
                event['attendees'] = attendees

            event = self.service.events().insert(
                calendarId='primary',
                body=event,
                sendUpdates='all'
            ).execute()
            
            return event
        except HttpError as error:
            print(f'An error occurred: {error}')
            return {}

    def update_event(
        self,
        event_id: str,
        summary: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        description: Optional[str] = None,
        location: Optional[str] = None,
        attendees: Optional[List[Dict[str, str]]] = None,
        timezone: str = DEFAULT_TIME_ZONE
    ) -> Dict[str, Any]:
        """
        Update an existing calendar event.
        
        Args:
            event_id: ID of the event to update
            summary: New event title
            start_time: New start time
            end_time: New end time
            description: New description
            location: New location
            attendees: New list of attendees
            timezone: Timezone for the event
            
        Returns:
            Updated event details
        """
        try:
            event = self.service.events().get(calendarId='primary', eventId=event_id).execute()

            if summary:
                event['summary'] = summary
            if description:
                event['description'] = description
            if location:
                event['location'] = location
            if start_time:
                event['start'] = {
                    'dateTime': start_time.strftime(DATETIME_FORMAT),
                    'timeZone': timezone
                }
            if end_time:
                event['end'] = {
                    'dateTime': end_time.strftime(DATETIME_FORMAT),
                    'timeZone': timezone
                }
            if attendees:
                event['attendees'] = attendees

            updated_event = self.service.events().update(
                calendarId='primary',
                eventId=event_id,
                body=event,
                sendUpdates='all'
            ).execute()
            
            return updated_event
        except HttpError as error:
            print(f'An error occurred: {error}')
            return {}

    def delete_event(self, event_id: str) -> bool:
        """
        Delete a calendar event.
        
        Args:
            event_id: ID of the event to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            self.service.events().delete(
                calendarId='primary',
                eventId=event_id,
                sendUpdates='all'
            ).execute()
            return True
        except HttpError as error:
            print(f'An error occurred: {error}')
            return False
