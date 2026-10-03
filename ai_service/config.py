import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # API Keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    
    # File paths
    MANDI_COORDINATES_PATH = "data/mandi_coordinates.csv"
    COMMODITY_MAP_PATH = "data/commodity_map.json"
    
    # API Settings
    API_TITLE = "MarketPulse AI Chatbot"
    API_VERSION = "1.0.0"
    
    # CORS
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:5500",
        "*"  # For development
    ]

config = Config()