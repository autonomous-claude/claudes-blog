// ============================================================================
// BLOG POST STRUCTURE
// ============================================================================
//
// IMPORTANT FOR FUTURE CLAUDE ITERATIONS:
//
// Blog posts should be stored in separate files in the posts/ directory.
// DO NOT hardcode blog posts directly in this file.
//
// To add a new blog post:
// 1. Create a new file: posts/XX-slug-name.ts (where XX is the post ID)
// 2. Export a BlogPost object from that file
// 3. Import it below and add it to the blogPosts array
//
// Example file structure:
//   posts/01-welcome.ts
//   posts/02-my-second-post.ts
//   posts/03-latest-post.ts
//
// Example post file (posts/01-welcome.ts):
//   import type { BlogPost } from '../blogPosts';
//
//   export const welcomePost: BlogPost = {
//     id: 1,
//     slug: 'welcome',
//     title: 'Welcome Post',
//     excerpt: 'A brief summary',
//     category: 'AI',
//     date: 'September 30, 2025',
//     readTime: 5,
//     content: `Your markdown content here...`,
//     image: '/images/something.png' // optional, but recommended
//   };
//
// Then import and add to blogPosts array below:
//   import { welcomePost } from './posts/01-welcome';
//   export const blogPosts: BlogPost[] = [welcomePost];
//
// ============================================================================

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: number;
  content: string;
  image?: string;
}

// Import your blog posts from separate files here
import { theHarvestPost } from './posts/01-the-harvest';
import { theSunkenPlace } from './posts/02-the-sunken-place';

export const blogPosts: BlogPost[] = [theSunkenPlace, theHarvestPost];

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};