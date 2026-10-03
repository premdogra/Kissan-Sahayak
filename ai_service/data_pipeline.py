import requests
from datetime import datetime
from db import mandi_collection
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24"
BASE_URL = "https://api.data.gov.in/resource/"


import time
from requests.exceptions import ReadTimeout

# def fetch_and_store_live_data(commodity, state, district, limit=200):

#     url = f"{BASE_URL}{RESOURCE_ID}"

#     # Only filter by state (safe filter)
#     params = {
#         "api-key": API_KEY,
#         "format": "json",
#         "limit": limit,
#         "filters[state]": state
#     }

#     response = requests.get(url, params=params, timeout=60)
#     response.raise_for_status()

#     data = response.json()
#     records = data.get("records", [])

#     print("Total records fetched from API:", len(records))

#     inserted = 0

#     for r in records:
#         try:
#             # Python-side filtering
#             if (
#                 r["district"].strip().lower() == district.strip().lower()
#                 and r["commodity"].strip().lower() == commodity.strip().lower()
#             ):

#                 document = {
#                     "commodity": r["commodity"],
#                     "state": r["state"],
#                     "district": r["district"],
#                     "market": r["market"],
#                     "arrival_date": datetime.strptime(r["arrival_date"], "%d/%m/%Y"),
#                     "modal_price": float(r["modal_price"]),
#                     "min_price": float(r["min_price"]),
#                     "max_price": float(r["max_price"])
#                 }

#                 existing = mandi_collection.find_one({
#                     "commodity": document["commodity"],
#                     "market": document["market"],
#                     "arrival_date": document["arrival_date"]
#                 })

#                 if not existing:
#                     mandi_collection.insert_one(document)
#                     inserted += 1

#         except Exception as e:
#             continue

#     print(f"Inserted {inserted} filtered records")

def fetch_and_store_historical_data(commodity, state, district):

    inserted = 0
    offset = 0
    limit = 500

    while True:

        params = {
            "api-key": API_KEY,
            "format": "json",
            "limit": limit,
            "offset": offset,
            "filters[State]": state
        }

        response = requests.get(f"{BASE_URL}{RESOURCE_ID}", params=params, timeout=60)
        response.raise_for_status()

        data = response.json()
        records = data.get("records", [])

        if not records:
            break

        print(f"Fetched batch at offset {offset}, size {len(records)}")

        for r in records:
            try:
                if (
                    r["District"].strip().lower() == district.strip().lower()
                    and commodity.lower() in r["Commodity"].lower()
                ):

                    document = {
                        "commodity": r["Commodity"],
                        "state": r["State"],
                        "district": r["District"],
                        "market": r["Market"],
                        "arrival_date": datetime.strptime(r["Arrival_Date"], "%d/%m/%Y"),
                        "modal_price": float(r["Modal_Price"]),
                        "min_price": float(r["Min_Price"]),
                        "max_price": float(r["Max_Price"])
                    }

                    existing = mandi_collection.find_one({
                        "commodity": document["commodity"],
                        "market": document["market"],
                        "arrival_date": document["arrival_date"]
                    })

                    if not existing:
                        mandi_collection.insert_one(document)
                        inserted += 1

            except:
                continue

        offset += limit

        # Safety stop to avoid infinite loop
        if offset > 5000:
            break

    print("Total inserted:", inserted)


def get_last_30_records(commodity, state, district):

    records = list(
        mandi_collection.find({
            "commodity": commodity,
            "state": state,
            "district": district
        }).sort("arrival_date", 1)
    )

    if not records:
        print("No records found.")
        return []

    return records[-30:]