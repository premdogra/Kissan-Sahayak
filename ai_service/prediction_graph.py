# import matplotlib.pyplot as plt
# from dataset_builder import build_training_dataset
# from forecast_7_days import forecast_market, MODEL_MAP


# def generate_prediction_graph():

#     dataset = build_training_dataset(
#         commodity="Banana",
#         state="Jammu and Kashmir",
#         district="Jammu"
#     )

#     markets = {}

#     for row in dataset:
#         markets.setdefault(row["market"], []).append(row)

#     valid_markets = [m for m in markets if m in MODEL_MAP]

#     print("Markets to plot:", valid_markets)

#     fig, axes = plt.subplots(len(valid_markets), 1, figsize=(12, 5 * len(valid_markets)))

#     if len(valid_markets) == 1:
#         axes = [axes]

#     for ax, market in zip(axes, valid_markets):

#         data = markets[market]

#         forecast = forecast_market(data.copy(), MODEL_MAP[market])

#         past_prices = [d["modal_price"] for d in data]
#         future_prices = forecast

#         past_days = list(range(len(past_prices)))
#         future_days = list(range(len(past_prices), len(past_prices) + 7))

#         ax.plot(past_days, past_prices, label="Past Prices", linewidth=2)

#         ax.plot(future_days, future_prices, label="Predicted Prices", linewidth=2)

#         upper = [p * 1.05 for p in future_prices]
#         lower = [p * 0.95 for p in future_prices]

#         ax.fill_between(future_days, lower, upper, alpha=0.2)

#         ax.set_title(f"Banana Price Prediction — {market}")

#         ax.set_xlabel("Days")

#         ax.set_ylabel("Price ₹")

#         ax.legend()

#         ax.grid(True)

#     plt.tight_layout()

#     plt.show()


# if __name__ == "__main__":
#     generate_prediction_graph()

import matplotlib.pyplot as plt
import os

from dataset_builder import build_training_dataset
from forecast_7_days import forecast_market


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
# Generate prediction graph
# ----------------------------------------

def generate_prediction_graph(commodity, state, district):

    dataset = build_training_dataset(
        commodity=commodity,
        state=state,
        district=district
    )

    if not dataset:
        print("No dataset found")
        return

    markets = {}

    for row in dataset:
        markets.setdefault(row["market"], []).append(row)

    valid_markets = []

    for market in markets:

        model_path = get_model_path(commodity, district, market)

        if model_path:
            valid_markets.append(market)

    if not valid_markets:
        print("No models available for plotting")
        return

    print("Markets to plot:", valid_markets)

    fig, axes = plt.subplots(len(valid_markets), 1, figsize=(12, 5 * len(valid_markets)))

    if len(valid_markets) == 1:
        axes = [axes]

    for ax, market in zip(axes, valid_markets):

        data = markets[market]

        model_path = get_model_path(commodity, district, market)

        forecast = forecast_market(data.copy(), model_path)

        past_prices = [d["modal_price"] for d in data]
        future_prices = forecast

        past_days = list(range(len(past_prices)))
        future_days = list(range(len(past_prices), len(past_prices) + 7))

        ax.plot(past_days, past_prices, label="Past Prices", linewidth=2)

        ax.plot(future_days, future_prices, label="Predicted Prices", linewidth=2)

        upper = [p * 1.05 for p in future_prices]
        lower = [p * 0.95 for p in future_prices]

        ax.fill_between(future_days, lower, upper, alpha=0.2)

        ax.set_title(f"{commodity} Price Prediction — {market}")

        ax.set_xlabel("Days")
        ax.set_ylabel("Price ₹")

        ax.legend()
        ax.grid(True)

    plt.tight_layout()
    plt.show()


# ----------------------------------------
# Test run
# ----------------------------------------

if __name__ == "__main__":

    generate_prediction_graph(
        commodity="Banana",
        state="Jammu and Kashmir",
        district="Jammu"
    )