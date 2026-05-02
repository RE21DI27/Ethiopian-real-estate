from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, and_
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..models import User
from ..models.message import Message, Conversation
from .auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class MessageSend(BaseModel):
    receiver_id: int
    content: str

@router.post("/send")
async def send_message(
    message_data: MessageSend,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to another user"""
    try:
        print(f"=== SENDING MESSAGE ===")
        print(f"From user: {current_user.id} ({current_user.email})")
        print(f"To user: {message_data.receiver_id}")
        print(f"Content: {message_data.content[:50]}...")
        
        # Check if receiver exists
        receiver = db.query(User).filter(User.id == message_data.receiver_id).first()
        if not receiver:
            print(f"Receiver not found: {message_data.receiver_id}")
            raise HTTPException(status_code=404, detail="Receiver not found")
        
        # Create new message - WITHOUT updated_at field
        new_message = Message(
            sender_id=current_user.id,
            receiver_id=message_data.receiver_id,
            content=message_data.content,
            is_read=False,
            has_attachment=False,
            attachment_url=None
            # No updated_at field here
        )
        
        db.add(new_message)
        db.flush()
        
        # Update or create conversation
        user1_id = min(current_user.id, message_data.receiver_id)
        user2_id = max(current_user.id, message_data.receiver_id)
        
        conv = db.query(Conversation).filter(
            Conversation.user1_id == user1_id,
            Conversation.user2_id == user2_id
        ).first()
        
        if not conv:
            conv = Conversation(
                user1_id=user1_id,
                user2_id=user2_id,
                last_message=message_data.content[:200],
                last_message_time=datetime.utcnow(),
                unread_count_user1=0,
                unread_count_user2=0
            )
            db.add(conv)
        else:
            conv.last_message = message_data.content[:200]
            conv.last_message_time = datetime.utcnow()
        
        # Update unread count for receiver
        if conv.user1_id == message_data.receiver_id:
            conv.unread_count_user1 += 1
        else:
            conv.unread_count_user2 += 1
        
        db.commit()
        
        print(f"✅ Message sent successfully! ID: {new_message.id}")
        
        return {
            "success": True,
            "message": "Message sent successfully",
            "message_id": new_message.id,
            "created_at": new_message.created_at.isoformat() if new_message.created_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending message: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/conversations")
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for the current user"""
    try:
        print(f"Getting conversations for user: {current_user.id}")
        
        conversations = db.query(Conversation).filter(
            or_(
                Conversation.user1_id == current_user.id,
                Conversation.user2_id == current_user.id
            )
        ).order_by(desc(Conversation.last_message_time)).all()
        
        result = []
        for conv in conversations:
            other_user_id = conv.user2_id if conv.user1_id == current_user.id else conv.user1_id
            other_user = db.query(User).filter(User.id == other_user_id).first()
            
            if other_user:
                unread_count = conv.unread_count_user1 if conv.user1_id == current_user.id else conv.unread_count_user2
                
                result.append({
                    "id": conv.id,
                    "user_id": other_user.id,
                    "name": other_user.full_name or other_user.username,
                    "email": other_user.email,
                    "role_type": other_user.role_type,
                    "last_message": conv.last_message,
                    "last_message_time": conv.last_message_time.isoformat() if conv.last_message_time else None,
                    "unread_count": unread_count
                })
        
        print(f"Found {len(result)} conversations")
        return result
        
    except Exception as e:
        print(f"Error getting conversations: {e}")
        return []

@router.get("/conversation/{user_id}")
async def get_conversation_messages(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=100)
):
    """Get messages between current user and another user"""
    try:
        print(f"Getting conversation between user {current_user.id} and {user_id}")
        
        other_user = db.query(User).filter(User.id == user_id).first()
        if not other_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get messages between the two users
        messages = db.query(Message).filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
                and_(Message.sender_id == user_id, Message.receiver_id == current_user.id)
            )
        ).order_by(Message.created_at.asc()).limit(limit).all()
        
        # Mark unread messages as read
        db.query(Message).filter(
            Message.sender_id == user_id,
            Message.receiver_id == current_user.id,
            Message.is_read == False
        ).update({"is_read": True})
        
        # Update conversation unread count
        user1_id = min(current_user.id, user_id)
        user2_id = max(current_user.id, user_id)
        
        conv = db.query(Conversation).filter(
            Conversation.user1_id == user1_id,
            Conversation.user2_id == user2_id
        ).first()
        
        if conv:
            if conv.user1_id == current_user.id:
                conv.unread_count_user1 = 0
            else:
                conv.unread_count_user2 = 0
            db.commit()
        
        # Format messages
        message_list = []
        for msg in messages:
            message_list.append({
                "id": msg.id,
                "sender_id": msg.sender_id,
                "receiver_id": msg.receiver_id,
                "content": msg.content,
                "is_read": msg.is_read,
                "is_sent_by_me": msg.sender_id == current_user.id,
                "created_at": msg.created_at.isoformat() if msg.created_at else None
            })
        
        print(f"Found {len(message_list)} messages")
        
        return {
            "other_user": {
                "id": other_user.id,
                "name": other_user.full_name or other_user.username,
                "email": other_user.email,
                "role": other_user.role_type
            },
            "messages": message_list
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting conversation: {e}")
        return {"other_user": None, "messages": []}

@router.get("/users")
async def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    search: Optional[str] = None
):
    """Get all users for starting a new chat (including admins)"""
    try:
        print(f"Getting all users for messaging (excluding current user {current_user.id})")
        
        query = db.query(User).filter(User.id != current_user.id)
        
        if search:
            query = query.filter(
                or_(
                    User.full_name.ilike(f"%{search}%"),
                    User.username.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%")
                )
            )
        
        users = query.order_by(User.full_name).limit(50).all()
        
        result = []
        for user in users:
            result.append({
                "id": user.id,
                "name": user.full_name or user.username,
                "email": user.email,
                "role_type": user.role_type,
                "status": user.status
            })
        
        print(f"Found {len(result)} users")
        return result
        
    except Exception as e:
        print(f"Error getting users: {e}")
        return []

@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get total unread message count"""
    try:
        count = db.query(Message).filter(
            Message.receiver_id == current_user.id,
            Message.is_read == False
        ).count()
        
        return {"unread_count": count}
        
    except Exception as e:
        print(f"Error getting unread count: {e}")
        return {"unread_count": 0}