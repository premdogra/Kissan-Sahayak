# historical_loader.py

from db import mandi_collection

def get_historical_records(commodity, state, district=None, limit=300):

    query = {
        "commodity": commodity,
        "state": state
    }

    if district:
        query["district"] = district

    records = list(
        mandi_collection.find(query).sort("arrival_date", 1)
    )

    if not records:
        print("No historical records found.")
        return []

    print("Total historical records:", len(records))

    return records[-limit:]  # take latest N records