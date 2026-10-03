import joblib
import numpy as np
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split

from dataset_builder import build_training_dataset


# ==============================
# Feature Engineering
# ==============================

def create_features(dataset):

    X = []
    y = []

    for i in range(7, len(dataset)):

        price_lag1 = dataset[i-1]["modal_price"]
        price_lag3 = dataset[i-3]["modal_price"]
        price_lag7 = dataset[i-7]["modal_price"]

        ma7 = np.mean([
            dataset[j]["modal_price"] for j in range(i-7, i)
        ])

        volatility = max([
            dataset[j]["modal_price"] for j in range(i-7, i)
        ]) - min([
            dataset[j]["modal_price"] for j in range(i-7, i)
        ])

        features = [
            price_lag1,
            price_lag3,
            price_lag7,
            ma7,
            volatility,
            dataset[i]["temperature"],
            dataset[i]["rainfall"],
            dataset[i]["date"].month,
            dataset[i]["date"].weekday()
        ]

        X.append(features)
        y.append(dataset[i]["modal_price"])

    return np.array(X), np.array(y)


# ==============================
# Train XGBoost Model
# ==============================

def train_model(X, y, commodity, district):

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, shuffle=False
    )

    model = XGBRegressor(
        n_estimators=400,
        learning_rate=0.03,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )

    print("Training XGBoost model...")
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    mae = mean_absolute_error(y_test, predictions)

    print(f"Test MAE: {mae:.2f}")

    model_name = f"{commodity}_{district}_xgb_model.pkl"

    joblib.dump(model, model_name)

    print("Model saved as:", model_name)

    return model


# ==============================
# MAIN TRAINING PIPELINE
# ==============================

if __name__ == "__main__":

    print("Building dataset...")

    dataset = build_training_dataset(
        commodity="Banana",
        state="Punjab",
        district="Pathankot"
    )

    print("Creating ML features...")

    X, y = create_features(dataset)

    print("Dataset size:", len(X))

    train_model(
        X,
        y,
        commodity="Banana",
        district="Pathankot"
    )