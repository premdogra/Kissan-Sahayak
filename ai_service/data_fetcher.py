import requests
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime

load_dotenv()

API_KEY = os.getenv("DATA_GOV_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")
RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"

client = MongoClient(MONGO_URI)
db = client["marketpulse"]

def fetch_mandi_prices(commodity, state=None, district=None):
    url = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": 200,
        "filters[commodity]": commodity
    }

    if state:
        params["filters[state]"] = state
    if district:
        params["filters[district]"] = district

    response = requests.get(url, params=params)
    data = response.json()

    return data.get("records", [])

# def fetch_mandi_prices():
#     url = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

#     params = {
#         "api-key": API_KEY,
#         "format": "json",
#         "limit": 5
#     }

#     response = requests.get(url, params=params)

#     print("Status Code:", response.status_code)
#     print("Raw Response:", response.json())

#     return response.json().get("records", [])

def save_prices(records):
    for r in records:
        try:
            price = float(r.get("modal_price", 0))
            arrival = float(r.get("arrival_quantity", 0))

            db.mandiprices.insert_one({
                "commodity": r.get("commodity"),
                "mandi": r.get("market"),
                "state": r.get("state"),
                "district": r.get("district"),
                "price": price,
                "arrival": arrival,
                "date": datetime.strptime(r.get("arrival_date"), "%d/%m/%Y")
            })

        except Exception as e:
            print("Skipping record:", e)

# if __name__ == "__main__":
#     records = fetch_mandi_prices("Onion","Punjab","Ludhiana")
#     print("Total records:", len(records))
#     print("Sample:", records[0] if records else "No Data")
#     save_prices(records)

API_KEY = os.getenv("OPENWEATHER_API_KEY")

def fetch_weather(city):
    url = "https://api.openweathermap.org/data/2.5/weather"
    
    params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric"  # Celsius
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        weather_info = {
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"]
        }

        return weather_info

    except requests.exceptions.RequestException as e:
        print("Error fetching weather:", e)
        return None


if __name__ == "__main__":
    result = fetch_weather("Ludhiana")
    print(result)

