from backend.main import app as fastapi_app

# This acts as a bridge for Vercel's Python runtime
# Vercel looks for 'app' variable in index.py
app = fastapi_app
