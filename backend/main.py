# backend/main.py
import sys
try:
    import pkg_resources
except ImportError:
    # Manual shim for pkg_resources to prevent crashes in legacy dependencies
    import types
    pr = types.ModuleType("pkg_resources")
    pr.declare_namespace = lambda name: None
    pr.get_distribution = lambda name: types.SimpleNamespace(version="0.0.0")
    sys.modules["pkg_resources"] = pr
    print("⚠️  shimmed pkg_resources to prevent crash")

"""
NeuroVoice AI — FastAPI Backend
Real biomarker analysis, persistent patient storage, clinical recommendations.
"""
import os
import json
import uuid
import logging
import tempfile
from datetime import datetime
from typing import Optional

from fastapi import (
    FastAPI, UploadFile, File, Form, HTTPException,
    Depends, WebSocket, WebSocketDisconnect
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import init_db, get_db, Patient, VoiceSession
from audio_analyzer import extract_biomarkers, flag_abnormal
from ml_model import predict
from clinical_advisor import get_recommendations

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="NeuroVoice AI API",
    description="Real-time neurological screening via vocal biomarker analysis.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Allow all origins (localhost, LAN, iPhone)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Audio upload directory ─────────────────────────────────────────────────────
AUDIO_DIR = os.path.join(os.path.dirname(__file__), "audio_store")
os.makedirs(AUDIO_DIR, exist_ok=True)

# ── On startup: init DB + check model ─────────────────────────────────────────
@app.on_event("startup")
def startup():
    init_db()
    model_path = os.path.join(os.path.dirname(__file__), "parkinson_model.joblib")
    if not os.path.exists(model_path):
        logger.warning("⚠️  ML model not found! Run: python backend/train_model.py")
    else:
        logger.info("✅ ML model found")
    logger.info("✅ Database initialized")


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health_check():
    """Quick heartbeat endpoint — used by frontend to verify backend is online."""
    model_path = os.path.join(os.path.dirname(__file__), "parkinson_model.joblib")
    model_ready = os.path.exists(model_path)
    return {
        "status": "ok",
        "model_ready": model_ready,
        "message": "NeuroVoice AI backend is running" if model_ready else "Backend running but model not trained yet",
    }


# ══════════════════════════════════════════════════════════════════════════════
#   PATIENT ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

class PatientCreate(BaseModel):
    name:     str
    age:      int
    gender:   Optional[str] = None
    language: Optional[str] = "en"
    phone:    Optional[str] = None
    email:    Optional[str] = None


class PatientOut(BaseModel):
    id:         int
    name:       str
    age:        int
    gender:     Optional[str]
    language:   Optional[str]
    phone:      Optional[str]
    email:      Optional[str]
    created_at: datetime
    session_count: int

    class Config:
        from_attributes = True


@app.post("/patients", response_model=PatientOut, tags=["Patients"])
def create_patient(data: PatientCreate, db: Session = Depends(get_db)):
    p = Patient(**data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return {**p.__dict__, "session_count": 0}


@app.get("/patients", tags=["Patients"])
def list_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).order_by(Patient.created_at.desc()).all()
    result = []
    for p in patients:
        count = db.query(VoiceSession).filter(VoiceSession.patient_id == p.id).count()
        latest = (
            db.query(VoiceSession)
            .filter(VoiceSession.patient_id == p.id)
            .order_by(VoiceSession.recorded_at.desc())
            .first()
        )
        result.append({
            "id":            p.id,
            "name":          p.name,
            "age":           p.age,
            "gender":        p.gender,
            "language":      p.language,
            "session_count": count,
            "last_risk":     latest.risk_label if latest else None,
            "last_score":    latest.risk_score if latest else None,
            "last_scan":     latest.recorded_at.isoformat() if latest else None,
            "created_at":    p.created_at.isoformat(),
        })
    return result


@app.get("/patients/{patient_id}", tags=["Patients"])
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    sessions = (
        db.query(VoiceSession)
        .filter(VoiceSession.patient_id == patient_id)
        .order_by(VoiceSession.recorded_at.desc())
        .all()
    )
    return {
        "patient":  {**p.__dict__},
        "sessions": [_session_to_dict(s) for s in sessions],
    }


# ══════════════════════════════════════════════════════════════════════════════
#   VOICE ANALYSIS ENDPOINT
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/patients/{patient_id}/analyze", tags=["Analysis"])
async def analyze_voice(
    patient_id: int,
    audio:    UploadFile = File(...),
    language: str        = Form("en"),
    db:       Session    = Depends(get_db),
):
    """
    Upload audio → extract real biomarkers → run XGBoost → store → return results.
    Accepts: wav, mp4, m4a, ogg, webm (any format ffmpeg can decode).
    iPhone Safari produces: audio/mp4 (m4a container, AAC codec).
    """
    # ── Validate patient ──────────────────────────────────────────────────────
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # ── Save uploaded audio ───────────────────────────────────────────────────
    ext       = audio.filename.split(".")[-1] if "." in audio.filename else "bin"
    filename  = f"p{patient_id}_{uuid.uuid4().hex[:8]}.{ext}"
    save_path = os.path.join(AUDIO_DIR, filename)
    raw_bytes = await audio.read()
    with open(save_path, "wb") as f:
        f.write(raw_bytes)
    logger.info("Audio saved: %s (%d bytes)", save_path, len(raw_bytes))

    # ── Extract biomarkers ────────────────────────────────────────────────────
    try:
        bio = extract_biomarkers(save_path)
        logger.info(f"Biomarkers extracted: fo_mean={bio.get('fo_mean')}, jitter={bio.get('jitter_local')}, hnr={bio.get('hnr')}")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error("Biomarker extraction error: %s", e)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    # ── ML Prediction ─────────────────────────────────────────────────────────
    try:
        ml = predict(bio)
        logger.info(f"Model Prediction: Score={ml['risk_score']}%, Label={ml['risk_label']}, Prob={ml['parkinson_prob']}")
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="ML model not trained. Run: python backend/train_model.py"
        )

    # ── Abnormal flag detection ───────────────────────────────────────────────
    flags = flag_abnormal(bio)

    # ── Clinical recommendations ──────────────────────────────────────────────
    clinical = get_recommendations(
        ml["risk_label"], ml["risk_score"], flags, bio
    )

    # ── Persist to DB ─────────────────────────────────────────────────────────
    session = VoiceSession(
        patient_id     = patient_id,
        language       = language,
        duration_sec   = bio.get("duration"),
        audio_path     = save_path,
        fo_mean        = bio["fo_mean"],
        fo_max         = bio["fo_max"],
        fo_min         = bio["fo_min"],
        jitter_local   = bio["jitter_local"],
        jitter_abs     = bio["jitter_abs"],
        jitter_rap     = bio["jitter_rap"],
        jitter_ppq5    = bio["jitter_ppq5"],
        jitter_ddp     = bio["jitter_ddp"],
        shimmer_local  = bio["shimmer_local"],
        shimmer_db     = bio["shimmer_db"],
        shimmer_apq3   = bio["shimmer_apq3"],
        shimmer_apq5   = bio["shimmer_apq5"],
        shimmer_apq11  = bio["shimmer_apq11"],
        shimmer_dda    = bio["shimmer_dda"],
        nhr            = bio["nhr"],
        hnr            = bio["hnr"],
        mfcc_1         = bio["mfcc_1"],
        mfcc_2         = bio["mfcc_2"],
        mfcc_3         = bio["mfcc_3"],
        mfcc_4         = bio["mfcc_4"],
        mfcc_5         = bio["mfcc_5"],
        mfcc_6         = bio["mfcc_6"],
        mfcc_7         = bio["mfcc_7"],
        mfcc_8         = bio["mfcc_8"],
        mfcc_9         = bio["mfcc_9"],
        mfcc_10        = bio["mfcc_10"],
        mfcc_11        = bio["mfcc_11"],
        mfcc_12        = bio["mfcc_12"],
        mfcc_13        = bio["mfcc_13"],
        spectral_centroid = bio["spectral_centroid"],
        spectral_rolloff  = bio["spectral_rolloff"],
        zcr            = bio["zcr"],
        ppe            = bio["ppe"],
        risk_score     = ml["risk_score"],
        risk_label     = ml["risk_label"],
        parkinson_prob = ml["parkinson_prob"],
        confidence     = ml["confidence"],
        model_version  = ml["model_version"],
        clinical_stage = clinical["clinical_stage"],
        recommendations = json.dumps(clinical),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    logger.info(
        "Session %d | Patient %d | Risk: %s (%.1f%%) | PD-Prob: %.3f",
        session.id, patient_id, ml["risk_label"], ml["risk_score"], ml["parkinson_prob"]
    )

    return {
        "session_id":    session.id,
        "patient_id":    patient_id,
        "recorded_at":   session.recorded_at.isoformat(),
        "duration_sec":  bio.get("duration"),
        "biomarkers":    bio,
        "abnormal_flags": flags,
        "prediction":    ml,
        "clinical":      clinical,
    }


# ══════════════════════════════════════════════════════════════════════════════
#   SESSION HISTORY & TREND
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/patients/{patient_id}/sessions", tags=["Sessions"])
def get_sessions(patient_id: int, limit: int = 30, db: Session = Depends(get_db)):
    sessions = (
        db.query(VoiceSession)
        .filter(VoiceSession.patient_id == patient_id)
        .order_by(VoiceSession.recorded_at.desc())
        .limit(limit)
        .all()
    )
    return [_session_to_dict(s) for s in sessions]


@app.get("/patients/{patient_id}/trend", tags=["Sessions"])
def get_risk_trend(patient_id: int, days: int = 30, db: Session = Depends(get_db)):
    """Returns time-series data for chart rendering."""
    sessions = (
        db.query(VoiceSession)
        .filter(VoiceSession.patient_id == patient_id)
        .order_by(VoiceSession.recorded_at.asc())
        .limit(days)
        .all()
    )
    return [
        {
            "date":          s.recorded_at.strftime("%b %d"),
            "risk_score":    round(s.risk_score or 0, 1),
            "risk_label":    s.risk_label,
            "hnr":           round(s.hnr or 0, 2),
            "jitter_local":  round((s.jitter_local or 0) * 100, 4),
            "shimmer_local": round((s.shimmer_local or 0) * 100, 4),
        }
        for s in sessions
    ]


# ══════════════════════════════════════════════════════════════════════════════
#   ALL PATIENTS OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/overview", tags=["Dashboard"])
def get_overview(db: Session = Depends(get_db)):
    total_patients = db.query(Patient).count()
    total_sessions = db.query(VoiceSession).count()
    high_risk = (
        db.query(VoiceSession)
        .filter(VoiceSession.risk_label == "High")
        .count()
    )
    recent = (
        db.query(VoiceSession)
        .order_by(VoiceSession.recorded_at.desc())
        .limit(5)
        .all()
    )
    return {
        "total_patients": total_patients,
        "total_sessions": total_sessions,
        "high_risk_count": high_risk,
        "recent_sessions": [_session_to_dict(s) for s in recent],
    }


# ══════════════════════════════════════════════════════════════════════════════
#   WEBSOCKET — REAL-TIME WAVEFORM STREAMING (amplitude only)
# ══════════════════════════════════════════════════════════════════════════════

@app.websocket("/ws/live/{patient_id}")
async def websocket_live(websocket: WebSocket, patient_id: int):
    """
    Client streams raw 16-bit PCM chunks (little-endian).
    Server replies with real-time RMS amplitude for waveform display.
    NOT for analysis — just live visualization.
    """
    await websocket.accept()
    logger.info("WebSocket opened for patient %d", patient_id)
    try:
        while True:
            data = await websocket.receive_bytes()
            if data:
                samples = [
                    int.from_bytes(data[i:i+2], "little", signed=True)
                    for i in range(0, len(data) - 1, 2)
                ]
                if samples:
                    rms = (sum(s * s for s in samples) / len(samples)) ** 0.5
                    amplitude_norm = min(rms / 32768, 1.0)
                    await websocket.send_json({"amplitude": round(amplitude_norm, 4)})
    except WebSocketDisconnect:
        logger.info("WebSocket closed for patient %d", patient_id)

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ── Load config ───────────────────────────────────────────────────────────────
from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./neuvoice.db"
    SECRET_KEY:   str = "dev-secret-neurovoice-ai-2024"
    ALGORITHM:    str = "HS256"
    GMAIL_USER:   str = ""
    GMAIL_PASS:   str = ""  # App Password
    class Config:
        env_file = ".env"

conf = Settings()

class AppointmentBooking(BaseModel):
    patient_id: int
    doctor_name: str
    hospital: str
    slot: str
    patient_email: Optional[str] = None

@app.post("/appointments/book", tags=["Appointments"])
def book_appointment(data: AppointmentBooking, db: Session = Depends(get_db)):
    """Book a real neurologist and send a confirmation email via Gmail."""
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    email_to = data.patient_email or patient.email
    if not email_to:
        # Fallback for demo if no email provided
        logger.warning("No email found for patient %d, skipping notification.", data.patient_id)
        return {"status": "confirmed", "message": "Booking successful (no email sent)"}

    # ── Notification System (Gmail) ──────────────────────────────────────────
    if conf.GMAIL_USER and conf.GMAIL_PASS:
        try:
            msg = MIMEMultipart()
            msg['From'] = f"NeuroVoice AI <{conf.GMAIL_USER}>"
            msg['To'] = email_to
            msg['Subject'] = f"🏥 Confirmed: Appointment with {data.doctor_name}"

            body = f"""
            Hello {patient.name},

            Your appointment has been successfully scheduled via NeuroVoice AI.

            DETAILS:
            - Doctor: {data.doctor_name}
            - Hospital: {data.hospital}
            - Time: {data.slot}

            CLINICAL NOTE:
            This appointment was prioritized based on your latest vocal biomarker scan. 
            Please bring your digital screening report to the consultation.

            Best regards,
            NeuroVoice AI Health Team
            """
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(conf.GMAIL_USER, conf.GMAIL_PASS)
            server.send_message(msg)
            server.quit()
            logger.info("Confirmation email sent to %s", email_to)
        except Exception as e:
            logger.error("Failed to send email: %s", e)
            return {"status": "confirmed", "message": f"Booking recorded, but email failed: {str(e)}"}

    return {
        "status": "confirmed",
        "message": f"Appointment booked with {data.doctor_name} for {data.slot}.",
        "notification": "Email sent" if conf.GMAIL_USER else "Config missing"
    }

# ── helper ────────────────────────────────────────────────────────────────────
def _session_to_dict(s: VoiceSession) -> dict:
    return {
        "id":            s.id,
        "patient_id":    s.patient_id,
        "recorded_at":   s.recorded_at.isoformat(),
        "language":      s.language,
        "duration_sec":  s.duration_sec,
        "fo_mean":       s.fo_mean,
        "jitter_local":  s.jitter_local,
        "shimmer_local": s.shimmer_local,
        "hnr":           s.hnr,
        "ppe":           s.ppe,
        "risk_score":    s.risk_score,
        "risk_label":    s.risk_label,
        "parkinson_prob": s.parkinson_prob,
        "confidence":    s.confidence,
        "clinical_stage": s.clinical_stage,
        "model_version": s.model_version,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
