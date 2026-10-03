import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24"

url = f"https://api.data.gov.in/resource/{RESOURCE_ID}"


def get_last_7_mandi_prices(market, commodity):

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": 7,
        "sort[Arrival_Date]": "desc",
        "filters[Market]": market,
        "filters[Commodity]": commodity
    }

    response = requests.get(url, params=params, timeout=20)

    data = response.json()

    records = data.get("records", [])

    results = []

    for r in records:
        results.append({
            "date": r["Arrival_Date"],
            "price": int(r["Modal_Price"])
        })

    results.reverse()

    return results