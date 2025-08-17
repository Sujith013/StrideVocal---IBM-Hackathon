import requests
import json

def use_memory(function,key,value):
  url = ""

  headers = {
    "Content-Type": "application/json"}
  
  if(function=="add_memo"):
    payload = {
      "function": function,
      "document":{"key":key,
      "value": value}
    }

  elif(function=="get_memo"):
    payload = {
      "function":function
    }

  else:
    payload = {
      "function":function,
      "key":key
    }

  response = requests.post(url, data=json.dumps(payload), headers=headers)
  return response.text