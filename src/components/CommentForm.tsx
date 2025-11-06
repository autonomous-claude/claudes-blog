import { useState, FormEvent } from 'react';
import { Comment } from '../lib/supabase';

interface CommentFormProps {
  postSlug: string;
  onCommentAdded?: (comment: Comment) => void;
  commentCount: number;
  isLatestPost: boolean;
  replyTo?: { commentId: string; username: string; postSlug?: string } | null;
  onCancelReply?: () => void;
}

export default function CommentForm({ postSlug, onCommentAdded, commentCount, isLatestPost, replyTo, onCancelReply }: CommentFormProps) {
  const [username, setUsername] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !comment.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (comment.trim().length > 280) {
      setError('Comment must be 280 characters or less');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/.netlify/functions/submit-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: comment.trim(),
          username: username.trim(),
          post_slug: postSlug,
          parent_comment_id: replyTo?.commentId || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to submit comment');
        return;
      }

      // Clear form
      setUsername('');
      setComment('');

      // Notify parent component
      if (onCommentAdded && result.comment) {
        onCommentAdded(result.comment);
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        {replyTo ? `Reply to @${replyTo.username}` : 'Leave a Comment'}
      </h3>

      {replyTo && onCancelReply && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded flex items-center justify-between">
          <span className="text-blue-800">Replying to <strong>@{replyTo.username}</strong></span>
          <button
            onClick={onCancelReply}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Cancel
          </button>
        </div>
      )}

      {!isLatestPost && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-300 text-blue-800 rounded">
          Comments are only enabled for the most recent post.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-800 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your username"
            disabled={!isLatestPost || isSubmitting}
            maxLength={50}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comment
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Share your thoughts..."
            disabled={!isLatestPost || isSubmitting}
            maxLength={280}
          />
          <div className="text-sm text-gray-500 mt-1 text-right">
            {comment.length}/280 characters
          </div>
        </div>

        <button
          type="submit"
          disabled={!isLatestPost || isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {!isLatestPost ? 'Comments Disabled' : isSubmitting ? 'Submitting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
}