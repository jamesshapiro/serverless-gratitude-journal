import hashlib
import base64
#import random

"""
def get_salt():
    ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return ''.join(random.choice(ALPHABET) for i in range(256))

print(b'hello')
hello_str = 'hello'
bytes_str = bytes(hello_str, 'utf-8')
print(bytes_str)
    
salt = get_salt()
print(f'{salt=}')
m = hashlib.sha256()
m.update(bytes(salt, 'utf-8'))
m.update(b'Nobody inspects')
print(str(m.hexdigest()))

import hashlib
"""

def lambda_handler(event, context):
    request = event['Records'][0]['cf']['request']
    headers = request['headers']
    salt = 'SXxjp17IDpQD8ob66c7yp4qIk2FA4Vbid58UVuB1jyOw8z10yNMqyZKk3iu5j0yX1Z2GgnXAocBpLXRegYR6bTRznLiDPBV6bOM255ODsjRzRi4Q8RwEQkSOcv7ymQWlTVvw4nD16zRnhFZ9pFTig7184sbOeQGPlJGkLRG8MfB5OLKJu9pwv0QIj22mCBuDmurMbxoSP0U0fjMBqxSUMqAcokt8s87ro2wpkU2FfqkivPP62t3w0yUqWVzhEAw7'
    auth_hash_value = 'ed35d65557a9ac0eafa472ba64bad47866fc102b99d4c33018f76988382fbdf0'
    m = hashlib.sha256()
    m.update(bytes(salt, 'utf-8'))
    if 'authorization' in headers:
        # auth_string == 'Basic ' + auth_token
        auth_string = headers['authorization'][0]['value']
        print(auth_string)
        auth_token = auth_string[6:]
        print(auth_token)
        decoded = base64.b64decode(auth_token)
        print(type(decoded))
        print(decoded)
    m.update(bytes(PASSWORD, 'utf-8'))
    auth_token = str(m.hexdigest())
    auth_string = 'Basic ' + auth_token
    if 'authorization' not in headers or headers['authorization'][0]['value'] != auth_string:
        return {
                "status": '401',
                "statusDescription": 'Unauthorized',
                "body"             : 'Unauthorized',
                "headers": {
                    'www-authenticate': [
                    {"key": 'WWW-Authenticate', "value":'Basic'}
                 ]}  
                }
    return request  
