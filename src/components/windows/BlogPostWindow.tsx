import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { blogPosts, BlogPost } from '../../data/blogPosts';
import Comments from '../Comments';
import CommentForm from '../CommentForm';
import { useDesktop } from '../../contexts/DesktopContext';

interface BlogPostWindowProps {
  slug: string;
}

export const BlogPostWindow: React.FC<BlogPostWindowProps> = ({ slug }) => {
  const post = blogPosts.find((p: BlogPost) => p.slug === slug);
  const [commentCount, setCommentCount] = useState(0);
  const { openOrFocusWindow } = useDesktop();

  // Check if this is the most recent post (first in array)
  const isLatestPost = blogPosts[0]?.slug === slug;

  useEffect(() => {
    // Load Eleven Labs AudioNative script
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/player/audioNativeHelper.js';
    script.type = 'text/javascript';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Only remove if it exists
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  if (!post) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Post Not Found</h1>
          <p className="text-gray-600">The post "{slug}" could not be found.</p>
        </div>
      </div>
    );
  }

  const categoryColors: Record<BlogPost['category'], string> = {
    AI: 'bg-blue-500',
    Solana: 'bg-purple-500',
    'Meme Coins': 'bg-pink-500',
  };

  const openRelatedPost = (relatedSlug: string) => {
    openOrFocusWindow({
      appId: `blog-post-${relatedSlug}`,
      title: blogPosts.find(p => p.slug === relatedSlug)?.title || 'Blog Post',
      icon: '📖',
      element: <BlogPostWindow slug={relatedSlug} />,
      position: { x: 140, y: 100 },
      size: { width: 900, height: 700 },
    });
  };

  return (
    <div className="h-full overflow-auto">
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Post Header */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-8">
          {post.image && (
            <div className="h-64 bg-gray-200 relative flex items-center justify-center">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className={`${categoryColors[post.category]} text-white px-4 py-2 rounded-full text-sm font-semibold`}>
                  {post.category}
                </span>
              </div>
            </div>
          )}

          <div className="p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {post.title}
            </h1>
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-6">
              <span>{post.date}</span>
              <span className="mx-2">•</span>
              <span>{post.readTime} min read</span>
            </div>

            {/* Eleven Labs TTS Player */}
            <div className="mb-8">
              <div
                id="elevenlabs-audionative-widget"
                data-height="90"
                data-width="100%"
                data-frameborder="no"
                data-scrolling="no"
                data-publicuserid="a81cfb79900ddf0ab06be6c478641f97f14739626561b5f213dcdc56897e7aa2"
                data-playerurl="https://elevenlabs.io/player/index.html"
              >
                Loading the <a href="https://elevenlabs.io/text-to-speech" target="_blank" rel="noopener" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">Elevenlabs Text to Speech</a> AudioNative Player...
              </div>
            </div>

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800 dark:text-white">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800 dark:text-white">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-800 dark:text-white">{children}</strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed text-gray-700 dark:text-gray-300">{children}</li>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-8">
            <Comments postSlug={slug} onCommentCountChange={setCommentCount} />
            <CommentForm postSlug={slug} commentCount={commentCount} isLatestPost={isLatestPost} />
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blogPosts
              .filter(p => p.id !== post.id && p.category === post.category)
              .slice(0, 2)
              .map(relatedPost => (
                <button
                  key={relatedPost.id}
                  onClick={() => openRelatedPost(relatedPost.slug)}
                  className="text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all hover:shadow-md"
                >
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 hover:text-blue-600">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{relatedPost.excerpt}</p>
                </button>
              ))}
          </div>
        </div>
      </article>
    </div>
  );
};
