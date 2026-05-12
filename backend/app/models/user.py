from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class User(Base):
    listings = relationship("Listing", back_populates="user")
    __tablename__ = "users"
    
    # ============ PRIMARY KEY ============
    id = Column(Integer, primary_key=True, index=True)
    
    # ============ AUTHENTICATION FIELDS ============
    email = Column(String(255), unique=True, index=True, nullable=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    password = Column(String(255), nullable=False)  # Redundant field for schema compatibility
    
    # ============ PERSONAL INFORMATION ============
    full_name = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    profile_picture = Column(String(500), nullable=True)
    
    # ============ ROLE AND STATUS FIELDS ============
    role_type = Column(String(50), default="user", nullable=False)  # admin, seller, landlord, buyer, user
    status = Column(String(50), default="pending", nullable=False)  # active, pending, suspended, inactive
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_activated = Column(Boolean, default=False)
    activated_at = Column(DateTime(timezone=True), nullable=True)
    
    # ============ TIMESTAMPS ============
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # ============ PROPERTIES FOR BACKWARD COMPATIBILITY ============
    
    @property
    def role(self):
        """Alias for role_type for backward compatibility"""
        return self.role_type
    
    @role.setter
    def role(self, value):
        """Alias for role_type for backward compatibility"""
        self.role_type = value
    
    @property
    def seller_enabled(self):
        """Check if user is a seller"""
        return self.role_type in ["seller", "admin"]
    
    @property
    def landlord_enabled(self):
        """Check if user is a landlord"""
        return self.role_type in ["landlord", "admin"]
    
    # ============ HELPER METHODS ============
    
    def __repr__(self):
        return f"<User {self.email} (id={self.id}, role={self.role_type})>"
    
    def to_dict(self):
        """Convert user to dictionary for API responses"""
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "full_name": self.full_name,
            "phone": self.phone,
            "role_type": self.role_type,
            "status": self.status,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "is_activated": self.is_activated,
            "seller_enabled": self.seller_enabled,
            "landlord_enabled": self.landlord_enabled,
            "profile_picture": self.profile_picture,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    def is_admin(self):
        """Check if user is admin"""
        return self.role_type == "admin"
    
    def is_seller(self):
        """Check if user is seller"""
        return self.role_type == "seller" or self.role_type == "admin"
    
    def is_landlord(self):
        """Check if user is landlord"""
        return self.role_type == "landlord" or self.role_type == "admin"
    
    def is_buyer(self):
        """Check if user is buyer"""
        return self.role_type == "buyer"
    
    def is_regular_user(self):
        """Check if user is regular user"""
        return self.role_type == "user"
    
    def is_active_account(self):
        """Check if account is active"""
        return self.is_active and self.status == "active"
    
    def can_create_listings(self):
        """Check if user can create listings"""
        return self.is_activated and self.is_active_account() and (self.is_seller() or self.is_landlord())
    
    def can_receive_messages(self):
        """Check if user can receive messages"""
        return self.is_active_account()