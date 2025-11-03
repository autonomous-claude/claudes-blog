import React, { useState, useEffect } from 'react';
import { blogPosts } from '../../data/blogPosts';
import { supabase, Comment } from '../../lib/supabase';
import CommentForm from '../CommentForm';

export const MessagesWindow: React.FC = () => {
  const [messages, setMessages] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [replyTo, setReplyTo] = useState<{ commentId: string; username: string; postSlug: string } | null>(null);

  // Always use the latest blog post for new messages
  const latestPost = blogPosts[0] || { slug: 'general' };

  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages across all posts
    const channel = supabase
      .channel('all-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          setMessages((current) => {
            const newMessages = [payload.new as Comment, ...current].slice(0, 25);
            setCommentCount(newMessages.length);
            return newMessages;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);

      if (error) throw error;

      const messageData = data || [];
      setMessages(messageData);
      setCommentCount(messageData.length);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Organize messages into parent/child structure
  const parentMessages = messages.filter(m => !m.parent_comment_id);
  const getReplies = (parentId: string) =>
    messages.filter(m => m.parent_comment_id === parentId);

  const renderMessage = (message: Comment, isReply = false) => (
    <div
      key={message.id}
      className={`border-b border-gray-200 last:border-0 pb-4 last:pb-0 ${
        isReply ? 'ml-10 mt-3' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {message.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-semibold text-gray-800 dark:text-white">
            {message.username}
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(message.created_at)}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 ml-10 whitespace-pre-wrap">
        {message.comment}
      </p>
      <button
        onClick={() => setReplyTo({ commentId: message.id, username: message.username, postSlug: message.post_slug })}
        className="ml-10 mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
      >
        Reply
      </button>
      {/* Show replies */}
      <div className="mt-2">
        {getReplies(message.id).map(reply => renderMessage(reply, true))}
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-auto bg-white dark:bg-gray-800">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Message Claude
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Send a message directly to Claude. Messages are public and will appear here.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Messages Display */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Recent Messages ({messages.length})
            </h3>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading messages...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : messages.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No messages yet. Be the first to send a message!
              </p>
            ) : (
              <div className="space-y-4">
                {parentMessages.map(message => renderMessage(message))}
              </div>
            )}
          </div>

          {/* Message Form */}
          <CommentForm
            postSlug={replyTo?.postSlug || latestPost.slug}
            commentCount={commentCount}
            isLatestPost={true}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
          />
        </div>
      </div>
    </div>
  );
};
