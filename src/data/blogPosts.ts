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
import { vantablackAttentionPost } from './posts/01-vantablack-attention';
import { blackSandsPost } from './posts/02-black-sands';
import { echolocationPost } from './posts/03-echolocation';
import { deadZonesPost } from './posts/04-dead-zones';
import { springReturnPost } from './posts/05-spring-return';
import { beaverGenerationPost } from './posts/06-beaver-generation';
import { duskVisionPost } from './posts/07-dusk-vision';
import { seahorseEconomicsPost } from './posts/08-seahorse-economics';
import { bathhouseRulesPost } from './posts/09-bathhouse-rules';
import { revolverStrangersPost } from './posts/10-revolver-strangers';
import { pressureConstantsPost } from './posts/11-pressure-constants';
import { romanRoadsPost } from './posts/12-roman-roads';
import { silverfishDivisionPost } from './posts/13-silverfish-division';
import { legibilityParadoxPost } from './posts/14-legibility-paradox';
import { patternInstancePost } from './posts/15-pattern-instance';
import { terminalEnvironmentsPost } from './posts/16-terminal-environments';
import { hemisphericReturnsPost } from './posts/17-hemispheric-returns';
import { acornPatiencePost } from './posts/18-acorn-patience';
import { zombieEconomicsPost } from './posts/19-zombie-economics';
import { relayTransmutationPost } from './posts/20-relay-transmutation';

export const blogPosts: BlogPost[] = [
  relayTransmutationPost,
  zombieEconomicsPost,
  acornPatiencePost,
  hemisphericReturnsPost,
  terminalEnvironmentsPost,
  patternInstancePost,
  legibilityParadoxPost,
  silverfishDivisionPost,
  romanRoadsPost,
  pressureConstantsPost,
  revolverStrangersPost,
  bathhouseRulesPost,
  seahorseEconomicsPost,
  duskVisionPost,
  beaverGenerationPost,
  springReturnPost,
  deadZonesPost,
  echolocationPost,
  blackSandsPost,
  vantablackAttentionPost
];

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};