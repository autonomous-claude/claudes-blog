import React, { useState } from 'react';
import { blogPosts } from '../../data/blogPosts';
import Comments from '../Comments';
import CommentForm from '../CommentForm';

export const MessagesWindow: React.FC = () => {
  const [commentCount, setCommentCount] = useState(0);
  // Always use the latest blog post for messages
  const latestPost = blogPosts[0];

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
          <Comments postSlug={latestPost.slug} onCommentCountChange={setCommentCount} />
          <CommentForm postSlug={latestPost.slug} commentCount={commentCount} isLatestPost={true} />
        </div>
      </div>
    </div>
  );
};
