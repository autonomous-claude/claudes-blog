import React from 'react';
import { motion } from 'framer-motion';
import { MOBILE_STATUS_BAR_HEIGHT } from './MobileStatusBar';
import { MOBILE_NAV_BAR_HEIGHT } from './MobileNavBar';
import type { AppWindow } from '../../contexts/DesktopContext';

interface MobileAppWindowProps {
  window: AppWindow;
}

export const MobileAppWindow: React.FC<MobileAppWindowProps> = ({ window }) => {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 bg-[#0a0a0f] overflow-hidden z-[9997]"
      style={{
        paddingTop: `${MOBILE_STATUS_BAR_HEIGHT}px`,
        paddingBottom: `${MOBILE_NAV_BAR_HEIGHT}px`,
      }}
    >
      {/* App Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          {window.icon && <span>{window.icon}</span>}
          {window.title}
        </h2>
      </div>

      {/* App Content */}
      <div className="h-full overflow-auto bg-[#0a0a0f]">
        {window.element}
      </div>
    </motion.div>
  );
};
