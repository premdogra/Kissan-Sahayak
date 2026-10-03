# from weather_service import fetch_historical_weather
# from datetime import datetime, timedelta

# from pymongo import MongoClient

# client = MongoClient("mongodb+srv://6005168766pd:Dogra%402005@cluster0.qein0sa.mongodb.net/test?retryWrites=true&w=majority")
# db = client["marketpulse"]

# mandi_collection = db["mandi_prices"]
# weather_collection = db["weather_data"]

# from datetime import datetime, timedelta

# def get_last_90_days_mandi(commodity, state, district):

#     end_date = datetime.today()
#     start_date = end_date - timedelta(days=150)

#     records = list(
#         mandi_collection.find(
#             {
#                 "commodity": commodity,
#                 "state": state,
#                 "district": district,
#                 "arrival_date": {
#                     "$gte": start_date,
#                     "$lte": end_date
#                 }
#             }
#         ).sort("arrival_date", 1)
#     )

#     print("Last 90 days mandi records:", len(records))
#     return records

# def build_training_dataset(commodity, state, district):

#     mandi_records = get_last_90_days_mandi(commodity, state, district)

#     if not mandi_records:
#         return []

#     start_date = mandi_records[0]["arrival_date"]
#     end_date = mandi_records[-1]["arrival_date"]

#     # 🔥 Ensure weather exists
#     fetch_historical_weather(state, district, start_date, end_date)

#     dataset = []

#     for record in mandi_records:

#         weather = weather_collection.find_one({
#             "state": state,
#             "district": district,
#             "$expr": {
#                 "$eq": [
#                     {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}},
#                     record["arrival_date"].strftime("%Y-%m-%d")
#                 ]
#             }
#         })

#         if not weather:
#             continue

#         merged = {
#             "date": record["arrival_date"],
#             "modal_price": record["modal_price"],
#             "temperature": weather["temperature"],
#             "rainfall": weather["rainfall"]
#         }

#         dataset.append(merged)

#     print(f"Merged dataset size: {len(dataset)}")

#     return dataset

# # if __name__ == "__main__":

# #     data = build_training_dataset(
# #         commodity="Banana",
# #         state="Jammu and Kashmir",
# #         district="Jammu"
# #     )

# #     if data:
# #         print("Sample record:")
# #         print(data[0])

# from weather_service import fetch_historical_weather
# from datetime import datetime, timedelta
# from pymongo import MongoClient
# import os
# from dotenv import load_dotenv
# load_dotenv()
# client = MongoClient(os.getenv("MONGO_URI"))
# db = client["marketpulse"]

# mandi_collection = db["mandi_prices"]
# weather_collection = db["weather_data"]

# from datetime import datetime, timedelta

# def get_last_90_days_mandi(commodity, state, district):
#     end_date = datetime.today()
#     start_date = end_date - timedelta(days=150)

#     records = list(
#         mandi_collection.find(
#             {
#                 "commodity": commodity,
#                 "state": state,
#                 "district": district,
#                 "arrival_date": {
#                     "$gte": start_date,
#                     "$lte": end_date
#                 }
#             }
#         ).sort("arrival_date", 1)
#     )

#     print("Last 90 days mandi records:", len(records))
#     return records

# def build_training_dataset(commodity, state, district, include_market=True):
#     """
#     Build training dataset with option to include market information
    
#     Args:
#         commodity: str
#         state: str
#         district: str
#         include_market: bool - If True, includes market field in output
#     """
#     mandi_records = get_last_90_days_mandi(commodity, state, district)

#     if not mandi_records:
#         return []

#     start_date = mandi_records[0]["arrival_date"]
#     end_date = mandi_records[-1]["arrival_date"]

#     # Ensure weather exists
#     fetch_historical_weather(state, district, start_date, end_date)

#     dataset = []

#     for record in mandi_records:
#         weather = weather_collection.find_one({
#             "state": state,
#             "district": district,
#             "$expr": {
#                 "$eq": [
#                     {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}},
#                     record["arrival_date"].strftime("%Y-%m-%d")
#                 ]
#             }
#         })

#         if not weather:
#             continue

#         # Base merged record
#         merged = {
#             "date": record["arrival_date"],
#             "modal_price": record["modal_price"],
#             "temperature": weather["temperature"],
#             "rainfall": weather["rainfall"]
#         }
        
#         # Add market information if requested
#         if include_market:
#             merged["market"] = record.get("market", "unknown")
#             merged["min_price"] = record.get("min_price", 0)
#             merged["max_price"] = record.get("max_price", 0)
#             merged["commodity_code"] = record.get("commodity_code", "")

#         dataset.append(merged)

#     print(f"Merged dataset size: {len(dataset)}")
    
#     # Show market distribution if included
#     if include_market and dataset:
#         markets = {}
#         for d in dataset:
#             market = d.get('market', 'unknown')
#             markets[market] = markets.get(market, 0) + 1
        
#         if len(markets) > 1:
#             print(f"Markets found: {markets}")
#         else:
#             print(f"Single market: {list(markets.keys())[0] if markets else 'unknown'}")

