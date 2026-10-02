from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Smart Kitchen AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "smart-kitchen-ai-super-secret-jwt-key-2026-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    DATABASE_URL: str = "sqlite:///./smart_kitchen.db"
    
    # Expiry alert thresholds (days)
    EXPIRY_CRITICAL_DAYS: int = 1
    EXPIRY_WARNING_DAYS: int = 3
    
    # AI / LLM configuration
    AI_PROVIDER: str = "local" # options: "local", "openai", "gemini"
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

settings = Settings()
