import requests
from datetime import datetime
from typing import List, Dict
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24"
BASE_URL = "https://api.data.gov.in/resource/"


def fetch_historical_raw(commodity: str, state: str, district: str, limit: int = 1000):
    url = f"{BASE_URL}{RESOURCE_ID}"

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": limit,
        "filters[Commodity]": commodity,
        "filters[State]": state,
        "filters[District]": district
    }

    response = requests.get(url, params=params, timeout=20)
    response.raise_for_status()

    data = response.json()
    return data.get("records", [])


def filter_by_date(records: List[Dict], from_date: str, to_date: str):
    start = datetime.strptime(from_date, "%d/%m/%Y")
    end = datetime.strptime(to_date, "%d/%m/%Y")

    filtered = []

    for r in records:
        record_date = datetime.strptime(r["Arrival_Date"], "%d/%m/%Y")
        if start <= record_date <= end:
            filtered.append(r)

    return filtered


if __name__ == "__main__":

    raw_records = fetch_historical_raw(
        commodity="Tomato",
        state="Jammu and Kashmir",
        district="Jammu"
    )

    print("Total raw records:", len(raw_records))

    filtered_records = filter_by_date(
        raw_records,
        from_date="01/01/2010",
        to_date="31/12/2012"
    )

    print("Filtered records:", len(filtered_records))

    if filtered_records:
        print("Sample:", filtered_records[0])