from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import Base, engine
from .routers import auth, export, feedback, generation, stats


settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(generation.router)
app.include_router(feedback.router)
app.include_router(stats.router)
app.include_router(export.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "alignlab"}
