from fastapi import HTTPException


def init_notion(notion):

    try:
        structure = {}
        parent_id = get_all_pages(notion)[0]["id"]
        # Create Conversation History page
        parent = {"page_id": parent_id}
        
        # Create the Conversation History page with basic template
        conversation_page = notion.pages.create(
            parent=parent,
            properties={
                "title": {
                    "title": [
                        {
                            "text": {
                                "content": "Conversation History"
                            }
                        }
                    ]
                }
            },
            children=[
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": "This is a page with your conversation history with SwitchItUp"
                                }
                            }
                        ]
                    }
                }
            ]
        )
        structure["conversation_page_id"] = conversation_page["id"]

        # Create Todo List database
        todo_db = notion.databases.create(
            parent=parent,
            title=[{
                "text": {
                    "content": "Todo List"
                }
            }],
            properties={
                "Name": {
                    "title": {}
                },
                "Status": {
                    "checkbox": {}
                },
                "Priority": {
                    "select": {
                        "options": [
                            {"name": "High", "color": "red"},
                            {"name": "Medium", "color": "yellow"},
                            {"name": "Low", "color": "blue"}
                        ]
                    }
                },
                "Due Date": {
                    "date": {}
                }
            }
        )
        structure["todo_db_id"] = todo_db["id"]

        
        return structure["conversation_page_id"],structure["todo_db_id"]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize structure: {str(e)}"
        )

def get_all_pages(notion):
    """Get all pages"""
    try:
        response = notion.search(
            filter={"property": "object", "value": "page"}
        ).get("results", [])
        
        pages = []
        for page in response:
            try:
                # Safely get title with multiple fallbacks
                title = "Untitled"
                if "properties" in page and "title" in page["properties"]:
                    title_prop = page["properties"]["title"]
                    if "title" in title_prop and title_prop["title"]:
                        try:
                            title = title_prop["title"][0]["text"]["content"]
                        except (KeyError, IndexError):
                            title = "Untitled"
                
                page_data = {
                    "id": page["id"]
                }
                pages.append(page_data)
            except Exception as page_error:
                # Log the error but continue processing other pages
                print(f"Error processing page: {str(page_error)}")
                continue
        
        return pages
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
def get_todo_items(notion, database_id):
    """
    Get all items from the todo list
    
    Args:
        notion: Notion client instance
        database_id: ID of the todo database
    
    Returns:
        list: List of todo items
    """
    try:
        response = notion.databases.query(
            database_id=database_id,
            sorts=[{
                "property": "Priority",
                "direction": "descending"
            }]
        )
        
        todo_items = []
        for item in response["results"]:
            todo_item = {
                "id": item["id"],
                "name": item["properties"]["Name"]["title"][0]["text"]["content"] if item["properties"]["Name"]["title"] else "",
                "status": item["properties"]["Status"]["checkbox"],
                "priority": item["properties"]["Priority"]["select"]["name"] if item["properties"]["Priority"]["select"] else "Low",
                "due_date": item["properties"]["Due Date"]["date"]["start"] if item["properties"]["Due Date"]["date"] else None
            }
            todo_items.append(todo_item)
            
        return todo_items
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get todo items: {str(e)}"
        )


def add_todo_item(notion, database_id, name, priority="Low", due_date=None):
    """
    Add a new item to the todo list
    
    Args:
        notion: Notion client instance
        database_id: ID of the todo database
        name: Name of the todo item
        priority: Priority level (High, Medium, Low)
        due_date: Due date for the item (ISO format date string)
    
    Returns:
        dict: Created todo item
    """
    try:
        data = {
            "parent": {"database_id": database_id},
            "properties": {
                "Name": {
                    "title": [
                        {
                            "text": {
                                "content": name
                            }
                        }
                    ]
                },
                "Status": {
                    "checkbox": False
                },
                "Priority": {
                    "select": {
                        "name": priority
                    }
                }
            }
        }
        
        if due_date:
            data["properties"]["Due Date"] = {
                "date": {
                    "start": due_date
                }
            }
        print(data)    
        new_item = notion.pages.create(**data)
        
        return new_item
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add todo item: {str(e)}"
        )

def create_conv_page(notion,parent_id, title, content):

    try:
        # Create Conversation History page
        parent = {"page_id": parent_id}
        
        # Create the Conversation History page with basic template
        conversation_page = notion.pages.create(
            parent=parent,
            properties={
                "title": {
                    "title": [
                        {
                            "text": {
                                "content": title
                            }
                        }
                    ]
                }
            },
            children=[
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": content
                                }
                            }
                        ]
                    }
                }
            ]
        )
        
        return conversation_page
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get todo items: {str(e)}"
        )

