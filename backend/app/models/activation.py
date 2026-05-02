from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from ..database import Base
import enum

class ActivationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class ActivationRequest(Base):
    __tablename__ = "activation_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Personal Information
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=False)
    
    # Property Information
    property_address = Column(String(500), nullable=False)
    property_type = Column(String(100), nullable=False)
    ownership_document = Column(String(500), nullable=True)
    property_photos = Column(Text, nullable=True)  # JSON array of photo URLs
    
    # Business Information (for agents/landlords)
    business_name = Column(String(255), nullable=True)
    business_license = Column(String(500), nullable=True)
    tax_id = Column(String(100), nullable=True)
    
    # Additional Info
    experience_years = Column(Integer, default=0)
    previous_listings_count = Column(Integer, default=0)
    reason_for_activation = Column(Text, nullable=True)
    
    # Status
    status = Column(Enum(ActivationStatus), default=ActivationStatus.PENDING)
    rejection_reason = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<ActivationRequest {self.id} - {self.status.value}>"