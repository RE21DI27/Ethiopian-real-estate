from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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
    username: str
    full_name: str
    phone: str
    password: str

class BuyerLogin(BaseModel):
    username: str
    password: str

# Database
buyers = []

# Add demo buyer
buyers.append({
    "id": 1,
    "username": "selam",
    "full_name": "Selam Tesfaye",
    "phone": "0912345678",
    "password": "selam123",
    "role": "buyer",
    "created_at": datetime.now().isoformat()
})

# Properties
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
        "images": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"]
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
        "images": ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"]
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
        "images": ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500"]
    }
]

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "ok", "message": "Server running", "timestamp": datetime.now().isoformat()}

# Buyer Register
@app.post("/api/buyer/register")
async def register(buyer: BuyerRegister):
    print(f"\n📝 Registering: {buyer.username}")
    
    for existing in buyers:
        if existing["username"] == buyer.username:
            return {"success": False, "detail": "Username already exists"}
    
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
    
    print(f"✅ Registered: {buyer.username}")
    
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

# Buyer Login
@app.post("/api/buyer/login")
async def login(login: BuyerLogin):
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
    return {"detail": "Invalid credentials"}

# Buyer Properties
@app.get("/api/buyer/properties")
async def get_properties():
    return {"properties": properties, "total": len(properties), "has_more": False}

@app.get("/api/buyer/favorites")
async def get_favorites():
    return {"favorites": []}

@app.get("/api/buyer/saved-searches")
async def get_saved_searches():
    return {"saved_searches": []}

@app.get("/api/buyer/viewed-properties")
async def get_viewed_properties():
    return {"viewed_properties": []}

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🏠 BUYER API SERVER")
    print("="*60)
    print("Server: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("="*60)
    print("Demo Buyer:")
    print("  Username: selam")
    print("  Password: selam123")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
