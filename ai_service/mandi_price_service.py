import requests
import os
from dotenv import load_dotenv
from requests.exceptions import Timeout, RequestException

load_dotenv()

API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = os.getenv("DATA_GOV_CURRENT_DATE_RESOURCE_ID")

url = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

session = requests.Session()


def get_mandi_price(market, commodity, state=None, district=None):

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": 50,
        "filters[commodity]": commodity
    }

    if state:
        params["filters[state.keyword]"] = state

    if district:
        params["filters[district]"] = district

    if market:
        params["filters[market]"] = market

    try:
        response = session.get(url, params=params, timeout=15)
        response.raise_for_status()

        data = response.json()

    except Timeout:
        return {"error": "API request timed out"}

    except RequestException as e:
        return {"error": f"API request failed: {str(e)}"}

    records = data.get("records", [])

    if not records:
        return {"message": "No records found"}

    results = []

    # strict filtering
    for r in records:

        api_market = r.get("market", "").lower()
        api_commodity = r.get("commodity", "").lower()

        if market.lower() in api_market and commodity.lower() in api_commodity:

            results.append({
                "state": r.get("state"),
                "district": r.get("district"),
                "market": r.get("market"),
                "commodity": r.get("commodity"),
                "variety": r.get("variety"),
                "grade": r.get("grade"),
                "min_price": int(r.get("min_price", 0)),
                "max_price": int(r.get("max_price", 0)),
                "modal_price": int(r.get("modal_price", 0)),
                "arrival_date": r.get("arrival_date")
            })

    if not results:
        return {"message": "Commodity not available in this mandi today"}

    return results