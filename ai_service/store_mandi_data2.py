import requests
from datetime import datetime
from db import mandi_collection
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24"
BASE_URL = "https://api.data.gov.in/resource/"


def fetch_mandi_data(state, district, limit=100000):

    url = f"{BASE_URL}{RESOURCE_ID}"

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": limit,
        "filters[State]": state,
        "filters[District]": district
    }

    response = requests.get(url, params=params, timeout=50)
    response.raise_for_status()

    data = response.json()
    return data.get("records", [])


def store_records(records):

    inserted = 0

    for r in records:
        try:
            document = {
                "commodity": r["Commodity"],
                "state": r["State"],
                "district": r["District"],
                "market": r["Market"],
                "arrival_date": datetime.strptime(r["Arrival_Date"], "%d/%m/%Y"),
                "min_price": float(r["Min_Price"]),
                "max_price": float(r["Max_Price"]),
                "modal_price": float(r["Modal_Price"]),
                "commodity_code": r.get("Commodity_Code")
            }

            # Avoid duplicates
            existing = mandi_collection.find_one({
                "commodity": document["commodity"],
                "market": document["market"],
                "arrival_date": document["arrival_date"]
            })

            if not existing:
                mandi_collection.insert_one(document)
                inserted += 1

        except Exception as e:
            print("Skipping record:", e)

    print(f"Inserted {inserted} new records")


if __name__ == "__main__":

    records = fetch_mandi_data(
        state="Punjab",
        district="Amritsar"
    )

    print("Fetched:", len(records))
    store_records(records)