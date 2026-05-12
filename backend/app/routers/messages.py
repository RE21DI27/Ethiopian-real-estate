from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from ..database import get_db
from ..models import User, Message, Conversation
from .auth import get_current_user

router = APIRouter()

class SendMessageRequest(BaseModel):
    receiver_id: int
    message: str
    subject: Optional[str] = None

class StartConversationRequest(BaseModel):
    property_id: int
    message: str

@router.post("/send")
async def send_message(
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to another user"""
    try:
        # Check if receiver exists
        receiver = db.query(User).filter(User.id == request.receiver_id).first()
        if not receiver:
            raise HTTPException(status_code=404, detail="Receiver not found")
        
        # Check if conversation exists
        conversation = db.query(Conversation).filter(
            or_(
                Conversation.buyer_id == current_user.id,
                Conversation.seller_id == current_user.id
            )
        ).first()
        
        if not conversation:
            # Create new conversation
            conversation = Conversation(
                buyer_id=current_user.id,
                seller_id=request.receiver_id,
                last_message=request.message,
                last_message_time=datetime.utcnow(),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
        
        # Create message
        new_message = Message(
            conversation_id=conversation.id,
            sender_id=current_user.id,
            receiver_id=request.receiver_id,
            content=request.message,
            subject=request.subject or "New Message",
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.add(new_message)
        
        # Update conversation last message
        conversation.last_message = request.message[:100]
        conversation.last_message_time = datetime.utcnow()
        conversation.updated_at = datetime.utcnow()
        
        # Update unread count for receiver
        if conversation.buyer_id == request.receiver_id:
            conversation.buyer_unread = (conversation.buyer_unread or 0) + 1
        else:
            conversation.seller_unread = (conversation.seller_unread or 0) + 1
        
        db.commit()
        
        return {
            "success": True,
            "message": "Message sent successfully",
            "message_id": new_message.id,
            "conversation_id": conversation.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error sending message: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations")
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for current user"""
    try:
        conversations = db.query(Conversation).filter(
            or_(
                Conversation.buyer_id == current_user.id,
                Conversation.seller_id == current_user.id
            )
        ).order_by(desc(Conversation.updated_at)).all()
        
        result = []
        for conv in conversations:
            other_user_id = conv.seller_id if conv.buyer_id == current_user.id else conv.buyer_id
            other_user = db.query(User).filter(User.id == other_user_id).first()
            unread_count = conv.buyer_unread if conv.buyer_id == current_user.id else conv.seller_unread
            
            result.append({
                "id": conv.id,
                "other_user_id": other_user_id,
                "other_user_name": other_user.full_name if other_user else "User",
                "other_user_avatar": other_user.full_name[0] if other_user else "U",
                "last_message": conv.last_message or "No messages",
                "last_message_time": conv.last_message_time.isoformat() if conv.last_message_time else None,
                "unread_count": unread_count or 0,
                "is_buyer": conv.buyer_id == current_user.id
            })
        
        return result
    except Exception as e:
        print(f"Error getting conversations: {e}")
        return []

@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all messages in a conversation"""
    try:
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Check authorization
        if conv.buyer_id != current_user.id and conv.seller_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Mark as read
        if conv.buyer_id == current_user.id:
            conv.buyer_unread = 0
        else:
            conv.seller_unread = 0
        db.commit()
        
        messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).all()
        
        result = []
        for msg in messages:
            result.append({
                "id": msg.id,
                "sender_id": msg.sender_id,
                "receiver_id": msg.receiver_id,
                "message": msg.content,
                "subject": msg.subject,
                "is_read": msg.is_read,
                "is_mine": msg.sender_id == current_user.id,
                "created_at": msg.created_at.isoformat(),
                "time": msg.created_at.strftime("%I:%M %p") if msg.created_at else ""
            })
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))