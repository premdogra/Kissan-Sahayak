# def generate_recommendation(market_predictions, current_price):

#     best_market = None
#     best_price = 0
#     best_day = 0

#     for market, prices in market_predictions.items():

#         max_price = max(prices)
#         day = prices.index(max_price) + 1

#         if max_price > best_price:
#             best_price = max_price
#             best_market = market
#             best_day = day

#     recommendation = {}

#     if best_price > current_price * 1.03:

#         recommendation["action"] = "WAIT"
#         recommendation["sell_after_days"] = best_day
#         recommendation["best_market"] = best_market
#         recommendation["expected_price"] = round(best_price, 2)
#         recommendation["expected_profit"] = round(best_price - current_price, 2)

#     else:

#         recommendation["action"] = "SELL NOW"
#         recommendation["best_market"] = best_market
#         recommendation["expected_price"] = current_price
#         recommendation["expected_profit"] = 0

#     # Explanation
#     explanation = []

#     if best_price > current_price:
#         explanation.append("Higher price predicted in upcoming days")

#     if best_day > 1:
#         explanation.append(f"Peak price expected on day {best_day}")

#     explanation.append(f"Best mandi identified: {best_market}")

#     recommendation["explanation"] = explanation

#     return recommendation

def generate_recommendation(market_predictions, current_price):

    best_market = None
    best_price = 0
    best_day = 0

    for market, prices in market_predictions.items():

        max_price = max(prices)
        day = prices.index(max_price) + 1

        if max_price > best_price:
            best_price = max_price
            best_market = market
            best_day = day

    recommendation = {}

    threshold = current_price * 1.03

    if best_price > threshold:

        recommendation["action"] = "WAIT"
        recommendation["sell_after_days"] = best_day
        recommendation["best_market"] = best_market
        recommendation["expected_price"] = round(best_price, 2)
        recommendation["expected_profit"] = round(best_price - current_price, 2)

    else:

        recommendation["action"] = "SELL NOW"
        recommendation["best_market"] = best_market
        recommendation["expected_price"] = round(current_price, 2)
        recommendation["expected_profit"] = 0

    # Explanation
    explanation = []

    if best_price > threshold:
        explanation.append("Significant price increase predicted in upcoming days")

    if best_day > 1:
        explanation.append(f"Peak price expected on day {best_day}")

    explanation.append(f"Best mandi identified: {best_market}")

    recommendation["explanation"] = explanation

    return recommendation