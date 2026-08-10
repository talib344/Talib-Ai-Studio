from fastapi import FastAPI
from .api.routers import health

app = FastAPI(title="Talib AI Studio - Backend")

app.include_router(health.router, prefix="/api/health", tags=["health"])

@app.on_event("startup")
async def startup_event():
    # placeholder for startup tasks (db init, migrations, etc.)
    pass
