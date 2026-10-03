import json
import re
from typing import Optional, List

class CommodityMapper:
    """Map commodity names across languages"""
    
    def __init__(self, map_file_path: str):
        with open(map_file_path, 'r', encoding='utf-8') as f:
            self.commodity_map = json.load(f)
        
        # Build reverse lookup for quick searching
        self.reverse_lookup = {}
        self._build_reverse_lookup()
    
    def _build_reverse_lookup(self):
        """Build reverse mapping from any variation to commodity name"""
        for commodity, translations in self.commodity_map.items():
            for lang, variations in translations.items():
                for var in variations:
                    self.reverse_lookup[var.lower()] = commodity
    
    def extract(self, query: str) -> Optional[str]:
        """
        Extract commodity name from query
        Returns standardized commodity name
        """
        query = query.lower()
        
        # Direct lookup
        for variation, commodity in self.reverse_lookup.items():
            if variation in query:
                return commodity
            
            # Word boundary check
            pattern = r'\b' + re.escape(variation) + r'\b'
            if re.search(pattern, query):
                return commodity
        
        # Check if query directly contains commodity name
        for commodity in self.commodity_map.keys():
            if commodity.lower() in query:
                return commodity
        
        return None
    
    def get_local_name(self, commodity: str, language: str = 'en') -> str:
        """Get commodity name in specified language"""
        if commodity in self.commodity_map:
            translations = self.commodity_map[commodity]
            if language in translations and translations[language]:
                return translations[language][0]  # Return first variation
        return commodity
    
    def get_all_commodities(self) -> List[str]:
        """Get list of all commodities"""
        return list(self.commodity_map.keys())