import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';

export const TopBar = ({ isDarkMode, onToggleTheme, onToggleSidebar }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900 dark:hover:to-blue-900"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Center - App name */}
        <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Surya AI ☀️
        </h1>

        {/* Right side - Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          className="hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900 dark:hover:to-blue-900"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};