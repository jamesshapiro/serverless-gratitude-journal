import hashlib
import random
import boto3
import sys
import secure_password_generator as password_gen

def get_salt():
    ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return ''.join(random.choice(ALPHABET) for i in range(256))

default_password_args = {'--annoyingreqs': False,
    '--help': False,
    '--length': '24',
    '--nolower': False,
    '--nonumber': False,
    '--nosymbol': False,
    '--nosymbolambi': False,
    '--noupper': False,
    '--numpasswords': '1',
    '--yesalphaambi': False
}

default_password = password_gen.generate_password(default_password_args)

cloudformation = boto3.resource('cloudformation')
stack = cloudformation.Stack('gratitude-03')
outputs = stack.outputs
ddb_output = [output for output in outputs if output['OutputKey'] == 'DDBTableName'][0]
table_name = ddb_output['OutputValue']

salt = get_salt()
m = hashlib.sha256()
m.update(bytes(salt, 'utf-8'))
username = input('enter a username: ')
password = input('enter a password [Default generates a strong pw]: ')
if password == '':
    password = default_password
    print(f'Using default password: {default_password}')
m.update(bytes(password, 'utf-8'))
hash_value = str(m.hexdigest())

ddb_client = boto3.client('dynamodb')
ddb_client.put_item(
    TableName=table_name,
    Item={
        'PK1': {'S': f'USER#{username}'},
        'SK1': {'S': f'USER#{username}'},
        'SALT': {'S': salt},
        'HASH': {'S': hash_value}
    }
)
