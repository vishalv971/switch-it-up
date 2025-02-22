import google.generativeai as genai
# from google.generativeai import 
from pydantic import BaseModel
from typing import Dict, Any, Callable, List
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv, find_dotenv
import os

# Configure your Gemini API key
genai.configure(api_key="YOUR_API_KEY")  # Replace with your actual API key

# Initialize the Gemini model
model = genai.GenerativeModel('gemini-pro')

class WebSearchQuery(BaseModel):
    query: str

class WebSearchResult(BaseModel):
    results: List[str]

def web_search(query: str) -> WebSearchResult:
    """Performs a web search and returns snippets from the top results."""
    try:
        search_results = []
        search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(search_url, headers=headers)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)

        soup = BeautifulSoup(response.content, "html.parser")
        result_divs = soup.find_all("div", class_="tF2Cxc")  # Google search result div class

        for result_div in result_divs[:3]:  # Limit to top 3 results
            try:
                snippet = result_div.find("div", class_="VwiC3b").text
                search_results.append(snippet)
            except AttributeError:
                pass # some results may not have snippets

        return WebSearchResult(results=search_results)

    except requests.exceptions.RequestException as e:
        return WebSearchResult(results=[f"Error during web search: {e}"])
    except Exception as e:
        return WebSearchResult(results=[f"An unexpected error occurred: {e}"])

import requests
from pydantic import BaseModel
from typing import List

class BraveSearchResult(BaseModel):
    results: List[str]

import requests
from pydantic import BaseModel
from typing import List

class BraveSearchResult(BaseModel):
    results: List[str]

def brave_search(query: str, api_key: str) -> BraveSearchResult:
    """Performs a search using the Brave Search API."""
    try:
        search_url = f"https://api.search.brave.com/api/v1/web?q={query.replace(' ', '+')}"
        headers = {
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            # Change to "Bearer" authentication format
            "Authorization": f"Bearer {api_key}"
        }
        response = requests.get(search_url, headers=headers)
        response.raise_for_status()

        print("Raw response:", response.text)  # Print the raw response
        data = response.json()
        search_results = []

        if "results" in data:
            for result in data["results"][:3]:
                if "description" in result:
                    search_results.append(result["description"])

        return BraveSearchResult(results=search_results)

    except requests.exceptions.HTTPError as e:
        return BraveSearchResult(results=[f"Error during Brave search: {e}, Response Text: {e.response.text}"])
    except requests.exceptions.RequestException as e:
        return BraveSearchResult(results=[f"Error during Brave search: {e}"])
    except Exception as e:
        return BraveSearchResult(results=[f"An unexpected error occurred: {e}"])

# Define function declarations for Gemini
# web_search_func = FunctionDeclaration(
#     name="web_search",
#     description="Performs a web search and returns snippets from the top results.",
#     parameters=Type.OBJECT,
#     required_properties=["query"],
#     properties={
#         "query": Type.STRING,
#     },
# )

# # Define tools for Gemini
# tools = [Tool.from_function_declaration(web_search_func, web_search)]

# def generate_response_with_web_search(user_input: str) -> str:
#     """Generates a response using Gemini, with web search capability."""
#     try:
#         response = model.generate_content(user_input, tools=tools)

#         if response.candidates and response.candidates[0].content.parts:
#             part = response.candidates[0].content.parts[0]

#             if part.function_call:
#                 function_name = part.function_call.name
#                 arguments = part.function_call.args

#                 if function_name == "web_search":
#                     params = WebSearchQuery(**arguments)
#                     function_response = web_search(params.query)
#                     tool_response = response.candidates[0].content.parts[0].function_call.create_tool_response(function_response.dict())
#                     final_response = model.generate_content(tool_response)
#                     return final_response.text

#             else:
#                 return response.text

#         else:
#             return "No response from Gemini."

#     except Exception as e:
#         return f"An error occurred: {e}"

# Example Usage (in your app.py):
# from gemini_service import generate_response_with_web_search
# result = generate_response_with_web_search("What is the capital of France?")
# print(result)

if __name__ == '__main__':
    load_dotenv(find_dotenv())
    BRAVE_API_KEY = os.getenv('BRAVE_API_KEY')
    print(BRAVE_API_KEY)
    BRAVE_API_KEY='BSAaf_pCsUjayfV9CLbkIPNNT8oPq_9'
    print(brave_search('What is the weather today?', BRAVE_API_KEY))