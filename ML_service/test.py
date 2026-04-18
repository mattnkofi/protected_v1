import pandas as pd

from bertopic import BERTopic

# --------------------------
# 1. LOad ng model
# --------------------------
print("➡ Loading trained BERTopic model...")
try:
    model = BERTopic.load("vawc_bertopic_model")  # path ng model
    print("✔ AI Model loaded successfully!\n")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("Make sure 'vawc_bertopic_model' folder is in the same directory.")
    exit()

# --------------------------
# 2. CONFIGURATION (The New AI Part)
# --------------------------

# [NEW] This maps the AI's "Topic Numbers" to your specific Categories.
# Based on your check_topics.py results:
TOPIC_MAPPING = {
    2: "Coercive Control",                # AI detected: uses_manipulates_threats
    3: "Coercive Control",                # AI detected: pressures_into_rules
    4: "Neglect",                         # AI detected: isolates_from_family
    6: "Coercive Control",                # AI detected: hides_evidence_hobbies
    8: "Verbal/Emotional Abuse",          # AI detected: exaggerates_minor_fear
    1: "Neglect",                         # AI detected: avoids_expressing
    5: "Verbal/Emotional Abuse"           # AI detected: fears_unsafe_expressing
    # Note: Physical Aggression is handled by the Manual Fallback below because the AI missed it.
}

# [EXISTING] Your Risk & Behavior Database
CATEGORIES_INFO = {
    "Coercive Control": {
        "risk": "Moderate",
        "behaviors": ["monitoring phone", "controlling messages", "checking location", "forcing compliance", "restricting contact"]
    },
    "Verbal/Emotional Abuse": {
        "risk": "Moderate",
        "behaviors": ["yelling", "shouting", "insulting", "blaming", "mocking", "humiliating", "intimidating"]
    },
    "Neglect": {
        "risk": "Low",
        "behaviors": ["ignoring", "withdrawing affection", "isolating", "silent treatment", "withholding support"]
    },
    "Physical Aggression": {
        "risk": "Severe",
        "behaviors": ["hitting", "pushing", "slapping", "throwing objects", "punching", "kicking"]
    },
    "Support & Affection": {
        "risk": "Low",
        "behaviors": ["listening", "hugging", "kissing", "giving compliments", "being caring"]
    },
    "Healthy Communication": {
        "risk": "Low",
        "behaviors": ["discussing feelings", "apologizing sincerely", "problem solving together"]
    },
    "Trust & Respect": {
        "risk": "Low",
        "behaviors": ["respecting privacy", "allowing personal space", "supporting decisions"]
    },
    # Fallback category
    "Neutral / Unclassified": {
        "risk": "Low",
        "behaviors": ["No significant abuse markers detected."]
    }
}

# [EXISTING] Your Keywords (Used as Backup if AI is unsure)
KEYWORD_TO_CATEGORY = {
    "ignore": "Neglect",
    "shout": "Verbal/Emotional Abuse",
    "yell": "Verbal/Emotional Abuse",
    "insult": "Verbal/Emotional Abuse",
    "blame": "Verbal/Emotional Abuse",
    "mock": "Verbal/Emotional Abuse",
    "humiliate": "Verbal/Emotional Abuse",
    "threat": "Coercive Control",
    "control": "Coercive Control",
    "monitor": "Coercive Control",
    "check": "Coercive Control",
    "password": "Coercive Control",
    "guilt": "Coercive Control",
    "restrict": "Coercive Control",
    "isolate": "Neglect",
    "prevent": "Neglect",
    "limit": "Neglect",
    "withhold": "Neglect",
    "hit": "Physical Aggression",
    "push": "Physical Aggression",
    "slap": "Physical Aggression",
    "throw": "Physical Aggression",
    "punch": "Physical Aggression",
    "kick": "Physical Aggression",
    "hug": "Support & Affection",
    "kiss": "Support & Affection",
    "compliment": "Support & Affection",
    "listen": "Healthy Communication",
    "discuss": "Healthy Communication",
    "respect": "Trust & Respect",
    "support": "Trust & Respect",
    "care": "Support & Affection",
    "space": "Trust & Respect"
}

CATEGORY_PRIORITY = [
    "Physical Aggression",
    "Coercive Control",
    "Verbal/Emotional Abuse",
    "Neglect",
    "Support & Affection",
    "Healthy Communication",
    "Trust & Respect"
]

# --------------------------
# 3. DETECTION LOGIC
# --------------------------

def manual_fallback_check(user_input):
    """Your original function, used only if AI fails."""
    user_input_lower = user_input.lower()
    detected = []

    for keyword, category in KEYWORD_TO_CATEGORY.items():
        if keyword in user_input_lower:
            detected.append(category)

    if not detected:
        return "Neutral / Unclassified"

    for category in CATEGORY_PRIORITY:
        if category in detected:
            return category

    return detected[0]

def hybrid_detect(user_input):
    """Main function: Asks AI first, then checks Keywords."""
    
    # STEP 1: Ask the BERTopic AI Model
    # transform returns a list of topics, we take the first one
    topics, probs = model.transform([user_input])
    ai_topic_id = topics[0] 

    # STEP 2: Check if AI found a known topic
    if ai_topic_id in TOPIC_MAPPING:
        # Success! The AI knows this pattern.
        final_category = TOPIC_MAPPING[ai_topic_id]
        method = f"AI Prediction (Topic {ai_topic_id})"
    
    else:
        # STEP 3: AI is unsure (Topic -1 or unmapped), use Manual Fallback
        final_category = manual_fallback_check(user_input)
        method = "Manual Keyword Fallback"
        
        # Special Case: If AI said -1 but keywords found nothing, it's Neutral
        if ai_topic_id == -1 and final_category == "Neutral / Unclassified":
            method = "System (No patterns detected)"

    # Retrieve details
    info = CATEGORIES_INFO.get(final_category, CATEGORIES_INFO["Neutral / Unclassified"])
    
    return final_category, info['risk'], info['behaviors'], method

# --------------------------
# 4. USER INTERFACE LOOP
# --------------------------
print("-" * 50)
print("🛡️  ProtectEd AI Detection System Ready")
print("Type a statement about your relationship (or 'exit').")
print("-" * 50)

while True:
    user_input = input("\nUser > ").strip()
    if user_input.lower() == "exit":
        print("Exiting...")
        break
    
    if not user_input: continue

    # Run the Hybrid Detection
    category, risk, behaviors, method = hybrid_detect(user_input)

    # Print Results
    print(f"   -------------------------------------------")
    print(f"   🛠️  Detection Method: {method}")
    print(f"   🏷️  Category:         {category}")
    print(f"   ⚠️  Risk Level:       {risk}")
    print(f"   📋  Typical Behaviors: {', '.join(behaviors)}")
    print(f"   -------------------------------------------")