import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from unified_engine import analyze_profile_unified
from behavior_engine import analyze_behavior

app = FastAPI(title="GuardAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProfileData(BaseModel):
    username: str
    followers: int
    following: int
    bio: str
    image_url: str

class AnalysisResponse(BaseModel):
    risk_score: int
    behavior_score: int
    label: str
    intent: str
    visual: str
    confidence: float
    reasons: List[str]
    explanation: str

@app.get("/")
async def root():
    return {"message": "GuardAI API is running"}

@app.post("/analyze-profile", response_model=AnalysisResponse)
async def analyze_profile(profile: ProfileData):
    # 1. Local Behavioral Check (Instant)
    behavior_score, behavior_reasons = analyze_behavior(
        profile.followers, 
        profile.following, 
        profile.bio, 
        profile.image_url
    )
    
    # 2. Optimized Unified AI Call (Text + Vision in ONE call)
    # We run this in a thread since the client is synchronous
    ai_data = await asyncio.to_thread(
        analyze_profile_unified,
        profile.username,
        profile.bio,
        profile.followers,
        profile.following,
        profile.image_url
    )
    
    # 3. Combine Results
    risk_score = ai_data.get("risk_score", 0)
    intent = ai_data.get("intent", "Normal")
    visual = ai_data.get("visual", "Unknown")
    
    # Labeling logic
    if risk_score >= 75 or intent == "Harassment":
        label = "High Risk"
    elif risk_score >= 35 or intent == "Spam":
        label = "Suspicious"
    else:
        label = "Safe"
    
    # Combine reasons
    all_reasons = list(set(ai_data.get("reasons", []) + behavior_reasons))
    
    return {
        "risk_score": risk_score,
        "behavior_score": int(behavior_score),
        "label": label,
        "intent": intent,
        "visual": visual,
        "confidence": ai_data.get("confidence", 0.5),
        "reasons": all_reasons,
        "explanation": ai_data.get("explanation", "Analysis complete.")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
