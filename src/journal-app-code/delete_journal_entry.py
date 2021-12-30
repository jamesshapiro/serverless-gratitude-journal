import boto3
import os
import json

ddb_client = boto3.client('dynamodb')
table_name = os.environ['JOURNAL_DDB_TABLE']


def delete_item(table_name, entry_ulid, keyword=None):
    pk1 = 'ENTRY'
    if keyword:
        pk1 = f'KEYWORD#{keyword}'
    return ddb_client.delete_item(
        TableName=table_name,
        Key={
            'PK1': {'S': pk1},
            'SK1': {'S': f'ENTRY_ID#{entry_ulid}'},
        }
    )


def delete_search_index_entries(table_name, entry_ulid):
    gsi1pk = f'ENTRY_ID#{entry_ulid}'
    paginator = ddb_client.get_paginator('query')
    kwargs = {
        'TableName': table_name,
        'IndexName': 'GSI1',
        'KeyConditionExpression': '#gsi1pk = :gsi1pk',
        'ExpressionAttributeNames': {'#gsi1pk': 'GSI1PK'},
        'ExpressionAttributeValues': {':gsi1pk': {'S': gsi1pk}}
    }
    response_iterator = paginator.paginate(**kwargs)
    for response in response_iterator:
        for item in response['Items']:
            keyword = item['PK1']['S'][len('KEYWORD#'):]
            delete_item(table_name, entry_ulid, keyword)


def lambda_handler(event, context):
    print(event)
    my_ulid = event['queryStringParameters']['ulid']
    response_code = 200
    # delete the item itself
    response = delete_item(table_name, my_ulid)
    # delete the search index entries
    delete_search_index_entries(table_name, my_ulid)

    print(response)
    return {
        'statusCode': response_code,
        'headers': {
            'Access-Control-Allow-Headers': "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
            "X-Requested-With": "*"
        },
        'body': json.dumps(response)
    }
