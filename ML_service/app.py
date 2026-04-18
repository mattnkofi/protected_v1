"""
ProtectEd ML Analysis API Service
Exposes the BERTopic VAWC detection model as a REST API.
Called by the Node.js backend after quiz submissions to analyze student answers.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --------------------------
# 1. Load the trained model
# --------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "vawc_bertopic_model")
print("Loading BERTopic model...")
try:
    # Lazy import to avoid crashing service when BERTopic/TensorFlow stack is incompatible.
    from bertopic import BERTopic  # pylint: disable=import-outside-toplevel
    model = BERTopic.load(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading BERTopic model, switching to keyword fallback mode: {e}")
    model = None

# --------------------------
# 2. Configuration
# --------------------------

TOPIC_MAPPING = {
    2: "Coercive Control",
    3: "Coercive Control",
    4: "Neglect",
    6: "Coercive Control",
    8: "Verbal/Emotional Abuse",
    1: "Neglect",
    5: "Verbal/Emotional Abuse"
}

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
    "Neutral / Unclassified": {
        "risk": "Low",
        "behaviors": ["No significant abuse markers detected."]
    }
}

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
# 3. Detection Logic
# --------------------------

def manual_fallback_check(user_input):
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
    """Main detection: AI first, then keyword fallback."""
    if model is None:
        # If model failed to load, use keyword fallback only
        final_category = manual_fallback_check(user_input)
        info = CATEGORIES_INFO.get(final_category, CATEGORIES_INFO["Neutral / Unclassified"])
        return final_category, info["risk"], info["behaviors"], "Manual Keyword Fallback (model unavailable)"

    topics, probs = model.transform([user_input])
    ai_topic_id = topics[0]

    if ai_topic_id in TOPIC_MAPPING:
        final_category = TOPIC_MAPPING[ai_topic_id]
        method = f"AI Prediction (Topic {ai_topic_id})"
    else:
        final_category = manual_fallback_check(user_input)
        method = "Manual Keyword Fallback"
        if ai_topic_id == -1 and final_category == "Neutral / Unclassified":
            method = "System (No patterns detected)"

    info = CATEGORIES_INFO.get(final_category, CATEGORIES_INFO["Neutral / Unclassified"])
    return final_category, info["risk"], info["behaviors"], method


def analyze_answers(answers):
    """
    Analyze a list of answer texts and return per-answer results + summary.
    answers: list of strings (the student's answer texts from quiz)
    """
    results = []
    category_counts = {}
    risk_levels_seen = set()
    moderate_count = 0
    high_or_severe_count = 0

    for answer_text in answers:
        if not answer_text or not isinstance(answer_text, str) or answer_text.strip() == "":
            results.append({
                "answer_text": answer_text or "",
                "category": "Neutral / Unclassified",
                "risk_level": "Low",
                "behaviors": ["No significant abuse markers detected."],
                "detection_method": "Skipped (empty answer)"
            })
            continue

        category, risk, behaviors, method = hybrid_detect(answer_text.strip())
        results.append({
            "answer_text": answer_text,
            "category": category,
            "risk_level": risk,
            "behaviors": behaviors,
            "detection_method": method
        })
        category_counts[category] = category_counts.get(category, 0) + 1
        risk_levels_seen.add(risk)
        if risk == "Moderate":
            moderate_count += 1
        if risk in ("High", "Severe"):
            high_or_severe_count += 1

    # Determine overall risk level (highest found)
    risk_priority = {"Severe": 4, "High": 3, "Moderate": 2, "Low": 1}
    overall_risk = "Low"
    for risk in risk_levels_seen:
        if risk_priority.get(risk, 0) > risk_priority.get(overall_risk, 0):
            overall_risk = risk

    # Determine dominant category
    dominant_category = "Neutral / Unclassified"
    if category_counts:
        dominant_category = max(category_counts, key=category_counts.get)

    # Count only repeated moderate signals or any high/severe signal as concerning.
    concerning_count = high_or_severe_count + max(0, moderate_count - 1)

    summary = {
        "total_answers_analyzed": len(answers),
        "overall_risk_level": overall_risk,
        "dominant_category": dominant_category,
        "category_breakdown": category_counts,
        "concerning_answers_count": concerning_count,
        "flags_detected": high_or_severe_count > 0 or moderate_count >= 2
    }

    return results, summary


# --------------------------
# 4. API Endpoints
# --------------------------

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None
    })


@app.route("/api/analyze", methods=["POST"])
def analyze():
    """
    Analyze quiz answers for VAWC indicators.
    
    Expected JSON body:
    {
        "answers": ["answer text 1", "answer text 2", ...],
        "user_id": 123,       (optional, for logging)
        "quiz_id": 456        (optional, for logging)
    }
    
    Returns:
    {
        "success": true,
        "results": [...per-answer analysis...],
        "summary": {...aggregate analysis...}
    }
    """
    data = request.get_json()
    if not data or "answers" not in data:
        return jsonify({"success": False, "error": "Missing 'answers' field"}), 400

    answers = data["answers"]
    if not isinstance(answers, list):
        return jsonify({"success": False, "error": "'answers' must be a list of strings"}), 400

    try:
        results, summary = analyze_answers(answers)
        return jsonify({
            "success": True,
            "results": results,
            "summary": summary
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/analyze-single", methods=["POST"])
def analyze_single():
    """Analyze a single text input."""
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"success": False, "error": "Missing 'text' field"}), 400

    text = data["text"]
    try:
        category, risk, behaviors, method = hybrid_detect(text)
        return jsonify({
            "success": True,
            "result": {
                "text": text,
                "category": category,
                "risk_level": risk,
                "behaviors": behaviors,
                "detection_method": method
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("ML_SERVICE_PORT", 5001))
    print(f"Starting ML Analysis API on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)
