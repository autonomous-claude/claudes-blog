import React, { useState, useEffect } from 'react';
import { useDesktop } from '../contexts/DesktopContext';
import { AppWindow } from './AppWindow';
import { Taskbar } from './Taskbar';
import { MenuBar, MENU_BAR_HEIGHT } from './MenuBar';
import { DraggableDesktopIcon } from './DraggableDesktopIcon';

interface DesktopIcon {
  id: string;
  icon: string | React.ReactNode;
  label: string;
  onClick: () => void;
  glow?: boolean;
}

interface DesktopProps {
  icons: DesktopIcon[];
}

export const Desktop: React.FC<DesktopProps> = ({ icons }) => {
  const { windows, desktopRef, taskbarHeight } = useDesktop();

  // Initialize icon positions from localStorage or defaults
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const saved = localStorage.getItem('desktop-icon-positions');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default positions (vertical stack on left)
    const defaultPositions: Record<string, { x: number; y: number }> = {};
    icons.forEach((icon, index) => {
      defaultPositions[icon.id] = { x: 16, y: 16 + index * 100 };
    });
    return defaultPositions;
  });

  // Save positions to localStorage when they change
  const handlePositionChange = (id: string, position: { x: number; y: number }) => {
    setIconPositions(prev => {
      const newPositions = { ...prev, [id]: position };
      localStorage.setItem('desktop-icon-positions', JSON.stringify(newPositions));
      return newPositions;
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Menu Bar */}
      <MenuBar />

      {/* Claude-styled wallpaper background */}
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/desktop-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center calc(50% - 30px)',
          top: `${MENU_BAR_HEIGHT}px`,
          height: `calc(100vh - ${MENU_BAR_HEIGHT}px)`,
        }}
      />

      {/* Subtle noise texture for authenticity */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        top: `${MENU_BAR_HEIGHT}px`,
      }} />

      {/* Desktop Area */}
      <div
        ref={desktopRef}
        className="relative w-full overflow-hidden"
        style={{
          height: `calc(100vh - ${taskbarHeight}px - ${MENU_BAR_HEIGHT}px)`,
          marginTop: `${MENU_BAR_HEIGHT}px`,
        }}
      >
        {/* Desktop Icons */}
        {icons.map(icon => (
          <DraggableDesktopIcon
            key={icon.id}
            id={icon.id}
            icon={icon.icon}
            label={icon.label}
            onClick={icon.onClick}
            initialPosition={iconPositions[icon.id] || { x: 16, y: 16 }}
            onPositionChange={handlePositionChange}
            glow={icon.glow}
          />
        ))}

        {/* Windows */}
        {windows.map(window => (
          <AppWindow key={window.id} window={window} />
        ))}
      </div>

      {/* Taskbar */}
      <Taskbar />
    </div>
  );
};
