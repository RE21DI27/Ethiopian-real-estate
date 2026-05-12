from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import uvicorn

app = FastAPI()

# CORS - Must be configured correctly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    phone: str
    full_name: str
    role: str = "user"

class LoginRequest(BaseModel):
    username: str
    password: str

# In-memory database
users = [
    {
        "id": 1,
        "username": "buyer",
        "email": "buyer@example.com",
        "full_name": "Test Buyer",
        "phone": "0912345678",
        "password": "buyer123",
        "role": "buyer"
    },
    {
        "id": 2,
        "username": "seller",
        "email": "seller@example.com",
        "full_name": "Test Seller",
        "phone": "0912345679",
        "password": "seller123",
        "role": "seller"
    },
    {
        "id": 3,
        "username": "admin",
        "email": "admin@example.com",
        "full_name": "Admin User",
        "phone": "0912345680",
        "password": "admin123",
        "role": "admin"
    },
    {
        "id": 4,
        "username": "selam",
        "email": "selam@example.com",
        "full_name": "Selam Tesfaye",
        "phone": "0912345681",
        "password": "selam123",
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
        "images": ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500"]
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
        "images": ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"]
    }
]

@app.get("/")
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "message": "Server is running",
        "timestamp": datetime.now().isoformat(),
        "users": len(users),
        "properties": len(properties)
    }

@app.post("/api/auth/register")
async def register(user: RegisterRequest):
    print(f"\n📝 Registering: {user.username}")
    
    # Check if username exists
    for existing in users:
        if existing["username"] == user.username:
            return {"success": False, "detail": "Username already exists"}
    
    # Create new user
    new_user = {
        "id": len(users) + 1,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "password": user.password,
        "role": user.role
    }
    users.append(new_user)
    
    print(f"✅ User registered: {user.username}")
    print(f"   Total users: {len(users)}")
    
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

@app.post("/api/auth/login")
async def login(login: LoginRequest):
    print(f"\n🔐 Login attempt: {login.username}")
    
    for user in users:
        if user["username"] == login.username and user["password"] == login.password:
            print(f"✅ Login successful: {login.username} (Role: {user['role']})")
            return {
                "access_token": f"token_{user['id']}_{int(datetime.now().timestamp())}",
                "token_type": "bearer",
                "user": user
            }
    
    print(f"❌ Login failed: {login.username}")
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

@app.get("/api/buyer/saved-searches")
async def get_saved_searches():
    return {"saved_searches": []}

@app.get("/api/buyer/viewed-properties")
async def get_viewed_properties():
    return {"viewed_properties": []}

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🏠 REAL ESTATE API SERVER")
    print("="*60)
    print("Server: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("="*60)
    print("Demo Users:")
    print("  Buyer:  buyer / buyer123")
    print("  Buyer:  selam / selam123")
    print("  Seller: seller / seller123")
    print("  Admin:  admin / admin123")
    print("="*60)
    print(f"✅ Total users: {len(users)}")
    print(f"✅ Total properties: {len(properties)}")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
