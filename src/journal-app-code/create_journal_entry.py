import json
import boto3
import os
import ulid
import re

table_name = os.environ['JOURNAL_DDB_TABLE']
s3_bucket = os.environ['JOURNAL_S3_BUCKET']

def bad_request(message):
    response_code = 400
    response_body = {'feedback': message}
    response = {'statusCode': response_code,
                'headers': {'x-custom-header': 'custom-header'},
                'body': json.dumps(response_body)}
    return response


def index_words(entry_content, dynamodb_client, entry_ulid, table_name):
    entries = json.loads(entry_content)
    all_words = []
    stop_words = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you',
                  'your', 'youre', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
                  'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
                  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
                  'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
                  'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but',
                  'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with',
                  'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
                  'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over',
                  'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
                  'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
                  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
                  'very', 's', 't', 'can', 'cant', 'will', 'wont', 'just', 'dont', 'should',
                  'shouldnt', 'now']
    for entry in entries:
        entry = entry.replace("'", '')
        entry = entry.lower()
        words = re.findall(r'\w+', entry)
        all_words.extend(words)
    all_words = [word for word in all_words if word not in stop_words]
    all_words = list(set(all_words))

    for word in all_words:
        response = dynamodb_client.put_item(
            TableName=table_name,
            Item={
                'PK1': {'S': f'KEYWORD#{word}'},
                'SK1': {'S': f'ENTRY_ID#{entry_ulid}'},
                'GSI1PK': {'S': f'ENTRY_ID#{entry_ulid}'},
                'GSI1SK': {'S': f'KEYWORD#{word}'},
            }
        )
    return

def create_text_post(entry, entry_ulid, dynamodb_client):
    entry_content = entry
    response = dynamodb_client.put_item(
        TableName=table_name,
        Item={
            'PK1': {'S': 'ENTRY'},
            'SK1': {'S': f'ENTRY_ID#{entry_ulid}'},
            'ENTRY_CONTENT': {'S': entry_content}
        }
    )
    index_words(entry_content, dynamodb_client, entry_ulid, table_name)
    response_body = {
        'message': f'Entry received! {entry_ulid}'
    }
    return response_body

def create_image_post(image_title, entry_ulid, dynamodb_client):
    s3_client = boto3.client('s3')
    bucket = s3_bucket
    key = f'images/{entry_ulid}/{image_title}'
    response = s3_client.generate_presigned_url(
        ClientMethod='put_object',
        Params= {
            'Bucket': bucket,
            'Key': key
        },
        ExpiresIn=3600
    )
    #response = s3_client.generate_presigned_post(Bucket=bucket, Key=key, Fields=None, Conditions=None, ExpiresIn=3600)
    return response

def lambda_handler(event, context):
    dynamodb_client = boto3.client('dynamodb')
    response_code = 200
    print("request: " + json.dumps(event))
    body = json.loads(event['body'])
    entry_ulid = str(ulid.new())
    if 'entry' in body:
        response_body = create_text_post(body['entry'], entry_ulid, dynamodb_client)
    elif 'image_title' in body:
        image_title = body['image_title']
        image_title = image_title.strip('"')
        s3_response = create_image_post(image_title, entry_ulid, dynamodb_client)
        response_body = s3_response
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
