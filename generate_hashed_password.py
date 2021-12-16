import hashlib
import base64
import random

def get_salt():
    ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return ''.join(random.choice(ALPHABET) for i in range(256))

salt = get_salt()
#salt = 'SXxjp17IDpQD8ob66c7yp4qIk2FA4Vbid58UVuB1jyOw8z10yNMqyZKk3iu5j0yX1Z2GgnXAocBpLXRegYR6bTRznLiDPBV6bOM255ODsjRzRi4Q8RwEQkSOcv7ymQWlTVvw4nD16zRnhFZ9pFTig7184sbOeQGPlJGkLRG8MfB5OLKJu9pwv0QIj22mCBuDmurMbxoSP0U0fjMBqxSUMqAcokt8s87ro2wpkU2FfqkivPP62t3w0yUqWVzhEAw7'
print(f'{salt=}')
m = hashlib.sha256()
m.update(bytes(salt, 'utf-8'))
m.update(b'admin:admin')
print(str(m.hexdigest()))
