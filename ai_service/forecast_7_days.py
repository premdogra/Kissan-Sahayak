# import joblib
# import numpy as np
# from dataset_builder import build_training_dataset
# from recommendation_engine import generate_recommendation


# MODEL_MAP = {
#     "Narwal Jammu (F&V)": "Carrot_Jammu_Narwal_Jammu_F&V_xgb.pkl",
#     "Batote": "Carrot_Jammu_Batote_xgb.pkl",
#     "Narwal Jammu (F&V) APMC": "Carrot_Jammu_Narwal_Jammu_F&V_APMC_xgb.pkl",
#     "Ludhiana": "Carrot_Ludhiana_Ludhiana_xgb.pkl",
#     "Ludhiana APMC": "Carrot_Ludhiana_Ludhiana_APMC_xgb.pkl",
#      "Doraha APMC": "Carrot_Ludhiana_Doraha_APMC_xgb.pkl",
#      "Samrala APMC": "Carrot_Ludhiana_Samrala_APMC_xgb.pkl",
#      "Khanna APMC": "Carrot_Ludhiana_Khanna_APMC_xgb.pkl",
#      "Sahnewal APMC": "Carrot_Ludhiana_Sahnewal_APMC_xgb.pkl",
#     "Kathua": "Carrot_Kathua_Kathua_xgb.pkl",
#     "Kathua APMC": "Carrot_Kathua_Kathua_APMC_xgb.pkl"
# }

# # ----------------------------------------
# # 7 DAY FORECAST FOR A SINGLE MARKET
# # ----------------------------------------

# def forecast_market(dataset, model_path):

#     model_data = joblib.load(model_path)
#     model = model_data["model"]

#     predictions = []

#     for i in range(7):

#         prices = [d["modal_price"] for d in dataset]

#         lag1 = prices[-1]
#         lag2 = prices[-2]
#         lag3 = prices[-3]
#         lag7 = prices[-7]

#         ma7 = np.mean(prices[-7:])
#         volatility = max(prices[-7:]) - min(prices[-7:])

#         last = dataset[-1]

#         features = np.array([[
#             lag1,
#             lag2,
#             lag3,
#             lag7,
#             ma7,
#             volatility,
#             last["temperature"],
#             last["rainfall"],
#             last["date"].month,
#             last["date"].weekday(),
#             last["date"].day
#         ]])

#         pred = model.predict(features)[0]

#         predictions.append(pred)

#         dataset.append({
#             "modal_price": pred,
#             "temperature": last["temperature"],
#             "rainfall": last["rainfall"],
#             "date": last["date"],
#             "market": last["market"]
#         })

#     return predictions



# # ----------------------------------------
# # AI DECISION ENGINE
# # ----------------------------------------

# def run_ai_forecast():

#     dataset = build_training_dataset(
#         commodity="Carrot",
#         state="Punjab",
#         district="Ludhiana"
#     )

#     markets = {}

#     for row in dataset:
#         markets.setdefault(row["market"], []).append(row)

#     market_predictions = {}

#     print("\n==============================")
#     print("7 DAY PRICE FORECAST")
#     print("==============================")

#     for market, data in markets.items():

#         if market not in MODEL_MAP:
#             continue

#         forecast = forecast_market(data.copy(), MODEL_MAP[market])

#         market_predictions[market] = forecast

#         print(f"\nMarket: {market}")

#         for i, p in enumerate(forecast, 1):
#             print(f"Day {i}: ₹{p:.2f}")

#     # ----------------------------------------
#     # DECISION ANALYSIS
#     # ----------------------------------------
#     # ----------------------------------------
#     # AI DECISION ENGINE
#     # ----------------------------------------

#     current_price = dataset[-1]["modal_price"]

#     recommendation = generate_recommendation(
#         market_predictions,
#         current_price
#     )

#     print("\n==============================")
#     print("AI SELLING RECOMMENDATION")
#     print("==============================")

#     print("Action:", recommendation["action"])

#     if recommendation["action"] == "WAIT":
#         print("Sell after:", recommendation["sell_after_days"], "days")

