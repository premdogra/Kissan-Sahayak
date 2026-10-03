import json
import re
from typing import Optional, Tuple, Dict
from haversine import haversine
import pandas as pd

class LocationHandler:
    """Handle location extraction and processing"""
    
    def __init__(self, coords_file_path: str, mandis_df: pd.DataFrame = None):
        with open(coords_file_path, 'r', encoding='utf-8') as f:
            self.district_coords = json.load(f)
        
        self.mandis_df = mandis_df
        
        # Location keywords in different languages
        self.location_indicators = {
            'en': ['in', 'near', 'at', 'around'],
            'hi': ['में', 'के पास', 'पर'],
            'pa': ['ਵਿੱਚ', 'ਕੋਲ', 'ਨੇੜੇ'],
        }
    
    def extract_district(self, query: str) -> Optional[str]:
        """Extract district name from query"""
        query = query.lower()
        
        # Direct district match
        for district in self.district_coords.keys():
            if district.lower() in query:
                return district
        
        return None
    
    def get_district_coords(self, district: str) -> Optional[Tuple[float, float]]:
        """Get coordinates for a district"""
        if district in self.district_coords:
            data = self.district_coords[district]
            return (data['lat'], data['lon'])
        return None
    
    def get_state(self, district: str) -> Optional[str]:
        """Get state for a district"""
        if district in self.district_coords:
            return self.district_coords[district].get('state')
        return None
    
    def extract_market(self, query: str) -> Optional[str]:
        """Extract market name from query"""
        if self.mandis_df is None:
            return None
        
        query = query.lower()
        
        # Check each mandi
        for _, mandi in self.mandis_df.iterrows():
            market = mandi['Market']
            if market.lower() in query:
                return market
            
            # Check parts of market name
            words = market.lower().split()
            for word in words:
                if len(word) > 3 and word in query:
                    return market
        
        return None
    
    def extract_location_from_query(self, query: str, language: str = 'en') -> Dict:
        """
        Extract all location information from query
        """
        result = {
            'district': None,
            'market': None,
            'state': None,
            'lat': None,
            'lon': None,
            'source': None
        }
        
        # Extract market
        market = self.extract_market(query)
        if market:
            result['market'] = market
            result['source'] = 'market'
            
            # If we have mandis_df, we could get district from market
            if self.mandis_df is not None:
                market_data = self.mandis_df[self.mandis_df['Market'] == market]
                if not market_data.empty:
                    result['district'] = market_data.iloc[0]['District']
                    result['state'] = market_data.iloc[0]['State']
        
        # Extract district
        district = self.extract_district(query)
        if district:
            result['district'] = district
            result['source'] = 'district'
            coords = self.get_district_coords(district)
            if coords:
                result['lat'], result['lon'] = coords
            result['state'] = self.get_state(district)
        
        return result