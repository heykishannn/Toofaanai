import React, { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { ChatInterface } from './ChatInterface';
import { TabsFooter } from './TabsFooter';
import { CodeViewer } from './CodeViewer';
import { PreviewPane } from './PreviewPane';
import { apiService } from '../services/api';

export const SuryaAI = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set dark mode class on document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Load chats on component mount
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const fetchedChats = await apiService.getChats();
      setChats(fetchedChats);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading chats:', error);
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const newChat = await apiService.createChat();
      setChats([newChat, ...chats]);
      setCurrentChatId(newChat.id);
      setCurrentChat(newChat);
      setActiveTab('chat');
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleChatSelect = async (chatId) => {
    try {
      const chat = await apiService.getChat(chatId);
      setCurrentChatId(chatId);
      setCurrentChat(chat);
      setActiveTab('chat');
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Error selecting chat:', error);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await apiService.deleteChat(chatId);
      setChats(chats.filter(c => c.id !== chatId));
      
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setCurrentChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleSendMessage = async (message, attachedFile) => {
    try {
      // If no current chat, create one
      let chatId = currentChatId;
      if (!chatId) {
        const newChat = await apiService.createChat();
        chatId = newChat.id;
        setCurrentChatId(chatId);
        setCurrentChat(newChat);
        setChats([newChat, ...chats]);
      }

      // Add user message to UI immediately
      const userMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        attached_file: attachedFile
      };

      const updatedMessages = [...(currentChat?.messages || []), userMessage];
      setCurrentChat(prev => ({
        ...prev,
        messages: updatedMessages
      }));

      setIsAiThinking(true);

      // Upload file if attached
      let uploadedFile = null;
      if (attachedFile) {
        uploadedFile = await apiService.uploadFile(attachedFile);
      }

      // Send message to backend
      const aiResponse = await apiService.sendMessage(chatId, message, uploadedFile);
      
      // Update chat with AI response
      const finalMessages = [...updatedMessages, {
        id: aiResponse.id,
        type: 'ai',
        content: aiResponse.content,
        timestamp: aiResponse.timestamp,
        is_code: aiResponse.is_code
      }];

      setCurrentChat(prev => ({
        ...prev,
        messages: finalMessages,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
      }));

      // If it's code, set it for the code viewer
      if (aiResponse.is_code) {
        setGeneratedCode(aiResponse.content);
        setActiveTab('code');
      }

      // Refresh chats list
      await loadChats();
      
      setIsAiThinking(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsAiThinking(false);
    }
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
        isLoading={isLoading}
        onNewChat={handleNewChat}
        onChatSelect={handleChatSelect}
        onDeleteChat={handleDeleteChat}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-col h-[calc(100vh-64px)] pt-16">
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <ChatInterface
              messages={currentChat?.messages || []}
              isAiThinking={isAiThinking}
              onSendMessage={handleSendMessage}
              isEmpty={!currentChat || currentChat.messages.length === 0}
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