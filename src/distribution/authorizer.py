import hashlib
import base64
import boto3

def lambda_handler(event, context):
    session = boto3.Session()
    iam_client = session.client("iam")
    sts_client = session.client("sts")
    ROLE_NAME = sts_client.get_caller_identity()["Arn"].split("/")[-2]
    ROLE_POLICY = iam_client.get_role_policy(RoleName=ROLE_NAME, PolicyName="root")[
        "PolicyDocument"
    ]
    TABLE_NAME = ''
    TABLE_REGION = 'us-east-1'
    for statement in ROLE_POLICY["Statement"]:
        resource = statement["Resource"]
        if type(resource) != type([]):
            resource = [resource]
        for arn in resource:
            if arn.startswith("arn:aws:dynamodb:"):
                arn_parts = arn.split("/")
                TABLE_NAME = arn_parts[-1]
                TABLE_REGION = arn_parts[0].split(":")[3]
    ddb_client = boto3.client('dynamodb', region_name=TABLE_REGION)
    response = ddb_client.get_item(
        TableName = TABLE_NAME,
        Key={
            'PK1': {
                'S': 'PASSWORD',
            },
            'SK1': {
                'S': 'PASSWORD',
            }
        }
    )
    item = response['Item']
    salt = item['SALT']['S'] #'5440cWTwnAjWDtjFqqUYQfwyHv2OcXUags8zYfj8XexDYUBiNlm5WXJDDVBI1Xu6l0Czvpjr1beqhIAfPCRGPnPq0bijWBKraOTFXsUc9cAPknguDjA8SNSWMQctS8zGXObNzhg39ztLzwKocK4IiFKCwebBUvjc6LtUxFfgmttu0l5K4iORXhCElhgt4p8m9lPcdkV4th0ohRLAkeklJjnipgsNM2tFw1LqwV9vh2GpDsyl4nkr7nKt1TTDkaVn'
    print(salt)
    auth_hash_value = item['HASH']['S']
    print(auth_hash_value)
    request = event['Records'][0]['cf']['request']
    headers = request['headers']
    #auth_hash_value = '9fb43ed76f1346687484617030cd8f9865df89990b388672b604bdc635f75f74'
    m = hashlib.sha256()
    m.update(bytes(salt, 'utf-8'))
    if 'authorization' in headers:
        # auth_string == 'Basic ' + auth_token
        auth_string = headers['authorization'][0]['value']
        auth_token = auth_string[len('Basic '):]
        decoded = base64.b64decode(auth_token)
        #print(type(decoded))
        #print(decoded)
        m.update(decoded)
        hex_digest = str(m.hexdigest())
        print(hex_digest)
        if hex_digest == auth_hash_value:
            return request
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
    return {
        "status": '401',
        "statusDescription": 'Unauthorized',
        "body"             : 'Unauthorized',
        "headers": {
            'www-authenticate': [
                {"key": 'WWW-Authenticate', "value":'Basic'}
            ]}  
    }
