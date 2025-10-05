from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models.ai_handler import AIHandler
from utils.language_detector import detect_language, get_language_name
import os

app = FastAPI(title="Nuwa Language Room AI Service")

# Secure CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:8000,http://127.0.0.1:8000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

ai_handler = AIHandler()

class ChatRequest(BaseModel):
    message: str
    user_id: str = None

class ProcessResponse(BaseModel):
    response: str
    correction: dict
    translation: str
    language: str
    grammar_formula: str

@app.post("/process", response_model=ProcessResponse)
async def process_message(request: ChatRequest):
    """Process user message and return AI response with corrections"""
    try:
        message = request.message.strip()
        
        # Detect language
        detected_lang = detect_language(message)
        
        # Generate AI response
        ai_response = ai_handler.generate_chat_response(message, detected_lang)
        
        # Get grammar correction
        correction = ai_handler.correct_grammar(message)
        
        # Get translation (English <-> Indonesian for now)
        target_lang = 'id' if detected_lang == 'en' else 'en'
        translation = ai_handler.translate_text(message, target_lang)
        
        return ProcessResponse(
            response=ai_response,
            correction=correction,
            translation=translation,
            language=get_language_name(detected_lang),
            grammar_formula=correction['grammar_formula']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "nuwa-ai-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)