#     print("Best mandi:", recommendation["best_market"])
#     print("Expected price:", recommendation["expected_price"])
#     print("Expected profit:", recommendation["expected_profit"])

#     print("\nReason:")

#     for r in recommendation["explanation"]:
#         print("•", r)


# # ----------------------------------------

# if __name__ == "__main__":
#     run_ai_forecast()
# import joblib
# import numpy as np
# import os
# from dataset_builder import build_training_dataset
# from recommendation_engine import generate_recommendation


# # ----------------------------------------
# # Dynamic model loader
# # ----------------------------------------

# def get_model_path(commodity, district, market):

#     safe_market = market.replace(" ", "_").replace("(", "").replace(")", "")

#     model_name = f"{commodity}_{district}_{safe_market}_xgb.pkl"

#     if os.path.exists(model_name):
#         return model_name

#     return None


# # ----------------------------------------
# # 7 DAY FORECAST FOR A SINGLE MARKET
# # ----------------------------------------

# def forecast_market(dataset, model_path):

#     model_data = joblib.load(model_path)
#     model = model_data["model"]

#     predictions = []

#     for i in range(7):

#         prices = [float(d["modal_price"]) for d in dataset]

#         lag1 = prices[-1]
#         lag2 = prices[-2]
#         lag3 = prices[-3]
#         lag7 = prices[-7]

#         ma7 = float(np.mean(prices[-7:]))
#         volatility = float(max(prices[-7:]) - min(prices[-7:]))

#         last = dataset[-1]

#         features = np.array([[

#             lag1,
#             lag2,
#             lag3,
#             lag7,
#             ma7,
#             volatility,
#             last["temperature"],
#             last["rainfall"],
#             last["date"].month,
#             last["date"].weekday(),
#             last["date"].day

#         ]])

#         pred = float(model.predict(features)[0])

#         predictions.append(pred)

#         dataset.append({
#             "modal_price": float(pred),
#             "temperature": last["temperature"],
#             "rainfall": last["rainfall"],
#             "date": last["date"],
#             "market": last["market"]
#         })

#     return predictions


# # ----------------------------------------
# # AI FORECAST ENGINE
# # ----------------------------------------

# def run_ai_forecast(commodity, state, district):

#     dataset = build_training_dataset(
#         commodity=commodity,
#         state=state,
#         district=district
#     )

#     if not dataset:
#         return {"error": "No dataset found"}

#     markets = {}

#     for row in dataset:
#         markets.setdefault(row["market"], []).append(row)

#     market_predictions = {}

#     print("\n==============================")
#     print("7 DAY PRICE FORECAST")
#     print("==============================")

#     for market, data in markets.items():

#         model_path = get_model_path(commodity, district, market)

#         if not model_path:
#             print(f"Skipping {market} (model not found)")
#             continue

#         forecast = forecast_market(data.copy(), model_path)

#         # Ensure JSON-safe values
#         market_predictions[market] = [float(p) for p in forecast]

#         print(f"\nMarket: {market}")

#         for i, p in enumerate(forecast, 1):
#             print(f"Day {i}: ₹{p:.2f}")

#     if not market_predictions:
#         return {"error": "No models available for this commodity"}

#     # Ensure float for API response
#     current_price = float(dataset[-1]["modal_price"])

#     recommendation = generate_recommendation(
#         market_predictions,
#         current_price
#     )

#     print("\n==============================")
#     print("AI SELLING RECOMMENDATION")
#     print("==============================")

#     print("Action:", recommendation["action"])

#     if recommendation["action"] == "WAIT":
#         print("Sell after:", recommendation["sell_after_days"], "days")

#     print("Best mandi:", recommendation["best_market"])
#     print("Expected price:", recommendation["expected_price"])
#     print("Expected profit:", recommendation["expected_profit"])

#     print("\nReason:")

#     for r in recommendation["explanation"]:
#         print("•", r)

