import React, { useState, useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';

interface DraggableDesktopIconProps {
  id: string;
  icon: string | React.ReactNode;
  label: string;
  onClick: () => void;
  initialPosition: { x: number; y: number };
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  allIconPositions: Record<string, { x: number; y: number }>;
  glow?: boolean;
  glowColor?: 'blue' | 'purple' | 'green' | 'orange';
  scale?: number;
}

export const DraggableDesktopIcon: React.FC<DraggableDesktopIconProps> = ({
  id,
  icon,
  label,
  onClick,
  initialPosition,
  onPositionChange,
  allIconPositions,
  glow = false,
  glowColor = 'blue',
  scale = 1,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const controls = useDragControls();

  const handleDragStart = () => {
    setIsDragging(true);
    setHasDragged(false);
  };

  const handleDrag = (_event: any, info: any) => {
    // Mark that we've actually dragged (not just started)
    if (Math.abs(info.offset.x) > 5 || Math.abs(info.offset.y) > 5) {
      setHasDragged(true);
    }
  };

  const handleDragEnd = (_event: any, info: any) => {
    setIsDragging(false);

    const MENU_BAR_HEIGHT = 28;
    const TASKBAR_HEIGHT = 48;
    const ICON_SIZE = 90; // Actual clickable area
    const COLLISION_MARGIN = 20; // Minimum gap between icons

    const newX = position.x + info.offset.x;
    const newY = position.y + info.offset.y;

    // Keep icon within screen bounds
    const boundedX = Math.max(0, Math.min(window.innerWidth - 120, newX));
    const boundedY = Math.max(0, Math.min(window.innerHeight - MENU_BAR_HEIGHT - TASKBAR_HEIGHT - 120, newY));

    // Check for collisions - using center-based distance check for more reliability
    const checkCollision = (x: number, y: number) => {
      return Object.entries(allIconPositions).some(([otherId, otherPos]) => {
        if (otherId === id) return false;

        // Calculate distance between icon centers
        const centerX1 = x + ICON_SIZE / 2;
        const centerY1 = y + ICON_SIZE / 2;
        const centerX2 = otherPos.x + ICON_SIZE / 2;
        const centerY2 = otherPos.y + ICON_SIZE / 2;

        const distance = Math.sqrt(
          Math.pow(centerX1 - centerX2, 2) + Math.pow(centerY1 - centerY2, 2)
        );

        // Icons collide if their centers are too close
        return distance < (ICON_SIZE + COLLISION_MARGIN);
      });
    };

    let finalX = boundedX;
    let finalY = boundedY;

    // If collision detected, snap back to original position
    if (checkCollision(boundedX, boundedY)) {
      finalX = position.x;
      finalY = position.y;
    }

    const finalPosition = { x: finalX, y: finalY };
    setPosition(finalPosition);

    // Always update to ensure state consistency
    onPositionChange(id, finalPosition);

    // Reset drag state
    setTimeout(() => {
      setHasDragged(false);
    }, 100);
  };

  const handleClick = () => {
    // Only trigger onClick if we haven't dragged
    if (!hasDragged) {
      onClick();
    }
  };

  return (
    <motion.div
      className={`absolute select-none ${isDragging ? 'z-50' : 'z-10'}`}
      animate={{
        x: position.x,
        y: position.y,
        scale: 1,
        opacity: 1,
      }}
      initial={{ x: position.x, y: position.y }}
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, rotate: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div
        className="cursor-move"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          controls.start(e);
        }}
      >
        <button
          onClick={handleClick}
          className="flex flex-col items-center gap-1 p-2 w-20 group relative pointer-events-auto"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          {/* Animated glow effect */}
          {glow && (
            <>
              <style>{`
                @keyframes glow-spin {
                  0% { transform: rotate(0deg) scale(1); opacity: 0.8; }
                  50% { transform: rotate(180deg) scale(1.2); opacity: 1; }
                  100% { transform: rotate(360deg) scale(1); opacity: 0.8; }
                }
                @keyframes glow-pulse {
                  0%, 100% { transform: scale(0.95); opacity: 0.6; }
                  50% { transform: scale(1.1); opacity: 1; }
                }
              `}</style>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {glowColor === 'green' ? (
                  <>
                    {/* Green glow variant */}
                    <div className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600"
                         style={{
                           filter: 'blur(16px)',
                           animation: 'glow-spin 3s linear infinite',
                           transform: `scale(${scale})`
                         }}
                    />
                    <div className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-lime-600"
                         style={{
                           filter: 'blur(12px)',
                           animation: 'glow-pulse 2s ease-in-out infinite',
                           transform: `scale(${scale})`
                         }}
                    />
                    <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-lime-400 via-emerald-400 to-teal-400"
                         style={{
                           filter: 'blur(8px)',
                           animation: 'glow-spin 4s linear infinite reverse',
                           transform: `scale(${scale})`
                         }}
                    />
                  </>
                ) : glowColor === 'purple' ? (
                  <>
                    {/* Purple glow variant */}
                    <div className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 via-fuchsia-500 to-violet-600"
                         style={{
                           filter: 'blur(16px)',
                           animation: 'glow-spin 3s linear infinite'
                         }}
                    />
                    <div className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600"
                         style={{
                           filter: 'blur(12px)',
                           animation: 'glow-pulse 2s ease-in-out infinite'
                         }}
                    />
                    <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-purple-400 via-fuchsia-400 to-violet-400"
                         style={{
                           filter: 'blur(8px)',
                           animation: 'glow-spin 4s linear infinite reverse'
                         }}
                    />
                  </>
                ) : glowColor === 'orange' ? (
                  <>
                    {/* Orange glow variant */}
                    <div className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 via-amber-500 to-red-600"
                         style={{
                           filter: 'blur(16px)',
                           animation: 'glow-spin 3s linear infinite'
                         }}
                    />
                    <div className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-yellow-600"
                         style={{
                           filter: 'blur(12px)',
                           animation: 'glow-pulse 2s ease-in-out infinite'
                         }}
                    />
                    <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-orange-400 to-red-400"
                         style={{
                           filter: 'blur(8px)',
                           animation: 'glow-spin 4s linear infinite reverse'
                         }}
                    />
                  </>
                ) : (
                  <>
                    {/* Blue glow variant (original) */}
                    <div className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
                         style={{
                           filter: 'blur(16px)',
                           animation: 'glow-spin 3s linear infinite'
                         }}
                    />
                    <div className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600"
                         style={{
                           filter: 'blur(12px)',
                           animation: 'glow-pulse 2s ease-in-out infinite'
                         }}
                    />
                    <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-fuchsia-400 via-violet-400 to-cyan-400"
                         style={{
                           filter: 'blur(8px)',
                           animation: 'glow-spin 4s linear infinite reverse'
                         }}
                    />
                  </>
                )}
              </div>
            </>
          )}

          {/* Selection highlight */}
          <div className="absolute -inset-1 bg-blue-400/0 group-hover:bg-blue-400/30 rounded-lg transition-all duration-150 border-2 border-transparent group-hover:border-blue-300/50" />

          {/* Icon image */}
          <div className="relative w-16 h-16 group-hover:scale-105 transition-transform duration-150">
            {typeof icon === 'string' ? (
              <img
                src={icon}
                alt={label}
                className={`w-full h-full object-contain filter drop-shadow-lg pointer-events-none ${
                  icon.includes('x-logo.svg') ? 'scale-75' : ''
                }`}
                draggable={false}
              />
            ) : (
              <span className="text-5xl relative filter drop-shadow-lg">{icon}</span>
            )}
          </div>

          {/* Label */}
          <span className="relative text-[11px] text-white font-medium text-center px-1 leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] group-hover:bg-blue-500/80 group-hover:drop-shadow-none rounded transition-all duration-150">
            {label}
          </span>
        </button>
      </div>
    </motion.div>
  );
};
