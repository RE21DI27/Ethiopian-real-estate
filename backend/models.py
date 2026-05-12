from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    role = Column(String(20), default="buyer")
    created_at = Column(DateTime, default=datetime.utcnow)

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    listing_type = Column(String(20), nullable=False)
    city = Column(String(100), nullable=False)
    location = Column(String(200), nullable=False)
    bedrooms = Column(Integer, default=0)
    bathrooms = Column(Integer, default=0)
    sqft = Column(Integer, default=0)
    featured = Column(Boolean, default=False)
    images = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
