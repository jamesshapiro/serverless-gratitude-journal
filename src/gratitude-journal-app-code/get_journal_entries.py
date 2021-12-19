import boto3
import os
import ulid
import pytz
import json

ddb_client = boto3.client('dynamodb')
table_name = os.environ['GRATITUDE_JOURNAL_DDB_TABLE']
NUM_ITEMS = 100
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

# TODO: Support pagination


def get_latest_items(table_name, num_items):
    return ddb_client.query(
        TableName=table_name,
        Limit=num_items,
        ScanIndexForward=False,
        KeyConditionExpression='#pk1 = :pk1',
        ExpressionAttributeNames={
            '#pk1': 'PK1'
        },
        ExpressionAttributeValues={
            ':pk1': {'S': 'ENTRY'}
        }
    )


def process_items(items):
    entries = []
    for item in items:
        ulid_str = item['SK1']['S'][len('ENTRY_ID#'):]
        entry_content = item['ENTRY_CONTENT']['S']
        ulid_ulid = ulid.from_str(ulid_str)
        entry_datetime = ulid_ulid.timestamp().datetime
        # TODO: load timezone from DDB
        EST = pytz.timezone('US/Eastern')
        #PST = pytz.timezone('US/Pacific')
        #JST = pytz.timezone('Asia/Tokyo')
        #NZST = pytz.timezone('Pacific/Auckland')
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
        if hour == 0 and minute == 0:
            hour = 12
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
        date_str = f'{month} {day}, {year} - {hour}:{minute}{am_pm}'
        entries.append((ulid_str, date_str, entry_content))
    return entries

# TODO: Support pagination


def lambda_handler(event, context):
    response_code = 200
    response = get_latest_items(table_name, NUM_ITEMS)
    items = response['Items']
    entries = process_items(items)
    response_body = {
        'entries': entries
    }
    response = {
        'statusCode': response_code,
        'headers': {
            'x-custom-header': 'custom header'
        },
        'body': json.dumps(response_body)
    }
    print("response: " + json.dumps(response))
    return response
