from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: str
    password: str

users = [
    {"id": 1, "username": "redietgebrehiwot@gmail.com", "full_name": "Rediet Gebrehiwot", "password": "Rediet1212!", "role": "admin"},
    {"id": 2, "username": "buyer", "full_name": "Test Buyer", "password": "buyer123", "role": "buyer"},
]

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "ok", "message": "Server running", "timestamp": datetime.now().isoformat()}

@app.post("/api/auth/login")
async def login(login: LoginRequest):
    print(f"\n🔐 Login: {login.username}")
    for user in users:
        if user["username"] == login.username and user["password"] == login.password:
            print(f"✅ Success: {login.username} (Role: {user['role']})")
            return {"access_token": f"token_{user['id']}", "token_type": "bearer", "user": user}
    return {"detail": "Invalid credentials"}

@app.get("/api/admin/stats")
async def stats():
    return {"total_users": 10, "total_properties": 25, "total_transactions": 150, "revenue": 50000}

if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 BACKEND RUNNING on http://localhost:8000")
    print("Admin: redietgebrehiwot@gmail.com / Rediet1212!")
    print("Buyer: buyer / buyer123")
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
