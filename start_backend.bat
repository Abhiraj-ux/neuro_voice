@echo off
echo.
echo  ███╗   ██╗███████╗██╗   ██╗██████╗  ██████╗ ██╗   ██╗ ██████╗ ██╗ ██████╗███████╗
echo  ████╗  ██║██╔════╝██║   ██║██╔══██╗██╔═══██╗██║   ██║██╔═══██╗██║██╔════╝██╔════╝
echo  ██╔██╗ ██║█████╗  ██║   ██║██████╔╝██║   ██║██║   ██║██║   ██║██║██║     █████╗
echo  ██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██║   ██║╚██╗ ██╔╝██║   ██║██║██║     ██╔══╝
echo  ██║ ╚████║███████╗╚██████╔╝██║  ██║╚██████╔╝ ╚████╔╝ ╚██████╔╝██║╚██████╗███████╗
echo  ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝   ╚═══╝   ╚═════╝ ╚═╝ ╚═════╝╚══════╝
echo.
echo  Real Parkinson's Vocal Biomarker Analysis System
echo  Using uv package manager (10-100x faster than pip)
echo  ─────────────────────────────────────────────────
echo.

cd /d "%~dp0\backend"

REM Check uv is installed
where uv >nul 2>&1
if %errorlevel% neq 0 (
    echo [SETUP] Installing uv package manager...
    powershell -ExecutionPolicy Bypass -Command "irm https://astral.sh/uv/install.ps1 | iex"
)

REM Step 1: Create virtual environment (uv is 10-100x faster than pip)
if not exist ".venv" (
    echo [1/4] Creating Python venv via uv...
    uv venv .venv
) else (
    echo [1/4] Venv already exists.
)

REM Step 2: Install dependencies via uv
echo [2/4] Installing dependencies via uv (Parselmouth, XGBoost, FastAPI...)
uv pip install -r requirements.txt --python .venv\Scripts\python.exe

REM Step 3: Train ML model (only once)
if not exist "parkinson_model.joblib" (
    echo.
    echo [3/4] Training XGBoost on UCI Parkinson's dataset...
    echo       Downloads dataset + trains in ~30s. Only runs once.
    echo.
    .venv\Scripts\python.exe train_model.py
) else (
    echo [3/4] ML model already trained ✓
)

REM Step 4: Start backend
echo.
echo [4/4] Starting FastAPI backend...
echo.
echo  ┌─────────────────────────────────────────────┐
echo  │  API (PC):    https://localhost:8001         │
echo  │  API (Phone):  https://172.20.10.2:8001      │
echo  │  Database:    backend/neuvoice.db            │
echo  │  Audio:       backend/audio_store/           │
echo  └─────────────────────────────────────────────┘
echo.
echo  Ctrl+C to stop
echo.

.venv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8001 --ssl-keyfile "%~dp0certs\key.pem" --ssl-certfile "%~dp0certs\cert.pem" --reload
