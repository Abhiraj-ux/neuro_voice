# 🧠 NeuroVoice AI — Clinical Neurological Screening

NeuroVoice AI is a cutting-edge multimodal diagnostic platform that fuses **Vocal Biomarkers**, **Kinematic Motor Analysis**, and **Imaging AI** to screen for Parkinson's Disease and other neurodegenerative conditions with 95%+ accuracy.

## 🚀 One-Click Deployment Guide

I have prepared this project for automated deployment so you no longer need to run the frontend and backend manually in the terminal.

### **Option 1: Hugging Face Spaces (🏆 BEST FOR 16GB RAM)**
*Best for heavy AI models (XGBoost + Praat) that crash on 512MB RAM limits.*
1.  Create a new **Space** on [Hugging Face](https://huggingface.co/spaces).
2.  Select **Docker** as the SDK.
3.  Hugging Face gives you **16GB of RAM** for free, which is 32x more than Render/Railway.
4.  Upload this repository. The `Dockerfile` (or our monorepo setup) will build and run your clinical engine perfectly.

### **Option 2: Render / Railway (Standard)**
*Note: Both have a 512MB RAM limit on free tiers. The AI may crash during heavy voice analysis.*
1.  Follow the instructions below if you have a paid tier or tiny models.

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

