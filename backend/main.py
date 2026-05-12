from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
import os
import json
from dotenv import load_dotenv
import uvicorn

load_dotenv()

# Database setup with NeonDB
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    phone = Column(String(50))
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="user")
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    listing_type = Column(String(20), nullable=False)
    location = Column(String(200), nullable=False)
    bedrooms = Column(Integer, default=0)
    bathrooms = Column(Integer, default=0)
    sqft = Column(Integer, default=0)
    featured = Column(Boolean, default=False)
    images = Column(Text)
    views = Column(Integer, default=0)
    inquiries = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    property_title = Column(String(200), nullable=False)
    amount = Column(Float, nullable=False)
    buyer = Column(String(100), nullable=False)
    seller = Column(String(100), nullable=False)
    date = Column(String(50), nullable=False)
    status = Column(String(20), default="pending")

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class LoginRequest(BaseModel):
    username: str
    password: str

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def init_db():
    db = SessionLocal()
    
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            print("📝 Seeding database with initial data...")
            
            # Create admin user
            admin_user = User(
                username="redietgebrehiwot@gmail.com",
                email="redietgebrehiwot@gmail.com",
                full_name="Rediet Gebrehiwot",
                phone="0912345680",
                password="Rediet1212!",
                role="admin",
                status="active"
            )
            db.add(admin_user)
            
            # Create buyer
            buyer = User(
                username="buyer",
                email="buyer@example.com",
                full_name="Test Buyer",
                phone="0912345678",
                password="buyer123",
                role="buyer",
                status="active"
            )
            db.add(buyer)
            
            # Create seller
            seller = User(
                username="seller",
                email="seller@example.com",
                full_name="Test Seller",
                phone="0912345679",
                password="seller123",
                role="seller",
                status="active"
            )
            db.add(seller)
            
            # Create properties
            properties_data = [
                {
                    "title": "Luxury Apartment in Bole",
                    "description": "Beautiful luxury apartment in the heart of Bole. Modern design, fully furnished kitchen, 24/7 security, elevator and parking.",
                    "price": 5800000,
                    "listing_type": "sale",
                    "location": "Bole, Addis Ababa",
                    "bedrooms": 3,
                    "bathrooms": 3,
                    "sqft": 2200,
                    "featured": True,
                    "images": json.dumps(["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"]),
                    "views": 245,
                    "inquiries": 12
                },
                {
                    "title": "Modern Apartment in Bole",
                    "description": "Modern 3 bedroom apartment in Bole with great amenities.",
                    "price": 5500000,
                    "listing_type": "sale",
                    "location": "Bole, Addis Ababa",
                    "bedrooms": 3,
                    "bathrooms": 2,
                    "sqft": 2000,
                    "featured": True,
                    "images": json.dumps(["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"]),
                    "views": 189,
                    "inquiries": 8
                },
                {
                    "title": "Premium Apartment in Bole",
                    "description": "Premium luxury apartment with all amenities including pool and gym.",
                    "price": 5900000,
                    "listing_type": "sale",
                    "location": "Bole, Addis Ababa",
                    "bedrooms": 3,
                    "bathrooms": 3,
                    "sqft": 2300,
                    "featured": True,
                    "images": json.dumps(["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500"]),
                    "views": 312,
                    "inquiries": 15
                },
                {
                    "title": "Beautiful Villa in Ayat",
                    "description": "Beautiful villa with large garden, swimming pool, and panoramic views.",
                    "price": 12500000,
                    "listing_type": "sale",
                    "location": "Ayat, Addis Ababa",
                    "bedrooms": 5,
                    "bathrooms": 4,
                    "sqft": 4500,
                    "featured": False,
                    "images": json.dumps(["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500"]),
                    "views": 156,
                    "inquiries": 6
                },
                {
                    "title": "Cozy Studio for Rent",
                    "description": "Perfect studio apartment for rent in CMC area.",
                    "price": 12000,
                    "listing_type": "rent",
                    "location": "CMC, Addis Ababa",
                    "bedrooms": 1,
                    "bathrooms": 1,
                    "sqft": 450,
                    "featured": False,
                    "images": json.dumps(["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"]),
                    "views": 98,
                    "inquiries": 4
                }
            ]
            
            for prop_data in properties_data:
                property = Property(**prop_data)
                db.add(property)
            
            # Create transactions
            transactions_data = [
                {"property_title": "Luxury Apartment in Bole", "amount": 5800000, "buyer": "John Doe", "seller": "Test Seller", "date": "2024-05-01", "status": "completed"},
                {"property_title": "Modern Apartment in Bole", "amount": 5500000, "buyer": "Jane Smith", "seller": "Test Seller", "date": "2024-05-05", "status": "completed"},
                {"property_title": "Premium Apartment in Bole", "amount": 5900000, "buyer": "Mike Johnson", "seller": "Test Seller", "date": "2024-05-08", "status": "pending"},
            ]
            
            for trans_data in transactions_data:
                transaction = Transaction(**trans_data)
                db.add(transaction)
            
            db.commit()
            print("✅ Database seeded successfully on NeonDB!")
        else:
            print("✅ Database already has data")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "ok", "message": "Server running with NeonDB PostgreSQL", "timestamp": datetime.now().isoformat()}

