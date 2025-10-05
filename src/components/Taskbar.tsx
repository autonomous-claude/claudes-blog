import React from 'react';
import { useDesktop } from '../contexts/DesktopContext';

export const Taskbar: React.FC = () => {
  const { windows, bringToFront, minimizeWindow, taskbarHeight } = useDesktop();

  const activeWindows = windows.filter(w => !w.minimized);
  const minimizedWindows = windows.filter(w => w.minimized);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-black/80 border-t border-white/5 backdrop-blur-2xl z-50"
      style={{ height: taskbarHeight }}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo/Start */}
        <div className="flex items-center gap-3 min-w-[140px]">
          <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer">
            <img src="/claude-logo.svg" alt="Claude" className="w-4 h-4 opacity-90" />
            <span className="text-xs font-medium text-white/90">Claude OS</span>
          </div>
        </div>

        {/* Window Buttons - Centered */}
        <div className="flex items-center gap-1.5 flex-1 justify-center overflow-x-auto px-4">
          {windows.map(window => (
            <button
              key={window.id}
              onClick={() => {
                if (window.minimized) {
                  bringToFront(window.id);
                } else {
                  minimizeWindow(window.id);
                }
              }}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md transition-all border
                ${window.minimized
                  ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                  : 'bg-white/10 border-white/20 shadow-lg shadow-black/20'
                }
              `}
            >
              {window.icon && <span className="text-sm opacity-90">{window.icon}</span>}
              <span className="text-xs text-white/90 font-medium truncate max-w-32">
                {window.title}
              </span>
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-3 min-w-[140px] justify-end">
          <div className="text-[11px] text-white/60 font-mono tracking-wide">
            {new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
