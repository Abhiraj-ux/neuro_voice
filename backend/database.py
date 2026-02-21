# backend/database.py
"""
SQLite database schema using SQLAlchemy ORM.
Stores: patients, voice sessions, biomarker readings, clinical recommendations.
"""
import os
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, Float, String,
    DateTime, Text, Boolean, ForeignKey
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "neuvoice.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ─────────────────────────────────────────────
class Patient(Base):
    __tablename__ = "patients"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(120), nullable=False)
    age         = Column(Integer, nullable=False)
    gender      = Column(String(10))
    language    = Column(String(10), default="en")
    phone       = Column(String(20))
    email       = Column(String(120))
    created_at  = Column(DateTime, default=datetime.utcnow)

    sessions    = relationship("VoiceSession", back_populates="patient")


# ─────────────────────────────────────────────
class VoiceSession(Base):
    __tablename__ = "voice_sessions"

    id             = Column(Integer, primary_key=True, index=True)
    patient_id     = Column(Integer, ForeignKey("patients.id"), nullable=False)
    recorded_at    = Column(DateTime, default=datetime.utcnow)
    language       = Column(String(10), default="en")
    duration_sec   = Column(Float)
    audio_path     = Column(String(260))           # path to saved audio file

    # ── Praat / MDVP biomarkers ──────────────
    fo_mean        = Column(Float)                 # avg fundamental freq Hz
    fo_max         = Column(Float)                 # max fundamental freq Hz
    fo_min         = Column(Float)                 # min fundamental freq Hz
    jitter_local   = Column(Float)                 # MDVP:Jitter(%) — normal < 1.04 %
    jitter_abs     = Column(Float)                 # MDVP:Jitter(Abs) — normal < 83.2 µs
    jitter_rap     = Column(Float)                 # MDVP:RAP
    jitter_ppq5    = Column(Float)                 # MDVP:PPQ
    jitter_ddp     = Column(Float)                 # Jitter:DDP = 3×RAP
    shimmer_local  = Column(Float)                 # MDVP:Shimmer — normal < 3.81 %
    shimmer_db     = Column(Float)                 # MDVP:Shimmer(dB) — normal < 0.35 dB
    shimmer_apq3   = Column(Float)
    shimmer_apq5   = Column(Float)
    shimmer_apq11  = Column(Float)
    shimmer_dda    = Column(Float)
    nhr            = Column(Float)                 # Noise-to-Harmonic Ratio
    hnr            = Column(Float)                 # Harmonics-to-Noise Ratio dB — normal > 20

    # ── librosa / spectral ───────────────────
    mfcc_1  = Column(Float)
    mfcc_2  = Column(Float)
    mfcc_3  = Column(Float)
    mfcc_4  = Column(Float)
    mfcc_5  = Column(Float)
    mfcc_6  = Column(Float)
    mfcc_7  = Column(Float)
    mfcc_8  = Column(Float)
    mfcc_9  = Column(Float)
    mfcc_10 = Column(Float)
    mfcc_11 = Column(Float)
    mfcc_12 = Column(Float)
    mfcc_13 = Column(Float)
    spectral_centroid = Column(Float)
    spectral_rolloff  = Column(Float)
    zcr               = Column(Float)
    ppe               = Column(Float)              # Pitch Period Entropy proxy

    # ── ML output ───────────────────────────
    risk_score        = Column(Float)              # 0–100
    risk_label        = Column(String(10))         # Low / Medium / High
    parkinson_prob    = Column(Float)              # raw XGBoost probability 0-1
    confidence        = Column(Float)              # model confidence %
    model_version     = Column(String(60))

    # ── Clinical ─────────────────────────────
    clinical_stage    = Column(String(30))         # e.g. "Hoehn & Yahr 1"
    recommendations   = Column(Text)              # JSON string

    patient = relationship("Patient", back_populates="sessions")


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
