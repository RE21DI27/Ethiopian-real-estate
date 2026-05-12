from fastapi import APIRouter, Depends, HTTPException, Query, Header, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc, and_
from typing import Optional
from datetime import datetime
import json
from ..database import get_db
from ..models.user import User
from .auth import get_current_user
from pydantic import BaseModel

router = APIRouter(tags=["Buyer"])

class ContactOwnerRequest(BaseModel):
    property_id: int
    message: str

class SendMessageRequest(BaseModel):
    conversation_id: int
    message: str

class SavePropertyRequest(BaseModel):
    listing_id: int

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None

# ============ BUYER REGISTRATION ============
@router.post("/register")
async def buyer_register(user_data: dict, db: Session = Depends(get_db)):
    print(f"\n📝 Buyer Register: {user_data.get('username')}")
    
    # Check if user exists
    existing = db.query(User).filter(
        (User.username == user_data.get('username')) | 
        (User.email == user_data.get('email', ''))
    ).first()
    
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    
    # Create new buyer
    new_user = User(
        username=user_data.get('username'),
        email=user_data.get('email', f"{user_data.get('username')}@example.com"),
        password=user_data.get('password'),
        full_name=user_data.get('full_name'),
        phone=user_data.get('phone'),
        role="buyer",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"✅ Buyer registered: {user_data.get('username')}")
    
    return {
        "success": True,
        "message": "Registration successful",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "full_name": new_user.full_name,
            "role": new_user.role
        }
    }

# ============ BUYER LOGIN ============
@router.post("/login")
async def buyer_login(login_data: dict, db: Session = Depends(get_db)):
    print(f"\n🔐 Buyer Login: {login_data.get('username')}")
    
    user = db.query(User).filter(
        User.username == login_data.get('username')
    ).first()
    
    if not user or user.password != login_data.get('password'):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    return {
        "access_token": f"buyer_token_{user.id}",
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role
        }
    }

# ============ PUBLIC PROPERTIES ============
@router.get("/properties")
async def get_public_properties(
    db: Session = Depends(get_db),
    search: Optional[str] = None,
    listing_type: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    """Get all public properties"""
    return {
        "properties": [
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
            }
        ],
        "total": 3,
        "has_more": False
    }


@router.get("/properties/{property_id}")
async def get_public_property(
    property_id: int,
    db: Session = Depends(get_db)
):
    """Get single property details"""
    properties = {
        1: {
            "id": 1,
            "title": "Luxury Apartment in Bole",
            "price": 5800000,
            "listing_type": "sale",
            "location": "Bole, Addis Ababa",
            "bedrooms": 3,
            "bathrooms": 3,
            "sqft": 2200,
            "featured": True,
            "description": "Beautiful luxury apartment in the heart of Bole",
            "images": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"]
        },
        2: {
            "id": 2,
            "title": "Modern Apartment in Bole",
            "price": 5500000,
            "listing_type": "sale",
            "location": "Bole, Addis Ababa",
            "bedrooms": 3,
            "bathrooms": 2,
            "sqft": 2000,
            "featured": True,
            "description": "Modern apartment with great amenities",
            "images": ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"]
        },
        3: {
            "id": 3,
            "title": "Premium Apartment in Bole",
            "price": 5900000,
            "listing_type": "sale",
            "location": "Bole, Addis Ababa",
            "bedrooms": 3,
            "bathrooms": 3,
            "sqft": 2300,
            "featured": True,
            "description": "Premium luxury apartment with all amenities",
            "images": ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500"]
        }
    }
    
    if property_id in properties:
        return properties[property_id]
    
    raise HTTPException(status_code=404, detail="Property not found")


# ============ FAVORITES ============
@router.get("/favorites")
async def get_favorites():
    """Get user's favorite properties"""
    return {"favorites": []}


@router.post("/favorites/{property_id}")
async def add_favorite(property_id: int):
    """Add property to favorites"""
    return {"message": f"Property {property_id} added to favorites"}


@router.delete("/favorites/{property_id}")
async def remove_favorite(property_id: int):
    """Remove property from favorites"""
    return {"message": f"Property {property_id} removed from favorites"}


# ============ SAVED SEARCHES ============
@router.get("/saved-searches")
async def get_saved_searches():
    """Get saved searches"""
    return {"saved_searches": []}


@router.post("/saved-searches")
async def save_search():
    """Save a search"""
    return {"message": "Search saved"}


# ============ VIEWED PROPERTIES ============
@router.get("/viewed-properties")
async def get_viewed_properties():
    """Get recently viewed properties"""
    return {"viewed_properties": []}


# ============ PROFILE ============
@router.get("/profile")
async def get_buyer_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get buyer profile information"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "email": current_user.email,
        "role": current_user.role,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }


@router.put("/profile")
async def update_buyer_profile(
    profile_data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update buyer profile"""
    try:
        if profile_data.full_name:
            current_user.full_name = profile_data.full_name
        if profile_data.phone:
            current_user.phone = profile_data.phone
        
        db.commit()
        
        return {
            "success": True, 
            "message": "Profile updated successfully",
            "user": {
                "id": current_user.id,
                "username": current_user.username,
                "full_name": current_user.full_name,
                "phone": current_user.phone
            }
        }
    except Exception as e:
        print(f"Error updating profile: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ============ STATS ============
@router.get("/stats")
async def get_buyer_stats():
    """Get buyer dashboard statistics"""
    return {
        "saved_properties": 0,
        "messages": 0,
        "searches": 0,
        "viewed_properties": 0
    }