from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import re
from pydantic import BaseModel, Field, validator
from typing import Optional
from ..database import get_db
from ..models import User
from ..config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/buyer/auth/login", auto_error=False)

class BuyerRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    phone_number: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    
    @validator('phone_number')
    def validate_phone(cls, v):
        # Remove any non-digit characters
        cleaned = re.sub(r'\D', '', v)
        if len(cleaned) < 10:
            raise ValueError('Phone number must be at least 10 digits')
        return v

class BuyerLogin(BaseModel):
    username: str
    password: str

class BuyerLogin(BaseModel):
    username: str
    password: str

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_buyer(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(
        User.username == username,
        User.role_type == "buyer"
    ).first()
    
    if user is None:
        raise credentials_exception
    
    return user

# ============ HEALTH CHECK ============
@router.get("/health")
async def health_check():
    return {"status": "ok", "message": "Buyer auth router is working"}

# ============ BUYER REGISTRATION ============
@router.post("/register")
async def register_buyer(
    buyer_data: BuyerRegister,
    db: Session = Depends(get_db)
):
    try:
        print(f"Registration attempt for username: {buyer_data.username}")
        
        # Check if username already exists
        existing_user = db.query(User).filter(User.username == buyer_data.username).first()
        if existing_user:
            print(f"Username {buyer_data.username} already exists")
            raise HTTPException(status_code=400, detail="Username already taken")
        
        # Check if phone number already registered
        existing_phone = db.query(User).filter(User.phone == buyer_data.phone_number).first()
        if existing_phone:
            print(f"Phone {buyer_data.phone_number} already registered")
            raise HTTPException(status_code=400, detail="Phone number already registered")
        
        # Hash the password
        hashed_password = get_password_hash(buyer_data.password)
        
        # Create new buyer user
        new_buyer = User(
            username=buyer_data.username,
            full_name=buyer_data.full_name or buyer_data.username,
            hashed_password=hashed_password,
            password=hashed_password,
            phone=buyer_data.phone_number,
            email=f"{buyer_data.username}@buyer.temp",
            role_type="buyer",
            status="active",
            is_active=True,
            is_verified=True,
            is_activated=True,
            created_at=datetime.utcnow()
        )
        
        db.add(new_buyer)
        db.commit()
        db.refresh(new_buyer)
        
        print(f"User created successfully with ID: {new_buyer.id}")
        
        # Create access token
        access_token = create_access_token(data={"sub": new_buyer.username})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": new_buyer.id,
                "username": new_buyer.username,
                "full_name": new_buyer.full_name,
                "phone": new_buyer.phone,
                "role_type": new_buyer.role_type
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ============ BUYER LOGIN ============
@router.post("/login")
async def login_buyer(
    login_data: BuyerLogin,
    db: Session = Depends(get_db)
):
    try:
        print(f"Login attempt for: {login_data.username}")
        
        # Find user by username or phone number
        user = db.query(User).filter(
            (User.username == login_data.username) | (User.phone == login_data.username)
        ).first()
        
        if not user:
            print(f"User not found: {login_data.username}")
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        print(f"User found: {user.username}, role: {user.role_type}")
        
        # Check if user is a buyer
        if user.role_type != "buyer":
            print(f"User {user.username} is not a buyer (role: {user.role_type})")
            raise HTTPException(status_code=403, detail="This account is not a buyer account")
        
        # Verify password
        if not verify_password(login_data.password, user.hashed_password):
            print(f"Password verification failed for: {user.username}")
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        print(f"Login successful for: {user.username}")
        
        # Create access token
        access_token = create_access_token(data={"sub": user.username})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "phone": user.phone,
                "role_type": user.role_type
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ GET BUYER PROFILE ============
@router.get("/me")
async def get_buyer_profile(
    current_user: User = Depends(get_current_buyer)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "email": current_user.email,
        "role_type": current_user.role_type,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }