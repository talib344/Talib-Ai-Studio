from fastapi import FastAPI
from .api.routers import health
import os
from .db import init_db
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Talib AI Studio - Backend")

app.include_router(health.router, prefix="/api/health", tags=["health"])

@app.on_event("startup")
async def startup_event():
    # ensure data dir exists
    os.makedirs("data", exist_ok=True)
    # initialize database and tables
    await init_db()

@app.get("/")
async def root():
    return {"status": "ok", "message": "Talib AI Studio Backend"}

# Allow running directly for development: python app/main.py
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
