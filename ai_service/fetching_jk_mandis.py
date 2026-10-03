import requests
import pandas as pd
import time

import requests
import os
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = os.getenv("DATA_GOV_RESOURCE_ID")

BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

limit = 1000
offset = 0

all_records = []

while True:

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": limit,
        "offset": offset,
        "filters[State]": "Jammu and Kashmir"
    }

    try:
        response = requests.get(BASE_URL, params=params, timeout=10)

        if response.status_code != 200:
            print("Request failed:", response.status_code)
            break

        data = response.json()

    except Exception as e:
        print("Error:", e)
        break

    records = data.get("records", [])

    if not records:
        print("No more records found")
        break

    all_records.extend(records)

    print(f"Fetched {len(all_records)} records...")

    offset += limit

    time.sleep(1)


print("Total records fetched:", len(all_records))


# Convert to DataFrame
df = pd.DataFrame(all_records)

# Show column names once
print("Columns from API:", df.columns)


# Extract only required columns
jk_mandis = df[["State", "District", "Market"]].drop_duplicates()

jk_mandis = jk_mandis.sort_values(["State", "District", "Market"])


# Save to CSV
jk_mandis.to_csv("jk_mandis.csv", index=False)

print("Unique J&K mandis saved:", len(jk_mandis))