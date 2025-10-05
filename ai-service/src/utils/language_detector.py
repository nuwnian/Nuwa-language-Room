import re
from langdetect import detect, DetectorFactory

DetectorFactory.seed = 0

def detect_language(text):
    """Detect language of input text"""
    try:
        # Check for specific character patterns first
        if re.search(r'[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]', text):
            if re.search(r'[\u3040-\u309F\u30A0-\u30FF]', text):
                return 'ja'  # Japanese (hiragana/katakana present)
            return 'zh'  # Chinese (only kanji/hanzi)
        
        # Use langdetect for other languages
        detected = detect(text)
        return detected
    except:
        return 'en'  # Default to English

def get_language_name(code):
    """Convert language code to readable name"""
    names = {
        'en': 'English',
        'ja': 'Japanese', 
        'zh': 'Chinese',
        'id': 'Indonesian'
    }
    return names.get(code, 'Unknown')