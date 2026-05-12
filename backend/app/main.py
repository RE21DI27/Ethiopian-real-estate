from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .routers import auth, admin, listings, users, messages, notifications, payments, settings, password_reset, activation, buyer, buyer_auth
from .database import engine, Base

# Create uploads directory
os.makedirs("uploads/listings", exist_ok=True)
os.makedirs("uploads/documents", exist_ok=True)
os.makedirs("uploads/activation_documents", exist_ok=True)

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="RealEstate Pro API", docs_url="/docs")

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS - Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers - ALL ROUTERS INCLUDING BUYER
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(listings.router, prefix="/api/listings", tags=["listings"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(password_reset.router, prefix="/api/password-reset", tags=["password-reset"])
app.include_router(activation.router, prefix="/api/activation", tags=["activation"])
app.include_router(buyer.router, prefix="/api/buyer", tags=["buyer"])
app.include_router(buyer_auth.router, prefix="/api/buyer/auth", tags=["buyer-auth"])

@app.get("/")
def root():
    return {"message": "RealEstate Pro API"}

@app.get("/health")
def health():
    return {"status": "ok", "message": "Server is running"}