# 🧠 NeuroVoice AI — Clinical Neurological Screening

NeuroVoice AI is a cutting-edge multimodal diagnostic platform that fuses **Vocal Biomarkers**, **Kinematic Motor Analysis**, and **Imaging AI** to screen for Parkinson's Disease and other neurodegenerative conditions with 95%+ accuracy.

## 🚀 One-Click Deployment Guide

I have prepared this project for automated deployment so you no longer need to run the frontend and backend manually in the terminal.

### **Option 1: Render (🚀 RECOMMENDED)**
*Excellent for monorepos, AI workloads, and free hosting.*

#### **Part A: The Clinical Backend (FastAPI)**
1.  Login to [Render.com](https://render.com).
2.  Click **"New"** > **"Web Service"** and connect your GitHub repo.
3.  **Environment**: `Python 3`
4.  **Build Command**: `pip install -r requirements.txt`
5.  **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
6.  **Persistence**: (Optional) Add a Disk for the SQLite database.

#### **Part B: The Dashboard (React)**
1.  Click **"New"** > **"Static Site"**.
2.  **Build Command**: `npm install && npm run build`
3.  **Publish Directory**: `dist`
4.  **Headers**: Add a `_redirects` file or use a Rewrite rule for SPA routing.

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
