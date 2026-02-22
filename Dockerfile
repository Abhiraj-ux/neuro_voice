# 🧠 NeuroVoice AI - All-in-One Deployment Dockerfile
# This bundles the React Dashboard + FastAPI Backend into a single 16GB RAM service.

# --- Stage 1: Build the React Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Final Production Environment ---
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies for Audio Analysis (Praat fallbacks & FFmpeg)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy root requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything else
COPY . .

# Copy the built frontend from Stage 1 into the Final Image
# The backend is now configured to serve this 'dist' folder
COPY --from=frontend-builder /app/dist ./dist

# Set permissions for the SQLite database
RUN chmod 777 backend/

# Expose port (Railway/HuggingFace default is 7860 or $PORT)
ENV PORT=7860
EXPOSE 7860

# Start command: Point to our unified main.py
CMD uvicorn backend.main:app --host 0.0.0.0 --port $PORT
