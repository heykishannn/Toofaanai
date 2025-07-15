import React, { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { ChatInterface } from './ChatInterface';
import { TabsFooter } from './TabsFooter';
import { CodeViewer } from './CodeViewer';
import { PreviewPane } from './PreviewPane';
import { mockChats, mockResponse } from '../utils/mock';

export const SuryaAI = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [chats, setChats] = useState(mockChats);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    // Set dark mode class on document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      timestamp: new Date(),
      messages: []
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChatId);
    setMessages([]);
    setActiveTab('chat');
    setIsSidebarOpen(false);
  };

  const handleChatSelect = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setActiveTab('chat');
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteChat = (chatId) => {
    setChats(chats.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const handleSendMessage = async (message, attachedFile) => {
    if (!currentChatId) {
      handleNewChat();
    }

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
      attachedFile: attachedFile
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsAiThinking(true);

    // Update chat title if it's the first message
    if (newMessages.length === 1) {
      const updatedChats = chats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, title: message.substring(0, 50) + (message.length > 50 ? '...' : '') }
          : chat
      );
      setChats(updatedChats);
    }

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = mockResponse(message);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        isCode: aiResponse.isCode
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      setIsAiThinking(false);

      // If it's code, set it for the code viewer
      if (aiResponse.isCode) {
        setGeneratedCode(aiResponse.content);
        setActiveTab('code');
      }

      // Update chat messages
      const updatedChats = chats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: updatedMessages }
          : chat
      );
      setChats(updatedChats);
    }, 2000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-green-50 to-blue-50'
    }`}>
      <TopBar
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <Sidebar
        isOpen={isSidebarOpen}
        chats={chats}
        onNewChat={handleNewChat}
        onChatSelect={handleChatSelect}
        onDeleteChat={handleDeleteChat}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-col h-[calc(100vh-64px)] pt-16">
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <ChatInterface
              messages={messages}
              isAiThinking={isAiThinking}
              onSendMessage={handleSendMessage}
              isEmpty={messages.length === 0}
            />
          )}
          {activeTab === 'code' && (
            <CodeViewer code={generatedCode} />
          )}
          {activeTab === 'preview' && (
            <PreviewPane code={generatedCode} />
          )}
        </div>
        
        <TabsFooter
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
};