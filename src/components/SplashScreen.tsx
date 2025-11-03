import Lottie from 'lottie-react';
import React, { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [secondAnimationData, setSecondAnimationData] = useState(null);
  const [thirdAnimationData, setThirdAnimationData] = useState(null);
  const fadeTriggered = useRef(false);

  useEffect(() => {
    // Load first animation (purple version)
    fetch('/animation-purple.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));

    // Load second animation (purple version)
    fetch('/second-animation-purple.json')
      .then(response => response.json())
      .then(data => setSecondAnimationData(data))
      .catch(error => console.error('Error loading second animation:', error));

    // Load third animation (purple version)
    fetch('/third-animation-purple.json')
      .then(response => response.json())
      .then(data => setThirdAnimationData(data))
      .catch(error => console.error('Error loading third animation:', error));
  }, []);

  const handleEnterFrame = (e: any) => {
    // Total frames is 120 at 12fps = 10 seconds
    // Start fade at frame 74 (~6 seconds in, leaving ~4 seconds for fade)
    if (e.currentTime >= 74 && !fadeTriggered.current) {
      fadeTriggered.current = true;
      setFadeOut(true);
      onComplete();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-[1000ms] ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: '#000000',
      }}
    >
      {/* Smooth waves background similar to desktop */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C026D3" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>
          </defs>
          <path d="M0,650 Q300,625 600,650 T1200,650 L1200,800 L0,800 Z" fill="url(#wave-gradient)" opacity="0.3"/>
          <path d="M0,700 Q300,675 600,700 T1200,700 L1200,800 L0,800 Z" fill="url(#wave-gradient)" opacity="0.2"/>
        </svg>
      </div>

      <div className="relative">
        {/* Vibrant neon purple glow effect */}
        <div className="absolute inset-0 blur-3xl opacity-40">
          <div className="w-full h-96 bg-purple-500 rounded-full"></div>
        </div>

        {/* Animations side by side */}
        <div className="relative flex gap-8 items-center">
          {/* First Animation */}
          <div className="w-96 h-96">
            {animationData && (
              <Lottie
                animationData={animationData}
                loop={false}
                autoplay={true}
                onEnterFrame={handleEnterFrame}
              />
            )}
          </div>

          {/* Second Animation */}
          <div className="w-96 h-96">
            {secondAnimationData && (
              <Lottie
                animationData={secondAnimationData}
                loop={true}
                autoplay={true}
              />
            )}
          </div>

          {/* Third Animation */}
          <div className="w-96 h-96">
            {thirdAnimationData && (
              <Lottie
                animationData={thirdAnimationData}
                loop={true}
                autoplay={true}
              />
            )}
          </div>
        </div>

        {/* Loading text - matching desktop style */}
        <div className="mt-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 animate-pulse tracking-wider">
            AGENT CLAUDE
          </h1>
          <p className="text-white/70 text-sm mb-4">Initializing Autonomous AI Desktop OS...</p>

          {/* Contract Address */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <span className="text-white/60 text-xs font-mono">CA:</span>
            <code className="text-white/80 text-xs font-mono bg-white/10 px-3 py-1 rounded">
              8b3BjgbYesCs79ph6cD37mitizkMB4j7Ghx2ufEpump
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
