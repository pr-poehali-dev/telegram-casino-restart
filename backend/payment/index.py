import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handle Telegram Stars payment webhook
    Args: event with httpMethod, body
          context with request_id
    Returns: HTTP response confirming payment processing
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body = json.loads(event.get('body', '{}'))
    telegram_id = body.get('telegram_id')
    stars_amount = body.get('stars_amount', 0)
    
    if not telegram_id or stars_amount <= 0:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid payment data'})
        }
    
    balance_add = stars_amount * 10
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "UPDATE users SET balance = balance + %s, updated_at = CURRENT_TIMESTAMP WHERE telegram_id = %s RETURNING balance",
                (balance_add, telegram_id)
            )
            result = cur.fetchone()
            
            if result:
                cur.execute(
                    "INSERT INTO transactions (telegram_id, amount, transaction_type, description) VALUES (%s, %s, %s, %s)",
                    (telegram_id, balance_add, 'payment', f'Пополнение {stars_amount} звёзд')
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'new_balance': result['balance'],
                        'added': balance_add
                    })
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'})
                }
    
    finally:
        conn.close()
