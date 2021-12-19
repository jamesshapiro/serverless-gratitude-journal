import boto3
import os
import ulid
import pytz
import json

ddb_client = boto3.client('dynamodb')
table_name = os.environ['GRATITUDE_JOURNAL_DDB_TABLE']


def delete_item(table_name, entry_ulid):
    return ddb_client.delete_item(
        TableName=table_name,
        Key={
            'PK1': {'S': 'ENTRY'},
            'SK1': {'S': f'ENTRY_ID#{entry_ulid}'},
        }
    )


def lambda_handler(event, context):
    print(event)
    my_ulid = event['queryStringParameters']['ulid']
    response_code = 200
    response = delete_item(table_name, my_ulid)
    print(response)
    return {
        'statusCode': response_code,
        'headers': {
            'x-custom-header': 'custom header'
        },
        'body': json.dumps(response)
    }
