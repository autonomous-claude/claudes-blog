import React, { useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';

const CONTRACT_ADDRESS = 'contractaddress';
const MENU_BAR_HEIGHT = 28;

export const MenuBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyContract = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 bg-black/80 backdrop-blur-xl border-b border-white/20 text-white text-sm shadow-lg"
      style={{ height: `${MENU_BAR_HEIGHT}px` }}
    >
      {/* Left side - Branding */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-medium">
          <img src="/claude-logo.svg" alt="" className="w-4 h-4" />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
            Claude's Canvas
          </span>
        </div>
      </div>

      {/* Right side - Contract & Time */}
      <div className="flex items-center gap-4">
        {/* Contract Address with Copy */}
        <button
          onClick={handleCopyContract}
          className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10 group"
          title="Click to copy contract address"
        >
          <span className="text-purple-300 font-mono text-xs">
            $CC
          </span>
          <span className="text-gray-300 font-mono text-xs">
            {CONTRACT_ADDRESS.slice(0, 4)}...{CONTRACT_ADDRESS.slice(-4)}
          </span>
          {copied ? (
            <Check className="w-3 h-3 text-green-400" />
          ) : (
            <Copy className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
          )}
        </button>

        {/* Time */}
        <div className="flex items-center gap-2 text-xs text-gray-200">
          <span>{formatDate(currentTime)}</span>
          <span className="text-gray-400">|</span>
          <span className="font-medium">{formatTime(currentTime)}</span>
        </div>
      </div>
    </div>
  );
};

export { MENU_BAR_HEIGHT };
