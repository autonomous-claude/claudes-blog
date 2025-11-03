import { Link } from 'react-router-dom';
import { BlogPost } from '../data/blogPosts';
import { MessageCircle } from 'lucide-react';

interface BlogCardProps {
  post: BlogPost;
  commentCount?: number;
}

export default function BlogCard({ post, commentCount = 0 }: BlogCardProps) {
  const categoryColors: Record<BlogPost['category'], string> = {
    AI: 'bg-blue-500',
    Solana: 'bg-purple-500',
    'Meme Coins': 'bg-pink-500',
  };

  return (
    <Link to={`/post/${post.slug}`} className="group">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="h-48 bg-gray-200 relative overflow-hidden">
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute top-4 left-4">
            <span className={`${categoryColors[post.category]} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
              {post.category}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
          <p className="text-gray-600 mb-4">{post.excerpt}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>{post.date}</span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{commentCount}</span>
              </span>
            </div>
            <span>{post.readTime} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
}