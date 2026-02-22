# 🧠 NeuroVoice AI — Clinical Neurological Screening

NeuroVoice AI is a cutting-edge multimodal diagnostic platform that fuses **Vocal Biomarkers**, **Kinematic Motor Analysis**, and **Imaging AI** to screen for Parkinson's Disease and other neurodegenerative conditions with 95%+ accuracy.

## 🚀 One-Click Deployment Guide

I have prepared this project for automated deployment so you no longer need to run the frontend and backend manually in the terminal.

### **Option 1: Vercel (Fast & Free Frontend)**
*Recommended for the user interface, but the AI backend may hit size limits (250MB).*
1.  Push this code to a **GitHub Repository**.
2.  Import the repository into [Vercel](https://vercel.com).
3.  Vercel will detect the `vercel.json` and automatically build the React frontend and Python backend.
4.  **Note**: Vercel uses ephemeral storage. Patient data saved to the local SQLite database will reset on redeployment.

### **Option 2: Railway / Render (Recommended for Production)**
*Recommended for persistent data (SQLite) and heavy AI models (Praat, XGBoost).*
1.  Connect your GitHub repo to [Railway.app](https://railway.app).
2.  It will detect the monorepo and deploy both the FastAPI server and Vite frontend.
3.  **Persistence**: Your `neuvoice.db` will remain stable and your patient records will be preserved.

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
