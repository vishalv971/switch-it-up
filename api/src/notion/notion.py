from fastapi import HTTPException

PAGE_TEMPLATES = {
    "basic": {
        "name": "Basic Page",
        "blocks": [
            {
                "object": "block",
                "type": "heading_1",
                "heading_1": {
                    "rich_text": [{"type": "text", "text": {"content": "Overview"}}]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": ""}}]
                }
            },
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": "Details"}}]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": ""}}]
                }
            },
            {
                "object": "block",
                "type": "to_do",
                "to_do": {
                    "rich_text": [{"type": "text", "text": {"content": "Add more content"}}],
                    "checked": False
                }
            }
        ]
    },
    "meeting": {
        "name": "Meeting Notes",
        "blocks": [
            {
                "object": "block",
                "type": "heading_1",
                "heading_1": {
                    "rich_text": [{"type": "text", "text": {"content": "Meeting Details"}}]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": "Date: "}}]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": "Attendees: "}}]
                }
            },
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": "Agenda"}}]
                }
            },
            {
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"type": "text", "text": {"content": ""}}]
                }
            },
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": "Action Items"}}]
                }
            },
            {
                "object": "block",
                "type": "to_do",
                "to_do": {
                    "rich_text": [{"type": "text", "text": {"content": ""}}],
                    "checked": False
                }
            }
        ]
    },
    "project": {
        "name": "Project Plan",
        "blocks": [
            {
                "object": "block",
                "type": "heading_1",
                "heading_1": {
                    "rich_text": [{"type": "text", "text": {"content": "Project Overview"}}]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": ""}}]
                }
            },
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": "Objectives"}}]
                }
            },
            {
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"type": "text", "text": {"content": ""}}]
                }
            },
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": "Timeline"}}]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": ""}}]
                }
            },
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": "Resources"}}]
                }
            },
            {
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"type": "text", "text": {"content": ""}}]
                }
            }
        ]
    }
}


def init_notion(notion,parent_id):

    try:
        structure = {}

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
            children=PAGE_TEMPLATES["basic"]["blocks"] + [
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

