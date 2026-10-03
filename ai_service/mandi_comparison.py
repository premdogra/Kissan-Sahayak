# import joblib
# import numpy as np
# from dataset_builder import build_training_dataset


# MODEL_MAP = {
#     "Narwal Jammu (F&V)": "Banana_Jammu_Narwal_Jammu_F&V_xgb.pkl",
#     "Batote": "Banana_Jammu_Batote_xgb.pkl",
#     "Narwal Jammu (F&V) APMC": "Banana_Jammu_Narwal_Jammu_F&V_APMC_xgb.pkl"
# }


# # Approx transport cost per mandi
# TRANSPORT_COST = {
#     "Narwal Jammu (F&V)": 30,
#     "Batote": 60,
#     "Narwal Jammu (F&V) APMC": 40
# }


# def predict_price(dataset, model_path):

#     model_data = joblib.load(model_path)
#     model = model_data["model"]

#     prices = [d["modal_price"] for d in dataset]

#     lag1 = prices[-1]
#     lag2 = prices[-2]
#     lag3 = prices[-3]
#     lag7 = prices[-7]

#     ma7 = np.mean(prices[-7:])
#     volatility = max(prices[-7:]) - min(prices[-7:])

#     last = dataset[-1]

#     features = np.array([[
#         lag1,
#         lag2,
#         lag3,
#         lag7,
#         ma7,
#         volatility,
#         last["temperature"],
#         last["rainfall"],
#         last["date"].month,
#         last["date"].weekday(),
#         last["date"].day
#     ]])

#     pred = model.predict(features)[0]

#     return pred


# def compare_mandis():

#     dataset = build_training_dataset(
#         commodity="Banana",
#         state="Jammu and Kashmir",
#         district="Jammu"
#     )

#     markets = {}

#     for row in dataset:
#         markets.setdefault(row["market"], []).append(row)

#     results = []

#     print("\nNearby Mandi Profit Comparison\n")

#     for market, data in markets.items():

#         if market not in MODEL_MAP:
#             continue

#         predicted_price = predict_price(data, MODEL_MAP[market])

#         transport = TRANSPORT_COST.get(market, 50)

#         net_price = predicted_price - transport

#         results.append({
#             "market": market,
#             "predicted_price": predicted_price,
#             "transport_cost": transport,
#             "net_price": net_price
#         })

#     results.sort(key=lambda x: x["net_price"], reverse=True)

#     for r in results:
#         print(
#             f"{r['market']} | "
#             f"Predicted ₹{r['predicted_price']:.2f} | "
#             f"Transport ₹{r['transport_cost']} | "
#             f"Net ₹{r['net_price']:.2f}"
#         )

#     best = results[0]

#     print("\nAI Recommendation:")
#     print(f"Sell at {best['market']}")
#     print(f"Expected price ₹{best['predicted_price']:.2f}")

#     return results


# if __name__ == "__main__":
#     compare_mandis()

import joblib
import numpy as np
import os
from dataset_builder import build_training_dataset


# ----------------------------------------
# Dynamic model loader
# ----------------------------------------

def get_model_path(commodity, district, market):

    safe_market = market.replace(" ", "_").replace("(", "").replace(")", "")

    model_name = f"{commodity}_{district}_{safe_market}_xgb.pkl"

    if os.path.exists(model_name):
        return model_name

    return None


# ----------------------------------------
# Predict next price
# ----------------------------------------

def predict_price(dataset, model_path):

    model_data = joblib.load(model_path)
    model = model_data["model"]

    prices = [d["modal_price"] for d in dataset]

    lag1 = prices[-1]
    lag2 = prices[-2]
    lag3 = prices[-3]
    lag7 = prices[-7]

    ma7 = np.mean(prices[-7:])
    volatility = max(prices[-7:]) - min(prices[-7:])

    last = dataset[-1]

    features = np.array([[
        lag1,
        lag2,
        lag3,
        lag7,
        ma7,
        volatility,
        last["temperature"],
        last["rainfall"],
        last["date"].month,
        last["date"].weekday(),
        last["date"].day
    ]])

    prediction = float(model.predict(features)[0])

    return prediction

# ----------------------------------------
# Mandi comparison
# ----------------------------------------

def compare_mandis(commodity, state, district, transport_cost=50):

    dataset = build_training_dataset(
        commodity=commodity,
        state=state,
        district=district
    )

    if not dataset:
        return {"error": "No dataset found"}

    markets = {}

    for row in dataset:
        markets.setdefault(row["market"], []).append(row)

    results = []

    print("\nNearby Mandi Profit Comparison\n")

    for market, data in markets.items():

        model_path = get_model_path(commodity, district, market)

        if not model_path:
            print(f"Skipping {market} (model not found)")
            continue

        predicted_price = predict_price(data, model_path)

        net_price = predicted_price + transport_cost

        results.append({
            "market": market,
            "predicted_price": round(predicted_price, 2),
            "transport_cost": transport_cost,
            "net_price": round(net_price, 2)
        })

    if not results:
        return {"error": "No models available for this commodity"}

    results.sort(key=lambda x: x["net_price"], reverse=True)

    best = results[0]

    print("\nAI Recommendation:")
    print(f"Sell at {best['market']}")
    print(f"Expected price ₹{best['predicted_price']:.2f}")

    return {
    "commodity": commodity,
    "state": state,
    "district": district,
    "transport_cost_used": transport_cost,

    "ai_recommendation": {
        "message": f"Sell at {best['market']}",
        "expected_price": best["predicted_price"],
        "expected_net_price": best["net_price"]
    },

    "comparison": results
}

# ----------------------------------------
# Test run
# ----------------------------------------

if __name__ == "__main__":

    result = compare_mandis(
        commodity="Banana",
        state="Jammu and Kashmir",
        district="Jammu",
        transport_cost=50   # optional
    )

    print("\nResult:\n", result)