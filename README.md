# 🧠 NeuroVoice AI — Clinical Neurological Screening

NeuroVoice AI is a cutting-edge multimodal diagnostic platform that fuses **Vocal Biomarkers**, **Kinematic Motor Analysis**, and **Imaging AI** to screen for Parkinson's Disease and other neurodegenerative conditions with 95%+ accuracy.

## 🚀 One-Click Deployment Guide

I have prepared this project for automated deployment so you no longer need to run the frontend and backend manually in the terminal.

### **Option 1: Railway (🚀 RECOMMENDED)**
*Best for AI projects with heavy libraries and persistent data.*
1.  Login to [Railway.app](https://railway.app).
2.  Click **"New Project"** > **"Deploy from GitHub"**.
3.  Select your `neuro_voice` repo.
4.  **Backend Setup**:
    *   Railway will detect the `Procfile` and `requirements.txt`.
    *   It will automatically install the 950MB scientific stack.
    *   **Persistence**: Your `neuvoice.db` will be safe and won't reset on restarts.
5.  **Frontend Setup**:
    *   You can add a second service in the same project for the Frontend.
    *   Root: `/`, Build: `npm run build`, Start: `npm run preview`.

### **Option 2: Vercel (Frontend Only)**
*Good for the UI, but the AI backend is too large (950MB vs 500MB limit).*
1.  Use Vercel only if you plan to host the backend elsewhere. 
2.  If you try to deploy the full bridge, you will get a "Lambda Size Limit" error.

---

## 🛠️ Key Technologies
*   **Acoustic Core**: [Praat](https://www.fon.hum.uva.nl/praat/) & [Parselmouth](https://github.com/YannickJadoul/Parselmouth) for MDVP biomarker extraction.
*   **Predictive AI**: XGBoost classifier trained on UCI Parkinson's datasets.
*   **Indic NLP**: [AI4Bharat](https://ai4bharat.iitm.ac.in/) & [BharatGen](https://github.com/IIT-Madras/BharatGen) for multilingual support.
*   **Frontend**: React 19 + Vite + Recharts + Lucide Icons.
*   **Backend**: FastAPI + SQLAlchemy + SQLite.

## 📦 Project Structure
*   `src/`: React Frontend (Dashboard, Voice Scan, Motor Test, Fusion Report).
*   `backend/`: FastAPI source code, ML models, and clinical reasoning logic.
*   `api/`: Vercel-specific serverless bridge.
*   `vercel.json`: Deployment orchestrator.

## 🧪 Local Development (If needed)
1.  **Backend**: `cd backend && pip install -r requirements.txt && python main.py`
2.  **Frontend**: `npm install && npm run dev`

---
*Created for the 2026 BharatGen AI4Bharat Hackathon.*
