import os
import requests
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import json
import re
from dotenv import load_dotenv

load_dotenv()

# Configure New Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    client = genai.Client(api_key=api_key)
else:
    client = None

def analyze_image_with_gemini(image_url: str):
    """
    Analyzes an image using the new Gemini SDK.
    """
    if not client:
        return {"label": "Unknown", "confidence": 0, "reason": "Gemini API Key missing"}

    try:
        # 1. Download & Resize (Optimization)
        if any(x in image_url for x in ["localhost", "127.0.0.1", "https://"]):
            response = requests.get(image_url, timeout=10)
            img = Image.open(BytesIO(response.content))
            
            # Resize to 300x300 for maximum speed
            img.thumbnail((300, 300)) 
        else:
            return {"label": "Unknown", "confidence": 0, "reason": f"Invalid URL format: {image_url}"}

        # 2. Analyze with Gemini
        prompt = """
        Analyze this profile picture. Is it a real human photo, AI-generated, or suspicious?
        
        Return ONLY a JSON object:
        {
          "label": "Real | AI-generated | Suspicious",
          "confidence": number (0-1),
          "reason": "short explanation"
        }
        """
        
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=[prompt, img]
        )
        
        # 3. Parse Response
        text = response.text
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
            
        return {"label": "Unknown", "confidence": 0.5, "reason": "Failed to parse AI response"}

    except Exception as e:
        print(f"Error in Gemini Vision: {e}")
        return {"label": "Error", "confidence": 0, "reason": f"Analysis failed: {str(e)}"}
