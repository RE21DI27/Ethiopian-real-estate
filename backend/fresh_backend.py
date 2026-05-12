from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn

app = FastAPI(title="Real Estate API")

# CORS - Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    phone: str
    full_name: str

class UserLogin(BaseModel):
    username: str
    password: str

# Empty database - start with no users
users = []

# Properties database
properties = [
    {
        "id": 1,
        "title": "Luxury Apartment in Bole",
        "price": 15000000,
        "listing_type": "sale",
        "location": "Bole, Addis Ababa",
        "bedrooms": 3,
        "bathrooms": 2,
        "sqft": 2200,
        "featured": True,
        "images": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"]
    },
    {
        "id": 2,
        "title": "Modern Villa with Garden",
        "price": 45000,
        "listing_type": "rent",
        "location": "Summit, Addis Ababa",
        "bedrooms": 4,
        "bathrooms": 3,
        "sqft": 3500,
        "featured": True,
        "images": ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"]
    },
    {
        "id": 3,
        "title": "Cozy Studio Apartment",
        "price": 12000,
        "listing_type": "rent",
        "location": "Mexico, Addis Ababa",
        "bedrooms": 1,
        "bathrooms": 1,
        "sqft": 450,
        "featured": False,
        "images": ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"]
    }
]

@app.get("/")
@app.get("/health")
async def health():
    return {
        "status": "online",
        "message": "API is running - Fresh backend with no users",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/auth/register")
async def register(user: UserRegister):
    print(f"\n📝 Registration attempt: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Full name: {user.full_name}")
    
    # Check if username exists
    for existing_user in users:
        if existing_user["username"] == user.username:
            print(f"❌ Username '{user.username}' already exists")
            raise HTTPException(status_code=400, detail=f"Username '{user.username}' already exists")
        
        if existing_user["email"] == user.email:
            print(f"❌ Email '{user.email}' already exists")
            raise HTTPException(status_code=400, detail=f"Email '{user.email}' already exists")
    
    # Create new user
    new_user = {
        "id": len(users) + 1,
        "username": user.username,
        "email": user.email,
        "password": user.password,
        "phone": user.phone,
        "full_name": user.full_name,
        "role": "user",
        "created_at": datetime.now().isoformat()
    }
    users.append(new_user)
    
    print(f"✅ User '{user.username}' registered successfully!")
    print(f"   Total users: {len(users)}")
    
    return {
        "message": "Registration successful!",
        "user": {
            "id": new_user["id"],
            "username": new_user["username"],
            "email": new_user["email"],
            "full_name": new_user["full_name"],
            "role": new_user["role"]
        }
    }

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    print(f"\n🔐 Login attempt: {credentials.username}")
    
    for user in users:
        if user["username"] == credentials.username and user["password"] == credentials.password:
            print(f"✅ Login successful: {credentials.username}")
            return {
                "access_token": f"token_{user['id']}",
                "token_type": "bearer",
                "user": {
                    "id": user["id"],
                    "username": user["username"],
                    "email": user["email"],
                    "full_name": user["full_name"],
                    "phone": user["phone"],
                    "role": user["role"]
                }
            }
    
    print(f"❌ Login failed: {credentials.username}")
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.get("/api/buyer/properties")
async def get_properties():
    return {
        "properties": properties,
        "total": len(properties),
        "has_more": False
    }

@app.get("/api/buyer/properties/{property_id}")
async def get_property(property_id: int):
    for prop in properties:
        if prop["id"] == property_id:
            return prop
    raise HTTPException(status_code=404, detail="Property not found")

@app.get("/api/buyer/favorites")
async def get_favorites():
    return {"favorites": []}

@app.get("/api/admin/messages")
async def get_messages():
    return {"messages": []}

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 FRESH REAL ESTATE API SERVER")
    print("="*60)
    print("📍 Server: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("="*60)
    print("✨ No users exist yet - You can register new users!")
    print("="*60)
    print("\n✅ Server is starting...\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
