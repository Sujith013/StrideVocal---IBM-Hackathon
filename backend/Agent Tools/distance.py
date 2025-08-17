import requests

def get_distance(origin, destination, mode="driving"):
    API_KEY = ""
    url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin}&destinations={destination}&mode={mode}&key={API_KEY}"
  
    response = requests.get(url).json()
    return response