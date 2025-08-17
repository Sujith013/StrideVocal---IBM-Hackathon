import requests
import html

def get_directions(origin, destination, mode="driving"):
    GOOGLE_MAPS_API_KEY = ""
    
    url = (
        f"https://maps.googleapis.com/maps/api/directions/json"
        f"?origin={origin}&destination={destination}&mode={mode}&key={GOOGLE_MAPS_API_KEY}"
    )

    response = requests.get(url).json()

    if response["status"] != "OK":
        return {"error": response.get("error_message", "Failed to fetch directions")}

    route = response["routes"][0]
    leg = route["legs"][0]
    steps = leg["steps"]

    directions = [
        html.unescape(step["html_instructions"])
        for step in steps
    ]

    return {
        "summary": route["summary"],
        "distance": leg["distance"]["text"],
        "duration": leg["duration"]["text"],
        "steps": directions
    }
