from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import os

app = FastAPI()

# Secure CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

class ChatMessage(BaseModel):
    message: str

class CorrectionRequest(BaseModel):
    message: str
    target_language: str = "id"

RESPONSES = [
    "That's interesting! Tell me more about it.",
    "I understand. How does that make you feel?",
    "Thanks for sharing that with me!",
    "What would you like to practice today?",
    "Great! Keep practicing your English."
]

@app.post("/chat")
async def chat(request: ChatMessage):
    response = random.choice(RESPONSES)
    return {"reply": response}

@app.post("/correction")
async def correction(request: CorrectionRequest):
    text = request.message
    
    corrected = text.capitalize()
    if not corrected.endswith('.'):
        corrected += '.'
    
    translations = {
        "hello": "halo",
        "good morning": "selamat pagi", 
        "thank you": "terima kasih",
        "how are you": "apa kabar",
        "i am fine": "saya baik-baik saja"
    }
    
    translated = translations.get(text.lower(), "Translation not available")
    
    return {
        "original": text,
        "corrected": corrected,
        "is_correct": text == corrected,
        "translation": translated,
        "grammar_note": "Basic sentence structure applied"
    }

@app.get("/")
async def root():
    return {"message": "Nuwa Language Room API"}