#     return {
#         "commodity": commodity,
#         "state": state,
#         "district": district,
#         "current_price": float(current_price),
#         "forecast": market_predictions,
#         "recommendation": recommendation
#     }


# # ----------------------------------------

# if __name__ == "__main__":

#     result = run_ai_forecast(
#         commodity="Carrot",
#         state="Punjab",
#         district="Ludhiana"
#     )

#     print(result)

import joblib
import numpy as np
import os
import re
from dataset_builder import build_training_dataset
from recommendation_engine import generate_recommendation
from datetime import datetime, timedelta


# ----------------------------------------
# Market name normalization (same as dataset_builder)
# ----------------------------------------

def normalize_market_name(market_name):
    """
    Simple function to remove 'APMC' from the end of market names
    Must match exactly with dataset_builder normalization
    """
    if not market_name or not isinstance(market_name, str):
        return market_name
    
    # Remove 'APMC' from the end (case insensitive)
    normalized = re.sub(r'\s*APMC\s*$', '', market_name, flags=re.IGNORECASE)
    
    # Also remove 'APMC' before (F&V) if present
    normalized = re.sub(r'\s*APMC\s*(?=\(F&V\)|F&V)', '', normalized, flags=re.IGNORECASE)
    
    return normalized.strip()


# ----------------------------------------
# Dynamic model loader with normalization
# ----------------------------------------

def get_model_path(commodity, district, market):
    """
    Get model path using normalized market name
    This ensures both 'Narwal Jammu F&V' and 'Narwal Jammu F&V APMC'
    look for the same model file
    """
    # Normalize the market name first
    normalized_market = normalize_market_name(market)
    
    # Create safe filename from normalized name
    safe_market = normalized_market.replace(" ", "_").replace("(", "").replace(")", "")
    
    model_name = f"{commodity}_{district}_{safe_market}_xgb.pkl"
    
    # Also check for the non-normalized version as fallback
    if os.path.exists(model_name):
        return model_name
    
    # If normalized version doesn't exist, try the original (for backward compatibility)
    original_safe = market.replace(" ", "_").replace("(", "").replace(")", "")
    original_model = f"{commodity}_{district}_{original_safe}_xgb.pkl"
    
    if os.path.exists(original_model):
        print(f"  Using original model for {market} (normalized: {normalized_market})")
        return original_model
    
    return None


# ----------------------------------------
# Weighted Feature Engineering
# ----------------------------------------

def calculate_weighted_features(prices, dates, weights=None):
    """
    Calculate features with more weight on recent data
    Returns exactly 11 features to match model expectations
    """
    if len(prices) < 7:
        return None
    
    # Create time-based weights if not provided
    if weights is None and dates:
        # Calculate days from most recent
        latest_date = max(dates)
        days_old = [(latest_date - d).days for d in dates]
        
        # Exponential decay weights: more recent = higher weight
        # weight = exp(-decay_factor * days_old)
        decay_factor = 0.05  # Adjust this to control decay rate
        weights = np.exp(-decay_factor * np.array(days_old))
        weights = weights / weights.sum()  # Normalize
    
    # Convert to numpy arrays
    prices_array = np.array(prices)
    
    # Weighted moving averages
    if weights is not None:
        weighted_ma7 = np.average(prices_array[-7:], weights=weights[-7:]) if len(prices) >= 7 else np.mean(prices_array[-7:])
    else:
        weighted_ma7 = np.mean(prices_array[-7:])
    
    # Volatility
    volatility = float(np.std(prices_array[-7:])) if len(prices_array) >= 7 else 0
    
    # Return exactly 11 features as expected by the model
    features = [
        prices[-1],                          # lag1
        prices[-2] if len(prices) >= 2 else prices[-1],  # lag2
        prices[-3] if len(prices) >= 3 else prices[-1],  # lag3
        prices[-7] if len(prices) >= 7 else prices[0],   # lag7
        weighted_ma7,                         # ma7
        volatility,                            # volatility
        # The remaining 5 features will be added from weather/date data
    ]
    
    return features


# ----------------------------------------
# 7 DAY FORECAST FOR A SINGLE MARKET (FIXED FEATURE COUNT)
# ----------------------------------------

