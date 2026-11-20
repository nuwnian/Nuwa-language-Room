from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class LanguageCode(str, Enum):
    ENGLISH = "en"
    SPANISH = "es"
    FRENCH = "fr"
    GERMAN = "de"
    ITALIAN = "it"
    PORTUGUESE = "pt"
    CHINESE = "zh"
    JAPANESE = "ja"
    KOREAN = "ko"
    RUSSIAN = "ru"

class TextCorrectionRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Text to be corrected")
    language: LanguageCode = Field(LanguageCode.ENGLISH, description="Target language for correction")
    context: str = Field("general", description="Context of the text (chat, email, academic, etc.)")
    user_level: str = Field("intermediate", description="User's language proficiency level")

class CorrectionItem(BaseModel):
    original: str
    corrected: str
    type: str  # grammar, spelling, vocabulary, style
    explanation: str
    position: Dict[str, int]  # start, end positions

class TextCorrectionResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    processing_time: float

class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    source_language: LanguageCode
    target_language: LanguageCode
    context: str = Field("general", description="Translation context")
    formality: str = Field("neutral", description="formal, informal, or neutral")

class TranslationResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    processing_time: float

class LanguageAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=5000)
    language: Optional[LanguageCode] = None

class LanguageAnalysisResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    processing_time: float

class LearningRecommendationsRequest(BaseModel):
    user_id: str
    native_language: LanguageCode
    learning_language: LanguageCode
    current_level: str = Field("beginner", description="beginner, elementary, intermediate, advanced")
    recent_corrections: Optional[List[str]] = []
    learning_goals: Optional[List[str]] = []

class LearningRecommendationsResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    processing_time: float

class HealthCheckResponse(BaseModel):
    service: str
    status: str
    timestamp: str
    version: str
    openai_status: str
    uptime: float