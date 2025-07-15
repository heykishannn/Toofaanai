from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from typing import List, Optional
import os
import logging
import uuid
from datetime import datetime
import base64

# Import models and services
from models.chat import ChatModel, ChatCreate, MessageCreate, ChatResponse, MessageResponse, MessageModel
from services.gemini_service import gemini_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Chat endpoints
@api_router.post("/chats", response_model=ChatResponse)
async def create_chat(chat_data: ChatCreate):
    """Create a new chat"""
    try:
        session_id = chat_data.session_id or str(uuid.uuid4())
        
        chat = ChatModel(
            title=chat_data.title,
            session_id=session_id,
            messages=[]
        )
        
        chat_dict = chat.dict()
        result = await db.chats.insert_one(chat_dict)
        
        if result.inserted_id:
            created_chat = await db.chats.find_one({"_id": result.inserted_id})
            return ChatResponse(**created_chat)
        else:
            raise HTTPException(status_code=500, detail="Failed to create chat")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/chats", response_model=List[ChatResponse])
async def get_chats():
    """Get all chats"""
    try:
        chats = await db.chats.find().sort("updated_at", -1).to_list(100)
        return [ChatResponse(**chat) for chat in chats]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/chats/{chat_id}", response_model=ChatResponse)
async def get_chat(chat_id: str):
    """Get a specific chat"""
    try:
        chat = await db.chats.find_one({"id": chat_id})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        return ChatResponse(**chat)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str):
    """Delete a chat"""
    try:
        result = await db.chats.delete_one({"id": chat_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Clear session from Gemini service
        chat = await db.chats.find_one({"id": chat_id})
        if chat:
            gemini_service.clear_session(chat.get("session_id"))
        
        return {"message": "Chat deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/chats/{chat_id}/messages", response_model=MessageResponse)
async def send_message(chat_id: str, message_data: MessageCreate):
    """Send a message to a chat"""
    try:
        # Get the chat
        chat = await db.chats.find_one({"id": chat_id})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Create user message
        user_message = MessageModel(
            type='user',
            content=message_data.content,
            attached_file=message_data.attached_file
        )
        
        # Send to Gemini AI
        ai_message = await gemini_service.send_message(
            session_id=chat["session_id"],
            message=message_data.content,
            attached_file=message_data.attached_file
        )
        
        # Update chat with both messages
        updated_messages = chat.get("messages", []) + [user_message.dict(), ai_message.dict()]
        
        # Update chat title if it's the first message
        title = chat["title"]
        if len(updated_messages) == 2:  # First user message and AI response
            title = message_data.content[:50] + ("..." if len(message_data.content) > 50 else "")
        
        await db.chats.update_one(
            {"id": chat_id},
            {
                "$set": {
                    "messages": updated_messages,
                    "title": title,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return MessageResponse(**ai_message.dict())
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file and return base64 encoded content"""
    try:
        # Read file content
        content = await file.read()
        
        # Encode to base64
        encoded_content = base64.b64encode(content).decode('utf-8')
        
        return {
            "filename": file.filename,
            "content": encoded_content,
            "type": file.content_type,
            "size": len(content)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Surya AI Backend is running! ☀️"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Surya AI Backend"}

# Include the router in the main app
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()