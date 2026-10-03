import pandas as pd
from geopy.geocoders import Nominatim
import time
import re

mandis = pd.read_csv("unique_mandis.csv")

geolocator = Nominatim(user_agent="marketpulse")

latitudes = []
longitudes = []

def clean_market_name(name):
    
    # remove brackets
    name = re.sub(r"\(.*?\)", "", name)

    # remove unwanted words
    remove_words = ["APMC", "F&V", "VFPCK", "SMY", "PMY"]

    for word in remove_words:
        name = name.replace(word, "")

    return name.strip()

for _, row in mandis.iterrows():

    market = clean_market_name(row["Market"])

    query = f"{market}, {row['District']}, {row['State']}, India"

    try:
        location = geolocator.geocode(query)

        if location:
            latitudes.append(location.latitude)
            longitudes.append(location.longitude)
            print(f"✔ Found: {query}")

        else:
            latitudes.append(None)
            longitudes.append(None)
            print(f"✖ Not found: {query}")

    except Exception as e:
        latitudes.append(None)
        longitudes.append(None)
        print("Error:", e)

    time.sleep(1)

mandis["Latitude"] = latitudes
mandis["Longitude"] = longitudes

mandis.to_csv("mandi_coordinates.csv", index=False)

print("\n✅ Coordinates generation completed.")