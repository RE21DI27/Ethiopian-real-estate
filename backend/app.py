from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: str
    password: str

# Admin user
ADMIN_USERNAME = "redietgebrehiwot@gmail.com"
ADMIN_PASSWORD = "Rediet1212!"

users = [
    {"id": 1, "username": ADMIN_USERNAME, "email": ADMIN_USERNAME, 
     "full_name": "Rediet Gebrehiwot", "password": ADMIN_PASSWORD, "role": "admin"},
    {"id": 2, "username": "buyer", "email": "buyer@example.com", 
     "full_name": "Test Buyer", "password": "buyer123", "role": "buyer"},
]

@app.post("/api/auth/login")
async def login(login: LoginRequest):
    print(f"\n🔐 Login: {login.username}")
    for user in users:
        if user["username"] == login.username and user["password"] == login.password:
            print(f"✅ Success: {login.username} (Role: {user['role']})")
            return {
                "access_token": f"token_{user['id']}",
                "token_type": "bearer",
                "user": user
            }
    print(f"❌ Failed: {login.username}")
    return {"detail": "Invalid credentials"}

@app.get("/api/admin/stats")
async def admin_stats():
    return {
        "total_users": 25,
        "total_properties": 48,
        "total_transactions": 127,
        "revenue": 1250000,
        "active_listings": 32,
        "pending_approvals": 5
    }

@app.get("/api/admin/users")
async def admin_users():
    return {"users": users}

@app.get("/api/admin/properties")
async def admin_properties():
    return {
        "properties": [
            {"id": 1, "title": "Luxury Apartment", "price": 5800000, "status": "active"},
            {"id": 2, "title": "Modern Villa", "price": 45000, "status": "active"},
        ]
    }

@app.get("/api/admin/transactions")
async def admin_transactions():
    return {"transactions": []}

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Server running"}

if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 BACKEND RUNNING")
    print("Admin: redietgebrehiwot@gmail.com")
    print("Password: Rediet1212!")
    print("URL: http://localhost:8000")
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
