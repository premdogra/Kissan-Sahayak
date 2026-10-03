import requests
from datetime import datetime, timedelta
from db import mandi_collection
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24"
BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID}"


def fetch_recent_data(commodity, state, district):

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": 200,
        "sort[Arrival_Date]": "desc",
        "filters[State]": state,
        "filters[District]": district,
        "filters[Commodity]": commodity
    }

    response = requests.get(BASE_URL, params=params, timeout=60)
    response.raise_for_status()

    data = response.json()
    records = data.get("records", [])

    print("Fetched records:", len(records))

    return records


def store_last_90_days(records):

    cutoff_date = datetime.today() - timedelta(days=150)

    inserted = 0

    for r in records:
        try:
            arrival_date = datetime.strptime(
                r["Arrival_Date"], "%d/%m/%Y"
            )

            # 🔥 Python filtering for last 90 days
            if arrival_date < cutoff_date:
                continue

            document = {
                "commodity": r["Commodity"],
                "state": r["State"],
                "district": r["District"],
                "market": r["Market"],
                "arrival_date": arrival_date,
                "min_price": float(r["Min_Price"]),
                "max_price": float(r["Max_Price"]),
                "modal_price": float(r["Modal_Price"]),
                "commodity_code": r.get("Commodity_Code")
            }

            result = mandi_collection.update_one(
                {
                    "commodity": document["commodity"],
                    "market": document["market"],
                    "arrival_date": document["arrival_date"]
                },
                {"$set": document},
                upsert=True
            )

            if result.upserted_id:
                inserted += 1

        except Exception as e:
            continue

    print("Inserted last 90 days records:", inserted)


if __name__ == "__main__":

    records = fetch_recent_data(
        commodity="Banana",
        state="Jammu and Kashmir",
        district="Kathua"
    )

    store_last_90_days(records)