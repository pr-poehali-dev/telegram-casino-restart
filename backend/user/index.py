import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage user data (get/create user, get/update balance)
    Args: event with httpMethod, body, queryStringParameters
          context with request_id
    Returns: HTTP response with user data or balance
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Telegram-User',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            telegram_id = params.get('telegram_id')
            
            if not telegram_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'telegram_id required'})
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT telegram_id, username, first_name, last_name, balance, created_at FROM users WHERE telegram_id = %s",
                    (telegram_id,)
                )
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User not found'})
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'telegram_id': user['telegram_id'],
                        'username': user['username'],
                        'first_name': user['first_name'],
                        'last_name': user['last_name'],
                        'balance': user['balance']
                    }, default=str)
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            telegram_id = body.get('telegram_id')
            username = body.get('username', '')
            first_name = body.get('first_name', '')
            last_name = body.get('last_name', '')
            
            if not telegram_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'telegram_id required'})
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    INSERT INTO users (telegram_id, username, first_name, last_name, balance)
                    VALUES (%s, %s, %s, %s, 0)
                    ON CONFLICT (telegram_id) 
                    DO UPDATE SET username = EXCLUDED.username, 
                                  first_name = EXCLUDED.first_name,
                                  last_name = EXCLUDED.last_name,
                                  updated_at = CURRENT_TIMESTAMP
                    RETURNING telegram_id, username, first_name, last_name, balance
                    """,
                    (telegram_id, username, first_name, last_name)
                )
                user = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'telegram_id': user['telegram_id'],
                        'username': user['username'],
                        'first_name': user['first_name'],
                        'last_name': user['last_name'],
                        'balance': user['balance']
                    }, default=str)
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            telegram_id = body.get('telegram_id')
            balance_change = body.get('balance_change', 0)
            transaction_type = body.get('transaction_type', 'game')
            description = body.get('description', '')
            
            if not telegram_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'telegram_id required'})
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "UPDATE users SET balance = balance + %s, updated_at = CURRENT_TIMESTAMP WHERE telegram_id = %s RETURNING balance",
                    (balance_change, telegram_id)
                )
                result = cur.fetchone()
                
                if result:
                    cur.execute(
                        "INSERT INTO transactions (telegram_id, amount, transaction_type, description) VALUES (%s, %s, %s, %s)",
                        (telegram_id, balance_change, transaction_type, description)
                    )
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'balance': result['balance']})
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User not found'})
                    }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()
