import base64
from email.message import EmailMessage
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import json

def lambda_handler(event, context):
    SCOPES = ['https://www.googleapis.com/auth/gmail.send']

    creds_path = 'lambda_gmail_creds.json'

    if "body" in event and event["body"]:
        params = json.loads(event["body"])
    else:
        params = event

    try:
        creds = Credentials.from_authorized_user_file(creds_path, SCOPES)
        service = build('gmail', 'v1', credentials=creds)

        message = EmailMessage()
        message.set_content(params['message'])
        message['To'] = params['to']
        message['From'] = 'jith013@gmail.com'
        message['Subject'] = params['subject']

        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        create_message = {
            'raw': encoded_message
        }

        sent_message = service.users().messages().send(userId="me", body=create_message).execute()
        message_id = sent_message['id']

        return {
            'statusCode': 200,
            'body': json.dumps({"message": "Email sent"})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({"error": str(e)})
        }
