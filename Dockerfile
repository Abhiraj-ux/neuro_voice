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

# Create a non-root user for Hugging Face security
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"
WORKDIR /app

# Install system dependencies for Audio Analysis (FFmpeg)
# We need to switch to root briefly for apt install
USER root
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*
USER user

# Copy requirements and install
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy everything else
COPY --chown=user . .

# Copy the built frontend from Stage 1
COPY --from=frontend-builder --chown=user /app/dist ./dist

# Set permissions for the SQLite database directory
USER root
RUN chmod 777 backend/
USER user

# Hugging Face Spaces default port
EXPOSE 7860

# Start command
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
