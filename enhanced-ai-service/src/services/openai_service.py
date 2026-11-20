import openai
import os
import json
import logging
from typing import Dict, List, Any, Optional
import asyncio

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
    async def correct_text(
        self, 
        text: str, 
        target_language: str = "en", 
        context: str = "general",
        user_level: str = "intermediate"
    ) -> Dict[str, Any]:
        """
        Correct text using OpenAI GPT model with detailed analysis.
        """
        try:
            prompt = self._build_correction_prompt(text, target_language, context, user_level)
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert language teacher specializing in grammar correction and language learning assistance. Provide detailed, educational feedback."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return self._process_correction_response(result, text)
            
        except Exception as e:
            logger.error(f"OpenAI correction failed: {e}")
            return self._fallback_correction_response(text, str(e))
    
    async def translate_text(
        self, 
        text: str, 
        source_lang: str, 
        target_lang: str,
        context: str = "general",
        formality: str = "neutral"
    ) -> Dict[str, Any]:
        """
        Translate text with context awareness and style preferences.
        """
        try:
            prompt = self._build_translation_prompt(text, source_lang, target_lang, context, formality)
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional translator with expertise in cultural nuances and context-appropriate translations."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.2,
                max_tokens=1500,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            logger.error(f"OpenAI translation failed: {e}")
            return {"error": str(e), "translation": text}
    
    async def analyze_language_level(self, text: str, language: str = "en") -> Dict[str, Any]:
        """
        Analyze text complexity and suggest appropriate language level.
        """
        try:
            prompt = f"""
            Analyze the following text in {language} and provide a detailed language level assessment:

            Text: "{text}"

            Please provide a JSON response with:
            {{
                "detected_level": "beginner|elementary|intermediate|upper-intermediate|advanced",
                "confidence": 0.85,
                "complexity_factors": {{
                    "vocabulary_difficulty": "explanation",
                    "grammar_complexity": "explanation",
                    "sentence_structure": "explanation"
                }},
                "readability_score": 65,
                "suggestions_for_improvement": ["suggestion1", "suggestion2"],
                "estimated_cefr_level": "B2"
            }}
            """
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a language assessment expert specializing in CEFR levels and readability analysis."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Language level analysis failed: {e}")
            return {"error": str(e)}
    
    async def generate_learning_suggestions(
        self, 
        user_corrections: List[str], 
        native_lang: str, 
        target_lang: str,
        current_level: str = "intermediate"
    ) -> Dict[str, Any]:
        """
        Generate personalized learning suggestions based on user's correction history.
        """
        try:
            prompt = f"""
            Based on the following correction patterns for a {current_level} level student learning {target_lang} (native: {native_lang}), 
            provide personalized learning recommendations:

            Recent corrections: {user_corrections[:10]}  # Limit to recent corrections

            Please provide a JSON response with:
            {{
                "priority_areas": [
                    {{
                        "area": "Grammar - Present Perfect",
                        "importance": "high",
                        "explanation": "why this needs attention",
                        "exercises": ["specific exercise suggestions"]
                    }}
                ],
                "vocabulary_gaps": ["word1", "word2"],
                "study_plan": {{
                    "daily_focus": "what to practice daily",
                    "weekly_goals": ["goal1", "goal2"],
                    "resources": ["resource recommendations"]
                }},
                "motivation_message": "personalized encouragement"
            }}
            """
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a personalized language learning coach who creates tailored study plans based on student performance."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Learning suggestions generation failed: {e}")
            return {"error": str(e)}
    
    def _build_correction_prompt(self, text: str, language: str, context: str, user_level: str) -> str:
        """Build a comprehensive correction prompt."""
        return f"""
        Please correct the following {language} text and provide detailed educational feedback suitable for a {user_level} level learner.
        Context: {context}
        
        Text to correct: "{text}"
        
        Please provide a JSON response with the following structure:
        {{
            "has_corrections": true,
            "corrected_text": "fully corrected version",
            "corrections": [
                {{
                    "original": "incorrect phrase",
                    "corrected": "correct phrase",
                    "type": "grammar|spelling|vocabulary|style|punctuation",
                    "explanation": "clear explanation suitable for {user_level} level",
                    "position": {{"start": 0, "end": 10}},
                    "severity": "minor|moderate|major"
                }}
            ],
            "overall_feedback": "general assessment of the text quality",
            "language_tips": ["tip1 for improvement", "tip2"],
            "confidence": 0.95
        }}
        
        If there are no corrections needed, set "has_corrections": false and provide encouragement.
        """
    
    def _build_translation_prompt(self, text: str, source: str, target: str, context: str, formality: str) -> str:
        """Build a translation prompt with context and style considerations."""
        return f"""
        Translate the following text from {source} to {target}.
        Context: {context}
        Formality level: {formality}
        
        Text: "{text}"
        
        Please provide a JSON response:
        {{
            "translation": "translated text",
            "alternative_translations": ["option1", "option2"],
            "cultural_notes": "any cultural considerations",
            "confidence": 0.95,
            "formality_applied": "{formality}"
        }}
        """
    
    def _process_correction_response(self, result: Dict[str, Any], original_text: str) -> Dict[str, Any]:
        """Process and validate the correction response."""
        # Add additional processing, validation, or enhancement here
        result["original_text"] = original_text
        result["processed_at"] = "2024-01-01T00:00:00Z"  # Add timestamp
        return result
    
    def _fallback_correction_response(self, text: str, error: str) -> Dict[str, Any]:
        """Provide a fallback response when OpenAI fails."""
        return {
            "has_corrections": False,
            "corrected_text": text,
            "corrections": [],
            "overall_feedback": "Unable to process corrections at this time.",
            "error": error,
            "confidence": 0.0
        }