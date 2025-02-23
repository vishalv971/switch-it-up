from typing import List

SCOPES: List[str] = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events'
]

# Calendar API settings
CALENDAR_API_VERSION = 'v3'
CALENDAR_SERVICE_NAME = 'calendar'

# Time format for calendar events
DATETIME_FORMAT = '%Y-%m-%dT%H:%M:%S%z'

# Default calendar settings
DEFAULT_MAX_RESULTS = 10
DEFAULT_TIME_ZONE = 'UTC' 