# README for backend

This backend is a FastAPI application using async SQLAlchemy with SQLite for v1.

Quickstart (development):

1. Create and activate a virtual environment
   python -m venv .venv
   source .venv/bin/activate

2. Install dependencies
   pip install -r requirements.txt

3. Copy .env.example to .env and adjust variables as needed.

4. Initialize the database (optional, the app will auto-create tables on startup):
   python -m backend.scripts.init_db

5. Start the server
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Health check: GET http://localhost:8000/api/health/ping
