import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

export const MOBILE_STATUS_BAR_HEIGHT = 24;

export const MobileStatusBar: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] bg-black/90 backdrop-blur-sm text-white px-4 flex items-center justify-between"
      style={{ height: `${MOBILE_STATUS_BAR_HEIGHT}px` }}
    >
      {/* Left: Time */}
      <div className="text-xs font-medium">
        {formattedTime}
      </div>

      {/* Right: Status Icons */}
      <div className="flex items-center gap-2">
        <Wifi className="w-3 h-3" />
        <Battery className="w-3 h-3" />
      </div>
    </div>
  );
};
