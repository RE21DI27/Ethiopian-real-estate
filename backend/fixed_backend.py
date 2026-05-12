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

# Request Models
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    phone: str
    full_name: str
    role: str = "user"

# Users database
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
    }
]

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "ok", "message": "Server running", "timestamp": datetime.now().isoformat()}

@app.post("/api/auth/login")
async def login(login: LoginRequest):
    print(f"\n🔐 Login attempt: {login.username}")
    
    for user in users:
        if user["username"] == login.username and user["password"] == login.password:
            print(f"✅ Login successful: {login.username} (Role: {user['role']})")
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
    
    print(f"❌ Login failed: {login.username}")
    return {"detail": "Invalid credentials"}

@app.post("/api/auth/register")
async def register(user: RegisterRequest):
    print(f"\n📝 Registering: {user.username}")
    
    for existing in users:
        if existing["username"] == user.username:
            return {"success": False, "detail": "Username already exists"}
        if existing["email"] == user.email:
            return {"success": False, "detail": "Email already exists"}
    
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

@app.get("/api/admin/stats")
async def admin_stats():
    return {
        "total_users": len(users),
        "total_properties": 25,
        "total_transactions": 150,
        "revenue": 50000
    }

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 FIXED BACKEND SERVER")
    print("="*60)
    print("Server: http://localhost:8000")
    print("="*60)
    print("Demo Users:")
    print("  Admin: redietgebrehiwot@gmail.com / Rediet1212!")
    print("  Buyer: buyer / buyer123")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
