import google.generativeai as genai
from typing import Optional
import os
from dotenv import load_dotenv
import json
import httpx
from pydantic import BaseModel
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
    
    async def transcript_to_journal(self, user_id: str, transcript: str) -> dict:
        """
        Convert a conversation transcript into a meaningful journal entry and save it to Notion.
        
        Args:
            transcript: The conversation transcript text
            
        Returns:
            A dictionary containing the journal entry data and save status
        """
        print("Starting transcript to journal")
        prompt = f"""
        Please convert this conversation transcript into a meaningful journal entry.
        Focus on:
        1. Key points and insights from the conversation
        2. Important decisions or actions discussed
        3. Emotional elements and personal reflections
        4. Main takeaways and next steps
        
        Format it as a proper journal entry with date, clear paragraphs, and a conclusion.
        
        Return ONLY a JSON object with exactly this format:
        {{
            "title": "Brief descriptive title",
            "content": "Full markdown journal entry"
        }}

        Transcript:
        {transcript}
        """

        try:
            response = await self.model.generate_content_async(prompt)
            
            if not response.candidates or not response.candidates[0].content:
                raise Exception("No valid response received from Gemini")
            
            # Get the text content and parse it as JSON
            text_content = response.candidates[0].content.parts[0].text
            text_content = text_content.replace('```json', '').replace('```', '')
            print(text_content)
            result = json.loads(text_content)
            
            if not isinstance(result, dict) or 'title' not in result or 'content' not in result:
                raise Exception("Invalid JSON response format")
            
            # Make the actual API call
            async with httpx.AsyncClient() as client:
                save_response = await client.post(
                    'http://localhost:3000/api/py/add-conv-hist',
                    json={
                        "user_id": user_id,
                        "title": result['title'],
                        "content": result['content']
                    }
                )
                save_response.raise_for_status()
                
            return {
                "title": result['title'],
                "content": result['content'],
                "saved_to_notion": True
            }
            
        except Exception as e:
            raise Exception(f"Failed to process or save journal entry: {str(e)}")
