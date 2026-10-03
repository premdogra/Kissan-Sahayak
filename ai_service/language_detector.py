from langdetect import detect, DetectorFactory, LangDetectException
import re

# Ensure consistent results
DetectorFactory.seed = 0

class LanguageDetector:
    """Simple language detector for farmer queries"""
    
    # Language mapping
    LANGUAGE_MAP = {
        'hi': 'hindi',
        'en': 'english',
        'pa': 'punjabi',
        'bn': 'bengali',
        'gu': 'gujarati',
        'mr': 'marathi',
        'ta': 'tamil',
        'te': 'telugu',
        'kn': 'kannada',
        'ml': 'malayalam'
    }
    
    # Unicode ranges for Indian scripts
    SCRIPT_PATTERNS = {
        'hi': r'[\u0900-\u097F]',     # Devanagari (Hindi, Marathi)
        'pa': r'[\u0A00-\u0A7F]',     # Gurmukhi (Punjabi)
        'bn': r'[\u0980-\u09FF]',     # Bengali
        'gu': r'[\u0A80-\u0AFF]',     # Gujarati
        'ta': r'[\u0B80-\u0BFF]',     # Tamil
        'te': r'[\u0C00-\u0C7F]',     # Telugu
        'kn': r'[\u0C80-\u0CFF]',     # Kannada
        'ml': r'[\u0D00-\u0D7F]',     # Malayalam
    }
    
    @classmethod
    def detect(cls, text: str) -> str:
        """
        Detect language of input text
        Returns language code (en, hi, pa, etc.)
        """
        if not text or len(text.strip()) < 2:
            return 'en'
        
        # Try script-based detection first
        script_lang = cls._detect_by_script(text)
        if script_lang:
            return script_lang
        
        # Fallback to langdetect
        try:
            lang = detect(text)
            return lang if lang in cls.LANGUAGE_MAP else 'en'
        except LangDetectException:
            return 'en'
    
    @classmethod
    def _detect_by_script(cls, text: str) -> str:
        """Detect language by Unicode script"""
        for lang, pattern in cls.SCRIPT_PATTERNS.items():
            if re.search(pattern, text):
                return lang
        return None
    
    @classmethod
    def get_name(cls, code: str) -> str:
        """Get language name from code"""
        return cls.LANGUAGE_MAP.get(code, 'english')