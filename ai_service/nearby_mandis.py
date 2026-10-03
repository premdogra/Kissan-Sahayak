# import pandas as pd

# mandis = pd.read_csv("mandi_coordinates.csv")

# # Convert coordinates safely
# mandis["Latitude"] = pd.to_numeric(mandis["Latitude"], errors="coerce")
# mandis["Longitude"] = pd.to_numeric(mandis["Longitude"], errors="coerce")

# from geopy.distance import geodesic

# def get_nearby_mandis(user_lat, user_lon, top_k=5):

#     # Ignore mandis without coordinates
#     valid_mandis = mandis.dropna(subset=["Latitude", "Longitude"]).copy()

#     user_location = (user_lat, user_lon)

#     valid_mandis["distance_km"] = valid_mandis.apply(
#         lambda row: geodesic(
#             user_location,
#             (row["Latitude"], row["Longitude"])
#         ).km,
#         axis=1
#     )

#     nearest = valid_mandis.sort_values("distance_km")

#     return nearest.head(top_k)[
#         ["Market","District","State","distance_km"]
#     ]

# # result = get_nearby_mandis(32.7266, 74.8570)

# # print(result)

import pandas as pd
import re

# Market name normalization function (same as in dataset_builder and forecast)
def normalize_market_name(market_name):
    """
    Simple function to remove 'APMC' from the end of market names
    Must match exactly with dataset_builder and forecast normalization
    """
    if not market_name or not isinstance(market_name, str):
        return market_name
    
    # Remove 'APMC' from the end (case insensitive)
    normalized = re.sub(r'\s*APMC\s*$', '', market_name, flags=re.IGNORECASE)
    
    # Also remove 'APMC' before (F&V) if present
    normalized = re.sub(r'\s*APMC\s*(?=\(F&V\)|F&V)', '', normalized, flags=re.IGNORECASE)
    
    return normalized.strip()


# Load mandi coordinates
mandis = pd.read_csv("mandi_coordinates.csv")

# Convert coordinates safely
mandis["Latitude"] = pd.to_numeric(mandis["Latitude"], errors="coerce")
mandis["Longitude"] = pd.to_numeric(mandis["Longitude"], errors="coerce")

# Add normalized market name column (for internal deduplication only)
mandis["Normalized_Market"] = mandis["Market"].apply(normalize_market_name)

from geopy.distance import geodesic

def get_nearby_mandis(user_lat, user_lon, top_k=5):
    """
    Get nearby mandis with deduplication of APMC/non-APMC variations
    Returns same structure as before - no changes to output format
    """

    # Ignore mandis without coordinates
    valid_mandis = mandis.dropna(subset=["Latitude", "Longitude"]).copy()

    user_location = (user_lat, user_lon)

    # Calculate distance for each mandi
    valid_mandis["distance_km"] = valid_mandis.apply(
        lambda row: geodesic(
            user_location,
            (row["Latitude"], row["Longitude"])
        ).km,
        axis=1
    )

    # Sort by distance
    sorted_mandis = valid_mandis.sort_values("distance_km")

    # Deduplicate by normalized name - keep the closest one
    seen_normalized = set()
    unique_mandis = []
    
    for _, row in sorted_mandis.iterrows():
        normalized = row["Normalized_Market"]
        
        # If we haven't seen this normalized market before, add it
        if normalized not in seen_normalized:
            seen_normalized.add(normalized)
            unique_mandis.append({
                "Market": row["Market"],  # Keep original market name for output
                "District": row["District"],
                "State": row["State"],
                "distance_km": row["distance_km"]
            })
        
        # Stop when we have top_k unique mandis
        if len(unique_mandis) >= top_k:
            break
    
    # Convert to DataFrame for consistent return type
    result_df = pd.DataFrame(unique_mandis)
    
    # If we don't have enough mandis, add more (without deduplication)
    if len(result_df) < top_k:
        remaining = sorted_mandis[~sorted_mandis.index.isin(
            [m["Market"] for m in unique_mandis]
        )].head(top_k - len(result_df))
        
        for _, row in remaining.iterrows():
            result_df = pd.concat([result_df, pd.DataFrame([{
                "Market": row["Market"],
                "District": row["District"],
                "State": row["State"],
                "distance_km": row["distance_km"]
            }])], ignore_index=True)
    
    return result_df[["Market", "District", "State", "distance_km"]]


# Optional: Function to get raw nearby mandis without deduplication
def get_nearby_mandis_raw(user_lat, user_lon, top_k=5):
    """
    Original function without deduplication
    Kept for backward compatibility if needed
    """
    valid_mandis = mandis.dropna(subset=["Latitude", "Longitude"]).copy()
    user_location = (user_lat, user_lon)
    
    valid_mandis["distance_km"] = valid_mandis.apply(
        lambda row: geodesic(
            user_location,
            (row["Latitude"], row["Longitude"])
        ).km,
        axis=1
    )
    
    nearest = valid_mandis.sort_values("distance_km")
    return nearest.head(top_k)[["Market", "District", "State", "distance_km"]]


# Optional: Debug function to see normalization in action
def debug_nearby_mandis(user_lat, user_lon, top_k=10):
    """
    Debug version that shows normalization info
    """
    valid_mandis = mandis.dropna(subset=["Latitude", "Longitude"]).copy()
    user_location = (user_lat, user_lon)
    
    valid_mandis["distance_km"] = valid_mandis.apply(
        lambda row: geodesic(
            user_location,
            (row["Latitude"], row["Longitude"])
        ).km,
        axis=1
    )
    
    sorted_mandis = valid_mandis.sort_values("distance_km").head(top_k)
    
    print("\n=== Nearby Mandis with Normalization ===")
    print(f"{'Original Market':<30} {'Normalized':<30} {'Distance':<10}")
    print("-" * 70)
    
    for _, row in sorted_mandis.iterrows():
        print(f"{row['Market']:<30} {row['Normalized_Market']:<30} {row['distance_km']:<10.2f}")
    
    # Show deduplication
    print("\n=== After Deduplication (Top 5) ===")
    result = get_nearby_mandis(user_lat, user_lon, top_k=5)
    print(result)
    
    return result


# Test the function
if __name__ == "__main__":
    # Test with Jammu coordinates
    result = get_nearby_mandis(32.7266, 74.8570)
    print("\n=== Nearby Mandis Result ===")
    print(result)
    
    # Debug version to see normalization
    debug_nearby_mandis(32.7266, 74.8570)