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

    # ── Gamification ──────────────────────────
    xp                  = Column(Integer, default=0)
    streak_count        = Column(Integer, default=0)
    last_activity_date  = Column(DateTime)
    achievements_json   = Column(Text, default="[]")  # List of achievement IDs

    sessions        = relationship("VoiceSession", back_populates="patient")
    motor_sessions  = relationship("MotorSession", back_populates="patient")
    imaging_sessions = relationship("ImagingSession", back_populates="patient")


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


# ─────────────────────────────────────────────
class MotorSession(Base):
    __tablename__ = "motor_sessions"

    id             = Column(Integer, primary_key=True, index=True)
    patient_id     = Column(Integer, ForeignKey("patients.id"), nullable=False)
    recorded_at    = Column(DateTime, default=datetime.utcnow)
    
    # Results
    tremor_score   = Column(Float)    # 0-100
    reaction_ms    = Column(Integer)
    accuracy_pct   = Column(Float)
    stability_idx  = Column(Float)
    
    label          = Column(String(30))  # "Normal" / "Mild Tremor" etc

    patient = relationship("Patient", back_populates="motor_sessions")


# ─────────────────────────────────────────────
class ImagingSession(Base):
    __tablename__ = "imaging_sessions"

    id             = Column(Integer, primary_key=True, index=True)
    patient_id     = Column(Integer, ForeignKey("patients.id"), nullable=False)
    recorded_at    = Column(DateTime, default=datetime.utcnow)
    
    # Imaging Biomarkers
    imaging_type   = Column(String(20))  # MRI / DaT Scan
    sbr_ratio      = Column(Float)      # Striatal Binding Ratio (DaT Scan)
    putamen_uptake = Column(Float)      # Putamen uptake (DaT Scan)
    caudate_uptake = Column(Float)      # Caudate uptake (DaT Scan)
    finding_summary = Column(Text)      # Clinical interpretation

    patient = relationship("Patient", back_populates="imaging_sessions")


# ─────────────────────────────────────────────
class BlogPost(Base):
    __tablename__ = "blog_posts"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(200), nullable=False)
    description = Column(Text)
    url         = Column(String(300))
    thumbnail   = Column(String(300))
    post_type   = Column(String(20), default="video")
    likes       = Column(Integer, default=0)
    created_at  = Column(DateTime, default=datetime.utcnow)

    comments    = relationship("BlogComment", back_populates="post", cascade="all, delete-orphan")


class BlogComment(Base):
    __tablename__ = "blog_comments"

    id          = Column(Integer, primary_key=True, index=True)
    post_id     = Column(Integer, ForeignKey("blog_posts.id"), nullable=False)
    author_name = Column(String(100))
    content     = Column(Text, nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow)

    post        = relationship("BlogPost", back_populates="comments")


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
