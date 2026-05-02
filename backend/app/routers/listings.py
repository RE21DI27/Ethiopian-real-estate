from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
import json
import os
import uuid
import shutil
from datetime import datetime
from ..database import get_db
from ..models import User, Listing
from .auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

UPLOAD_DIR = "uploads/listings"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ListingCreate(BaseModel):
    title: str
    property_type: str = "house"
    price: float
    bedrooms: int = 0
    bathrooms: int = 0
    sqft: float = 0
    year_built: Optional[int] = None
    address: str
    city: str
    region: Optional[str] = None
    sub_city: Optional[str] = None
    kebele: Optional[str] = None
    zip_code: Optional[str] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    cover_image: Optional[str] = None
    amenities: Optional[List[str]] = None
    listing_type: str = "sale"
    phone_number: Optional[str] = None
    email: Optional[str] = None
    status: str = "draft"
    is_draft: bool = True

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    property_type: Optional[str] = None
    price: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    sqft: Optional[float] = None
    year_built: Optional[int] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    sub_city: Optional[str] = None
    kebele: Optional[str] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    cover_image: Optional[str] = None
    amenities: Optional[List[str]] = None
    listing_type: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None
    is_draft: Optional[bool] = None

# ============ IMAGE UPLOAD ============
@router.post("/upload-image")
async def upload_listing_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    try:
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Max 10MB")
        
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        user_upload_dir = f"{UPLOAD_DIR}/user_{current_user.id}"
        os.makedirs(user_upload_dir, exist_ok=True)
        
        file_path = os.path.join(user_upload_dir, unique_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        image_url = f"/uploads/listings/user_{current_user.id}/{unique_filename}"
        
        return {
            "success": True,
            "url": image_url,
            "message": "Image uploaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ CREATE LISTING ============
@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_listing(
    listing_data: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        amenities_json = json.dumps(listing_data.amenities) if listing_data.amenities else None
        images_json = json.dumps(listing_data.images) if listing_data.images else None
        
        status_value = "draft" if listing_data.is_draft else "active"
        
        new_listing = Listing(
            title=listing_data.title,
            description=listing_data.description,
            price=listing_data.price,
            listing_type=listing_data.listing_type,
            property_type=listing_data.property_type,
            bedrooms=listing_data.bedrooms,
            bathrooms=listing_data.bathrooms,
            sqft=listing_data.sqft,
            year_built=listing_data.year_built,
            status=status_value,
            is_draft=listing_data.is_draft,
            address=listing_data.address,
            city=listing_data.city,
            region=listing_data.region,
            sub_city=listing_data.sub_city,
            kebele=listing_data.kebele,
            zip_code=listing_data.zip_code,
            images=images_json,
            cover_image=listing_data.cover_image,
            amenities=amenities_json,
            phone_number=listing_data.phone_number,
            email=listing_data.email,
            videos=None,
            documents=None,
            views_count=0,
            featured=False,
            user_id=current_user.id,
            published_at=datetime.utcnow() if not listing_data.is_draft else None
        )
        
        db.add(new_listing)
        db.commit()
        db.refresh(new_listing)
        
        return {
            "success": True,
            "message": "Listing saved as draft" if listing_data.is_draft else "Listing published successfully",
            "listing_id": new_listing.id,
            "is_draft": new_listing.is_draft,
            "status": new_listing.status
        }
        
    except Exception as e:
        print(f"Error creating listing: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ============ GET MY LISTINGS (FIXED - SHOWS DRAFTS BY DEFAULT) ============
@router.get("/my-listings")
async def get_my_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    include_drafts: bool = Query(True, description="Include draft listings")  # FIXED: Default is now True
):
    try:
        print(f"Fetching listings for user: {current_user.email}")
        print(f"Include drafts: {include_drafts}")
        
        query = db.query(Listing).filter(Listing.user_id == current_user.id)
        
        # Only filter out drafts if include_drafts is False
        if not include_drafts:
            query = query.filter(Listing.is_draft == False, Listing.status == "active")
        
        listings = query.order_by(Listing.created_at.desc()).all()
        
        print(f"Found {len(listings)} listings")
        
        result = []
        for l in listings:
            images = []
            if l.images:
                try:
                    images = json.loads(l.images) if isinstance(l.images, str) else l.images
                except:
                    images = []
            
            result.append({
                "id": l.id,
                "title": l.title,
                "listing_type": l.listing_type,
                "status": l.status,
                "price": l.price,
                "description": l.description,
                "bedrooms": l.bedrooms,
                "bathrooms": l.bathrooms,
                "sqft": l.sqft,
                "year_built": l.year_built,
                "images": images,
                "cover_image": l.cover_image,
                "address": l.address,
                "city": l.city,
                "region": l.region,
                "sub_city": l.sub_city,
                "kebele": l.kebele,
                "phone_number": l.phone_number,
                "email": l.email,
                "views_count": l.views_count,
                "is_draft": l.is_draft,
                "created_at": l.created_at.isoformat() if l.created_at else None
            })
        
        return result
        
    except Exception as e:
        print(f"Error fetching listings: {e}")
        return []

# ============ GET SINGLE LISTING ============
@router.get("/{listing_id}")
async def get_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        if listing.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Permission denied")
        
        images = json.loads(listing.images) if listing.images else []
        amenities = json.loads(listing.amenities) if listing.amenities else []
        
        return {
            "id": listing.id,
            "title": listing.title,
            "description": listing.description,
            "price": listing.price,
            "listing_type": listing.listing_type,
            "property_type": listing.property_type,
            "bedrooms": listing.bedrooms,
            "bathrooms": listing.bathrooms,
            "sqft": listing.sqft,
            "year_built": listing.year_built,
            "address": listing.address,
            "city": listing.city,
            "region": listing.region,
            "sub_city": listing.sub_city,
            "kebele": listing.kebele,
            "images": images,
            "cover_image": listing.cover_image,
            "amenities": amenities,
            "phone_number": listing.phone_number,
            "email": listing.email,
            "status": listing.status,
            "is_draft": listing.is_draft
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting listing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ UPDATE LISTING ============
@router.put("/{listing_id}")
async def update_listing(
    listing_id: int,
    listing_data: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        if listing.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Permission denied")
        
        if listing_data.title is not None:
            listing.title = listing_data.title
        if listing_data.property_type is not None:
            listing.property_type = listing_data.property_type
        if listing_data.price is not None:
            listing.price = listing_data.price
        if listing_data.bedrooms is not None:
            listing.bedrooms = listing_data.bedrooms
        if listing_data.bathrooms is not None:
            listing.bathrooms = listing_data.bathrooms
        if listing_data.sqft is not None:
            listing.sqft = listing_data.sqft
        if listing_data.year_built is not None:
            listing.year_built = listing_data.year_built
        if listing_data.address is not None:
            listing.address = listing_data.address
        if listing_data.city is not None:
            listing.city = listing_data.city
        if listing_data.region is not None:
            listing.region = listing_data.region
        if listing_data.sub_city is not None:
            listing.sub_city = listing_data.sub_city
        if listing_data.kebele is not None:
            listing.kebele = listing_data.kebele
        if listing_data.description is not None:
            listing.description = listing_data.description
        if listing_data.images is not None:
            listing.images = json.dumps(listing_data.images)
        if listing_data.cover_image is not None:
            listing.cover_image = listing_data.cover_image
        if listing_data.amenities is not None:
            listing.amenities = json.dumps(listing_data.amenities)
        if listing_data.listing_type is not None:
            listing.listing_type = listing_data.listing_type
        if listing_data.phone_number is not None:
            listing.phone_number = listing_data.phone_number
        if listing_data.email is not None:
            listing.email = listing_data.email
        if listing_data.status is not None:
            listing.status = listing_data.status
        if listing_data.is_draft is not None:
            listing.is_draft = listing_data.is_draft
        
        listing.updated_at = datetime.utcnow()
        db.commit()
        
        return {
            "success": True,
            "message": "Listing updated successfully",
            "listing_id": listing.id
        }
        
    except Exception as e:
        print(f"Error updating listing: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ============ DELETE LISTING ============
@router.delete("/{listing_id}")
async def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        if listing.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Permission denied")
        
        db.delete(listing)
        db.commit()
        
        return {"success": True, "message": "Listing deleted successfully"}
        
    except Exception as e:
        print(f"Error deleting listing: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ============ PUBLISH DRAFT ============
@router.post("/publish/{listing_id}")
async def publish_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        if listing.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You don't own this listing")
        
        listing.is_draft = False
        listing.status = "active"
        listing.published_at = datetime.utcnow()
        listing.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Listing published successfully",
            "listing_id": listing.id
        }
        
    except Exception as e:
        print(f"Error publishing listing: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))