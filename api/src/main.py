from fastapi import FastAPI
from api.routes import health

app = FastAPI(
    title="Na Régua API",
    description="API da plataforma Na Régua",
    version="0.1.0",
)

app.include_router(health.router)