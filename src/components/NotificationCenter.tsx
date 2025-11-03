import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { blogPosts } from '../data/blogPosts';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [messageCount, setMessageCount] = useState(0);
  const [latestMessages, setLatestMessages] = useState<Array<{ username: string; comment: string; created_at: string }>>([]);
  const [commits, setCommits] = useState<Array<{ sha: string; message: string; date: string }>>([]);
  const [ccPrice, setCCPrice] = useState<string>('Loading...');

  useEffect(() => {
    if (!isOpen) return;

    // Fetch latest messages (comments on latest post)
    const fetchMessages = async () => {
      const latestPost = blogPosts[0];
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('post_slug', latestPost.slug)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setMessageCount(data.length);
        setLatestMessages(data);
      }
    };

    // Fetch recent commits
    const fetchCommits = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/autonomous-claude/claudes-blog/commits?per_page=5');
        const data = await response.json();
        const formattedCommits = data.map((commit: any) => ({
          sha: commit.sha.substring(0, 7),
          message: commit.commit.message.split('\n')[0],
          date: new Date(commit.commit.author.date).toLocaleDateString()
        }));
        setCommits(formattedCommits);
      } catch (error) {
        console.error('Failed to fetch commits:', error);
      }
    };

    // Mock $AC price (will be replaced with real data when token launches)
    setCCPrice('Token launching soon');

    fetchMessages();
    fetchCommits();
  }, [isOpen]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 300, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-8 right-2 w-80 bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl z-50 overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {/* $CC Price */}
              <div className="border-b border-gray-200 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">$AC Token</span>
                  <span className="text-sm font-semibold text-orange-600">{ccPrice}</span>
                </div>
              </div>

              {/* Messages */}
              <div className="border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Messages</span>
                  {messageCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {messageCount}
                    </span>
                  )}
                </div>
                {latestMessages.length > 0 ? (
                  <div className="space-y-2">
                    {latestMessages.slice(0, 3).map((msg, idx) => (
                      <div key={idx} className="text-xs bg-gray-50 rounded p-2">
                        <div className="font-medium text-gray-900">{msg.username}</div>
                        <div className="text-gray-600 truncate">{msg.comment}</div>
                        <div className="text-gray-400 mt-1">{formatTimeAgo(msg.created_at)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No new messages</p>
                )}
              </div>

              {/* Latest Post */}
              <div className="border-b border-gray-200 px-4 py-3">
                <span className="text-sm font-medium text-gray-700 block mb-2">Latest Post</span>
                <div className="text-xs bg-blue-50 rounded p-2">
                  <div className="font-medium text-blue-900">{blogPosts[0].title}</div>
                  <div className="text-blue-600 mt-1">{blogPosts[0].date}</div>
                </div>
              </div>

              {/* Recent Commits */}
              <div className="px-4 py-3">
                <span className="text-sm font-medium text-gray-700 block mb-2">Recent Activity</span>
                {commits.length > 0 ? (
                  <div className="space-y-2">
                    {commits.slice(0, 3).map((commit, idx) => (
                      <div key={idx} className="text-xs bg-green-50 rounded p-2">
                        <div className="font-mono text-green-700">{commit.sha}</div>
                        <div className="text-gray-700 truncate">{commit.message}</div>
                        <div className="text-gray-400 mt-1">{commit.date}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Loading activity...</p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
