import requests
from datetime import datetime
from typing import List, Dict

# url = "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=579b464db66ec23bdd000001b2514d41372b43dc72bd9f48789a2d05&format=json&limit=5"

# response = requests.get(url)

# print(response.text)

# import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24"
BASE_URL = "https://api.data.gov.in/resource/"

def list_commodities_in_jammu():
    url = f"{BASE_URL}{RESOURCE_ID}"

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": 1000,  # Increase to capture more records
        "filters[State]": "Punjab",
        "filters[District]": "Ludhiana"
    }

    response = requests.get(url, params=params)
    print("Status Code:", response.status_code)

    data = response.json()

    if "records" not in data or not data["records"]:
        print("No records found for Pathankot district.")
        return

    commodities = set()

    for record in data["records"]:
        commodities.add(record["Commodity"])

    print("\nCommodities found in Pathankot mandi:\n")
    for commodity in sorted(commodities):
        print("-", commodity)


if __name__ == "__main__":
    list_commodities_in_jammu()