import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from dataset_builder import build_training_dataset


# -----------------------------
# Feature Engineering
# -----------------------------

def prepare_features(dataset, window_size=7):

    prices = [d["modal_price"] for d in dataset]
    temps = [d["temperature"] for d in dataset]
    rain = [d["rainfall"] for d in dataset]

    X, y = [], []

    for i in range(window_size, len(dataset)):
        lag_prices = prices[i-window_size:i]

        features = (
            lag_prices +
            [temps[i], rain[i]]
        )

        X.append(features)
        y.append(prices[i])

    return np.array(X), np.array(y)


# -----------------------------
# Train Model
# -----------------------------

def train_model(commodity, state, district):

    print("Building dataset...")
    dataset = build_training_dataset(commodity, state, district)

    if len(dataset) < 40:
        raise ValueError("Not enough recent data")

    print("Preparing features...")
    X, y = prepare_features(dataset)

    split_index = int(len(X) * 0.8)

    X_train = X[:split_index]
    y_train = y[:split_index]

    X_test = X[split_index:]
    y_test = y[split_index:]

    print("Training model...")
    model = RandomForestRegressor(
        n_estimators=400,
        max_depth=12,
        random_state=42
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    mae = mean_absolute_error(y_test, predictions)

    print("Model trained successfully")
    print("Test MAE:", round(mae, 2))

    model_name = f"{commodity}_{district}_model.pkl"
    joblib.dump(model, model_name)

    print("Model saved as:", model_name)

    return model


if __name__ == "__main__":

    train_model(
        commodity="Banana",
        state="Punjab",
        district="Pathankot"
    )