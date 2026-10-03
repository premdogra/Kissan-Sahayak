# historical_model_trainer.py

import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
from historical_loader import get_historical_records


def prepare_training_data(records, window_size=7):

    prices = [r["modal_price"] for r in records]

    X = []
    y = []

    for i in range(len(prices) - window_size):
        X.append(prices[i:i+window_size])
        y.append(prices[i+window_size])

    return np.array(X), np.array(y)


def train_model(commodity, state, district=None):

    records = get_historical_records(commodity, state, district)

    if len(records) < 50:
        raise ValueError("Not enough historical data")

    X, y = prepare_training_data(records)

    model = RandomForestRegressor(n_estimators=200)
    model.fit(X, y)

    joblib.dump(model, f"{commodity}_model.pkl")

    print("Model trained successfully")
    print("Training samples:", len(X))


if __name__ == "__main__":

    train_model(
        commodity="Banana",
        state="Punjab"
    )