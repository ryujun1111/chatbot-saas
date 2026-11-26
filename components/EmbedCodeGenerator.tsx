'use client';

import { useState } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';

interface EmbedCodeGeneratorProps {
  chatbotId: string;
  defaultColor?: string;
}

export default function EmbedCodeGenerator({ 
  chatbotId, 
  defaultColor = '#3B82F6' 
}: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [color, setColor] = useState(defaultColor);
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');

  // 임베드 코드 생성
  const generateEmbedCode = () => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://your-domain.com';
    
    return `<script src="${baseUrl}/widget.js" 
        data-chatbot-id="${chatbotId}" 
        data-color="${color}"
        data-position="${position}">
</script>`;
  };

  const embedCode = generateEmbedCode();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Code2 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Embed Code</h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Copy this code and paste it into your website's HTML, just before the closing <code className="bg-gray-100 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag.
      </p>

      {/* Customization Options */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              placeholder="#3B82F6"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setPosition('bottom-right')}
              className={`flex-1 px-4 py-2 rounded-md border transition-all ${
                position === 'bottom-right'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Bottom Right
            </button>
            <button
              onClick={() => setPosition('bottom-left')}
              className={`flex-1 px-4 py-2 rounded-md border transition-all ${
                position === 'bottom-left'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Bottom Left
            </button>
          </div>
        </div>
      </div>

      {/* Code Block */}
      <div className="relative">
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{embedCode}</code>
        </pre>
        
        <button
          onClick={copyToClipboard}
          className={`absolute top-3 right-3 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 inline mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 inline mr-1" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Preview Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <a
          href={`/widget/${chatbotId}?color=${encodeURIComponent(color)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Preview Widget
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
