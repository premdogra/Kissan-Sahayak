import os
import json
import re
import logging
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import requests

# Import our REST client
from sarvam_rest_client import SarvamRESTClient

# Import all MarketPulse functions (exactly as used in main.py)
from forecast_7_days import run_ai_forecast
from mandi_comparison import compare_mandis
from recommendation_engine import generate_recommendation
from nearby_mandis import get_nearby_mandis
from mandi_price_service import get_mandi_price
from mandi_history_service import get_last_7_mandi_prices
from nearby_prices import get_nearby_mandi_prices

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load mandi coordinates at startup
try:
    MANDI_COORDS = pd.read_csv("mandi_coordinates.csv")
    # Convert to numeric
    MANDI_COORDS["Latitude"] = pd.to_numeric(MANDI_COORDS["Latitude"], errors="coerce")
    MANDI_COORDS["Longitude"] = pd.to_numeric(MANDI_COORDS["Longitude"], errors="coerce")
    # Drop rows with invalid coordinates
    MANDI_COORDS = MANDI_COORDS.dropna(subset=["Latitude", "Longitude"])
    logger.info(f"✅ Loaded {len(MANDI_COORDS)} mandi coordinates")
except Exception as e:
    logger.error(f"⚠️ Failed to load mandi coordinates: {e}")
    MANDI_COORDS = None


