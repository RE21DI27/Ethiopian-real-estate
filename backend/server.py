from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import uvicorn

app = FastAPI(title="Real Estate API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    phone: str
    full_name: str

class LoginRequest(BaseModel):
    username: str
    password: str

# Database (In-memory)
users = [
    {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "full_name": "Admin User",
        "phone": "0912345678",
        "password": "admin123",
        "role": "admin"
    },
    {
        "id": 2,
        "username": "buyer",
        "email": "buyer@example.com",
        "full_name": "Test Buyer",
        "phone": "0912345679",
        "password": "buyer123",
        "role": "buyer"
    }
]

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
    }
]

# Health Check
@app.get("/")
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Server is running",
        "timestamp": datetime.now().isoformat()
    }

# Authentication Endpoints
@app.post("/api/auth/register")
async def register(user: RegisterRequest):
    for existing in users:
        if existing["username"] == user.username:
            return {"success": False, "message": "Username already exists"}
    
    new_user = {
        "id": len(users) + 1,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "password": user.password,
        "role": "user"
    }
    users.append(new_user)
    return {"success": True, "message": "Registration successful", "user": new_user}

@app.post("/api/auth/login")
async def login(credentials: LoginRequest):
    for user in users:
        if user["username"] == credentials.username and user["password"] == credentials.password:
            return {
                "access_token": f"token_{user['id']}",
                "token_type": "bearer",
                "user": user
            }
    return {"detail": "Invalid credentials"}

# Buyer Endpoints
@app.post("/api/buyer/register")
async def buyer_register(user: RegisterRequest):
    for existing in users:
        if existing["username"] == user.username:
            return {"success": False, "detail": "Username already exists"}
    
    new_user = {
        "id": len(users) + 1,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "password": user.password,
        "role": "buyer"
    }
    users.append(new_user)
    return {"success": True, "message": "Registration successful", "user": new_user}

@app.post("/api/buyer/login")
async def buyer_login(credentials: LoginRequest):
    for user in users:
        if user["username"] == credentials.username and user["password"] == credentials.password:
            return {
                "access_token": f"buyer_token_{user['id']}",
                "token_type": "bearer",
                "user": user
            }
    return {"detail": "Invalid credentials"}

@app.get("/api/buyer/properties")
async def get_properties():
    return {"properties": properties, "total": len(properties), "has_more": False}

@app.get("/api/buyer/properties/{property_id}")
async def get_property(property_id: int):
    for prop in properties:
        if prop["id"] == property_id:
            return prop
    return {"error": "Property not found"}

@app.get("/api/buyer/favorites")
async def get_favorites():
    return {"favorites": []}

# Listings Endpoints
@app.get("/api/listings/my-listings")
async def get_my_listings():
    return {"listings": properties, "total": len(properties)}

# Activation Endpoints
@app.get("/api/activation/status")
async def activation_status():
    return {"is_activated": True, "status": "active"}

# Payment Endpoints
@app.get("/api/payments/status")
async def payment_status():
    return {"has_active_subscription": True, "status": "active"}

# Admin Endpoints
@app.get("/api/admin/stats")
async def admin_stats():
    return {
        "total_users": len(users),
        "total_properties": len(properties),
        "total_transactions": 150,
        "revenue": 50000
    }

@app.get("/api/admin/users")
async def admin_users():
    return {"users": users}

@app.get("/api/admin/properties")
async def admin_properties():
    return {"properties": properties}

# Run Server
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🏠 REAL ESTATE API SERVER")
    print("="*60)
    print(f"📍 Server: http://localhost:8000")
    print(f"📚 API Docs: http://localhost:8000/docs")
    print("="*60)
    print("Demo Users:")
    print("  Admin:  admin / admin123")
    print("  Buyer:  buyer / buyer123")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
