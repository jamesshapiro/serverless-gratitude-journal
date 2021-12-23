import json
import boto3
import os
import ulid

table_name = os.environ['GRATITUDE_JOURNAL_DDB_TABLE']


def bad_request(message):
    response_code = 400
    response_body = {'feedback': message}
    response = {'statusCode': response_code,
                'headers': {'x-custom-header': 'custom-header'},
                'body': json.dumps(response_body)}
    return response


def lambda_handler(event, context):
    response_code = 200
    print("request: " + json.dumps(event))
    body = json.loads(event['body'])
    entry_content = body['entry']
    dynamodb_client = boto3.client('dynamodb')

    entry_ulid = str(ulid.new())

    response = dynamodb_client.put_item(
        TableName=table_name,
        Item={
            'PK1': {'S': 'ENTRY'},
            'SK1': {'S': f'ENTRY_ID#{entry_ulid}'},
            'ENTRY_CONTENT': {'S': entry_content}
        }
    )

    response_body = {
        'message': f'Entry received! {entry_ulid}',
        'input': event
    }

    response = {
        'statusCode': response_code,
        'headers': {
            'Access-Control-Allow-Headers': "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
            "X-Requested-With": "*"
        },
        'body': json.dumps(response_body)
    }
    return response
