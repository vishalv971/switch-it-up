import google.generativeai as genai
from typing import Optional
import os
from dotenv import load_dotenv
import json
import httpx
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

        After creating the journal entry, you MUST save it using this function:
        save_to_notion(title: str, content: str) -> None
        
        The title should be a brief, descriptive summary of the conversation.
        The content should be the full journal entry with markdown formatting.

        Transcript:
        {transcript}
        """
        
        try:
            response = await self.model.generate_content_async(
                prompt,
                tools=[{
                    "function": "save_to_notion",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "The title of the journal entry"
                            },
                            "content": {
                                "type": "string",
                                "description": "The content of the journal entry in markdown format"
                            }
                        },
                        "required": ["user_id", "title", "content"]
                    }
                }]
            )
            
            # Extract the function call from the response
            function_call = response.candidates[0].content.parts[0].function_call
            
            # Make the actual API call
            async with httpx.AsyncClient() as client:
                save_response = await client.post(
                    'http://localhost:3000/api/py/add-conv-hist',
                    json={
                        "user_id": self.user_id,
                        "title": function_call.args["title"],
                        "content": function_call.args["content"]
                    }
                )
                save_response.raise_for_status()
                
            return {
                "title": function_call.args["title"],
                "content": function_call.args["content"],
                "saved_to_notion": True
            }
            
        except Exception as e:
            raise Exception(f"Failed to process or save journal entry: {str(e)}")
