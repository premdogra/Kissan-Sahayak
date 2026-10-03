import joblib
import numpy as np
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from dataset_builder import build_training_dataset
from collections import defaultdict


# ==============================
# Feature Engineering
# ==============================

def build_features(records):

    X = []
    y = []

    prices = [r["modal_price"] for r in records]

    for i in range(7, len(records)):

        try:
            lag1 = prices[i-1]
            lag2 = prices[i-2]
            lag3 = prices[i-3]

            ma3 = np.mean(prices[i-3:i])
            ma7 = np.mean(prices[i-7:i])

            volatility = max(prices[i-7:i]) - min(prices[i-7:i])

            momentum = prices[i-1] - prices[i-3]

            temperature = records[i].get("temperature", 25)
            rainfall = records[i].get("rainfall", 0)

            month = records[i]["date"].month
            weekday = records[i]["date"].weekday()

            features = [
                lag1,
                lag2,
                lag3,
                ma3,
                ma7,
                volatility,
                momentum,
                temperature,
                rainfall,
                month,
                weekday
            ]

            X.append(features)
            y.append(prices[i])

        except:
            continue

    return np.array(X), np.array(y)


# ==============================
# Detect Constant Markets
# ==============================

def detect_constant_markets(dataset):

    market_prices = defaultdict(list)

    for r in dataset:
        market_prices[r["market"]].append(r["modal_price"])

    constant_markets = {}

    for market, prices in market_prices.items():

        if len(set(prices)) == 1:
            constant_markets[market] = prices[0]

    return constant_markets


# ==============================
# Train Model Per Market
# ==============================

def train_market_models(dataset, commodity, district):

    market_groups = defaultdict(list)

    for r in dataset:
        market_groups[r["market"]].append(r)

    results = {}

    for market, records in market_groups.items():

        print(f"\nTraining for market: {market}")

        if len(records) < 15:
            print("Skipping — insufficient data")
            continue

        records.sort(key=lambda x: x["date"])

        X, y = build_features(records)

        if len(X) < 10:
            print("Not enough feature samples")
            continue

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, shuffle=False
        )

        model = XGBRegressor(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=4,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )

        model.fit(X_train, y_train)

        predictions = model.predict(X_test)

        mae = mean_absolute_error(y_test, predictions)

        print(f"MAE: ₹{mae:.2f}")

        feature_names = [
            "lag1",
            "lag2",
            "lag3",
            "ma3",
            "ma7",
            "volatility",
            "momentum",
            "temperature",
            "rainfall",
            "month",
            "weekday"
        ]

        safe_market = market.replace(" ", "_").replace("(", "").replace(")", "")

        model_name = f"{commodity}_{district}_{safe_market}_xgb.pkl"

        joblib.dump(
            {
                "model": model,
                "features": feature_names
            },
            model_name
        )

        print("Model saved:", model_name)

        results[market] = mae

    return results


# ==============================
# MAIN TRAINING PIPELINE
# ==============================

if __name__ == "__main__":

    commodity = "Carrot"

    districts = [
        ("Punjab", "Ludhiana"),
        ("Jammu and Kashmir", "Jammu"),
        ("Jammu and Kashmir", "Kathua")
    ]

    for state, district in districts:

        print("\n==============================")
        print(f"TRAINING FOR {district}, {state}")
        print("==============================")

        dataset = build_training_dataset(
            commodity=commodity,
            state=state,
            district=district,
            include_market=True
        )

        if not dataset:
            print("No dataset found")
            continue

        print("Total records:", len(dataset))

        constant_markets = detect_constant_markets(dataset)

        if constant_markets:
            print("\nConstant price markets detected:")
            for m, p in constant_markets.items():
                print(f"{m} -> ₹{p}")

        results = train_market_models(dataset, commodity, district)

        print("\nMarket MAE Summary:")

        for market, mae in results.items():
            print(f"{market}: ₹{mae:.2f}")