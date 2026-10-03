# historical_predict.py

import joblib
from historical_loader import get_historical_records


def predict_next_price(commodity, state, district=None):

    model = joblib.load(f"{commodity}_model.pkl")

    records = get_historical_records(commodity, state, district)

    prices = [r["modal_price"] for r in records]

    last_7 = prices[-7:]

    prediction = model.predict([last_7])[0]

    return prediction


if __name__ == "__main__":

    price = predict_next_price(
        commodity="Banana",
        state="Punjab"
    )

    print("Predicted Next Price:", price)