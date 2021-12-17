import hashlib
import random
import boto3
import sys

def get_salt():
    ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return ''.join(random.choice(ALPHABET) for i in range(256))

cloudformation = boto3.resource('cloudformation')
stack = cloudformation.Stack('gratitude-03')
outputs = stack.outputs
ddb_output = [output for output in outputs if output['OutputKey'] == 'DDBTableName'][0]
table_name = ddb_output['OutputValue']

salt = get_salt()
print(f'{salt=}')
m = hashlib.sha256()
m.update(bytes(salt, 'utf-8'))
user = input('enter a username: ')
password = input('enter a password: ')
concatted = f'{user}:{password}'
m.update(bytes(concatted, 'utf-8'))
hash_value = str(m.hexdigest())
print(f'{hash_value=}')

ddb_client = boto3.client('dynamodb')
ddb_client.put_item(
    TableName=table_name,
    Item={
        'PK1': {'S': 'PASSWORD'},
        'SK1': {'S': 'PASSWORD'},
        'SALT': {'S': salt},
        'HASH': {'S': hash_value}
    }
)
