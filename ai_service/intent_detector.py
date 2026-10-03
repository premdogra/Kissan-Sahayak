import re
from enum import Enum

class IntentType(str, Enum):
    NEARBY_MANDIS = "nearby_mandis"
    CURRENT_PRICE = "current_price"
    PRICE_HISTORY = "price_history"
    PREDICTION = "prediction"
    RECOMMENDATION = "recommendation"
    MANDI_COMPARISON = "mandi_comparison"
    PRICE_GRAPH = "price_graph"
    GREETING = "greeting"
    HELP = "help"
    GENERAL = "general"

class IntentDetector:
    """Detect intent from farmer queries"""
    
    # Keywords for each intent in different languages
    KEYWORDS = {
        IntentType.NEARBY_MANDIS: {
            'en': ['nearby', 'near me', 'around', 'close', 'mandi near', 'nearest'],
            'hi': ['पास', 'आस-पास', 'नजदीक', 'करीब', 'मंडी'],
            'pa': ['ਨੇੜੇ', 'ਕੋਲ', 'ਆਸ-ਪਾਸ', 'ਨਜ਼ਦੀਕ', 'ਮੰਡੀ'],
        },
        IntentType.CURRENT_PRICE: {
            'en': ['price', 'rate', 'cost', 'today', 'current', 'bhava', 'bhav'],
            'hi': ['भाव', 'कीमत', 'दर', 'आज', 'रेट'],
            'pa': ['ਭਾਅ', 'ਕੀਮਤ', 'ਰੇਟ', 'ਅੱਜ'],
        },
        IntentType.PRICE_HISTORY: {
            'en': ['history', 'last', 'past', '7 days', 'week', 'previous', 'trend'],
            'hi': ['इतिहास', 'पिछले', 'सात दिन', 'हफ्ते'],
            'pa': ['ਇਤਿਹਾਸ', 'ਪਿਛਲੇ', 'ਸੱਤ ਦਿਨ', 'ਹਫ਼ਤੇ'],
        },
        IntentType.PREDICTION: {
            'en': ['predict', 'forecast', 'future', 'next', 'coming', 'will be'],
            'hi': ['भविष्यवाणी', 'पूर्वानुमान', 'भविष्य', 'अगले'],
            'pa': ['ਭਵਿੱਖਬਾਣੀ', 'ਅਗਲੇ', 'ਭਵਿੱਖ'],
        },
        IntentType.RECOMMENDATION: {
            'en': ['recommend', 'suggest', 'where to sell', 'best', 'should'],
            'hi': ['सुझाव', 'सलाह', 'कहाँ बेचें', 'बेचना चाहिए'],
            'pa': ['ਸਿਫ਼ਾਰਿਸ਼', 'ਸੁਝਾਅ', 'ਕਿੱਥੇ ਵੇਚੀਏ'],
        },
        IntentType.MANDI_COMPARISON: {
            'en': ['compare', 'comparison', 'vs', 'versus', 'different'],
            'hi': ['तुलना', 'बनाम', 'अलग'],
            'pa': ['ਤੁਲਨਾ', 'ਬਨਾਮ'],
        },
        IntentType.GREETING: {
            'en': ['hello', 'hi', 'hey', 'namaste', 'good morning'],
            'hi': ['नमस्ते', 'नमस्कार', 'हेलो'],
            'pa': ['ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'ਹੈਲੋ'],
        },
    }
    
    @classmethod
    def detect(cls, query: str, language: str = 'en') -> tuple:
        """
        Detect intent from query
        Returns: (intent_type, confidence)
        """
        query = query.lower()
        
        # Check each intent
        for intent, lang_keywords in cls.KEYWORDS.items():
            keywords = lang_keywords.get(language, lang_keywords.get('en', []))
            
            for keyword in keywords:
                if keyword in query:
                    return intent, 0.8
                
                # Word boundary check
                pattern = r'\b' + re.escape(keyword) + r'\b'
                if re.search(pattern, query):
                    return intent, 0.9
        
        # Check for price-related but no keyword match
        if any(word in query for word in ['भाव', 'price', 'ਕੀਮਤ', 'rate']):
            return IntentType.CURRENT_PRICE, 0.6
        
        return IntentType.GENERAL, 0.3
    
    @classmethod
    def is_greeting(cls, query: str, language: str = 'en') -> bool:
        """Check if query is a greeting"""
        intent, _ = cls.detect(query, language)
        return intent == IntentType.GREETING