import requests
import json

def send_gmail(to,subject,message):
  url = ""

  payload = {
    "to": to,
    "subject":subject,
    "message": message}

  headers = {
    "Content-Type": "application/json"}

  response = requests.post(url, data=json.dumps(payload), headers=headers)
  return response.text