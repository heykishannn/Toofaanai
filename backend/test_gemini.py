#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.gemini_service import gemini_service

async def test_gemini():
    """Test Gemini integration"""
    try:
        print("Testing Gemini integration...")
        
        # Test simple message
        response = await gemini_service.send_message(
            session_id="test_session",
            message="Hello! Can you tell me a short joke?"
        )
        
        print(f"Response type: {response.type}")
        print(f"Response content: {response.content}")
        print(f"Is code: {response.is_code}")
        print("✅ Gemini integration test passed!")
        
    except Exception as e:
        print(f"❌ Gemini integration test failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_gemini())
    sys.exit(0 if success else 1)