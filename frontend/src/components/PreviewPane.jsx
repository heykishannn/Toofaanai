import React, { useState, useEffect } from 'react';
import { AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

export const PreviewPane = ({ code }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    if (code) {
      try {
        // Simple HTML/CSS/JS preview
        if (code.includes('<html>') || code.includes('<!DOCTYPE html>')) {
          setPreviewContent(code);
          setError(null);
        } else if (code.includes('<') && code.includes('>')) {
          // Wrap HTML fragments
          const wrappedCode = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { margin: 20px; font-family: Arial, sans-serif; }
                </style>
              </head>
              <body>
                ${code}
              </body>
            </html>
          `;
          setPreviewContent(wrappedCode);
          setError(null);
        } else {
          // For non-HTML code, show as formatted text
          setPreviewContent(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { margin: 20px; font-family: 'Courier New', monospace; }
                  pre { background: #f5f5f5; padding: 20px; border-radius: 8px; overflow-x: auto; }
                </style>
              </head>
              <body>
                <h3>Code Preview</h3>
                <pre>${code}</pre>
              </body>
            </html>
          `);
          setError(null);
        }
      } catch (err) {
        setError(err.message);
        setPreviewContent('');
      }
    }
  }, [code]);

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Live Preview</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900 dark:hover:to-blue-900"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      </div>
      
      <div className="flex-1 relative">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Preview Error</h3>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </div>
        ) : code && previewContent ? (
          <iframe
            srcDoc={previewContent}
            className="w-full h-full border-0"
            title="Code Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-xl font-semibold mb-2">No Preview Available</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate HTML/CSS/JS code to see a live preview
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};