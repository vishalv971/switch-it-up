import requests
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

from .gemini_service import GeminiService

load_dotenv()

class JournalService:
    def __init__(self):
        self.eleven_labs_api_key = os.getenv('NEXT_PUBLIC_XI_API_KEY')
        self.gemini = GeminiService()
    
    async def get_conversation_transcript(self, conversation_id: str) -> str:
        """
        Fetch conversation transcript from ElevenLabs.
        
        Args:
            conversation_id: ElevenLabs conversation ID
            
        Returns:
            Conversation transcript text
        """
        try:
            url = f"https://api.elevenlabs.io/v1/convai/conversations/{conversation_id}"
            headers = {"xi-api-key": self.eleven_labs_api_key}
            
            response = requests.get(url, headers=headers)
            
            if response.status_code != 200:
                raise Exception(f"Failed to fetch conversation: {response.text}")
            
            data = response.json()
            
            if not data or 'transcript' not in data:
                raise Exception(f"No transcript found in conversation: {conversation_id}")
            
            return data['transcript']
            
        except Exception as e:
            raise Exception(f"Failed to fetch conversation transcript: {str(e)}")
    
    async def create_journal_entry(self, user_id: str, conversation_id: str) -> Dict[str, Any]:
        """
        Create a journal entry from an ElevenLabs conversation.
        
        Args:
            conversation_id: ElevenLabs conversation ID
            
        Returns:
            Dictionary containing the journal entry and metadata
        """
        try:
            # Get the conversation transcript
            print("Getting conversation transcript")
            transcript = await self.get_conversation_transcript(conversation_id)
            print("Transcript received")
            
            # Convert transcript to journal entry
            print("Converting transcript to journal entry")
            journal_entry = await self.gemini.transcript_to_journal(user_id, transcript)
            print("Journal entry created")
            
            return {
                "journal_entry": journal_entry,
                "success": True
            }
            
        except Exception as e:
            return {
                "conversation_id": conversation_id,
                "error": str(e),
                "success": False
            } 