class ChatbotService:
    """
    Enhanced Sarvam AI powered chatbot service for MarketPulse
    Integrates all existing routes and makes conversation dynamic
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("SARVAM_API_KEY")
        
        if not self.api_key:
            logger.warning("⚠️ No Sarvam API key provided. Chatbot will use fallback responses.")
            logger.warning("Get your API key from: https://dashboard.sarvam.ai/key-management")
            self.client = None
            self.api_available = False
        else:
            try:
                # Initialize REST client
                self.client = SarvamRESTClient(self.api_key)
                self.api_available = True
                logger.info("✅ Sarvam API client initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Sarvam client: {e}")
                self.client = None
                self.api_available = False
        
        # Available voices
        self.voices = {
            "hi-IN": {"female": "anushka", "male": "abhilash"},
            "pa-IN": {"female": "anushka", "male": "abhilash"},
            "en-IN": {"female": "vidya", "male": "karun"},
            "default": "anushka"
        }
        
        # Common commodities in India (for entity extraction)
        self.commodities = {
            "wheat": "Wheat", "गेहूं": "Wheat", "कणक": "Wheat", "gehu": "Wheat",
            "rice": "Rice", "चावल": "Rice", "ਚੌਲ": "Rice", "chawal": "Rice",
            "potato": "Potato", "आलू": "Potato", "आलुओं": "Potato", "ਆਲੂ": "Potato", "aloo": "Potato",
            "onion": "Onion", "प्याज": "Onion", "प्याजों": "Onion", "ਪਿਆਜ": "Onion", "ਪਿਆਜ਼": "Onion", "pyaaz": "Onion",
            "tomato": "Tomato", "टमाटर": "Tomato", "टमाटरों": "Tomato", "ਟਮਾਟਰ": "Tomato", "tamatar": "Tomato",
            "banana": "Banana", "केला": "Banana", "केले": "Banana", "केलों": "Banana", "ਕੇਲਾ": "Banana", "ਕੇਲੇ": "Banana", "kela": "Banana", "kele": "Banana",
            "carrot": "Carrot", "गाजर": "Carrot", "ਗਾਜਰ": "Carrot", "gaajar": "Carrot",
            "cauliflower": "Cauliflower", "फूलगोभी": "Cauliflower", "ਫੁੱਲ ਗੋਭੀ": "Cauliflower", "phool gobhi": "Cauliflower",
            "cabbage": "Cabbage", "पत्ता गोभी": "Cabbage", "ਬੰਦ ਗੋਭੀ": "Cabbage", "patta gobhi": "Cabbage",
            "brinjal": "Brinjal", "बैंगन": "Brinjal", "ਬੈਂਗਣ": "Brinjal", "baingan": "Brinjal",
            "ladyfinger": "Ladyfinger", "भिंडी": "Ladyfinger", "ਭਿੰਡੀ": "Ladyfinger", "bhindi": "Ladyfinger",
            "garlic": "Garlic", "लहसुन": "Garlic", "ਲਸਣ": "Garlic", "lahsun": "Garlic",
            "ginger": "Ginger", "अदरक": "Ginger", "ਅਦਰਕ": "Ginger", "adrak": "Ginger",
            "chilli": "Chilli", "मिर्च": "Chilli", "ਮਿਰਚ": "Chilli", "mirch": "Chilli",
            "peas": "Peas", "मटर": "Peas", "ਮਟਰ": "Peas", "matar": "Peas",
            "spinach": "Spinach", "पालक": "Spinach", "ਪਾਲਕ": "Spinach", "palak": "Spinach",
            "fenugreek": "Fenugreek", "मेथी": "Fenugreek", "ਮੇਥੀ": "Fenugreek", "methi": "Fenugreek",
            "coriander": "Coriander", "धनिया": "Coriander", "ਧਨੀਆ": "Coriander", "dhania": "Coriander",
            "mango": "Mango", "आम": "Mango", "ਅੰਬ": "Mango", "aam": "Mango",
            "apple": "Apple", "सेब": "Apple", "ਸੇਬ": "Apple", "seb": "Apple",
            "orange": "Orange", "संतरा": "Orange", "ਸੰਤਰਾ": "Orange", "santara": "Orange"
        }
        
        # Common districts/states in India (for entity extraction) - EXPANDED
        self.locations = {
            # Jammu & Kashmir
            "jammu": {"district": "Jammu", "state": "Jammu and Kashmir"},
            "जम्मू": {"district": "Jammu", "state": "Jammu and Kashmir"},
            "ਜੰਮੂ": {"district": "Jammu", "state": "Jammu and Kashmir"},
            "batote": {"district": "Batote", "state": "Jammu and Kashmir"},
            "बटोत": {"district": "Batote", "state": "Jammu and Kashmir"},
            "ਬਟੋਤ": {"district": "Batote", "state": "Jammu and Kashmir"},
            "srinagar": {"district": "Srinagar", "state": "Jammu and Kashmir"},
            
            # Punjab
            "jalandhar": {"district": "Jalandhar", "state": "Punjab"},
            "जालंधर": {"district": "Jalandhar", "state": "Punjab"},
            "ਜਲੰਧਰ": {"district": "Jalandhar", "state": "Punjab"},
            "jullundur": {"district": "Jalandhar", "state": "Punjab"},
            "ludhiana": {"district": "Ludhiana", "state": "Punjab"},
            "लुधियाना": {"district": "Ludhiana", "state": "Punjab"},
            "ਲੁਧਿਆਣਾ": {"district": "Ludhiana", "state": "Punjab"},
            "amritsar": {"district": "Amritsar", "state": "Punjab"},
            "अमृतसर": {"district": "Amritsar", "state": "Punjab"},
            "ਅੰਮ੍ਰਿਤਸਰ": {"district": "Amritsar", "state": "Punjab"},
            "patiala": {"district": "Patiala", "state": "Punjab"},
            "bathinda": {"district": "Bathinda", "state": "Punjab"},
            "mohali": {"district": "Mohali", "state": "Punjab"},
            
            # Delhi
            "delhi": {"district": "Delhi", "state": "Delhi"},
            "दिल्ली": {"district": "Delhi", "state": "Delhi"},
            "ਦਿੱਲੀ": {"district": "Delhi", "state": "Delhi"},
            "azadpur": {"district": "Delhi", "state": "Delhi", "market": "Azadpur"},
            
            # Haryana
            "gurugram": {"district": "Gurugram", "state": "Haryana"},
            "faridabad": {"district": "Faridabad", "state": "Haryana"},
            "ambala": {"district": "Ambala", "state": "Haryana"},
            
            # Uttar Pradesh
            "agra": {"district": "Agra", "state": "Uttar Pradesh"},
            "lucknow": {"district": "Lucknow", "state": "Uttar Pradesh"},
            "kanpur": {"district": "Kanpur", "state": "Uttar Pradesh"},
        }
        
        # Default user location (will be updated based on query)
        self.user_lat = 32.7266  # Jammu default
        self.user_lon = 74.8570
        
        logger.info("✅ Enhanced ChatbotService initialized with all route integrations")
    
    def get_available_voices(self) -> Dict:
        """Get available voices for each language"""
        return self.voices
    
    def _get_district_coordinates(self, district: str) -> Tuple[float, float]:
        """
        Get coordinates for a district by averaging mandi coordinates in that district
        """
        if MANDI_COORDS is None or MANDI_COORDS.empty:
            # Fallback to default coordinates if file not available
            fallback_coords = {
                "Jalandhar": (31.3260, 75.5762),
                "Jammu": (32.7266, 74.8570),
                "Ludhiana": (30.9010, 75.8573),
                "Amritsar": (31.6340, 74.8723),
                "Delhi": (28.7041, 77.1025),
                "Batote": (33.1167, 75.3167),
                "Srinagar": (34.0837, 74.7973),
                "Patiala": (30.3398, 76.3869),
                "Bathinda": (30.2110, 74.9455),
                "Mohali": (30.7046, 76.7179),
                "Gurugram": (28.4595, 77.0266),
                "Faridabad": (28.4089, 77.3178),
                "Ambala": (30.3752, 76.7821),
                "Agra": (27.1767, 78.0081),
                "Lucknow": (26.8467, 80.9462),
                "Kanpur": (26.4499, 80.3319),
            }
            return fallback_coords.get(district, (32.7266, 74.8570))
        
        # Filter mandis in this district (case-insensitive)
        district_mask = MANDI_COORDS["District"].str.lower() == district.lower()
        district_mandis = MANDI_COORDS[district_mask]
        
        if len(district_mandis) > 0:
            # Use average of mandi coordinates in the district
            avg_lat = district_mandis["Latitude"].mean()
            avg_lon = district_mandis["Longitude"].mean()
            logger.info(f"Found {len(district_mandis)} mandis in {district}, using avg coordinates: ({avg_lat:.4f}, {avg_lon:.4f})")
            return (avg_lat, avg_lon)
        
        # If no mandis found in district, try to find by state or use fallback
        logger.warning(f"No mandis found in {district}, using fallback")
        fallback_coords = {
            "Jalandhar": (31.3260, 75.5762),
            "Jammu": (32.7266, 74.8570),
            "Ludhiana": (30.9010, 75.8573),
            "Amritsar": (31.6340, 74.8723),
            "Delhi": (28.7041, 77.1025),
            "Batote": (33.1167, 75.3167),
        }
        return fallback_coords.get(district, (32.7266, 74.8570))
    
    def _extract_context_from_history(self, messages: List[Dict], current_entities: Dict) -> Dict:
        """
        If current query is missing commodity or intent, try to fill from recent conversation history.
        e.g. Bot asked "Which district?" and user replied "Mohali" — carry forward commodity+intent.
        """
        if not messages or len(messages) < 2:
            return current_entities

        # Only fill in missing fields from history
        needs_commodity = not current_entities.get("commodity")
        needs_intent = not current_entities.get("intent")
        needs_district = not current_entities.get("district")

        # Nothing missing — no need to look at history
        if not (needs_commodity or needs_intent):
            return current_entities

        # Walk back through previous messages to find commodity/intent
        for msg in reversed(messages[:-1]):  # exclude current message
            if msg.get("role") != "user":
                continue
            past_entities = self._extract_entities(msg.get("content", ""))
            if needs_commodity and past_entities.get("commodity"):
                current_entities["commodity"] = past_entities["commodity"]
                logger.info(f"Carried commodity from history: {past_entities['commodity']}")
                needs_commodity = False
            if needs_intent and past_entities.get("intent"):
                current_entities["intent"] = past_entities["intent"]
                logger.info(f"Carried intent from history: {past_entities['intent']}")
                needs_intent = False
            if needs_district and past_entities.get("district"):
                current_entities["district"] = past_entities["district"]
                current_entities["state"] = past_entities.get("state")
                logger.info(f"Carried district from history: {past_entities['district']}")
                needs_district = False
            if not needs_commodity and not needs_intent:
                break

        return current_entities

    def _extract_entities(self, query: str) -> Dict[str, Any]:
        """Extract entities like commodity, location, market from user query"""
        entities = {
            "commodity": None,
            "district": None,
            "state": None,
            "market": None,
            "intent": None
        }
        
        query_lower = query.lower()
        
        # Log the query for debugging
        logger.info(f"Extracting entities from: {query}")
        
        # First, check for location in "near X" or "in X" patterns
        location_patterns = [
            r'near\s+(\w+)',
            r'in\s+(\w+)',
            r'at\s+(\w+)',
            r'around\s+(\w+)',
            r'(\S+)\s+के पास',   # Hindi: "लुधियाना के पास" - location comes BEFORE के पास
            r'(\S+)\s+में',       # Hindi: "लुधियाना में"
            r'(\S+)\s+ਵਿੱਚ',     # Punjabi: "ਲੁਧਿਆਣਾ ਵਿੱਚ"
            r'(\S+)\s+ਨੇੜੇ',     # Punjabi: "ਲੁਧਿਆਣਾ ਨੇੜੇ"
            r'के पास\s+(\S+)',
            r'ਵਿੱਚ\s+(\S+)',
            r'में\s+(\S+)',
            r'ਨੇੜੇ\s+(\S+)'
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, query_lower)
            if match:
                possible_location = match.group(1)
                # Check against your locations dictionary (use lower() for English, as-is for Hindi/Punjabi)
                for key, value in self.locations.items():
                    if key in possible_location.lower() or possible_location.lower() in key or key in possible_location or possible_location in key:
                        entities["district"] = value["district"]
                        entities["state"] = value["state"]
                        logger.info(f"Found location from pattern: {entities['district']}")
                        break
                if entities["district"]:
                    break
        
        # If location not found from patterns, check direct keywords
        if not entities["district"]:
            for key, value in self.locations.items():
                if key in query_lower:
                    entities["district"] = value["district"]
                    entities["state"] = value["state"]
                    if "market" in value:
                        entities["market"] = value["market"]
                    logger.info(f"Found location from keyword: {value['district']}")
                    break
        
        # Extract commodity - use word boundaries for ASCII keys only
        # Hindi/Punjabi keys use simple substring match (\b doesn't work with Unicode)
        for key, value in self.commodities.items():
            is_ascii = all(ord(c) < 128 for c in key)
            if is_ascii:
                matched = bool(re.search(r'\b' + re.escape(key) + r'\b', query_lower))
            else:
                matched = key in query_lower
            if matched:
                entities["commodity"] = value
                logger.info(f"Found commodity: {value}")
                break
        
        # If commodity not found, try pattern matching
        if not entities["commodity"]:
            # Look for patterns like "price of X" or "X ka bhav"
            patterns = [
                r'price of (\w+)',
                r'price for (\w+)',
                r'(\w+)\s+ka\s+bhav',
                r'(\w+)\s+ਦਾ\s+ਭਾਵ',
                r'(\w+)\s+का\s+भाव'
            ]
            for pattern in patterns:
                match = re.search(pattern, query_lower)
                if match:
                    possible_commodity = match.group(1)
                    # Check if it matches any commodity (whole word)
                    for key, value in self.commodities.items():
                        is_ascii = all(ord(c) < 128 for c in key)
                        if is_ascii:
                            matched = bool(re.search(r'\b' + re.escape(key) + r'\b', possible_commodity))
                        else:
                            matched = key in possible_commodity
                        if matched:
                            entities["commodity"] = value
                            logger.info(f"Found commodity from pattern: {value}")
                            break
                    if entities["commodity"]:
                        break
        
        # If still no commodity found, try to extract the word after "price of" or similar
        if not entities["commodity"]:
            # Look for common patterns in the query
            words = query_lower.split()
            for i, word in enumerate(words):
                if word in ["price", "भाव", "rate", "cost"] and i+1 < len(words):
                    potential = words[i+1]
                    # Check if this potential commodity is in our list (whole word)
                    for key, value in self.commodities.items():
                        is_ascii = all(ord(c) < 128 for c in key)
                        if is_ascii:
                            matched = bool(re.search(r'\b' + re.escape(key) + r'\b', potential))
                        else:
                            matched = key in potential
                        if matched:
                            entities["commodity"] = value
                            logger.info(f"Found commodity from position: {value}")
                            break
        
        # Determine intent
        price_keywords = ["price", "भाव", "कीमत", "ਰੇਟ", "rate", "cost", "मूल्य", "कितना", "ਕਿੰਨਾ"]
        forecast_keywords = ["forecast", "predict", "future", "अनुमान", "भविष्य", "ਭਵਿੱਖ", "prediction"]
        history_keywords = ["history", "past", "previous", "last", "पिछले", "ਪਿਛਲੇ", "trend", "graph"]
        nearby_keywords = ["nearby", "पास", "ਨੇੜੇ", "close", "आसपास", "near", "around"]
        
        has_price = any(k in query_lower for k in price_keywords) or entities["commodity"]
        has_nearby = any(k in query_lower for k in nearby_keywords) or "near" in query_lower

        if any(k in query_lower for k in forecast_keywords):
            entities["intent"] = "forecast"
        elif any(k in query_lower for k in history_keywords):
            entities["intent"] = "history"
        elif has_price and has_nearby:
            # e.g. "लुधियाना के पास मंडियों में केले के भाव" - wants prices, not just mandis
            entities["intent"] = "price"
        elif has_nearby:
            entities["intent"] = "nearby"
        elif has_price:
            entities["intent"] = "price"
        
        logger.info(f"Final extracted entities: {entities}")
        return entities
    
    def _get_price_info(self, commodity: str, district: str, state: str, market: str = None) -> Optional[Dict]:
        """Get current price for a commodity"""
        try:
            logger.info(f"Getting price info for {commodity} in {district}, {state}")
            
            if market:
                # Get price for specific market
                result = get_mandi_price(
                    market=market,
                    commodity=commodity,
                    state=state,
                    district=district
                )
                logger.info(f"Specific market result: {result}")
                return {"type": "specific", "data": result, "location": district}
            else:
                # Get district coordinates from mandi file
                lat, lon = self._get_district_coordinates(district)
                logger.info(f"Using coordinates for {district}: ({lat:.4f}, {lon:.4f})")
                
                # Update user location for this session
                self.user_lat = lat
                self.user_lon = lon
                
                # Get nearby mandi prices - PASS THE CORRECT COMMODITY
                result = get_nearby_mandi_prices(
                    lat=lat,
                    lon=lon,
                    commodity=commodity
                )
                logger.info(f"Nearby prices result for {district}: {len(result) if result else 0} records")
                
                if result and len(result) > 0:
                    return {"type": "nearby", "data": result, "location": district}
                else:
                    logger.info(f"No results for {district}, trying with expanded search")
                    return {"type": "nearby", "data": [], "location": district}
        except Exception as e:
            logger.error(f"Price info error: {e}")
            return None
    
    def _get_forecast_info(self, commodity: str, district: str, state: str) -> Optional[Dict]:
        """Get forecast for a commodity"""
        try:
            result = run_ai_forecast(
                commodity=commodity,
                state=state,
                district=district
            )
            if "error" not in result:
                return result
            return None
        except Exception as e:
            logger.error(f"Forecast error: {e}")
            return None
    
    def _get_history_info(self, commodity: str, market: str, district: str = None) -> Optional[Dict]:
        """Get price history for a commodity in a market or district"""
        try:
            if not market and not district:
                return None
            logger.info(f"Getting history for {commodity} in {market or district}")
            # Retry once on timeout before giving up
            for attempt in range(2):
                try:
                    # Pass market only if it's a real market name, not a district name
                    result = get_last_7_mandi_prices(market, commodity)
                    if result:
                        return {"market": market or district, "commodity": commodity, "history": result}
                    return None
                except requests.exceptions.ReadTimeout:
                    if attempt == 0:
                        logger.warning(f"History API timed out for {commodity} in {market or district}, retrying...")
                    else:
                        logger.error(f"History API timed out after retry for {commodity} in {market or district}")
                        return None
        except Exception as e:
            logger.error(f"History error: {e}")
            return None
    
    def _get_nearby_mandis(self, district: str = None) -> Optional[List[Dict]]:
        """Get nearby mandis based on user location or specified district"""
        try:
            lat = self.user_lat
            lon = self.user_lon
            
            # If district is provided, get its coordinates
            if district:
                lat, lon = self._get_district_coordinates(district)
                logger.info(f"Getting mandis near {district} at ({lat:.4f}, {lon:.4f})")
            
            result = get_nearby_mandis(lat, lon)
            if not result.empty:
                return result.to_dict('records')
            return None
        except Exception as e:
            logger.error(f"Nearby mandis error: {e}")
            return None
    
    def _get_comparison_info(self, commodity: str, district: str, state: str) -> Optional[Dict]:
        """Compare mandis for best price"""
        try:
            result = compare_mandis(
                commodity=commodity,
                state=state,
                district=district,
                transport_cost=50  # Default transport cost
            )
            if "error" not in result:
                return result
            return None
        except Exception as e:
            logger.error(f"Comparison error: {e}")
            return None
    
    def _get_recommendation(self, commodity: str, district: str, state: str) -> Optional[Dict]:
        """Get selling recommendation"""
        try:
            result = run_ai_forecast(
                commodity=commodity,
                state=state,
                district=district
            )
            if "error" not in result and "recommendation" in result:
                return result["recommendation"]
            return None
        except Exception as e:
            logger.error(f"Recommendation error: {e}")
            return None
    
    def _format_price_response(self, price_info: Optional[Dict], entities: Dict) -> str:
        """Format price information into readable response"""
        if not price_info or not price_info.get("data"):
            location = entities.get('district', 'your area')
            commodity = entities.get('commodity', 'this commodity')
            return f"Sorry, I couldn't find price information for {commodity} near {location}. Please try another location or commodity."
        
        commodity = entities.get('commodity', 'the commodity')
        district = entities.get('district', 'your area')
        
        if price_info["type"] == "specific":
            data = price_info["data"]
            # get_mandi_price() returns a list of records with lowercase field names
            record = data[0] if isinstance(data, list) and data else data if isinstance(data, dict) else None
            price_val = record.get('modal_price') if isinstance(record, dict) else None
            if price_val:
                market_name = record.get('market') or entities.get('market', district)
                return f"Current price of {commodity} in {market_name} is ₹{price_val} per quintal."
            else:
                return f"Could not fetch specific price for {commodity} in {district}."
        
        else:  # nearby prices
            data = price_info["data"]
            location_used = price_info.get("location", district)
            
            if data and len(data) > 0:
                # Filter out error/message records and entries missing price
                valid_data = [
                    item for item in data
                    if item.get('Market') and item.get('Modal_Price') and
                    'error' not in item and 'message' not in item
                ]
                
                if valid_data:
                    response = f"Here are the prices for {commodity} in mandis near {location_used}:\n\n"
                    
                    for i, item in enumerate(valid_data[:5], 1):
                        market = item.get('Market', 'Unknown')
                        price = item.get('Modal_Price', 'N/A')
                        # distance may be added by nearby_prices.py under either key
                        distance = item.get('distance') or item.get('distance_km') or 0
                        
                        if distance and 0 < float(distance) < 200:
                            response += f"{i}. {market}: ₹{price} per quintal ({float(distance):.1f} km away)\n"
                        elif distance and float(distance) >= 200:
                            response += f"{i}. {market}: ₹{price} per quintal ({float(distance):.1f} km away - far)\n"
                        else:
                            response += f"{i}. {market}: ₹{price} per quintal\n"
                    
                    if len(valid_data) > 5:
                        response += f"\n(Showing top 5 of {len(valid_data)} mandis)"
                    
                    return response
                else:
                    return f"No price data available for {commodity} near {location_used}. The commodity might not be traded in this area."
            else:
                return f"No prices found for {commodity} near {location_used}. Try another location or commodity."
    
    def _format_forecast_response(self, forecast_data: Dict, entities: Dict) -> str:
        """Format forecast information into readable response"""
        from datetime import datetime, timedelta

        if not forecast_data or "forecast" not in forecast_data:
            return f"I couldn't generate a forecast for {entities.get('commodity', 'this commodity')}."

        commodity = entities.get('commodity', 'Commodity')
        district  = entities.get('district', 'your area')
        today     = datetime.today()
        days      = [(today + timedelta(days=i)).strftime("%a, %d %b") for i in range(7)]

        response  = f"📊 7-Day Price Forecast\n"
        response += f"🌾 {commodity}  |  📍 {district}\n\n"

        for market, predictions in forecast_data["forecast"].items():
            prices     = [float(p) for p in predictions[:7]]
            avg        = sum(prices) / len(prices)
            min_p      = min(prices)
            max_p      = max(prices)
            change_pct = ((prices[-1] - prices[0]) / prices[0] * 100) if prices[0] else 0
            trend      = "📈" if change_pct > 0 else ("📉" if change_pct < 0 else "➡️")

            response += f"🏪 {market}  {trend} {change_pct:+.1f}%\n"

            for day, price in zip(days, prices):
                response += f"  {day}: ₹{price:,.0f}\n"

            response += f"  ─────────────────────\n"
            response += f"  Min ₹{min_p:,.0f}  Avg ₹{avg:,.0f}  Max ₹{max_p:,.0f}\n\n"

        if "recommendation" in forecast_data:
            rec    = forecast_data["recommendation"]
            action = rec.get("action", "")
            icon   = "✅ SELL NOW" if action == "SELL" else "⏳ WAIT TO SELL" if action == "WAIT" else f"💡 {action}"

            response += f"─────────────────────────\n"
            response += f"{icon}\n"
            if action == "WAIT" and rec.get("sell_after_days"):
                response += f"  ⏱  Sell after: {rec['sell_after_days']} days\n"
            if rec.get("best_market"):
                response += f"  🏆 Best market: {rec['best_market']}\n"
            if rec.get("expected_price"):
                response += f"  💰 Expected: ₹{float(rec['expected_price']):,.0f}\n"
            explanations = rec.get("explanation", [])
            if explanations:
                response += f"\n  📌 Reason:\n"
                for r in explanations[:2]:
                    response += f"     • {r}\n"
            response += f"─────────────────────────\n"

        return response

    def _format_history_response(self, history_data: Dict) -> str:
        """Format history information into readable response"""
        if not history_data or not history_data.get("history"):
            return "I couldn't find historical price data."
        
        location_label = history_data['market']
        response = f"📈 Last 7 days price trend for {history_data['commodity']} in {location_label}:\n\n"
        for record in history_data["history"][-7:]:
            date = record.get('date', 'Unknown')
            if hasattr(date, 'strftime'):
                date = date.strftime('%d %b')
            price = record.get('price', 'N/A')
            market_name = record.get('market', '')
            market_str = f" ({market_name})" if market_name and market_name != location_label else ""
            response += f"• {date}: ₹{price}{market_str}\n"
        
        return response
    
    def _format_nearby_response(self, nearby_mandis: List[Dict]) -> str:
        """Format nearby mandis into readable response"""
        if not nearby_mandis:
            return "No nearby mandis found in your area."
        
        response = "📍 Nearby mandis from your location:\n\n"
        for mandi in nearby_mandis[:5]:
            response += f"• {mandi.get('Market', 'Unknown')} - {mandi.get('distance_km', 0):.1f}km\n"
            response += f"  {mandi.get('District', '')}, {mandi.get('State', '')}\n"
        
        return response
    
    def _format_comparison_response(self, comparison_data: Dict) -> str:
        """Format comparison information into readable response"""
        if not comparison_data:
            return "I couldn't generate a comparison."
        
        response = "📊 Mandi Comparison:\n\n"
        if "comparison" in comparison_data:
            for item in comparison_data["comparison"][:5]:
                response += f"• {item.get('market', 'Unknown')}: ₹{item.get('price', 'N/A')}\n"
        
        if "best_mandi" in comparison_data:
            best = comparison_data["best_mandi"]
            response += f"\n✅ Best mandi to sell: {best.get('market', 'Unknown')} "
            response += f"(₹{best.get('price', 'N/A')}, {best.get('distance', 0):.1f}km away)\n"
        
        return response
    
    def _format_recommendation_response(self, recommendation: Dict) -> str:
        """Format recommendation into readable response"""
        if not recommendation:
            return "I couldn't generate a recommendation."
        
        response = "💡 Selling Recommendation:\n\n"
        response += f"Action: {recommendation.get('action', 'Unknown')}\n"
        
        if recommendation.get('action') == 'WAIT':
            response += f"Sell after: {recommendation.get('sell_after_days', 0)} days\n"
        
        response += f"Best mandi: {recommendation.get('best_market', 'Unknown')}\n"
        response += f"Expected price: ₹{recommendation.get('expected_price', 0)}\n"
        response += f"Expected profit: ₹{recommendation.get('expected_profit', 0)}\n"
        
        if "explanation" in recommendation:
            response += "\nReason:\n"
            for reason in recommendation["explanation"][:2]:
                response += f"• {reason}\n"
        
        return response
    
    async def chat(self, 
                  messages: List[Dict],
                  language: str = "auto",
                  include_voice: bool = False,
                  include_forecast: bool = True,
                  include_nearby: bool = True,
                  user_query: str = "") -> Dict[str, Any]:
        """
        Main chat method with full route integration
        """
        try:
            # Get the last user message if not provided
            if not user_query and messages:
                for msg in reversed(messages):
                    if msg.get("role") == "user":
                        user_query = msg.get("content", "")
                        break
            
            logger.info(f"Processing query: {user_query}")
            
            # Detect language
            detected_lang = self._detect_language(user_query, language)
            
            # Extract entities from query
            entities = self._extract_entities(user_query)

            # Fill missing entities (commodity/intent) from conversation history
            entities = self._extract_context_from_history(messages, entities)

            # Initialize response data
            response_text = ""
            forecast_data = None
            nearby_mandis = None
            
            # Handle different intents using existing routes
            if entities["intent"] == "price" and entities["commodity"]:
                if not entities.get("district") and not entities.get("market"):
                    response_text = f"Which district or city would you like the price of {entities['commodity']} for? For example: Ludhiana, Amritsar, Jalandhar."
                else:
                    price_info = self._get_price_info(
                        entities["commodity"],
                        entities.get("district", "Jammu"),
                        entities.get("state", "Jammu and Kashmir"),
                        entities.get("market")
                    )
                    response_text = self._format_price_response(price_info, entities)
                
            elif entities["intent"] == "forecast" and entities["commodity"]:
                # Ask for district if not provided
                if not entities.get("district"):
                    response_text = f"Which district or city would you like the forecast for {entities['commodity']}? For example: Ludhiana, Amritsar, Jalandhar."
                else:
                    forecast_result = self._get_forecast_info(
                        entities["commodity"],
                        entities["district"],
                        entities["state"]
                    )
                    if forecast_result:
                        forecast_data = forecast_result
                        response_text = self._format_forecast_response(forecast_result, entities)
                    else:
                        response_text = f"Sorry, I couldn't generate a forecast for {entities['commodity']} in {entities['district']}."
            
            elif entities["intent"] == "history" and entities["commodity"]:
                market = entities.get("market")
                district = entities.get("district")
                if not market and not district:
                    response_text = f"Which district or market would you like price history for {entities['commodity']}? For example: Ludhiana, Amritsar, Azadpur."
                else:
                    history_data = self._get_history_info(entities["commodity"], market, district=district)
                    if history_data:
                        response_text = self._format_history_response(history_data)
                    else:
                        response_text = f"Sorry, I couldn't find historical data for {entities['commodity']} in {district or market}. The API may be temporarily unavailable, please try again."
            
            elif entities["intent"] == "nearby":
                # Get nearby mandis - pass the district if found
                nearby_result = self._get_nearby_mandis(entities.get("district"))
                if nearby_result:
                    nearby_mandis = nearby_result
                    response_text = self._format_nearby_response(nearby_result)
                    
                    # If commodity specified, get prices
                    if entities["commodity"]:
                        price_info = self._get_price_info(
                            entities["commodity"],
                            entities.get("district", "Jammu"),
                            entities.get("state", "Jammu and Kashmir")
                        )
                        if price_info and price_info.get("data"):
                            response_text += "\n\n" + self._format_price_response(price_info, entities)
                else:
                    response_text = "Sorry, I couldn't find nearby mandis."
            
            elif entities["intent"] == "compare" and entities["commodity"] and entities.get("district"):
                # Get comparison
                comparison = self._get_comparison_info(
                    entities["commodity"],
                    entities["district"],
                    entities["state"]
                )
                if comparison:
                    response_text = self._format_comparison_response(comparison)
                else:
                    response_text = f"Sorry, I couldn't generate a comparison for {entities['commodity']}."
            
            elif entities["intent"] == "recommend" and entities["commodity"] and entities.get("district"):
                # Get recommendation
                recommendation = self._get_recommendation(
                    entities["commodity"],
                    entities["district"],
                    entities["state"]
                )
                if recommendation:
                    response_text = self._format_recommendation_response(recommendation)
                else:
                    response_text = f"Sorry, I couldn't generate a recommendation for {entities['commodity']}."
            
            else:
                # No specific intent detected, try AI response
                if self.api_available and self.client:
                    # Prepare messages with system prompt
                    system_msg = {
                        "role": "system",
                        "content": """You are MarketPulse Assistant, an AI expert in agricultural mandi prices in India.
