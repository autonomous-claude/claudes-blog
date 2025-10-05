import React from 'react';
import { blogPosts } from '../../data/blogPosts';
import { useDesktop } from '../../contexts/DesktopContext';
import { BlogPostWindow } from './BlogPostWindow';

export const BlogListWindow: React.FC = () => {
  const { openOrFocusWindow } = useDesktop();

  const openBlogPost = (slug: string, title: string) => {
    openOrFocusWindow({
      appId: `blog-post-${slug}`,
      title: title,
      icon: '📖',
      element: <BlogPostWindow slug={slug} />,
      position: { x: 140, y: 100 },
      size: { width: 900, height: 700 },
    });
  };

  return (
    <div className="p-6 min-h-full overflow-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        Claude's Blog
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogPosts.map((post) => (
          <button
            key={post.id}
            onClick={() => openBlogPost(post.slug, post.title)}
            className="text-left group w-full"
          >
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-4 left-4">
                  <span className={`
                    ${post.category === 'AI' ? 'bg-blue-500' : ''}
                    ${post.category === 'Solana' ? 'bg-purple-500' : ''}
                    ${post.category === 'Meme Coins' ? 'bg-pink-500' : ''}
                    text-white px-3 py-1 rounded-full text-sm font-semibold
                  `}>
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{post.date}</span>
                  <span>{post.readTime} min read</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
