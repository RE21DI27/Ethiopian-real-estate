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

# ============ MODELS ============
class BuyerRegister(BaseModel):
    username: str
    full_name: str
    phone: str
    password: str
    email: str = ""

class BuyerLogin(BaseModel):
    username: str
    password: str

class UnifiedLogin(BaseModel):
    username: str
    password: str

# ============ DATABASE ============
users = [
    {
        "id": 1,
        "username": "redietgebrehiwot@gmail.com",
        "email": "redietgebrehiwot@gmail.com",
        "full_name": "Rediet Gebrehiwot",
        "phone": "0912345680",
        "password": "Rediet1212!",
        "role": "admin"
    },
    {
        "id": 2,
        "username": "buyer",
        "email": "buyer@example.com",
        "full_name": "Test Buyer",
        "phone": "0912345678",
        "password": "buyer123",
        "role": "buyer"
    },
    {
        "id": 3,
        "username": "seller",
        "email": "seller@example.com",
        "full_name": "Test Seller",
        "phone": "0912345679",
        "password": "seller123",
        "role": "seller"
    }
]

# ============ PROPERTIES ============
properties = [
    {"id": 1, "title": "Luxury Apartment in Bole", "price": 5800000, "listing_type": "sale", "location": "Bole, Addis Ababa", "bedrooms": 3, "bathrooms": 3, "sqft": 2200, "featured": True, "images": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"]},
    {"id": 2, "title": "Modern Apartment in Bole", "price": 5500000, "listing_type": "sale", "location": "Bole, Addis Ababa", "bedrooms": 3, "bathrooms": 2, "sqft": 2000, "featured": True, "images": ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"]},
]

# ============ HEALTH ============
@app.get("/")
@app.get("/health")
async def health():
    return {"status": "ok", "message": "Server running", "timestamp": datetime.now().isoformat()}

# ============ BUYER REGISTER ============
@app.post("/api/buyer/register")
async def buyer_register(buyer: BuyerRegister):
    print(f"\n📝 Registering: {buyer.username}")
    
    # Check if username exists
    for existing in users:
        if existing["username"] == buyer.username:
            return {"success": False, "detail": "Username already exists"}
    
    # Create new user
    new_user = {
        "id": len(users) + 1,
        "username": buyer.username,
        "email": buyer.email if buyer.email else f"{buyer.username}@example.com",
        "full_name": buyer.full_name,
        "phone": buyer.phone,
        "password": buyer.password,
        "role": "buyer"
    }
    users.append(new_user)
    
    print(f"✅ User registered: {buyer.username}")
    print(f"   Total users: {len(users)}")
    
    return {
        "success": True,
        "message": "Registration successful",
        "user": {
            "id": new_user["id"],
            "username": new_user["username"],
            "full_name": new_user["full_name"],
            "role": new_user["role"]
        }
    }

# ============ BUYER LOGIN ============
@app.post("/api/buyer/login")
async def buyer_login(login: BuyerLogin):
    print(f"\n🔐 Buyer Login: {login.username}")
    
    for user in users:
        if user["username"] == login.username and user["password"] == login.password:
            print(f"✅ Login successful: {login.username} (Role: {user['role']})")
            return {
                "access_token": f"buyer_token_{user['id']}",
                "token_type": "bearer",
                "user": {
                    "id": user["id"],
                    "username": user["username"],
                    "full_name": user["full_name"],
                    "role": user["role"]
                }
            }
    
    print(f"❌ Login failed: {login.username}")
    return {"detail": "Invalid credentials"}

# ============ UNIFIED LOGIN ============
@app.post("/api/auth/login")
async def unified_login(login: UnifiedLogin):
    print(f"\n🔐 Auth Login: {login.username}")
    
    for user in users:
        if user["username"] == login.username and user["password"] == login.password:
            print(f"✅ Login successful: {login.username} (Role: {user['role']})")
            return {
                "access_token": f"token_{user['id']}",
                "token_type": "bearer",
                "user": user
            }
    
    print(f"❌ Login failed: {login.username}")
    return {"detail": "Invalid credentials"}

# ============ PROPERTIES ============
@app.get("/api/buyer/properties")
async def get_properties():
    return {"properties": properties, "total": len(properties), "has_more": False}

# ============ MY LISTINGS ============
@app.get("/api/listings/my-listings")
async def get_my_listings():
    return {"listings": properties, "total": len(properties)}

# ============ ACTIVATION ============
@app.get("/api/activation/status")
async def activation_status():
    return {"is_activated": True, "status": "active"}

# ============ PAYMENTS ============
@app.get("/api/payments/status")
async def payment_status():
    return {"has_active_subscription": True, "status": "active"}

# ============ ADMIN ============
@app.get("/api/admin/stats")
async def admin_stats():
    return {
        "total_users": len(users),
        "total_properties": len(properties),
        "total_transactions": 150,
        "revenue": 50000
    }

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 COMPLETE BACKEND SERVER")
    print("="*60)
    print("Server: http://localhost:8000")
    print("="*60)
    print("Endpoints:")
    print("  POST /api/buyer/register - Buyer registration")
    print("  POST /api/buyer/login - Buyer login")
    print("  POST /api/auth/login - Admin login")
    print("  GET /api/buyer/properties - Get properties")
    print("="*60)
    print("Demo Users:")
    print("  Admin: redietgebrehiwot@gmail.com / Rediet1212!")
    print("  Buyer: buyer / buyer123")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
