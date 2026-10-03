# from db import mandi_collection

# records = list(mandi_collection.find({
#     "commodity": "Banana",
#     "state": "Punjab",
#     "district": "Ludhiana"
# }))

# print("Total records:", len(records))

# if records:
#     print("Sample record:", records[0])

import pandas as pd
import numpy as np

mandis = pd.read_csv("mandi_coordinates.csv")

mandis["Latitude"].replace("", np.nan, inplace=True)
mandis["Longitude"].replace("", np.nan, inplace=True)
# import pandas as pd

# mandis = pd.read_csv("mandi_coordinates.csv")

# mandis["Latitude"] = pd.to_numeric(mandis["Latitude"], errors="coerce")
# mandis["Longitude"] = pd.to_numeric(mandis["Longitude"], errors="coerce")