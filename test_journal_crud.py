import boto3
import requests
import random
import sys
import json

greetings = [
    'Shalom',
    'Gutentag',
    'Hello',
    'Hola',
    'Aloha',
    'Bonjour',
    'Ciao'
]

def get_default_stack_id():
    with open('.sam-params') as f:
        sam_params = f.read().splitlines()
    sam_params = [line for line in sam_params if line.startswith('MyStackName')][0]
    return sam_params.split('=')[1]

def get_api_info():
    cloudformation = boto3.resource('cloudformation')
    stack_id = '' #input('stack id?: ')
    default_stack_id = get_default_stack_id()
    if stack_id == '':
        stack_id = default_stack_id
    stack = cloudformation.Stack(stack_id)
    outputs = stack.outputs
    api_gateway_output = [output for output in outputs if output['OutputKey'] == 'JournalEntryApiEndpoint'][0]
    url = api_gateway_output['OutputValue']
    api_key_output = [output for output in outputs if output['OutputKey'] == 'APIKeyValue'][0]
    api_key = api_key_output['OutputValue']
    return url, api_key

def test_create(url, api_key, num_entries):
    for i in range(num_entries):
        greeting = random.choice(greetings)
        payload = {'entry': f'{greeting} World!'}
        headers = {'x-api-key': api_key}
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        json_response = json.loads(response.text)
        print(json_response['message'])

def test_read(url, api_key):
    headers = {'x-api-key': api_key}
    response = requests.get(url, headers=headers)
    json_response = json.loads(response.text)
    for entry in json_response['entries']:
        print(entry)
    return json_response['entries']

def test_delete(url, api_key, entry_ulid):
    headers = {'x-api-key': api_key}
    url = url + f'?ulid={entry_ulid}'
    response = requests.delete(url, headers=headers)
    json_response = json.loads(response.text)
    print(json_response)

def test_update(url, api_key, entry_ulid):
    headers = {'x-api-key': api_key}
    greeting = random.choice(greetings)
    payload = {
        'entry': f'UPDATE: {greeting} World!',
        'entry_ulid': entry_ulid
    }
    headers = {'x-api-key': api_key}
    response = requests.put(url, data=json.dumps(payload), headers=headers)
    json_response = json.loads(response.text)
    print(json_response['message'])
        
url, api_key = get_api_info()
#entries = test_read(url, api_key)
#test_create(url, api_key, 3)
entries = test_read(url, api_key)
latest_entry = entries[0]
latest_ulid = latest_entry[0]
test_update(url, api_key, latest_ulid)
entries = test_read(url, api_key)
test_delete(url, api_key, latest_ulid)
entries = test_read(url, api_key)
    
