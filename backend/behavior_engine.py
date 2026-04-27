import re

def analyze_behavior(followers: int, following: int, bio: str, image_url: str):
    """
    Analyzes profile behavior based on heuristics and signals.
    Returns a behavior score (0-100) and a list of reasons.
    """
    score = 0
    reasons = []

    # 1. Follower-to-Following Ratio
    if following > 500 and followers < 50:
        score += 40
        reasons.append("Extreme follower-to-following ratio (Mass following behavior)")
    elif following > 2 * followers and following > 200:
        score += 20
        reasons.append("Unbalanced following/follower ratio")

    # 2. Bio Content Heuristics
    spam_keywords = ['crypto', 'invest', 'dm me', 'returns', 'free', 'money', '1000%', 'signals', 'profit', 'link in bio']
    bio_lower = bio.lower()
    
    found_keywords = [word for word in spam_keywords if word in bio_lower]
    if found_keywords:
        score += 50 # Increased from 30
        reasons.append(f"High-risk keywords found in bio: {', '.join(found_keywords)}")

    # 3. Emoji Density
    emojis = re.findall(r'[^\w\s,.]', bio)
    if len(emojis) > 3: # Lowered threshold
        score += 20
        reasons.append("Unnatural emoji density (Spam indicator)")

    # 4. Profile Completeness
    if not bio or len(bio) < 5:
        score += 30 # Increased from 15
        reasons.append("Low-effort/Incomplete profile bio")
        
    if "default" in image_url.lower() or "placeholder" in image_url.lower():
        score += 20
        reasons.append("Using default or placeholder profile image")

    # Cap score at 100
    score = min(score, 100)
    
    return score, reasons
