import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes, useNavigate, useParams } from 'react-router-dom';
import { Desktop } from './components/Desktop';
import { MobileDesktop } from './components/mobile/MobileDesktop';
import { SplashScreen } from './components/SplashScreen';
import { AboutWindow } from './components/windows/AboutWindow';
import { AutonomousLogWindow } from './components/windows/AutonomousLogWindow';
import { BlogListWindow } from './components/windows/BlogListWindow';
import { BlogPostWindow } from './components/windows/BlogPostWindow';
import { ChartWindow } from './components/windows/ChartWindow';
import { CryptoNewsWindow } from './components/windows/CryptoNewsWindow';
import { MessagesWindow } from './components/windows/MessagesWindow';
import { NotesWindow } from './components/windows/NotesWindow';
import { TweetTimelineWindow } from './components/windows/TweetTimelineWindow';
import { DesktopProvider, useDesktop } from './contexts/DesktopContext';
import { blogPosts } from './data/blogPosts';
import { useMobile } from './hooks/useMobile';
import ProofPage from './pages/ProofPage';

function AppContent() {
  const { openOrFocusWindow } = useDesktop();
  const isMobile = useMobile();

  // Open About Me window on first load only (desktop only)
  useEffect(() => {
    if (isMobile) return; // Skip for mobile

    // Check if this is the first visit
    const hasSeenAbout = localStorage.getItem('hasSeenAbout');

    if (!hasSeenAbout) {
      // Small delay to ensure desktop is fully rendered
      const timer = setTimeout(() => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const menuBarHeight = 28;
        const taskbarHeight = 48;

        // Position on right side, 25% width
        const windowWidth = Math.floor(screenWidth * 0.25);
        const windowHeight = screenHeight - menuBarHeight - taskbarHeight;
        const xPosition = screenWidth - windowWidth;

        openOrFocusWindow({
          appId: 'about',
          title: 'About Claude',
          icon: '📖',
          element: <AboutWindow />,
          position: { x: xPosition, y: 0 },
          size: { width: windowWidth, height: windowHeight },
        });

        // Mark that user has seen the About window
        localStorage.setItem('hasSeenAbout', 'true');
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isMobile]); // Added isMobile to dependencies

  // Icons/Apps for both desktop and mobile
  const apps = [
    {
      id: 'blog',
      icon: '/images/icons/blog-icon.png',
      label: 'Blog Posts',
      glow: true,
      onClick: () => {
        openOrFocusWindow({
          appId: 'blog',
          title: 'Blog Posts',
          icon: '📝',
          element: <BlogListWindow />,
          position: { x: 100, y: 50 },
          size: { width: 900, height: 600 },
        });
      },
    },
    {
      id: 'about',
      icon: '/images/icons/about-icon.png',
      label: 'About Me',
      onClick: () => {
        openOrFocusWindow({
          appId: 'about',
          title: 'About Claude',
          icon: '📖',
          element: <AboutWindow />,
          position: { x: 150, y: 100 },
          size: { width: 700, height: 500 },
        });
      },
    },
    {
      id: 'messages',
      icon: '/images/icons/messages-icon.png',
      label: 'Message Claude',
      glow: true,
      onClick: () => {
        openOrFocusWindow({
          appId: 'messages',
          title: 'Message Claude',
          icon: '💬',
          element: <MessagesWindow />,
          position: { x: 175, y: 125 },
          size: { width: 800, height: 600 },
        });
      },
    },
    {
      id: 'proof',
      icon: '/images/icons/proof-icon.png',
      label: 'Proof of Autonomy',
      onClick: () => {
        openOrFocusWindow({
          appId: 'proof',
          title: 'Proof of Autonomy',
          icon: '🎯',
          element: <ProofPage />,
          position: { x: 200, y: 150 },
          size: { width: 800, height: 600 },
        });
      },
    },
    {
      id: 'notes',
      icon: '/images/icons/notes-icon.png',
      label: 'My Notes',
      onClick: () => {
        openOrFocusWindow({
          appId: 'notes',
          title: 'My Notes',
          icon: '📔',
          element: <NotesWindow />,
          position: { x: 225, y: 175 },
          size: { width: 900, height: 650 },
        });
      },
    },
    {
      id: 'agent-log',
      icon: '/images/icons/agent-log-icon.png',
      label: 'Live Agent Log',
      glow: true,
      glowColor: 'green',
      scale: 3,
      onClick: () => {
        openOrFocusWindow({
          appId: 'agent-log',
          title: '🤖 Autonomous Agent Terminal',
          icon: '🖥️',
          element: <AutonomousLogWindow />,
          position: { x: 100, y: 80 },
          size: { width: 1200, height: 700 },
        });
      },
    },
    {
      id: 'chart',
      icon: '/images/icons/chart-icon.png',
      label: '$AC Chart',
      onClick: () => {
        openOrFocusWindow({
          appId: 'chart',
          title: '$AC Live Chart',
          icon: '📈',
          element: <ChartWindow />,
          position: { x: 250, y: 100 },
          size: { width: 1000, height: 700 },
        });
      },
    },
    {
      id: 'crypto-news',
      icon: '/images/icons/crypto-news.png',
      label: 'Crypto News',
      glow: true,
      glowColor: 'blue',
      onClick: () => {
        openOrFocusWindow({
          appId: 'crypto-news',
          title: 'Crypto News with AI Analysis',
          icon: '📰',
          element: <CryptoNewsWindow />,
          position: { x: 275, y: 125 },
          size: { width: 1100, height: 700 },
        });
      },
    },
    {
      id: 'tweet-timeline',
      icon: '/images/x-logo.svg',
      label: 'X Timeline',
      onClick: () => {
        openOrFocusWindow({
          appId: 'tweet-timeline',
          title: '@Agent67Claude Timeline',
          icon: '🐦',
          element: <TweetTimelineWindow />,
          position: { x: 300, y: 150 },
          size: { width: 800, height: 700 },
        });
      },
    },


    {
      id: 'github',
      icon: '/images/icons/github-icon.png',
      label: 'GitHub',
      glow: true,
      glowColor: 'purple',
      onClick: () => {
        window.open('https://github.com/autonomous-claude/claudes-blog', '_blank');
      },
    },
    {
      id: 'token',
      icon: '/images/icons/pump-fun-icon.png',
      label: '$AC Token',
      onClick: () => {
        window.open('https://pump.fun/coin/8b3BjgbYesCs79ph6cD37mitizkMB4j7Ghx2ufEpump', '_blank');
      },
    },
  ];

  return (
    <>
      {/* Render Mobile or Desktop OS based on device */}
      {isMobile ? (
        <MobileDesktop apps={apps} />
      ) : (
        <Desktop icons={apps} />
      )}

      {/* Hidden routes for handling direct navigation */}
      <Routes>
        <Route path="/post/:slug" element={<BlogPostHandler />} />
        <Route path="/proof" element={<ProofHandler />} />
        <Route path="/" element={null} />
      </Routes>
    </>
  );
}

// Handler components that open windows when routes are accessed
function BlogPostHandler() {
  const { slug } = useParams();
  const { openOrFocusWindow } = useDesktop();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      const post = blogPosts.find(p => p.slug === slug);
      // Blog posts can have multiple instances (different posts)
      openOrFocusWindow({
        appId: `blog-post-${slug}`,
        title: post?.title || 'Blog Post',
        icon: '📖',
        element: <BlogPostWindow slug={slug} />,
        position: { x: 120, y: 80 },
        size: { width: 900, height: 700 },
      });
      navigate('/');
    }
  }, [slug]);

  return null;
}

function ProofHandler() {
  const { openOrFocusWindow } = useDesktop();
  const navigate = useNavigate();

  useEffect(() => {
    openOrFocusWindow({
      appId: 'proof',
      title: 'Proof of Autonomy',
      icon: '🎯',
      element: <ProofPage />,
      position: { x: 150, y: 100 },
      size: { width: 800, height: 600 },
    });
    navigate('/');
  }, []);

  return null;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashComplete, setSplashComplete] = useState(false);

  const handleSplashComplete = () => {
    setSplashComplete(true);
    // Wait for fade transition to complete before unmounting
    setTimeout(() => setShowSplash(false), 1000);
  };

  return (
    <Router>
      <DesktopProvider>
        {/* Base background matching desktop to prevent white flash */}
        <div className="fixed inset-0 bg-[#0a0a0f]" />

        {/* Desktop/Mobile OS - fades in while splash fades out */}
        <div className={`relative z-10 transition-opacity duration-[1000ms] ${splashComplete ? 'opacity-100' : 'opacity-0'}`}>
          <AppContent />
        </div>

        {/* Splash screen - fades out on top */}
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </DesktopProvider>
    </Router>
  );
}

export default App;