#!/usr/bin/env python3
"""
Script to create an admin user for testing purposes
"""
import sys
sys.path.insert(0, '/home/erediet/Videos/realestate/Ethioian-real-state/backend')

from app.database import SessionLocal, engine, Base
from app.models import User
import bcrypt
from datetime import datetime

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_admin():
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(
            User.email == "redietg18@gmail.com"
        ).first()
        
        if existing_admin:
            print(f"✓ Admin user already exists: {existing_admin.email}")
            print(f"  Username: {existing_admin.username}")
            print(f"  Role: {existing_admin.role}")
            return
        
        # Create new admin user
        hashed_password = get_password_hash("Rediet@990")
        
        admin_user = User(
            email="redietg18@gmail.com",
            username="admin",
            full_name="Admin User",
            password=hashed_password,
            phone="+251911111111",
            role="admin",
            created_at=datetime.utcnow()
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✓ Admin user created successfully!")
        print(f"  Email: {admin_user.email}")
        print(f"  Username: {admin_user.username}")
        print(f"  Password: Rediet@990")
        print(f"  Role: {admin_user.role}")
        
    except Exception as e:
        print(f"✗ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
