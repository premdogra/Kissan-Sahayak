import requests
from datetime import datetime
from pymongo import MongoClient

client = MongoClient("mongodb+srv://6005168766pd:Dogra%402005@cluster0.qein0sa.mongodb.net/test?retryWrites=true&w=majority")
db = client["marketpulse"]
weather_collection = db["weather_data"]


# ---------------------------
# STEP 1.2: Get Lat/Lon dynamically
# ---------------------------

def get_coordinates(district, state):
    geo_url = "https://geocoding-api.open-meteo.com/v1/search"

    params = {
        "name": district,
        "count": 1,
        "language": "en",
        "format": "json"
    }

    response = requests.get(geo_url, params=params, timeout=20)
    data = response.json()

    if "results" not in data:
        raise ValueError("District not found in geocoding API")

    result = data["results"][0]

    return result["latitude"], result["longitude"]


# ---------------------------
# Fetch weather forecast
# ---------------------------

def fetch_historical_weather(state, district, start_date, end_date):

    latitude, longitude = get_coordinates(district, state)

    url = "https://archive-api.open-meteo.com/v1/archive"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "daily": "temperature_2m_max,precipitation_sum",
        "timezone": "auto"
    }

    response = requests.get(url, params=params, timeout=60)
    data = response.json()

    daily = data.get("daily", {})

    if "time" not in daily:
        print("Weather API returned no data.")
        return []

    for i in range(len(daily["time"])):

        record = {
            "date": datetime.strptime(daily["time"][i], "%Y-%m-%d"),
            "temperature": daily["temperature_2m_max"][i],
            "rainfall": daily["precipitation_sum"][i],
            "state": state,
            "district": district
        }

        weather_collection.update_one(
            {
                "state": state,
                "district": district,
                "date": record["date"]
            },
            {"$set": record},
            upsert=True
        )

    print(f"Stored historical weather for {district}: {len(daily['time'])} days")

    return True


# ---------------------------
# TEST ONLY
# ---------------------------

if __name__ == "__main__":

    from datetime import datetime

    start = datetime(2012, 1, 1)
    end = datetime(2016, 12, 31)

    fetch_historical_weather(
        state="Jammu and Kashmir",
        district="Jammu",
        start_date=start,
        end_date=end
    )