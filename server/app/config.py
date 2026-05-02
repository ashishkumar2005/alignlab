import os
from functools import lru_cache
from pathlib import Path

SERVER_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = SERVER_DIR.parent

try:
    from dotenv import load_dotenv

    load_dotenv(ROOT_DIR / ".env")
    load_dotenv(SERVER_DIR / ".env")
except ImportError:  # pragma: no cover - dotenv is optional outside local setup
    pass


class Settings:
    app_name = "AlignLab API"
    server_dir = SERVER_DIR
    database_url = os.getenv("DATABASE_URL", f"sqlite:///{server_dir / 'alignlab.db'}")
    secret_key = os.getenv("SECRET_KEY", "change-me-in-production")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "720"))
    cors_origins = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]
    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
    claude_model = os.getenv("CLAUDE_MODEL", "claude-3-5-haiku-20241022")


@lru_cache
def get_settings() -> Settings:
    return Settings()
