from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class MessageModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # 'user' or 'ai'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    attached_file: Optional[Dict[str, Any]] = None
    is_code: bool = False

class ChatModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    session_id: str
    messages: List[MessageModel] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatCreate(BaseModel):
    title: str = "New Chat"
    session_id: Optional[str] = None

class MessageCreate(BaseModel):
    content: str
    attached_file: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    id: str
    title: str
    session_id: str
    messages: List[MessageModel]
    created_at: datetime
    updated_at: datetime

class MessageResponse(BaseModel):
    id: str
    type: str
    content: str
    timestamp: datetime
    attached_file: Optional[Dict[str, Any]] = None
    is_code: bool = False