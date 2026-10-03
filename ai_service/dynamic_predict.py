import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from data_pipeline import fetch_and_store_historical_data, get_last_30_records


def prepare_training_data(records, window_size=7):

    prices = [r["modal_price"] for r in records]

    X, y = [], []

    for i in range(len(prices) - window_size):
        X.append(prices[i:i+window_size])
        y.append(prices[i+window_size])

    return np.array(X), np.array(y)


def train_and_predict(commodity, state, district):

    # Step 1: Fetch latest historical data
    fetch_and_store_historical_data(commodity, state, district)

    # Step 2: Get recent records
    records = get_last_30_records(commodity, state, district)

    if len(records) < 15:
        return {"error": "Not enough data for prediction"}

    X, y = prepare_training_data(records)

    model = RandomForestRegressor(n_estimators=200)
    model.fit(X, y)

    last_window = [r["modal_price"] for r in records][-7:]

    predicted_price = model.predict([last_window])[0]

    return {
        "commodity": commodity,
        "district": district,
        "predicted_next_price": round(predicted_price, 2)
    }


if __name__ == "__main__":

    result = train_and_predict(
        commodity="Banana",
        state="Jammu and Kashmir",
        district="Jammu"
    )
    
    print(result)
