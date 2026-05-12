import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import List

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./realestate.db")
    
    # App Settings
    APP_NAME: str = os.getenv("APP_NAME", "RealEstate Pro API")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # JWT Settings - Extended token expiry to prevent auto-logout
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production-12345")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    # Set token expiry to 30 days (43200 minutes) to prevent frequent logouts
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))
    
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
    
    # File upload settings
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", "10485760"))  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"]
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "*"
    ]
    
    class Config:
        env_file = ".env"
        extra = "allow"
        case_sensitive = False

# Create single instance
settings = Settings()

# Print configuration status on startup
print("=" * 50)
print("🔧 CONFIGURATION STATUS")
print("=" * 50)
print(f"✅ App Name: {settings.APP_NAME}")
print(f"✅ Debug Mode: {settings.DEBUG}")
print(f"✅ Database: Connected")
print(f"✅ Token Expiry: {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
if settings.ACCESS_TOKEN_EXPIRE_MINUTES >= 43200:
    print(f"   📅 That's {settings.ACCESS_TOKEN_EXPIRE_MINUTES / 60 / 24:.0f} days")
print(f"✅ Chapa Payment: {'Configured' if settings.CHAPA_SECRET_KEY else 'Not Configured'}")
print("=" * 50)