import requests
from requests.exceptions import Timeout, RequestException
from nearby_mandis import get_nearby_mandis
import os
from dotenv import load_dotenv
import json

load_dotenv()

API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = os.getenv("DATA_GOV_CURRENT_DATE_RESOURCE_ID") 


def get_nearby_mandi_prices(lat, lon, commodity):
    """
    Fetch commodity prices from nearby mandis
    """
    nearby = get_nearby_mandis(lat, lon)
    
    # If no nearby mandis found
    if nearby.empty:
        return [{"error": "No nearby mandis found"}]

    results = []
    url = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

    for _, mandi in nearby.iterrows():
        market = mandi["Market"]
        district = mandi["District"]
        state = mandi["State"]

        # Primary filter combination (most specific)
        params = {
            "api-key": API_KEY,
            "format": "json",
            "limit": 10,
            "filters[state]": state,
            "filters[district]": district,
            "filters[market]": market,
            "filters[commodity]": commodity
        }

        try:
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
            records = data.get("records", [])
            
            # If no records with specific filters, try without commodity filter
            if not records:
                # Try with market filter only (since commodity might not be available)
                params_loose = {
                    "api-key": API_KEY,
                    "format": "json",
                    "limit": 10,
                    "filters[state]": state,
                    "filters[market]": market
                }
                
                response = requests.get(url, params=params_loose, timeout=15)
                response.raise_for_status()
                data = response.json()
                records = data.get("records", [])
                
                # Filter records for the specific commodity if available
                if records:
                    records = [r for r in records if r.get("commodity", "").lower() == commodity.lower()]
            
            # Process records if found
            if records:
                for record in records:
                    # Map the API field names to your expected format
                    results.append({
                        "Market": market,
                        "District": district,
                        "State": state,
                        "Commodity": record.get("commodity", commodity),
                        "Variety": record.get("variety", "N/A"),
                        "Grade": record.get("grade", "N/A"),
                        "Modal_Price": record.get("modal_price"),
                        "Min_Price": record.get("min_price"),
                        "Max_Price": record.get("max_price"),
                        "Arrival_Date": record.get("arrival_date")
                    })
            else:
                results.append({
                    "Market": market,
                    "District": district,
                    "State": state,
                    "Commodity": commodity,
                    "message": f"{commodity} not available in this market today",
                    "available_commodities": "Check API response for available commodities"
                })

        except Timeout:
            results.append({
                "Market": market,
                "District": district,
                "State": state,
                "Commodity": commodity,
                "error": "API request timed out"
            })
            continue

        except RequestException as e:
            results.append({
                "Market": market,
                "District": district,
                "State": state,
                "Commodity": commodity,
                "error": f"API request failed: {str(e)}"
            })
            continue

    return results


def get_available_commodities(lat, lon):
    """
    Get all available commodities in nearby mandis (useful for debugging)
    """
    nearby = get_nearby_mandis(lat, lon)
    
    if nearby.empty:
        return {"error": "No nearby mandis found"}
    
    url = f"https://api.data.gov.in/resource/{RESOURCE_ID}"
    results = {}
    
    for _, mandi in nearby.iterrows():
        market = mandi["Market"]
        state = mandi["State"]
        
        params = {
            "api-key": API_KEY,
            "format": "json",
            "limit": 50,
            "filters[state]": state,
            "filters[market]": market
        }
        
        try:
            response = requests.get(url, params=params, timeout=15)
            data = response.json()
            records = data.get("records", [])
            
            commodities = set()
            for record in records:
                if "commodity" in record:
                    commodities.add(record["commodity"])
            
            results[market] = list(commodities)
            
        except Exception as e:
            results[market] = f"Error: {str(e)}"
    
    return results
