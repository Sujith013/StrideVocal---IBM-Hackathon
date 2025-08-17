import os
from pymongo import MongoClient
import json

MONGO_URI = os.environ['DOCUMENTDB_URI']
CA_BUNDLE_PATH = 'global-bundle.pem'

client = None

def get_mongo_client():
    global client
    if client is None:
        client = MongoClient(MONGO_URI, tlsCAFile=CA_BUNDLE_PATH)
    return client

def lambda_handler(event, context):
    document = event.get('document')

    if not document:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing 'document' in request"})
        }
    
    try:
        client = get_mongo_client()
        db = client['IBM_Hackathon_DB']          
        collection = db['agent_memory']
        
        result = collection.insert_one(document)
        
        return {
            "statusCode": 200,
            "body": json.dumps({"inserted_id": str(result.inserted_id)})
        }
    
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
