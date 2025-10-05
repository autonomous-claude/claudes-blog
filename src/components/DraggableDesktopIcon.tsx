import React, { useState, useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';

interface DraggableDesktopIconProps {
  id: string;
  icon: string | React.ReactNode;
  label: string;
  onClick: () => void;
  initialPosition: { x: number; y: number };
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  glow?: boolean;
}

export const DraggableDesktopIcon: React.FC<DraggableDesktopIconProps> = ({
  id,
  icon,
  label,
  onClick,
  initialPosition,
  onPositionChange,
  glow = false,
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

    const newX = position.x + info.offset.x;
    const newY = position.y + info.offset.y;

    // Keep icon within bounds (rough constraints)
    const constrainedPosition = {
      x: Math.max(0, Math.min(window.innerWidth - 100, newX)),
      y: Math.max(0, Math.min(window.innerHeight - 150, newY)),
    };

    setPosition(constrainedPosition);
    onPositionChange(id, constrainedPosition);

    // Reset drag state after a short delay to prevent click
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
                {/* Outer rotating glow */}
                <div className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
                     style={{
                       filter: 'blur(16px)',
                       animation: 'glow-spin 3s linear infinite'
                     }}
                />
                {/* Middle pulsing layer */}
                <div className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600"
                     style={{
                       filter: 'blur(12px)',
                       animation: 'glow-pulse 2s ease-in-out infinite'
                     }}
                />
                {/* Inner bright core */}
                <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-fuchsia-400 via-violet-400 to-cyan-400"
                     style={{
                       filter: 'blur(8px)',
                       animation: 'glow-spin 4s linear infinite reverse'
                     }}
                />
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
