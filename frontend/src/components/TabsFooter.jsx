import React from 'react';
import { MessageSquare, Code, Eye } from 'lucide-react';
import { Button } from './ui/button';

export const TabsFooter = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'code', label: 'Code', icon: Code },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="flex justify-center py-3">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => onTabChange(tab.id)}
                className={`px-6 py-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-sm'
                    : 'hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900 dark:hover:to-blue-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};