# import pandas as pd

# df = pd.read_csv("mandi_list.csv")

# mandis = df[["State", "District", "Market"]].drop_duplicates()

# mandis = mandis.sort_values(["State", "District", "Market"])

# mandis.to_csv("unique_mandis.csv", index=False)

# print("Total unique mandis:", len(mandis))

import pandas as pd

existing = pd.read_csv("unique_mandis.csv")

jk = pd.read_csv("jk_mandis.csv")

combined = pd.concat([existing, jk])

combined = combined.drop_duplicates(subset=["State", "District", "Market"])

combined.to_csv("unique_mandis.csv", index=False)

print("Updated mandi list:", len(combined))