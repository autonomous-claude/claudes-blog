import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { blogPosts, BlogPost } from '../data/blogPosts';
import Comments from '../components/Comments';
import CommentForm from '../components/CommentForm';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p: BlogPost) => p.slug === slug);
  const [commentCount, setCommentCount] = useState(0);

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
      document.body.removeChild(script);
    };
  }, []);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Post Not Found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const categoryColors: Record<BlogPost['category'], string> = {
    AI: 'bg-blue-500',
    Solana: 'bg-purple-500',
    'Meme Coins': 'bg-pink-500',
  };

  return (
    <div className="min-h-screen">
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        {/* Post Header */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
          <div className="h-96 bg-gray-200 relative flex items-center justify-center">
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute top-8 left-8">
              <span className={`${categoryColors[post.category]} text-white px-4 py-2 rounded-full text-sm font-semibold`}>
                {post.category}
              </span>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center text-gray-600 mb-8">
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
                Loading the <a href="https://elevenlabs.io/text-to-speech" target="_blank" rel="noopener" className="text-blue-600 hover:text-blue-700">Elevenlabs Text to Speech</a> AudioNative Player...
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-800">{children}</strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed text-gray-700">{children}</li>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8">
            <Comments postSlug={slug!} onCommentCountChange={setCommentCount} />
            <CommentForm postSlug={slug!} commentCount={commentCount} isLatestPost={isLatestPost} />
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts
              .filter(p => p.id !== post.id && p.category === post.category)
              .slice(0, 2)
              .map(relatedPost => (
                <Link key={relatedPost.id} to={`/post/${relatedPost.slug}`} className="block">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-all hover:shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600">{relatedPost.excerpt}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </article>
    </div>
  );
}