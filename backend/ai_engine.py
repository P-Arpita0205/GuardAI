import os
from google import genai
from dotenv import load_dotenv
import json
import re

load_dotenv()

# Configure New Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    client = genai.Client(api_key=api_key)
else:
    client = None

def analyze_profile_ai(bio_text: str, behavior_score: int, behavior_reasons: list):
    """
    Performs Intent detection AND Explanation generation in a single optimized call.
    """
    if not client:
        return "Normal", 0, 0.5, ["API Key missing"], "Using behavioral heuristics only."

    prompt = f"""
    Analyze this Instagram profile for security threats.
    Bio: "{bio_text}"
    Behavioral Data: {behavior_score}/100 Risk ({", ".join(behavior_reasons)})
    
    Task:
    1. Classify Intent: Normal, Spam, or Harassment.
    2. Assign a Final Risk Score: 0-100 (where 100 is most dangerous).
    3. Provide a 1-sentence human-readable summary explanation.
    
    Return ONLY a JSON object:
    {{
      "intent": "Normal | Spam | Harassment",
      "risk_score": number,
      "confidence": number,
      "explanation": "summary explanation",
      "reason": "internal logic reason"
    }}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=prompt
        )
        
        text = response.text
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            data = json.loads(match.group())
            return (
                data.get("intent", "Normal"), 
                data.get("risk_score", 0),
                data.get("confidence", 0.5), 
                [data.get("reason", "Analyzed by AI")],
                data.get("explanation", "Suspicious profile patterns detected.")
            )
        
        return "Normal", 0, 0.5, ["Parse error"], "Analysis completed with behavioral flags."
    except Exception as e:
        print(f"Error in Gemini Unified Call: {e}")
        return "Normal", 0, 0.5, [f"AI Error: {str(e)}"], "Security scan completed via behavioral engine."
