import os
import requests
import json
from typing import Dict, Any
import time

class AIHandler:
    def __init__(self):
        self.hf_token = os.getenv('HUGGINGFACE_API_KEY')
        if not self.hf_token:
            raise ValueError("HUGGINGFACE_API_KEY environment variable is required")
        self.base_url = "https://api-inference.huggingface.co/models"
        
    def generate_chat_response(self, message: str, language: str) -> str:
        """Generate empathetic chat response using Hugging Face"""
        try:
            # Use a conversational model
            model = "microsoft/DialoGPT-medium"
            
            headers = {"Authorization": f"Bearer {self.hf_token}"}
            payload = {
                "inputs": f"User: {message}\nBot:",
                "parameters": {
                    "max_length": 100,
                    "temperature": 0.7,
                    "do_sample": True
                }
            }
            
            # Retry logic for API calls
            for attempt in range(3):
                try:
                    response = requests.post(
                        f"{self.base_url}/{model}",
                        headers=headers,
                        json=payload,
                        timeout=10
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if isinstance(result, list) and len(result) > 0:
                            generated = result[0].get('generated_text', '')
                            bot_response = generated.split('Bot:')[-1].strip()
                            return bot_response if bot_response else self._fallback_response(language)
                    elif response.status_code == 503:  # Service unavailable, retry
                        if attempt < 2:
                            time.sleep(2 ** attempt)  # Exponential backoff
                            continue
                    else:
                        print(f"API error: {response.status_code} - {response.text}")
                        break
                        
                except requests.exceptions.RequestException as e:
                    print(f"Request failed (attempt {attempt + 1}): {e}")
                    if attempt < 2:
                        time.sleep(2 ** attempt)
                        continue
                    break
            
            return self._fallback_response(language)
            
        except Exception as e:
            print(f"AI generation error: {e}")
            return self._fallback_response(language)
    
    def correct_grammar(self, text: str) -> Dict[str, Any]:
        """Basic grammar correction and analysis"""
        corrected = text.strip()
        
        # Basic corrections
        if corrected and not corrected[0].isupper():
            corrected = corrected[0].upper() + corrected[1:]
        
        if corrected and corrected[-1] not in '.!?':
            corrected += '.'
        
        # Simple grammar formula detection
        grammar_formula = self._analyze_grammar(text)
        
        return {
            "original": text,
            "corrected": corrected,
            "is_correct": text.strip() == corrected,
            "grammar_formula": grammar_formula
        }
    
    def translate_text(self, text: str, target_lang: str = 'id') -> str:
        """Translate text using basic dictionary or API"""
        # Simple translation dictionary for common phrases
        translations = {
            'en_to_id': {
                'hello': 'halo',
                'good morning': 'selamat pagi',
                'thank you': 'terima kasih',
                'how are you': 'apa kabar',
                'i am fine': 'saya baik-baik saja',
                'good night': 'selamat malam'
            },
            'id_to_en': {
                'halo': 'hello',
                'selamat pagi': 'good morning',
                'terima kasih': 'thank you',
                'apa kabar': 'how are you',
                'saya baik-baik saja': 'i am fine'
            }
        }
        
        key = f"en_to_{target_lang}" if target_lang != 'en' else 'id_to_en'
        return translations.get(key, {}).get(text.lower(), "Translation not available")
    
    def _fallback_response(self, language: str) -> str:
        """Fallback responses when AI fails"""
        responses = {
            'en': [
                "That's interesting! Tell me more 😊",
                "I understand. How does that make you feel?",
                "Thanks for sharing! What would you like to practice?",
                "Great! Keep practicing your language skills 🌱"
            ],
            'ja': [
                "そうですね！もっと教えてください 😊",
                "分かります。どう感じますか？",
                "ありがとう！何を練習したいですか？"
            ],
            'zh': [
                "很有趣！请告诉我更多 😊",
                "我明白。你感觉怎么样？",
                "谢谢分享！你想练习什么？"
            ]
        }
        
        import random
        lang_responses = responses.get(language, responses['en'])
        return random.choice(lang_responses)
    
    def _analyze_grammar(self, text: str) -> str:
        """Simple grammar pattern analysis"""
        words = text.lower().split()
        
        if len(words) == 1:
            return "Single word"
        elif any(word in ['am', 'is', 'are'] for word in words):
            return "Subject + Be + Complement"
        elif any(word in ['?'] for word in text):
            return "Question form"
        else:
            return "Subject + Verb + Object"