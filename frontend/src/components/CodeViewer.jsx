import React, { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

export const CodeViewer = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'surya-ai-code.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Generated Code</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900 dark:hover:to-blue-900"
          >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900 dark:hover:to-blue-900"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {code ? (
          <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {code}
            </code>
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-xl font-semibold mb-2">No Code Generated Yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Ask Surya AI to generate code and it will appear here
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};