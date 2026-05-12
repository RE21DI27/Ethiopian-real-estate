from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn

app = FastAPI(title="Real Estate API")

# Configure CORS - Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    phone: str
    full_name: str

# Demo data
PROPERTIES = [
    {
        "id": 1,
        "title": "Luxury Apartment in Bole",
        "description": "Beautiful luxury apartment in Bole",
        "price": 15000000,
        "listing_type": "sale",
        "city": "Addis Ababa",
        "location": "Bole",
        "bedrooms": 3,
        "bathrooms": 2,
        "sqft": 2200,
        "featured": True,
        "images": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"],
        "created_at": "2024-05-08T10:00:00"
    },
    {
        "id": 2,
        "title": "Modern Villa with Garden",
        "description": "Spacious villa with garden",
        "price": 45000,
        "listing_type": "rent",
        "city": "Addis Ababa",
        "location": "Summit",
        "bedrooms": 4,
        "bathrooms": 3,
        "sqft": 3500,
        "featured": True,
        "images": ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"],
        "created_at": "2024-05-07T15:00:00"
    },
    {
        "id": 3,
        "title": "Cozy Studio Apartment",
        "description": "Perfect studio apartment",
        "price": 12000,
        "listing_type": "rent",
        "city": "Addis Ababa",
        "location": "Mexico",
        "bedrooms": 1,
        "bathrooms": 1,
        "sqft": 450,
        "featured": False,
        "images": ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"],
        "created_at": "2024-05-05T14:00:00"
    },
    {
        "id": 4,
        "title": "Commercial Space",
        "description": "Prime commercial space",
        "price": 25000000,
        "listing_type": "sale",
        "city": "Addis Ababa",
        "location": "Kazanchis",
        "bedrooms": 0,
        "bathrooms": 2,
        "sqft": 5000,
        "featured": False,
        "images": ["https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=500"],
        "created_at": "2024-05-06T09:00:00"
    }
]

USERS = [
    {
        "id": 1,
        "username": "buyer123",
        "email": "buyer@example.com",
        "password": "buyer123",
        "phone": "+251911234567",
        "full_name": "Test Buyer",
        "role": "buyer"
    },
    {
        "id": 2,
        "username": "seller123",
        "email": "seller@example.com",
        "password": "seller123",
        "phone": "+251911234568",
        "full_name": "Test Seller",
        "role": "seller"
    }
]

@app.get("/")
@app.get("/health")
async def root():
    return {
        "status": "healthy",
        "message": "Real Estate API is running!",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/auth/login")
async def login(data: LoginRequest):
    print(f"Login attempt: {data.username}")
    
    user = None
    for u in USERS:
        if u["username"] == data.username and u["password"] == data.password:
            user = u
            break
    
    if not user:
        print("Invalid credentials")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    print(f"Login successful: {user['username']}")
    return {
        "access_token": f"token_{user['id']}",
        "token_type": "bearer",
        "user": user
    }

@app.post("/api/auth/register")
async def register(data: RegisterRequest):
    print(f"Register attempt: {data.username}")
    
    for u in USERS:
        if u["username"] == data.username:
            print(f"Username {data.username} already exists")
            raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = {
        "id": len(USERS) + 1,
        "username": data.username,
        "email": data.email,
        "password": data.password,
        "phone": data.phone,
        "full_name": data.full_name,
        "role": "buyer"
    }
    USERS.append(new_user)
    
    print(f"User {data.username} registered successfully")
    return {
        "message": "User registered successfully",
        "user": new_user
    }

@app.get("/api/buyer/properties")
async def get_properties(search: str = "", listing_type: str = "all", limit: int = 50, offset: int = 0):
    filtered = PROPERTIES.copy()
    
    if search:
        filtered = [p for p in filtered if search.lower() in p["title"].lower() or search.lower() in p["location"].lower()]
    
    if listing_type != "all":
        filtered = [p for p in filtered if p["listing_type"] == listing_type]
    
    total = len(filtered)
    paginated = filtered[offset:offset + limit]
    
    return {
        "properties": paginated,
        "total": total,
        "has_more": offset + limit < total
    }

@app.get("/api/buyer/properties/{property_id}")
async def get_property(property_id: int):
    for prop in PROPERTIES:
        if prop["id"] == property_id:
            return prop
    raise HTTPException(status_code=404, detail="Property not found")

@app.get("/api/buyer/favorites")
async def get_favorites():
    return {"favorites": []}

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🏠 Real Estate API Server")
    print("="*60)
    print("Server: http://localhost:8000")
    print("Docs: http://localhost:8000/docs")
    print("="*60)
    print("Test Login:")
    print("  POST http://localhost:8000/api/auth/login")
    print('  {"username":"buyer123","password":"buyer123"}')
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
