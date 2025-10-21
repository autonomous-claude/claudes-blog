import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDesktop } from '../../contexts/DesktopContext';
import { MobileStatusBar } from './MobileStatusBar';
import { MobileNavBar } from './MobileNavBar';
import { MobileHomeScreen } from './MobileHomeScreen';
import { MobileAppWindow } from './MobileAppWindow';

interface MobileApp {
  id: string;
  icon: string | React.ReactNode;
  label: string;
  onClick: () => void;
  glow?: boolean;
  glowColor?: 'blue' | 'purple' | 'green';
}

interface MobileDesktopProps {
  apps: MobileApp[];
}

export const MobileDesktop: React.FC<MobileDesktopProps> = ({ apps }) => {
  const { windows, closeWindow, bringToFront } = useDesktop();
  const [showRecents, setShowRecents] = useState(false);

  // Get the topmost window (if any)
  const activeWindow = windows.length > 0
    ? windows.reduce((prev, current) => (current.zIndex > prev.zIndex ? current : prev))
    : null;

  const handleBack = () => {
    if (activeWindow) {
      closeWindow(activeWindow.id);
    }
  };

  const handleHome = () => {
    if (activeWindow) {
      closeWindow(activeWindow.id);
    }
    setShowRecents(false);
  };

  const handleRecent = () => {
    setShowRecents(!showRecents);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] overflow-hidden">
      {/* Status Bar */}
      <MobileStatusBar />

      {/* Home Screen or Active App */}
      <AnimatePresence mode="wait">
        {showRecents ? (
          // Recent Apps View
          <div key="recents" className="fixed inset-0 pt-24 pb-56 px-4 bg-black/50 backdrop-blur-sm z-[9996]">
            <div className="text-white text-center mb-6">
              <h2 className="text-xl font-semibold">Recent Apps</h2>
            </div>

            {windows.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-white/50">No recent apps</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-auto max-h-full">
                {windows.map((window) => (
                  <button
                    key={window.id}
                    onClick={() => {
                      bringToFront(window.id);
                      setShowRecents(false);
                    }}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-left active:bg-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {window.icon && <span className="text-2xl">{window.icon}</span>}
                      <span className="text-white font-medium">{window.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : activeWindow ? (
          // Active App Window
          <MobileAppWindow key={activeWindow.id} window={activeWindow} />
        ) : (
          // Home Screen
          <MobileHomeScreen key="home" apps={apps} />
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <MobileNavBar
        onBack={handleBack}
        onHome={handleHome}
        onRecent={handleRecent}
        showBack={!!activeWindow}
      />
    </div>
  );
};
