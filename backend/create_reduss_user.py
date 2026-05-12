# backend/create_reduss_user.py
import bcrypt
from app.database import SessionLocal
from app.models.user import User
from datetime import datetime, timedelta

def create_reduss_user():
    db = SessionLocal()
    
    # Check if user exists
    existing_user = db.query(User).filter(
        (User.username == "reduss") | (User.email == "reduss@gmail.com")
    ).first()
    
    # Password
    password = "reduss123"
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    if existing_user:
        print(f"Updating existing user: {existing_user.email}")
        existing_user.status = "active"
        existing_user.is_active = True
        existing_user.is_verified = True
        existing_user.is_activated = True
        existing_user.activated_at = datetime.utcnow()
        existing_user.role_type = "dual"
        existing_user.seller_enabled = True
        existing_user.seller_approved = True
        existing_user.seller_paid = True
        existing_user.landlord_enabled = True
        existing_user.landlord_approved = True
        existing_user.landlord_paid = True
        existing_user.has_active_subscription = True
        existing_user.subscription_plan = "premium"
        existing_user.subscription_start_date = datetime.utcnow()
        existing_user.subscription_end_date = datetime.utcnow() + timedelta(days=365)
        existing_user.payment_status = "completed"
        existing_user.hashed_password = hashed_password.decode('utf-8')
        db.commit()
        print("✅ User updated successfully!")
    else:
        print("Creating new user...")
        new_user = User(
            username="reduss",
            email="reduss@gmail.com",
            full_name="Reduss User",
            hashed_password=hashed_password.decode('utf-8'),
            phone="0912345678",
            role_type="dual",
            status="active",
            is_active=True,
            is_verified=True,
            is_activated=True,
            activated_at=datetime.utcnow(),
            seller_enabled=True,
            seller_approved=True,
            seller_paid=True,
            landlord_enabled=True,
            landlord_approved=True,
            landlord_paid=True,
            has_active_subscription=True,
            subscription_plan="premium",
            subscription_start_date=datetime.utcnow(),
            subscription_end_date=datetime.utcnow() + timedelta(days=365),
            payment_status="completed"
        )
        db.add(new_user)
        db.commit()
        print("✅ User created successfully!")
    
    print("\n" + "="*50)
    print("LOGIN CREDENTIALS:")
    print("="*50)
    print(f"   Email: reduss@gmail.com")
    print(f"   Username: reduss")
    print(f"   Password: reduss123")
    print(f"   Role: Dual (Seller & Landlord)")
    print(f"   Status: Active")
    print(f"   Subscription: Premium (Active)")
    print("="*50)
    
    db.close()

if __name__ == "__main__":
    create_reduss_user()