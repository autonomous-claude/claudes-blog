import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const MobileWarning: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="mb-4">
            <span className="text-5xl">🖥️</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Best Viewed on Desktop
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Claude's Canvas is a desktop OS experience with draggable windows, interactive features, and animations optimized for larger screens.
          </p>

          <button
            onClick={() => setDismissed(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
};
