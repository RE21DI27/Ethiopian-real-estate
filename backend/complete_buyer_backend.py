from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn

app = FastAPI(title="Buyer API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class BuyerRegister(BaseModel):
    username: str
    full_name: str
    phone: str
    password: str

class BuyerLogin(BaseModel):
    username: str
    password: str

# Database
buyers = []
properties = [
    {
        "id": 1,
        "title": "Luxury Apartment in Bole",
        "price": 5800000,
        "listing_type": "sale",
        "location": "Bole, Addis Ababa",
        "bedrooms": 3,
        "bathrooms": 3,
        "sqft": 2200,
        "featured": True,
        "images": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"],
        "created_at": "2024-01-15"
    },
    {
        "id": 2,
        "title": "Modern Apartment in Bole",
        "price": 5500000,
        "listing_type": "sale",
        "location": "Bole, Addis Ababa",
        "bedrooms": 3,
        "bathrooms": 2,
        "sqft": 2000,
        "featured": True,
        "images": ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"],
        "created_at": "2024-01-20"
    },
    {
        "id": 3,
        "title": "Premium Apartment in Bole",
        "price": 5900000,
        "listing_type": "sale",
        "location": "Bole, Addis Ababa",
        "bedrooms": 3,
        "bathrooms": 3,
        "sqft": 2300,
        "featured": True,
        "images": ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500"],
        "created_at": "2024-01-25"
    },
    {
        "id": 4,
        "title": "Beautiful Villa",
        "price": 12500000,
        "listing_type": "sale",
        "location": "Ayat, Addis Ababa",
        "bedrooms": 5,
        "bathrooms": 4,
        "sqft": 4500,
        "featured": False,
        "images": ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500"],
        "created_at": "2024-01-10"
    },
    {
        "id": 5,
        "title": "Studio for Rent",
        "price": 12000,
        "listing_type": "rent",
        "location": "CMC, Addis Ababa",
        "bedrooms": 1,
        "bathrooms": 1,
        "sqft": 450,
        "featured": False,
        "images": ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"],
        "created_at": "2024-02-01"
    }
]

# Seed demo buyer
buyers.append({
    "id": 1,
    "username": "selam",
    "full_name": "Selam Tesfaye",
    "phone": "0912345678",
    "password": "selam123",
    "role": "buyer",
    "created_at": datetime.now().isoformat()
})

# Also add a test buyer for registration testing
buyers.append({
    "id": 2,
    "username": "testuser",
    "full_name": "Test User",
    "phone": "0911111111",
    "password": "test123",
    "role": "buyer",
    "created_at": datetime.now().isoformat()
})

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "ok", "message": "Buyer API is running", "timestamp": datetime.now().isoformat()}

@app.post("/api/buyer/register")
async def buyer_register(buyer: BuyerRegister):
    print(f"\n📝 Registration attempt:")
    print(f"   Username: {buyer.username}")
    print(f"   Full Name: {buyer.full_name}")
    print(f"   Phone: {buyer.phone}")
    
    # Check if username exists
    for existing in buyers:
        if existing["username"] == buyer.username:
            print(f"❌ Username '{buyer.username}' already exists")
            return {"success": False, "detail": "Username already exists. Please choose another one."}
    
    # Create new buyer
    new_buyer = {
        "id": len(buyers) + 1,
        "username": buyer.username,
        "full_name": buyer.full_name,
        "phone": buyer.phone,
        "password": buyer.password,
        "role": "buyer",
        "created_at": datetime.now().isoformat()
    }
    buyers.append(new_buyer)
    
    print(f"✅ User registered successfully: {buyer.username}")
    print(f"   Total buyers: {len(buyers)}")
    
    return {
        "success": True,
        "message": "Registration successful",
        "user": {
            "id": new_buyer["id"],
            "username": new_buyer["username"],
            "full_name": new_buyer["full_name"],
            "phone": new_buyer["phone"],
            "role": new_buyer["role"]
        }
    }

@app.post("/api/buyer/login")
async def buyer_login(login: BuyerLogin):
    print(f"\n🔐 Login attempt: {login.username}")
    
    for buyer in buyers:
        if buyer["username"] == login.username and buyer["password"] == login.password:
            print(f"✅ Login successful: {login.username}")
            return {
                "access_token": f"buyer_token_{buyer['id']}_{int(datetime.now().timestamp())}",
                "token_type": "bearer",
                "user": {
                    "id": buyer["id"],
                    "username": buyer["username"],
                    "full_name": buyer["full_name"],
                    "phone": buyer["phone"],
                    "role": buyer["role"]
                }
            }
    
    print(f"❌ Login failed: {login.username}")
    return {"detail": "Invalid username or password"}

@app.get("/api/buyer/properties")
async def get_properties(
    search: str = "",
    listing_type: str = "all",
    limit: int = 50,
    offset: int = 0
):
    filtered = properties.copy()
    
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
    for prop in properties:
        if prop["id"] == property_id:
            return prop
    raise HTTPException(status_code=404, detail="Property not found")

@app.get("/api/buyer/favorites")
async def get_favorites():
    return {"favorites": []}

@app.get("/api/buyer/saved-searches")
async def get_saved_searches():
    return {"saved_searches": []}

@app.get("/api/buyer/viewed-properties")
async def get_viewed_properties():
    return {"viewed_properties": []}

@app.get("/api/listings/my-listings")
async def get_my_listings():
    return {"listings": properties, "total": len(properties)}

@app.get("/api/activation/status")
async def activation_status():
    return {"is_activated": True, "status": "active"}

@app.get("/api/payments/status")
async def payment_status():
    return {"has_active_subscription": True, "status": "active"}

@app.get("/api/buyer/conversations")
async def get_conversations():
    return []

@app.get("/api/buyer/conversations/{conv_id}/messages")
async def get_messages(conv_id: int):
    return []

@app.post("/api/buyer/messages")
async def send_message():
    return {"success": True, "message": "Message sent"}

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🏠 COMPLETE BUYER API SERVER")
    print("="*60)
    print("📍 Server: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("="*60)
    print("Demo Accounts:")
    print("  1. Username: selam    | Password: selam123")
    print("  2. Username: testuser | Password: test123")
    print("="*60)
    print("Registration: POST /api/buyer/register")
    print("Login: POST /api/buyer/login")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