@app.post("/api/auth/login")
async def login(login: LoginRequest, db: Session = Depends(get_db)):
    print(f"\n🔐 Login attempt: {login.username}")
    
    user = db.query(User).filter(
        (User.username == login.username) | (User.email == login.username)
    ).first()
    
    if user and user.password == login.password:
        print(f"✅ Login successful: {login.username} (Role: {user.role})")
        return {
            "access_token": f"token_{user.id}_{int(datetime.now().timestamp())}",
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "phone": user.phone,
                "role": user.role
            }
        }
    
    print(f"❌ Login failed: {login.username}")
    return {"detail": "Invalid credentials"}

@app.get("/api/admin/stats")
async def admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_properties = db.query(Property).count()
    transactions = db.query(Transaction).all()
    total_revenue = sum(t.amount for t in transactions if t.status == "completed")
    total_views = db.query(func.sum(Property.views)).scalar() or 0
    total_inquiries = db.query(func.sum(Property.inquiries)).scalar() or 0
    
    return {
        "total_users": total_users,
        "total_properties": total_properties,
        "total_transactions": len(transactions),
        "total_views": total_views,
        "total_inquiries": total_inquiries,
        "revenue": total_revenue,
        "active_listings": total_properties
    }

@app.get("/api/admin/users")
async def admin_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role,
                "status": u.status,
                "joined": u.created_at.strftime("%Y-%m-%d") if u.created_at else "2024-01-01"
            }
            for u in users
        ]
    }

@app.get("/api/admin/properties")
async def admin_properties(db: Session = Depends(get_db)):
    properties = db.query(Property).all()
    return {
        "properties": [
            {
                "id": p.id,
                "title": p.title,
                "price": p.price,
                "listing_type": p.listing_type,
                "location": p.location,
                "bedrooms": p.bedrooms,
                "bathrooms": p.bathrooms,
                "sqft": p.sqft,
                "featured": p.featured,
                "images": json.loads(p.images) if p.images else [],
                "views": p.views,
                "inquiries": p.inquiries,
                "created_at": p.created_at.strftime("%Y-%m-%d") if p.created_at else "2024-01-01"
            }
            for p in properties
        ]
    }

@app.get("/api/admin/transactions")
async def admin_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).all()
    return {
        "transactions": [
            {
                "id": t.id,
                "property": t.property_title,
                "amount": t.amount,
                "buyer": t.buyer,
                "seller": t.seller,
                "date": t.date,
                "status": t.status
            }
            for t in transactions
        ]
    }

@app.get("/api/buyer/properties")
async def get_properties(db: Session = Depends(get_db)):
    properties = db.query(Property).all()
    return {
        "properties": [
            {
                "id": p.id,
                "title": p.title,
                "price": p.price,
                "listing_type": p.listing_type,
                "location": p.location,
                "bedrooms": p.bedrooms,
                "bathrooms": p.bathrooms,
                "sqft": p.sqft,
                "featured": p.featured,
                "images": json.loads(p.images) if p.images else [],
                "views": p.views
            }
            for p in properties
        ],
        "total": len(properties),
        "has_more": False
    }

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🏠 REAL ESTATE API WITH NEONDB POSTGRESQL")
    print("="*60)
    print("Server: http://localhost:8000")
    print("Database: NeonDB Cloud PostgreSQL")
    print("="*60)
    print("⚠️  ADMIN LOGIN:")
    print("   Email/Username: redietgebrehiwot@gmail.com")
    print("   Password: Rediet1212!")
    print("="*60)
    print("Demo Users:")
    print("  Buyer:  buyer / buyer123")
    print("  Seller: seller / seller123")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
