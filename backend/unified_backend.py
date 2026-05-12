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
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    phone: str
    full_name: str
    role: str = "user"  # user, buyer, seller, landlord, admin

class UserLogin(BaseModel):
    username: str
    password: str

# Database
users = []

# Seed demo users
users.append({
    "id": 1,
    "username": "buyer",
    "email": "buyer@example.com",
    "full_name": "Test Buyer",
    "phone": "0912345678",
    "password": "buyer123",
    "role": "buyer",
    "created_at": datetime.now().isoformat()
})

users.append({
    "id": 2,
    "username": "seller",
    "email": "seller@example.com",
    "full_name": "Test Seller",
    "phone": "0912345679",
    "password": "seller123",
    "role": "seller",
    "created_at": datetime.now().isoformat()
})

users.append({
    "id": 3,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "Admin User",
    "phone": "0912345680",
    "password": "admin123",
    "role": "admin",
    "created_at": datetime.now().isoformat()
})

# Properties
properties = [
    {"id": 1, "title": "Luxury Apartment", "price": 5800000, "listing_type": "sale", "location": "Bole"},
    {"id": 2, "title": "Modern Villa", "price": 45000, "listing_type": "rent", "location": "Summit"},
]

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "ok", "message": "Server running"}

# Unified Register - handles all user types
@app.post("/api/auth/register")
async def register(user: UserRegister):
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
        "role": user.role,
        "created_at": datetime.now().isoformat()
    }
    users.append(new_user)
    
    return {
        "success": True,
        "message": "Registration successful",
        "user": {
            "id": new_user["id"],
            "username": new_user["username"],
            "email": new_user["email"],
            "full_name": new_user["full_name"],
            "role": new_user["role"]
        }
    }

# Unified Login - handles all user types and returns role
@app.post("/api/auth/login")
async def login(login: UserLogin):
    for user in users:
        if user["username"] == login.username and user["password"] == login.password:
            return {
                "access_token": f"token_{user['id']}_{int(datetime.now().timestamp())}",
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
    return {"detail": "Invalid credentials"}

# Buyer endpoints
@app.get("/api/buyer/properties")
async def get_properties():
    return {"properties": properties, "total": len(properties)}

@app.get("/api/listings/my-listings")
async def get_my_listings():
    return {"listings": properties, "total": len(properties)}

@app.get("/api/activation/status")
async def activation_status():
    return {"is_activated": True, "status": "active"}

@app.get("/api/payments/status")
async def payment_status():
    return {"has_active_subscription": True, "status": "active"}

@app.get("/api/dashboard/stats")
async def get_stats():
    return {"total_properties": len(properties), "active_listings": len(properties)}

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🏠 UNIFIED API SERVER")
    print("="*60)
    print("Server: http://localhost:8000")
    print("="*60)
    print("Demo Users:")
    print("  Buyer:  buyer / buyer123")
    print("  Seller: seller / seller123")
    print("  Admin:  admin / admin123")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
