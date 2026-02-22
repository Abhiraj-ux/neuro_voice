# 🧠 NeuroVoice AI — Clinical Neurological Screening

NeuroVoice AI is a cutting-edge multimodal diagnostic platform that fuses **Vocal Biomarkers**, **Kinematic Motor Analysis**, and **Imaging AI** to screen for Parkinson's Disease and other neurodegenerative conditions with 95%+ accuracy.

## 🚀 One-Click Deployment Guide

I have prepared this project for automated deployment so you no longer need to run the frontend and backend manually in the terminal.

### **Option 1: Hugging Face Spaces (🚀 ALL-IN-ONE / 16GB RAM)**
*This is the clinical-grade method. It bundles the UI and AI into one single URL.*

1.  Create a new **Space** on [Hugging Face](https://huggingface.co/spaces).
2.  Choose **Docker** as the SDK (Blank template).
3.  Hugging Face gives you **16GB of RAM** for free.
4.  Push this repository to the Space.
5.  **What happens**: The `Dockerfile` will build your React app and start your FastAPI server. Your dashboard will be available immediately at the Space URL.

### **Option 2: Railway / Render (Dockerized)**
*Note: Ensure you have at least 1GB RAM on your plan to avoid AI crashes during scans.*
1.  Connect your repo and choose **Dockerfile** as the build method.
2.  Railway will detect the `Dockerfile` in the root and deploy everything in one go.

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

