from typing import Dict, Any, List
import pandas as pd
from datetime import datetime

class ResponseFormatter:
    """Format responses in user's language"""
    
    # Response templates
    TEMPLATES = {
        'greeting': {
            'en': "👋 Namaste! I'm MarketPulse AI Assistant. How can I help you with mandi prices today?",
            'hi': "👋 नमस्ते! मैं मार्केटपल्स AI असिस्टेंट हूं। आज मंडी भाव में कैसे मदद कर सकता हूं?",
            'pa': "👋 ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਮਾਰਕੇਟਪਲਸ AI ਅਸਿਸਟੈਂਟ ਹਾਂ। ਅੱਜ ਮੰਡੀ ਭਾਅ ਵਿੱਚ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
        },
        'help': {
            'en': "💡 **I can help you with:**\n\n"
                  "📍 Nearby mandis (e.g., 'nearby mandis')\n"
                  "💰 Current prices (e.g., 'banana price in Jammu')\n"
                  "📊 Price history (e.g., 'last 7 days potato price')\n"
                  "🔮 Future predictions (e.g., 'tomato price next week')\n"
                  "🎯 Recommendations (e.g., 'where to sell wheat')\n\n"
                  "You can ask in हिंदी, ਪੰਜਾਬੀ, or English!",
            
            'hi': "💡 **मैं इन चीजों में मदद कर सकता हूं:**\n\n"
                  "📍 आस-पास की मंडियां (जैसे: 'मेरे पास मंडी')\n"
                  "💰 आज के भाव (जैसे: 'जम्मू में केले का भाव')\n"
                  "📊 पिछले 7 दिन के भाव (जैसे: 'आलू का पिछले हफ्ते का भाव')\n"
                  "🔮 भविष्य का अनुमान (जैसे: 'टमाटर का अगले हफ्ते भाव')\n"
                  "🎯 सुझाव (जैसे: 'गेहूं कहां बेचें')\n\n"
                  "आप हिंदी, ਪੰਜਾਬੀ, या अंग्रेजी में पूछ सकते हैं!",
            
            'pa': "💡 **ਮੈਂ ਇਹਨਾਂ ਚੀਜ਼ਾਂ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:**\n\n"
                  "📍 ਨੇੜੇ ਦੀਆਂ ਮੰਡੀਆਂ (ਜਿਵੇਂ: 'ਮੇਰੇ ਨੇੜੇ ਮੰਡੀ')\n"
                  "💰 ਅੱਜ ਦੇ ਭਾਅ (ਜਿਵੇਂ: 'ਜੰਮੂ ਵਿੱਚ ਕੇਲੇ ਦਾ ਭਾਅ')\n"
                  "📊 ਪਿਛਲੇ 7 ਦਿਨਾਂ ਦੇ ਭਾਅ (ਜਿਵੇਂ: 'ਆਲੂ ਦਾ ਪਿਛਲੇ ਹਫਤੇ ਦਾ ਭਾਅ')\n"
                  "🔮 ਭਵਿੱਖ ਦਾ ਅਨੁਮਾਨ (ਜਿਵੇਂ: 'ਟਮਾਟਰ ਦਾ ਅਗਲੇ ਹਫਤੇ ਭਾਅ')\n"
                  "🎯 ਸਿਫ਼ਾਰਿਸ਼ (ਜਿਵੇਂ: 'ਕਣਕ ਕਿੱਥੇ ਵੇਚੀਏ')\n\n"
                  "ਤੁਸੀਂ ਹਿੰਦੀ, ਪੰਜਾਬੀ, ਜਾਂ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਪੁੱਛ ਸਕਦੇ ਹੋ!",
        },
        'location_needed': {
            'en': "📍 To find nearby mandis, please share your location:\n• Allow GPS access, or\n• Tell me your district (e.g., 'Jammu')",
            'hi': "📍 आस-पास की मंडियां ढूंढने के लिए, कृपया अपनी लोकेशन बताएं:\n• GPS की अनुमति दें, या\n• अपना जिला बताएं (जैसे: 'जम्मू')",
            'pa': "📍 ਨੇੜੇ ਦੀਆਂ ਮੰਡੀਆਂ ਲੱਭਣ ਲਈ, ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਲੋਕੇਸ਼ਨ ਦੱਸੋ:\n• GPS ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ, ਜਾਂ\n• ਆਪਣਾ ਜ਼ਿਲ੍ਹਾ ਦੱਸੋ (ਜਿਵੇਂ: 'ਜੰਮੂ')",
        },
        'commodity_needed': {
            'en': "🤔 Please tell me which commodity you're interested in (e.g., 'banana', 'potato', 'wheat')",
            'hi': "🤔 कृपया बताएं कि आपको किस फसल के भाव चाहिए (जैसे: 'केला', 'आलू', 'गेहूं')",
            'pa': "🤔 ਕਿਰਪਾ ਕਰਕੇ ਦੱਸੋ ਕਿ ਤੁਹਾਨੂੰ ਕਿਸ ਫਸਲ ਦੇ ਭਾਅ ਚਾਹੀਦੇ ਹਨ (ਜਿਵੇਂ: 'ਕੇਲਾ', 'ਆਲੂ', 'ਕਣਕ')",
        },
        'no_data': {
            'en': "😕 Sorry, no data available for {commodity} in {location} at the moment.",
            'hi': "😕 क्षमा करें, अभी {location} में {commodity} का डेटा उपलब्ध नहीं है।",
            'pa': "😕 ਮਾਫ਼ ਕਰਨਾ, ਹੁਣ {location} ਵਿੱਚ {commodity} ਦਾ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
        }
    }
    
    @classmethod
    def format_nearby_mandis(cls, mandis: List[Dict], language: str = 'en') -> str:
        """Format nearby mandis response"""
        if not mandis:
            return "No nearby mandis found."
        
        lines = []
        for i, m in enumerate(mandis[:5], 1):
            lines.append(f"{i}. **{m['name']}** – {m['distance_km']} km")
        
        template = cls.TEMPLATES['nearby_mandis'].get(language, cls.TEMPLATES['nearby_mandis']['en'])
        return template.format(mandis_list="\n".join(lines))
    
    @classmethod
    def format_current_price(cls, price_data: Dict, language: str = 'en') -> str:
        """Format current price response"""
        template = cls.TEMPLATES['current_price'].get(language, cls.TEMPLATES['current_price']['en'])
        return template.format(
            market=price_data.get('market', 'Unknown'),
            commodity=price_data.get('commodity', 'Unknown'),
            min_price=price_data.get('min_price', 'N/A'),
            max_price=price_data.get('max_price', 'N/A'),
            modal_price=price_data.get('modal_price', 'N/A'),
            date=price_data.get('date', 'Today')
        )
    
    @classmethod
    def get_greeting(cls, language: str = 'en') -> str:
        """Get greeting message"""
        return cls.TEMPLATES['greeting'].get(language, cls.TEMPLATES['greeting']['en'])
    
    @classmethod
    def get_help(cls, language: str = 'en') -> str:
        """Get help message"""
        return cls.TEMPLATES['help'].get(language, cls.TEMPLATES['help']['en'])
    
    @classmethod
    def location_needed(cls, language: str = 'en') -> str:
        """Get location needed message"""
        return cls.TEMPLATES['location_needed'].get(language, cls.TEMPLATES['location_needed']['en'])
    
    @classmethod
    def commodity_needed(cls, language: str = 'en') -> str:
        """Get commodity needed message"""
        return cls.TEMPLATES['commodity_needed'].get(language, cls.TEMPLATES['commodity_needed']['en'])