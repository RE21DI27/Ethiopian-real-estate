import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./realestate.db")
    
    # App Settings
    APP_NAME: str = os.getenv("APP_NAME", "RealEstate Pro API")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production-12345")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
    
    # Email settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "")
    
    # Chapa Settings
    CHAPA_SECRET_KEY: str = os.getenv("CHAPA_SECRET_KEY", "")
    CHAPA_WEBHOOK_SECRET: str = os.getenv("CHAPA_WEBHOOK_SECRET", "")
    CHAPA_BASE_URL: str = os.getenv("CHAPA_BASE_URL", "https://api.chapa.co/v1")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:8000")
    
    class Config:
        env_file = ".env"
        extra = "allow"  # This allows extra fields in .env that aren't defined

# Create single instance
settings = Settings()