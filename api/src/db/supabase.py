import os
from supabase import Client



def insert_data(
    supabase,
    table,
    data,
    upsert = False,
    returning = "uuid"
):

    try:
        query = supabase.table(table)
        
        if upsert:
            query = query.upsert(data)
        else:
            query = query.insert(data)
        
        # Specify which columns to return
        # query = query.returning(returning)
        
        # Execute the query
        response = query.execute()
        
        return {
            'success': True,
            'data': response.data,
            'error': None,
            'count': len(response.data) if response.data else 0
        }
        
    except Exception as e:
        return {
            'success': False,
            'data': None,
            'error': str(e),
            'count': 0
        }
    

def select_data(
    supabase,
    table,
    columns = "*",
    filters = None,
    order_by = None,
    limit = None,
    offset = None
):

    query = supabase.table(table).select(columns)
    
    # Apply filters if provided
    if filters:
        for key, value in filters.items():
            query = query.eq(key, value)
    
    # Apply ordering if provided
    if order_by:
        for column, direction in order_by.items():
            if direction.lower() == 'desc':
                query = query.order(column, desc=True)
            else:
                query = query.order(column)
    
    # Apply limit if provided
    if limit is not None:
        query = query.limit(limit)
    
    # Apply offset if provided
    if offset is not None:
        query = query.offset(offset)
    
    try:
        response = query.execute()
        return response.data
    
    except Exception as e:
        print(f"Error executing query: {str(e)}")
        return []