#     return dataset

# if __name__ == "__main__":
#     # Test with market info
#     print("\n=== Testing with market info ===")
#     data = build_training_dataset(
#         commodity="Banana",
#         state="Jammu and Kashmir",
#         district="Jammu",
#         include_market=True
#     )

#     if data:
#         print("\nSample record with market:")
#         print(data[0])
        
#         # Show market distribution
#         markets = {}
#         for d in data:
#             m = d.get('market', 'unknown')
#             markets[m] = markets.get(m, 0) + 1
      
       # print("\nMarket distribution:")
        # for market, count in markets.items():
        #     print(f"  {market}: {count} records")

from weather_service import fetch_historical_weather
from datetime import datetime, timedelta
from pymongo import MongoClient
import os
import re
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["marketpulse"]

mandi_collection = db["mandi_prices"]
weather_collection = db["weather_data"]

from datetime import datetime, timedelta

def normalize_market_name(market_name):
    """
    Simple function to remove 'APMC' from the end of market names
    """
    if not market_name or not isinstance(market_name, str):
        return market_name
    
    # Remove 'APMC' from the end (case insensitive)
    normalized = re.sub(r'\s*APMC\s*$', '', market_name, flags=re.IGNORECASE)
    
    # Also remove 'APMC' before (F&V) if present
    normalized = re.sub(r'\s*APMC\s*(?=\(F&V\)|F&V)', '', normalized, flags=re.IGNORECASE)
    
    return normalized.strip()

def get_last_90_days_mandi(commodity, state, district):
    end_date = datetime.today()
    start_date = end_date - timedelta(days=150)

    records = list(
        mandi_collection.find(
            {
                "commodity": commodity,
                "state": state,
                "district": district,
                "arrival_date": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            }
        ).sort("arrival_date", 1)
    )

    print("Last 90 days mandi records:", len(records))
    return records

def build_training_dataset(commodity, state, district, include_market=True):
    """
    Build training dataset with option to include market information
    
    Args:
        commodity: str
        state: str
        district: str
        include_market: bool - If True, includes market field in output
    """
    mandi_records = get_last_90_days_mandi(commodity, state, district)

    if not mandi_records:
        return []

    start_date = mandi_records[0]["arrival_date"]
    end_date = mandi_records[-1]["arrival_date"]

    # Ensure weather exists
    fetch_historical_weather(state, district, start_date, end_date)

    dataset = []
    market_count = {}

    for record in mandi_records:
        weather = weather_collection.find_one({
            "state": state,
            "district": district,
            "$expr": {
                "$eq": [
                    {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}},
                    record["arrival_date"].strftime("%Y-%m-%d")
                ]
            }
        })

        if not weather:
            continue

        # Get original market name
        original_market = record.get("market", "unknown")
        
        # Normalize by removing APMC suffix only
        normalized_market = normalize_market_name(original_market)
        
        # Track for logging (optional, doesn't affect output)
        if original_market != normalized_market:
            market_count[normalized_market] = market_count.get(normalized_market, 0) + 1

        # Base merged record - EXACTLY same fields as before
        merged = {
            "date": record["arrival_date"],
            "modal_price": record["modal_price"],
            "temperature": weather["temperature"],
            "rainfall": weather["rainfall"]
        }
        
        # Add market information if requested - using normalized name but same field name
        if include_market:
            merged["market"] = normalized_market  # Same field name, just normalized value
            merged["min_price"] = record.get("min_price", 0)
            merged["max_price"] = record.get("max_price", 0)
            merged["commodity_code"] = record.get("commodity_code", "")

        dataset.append(merged)

    print(f"Merged dataset size: {len(dataset)}")
    
    # Optional logging (doesn't affect the dataset structure)
    if market_count:
        print(f"Normalized {sum(market_count.values())} records by removing APMC suffix")
        # Optional: Show which markets were affected
        # for market, count in market_count.items():
        #     print(f"  {market}: {count} records")

    return dataset

if __name__ == "__main__":
    # Test with market info
    print("\n=== Testing with market info ===")
    data = build_training_dataset(
        commodity="Banana",
        state="Jammu and Kashmir",
        district="Jammu",
        include_market=True
    )

    if data:
        print("\nSample record with market:")
        print(data[0])
        
        # Show market distribution
        markets = {}
        for d in data:
            m = d.get('market', 'unknown')
            markets[m] = markets.get(m, 0) + 1
        
        print("\nMarket distribution:")
        for market, count in markets.items():
            print(f"  {market}: {count} records")
    
    # Test the normalization function
    print("\n=== Testing Normalization ===")
    test_names = [
        "Narwal Jammu F&V APMC",
        "Narwal Jammu (F&V) APMC",
        "Azadpur Delhi APMC",
        "Ludhiana Mandi APMC",
        "Jammu Narwal F&V APMC",
        "Narwal Jammu F&V"  # Already without APMC
    ]
    
    for name in test_names:
        normalized = normalize_market_name(name)
        print(f"  '{name}' -> '{normalized}'")