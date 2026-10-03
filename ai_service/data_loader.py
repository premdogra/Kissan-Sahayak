from datetime import datetime, timedelta
from db import mandi_collection


def get_last_30_records(commodity, state, district):

    records = list(
        mandi_collection.find({
            "commodity": commodity,
            "state": state,
            "district": district
        }).sort("arrival_date", 1)
    )

    if len(records) < 10:
        print("Not enough records.")
        return []

    return records[-30:]

if __name__ == "__main__":

    data = get_last_30_records(
        commodity="Tomato",
        state="Jammu and Kashmir",
        district="Jammu"
    )

    if data:
        print("Sample record:")
        print(data[0])