You can help with:
- Current prices: "What is the price of bananas in Jammu?"
- Forecasts: "Predict tomato price in Ludhiana for next 7 days"
- History: "Show price trend for wheat in Azadpur"
- Nearby mandis: "Find mandis near me"
- Comparisons: "Compare potato prices in different mandis"
- Recommendations: "Where should I sell my onions?"

Respond helpfully in the user's language. If you need more information, ask for it."""
                    }
                    
                    full_messages = [system_msg] + messages[-5:]
                    ai_response = self.client.chat_completion(full_messages, detected_lang)
                    
                    if ai_response:
                        response_text = ai_response
                    else:
                        response_text = "I can help you with mandi prices, forecasts, and recommendations. Please ask me about specific crops or locations! For example: 'What is the price of bananas in Jalandhar?'"
                else:
                    response_text = "I can help you with mandi prices, forecasts, and recommendations. Try asking: 'What is the price of bananas in Jalandhar?' or 'Forecast for tomato in Ludhiana'"
            
            # Generate voice if requested
            audio_base64 = None
            if include_voice and self.api_available and self.client and response_text:
                audio_base64 = self.client.text_to_speech(
                    response_text,
                    detected_lang,
                    self._get_voice_for_language(detected_lang)
                )
            
            return {
                "response": response_text,
                "audio": audio_base64,
                "detected_language": detected_lang,
                "forecast_data": forecast_data,
                "nearby_mandis": nearby_mandis
            }
            
        except Exception as e:
            logger.error(f"Chat error: {e}")
            return {
                "response": "I'm having trouble right now. Please try again.",
                "detected_language": "en-IN",
                "error": str(e)
            }
    
    def _detect_language(self, text: str, default: str = "auto") -> str:
        """Simple language detection"""
        if default != "auto":
            return default
        
        if not text:
            return "hi-IN"
        
        # Check for Devanagari (Hindi)
        if any('\u0900' <= char <= '\u097F' for char in text):
            return "hi-IN"
        
        # Check for Gurmukhi (Punjabi)
        if any('\u0A00' <= char <= '\u0A7F' for char in text):
            return "pa-IN"
        
        return "en-IN"
    
    def _get_voice_for_language(self, language_code: str) -> str:
        """Get appropriate voice"""
        return self.voices.get(language_code, {}).get("female", "anushka")
    
    async def process_voice(self,
                           audio_file: str,
                           language: str = "auto",
                           include_voice: bool = True) -> Dict[str, Any]:
        """
        Process voice input using Sarvam STT
        """
        try:
            if not self.api_available or not self.client:
                return {
                    "user_text": "",
                    "detected_language": "en-IN",
                    "response": "Voice processing requires Sarvam API key.",
                    "audio": None
                }
            
            # Convert speech to text
            stt_result = self.client.speech_to_text(audio_file, language)
            
            if not stt_result:
                return {
                    "user_text": "",
                    "detected_language": "en-IN",
                    "response": "Could not process audio. Please try again.",
                    "audio": None
                }
            
            user_text = stt_result.get('transcript', '')
            detected_lang = stt_result.get('language_code', 'hi-IN')
            
            # Get chat response
            chat_result = await self.chat(
                messages=[{"role": "user", "content": user_text}],
                language=detected_lang,
                include_voice=include_voice,
                user_query=user_text
            )
            
            return {
                "user_text": user_text,
                "detected_language": detected_lang,
                "response": chat_result.get("response", ""),
                "audio": chat_result.get("audio"),
                "forecast_data": chat_result.get("forecast_data"),
                "nearby_mandis": chat_result.get("nearby_mandis")
            }
        except Exception as e:
            logger.error(f"Voice processing error: {e}")
            return {
                "user_text": "",
                "detected_language": "en-IN",
                "response": "I'm having trouble processing your voice input. Please try again.",  
                "audio": None,
                "error": str(e)
            }