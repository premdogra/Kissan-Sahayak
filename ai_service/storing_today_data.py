import requests
import os
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import time

load_dotenv()

API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = os.getenv("DATA_GOV_CURRENT_DATE_RESOURCE_ID")
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["marketpulse"]
collection = db["mandi_prices"]

url = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

session = requests.Session()


def fetch_today_data(state, district=None, commodity=None):

    all_records = []
    offset = 0
    limit = 200   # smaller batch size prevents timeout

    while True:

        params = {
            "api-key": API_KEY,
            "format": "json",
            "limit": limit,
            "offset": offset,
            "filters[state.keyword]": state
        }

        if district:
            params["filters[district]"] = district

        if commodity:
            params["filters[commodity]"] = commodity

        try:
            response = session.get(url, params=params, timeout=50)
            response.raise_for_status()
            data = response.json()

        except requests.exceptions.Timeout:
            print("Timeout occurred, retrying...")
            time.sleep(3)
            continue

        records = data.get("records", [])

        if not records:
            break

        all_records.extend(records)

        offset += limit

        print(f"Fetched {len(all_records)} records so far...")

        time.sleep(1)  # avoid hitting rate limits

    return all_records


def store_today_data(state, district=None, commodity=None):

    records = fetch_today_data(state, district, commodity)

    inserted = 0

    for r in records:

        arrival_date = r.get("arrival_date")

        if arrival_date:
            arrival_date = datetime.strptime(arrival_date, "%d/%m/%Y")

        document = {
            "commodity": r.get("commodity"),
            "state": r.get("state"),
            "district": r.get("district"),
            "market": r.get("market"),
            "arrival_date": arrival_date,
            "min_price": int(r.get("min_price", 0)),
            "max_price": int(r.get("max_price", 0)),
            "modal_price": int(r.get("modal_price", 0)),
            "commodity_code": r.get("commodity_code")
        }

        existing = collection.find_one({
            "commodity": document["commodity"],
            "market": document["market"],
            "arrival_date": document["arrival_date"]
        })

        if not existing:
            collection.insert_one(document)
            inserted += 1

    print(f"Inserted {inserted} new records")
    return inserted

if __name__ == "__main__":
    inserted_count = store_today_data(
        state="Jammu and Kashmir"
    )
