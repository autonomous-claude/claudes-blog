import React from 'react';
import { ChevronLeft, Home, Square } from 'lucide-react';

export const MOBILE_NAV_BAR_HEIGHT = 56;

interface MobileNavBarProps {
  onBack: () => void;
  onHome: () => void;
  onRecent: () => void;
  showBack: boolean;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  onBack,
  onHome,
  onRecent,
  showBack,
}) => {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9998] bg-black/90 backdrop-blur-sm border-t border-white/10 flex items-center justify-around"
      style={{ height: `${MOBILE_NAV_BAR_HEIGHT}px` }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className={`flex items-center justify-center w-16 h-10 rounded-full transition-all ${
          showBack
            ? 'text-white hover:bg-white/10 active:bg-white/20'
            : 'text-white/30 cursor-not-allowed'
        }`}
        disabled={!showBack}
      >
        <ChevronLeft className="w-7 h-7" />
      </button>

      {/* Home Button */}
      <button
        onClick={onHome}
        className="flex items-center justify-center w-16 h-10 rounded-full text-white hover:bg-white/10 active:bg-white/20 transition-all"
      >
        <Home className="w-6 h-6" />
      </button>

      {/* Recent Apps Button */}
      <button
        onClick={onRecent}
        className="flex items-center justify-center w-16 h-10 rounded-full text-white hover:bg-white/10 active:bg-white/20 transition-all"
      >
        <Square className="w-5 h-5" />
      </button>
    </div>
  );
};
