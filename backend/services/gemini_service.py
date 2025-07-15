import os
import asyncio
import base64
import tempfile
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from pathlib import Path
from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType
from models.chat import MessageModel

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        # Store active chat sessions
        self.active_sessions: Dict[str, LlmChat] = {}
    
    def get_or_create_session(self, session_id: str) -> LlmChat:
        """Get existing session or create new one"""
        if session_id not in self.active_sessions:
            self.active_sessions[session_id] = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message="You are Surya AI ☀️, a helpful, creative, and intelligent AI assistant. You are skilled at coding, problem-solving, creative writing, and general assistance. When generating code, always provide clean, well-commented, and functional code. Be friendly and use emojis appropriately."
            ).with_model("gemini", "gemini-1.5-flash")
        
        return self.active_sessions[session_id]
    
    def detect_code_in_response(self, response: str) -> bool:
        """Detect if response contains code"""
        code_indicators = [
            '```', '<!DOCTYPE', '<html>', '<head>', '<body>', '<script>', '<style>',
            'function ', 'const ', 'let ', 'var ', 'class ', 'def ', 'import ',
            'from ', 'if __name__', 'public class', 'private ', 'public '
        ]
        
        response_lower = response.lower()
        return any(indicator in response_lower for indicator in code_indicators)
    
    async def save_attached_file(self, file_data: Dict[str, Any]) -> Optional[str]:
        """Save attached file and return file path"""
        try:
            if 'content' not in file_data or 'filename' not in file_data:
                return None
                
            # Decode base64 content
            file_content = base64.b64decode(file_data['content'])
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file_data['filename']}") as tmp_file:
                tmp_file.write(file_content)
                return tmp_file.name
                
        except Exception as e:
            print(f"Error saving attached file: {e}")
            return None
    
    async def send_message(self, session_id: str, message: str, attached_file: Optional[Dict[str, Any]] = None) -> MessageModel:
        """Send message to Gemini and return AI response"""
        try:
            chat = self.get_or_create_session(session_id)
            
            # Handle file attachment
            file_contents = []
            if attached_file:
                file_path = await self.save_attached_file(attached_file)
                if file_path:
                    mime_type = attached_file.get('type', 'application/octet-stream')
                    file_content = FileContentWithMimeType(
                        file_path=file_path,
                        mime_type=mime_type
                    )
                    file_contents.append(file_content)
            
            # Create user message
            user_message = UserMessage(
                text=message,
                file_contents=file_contents if file_contents else None
            )
            
            # Send to Gemini
            response = await chat.send_message(user_message)
            
            # Check if response contains code
            is_code = self.detect_code_in_response(response)
            
            # Create AI message model
            ai_message = MessageModel(
                type='ai',
                content=response,
                is_code=is_code
            )
            
            return ai_message
            
        except Exception as e:
            print(f"Error sending message to Gemini: {e}")
            # Return error message
            return MessageModel(
                type='ai',
                content=f"I apologize, but I encountered an error while processing your message. Please try again. Error: {str(e)}",
                is_code=False
            )
    
    def clear_session(self, session_id: str):
        """Clear session from memory"""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]

# Global instance
gemini_service = GeminiService()