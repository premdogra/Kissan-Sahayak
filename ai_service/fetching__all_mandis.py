import requests
import pandas as pd
import time

import requests
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"

BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

limit = 5000
offset = 0

all_records = []

while True:

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": limit,
        "offset": offset
    }

    response = requests.get(BASE_URL, params=params)
    data = response.json()

    records = data.get("records", [])

    if not records:
        break

    all_records.extend(records)

    print(f"Fetched {len(all_records)} records...")

    offset += limit

    time.sleep(1)

print("Total records fetched:", len(all_records))

df = pd.DataFrame(all_records)

mandis = df[["state", "district", "market"]].drop_duplicates()

mandis = mandis.sort_values(["state", "district", "market"])

mandis.to_csv("mandi_list.csv", index=False)

print("Unique mandis saved:", len(mandis))