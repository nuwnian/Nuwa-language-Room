from fastapi import APIRouter, HTTPException, BackgroundTasks
from models.schemas import TextCorrectionRequest, TextCorrectionResponse
from services.openai_service import OpenAIService
from utils.text_processor import TextProcessor
import time
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/correct-text", response_model=TextCorrectionResponse)
async def correct_text(
    request: TextCorrectionRequest,
    background_tasks: BackgroundTasks
):
    """
    Analyze and correct text with detailed explanations.
    Provides grammar, spelling, vocabulary, and style corrections.
    """
    start_time = time.time()
    
    try:
        # Initialize services
        openai_service = OpenAIService()
        text_processor = TextProcessor()
        
        # Detect language if not specified or validate specified language
        detected_language = text_processor.detect_language(request.text)
        if detected_language != request.language:
            logger.warning(f"Detected language {detected_language} differs from specified {request.language}")
        
        # Get AI correction
        correction_result = await openai_service.correct_text(
            text=request.text,
            target_language=request.language,
            context=request.context,
            user_level=request.user_level
        )
        
        # Process and enhance the correction
        enhanced_result = text_processor.enhance_correction_result(
            original_text=request.text,
            correction_data=correction_result,
            language=request.language
        )
        
        processing_time = time.time() - start_time
        
        # Log successful correction for analytics (background task)
        background_tasks.add_task(
            log_correction_usage,
            request.language,
            len(request.text),
            len(enhanced_result.get('corrections', [])),
            processing_time
        )
        
        return TextCorrectionResponse(
            success=True,
            data=enhanced_result,
            processing_time=processing_time
        )
        
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Text correction failed: {e}")
        
        return TextCorrectionResponse(
            success=False,
            data={
                "error": str(e),
                "original_text": request.text,
                "message": "Failed to process text correction"
            },
            processing_time=processing_time
        )

@router.post("/batch-correct")
async def batch_correct_texts(
    texts: list[str],
    language: str = "en",
    context: str = "general"
):
    """
    Correct multiple texts in a single request.
    Useful for processing conversation history or multiple messages.
    """
    try:
        openai_service = OpenAIService()
        results = []
        
        for text in texts[:10]:  # Limit to 10 texts per batch
            if len(text.strip()) > 0:
                correction = await openai_service.correct_text(
                    text=text,
                    target_language=language,
                    context=context
                )
                results.append({
                    "original": text,
                    "result": correction
                })
        
        return {
            "success": True,
            "data": {
                "corrections": results,
                "total_processed": len(results)
            }
        }
        
    except Exception as e:
        logger.error(f"Batch correction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def log_correction_usage(language: str, text_length: int, corrections_count: int, processing_time: float):
    """Background task to log usage statistics"""
    try:
        # Here you would typically log to a database or analytics service
        logger.info(f"Correction usage: lang={language}, len={text_length}, corrections={corrections_count}, time={processing_time:.2f}s")
    except Exception as e:
        logger.error(f"Failed to log usage: {e}")