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
  glowColor?: 'blue' | 'purple' | 'green';
  scale?: number;
}

interface DesktopProps {
  icons: DesktopIcon[];
}

export const Desktop: React.FC<DesktopProps> = ({ icons }) => {
  const { windows, desktopRef, taskbarHeight } = useDesktop();

  // Initialize icon positions from localStorage or defaults
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const MENU_BAR_HEIGHT = 28;
    const TASKBAR_HEIGHT = 48;
    const ICON_SPACING = 110; // Spacing between icons
    const START_X = 20;
    const START_Y = 20;

    // Calculate grid layout
    const availableHeight = window.innerHeight - MENU_BAR_HEIGHT - TASKBAR_HEIGHT - 40;
    const iconsPerColumn = Math.max(1, Math.floor(availableHeight / ICON_SPACING));

    const getDefaultPosition = (index: number, iconId: string) => {
      // Center the agent-log icon (3x scale = 240px wide, 270px tall approximately)
      if (iconId === 'agent-log') {
        const iconWidth = 240;
        const iconHeight = 270;
        return {
          x: (window.innerWidth - iconWidth) / 2,
          y: (window.innerHeight - MENU_BAR_HEIGHT - TASKBAR_HEIGHT - iconHeight) / 2
        };
      }

      const col = Math.floor(index / iconsPerColumn);
      const row = index % iconsPerColumn;
      return {
        x: START_X + col * ICON_SPACING,
        y: START_Y + row * ICON_SPACING
      };
    };

    // Try to load saved positions
    const saved = localStorage.getItem('desktop-icon-positions');
    if (saved) {
      try {
        const positions = JSON.parse(saved);
        const maxX = window.innerWidth - 120;
        const maxY = window.innerHeight - MENU_BAR_HEIGHT - TASKBAR_HEIGHT - 120;

        // Ensure all icons have valid positions
        const validatedPositions: Record<string, { x: number; y: number }> = {};

        icons.forEach((icon, index) => {
          if (positions[icon.id] &&
              positions[icon.id].x >= 0 && positions[icon.id].x <= maxX &&
              positions[icon.id].y >= 0 && positions[icon.id].y <= maxY) {
            // Use saved position if valid
            validatedPositions[icon.id] = positions[icon.id];
          } else {
            // Use grid position if saved position is invalid or missing
            validatedPositions[icon.id] = getDefaultPosition(index, icon.id);
          }
        });

        return validatedPositions;
      } catch (e) {
        // If parsing fails, fall through to default positions
      }
    }

    // Default grid positions for all icons
    const defaultPositions: Record<string, { x: number; y: number }> = {};
    icons.forEach((icon, index) => {
      defaultPositions[icon.id] = getDefaultPosition(index, icon.id);
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

  // Revalidate icon positions on window resize
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setIconPositions(prev => {
          const updated = { ...prev };
          const MENU_BAR_HEIGHT = 28;
          const TASKBAR_HEIGHT = 48;
          const ICON_BUFFER = 120; // Icon width + padding

          const maxX = window.innerWidth - ICON_BUFFER;
          const maxY = window.innerHeight - MENU_BAR_HEIGHT - TASKBAR_HEIGHT - ICON_BUFFER;
          let hasChanges = false;

          Object.keys(updated).forEach(key => {
            // Only adjust if icon is significantly off-screen (not just at edge)
            if (updated[key].x > maxX || updated[key].y > maxY) {
              // Keep proportional position when possible, otherwise clamp
              updated[key] = {
                x: Math.max(0, Math.min(updated[key].x, maxX)),
                y: Math.max(0, Math.min(updated[key].y, maxY))
              };
              hasChanges = true;
            }
          });

          if (hasChanges) {
            localStorage.setItem('desktop-icon-positions', JSON.stringify(updated));
          }
          return hasChanges ? updated : prev;
        });
      }, 250); // Wait 250ms after resize stops
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Menu Bar */}
      <MenuBar />

      {/* Tiled neon purple pattern background - composite image prevents identical images touching */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#0a0a0f',
          backgroundImage: `url('/images/desktop-bg-tiled.png')`,
          backgroundSize: '1024px 512px',
          backgroundRepeat: 'repeat',
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
          iconPositions[icon.id] && (
            <DraggableDesktopIcon
              key={icon.id}
              id={icon.id}
              icon={icon.icon}
              label={icon.label}
              onClick={icon.onClick}
              initialPosition={iconPositions[icon.id]}
              onPositionChange={handlePositionChange}
              allIconPositions={iconPositions}
              glow={icon.glow}
              glowColor={icon.glowColor}
              scale={icon.scale}
            />
          )
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
