import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
from data_loader import get_last_30_days_data


def prepare_training_data(records, window_size=7):

    prices = [r["modal_price"] for r in records]

    X = []
    y = []

    for i in range(len(prices) - window_size):
        X.append(prices[i:i+window_size])
        y.append(prices[i+window_size])

    return np.array(X), np.array(y)


def train_model(commodity, state, district):

    records = get_last_30_days_data(commodity, state, district)

    if len(records) < 15:
        raise ValueError("Not enough data to train model")

    X, y = prepare_training_data(records)

    model = RandomForestRegressor(n_estimators=200)
    model.fit(X, y)

    joblib.dump(model, "price_model.pkl")

    print("Model trained and saved successfully")


if __name__ == "__main__":
    train_model(
        commodity="Tomato",
        state="Jammu and Kashmir",
        district="Jammu"
    )