def forecast_market(dataset, model_path):
    """
    Forecast for a single market with recency weighting
    Uses exactly 11 features to match model expectations
    """
    model_data = joblib.load(model_path)
    model = model_data["model"]

    predictions = []
    
    # Extract dates for weighting
    dates = [d["date"] for d in dataset]
    prices = [float(d["modal_price"]) for d in dataset]
    
    # Calculate weights based on recency
    latest_date = max(dates)
    days_old = [(latest_date - d).days for d in dates]
    decay_factor = 0.03  # Controls how fast weights decay
    weights = np.exp(-decay_factor * np.array(days_old))
    weights = weights / weights.sum()  # Normalize

    for i in range(7):
        # Get weighted features (returns 6 price-based features)
        price_features = calculate_weighted_features(prices, dates, weights)
        
        if not price_features:
            # Fallback to simple features if weighted calculation fails
            price_features = [
                prices[-1],                    # lag1
                prices[-2] if len(prices) >= 2 else prices[-1],  # lag2
                prices[-3] if len(prices) >= 3 else prices[-1],  # lag3
                prices[-7] if len(prices) >= 7 else prices[0],   # lag7
                float(np.mean(prices[-7:])),    # ma7
                float(np.std(prices[-7:])) if len(prices) >= 7 else 0  # volatility
            ]
        
        last = dataset[-1]
        
        # Combine all 11 features:
        # 6 price-based features + 5 weather/date features = 11 total
        features = np.array([[
            price_features[0],  # lag1
            price_features[1],  # lag2
            price_features[2],  # lag3
            price_features[3],  # lag7
            price_features[4],  # ma7
            price_features[5],  # volatility
            last["temperature"],  # temperature
            last["rainfall"],     # rainfall
            last["date"].month,   # month
            last["date"].weekday(),  # weekday
            last["date"].day      # day
        ]])

        pred = float(model.predict(features)[0])
        
        # Apply recency bias to prediction
        if i == 0 and len(prices) >= 14:
            # Calculate recent trend (last 7 days vs previous 7 days)
            recent_avg = np.mean(prices[-7:])
            previous_avg = np.mean(prices[-14:-7])
            recent_trend = recent_avg - previous_avg
            
            # Adjust prediction based on trend (max 5% adjustment)
            trend_adjustment = min(max(recent_trend * 0.1, -pred * 0.05), pred * 0.05)
            pred = pred + trend_adjustment
        
        predictions.append(pred)

        # Update dataset for next iteration
        next_date = last["date"] + timedelta(days=1)
        dataset.append({
            "modal_price": float(pred),
            "temperature": last["temperature"],
            "rainfall": last["rainfall"],
            "date": next_date,
            "market": last["market"]
        })
        
        # Update prices and dates for next iteration
        prices.append(pred)
        dates.append(next_date)
        
        # Recalculate weights with new date
        latest_date = max(dates)
        days_old = [(latest_date - d).days for d in dates]
        weights = np.exp(-decay_factor * np.array(days_old))
        weights = weights / weights.sum()

    return predictions


# ----------------------------------------
# Group markets that are actually the same
# ----------------------------------------

def group_normalized_markets(markets_dict):
    """
    Group market data by normalized names
    This combines data from 'Narwal Jammu F&V' and 'Narwal Jammu F&V APMC'
    """
    grouped = {}
    normalization_map = {}  # Track which original markets map to which normalized
    
    for original_market, data in markets_dict.items():
        normalized = normalize_market_name(original_market)
        
        if normalized not in grouped:
            grouped[normalized] = []
            normalization_map[normalized] = []
        
        # Add all data from this market to the normalized group
        grouped[normalized].extend(data)
        normalization_map[normalized].append(original_market)
    
    # Sort each group by date
    for normalized in grouped:
        grouped[normalized].sort(key=lambda x: x["date"])
    
    return grouped, normalization_map


# ----------------------------------------
# AI FORECAST ENGINE
# ----------------------------------------

