from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import uvicorn
import os
from dotenv import load_dotenv
import logging

from routers import correction, translation, analysis, recommendations
from middleware.rate_limit import RateLimitMiddleware
from utils.health_check import health_check

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Nuwa AI Service",
    description="Advanced AI microservice for language learning assistance",
    version="2.0.0",
    docs_url="/api/ai/docs",
    redoc_url="/api/ai/redoc"
)

# Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(RateLimitMiddleware, calls=100, period=60)  # 100 calls per minute
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(correction.router, prefix="/api/ai", tags=["Text Correction"])
app.include_router(translation.router, prefix="/api/ai", tags=["Translation"])
app.include_router(analysis.router, prefix="/api/ai", tags=["Language Analysis"])
app.include_router(recommendations.router, prefix="/api/ai", tags=["Learning Recommendations"])

# Health check endpoint
@app.get("/health")
async def health():
    return await health_check()

# Root endpoint
@app.get("/")
async def root():
    return {
        "service": "nuwa-ai-service",
        "version": "2.0.0",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "docs": "/api/ai/docs",
            "correction": "/api/ai/correct-text",
            "translation": "/api/ai/translate",
            "analysis": "/api/ai/analyze-language-level",
            "recommendations": "/api/ai/learning-suggestions"
        }
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8001)),
        reload=os.getenv("ENV") == "development"
    )