from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
import json
import os
import uuid
import shutil
from datetime import datetime
from ..database import get_db
from ..models import User, ActivationRequest, ActivationStatus
from .auth import get_current_user, get_current_admin_user
from pydantic import BaseModel
from sqlalchemy import func

router = APIRouter()

UPLOAD_DIR = "uploads/activation_documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ActivationRequestCreate(BaseModel):
    full_name: str
    email: str
    phone_number: str
    property_address: str
    property_type: str
    business_name: Optional[str] = None
    tax_id: Optional[str] = None
    experience_years: int = 0
    previous_listings_count: int = 0
    reason_for_activation: Optional[str] = None

# ============ UPLOAD DOCUMENTS ============
@router.post("/upload-document")
async def upload_activation_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    try:
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf']
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
        
        file_url = f"/uploads/activation_documents/user_{current_user.id}/{unique_filename}"
        
        return {
            "success": True,
            "url": file_url,
            "message": "Document uploaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ SUBMIT ACTIVATION REQUEST ============
@router.post("/submit-request")
async def submit_activation_request(
    request_data: ActivationRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        existing_request = db.query(ActivationRequest).filter(
            ActivationRequest.user_id == current_user.id,
            func.lower(ActivationRequest.status) == "pending"
        ).first()
        
        if existing_request:
            raise HTTPException(status_code=400, detail="You already have a pending activation request")
        
        if current_user.is_activated:
            raise HTTPException(status_code=400, detail="Your account is already activated")
        
        activation_request = ActivationRequest(
            user_id=current_user.id,
            full_name=request_data.full_name,
            email=request_data.email,
            phone_number=request_data.phone_number,
            property_address=request_data.property_address,
            property_type=request_data.property_type,
            business_name=request_data.business_name,
            tax_id=request_data.tax_id,
            experience_years=request_data.experience_years,
            previous_listings_count=request_data.previous_listings_count,
            reason_for_activation=request_data.reason_for_activation,
            status="pending"
        )
        
        db.add(activation_request)
        db.commit()
        db.refresh(activation_request)
        
        current_user.activation_request_id = activation_request.id
        db.commit()
        
        return {
            "success": True,
            "message": "Activation request submitted successfully. Please wait for admin approval.",
            "request_id": activation_request.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error submitting activation request: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ============ GET USER ACTIVATION STATUS ============
@router.get("/status")
async def get_activation_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        if current_user.is_activated:
            return {
                "is_activated": True,
                "status": "activated",
                "message": "Your account is activated"
            }
        
        pending_request = db.query(ActivationRequest).filter(
            ActivationRequest.user_id == current_user.id,
            func.lower(ActivationRequest.status) == "pending"
        ).first()
        
        if pending_request:
            return {
                "is_activated": False,
                "status": "pending",
                "message": "Your activation request is pending admin approval",
                "request_id": pending_request.id,
                "submitted_at": pending_request.created_at.isoformat()
            }
        
        rejected_request = db.query(ActivationRequest).filter(
            ActivationRequest.user_id == current_user.id,
            func.lower(ActivationRequest.status) == "rejected"
        ).order_by(ActivationRequest.created_at.desc()).first()
        
        if rejected_request:
            return {
                "is_activated": False,
                "status": "rejected",
                "message": "Your activation request was rejected",
                "rejection_reason": rejected_request.rejection_reason,
                "request_id": rejected_request.id
            }
        
        return {
            "is_activated": False,
            "status": "not_submitted",
            "message": "You need to submit an activation request"
        }
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ ADMIN: GET PENDING REQUESTS ============
@router.get("/admin/pending-requests")
async def get_pending_activation_requests(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    try:
        # Use case-insensitive search for status
        requests = db.query(ActivationRequest).filter(
            func.lower(ActivationRequest.status) == "pending"
        ).order_by(ActivationRequest.created_at.desc()).all()
        
        print(f"Found {len(requests)} pending requests")
        
        result = []
        for req in requests:
            user = db.query(User).filter(User.id == req.user_id).first()
            
            property_photos = []
            if req.property_photos:
                try:
                    property_photos = json.loads(req.property_photos) if isinstance(req.property_photos, str) else req.property_photos
                except:
                    property_photos = []
            
            result.append({
                "id": req.id,
                "user_id": req.user_id,
                "user_name": user.full_name if user else req.full_name,
                "user_email": user.email if user else req.email,
                "full_name": req.full_name,
                "email": req.email,
                "phone_number": req.phone_number,
                "property_address": req.property_address,
                "property_type": req.property_type,
                "business_name": req.business_name,
                "tax_id": req.tax_id,
                "experience_years": req.experience_years,
                "previous_listings_count": req.previous_listings_count,
                "reason_for_activation": req.reason_for_activation,
                "status": str(req.status).lower() if req.status else "pending",
                "ownership_document": req.ownership_document,
                "business_license": req.business_license,
                "property_photos": property_photos,
                "rejection_reason": req.rejection_reason,
                "created_at": req.created_at.isoformat() if req.created_at else None
            })
        
        return result
        
    except Exception as e:
        print(f"Error in pending-requests: {e}")
        import traceback
        traceback.print_exc()
        return []

# ============ ADMIN: GET ALL REQUESTS ============
@router.get("/admin/all-requests")
async def get_all_activation_requests(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    try:
        requests = db.query(ActivationRequest).order_by(
            ActivationRequest.created_at.desc()
        ).all()
        
        print(f"Found {len(requests)} total requests")
        
        result = []
        for req in requests:
            user = db.query(User).filter(User.id == req.user_id).first()
            
            property_photos = []
            if req.property_photos:
                try:
                    property_photos = json.loads(req.property_photos) if isinstance(req.property_photos, str) else req.property_photos
                except:
                    property_photos = []
            
            result.append({
                "id": req.id,
                "user_id": req.user_id,
                "user_name": user.full_name if user else req.full_name,
                "user_email": user.email if user else req.email,
                "full_name": req.full_name,
                "email": req.email,
                "phone_number": req.phone_number,
                "property_address": req.property_address,
                "property_type": req.property_type,
                "business_name": req.business_name,
                "tax_id": req.tax_id,
                "experience_years": req.experience_years,
                "previous_listings_count": req.previous_listings_count,
                "reason_for_activation": req.reason_for_activation,
                "status": str(req.status).lower() if req.status else "pending",
                "rejection_reason": req.rejection_reason,
                "ownership_document": req.ownership_document,
                "business_license": req.business_license,
                "property_photos": property_photos,
                "created_at": req.created_at.isoformat() if req.created_at else None,
                "reviewed_at": req.reviewed_at.isoformat() if req.reviewed_at else None
            })
        
        return result
        
    except Exception as e:
        print(f"Error in all-requests: {e}")
        import traceback
        traceback.print_exc()
        return []

# ============ ADMIN: APPROVE REQUEST ============
@router.post("/admin/approve/{request_id}")
async def approve_activation_request(
    request_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    try:
        activation_request = db.query(ActivationRequest).filter(
            ActivationRequest.id == request_id
        ).first()
        
        if not activation_request:
            raise HTTPException(status_code=404, detail="Activation request not found")
        
        # Check status case-insensitive
        req_status = str(activation_request.status).lower() if activation_request.status else "pending"
        
        if req_status != "pending":
            raise HTTPException(status_code=400, detail="This request has already been processed")
        
        # Update activation request
        activation_request.status = "approved"
        activation_request.reviewed_by = current_user.id
        activation_request.reviewed_at = datetime.utcnow()
        
        # Activate the user
        user = db.query(User).filter(User.id == activation_request.user_id).first()
        user.is_activated = True
        user.activated_at = datetime.utcnow()
        user.status = "active"
        
        db.commit()
        
        return {
            "success": True,
            "message": "Activation request approved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error approving request: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ============ ADMIN: REJECT REQUEST ============
@router.post("/admin/reject/{request_id}")
async def reject_activation_request(
    request_id: int,
    rejection_data: dict,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    try:
        activation_request = db.query(ActivationRequest).filter(
            ActivationRequest.id == request_id
        ).first()
        
        if not activation_request:
            raise HTTPException(status_code=404, detail="Activation request not found")
        
        # Check status case-insensitive
        req_status = str(activation_request.status).lower() if activation_request.status else "pending"
        
        if req_status != "pending":
            raise HTTPException(status_code=400, detail="This request has already been processed")
        
        rejection_reason = rejection_data.get("rejection_reason", "No reason provided")
        
        # Update activation request
        activation_request.status = "rejected"
        activation_request.rejection_reason = rejection_reason
        activation_request.reviewed_by = current_user.id
        activation_request.reviewed_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Activation request rejected"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error rejecting request: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ============ ADMIN: GET PENDING COUNT FOR BADGE ============
@router.get("/pending-count")
async def get_pending_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        if current_user.role_type == "admin":
            count = db.query(ActivationRequest).filter(
                func.lower(ActivationRequest.status) == "pending"
            ).count()
            print(f"Pending count: {count}")
            return {"count": count}
        
        pending = db.query(ActivationRequest).filter(
            ActivationRequest.user_id == current_user.id,
            func.lower(ActivationRequest.status) == "pending"
        ).first()
        
        return {"has_pending": pending is not None}
        
    except Exception as e:
        print(f"Error getting pending count: {e}")
        return {"count": 0}

# ============ Force update existing records to lowercase ============
@router.get("/admin/fix-status")
async def fix_status_case(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Convert all status values to lowercase"""
    try:
        requests = db.query(ActivationRequest).all()
        updated = 0
        for req in requests:
            if req.status and req.status != req.status.lower():
                req.status = req.status.lower()
                updated += 1
        
        db.commit()
        return {
            "success": True,
            "message": f"Updated {updated} records to lowercase status"
        }
    except Exception as e:
        print(f"Error fixing status: {e}")
        return {"success": False, "error": str(e)}