import joblib
import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from dataset_builder import build_training_dataset
from collections import defaultdict


# ==============================
# Debug: Inspect dataset structure
# ==============================

def inspect_dataset(dataset, district):
    """Debug function to see what's in the dataset"""
    print(f"\n🔍 INSPECTING {district} DATASET:")
    print(f"Total records: {len(dataset)}")
    
    if len(dataset) == 0:
        print("  ❌ No records found!")
        return False
    
    # Show first record keys
    print(f"\nFirst record keys: {list(dataset[0].keys())}")
    
    # Show first record values (sample)
    print("\nFirst record sample:")
    for key, value in dataset[0].items():
        if key == 'date':
            print(f"  {key}: {value.strftime('%Y-%m-%d')}")
        else:
            print(f"  {key}: {value}")
    
    # Check if 'market' field exists
    has_market = 'market' in dataset[0]
    print(f"\nHas 'market' field: {has_market}")
    
    if has_market:
        # Get unique markets
        markets = {}
        for record in dataset:
            market = record.get('market', 'unknown')
            markets[market] = markets.get(market, 0) + 1
        
        print(f"\n📊 Market Distribution:")
        for market, count in sorted(markets.items(), key=lambda x: x[1], reverse=True):
            # Get price range for this market
            prices = [r['modal_price'] for r in dataset if r.get('market') == market]
            if prices:
                print(f"  • {market}: {count} records")
                print(f"    Price range: ₹{min(prices)} - ₹{max(prices)}")
                print(f"    Unique prices: {len(set(prices))}")
    
    # Check date range
    if 'date' in dataset[0]:
        dates = [r['date'] for r in dataset if 'date' in r]
        if dates:
            print(f"\n📅 Date range: {min(dates).strftime('%Y-%m-%d')} to {max(dates).strftime('%Y-%m-%d')}")
    
    return has_market


# ==============================
# Market-Specific Model Training
# ==============================

def train_market_specific_models(dataset, commodity, district):
    """
    Train separate models for each market
    """
    # Group by market
    market_data = defaultdict(list)
    
    for record in dataset:
        market = record.get('market', 'unknown')
        if market:
            market_data[market].append(record)
    
    if not market_data:
        print("  ⚠️ No market field found! Creating default market.")
        market_data['default'] = dataset
    
    models = {}
    results = {}
    
    print(f"\n📊 Found {len(market_data)} markets/groups")
    
    for market, records in market_data.items():
        if len(records) < 10:
            print(f"\n  📊 {market}: {len(records)} records - INSUFFICIENT DATA")
            avg_price = np.mean([r['modal_price'] for r in records]) if records else 0
            results[market] = {
                'status': 'insufficient_data',
                'records': len(records),
                'avg_price': avg_price
            }
            continue
        
        print(f"\n  📊 Training model for {market} ({len(records)} records)")
        
        # Sort by date
        records.sort(key=lambda x: x['date'])
        
        # Create features for this market
        X_market = []
        y_market = []
        
        for i in range(3, len(records)):
            try:
                features = [
                    records[i-1]["modal_price"],  # lag1
                    records[i-3]["modal_price"] if i >= 3 else records[i-1]["modal_price"],  # lag3
                    np.mean([records[j]["modal_price"] for j in range(max(0, i-3), i)]),  # MA3
                    records[i].get("temperature", 25),
                    records[i].get("rainfall", 0),
                    records[i]["date"].month,
                    records[i]["date"].weekday()
                ]
                
                X_market.append(features)
                y_market.append(records[i]["modal_price"])
                
            except Exception as e:
                continue
        
        X_market = np.array(X_market)
        y_market = np.array(y_market)
        
        if len(X_market) < 5:
            print(f"    ⚠️ Only {len(X_market)} valid samples, skipping")
            continue
        
        print(f"    Created {len(X_market)} training samples")
        
        # Train model
        if len(X_market) >= 10:
            X_train, X_test, y_train, y_test = train_test_split(
                X_market, y_market, test_size=0.2, shuffle=False
            )
        else:
            X_train, y_train = X_market, y_market
            X_test, y_test = X_market, y_market
        
        # Adjust model based on data size
        if len(X_train) < 20:
            model = XGBRegressor(
                n_estimators=30,
                learning_rate=0.1,
                max_depth=2,
                random_state=42
            )
        else:
            model = XGBRegressor(
                n_estimators=50,
                learning_rate=0.1,
                max_depth=3,
                random_state=42
            )
        
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        
        # Calculate baseline MAE (predicting mean)
        baseline_pred = np.full_like(y_test, np.mean(y_train))
        baseline_mae = mean_absolute_error(y_test, baseline_pred)
        
        print(f"    Test MAE: {mae:.2f}")
        print(f"    Baseline MAE (mean): {baseline_mae:.2f}")
        
        if baseline_mae > 0:
            improvement = (baseline_mae - mae) / baseline_mae * 100
            print(f"    Improvement: {improvement:.1f}%")
        
        # Save model
        safe_market = market.replace(' ', '_').replace('(', '').replace(')', '').replace('&', 'and')[:30]
        model_name = f"{commodity}_{district}_{safe_market}_xgb.pkl"
        joblib.dump(model, model_name)
        print(f"    Model saved as: {model_name}")
        
        models[market] = model
        results[market] = {
            'status': 'trained',
            'records': len(records),
            'samples': len(X_market),
            'mae': mae,
            'baseline_mae': baseline_mae,
            'model_file': model_name
        }
    
    return models, results


