import requests
import json
import base64
import os
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class SarvamRESTClient:
    """Direct REST API client for Sarvam AI - No SDK required"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.sarvam.ai"
        self.headers = {
            "api-subscription-key": api_key,
            "Content-Type": "application/json"
        }
        logger.info("✅ Sarvam REST client initialized")
    
    def chat_completion(self, messages: List[Dict], language: str = "hi-IN") -> Optional[str]:
        """Get chat completion from Sarvam API"""
        url = f"{self.base_url}/chat/completions"
        
        payload = {
            "messages": messages,
            "language_code": language,
            "temperature": 0.7,
            "max_tokens": 500,
            "model": "indus-105b"
        }
        
        try:
            logger.info(f"Sending chat request to Sarvam API")
            response = requests.post(url, json=payload, headers=self.headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
                logger.info(f"✅ Received response: {content[:50]}...")
                return content
            else:
                logger.error(f"API error {response.status_code}: {response.text}")
                return None
        except Exception as e:
            logger.error(f"Chat request failed: {e}")
            return None
    
    def text_to_speech(self, text: str, language: str = "hi-IN", speaker: str = "anushka") -> Optional[str]:
        """Convert text to speech - returns base64 audio"""
        url = f"{self.base_url}/text-to-speech"
        
        payload = {
            "inputs": [text],
            "target_language_code": language,
            "speaker": speaker,
            "pitch": 0,
            "pace": 1.0,
            "loudness": 1.0,
            "model": "bulbul:v2"
        }
        
        try:
            logger.info(f"Generating TTS for language: {language}")
            response = requests.post(url, json=payload, headers=self.headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                audio = data.get('audios', [None])[0]
                if audio:
                    logger.info(f"✅ TTS generated successfully")
                return audio
            else:
                logger.error(f"TTS error {response.status_code}: {response.text}")
                return None
        except Exception as e:
            logger.error(f"TTS failed: {e}")
            return None
    
    def speech_to_text(self, audio_file: str, language: str = "auto") -> Optional[Dict]:
        """Convert speech to text"""
        url = f"{self.base_url}/speech-to-text"
        
        try:
            with open(audio_file, 'rb') as f:
                files = {
                    'file': (os.path.basename(audio_file), f, 'audio/wav'),
                }
                data = {
                    'language_code': language,
                    'model': 'saarika:v2'
                }
                
                headers = {"api-subscription-key": self.api_key}
                
                response = requests.post(
                    url, 
                    headers=headers,
                    data=data,
                    files=files,
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"✅ STT successful: {result.get('transcript', '')[:50]}...")
                    return result
                else:
                    logger.error(f"STT error {response.status_code}: {response.text}")
                    return None
        except Exception as e:
            logger.error(f"STT failed: {e}")
            return None