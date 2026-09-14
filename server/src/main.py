from fastapi import FastAPI
from api.routes import auth, health

app = FastAPI(
    title="Na Régua API",
    description="API da plataforma Na Régua",
    version="0.1.0",
)

app.include_router(auth.router)
app.include_router(health.router)