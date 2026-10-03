import joblib
import numpy as np
from data_loader import get_last_30_records


def predict_next_price(commodity, state, district):

    model = joblib.load("price_model.pkl")

    records = get_last_30_records(commodity, state, district)

    prices = [r["modal_price"] for r in records]

    last_7_days = prices[-7:]

    prediction = model.predict([last_7_days])[0]

    return prediction


if __name__ == "__main__":

    predicted_price = predict_next_price(
        commodity="Tomato",
        state="Jammu and Kashmir",
        district="Jammu"
    )

    print("Predicted Next Day Price:", predicted_price)