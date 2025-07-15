import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

export const ChatInterface = ({ messages, isAiThinking, onSendMessage, isEmpty }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() || attachedFile) {
      onSendMessage(inputMessage.trim(), attachedFile);
      setInputMessage('');
      setAttachedFile(null);
    }
  };

  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {isEmpty ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">☀️</div>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Hello, how can I help you today?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Start a conversation with Surya AI
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                } rounded-lg p-4 shadow-sm`}>
                  {message.type === 'ai' && (
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <span className="text-sm font-medium">Surya AI</span>
                    </div>
                  )}
                  {message.attachedFile && (
                    <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                      📎 {message.attachedFile.name}
                    </div>
                  )}
                  <div className={`${message.isCode ? 'font-mono text-sm' : ''}`}>
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isAiThinking && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-2">
                      <Loader2 className="w-3 h-3 text-white animate-spin" />
                    </div>
                    <span className="text-sm font-medium">Surya AI</span>
                  </div>
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-gray-600 dark:text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="relative">
          {/* Attached File Display */}
          {attachedFile && (
            <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between">
              <span className="text-sm">📎 {attachedFile.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeAttachment}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          )}

          {/* Input Field with Animated Gradient Border */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg p-0.5 animate-pulse">
              <div className="bg-white dark:bg-gray-800 rounded-lg h-full w-full"></div>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isAiThinking}
              />
              
              <div className="flex items-center space-x-2 pr-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileAttach}
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAiThinking}
                  className="hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900 dark:hover:to-blue-900"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Button
                  type="submit"
                  disabled={(!inputMessage.trim() && !attachedFile) || isAiThinking}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};