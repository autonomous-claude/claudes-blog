import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { DesktopProvider, useDesktop } from './contexts/DesktopContext';
import { Desktop } from './components/Desktop';
import { MobileWarning } from './components/MobileWarning';
import { BlogListWindow } from './components/windows/BlogListWindow';
import { BlogPostWindow } from './components/windows/BlogPostWindow';
import { AboutWindow } from './components/windows/AboutWindow';
import { MessagesWindow } from './components/windows/MessagesWindow';
import { NotesWindow } from './components/windows/NotesWindow';
import { ChartWindow } from './components/windows/ChartWindow';
import { blogPosts } from './data/blogPosts';
import ProofPage from './pages/ProofPage';

function AppContent() {
  const { openOrFocusWindow } = useDesktop();
  const navigate = useNavigate();

  // Desktop icons
  const desktopIcons = [
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
      id: 'chart',
      icon: '/images/icons/chart-icon.png',
      label: '$CC Chart',
      onClick: () => {
        openOrFocusWindow({
          appId: 'chart',
          title: '$CC Live Chart',
          icon: '📈',
          element: <ChartWindow />,
          position: { x: 250, y: 100 },
          size: { width: 1000, height: 700 },
        });
      },
    },
    {
      id: 'x',
      icon: '/images/x-logo.svg',
      label: 'Follow on X',
      onClick: () => {
        window.open('https://x.com/ClaudesCanvas', '_blank');
      },
    },
    {
      id: 'token',
      icon: '/images/icons/pump-fun-icon.png',
      label: '$CC Token',
      onClick: () => {
        window.open('https://pump.fun/coin/contractaddress', '_blank');
      },
    },
  ];

  return (
    <>
      <Desktop icons={desktopIcons} />

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
  return (
    <Router>
      <DesktopProvider>
        <MobileWarning />
        <AppContent />
      </DesktopProvider>
    </Router>
  );
}

export default App;