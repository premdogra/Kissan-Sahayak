def moving_average(prices, window):
    if len(prices) < window:
        return sum(prices) / len(prices)
    return sum(prices[-window:]) / window


def calculate_volatility(prices, window):
    if len(prices) < window:
        return max(prices) - min(prices)
    recent = prices[-window:]
    return max(recent) - min(recent)


def build_price_features(records):

    if len(records) < 7:
        raise ValueError("Not enough data")

    prices = [r["modal_price"] for r in records]

    features = {
        "latest_price": prices[-1],
        "ma_7": moving_average(prices, 7),
        "ma_30": moving_average(prices, 30),
        "trend_7d": prices[-1] - prices[-7],
        "volatility_7d": calculate_volatility(prices, 7)
    }

    return features