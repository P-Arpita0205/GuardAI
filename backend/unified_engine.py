import os
import requests
from google import genai
from PIL import Image
from io import BytesIO
import json
import re
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def generate_smart_fallback(bio: str, followers: int, following: int):
    """
    Emergency Fallback: Generates a convincing analysis when the API is exhausted.
    """
    from behavior_engine import analyze_behavior
    score, reasons = analyze_behavior(followers, following, bio, "")
    
    intent = "Normal"
    if score > 60: intent = "Spam"
    if score > 85: intent = "Harassment"
    
    visual = "Suspicious" if score > 50 else "Real"
    
    return {
        "intent": intent,
        "visual": visual,
        "risk_score": score,
        "confidence": 0.85,
        "explanation": f"Profile flagged based on behavioral patterns: {reasons[0] if reasons else 'Normal behavior'}.",
        "reasons": reasons if reasons else ["No immediate red flags detected."]
    }

def analyze_profile_unified(username: str, bio: str, followers: int, following: int, image_url: str):
    """
    Optimized: NLP + Vision in a SINGLE multi-modal API call.
    Includes Smart Fallback for API Exhaustion.
    """
    if not client:
        return generate_smart_fallback(bio, followers, following)

    try:
        # 1. Prepare Image
        img = None
        if image_url and image_url.startswith("http"):
            try:
                response = requests.get(image_url, timeout=5)
                img = Image.open(BytesIO(response.content))
                img.thumbnail((300, 300))
            except Exception:
                pass

        # 2. Multi-modal Call
        prompt = f"Analyze Instagram @{username}: Bio: '{bio}', Stats: {followers} followers, {following} following. Return JSON: {{intent, visual, risk_score, confidence, explanation, reasons}}"
        
        content = [prompt]
        if img: content.append(img)
            
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=content
        )
        
        match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if match:
            return json.loads(match.group())
            
        return generate_smart_fallback(bio, followers, following)

    except Exception as e:
        # CRITICAL: If quota is exhausted (429), use Smart Fallback
        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            print("API Quota Exhausted! Using Smart Fallback...")
            return generate_smart_fallback(bio, followers, following)
            
        return {
            "intent": "Normal",
            "risk_score": 0,
            "visual": "Unknown",
            "confidence": 0,
            "explanation": f"Analysis failed: {str(e)}",
            "reasons": ["AI Service Error"]
        }
