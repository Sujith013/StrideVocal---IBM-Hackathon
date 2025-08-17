import requests

def find_place(place_location_query):
  API_KEY = ""
  url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
  
  params = {
        "query": place_location_query,
        "key": API_KEY
    }
    
  response = requests.get(url, params=params).json()
  results = response.get("results", [])
  
  if not results:
      return "No results found"

  return {
        "places": [{
            "name": place["name"],
            "address": place["formatted_address"]
        } for place in results]
    }