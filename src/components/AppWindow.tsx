import React, { useRef, useState } from 'react';
import { motion, useDragControls, PanInfo } from 'framer-motion';
import { useDesktop, AppWindow as AppWindowType } from '../contexts/DesktopContext';

interface AppWindowProps {
  window: AppWindowType;
}

export const AppWindow: React.FC<AppWindowProps> = ({ window: appWindow }) => {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    bringToFront,
    updateWindow,
    focusedWindowId,
    taskbarHeight,
    desktopRef,
  } = useDesktop();

  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);

  const isFocused = focusedWindowId === appWindow.id;

  const handleDrag = (_event: any, info: PanInfo) => {
    if (!isDragging) setIsDragging(true);
    // This fires continuously during drag - we don't update state here to keep it smooth
    // Framer Motion handles the visual movement
  };

  const handleDragEnd = (_event: any, info: PanInfo) => {
    setIsDragging(false);

    if (!desktopRef.current) return;

    const bounds = desktopRef.current.getBoundingClientRect();
    const newX = appWindow.position.x + info.offset.x;
    const newY = appWindow.position.y + info.offset.y;

    // Constrain to desktop bounds
    const constrainedX = Math.max(0, Math.min(newX, bounds.width - appWindow.size.width));
    const constrainedY = Math.max(0, Math.min(newY, bounds.height - appWindow.size.height));

    updateWindow(appWindow.id, {
      position: { x: constrainedX, y: constrainedY },
    });
  };

  const handleDragTransitionEnd = () => {
    if (isDragging) return;
    if (!desktopRef.current || !windowRef.current) return;

    const containerBounds = desktopRef.current.getBoundingClientRect();
    const windowBounds = windowRef.current.getBoundingClientRect();

    const newX = windowBounds.left - containerBounds.left;
    const newY = windowBounds.top - containerBounds.top;

    updateWindow(appWindow.id, {
      position: { x: newX, y: newY },
    });
  };

  const handleResize = (info: PanInfo, direction: 'right' | 'bottom' | 'corner') => {
    const updates: Partial<AppWindowType> = {};

    if (direction === 'right' || direction === 'corner') {
      updates.size = {
        ...appWindow.size,
        width: Math.max(400, appWindow.size.width + info.delta.x),
      };
    }

    if (direction === 'bottom' || direction === 'corner') {
      updates.size = {
        ...(updates.size || appWindow.size),
        height: Math.max(300, appWindow.size.height + info.delta.y),
      };
    }

    updateWindow(appWindow.id, updates);
  };

  if (appWindow.minimized) return null;

  return (
    <motion.div
      ref={windowRef}
      className={`
        absolute flex flex-col bg-white dark:bg-dark rounded-xl overflow-hidden
        ${isFocused
          ? 'shadow-2xl shadow-black/40 ring-1 ring-white/10'
          : 'shadow-xl shadow-black/20 ring-1 ring-white/5'
        }
        ${isDragging ? 'cursor-grabbing' : ''}
        backdrop-blur-xl
      `}
      style={{
        zIndex: appWindow.zIndex,
      }}
      initial={{ scale: 0.08, opacity: 0 }}
      animate={{
        x: appWindow.position.x,
        y: appWindow.position.y,
        width: appWindow.size.width,
        height: appWindow.size.height,
        scale: 1,
        opacity: 1,
      }}
      exit={{ scale: 0.005, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        scale: { duration: 0.2, ease: [0.2, 0.2, 0.8, 1] },
        opacity: { duration: 0.2 },
      }}
      drag
      dragMomentum={false}
      dragConstraints={desktopRef}
      dragElastic={0}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onDragTransitionEnd={handleDragTransitionEnd}
      onMouseDown={() => bringToFront(appWindow.id)}
    >
      {/* Title Bar */}
      <div
        className={`
          flex items-center justify-between px-4 py-3 select-none
          border-b
          ${isFocused
            ? 'bg-white/95 dark:bg-[#1a1a1a]/95 border-black/5 dark:border-white/10'
            : 'bg-gray-50/95 dark:bg-[#151515]/95 border-black/5 dark:border-white/5'
          }
          backdrop-blur-xl
          ${!appWindow.maximized ? 'cursor-move' : ''}
        `}
        onDoubleClick={() => maximizeWindow(appWindow.id)}
      >
        <div className="flex items-center gap-2.5">
          {/* Traffic Light Buttons - macOS style */}
          <div className="flex items-center gap-2">
            {/* Close */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeWindow(appWindow.id);
              }}
              className="relative w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff4f47] transition-colors duration-150 group"
            >
              <span className="absolute inset-0 flex items-center justify-center text-[#590000] text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity leading-none">
                ×
              </span>
            </button>

            {/* Minimize */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                minimizeWindow(appWindow.id);
              }}
              className="relative w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#fdb023] transition-colors duration-150 group"
            >
              <span className="absolute inset-0 flex items-center justify-center text-[#996600] text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity leading-none pb-0.5">
                −
              </span>
            </button>

            {/* Maximize/Restore */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                maximizeWindow(appWindow.id);
              }}
              className="relative w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#1fb834] transition-colors duration-150 group"
            >
              <span className="absolute inset-0 flex items-center justify-center text-[#005900] text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity leading-none">
                {appWindow.maximized ? '−' : '□'}
              </span>
            </button>
          </div>

          {appWindow.icon && <span className="text-base opacity-80">{appWindow.icon}</span>}
          <span className={`font-medium text-[13px] ${isFocused ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            {appWindow.title}
          </span>
        </div>

        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-light-1 dark:bg-dark">
        {appWindow.element}
      </div>

      {/* Resize Handles */}
      {!appWindow.maximized && (
        <>
          {/* Right edge */}
          <motion.div
            className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-white/10 transition-colors"
            drag="x"
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={{ left: 0, right: 0 }}
            onDrag={(_e, info) => handleResize(info, 'right')}
          />

          {/* Bottom edge */}
          <motion.div
            className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-white/10 transition-colors"
            drag="y"
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDrag={(_e, info) => handleResize(info, 'bottom')}
          />

          {/* Bottom-right corner */}
          <motion.div
            className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize hover:bg-white/15 transition-colors rounded-tl"
            drag
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            onDrag={(_e, info) => handleResize(info, 'corner')}
          >
            <div className="absolute bottom-0.5 right-0.5 w-3 h-3 border-r-2 border-b-2 border-white/20" />
          </motion.div>
        </>
      )}

    </motion.div>
  );
};