def run_ai_forecast(commodity, state, district):
    """
    Run AI forecast with market normalization and recency weighting
    Returns same structure as before - no changes to output format
    """
    dataset = build_training_dataset(
        commodity=commodity,
        state=state,
        district=district
    )

    if not dataset:
        return {"error": "No dataset found"}

    # Group by original market first
    original_markets = {}
    for row in dataset:
        original_markets.setdefault(row["market"], []).append(row)

    # Group by normalized market names
    normalized_markets, normalization_map = group_normalized_markets(original_markets)

    market_predictions = {}

    print("\n==============================")
    print("7 DAY PRICE FORECAST (Weighted by Recency)")
    print("==============================")

    # Show normalization info if any markets were grouped
    any_grouped = False
    for normalized, originals in normalization_map.items():
        if len(originals) > 1:
            any_grouped = True
            print(f"\n📊 Note: Combining data from:")
            for orig in originals:
                print(f"    • {orig}")
            print(f"    → Normalized as: {normalized}")
    
    if any_grouped:
        print("\n" + "-" * 30)

    # Process each normalized market group
    for normalized_market, data in normalized_markets.items():
        
        # Show data distribution by year
        years = {}
        for d in data:
            year = d["date"].year
            years[year] = years.get(year, 0) + 1
        
        print(f"\n📊 Data distribution for {normalized_market}:")
        for year, count in sorted(years.items()):
            weight_factor = np.exp(-0.03 * (datetime.now().year - year))
            print(f"    {year}: {count} records (weight factor: {weight_factor:.2f})")
        
        # Try to get model for this normalized market
        model_path = get_model_path(commodity, district, normalized_market)
        
        # If no model for normalized name, try using the first original market as fallback
        if not model_path and normalized_market in normalization_map:
            for original in normalization_map[normalized_market]:
                model_path = get_model_path(commodity, district, original)
                if model_path:
                    print(f"  Using model from {original} for {normalized_market}")
                    break
        
        if not model_path:
            print(f"\n⚠️ Skipping {normalized_market} (model not found)")
            # Show which variations we tried
            tried_names = [normalized_market] + normalization_map.get(normalized_market, [])
            print(f"  Tried models for: {', '.join(tried_names)}")
            continue

        # Sort data by date for this normalized group
        data.sort(key=lambda x: x["date"])
        
        forecast = forecast_market(data.copy(), model_path)

        # Store forecast under the normalized name
        market_predictions[normalized_market] = [float(p) for p in forecast]

        print(f"\n📈 Market: {normalized_market}")
        
        # Show which original markets contributed to this forecast
        if normalized_market in normalization_map and len(normalization_map[normalized_market]) > 1:
            print(f"  (Combined data from: {', '.join(normalization_map[normalized_market])})")
        
        # Show confidence based on data recency
        latest_date = max([d["date"] for d in data])
        days_since_latest = (datetime.now() - latest_date).days
        if days_since_latest <= 7:
            confidence = "High"
        elif days_since_latest <= 30:
            confidence = "Medium"
        else:
            confidence = "Low"
        
        print(f"  Confidence: {confidence} (last data: {latest_date.strftime('%Y-%m-%d')})")
        
        for i, p in enumerate(forecast, 1):
            print(f"  Day {i}: ₹{p:.2f}")

    if not market_predictions:
        return {"error": "No models available for this commodity"}

    # Use the most recent data for current price
    all_data_sorted = sorted(dataset, key=lambda x: x["date"], reverse=True)
    current_price = float(all_data_sorted[0]["modal_price"])

    recommendation = generate_recommendation(
        market_predictions,
        current_price
    )

    print("\n==============================")
    print("AI SELLING RECOMMENDATION")
    print("==============================")

    print("Action:", recommendation["action"])

    if recommendation["action"] == "WAIT":
        print("Sell after:", recommendation["sell_after_days"], "days")

    print("Best mandi:", recommendation["best_market"])
    print("Expected price:", recommendation["expected_price"])
    print("Expected profit:", recommendation["expected_profit"])

    print("\nReason:")

    for r in recommendation["explanation"]:
        print("•", r)

    return {
        "commodity": commodity,
        "state": state,
        "district": district,
        "current_price": float(current_price),
        "forecast": market_predictions,
        "recommendation": recommendation
    }


# ----------------------------------------
# Helper function for single market forecast (if needed by other files)
# ----------------------------------------
# ----------------------------------------
# Helper function for single market forecast (FIXED)
# ----------------------------------------

def forecast_single_market(commodity, state, district, market):
    """
    Get forecast for a specific market (handles normalization)
    This can be called by other files without changing their code
    """
    # First, normalize the input market name
    normalized_input = normalize_market_name(market)
    print(f"Looking for market: '{market}' -> normalized: '{normalized_input}'")
    
    # Get full forecast
    result = run_ai_forecast(commodity, state, district)
    
    if "error" in result:
        return result
    
    # Try to find forecast using normalized name
    # The forecasts are stored under normalized names in the result
    for forecast_market in result["forecast"]:
        # Normalize the forecast market name for comparison
        normalized_forecast = normalize_market_name(forecast_market)
        
        if normalized_forecast == normalized_input:
            print(f"✓ Found match: '{forecast_market}' for '{market}'")
            return {
                "market": market,
                "normalized_market": forecast_market,
                "forecast": result["forecast"][forecast_market],
                "current_price": result["current_price"],
                "recommendation": result["recommendation"]
            }
    
    # If still not found, try direct lookup
    if normalized_input in result["forecast"]:
        return {
            "market": market,
            "normalized_market": normalized_input,
            "forecast": result["forecast"][normalized_input],
            "current_price": result["current_price"],
            "recommendation": result["recommendation"]
        }
    
    # If all else fails, show available markets for debugging
    available_markets = list(result["forecast"].keys())
    print(f"Available markets: {available_markets}")
    print(f"Normalized versions: {[normalize_market_name(m) for m in available_markets]}")
    
    return {"error": f"No forecast found for {market}"}


# Also add a convenience function to get forecast by normalized name
def forecast_by_normalized_name(commodity, state, district, normalized_market):
    """
    Get forecast directly using normalized market name
    Useful when you already know the normalized name
    """
    result = run_ai_forecast(commodity, state, district)
    
    if "error" in result:
        return result
    
    if normalized_market in result["forecast"]:
        return {
            "market": normalized_market,
            "forecast": result["forecast"][normalized_market],
            "current_price": result["current_price"],
            "recommendation": result["recommendation"]
        }
    
    return {"error": f"No forecast found for {normalized_market}"}
    
# ----------------------------------------

if __name__ == "__main__":
    # Test with both variations - they should now both work!
    
    print("\n" + "="*60)
    print("TESTING WITH APMC VERSION")
    print("="*60)
    result_apmc = forecast_single_market(
        commodity="Banana",
        state="Jammu and Kashmir",
        district="Jammu",
        market="Narwal Jammu F&V APMC"  # With APMC
    )
    print("Result for APMC version:", result_apmc.get('forecast', 'Not found')[:3] if 'forecast' in result_apmc else "Error")
    
    print("\n" + "="*60)
    print("TESTING WITHOUT APMC VERSION")
    print("="*60)
    result_normal = forecast_single_market(
        commodity="Banana",
        state="Jammu and Kashmir",
        district="Jammu",
        market="Narwal Jammu F&V"  # Without APMC
    )
    print("Result for non-APMC version:", result_normal.get('forecast', 'Not found')[:3] if 'forecast' in result_normal else "Error")
    
    # Both should return the same forecast
    if 'forecast' in result_apmc and 'forecast' in result_normal:
        print("\n" + "="*60)
        print("FORECAST COMPARISON")
        print("="*60)
        print(f"APMC version forecast: {result_apmc['forecast'][:3]}...")
        print(f"Non-APMC version forecast: {result_normal['forecast'][:3]}...")
        print(f"Match: {result_apmc['forecast'] == result_normal['forecast']}")