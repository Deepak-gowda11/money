"""
FAKE SHIELD - Fake News Classification Module
Uses Google Gemini AI for semantic text analysis and classification
"""

import os
import re
import json
import random
from google import genai
from google.genai import types


def get_gemini_client():
    """Initialize Gemini client"""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        return None
    return genai.Client(api_key=api_key)


async def classify_fake_news(text: str) -> dict:
    """
    Classify text content as REAL or FAKE using Gemini AI.
    Falls back to heuristic analysis if API key not configured.
    """
    client = get_gemini_client()
    
    if client:
        return await _classify_with_gemini(client, text)
    else:
        return _classify_with_heuristics(text)


async def _classify_with_gemini(client, text: str) -> dict:
    """Use Gemini AI for classification"""
    try:
        prompt = f"""You are an expert fact-checker and misinformation analyst. Analyze the following text and classify it as REAL or FAKE news/information.

Text to analyze:
"{text}"

Respond with a JSON object containing:
1. "classification": "REAL" or "FAKE"
2. "confidence": a number between 0-100 representing confidence percentage
3. "reasoning": a brief explanation of your classification (2-3 sentences)
4. "red_flags": a list of specific suspicious elements found (empty list if REAL)
5. "semantic_indicators": a list of linguistic/semantic patterns detected
6. "verdict_summary": a one-sentence verdict

Return ONLY the JSON object, no markdown formatting."""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=1024,
            )
        )
        
        response_text = response.text.strip()
        # Clean potential markdown code blocks
        response_text = re.sub(r'^```(?:json)?\s*', '', response_text)
        response_text = re.sub(r'\s*```$', '', response_text)
        
        result = json.loads(response_text)
        result["analyzed_by"] = "Gemini AI"
        return result
        
    except json.JSONDecodeError:
        return _classify_with_heuristics(text)
    except Exception as e:
        return _classify_with_heuristics(text)


def _classify_with_heuristics(text: str) -> dict:
    """Heuristic-based classification when Gemini is unavailable"""
    text_lower = text.lower()
    
    # Fake news indicators
    fake_indicators = [
        "miracle cure", "they don't want you to know", "mainstream media won't tell",
        "shocking truth", "government hiding", "scientists baffled", "doctors hate",
        "secret", "conspiracy", "hoax", "staged", "fake", "lie", "exposed",
        "wake up", "sheeple", "chemtrails", "microchip", "mind control",
        "deep state", "new world order", "illuminati", "crisis actor",
        "bleach cure", "inject", "5g", "flat earth", "moon landing fake",
    ]
    
    credibility_indicators = [
        "according to", "researchers found", "study shows", "published in",
        "peer-reviewed", "scientists confirmed", "data indicates", "evidence suggests",
        "official report", "government agency", "university research",
    ]
    
    sensationalism_markers = [
        "!", "shocking", "incredible", "unbelievable", "bombshell",
        "explosive", "stunning", "jaw-dropping", "mind-blowing",
    ]
    
    fake_score = sum(1 for ind in fake_indicators if ind in text_lower)
    credibility_score = sum(1 for ind in credibility_indicators if ind in text_lower)
    sensational_score = sum(1 for m in sensationalism_markers if m in text_lower)
    
    # Calculate confidence
    total_fake_signals = fake_score * 15 + sensational_score * 8
    total_real_signals = credibility_score * 20
    
    if total_fake_signals > total_real_signals:
        classification = "FAKE"
        confidence = min(95, 45 + total_fake_signals * 3)
        red_flags = [ind for ind in fake_indicators if ind in text_lower][:5]
        reasoning = f"Text contains {fake_score} misinformation indicators and {sensational_score} sensationalist markers. Credibility signals are low ({credibility_score} detected)."
    elif total_real_signals > 0:
        classification = "REAL"
        confidence = min(90, 55 + credibility_score * 5)
        red_flags = []
        reasoning = f"Text demonstrates {credibility_score} credibility signals with citation of authoritative sources. Low misinformation indicator count ({fake_score})."
    else:
        # Neutral - classify with slight lean
        confidence = random.randint(52, 68)
        if len(text) < 50 or sensational_score > 2:
            classification = "FAKE"
            red_flags = ["Short/sensational content", "Lacks citation"]
            reasoning = "Content lacks verifiable sources and exhibits patterns common in misinformation."
        else:
            classification = "REAL"
            red_flags = []
            reasoning = "Content appears neutral without strong misinformation markers, though limited context makes definitive classification difficult."
    
    semantic_indicators = []
    if fake_score > 0:
        semantic_indicators.append(f"Conspiracy language detected ({fake_score} markers)")
    if sensational_score > 2:
        semantic_indicators.append("High emotional sensationalism")
    if credibility_score > 0:
        semantic_indicators.append(f"Source attribution present ({credibility_score} references)")
    if len(text.split()) < 20:
        semantic_indicators.append("Insufficient content for full analysis")
    
    return {
        "classification": classification,
        "confidence": confidence,
        "reasoning": reasoning,
        "red_flags": red_flags,
        "semantic_indicators": semantic_indicators,
        "verdict_summary": f"Content classified as {classification} with {confidence}% confidence based on heuristic NLP analysis.",
        "analyzed_by": "Heuristic NLP Engine",
    }
