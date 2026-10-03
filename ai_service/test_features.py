from data_loader import get_last_30_days_data
from feature_engineering import build_price_features

data = get_last_30_days_data(
    commodity="Tomato",
    state="Jammu and Kashmir",
    district="Jammu"
)

if data:
    features = build_price_features(data)
    print("AI Features:")
    print(features)