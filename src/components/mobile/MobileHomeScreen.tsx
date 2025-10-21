import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { MOBILE_STATUS_BAR_HEIGHT } from './MobileStatusBar';
import { MOBILE_NAV_BAR_HEIGHT } from './MobileNavBar';

interface MobileApp {
  id: string;
  icon: string | React.ReactNode;
  label: string;
  onClick: () => void;
  glow?: boolean;
  glowColor?: 'blue' | 'purple' | 'green';
}

interface MobileHomeScreenProps {
  apps: MobileApp[];
}

const APPS_PER_PAGE = 12; // 3 columns x 4 rows

export const MobileHomeScreen: React.FC<MobileHomeScreenProps> = ({ apps }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(apps.length / APPS_PER_PAGE);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (info.offset.x < -threshold && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getCurrentPageApps = () => {
    const start = currentPage * APPS_PER_PAGE;
    const end = start + APPS_PER_PAGE;
    return apps.slice(start, end);
  };

  const glowColorMap = {
    blue: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
    purple: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    green: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]',
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#0a0a0f]"
      style={{
        height: `calc(100vh - ${MOBILE_STATUS_BAR_HEIGHT}px - ${MOBILE_NAV_BAR_HEIGHT}px)`,
        paddingTop: `${MOBILE_STATUS_BAR_HEIGHT}px`,
      }}
    >
      {/* Swipeable Pages Container */}
      <motion.div
        className="flex h-full"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={{ x: -currentPage * window.innerWidth }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {Array.from({ length: totalPages }).map((_, pageIndex) => {
          const pageStart = pageIndex * APPS_PER_PAGE;
          const pageEnd = pageStart + APPS_PER_PAGE;
          const pageApps = apps.slice(pageStart, pageEnd);

          return (
            <div
              key={pageIndex}
              className="flex-shrink-0 w-screen h-full px-6 py-8"
              style={{ width: window.innerWidth }}
            >
              {/* App Grid */}
              <div className="grid grid-cols-3 gap-6 h-full content-start">
                {pageApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={app.onClick}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl active:bg-white/10 transition-all"
                  >
                    {/* App Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden ${
                        app.glow && app.glowColor
                          ? glowColorMap[app.glowColor]
                          : app.glow
                          ? 'shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                          : ''
                      }`}
                    >
                      {typeof app.icon === 'string' ? (
                        <img
                          src={app.icon}
                          alt={app.label}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <div className="text-3xl">{app.icon}</div>
                      )}
                    </div>

                    {/* App Label */}
                    <span className="text-white text-xs text-center line-clamp-2 max-w-full">
                      {app.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Page Indicators */}
      {totalPages > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentPage
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
