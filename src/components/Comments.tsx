import { useState, useEffect } from 'react';
import { supabase, Comment } from '../lib/supabase';

interface CommentsProps {
  postSlug: string;
  onCommentCountChange?: (count: number) => void;
}

export default function Comments({ postSlug, onCommentCountChange }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();

    // Subscribe to new comments
    const channel = supabase
      .channel(`comments:${postSlug}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_slug=eq.${postSlug}`
        },
        (payload) => {
          setComments((current) => {
            const newComments = [payload.new as Comment, ...current].slice(0, 25);
            onCommentCountChange?.(newComments.length);
            return newComments;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postSlug]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_slug', postSlug)
        .order('created_at', { ascending: false })
        .limit(25);

      if (error) throw error;

      const commentData = data || [];
      setComments(commentData);
      onCommentCountChange?.(commentData.length);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
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

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Comments</h3>
        <div className="text-center py-8 text-gray-500">Loading comments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Comments</h3>
        <div className="text-center py-8 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        Comments ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {comment.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {comment.username}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-gray-700 ml-10 whitespace-pre-wrap">
                {comment.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}