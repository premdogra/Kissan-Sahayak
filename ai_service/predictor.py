import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import numpy as np
from db import db

def get_price_data(crop, district):
    data = list(db.mandiprices.find({
        "crop": crop,
        "district": district
    }).sort("date", 1))

    if not data:
        return None

    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    df.set_index('date', inplace=True)

    return df['modalPrice']


def arima_forecast(series, days=7):
    model = ARIMA(series, order=(2,1,2))
    model_fit = model.fit()

    forecast = model_fit.get_forecast(steps=days)
    mean_forecast = forecast.predicted_mean
    conf_int = forecast.conf_int()

    results = []

    for i in range(days):
        results.append({
            "day": i + 1,
            "predicted_price": round(float(mean_forecast[i]), 2),
            "lower_bound": round(float(conf_int.iloc[i, 0]), 2),
            "upper_bound": round(float(conf_int.iloc[i, 1]), 2)
        })

    return results