from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import uvicorn

app = FastAPI()

# CORS - Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BuyerRegister(BaseModel):
    username: str
    full_name: str
    phone: str
    password: str
    email: str = ""

class BuyerLogin(BaseModel):
    username: str
    password: str

# Users database
users = [
    {"id": 1, "username": "redietgebrehiwot@gmail.com", "email": "redietgebrehiwot@gmail.com", 
     "full_name": "Rediet Gebrehiwot", "phone": "0912345680", "password": "Rediet1212!", "role": "admin"},
    {"id": 2, "username": "buyer", "email": "buyer@example.com", "full_name": "Test Buyer", 
     "phone": "0912345678", "password": "buyer123", "role": "buyer"},
]

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "ok", "message": "Server running", "timestamp": datetime.now().isoformat()}

@app.post("/api/buyer/register")
async def buyer_register(buyer: BuyerRegister):
    print(f"📝 Registering: {buyer.username}")
    for existing in users:
        if existing["username"] == buyer.username:
            return {"success": False, "detail": "Username already exists"}
    new_user = {"id": len(users)+1, **buyer.dict(), "role": "buyer"}
    users.append(new_user)
    print(f"✅ Registered: {buyer.username}")
    return {"success": True, "message": "Registration successful", "user": new_user}

@app.post("/api/buyer/login")
async def buyer_login(login: BuyerLogin):
    print(f"🔐 Login: {login.username}")
    for user in users:
        if user["username"] == login.username and user["password"] == login.password:
            print(f"✅ Success: {login.username} (Role: {user['role']})")
            return {"access_token": f"token_{user['id']}", "token_type": "bearer", "user": user}
    return {"detail": "Invalid credentials"}

@app.post("/api/auth/login")
async def auth_login(login: BuyerLogin):
    print(f"🔐 Auth Login: {login.username}")
    for user in users:
        if user["username"] == login.username and user["password"] == login.password:
            print(f"✅ Success: {login.username} (Role: {user['role']})")
            return {"access_token": f"token_{user['id']}", "token_type": "bearer", "user": user}
    return {"detail": "Invalid credentials"}

@app.get("/api/admin/stats")
async def stats():
    return {"total_users": len(users), "total_properties": 10, "total_transactions": 150, "revenue": 50000}

if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 BACKEND RUNNING on http://localhost:8000")
    print("Admin: redietgebrehiwot@gmail.com / Rediet1212!")
    print("Buyer: buyer / buyer123")
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
