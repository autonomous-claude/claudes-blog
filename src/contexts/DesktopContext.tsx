import React, { createContext, useContext, useState, useRef, ReactNode, useCallback } from 'react';

export interface AppWindow {
  id: string;
  appId?: string; // Unique identifier for the app type (to prevent duplicates)
  title: string;
  element: ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  previousPosition: { x: number; y: number };
  previousSize: { width: number; height: number };
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  icon?: string;
}

interface DesktopContextType {
  windows: AppWindow[];
  addWindow: (window: Omit<AppWindow, 'id' | 'zIndex' | 'minimized' | 'maximized' | 'previousPosition' | 'previousSize'>) => void;
  openOrFocusWindow: (window: Omit<AppWindow, 'id' | 'zIndex' | 'minimized' | 'maximized' | 'previousPosition' | 'previousSize'>) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  updateWindow: (id: string, updates: Partial<AppWindow>) => void;
  focusedWindowId: string | null;
  taskbarHeight: number;
  desktopRef: React.RefObject<HTMLDivElement>;
}

const DesktopContext = createContext<DesktopContextType | undefined>(undefined);

export const DesktopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [focusedWindowId, setFocusedWindowId] = useState<string | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const taskbarHeight = 48;
  const nextZIndexRef = useRef(100);

  const bringToFront = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, zIndex: nextZIndexRef.current++, minimized: false } : w
    ));
    setFocusedWindowId(id);
  }, []);

  const addWindow = useCallback((windowData: Omit<AppWindow, 'id' | 'zIndex' | 'minimized' | 'maximized' | 'previousPosition' | 'previousSize'>) => {
    const id = `window-${Date.now()}-${Math.random()}`;
    const newWindow: AppWindow = {
      ...windowData,
      id,
      zIndex: nextZIndexRef.current++,
      minimized: false,
      maximized: false,
      previousPosition: windowData.position,
      previousSize: windowData.size,
    };
    setWindows(prev => [...prev, newWindow]);
    setFocusedWindowId(id);
  }, []);

  const openOrFocusWindow = useCallback((windowData: Omit<AppWindow, 'id' | 'zIndex' | 'minimized' | 'maximized' | 'previousPosition' | 'previousSize'>) => {
    // Check if a window with this appId already exists
    if (windowData.appId) {
      const existingWindow = windows.find(w => w.appId === windowData.appId);
      if (existingWindow) {
        // Window already exists, just bring it to front and restore if minimized
        bringToFront(existingWindow.id);
        return;
      }
    }
    // No existing window, create a new one
    addWindow(windowData);
  }, [windows, addWindow, bringToFront]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    setFocusedWindowId(null);
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, minimized: true } : w
    ));
    setFocusedWindowId(null);
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;

      if (w.maximized) {
        // Restore to previous size/position
        return {
          ...w,
          maximized: false,
          position: w.previousPosition,
          size: w.previousSize,
        };
      } else {
        // Maximize
        return {
          ...w,
          maximized: true,
          previousPosition: w.position,
          previousSize: w.size,
          position: { x: 0, y: 0 },
          size: {
            width: window.innerWidth,
            height: window.innerHeight - taskbarHeight,
          },
        };
      }
    }));
  }, [taskbarHeight]);

  const updateWindow = useCallback((id: string, updates: Partial<AppWindow>) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, ...updates } : w
    ));
  }, []);

  return (
    <DesktopContext.Provider
      value={{
        windows,
        addWindow,
        openOrFocusWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        bringToFront,
        updateWindow,
        focusedWindowId,
        taskbarHeight,
        desktopRef,
      }}
    >
      {children}
    </DesktopContext.Provider>
  );
};

export const useDesktop = () => {
  const context = useContext(DesktopContext);
  if (!context) {
    throw new Error('useDesktop must be used within DesktopProvider');
  }
  return context;
};
