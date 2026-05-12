# backend/create_test_activation.py
from app.database import SessionLocal
from app.models import ActivationRequest, ActivationStatus
from datetime import datetime

db = SessionLocal()

test_request = ActivationRequest(
    user_id=1,  # Change to an existing user ID
    full_name="Test User",
    email="test@example.com",
    phone_number="0911111111",
    property_address="Bole, Addis Ababa",
    property_type="apartment",
    business_name="Test Business",
    experience_years=5,
    reason_for_activation="I want to list my property",
    ownership_document="/uploads/activation_documents/user_1/test_doc.pdf",
    business_license="/uploads/activation_documents/user_1/license.pdf",
    property_photos='["/uploads/activation_documents/user_1/photo1.jpg","/uploads/activation_documents/user_1/photo2.jpg"]',
    status=ActivationStatus.PENDING
)

db.add(test_request)
db.commit()
print("Test activation request created with documents!")
db.close()