# ==============================
# Constant Price Detector
# ==============================

def detect_constant_markets(dataset, threshold=50):
    """
    Identify markets with constant or nearly constant prices
    """
    market_prices = defaultdict(list)
    
    for record in dataset:
        market = record.get('market', 'unknown')
        if market:
            market_prices[market].append(record['modal_price'])
    
    if not market_prices:
        print("  No market data found for constant price detection")
        return {}
    
    constant_markets = {}
    
    print("\n📊 Analyzing price constancy:")
    
    for market, prices in market_prices.items():
        price_range = max(prices) - min(prices)
        unique_prices = len(set(prices))
        avg_price = np.mean(prices)
        
        print(f"  {market}: {len(prices)} records, range: ₹{price_range}, unique: {unique_prices}")
        
        if unique_prices == 1:
            constant_markets[market] = {
                'type': 'perfectly_constant',
                'price': prices[0],
                'records': len(prices)
            }
            print(f"    ✅ PERFECTLY CONSTANT at ₹{prices[0]}")
        elif price_range < threshold:
            constant_markets[market] = {
                'type': 'nearly_constant',
                'avg_price': avg_price,
                'range': price_range,
                'records': len(prices)
            }
            print(f"    🟡 NEARLY CONSTANT (range ₹{price_range})")
    
    return constant_markets


# ==============================
# Simple Rule-Based Predictor for Constant Markets
# ==============================

class ConstantMarketPredictor:
    """Simple predictor for constant price markets"""
    def __init__(self, price):
        self.price = price
    
    def predict(self, features):
        if isinstance(features, np.ndarray):
            return np.full(len(features) if len(features.shape) > 1 else 1, self.price)
        return self.price


# ==============================
# MAIN TRAINING PIPELINE
# ==============================

if __name__ == "__main__":
    
    # Configuration
    commodity = "Banana"
    
    # Train for each district
    districts = [
        ("Punjab", "Ludhiana"),
        ("Jammu and Kashmir", "Jammu"),
        ("Jammu and Kashmir", "Kathua"),
        ("Punjab", "Pathankot")
    ]
    
    all_results = {}
    
    for state, district in districts:
        print("\n" + "="*70)
        print(f"TRAINING FOR {district}, {state}")
        print("="*70)
        
        print("\nBuilding dataset with market info...")
        # Explicitly request market info
        dataset = build_training_dataset(
            commodity=commodity, 
            state=state, 
            district=district,
            include_market=True  # Explicit is better than implicit
        )
        
        if not dataset:
            print(f"❌ No data for {district}")
            continue
            
        print(f"Total records: {len(dataset)}")
        
        # DEBUG: Inspect dataset structure
        has_market = inspect_dataset(dataset, district)
        
        if not has_market:
            print("\n⚠️ No market field found! This shouldn't happen with updated dataset_builder.")
            print("Please check that dataset_builder.py is updated correctly.")
            # Create synthetic market for debugging
            for i, record in enumerate(dataset):
                record['market'] = f"{district}_market_{i % 2 + 1}"
        
        # Step 1: Detect constant markets
        print("\nAnalyzing markets for constant prices...")
        constant_markets = detect_constant_markets(dataset)
        
        # Step 2: Train market-specific models
        print("\nTraining market-specific models...")
        models, results = train_market_specific_models(dataset, commodity, district)
        
        # Step 3: Create constant price predictors
        constant_predictors = {}
        for market, info in constant_markets.items():
            if info['type'] == 'perfectly_constant':
                constant_predictors[market] = ConstantMarketPredictor(info['price'])
                print(f"\n✅ Created constant predictor for {market} at ₹{info['price']}")
        
        all_results[f"{district}"] = {
            'constant_markets': constant_markets,
            'trained_models': results,
            'constant_predictors': list(constant_predictors.keys())
        }
        
        # Step 4: Summary
        print("\n" + "-"*50)
        print(f"SUMMARY FOR {district}:")
        print("-"*50)
        
        # Constant markets (no ML needed)
        if constant_markets:
            for market, info in constant_markets.items():
                if info['type'] == 'perfectly_constant':
                    print(f"✅ {market}: Use constant ₹{info['price']} (0 MAE)")
                else:
                    print(f"🟡 {market}: Nearly constant (range ₹{info['range']}), could use average")
        else:
            print("No constant markets detected")
        
        # Trained models
        if results:
            for market, info in results.items():
                if info['status'] == 'trained':
                    print(f"📊 {market}: MAE ₹{info['mae']:.2f} ({info['records']} records)")
                else:
                    print(f"⚠️ {market}: {info['status']} ({info['records']} records, avg ₹{info['avg_price']:.0f})")
        else:
            print("No models trained")
    
    # Print overall summary
    print("\n" + "="*70)
    print("FINAL SUMMARY")
    print("="*70)
    
    for district, results in all_results.items():
        trained_count = len([m for m in results['trained_models'].values() 
                           if m.get('status') == 'trained'])
        constant_count = len(results['constant_markets'])
        constant_predictors = len(results.get('constant_predictors', []))
        
        print(f"\n{district}:")
        print(f"  - Constant markets detected: {constant_count}")
        print(f"  - Constant predictors created: {constant_predictors}")
        print(f"  - ML models trained: {trained_count}")
        
        # Show which markets are constant
        if results['constant_markets']:
            print(f"  - Constant markets: {', '.join(results['constant_markets'].keys())}")