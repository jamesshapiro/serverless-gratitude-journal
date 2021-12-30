import boto3
import os
import ulid
import pytz
import json

ddb_client = boto3.client('dynamodb')
table_name = os.environ['JOURNAL_DDB_TABLE']
DEFAULT_NUM_ENTRIES = 12
months = {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December'
}


def read_entries(table_name, exclusive_start_key, num_items, keyword=None):
    pk1 = 'ENTRY'
    if keyword:
        pk1 = f'KEYWORD#{keyword}'
    kwargs = {
        'TableName': table_name,
        'Limit': num_items,
        'ConsistentRead': True,
        'ScanIndexForward': False,
        'KeyConditionExpression': '#pk1 = :pk1',
        'ExpressionAttributeNames': {'#pk1': 'PK1'},
        'ExpressionAttributeValues': {':pk1': {'S': pk1}}
    }
    if exclusive_start_key:
        kwargs['ExclusiveStartKey'] = {
            'PK1': {'S': pk1},
            'SK1': {'S': f'ENTRY_ID#{exclusive_start_key}'}
        }
    return ddb_client.query(**kwargs)


def get_item(table_name, entry_ulid):
    return ddb_client.get_item(
        TableName=table_name,
        Key={
            'PK1': {'S': 'ENTRY'},
            'SK1': {'S': f'ENTRY_ID#{entry_ulid}'}
        }
    )


def add_legible_time(items):
    entries = []
    for item in items:
        ulid_str = item['SK1']['S'][len('ENTRY_ID#'):]
        if 'ENTRY_CONTENT' in item:
            entry_content = item['ENTRY_CONTENT']['S']
        else:
            full_item = get_item(table_name, ulid_str)
            entry_content = full_item['Item']['ENTRY_CONTENT']['S']
        ulid_ulid = ulid.from_str(ulid_str)
        entry_datetime = ulid_ulid.timestamp().datetime
        # TODO: load timezone from DDB
        EST = pytz.timezone('US/Eastern')
        # PST = pytz.timezone('US/Pacific')
        # JST = pytz.timezone('Asia/Tokyo')
        # NZST = pytz.timezone('Pacific/Auckland')
        # TODO: load hour display preference from DDB
        entry_datetime_local = entry_datetime.astimezone(EST)
        # TODO: load day-month display preference from DDB
        month, day, year, hour, minute = [
            months[entry_datetime_local.month],
            entry_datetime_local.day,
            entry_datetime_local.year,
            entry_datetime_local.hour,
            entry_datetime_local.minute
        ]
        am_pm = 'AM'
        if hour == 0:
            hour = 12
            if minute == 0:
                am_pm = 'AM'
        elif hour == 12 and minute == 0:
            am_pm = 'PM'
        elif hour > 12:
            hour -= 12
            am_pm = 'PM'
        if minute < 10:
            minute = '0' + str(minute)
        else:
            minute = str(minute)
        date_str = f'{month} {day}, {year}'  # - {hour}:{minute}{am_pm}'
        entries.append(
            {'ulid': ulid_str, 'legible_date': date_str, 'entry_content': entry_content})
    return entries


def lambda_handler(event, context):
    response_code = 200
    exclusive_start_key = None
    num_entries = DEFAULT_NUM_ENTRIES
    keyword = None
    if 'queryStringParameters' in event and event['queryStringParameters']:
        query_string_parameters = event['queryStringParameters']
        exclusive_start_key = query_string_parameters.get(
            'exclusive_start_key', None)
        num_entries = int(query_string_parameters.get(
            'num_entries', DEFAULT_NUM_ENTRIES))
        keyword = query_string_parameters.get('keyword', None)
        if keyword:
            keyword = keyword.lower()
    response = read_entries(
        table_name, exclusive_start_key, num_entries, keyword)
    items_with_time = add_legible_time(response['Items'])
    response['Items'] = items_with_time
    result = {
        'statusCode': response_code,
        'headers': {
            'Access-Control-Allow-Headers': "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
            "X-Requested-With": "*"
        },
        'body': json.dumps(response)
    }
    return result
