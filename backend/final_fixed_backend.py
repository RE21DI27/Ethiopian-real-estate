from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uvicorn

app = FastAPI()

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
    username: str = Field(..., min_length=3)
    full_name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=10)
    password: str = Field(..., min_length=6)

class BuyerLogin(BaseModel):
    username: str
    password: str

# Database
buyers = []
properties = [
    {"id": 1, "title": "Luxury Apartment in Bole", "price": 5800000, "listing_type": "sale", "location": "Bole, Addis Ababa", "bedrooms": 3, "bathrooms": 3, "sqft": 2200, "featured": True, "images": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"]},
    {"id": 2, "title": "Modern Apartment in Bole", "price": 5500000, "listing_type": "sale", "location": "Bole, Addis Ababa", "bedrooms": 3, "bathrooms": 2, "sqft": 2000, "featured": True, "images": ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"]},
    {"id": 3, "title": "Premium Apartment in Bole", "price": 5900000, "listing_type": "sale", "location": "Bole, Addis Ababa", "bedrooms": 3, "bathrooms": 3, "sqft": 2300, "featured": True, "images": ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500"]},
    {"id": 4, "title": "Beautiful Villa", "price": 12500000, "listing_type": "sale", "location": "Ayat, Addis Ababa", "bedrooms": 5, "bathrooms": 4, "sqft": 4500, "featured": False, "images": ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500"]},
    {"id": 5, "title": "Studio for Rent", "price": 12000, "listing_type": "rent", "location": "CMC, Addis Ababa", "bedrooms": 1, "bathrooms": 1, "sqft": 450, "featured": False, "images": ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"]}
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

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "ok", "message": "Server running"}

@app.post("/api/buyer/register")
async def buyer_register(buyer: BuyerRegister):
    print(f"\n📝 Registration attempt: {buyer.username}")
    
    # Check if username exists
    for existing in buyers:
        if existing["username"] == buyer.username:
            return {"success": False, "detail": "Username already exists"}
    
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
    
    print(f"✅ User registered: {buyer.username}")
    print(f"   Total buyers: {len(buyers)}")
    
    # Return success with user data
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
                "access_token": f"buyer_token_{buyer['id']}_{datetime.now().timestamp()}",
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
    return {"success": False, "detail": "Invalid username or password"}

@app.get("/api/buyer/favorites")
async def get_favorites():
    return {"favorites": []}

@app.get("/api/buyer/saved-searches")
async def get_saved_searches():
    return {"saved_searches": []}

@app.get("/api/buyer/viewed-properties")
async def get_viewed_properties():
    return {"viewed_properties": []}

@app.get("/api/buyer/properties")
async def get_properties():
    return {"properties": properties, "total": len(properties), "has_more": False}

@app.get("/api/buyer/properties/{property_id}")
async def get_property(property_id: int):
    for prop in properties:
        if prop["id"] == property_id:
            return prop
    return {"error": "Property not found"}

@app.get("/api/buyer/conversations")
async def get_conversations():
    return []

@app.get("/api/buyer/conversations/{conv_id}/messages")
async def get_messages(conv_id: int):
    return []

@app.post("/api/buyer/messages")
async def send_message():
    return {"success": True, "message": "Message sent"}

@app.get("/api/listings/my-listings")
async def get_my_listings():
    return {"listings": properties, "total": len(properties)}

@app.get("/api/activation/status")
async def activation_status():
    return {"is_activated": True, "status": "active"}

@app.get("/api/payments/status")
async def payment_status():
    return {"has_active_subscription": True, "status": "active"}

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🏠 REAL ESTATE API SERVER")
    print("="*60)
    print(f"📍 Server: http://localhost:8000")
    print(f"📚 API Docs: http://localhost:8000/docs")
    print("="*60)
    print("Demo Buyer Account:")
    print("  Username: selam")
    print("  Password: selam123")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
