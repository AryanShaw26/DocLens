import os
from typing import List, Union
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Search and load .env from multiple potential roots (cwd, backend/, file parent)
env_candidates = [
    os.path.join(os.getcwd(), ".env"),
    os.path.join(os.getcwd(), "backend", ".env"),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env")),
]
for p in env_candidates:
    if os.path.isfile(p):
        load_dotenv(p, override=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "DocLens"
    PROJECT_TAGLINE: str = "Your Online Medical Officer"
    API_V1_STR: str = "/api"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://username:2609@localhost:5432/doclens_db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")

    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "doclens_secure_random_production_ready_jwt_key_2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    CORS_ORIGINS: Union[str, List[str]] = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))

    @property
    def cors_origin_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        case_sensitive = True
        extra = "allow"

settings = Settings()
