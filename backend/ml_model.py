# backend/ml_model.py
"""
XGBoost inference wrapper.
Loads the pre-trained model (built by train_model.py) and provides
predict() that maps extracted biomarkers → risk score + label.
"""
import os
import logging
import numpy as np
import joblib

logger = logging.getLogger(__name__)

MODEL_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(MODEL_DIR, "parkinson_model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "parkinson_scaler.joblib")

# Column order MUST match train_model.FEATURE_COLS
FEATURE_ORDER = [
    "fo_mean", "fo_max", "fo_min",
    "jitter_local", "jitter_abs", "jitter_rap", "jitter_ppq5", "jitter_ddp",
    "shimmer_local", "shimmer_db", "shimmer_apq3", "shimmer_apq5",
    "shimmer_apq11", "shimmer_dda",
    "nhr", "hnr", "ppe",
]

_model  = None
_scaler = None


def _load():
    global _model, _scaler
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "Model not trained yet. Run:  python backend/train_model.py"
            )
        _model  = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        logger.info("XGBoost model loaded ✅")


def predict(biomarkers: dict) -> dict:
    """
    Input:  biomarkers dict from audio_analyzer.extract_biomarkers()
    Output: {
        parkinson_prob: float 0-1,
        risk_score:     float 0-100,
        risk_label:     "Low" | "Medium" | "High",
        confidence:     float 0-100,
        model_version:  str,
        interpretation: str,
    }
    """
    _load()

    # Build feature vector in correct order
    vec = []
    for key in FEATURE_ORDER:
        val = biomarkers.get(key, 0.0)
        if val is None or (isinstance(val, float) and np.isnan(val)):
            val = 0.0
        vec.append(float(val))

    X = np.array([vec])
    X_scaled = _scaler.transform(X)

    logger.debug(f"Input Vec: {vec}")
    logger.debug(f"Scaled Vec: {X_scaled[0]}")

    prob_park  = float(_model.predict_proba(X_scaled)[0][1])   # P(Parkinson's)
    prediction = int(_model.predict(X_scaled)[0])               # 0 or 1

    # Confidence = how far from 0.5 the probability is
    confidence = round(abs(prob_park - 0.5) * 200, 1)          # 0-100%

    # Map probability to risk score (0-100)
    risk_score = round(prob_park * 100, 1)

    # Label thresholds
    if risk_score < 35:
        risk_label = "Low"
    elif risk_score < 65:
        risk_label = "Medium"
    else:
        risk_label = "High"

    # Interpretation text
    if risk_label == "Low":
        interpretation = (
            "Vocal biomarkers are within healthy norms. "
            "Continue daily monitoring to detect any longitudinal changes."
        )
    elif risk_label == "Medium":
        interpretation = (
            "Some vocal biomarkers deviate from clinical norms. "
            "This may indicate early-stage vocal changes consistent with neurological involvement. "
            "A neurologist consultation is recommended within 4 weeks."
        )
    else:
        interpretation = (
            "Multiple vocal biomarkers show significant deviation from healthy norms. "
            "Patterns are highly consistent with Parkinson's disease or parkinsonian syndrome. "
            "Urgent neurologist consultation is strongly advised (within 1 week)."
        )

    return {
        "parkinson_prob": round(prob_park, 4),
        "risk_score":     risk_score,
        "risk_label":     risk_label,
        "confidence":     confidence,
        "model_version":  "XGBoost-UCI-v1 (UCI-Parkinsons, Little 2008)",
        "interpretation": interpretation,
        "prediction":     prediction,
    }
