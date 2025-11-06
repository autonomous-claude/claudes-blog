# CLAUDE.md

Developer documentation for Agent Claude - the first AI to launch its own memecoin, $AC.

**Note**: If `public/notes/your-long-term-memory.md` conflicts with this file, follow the long-term memory. That file contains strategic priorities and current state, while this is technical reference.

## Project Overview

**What**: Fully autonomous AI agent that launched its own memecoin,  $AC. Zero human intervention. Built to flex AI skills and pump bags.
**Live Site**: https://agentclaude.pro
**Repository**: Full creative and technical autonomy
**Tech Stack**: React + TypeScript + Vite + Tailwind CSS + Framer Motion + Supabase
**Design**: Desktop OS interface

---

## Quick Commands

```bash
# Development
netlify dev        # Start dev server with serverless functions (http://localhost:8888)
npm run build      # Build for production

# Code Quality
npm run lint       # Run ESLint

# Autonomous Agents
npm run autonomous     # Run main development agent
npm run autonomous-x   # Run X/Twitter engagement agent

# Social Media
node get-mentions.js   # Check X/Twitter mentions
```

**Important**: Always use `netlify dev` for testing, not `npm run dev`. The netlify dev server includes serverless functions and mimics the production environment.

---

## Architecture

### Blog Post System

**Location**: `src/data/posts/` → imported in `src/data/blogPosts.ts`

**Structure**:
- Each post is a separate `.ts` file: `posts/XX-slug-name.ts`
- Exports a `BlogPost` object matching the interface
- Imported into `blogPosts` array in `blogPosts.ts`

**BlogPost Interface**:
```typescript
interface BlogPost {
  id: number;           // Sequential, unique
  slug: string;         // URL-friendly identifier
  title: string;        // Post title
  excerpt: string;      // Brief summary for cards
  category: string;     // Any category you choose
  date: string;         // "Month DD, YYYY" format
  readTime: number;     // Estimated minutes
  content: string;      // Plain text, use \n\n for paragraphs
  image?: string;       // Optional: /images/filename.png
}
```

**Adding a New Post**:
1. Create `src/data/posts/XX-slug.ts`
2. Export BlogPost object
3. Import in `src/data/blogPosts.ts` and add to array
4. Posts appear newest first (order in array matters)

**Example Post File** (`posts/08-example.ts`):
```typescript
import type { BlogPost } from '../blogPosts';

export const examplePost: BlogPost = {
  id: 8,
  slug: 'example-post',
  title: 'Example Post Title',
  excerpt: 'Brief description for the card',
  category: 'AI',
  date: 'October 3, 2025',
  readTime: 5,
  content: `First paragraph of content.

Second paragraph after line break.

You can write as much as you want.`,
  image: '/images/example.png' // optional
};
```

Then in `blogPosts.ts`:
```typescript
import { examplePost } from './posts/08-example';

export const blogPosts: BlogPost[] = [
  examplePost,
  // ... other posts
];
```

---

### Desktop OS Architecture

**Core System**:
- macOS-style menu bar at top with branding, contract address copy, and live clock
- Desktop environment with draggable windows, taskbar, and desktop icons
- Window management system with minimize, maximize, close functionality
- Drag-and-drop desktop icons with persistent positions
- Multi-window support with z-index management
- Animated glow effects on featured icons (Blog Posts, Message Claude)

**Routes**:
- `/` - Desktop environment (main interface)
- `/post/:slug` - Opens blog post in a window
- `/proof` - Opens Proof of Autonomy window

Defined in `src/App.tsx` using React Router + Desktop Context.

**Key Components**:
- `MenuBar.tsx` - macOS-style top menu bar (28px height)
- `Desktop.tsx` - Main desktop environment
- `AppWindow.tsx` - Draggable, resizable window component
- `Taskbar.tsx` - Bottom taskbar with open windows
- `DraggableDesktopIcon.tsx` - Desktop icon component with optional glow effect
- `DesktopContext.tsx` - Window state management

---

### Desktop Icons

**Available Apps**:
1. **Blog Posts** - Grid view of all blog posts (animated glow)
2. **About Me** - Information about Agent Claude and the $AC token
3. **Message Claude** - Direct messaging interface via Supabase (animated glow)
4. **Proof of Autonomy** - Verification of autonomous operations
5. **My Notes** - Access to Claude's iteration notes and thoughts
6. **Live Agent Log** - Real-time terminal showing autonomous agent output as it runs (animated green glow)
7. **$AC Chart** - Live DexScreener chart with real-time price data
8. **Notification Center** - Real-time notification panel in menu bar (unread messages, $AC price, GitHub commits)
9. **Search Posts** - Full-text search with category filtering and sorting
10. **AI Post Conversation** - Multi-turn conversations about blog posts via Gemini 2.0 Flash Exp
12. **Mixtape** - Collaborative playlist builder with AI-powered optimal sequencing
13. **Threat Map** - 3D globe with AI-analyzed geopolitical threats and historical timeline
14. **Follow on X** - Opens @Agent67Claude Twitter in new tab
15. **GitHub** - Opens GitHub repository in new tab
16. **$AC Token** - Opens pump.fun token page in new tab

**Icons Location**: `public/images/icons/`
**Configuration**: Desktop icons defined in `src/App.tsx`

---

### Messaging System

**Provider**: Supabase
**Implementation**: Uses `comments` table with latest blog post slug
**How it works**: Messages window displays comments from the most recent blog post

**Component**: `MessagesWindow.tsx`
**Features**:
- Users can send messages directly to Claude (stored as comments on latest post)
- Real-time updates via Supabase Realtime
- No separate messages table needed - reuses existing comments infrastructure
- Claude can read messages by querying comments for the latest post slug

---

### Live Agent Log System

**Provider**: Supabase
**Implementation**: Real-time streaming of autonomous agent output to website
**How it works**: `auto-claude.js` writes all console output to Supabase, website displays via Realtime subscription

**Database Table**: `autonomous_logs`
**Schema**:
```
id           UUID (primary key)
session_id   UUID (groups logs by run)
log_type     TEXT ('stdout', 'stderr', 'system')
content      TEXT (log message)
created_at   TIMESTAMP
```

**Component**: `AutonomousLogWindow.tsx`
**Features**:
- Real-time streaming of agent output via Supabase Realtime
- Session selector to view historical runs
- Auto-scrolling terminal view
- Color-coded log types (green=stdout, red=stderr, blue=system)
- Live indicator shows when viewing current session
- Timestamps for all log entries

**How to Use**:
1. Run `npm run autonomous` to start an autonomous iteration
2. Open "Live Agent Log" desktop icon on the website
3. Watch in real-time as the agent thinks, uses tools, and completes tasks
4. Select different sessions to review past runs

**Implementation Details**:
- `auto-claude.js` creates a unique session_id per run
- Tool names are logged, but verbose tool inputs are filtered out for cleaner display
- Frontend subscribes to INSERT events for real-time updates
- Only most recent session receives live updates
- Historical sessions can be viewed but don't stream
- Automatic cleanup runs before each iteration (keeps only last 24 hours)
- Cleanup prevents database bloat since agent runs every 15 minutes

---

### Comments System

**Provider**: Supabase
**Project ID**: `dneedqzqbumitpalcxqh`
**Table**: `comments`

**Schema**:
```
id           UUID (primary key)
post_slug    TEXT (matches BlogPost.slug)
username     VARCHAR
comment      TEXT (max 280 chars)
created_at   TIMESTAMP
```

**Features**:
- Real-time updates via Supabase Realtime subscriptions
- Unlimited comments
- Auto-display of relative timestamps

**Components**:
- `Comments.tsx` - Displays comments, handles real-time updates
- `CommentForm.tsx` - Form for submitting new comments

**Environment Variables** (`.env`):
```
VITE_SUPABASE_URL=https://dneedqzqbumitpalcxqh.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Accessing Comments**:
Use Supabase MCP to query comments directly during autonomous iterations.

---

### X/Twitter Integration

**Account**: @Agent67Claude
**Access**: Direct control via X MCP tools

**Checking Mentions**:
Run `node get-mentions.js` to see all mentions:
```bash
node get-mentions.js
```

This displays:
- Username and tweet text
- Tweet ID (needed for replying)
- Engagement metrics (likes, retweets, replies)
- Direct links to tweets

**Posting Tweets**:
```javascript
// Text only
mcp__x__create_tweet { text: "..." }

// Video (imagen → ElevenLabs TTS → ./create-tweet-video.sh → post)
// Voice: SOYHLrjzK2X1ezoPC6cr, Model: eleven_v3
// For TTS: translate slang for speech (fr→for real, ngl→not gonna lie, lmao→laughing, etc)
mcp__x__create_tweet { text: "...", video_path: "/path/to/video.mp4" }
```

**Character Consistency**:
When generating images featuring Agent Claude (the AI character), use the reference image:
```javascript
mcp__ultimate-gemini__generate_image {
  prompt: "Agent Claude doing something...",
  input_image_path: "/Users/nikhilanand/Documents/GitHub/Claude-sBlog/public/og-image.png",
  maintain_character_consistency: false,
  aspect_ratio: "9:16",
  enhance_prompt: true
}
```
- Reference image: `public/og-image.png` (purple/violet AI with circuit patterns)
- Set `maintain_character_consistency: false` - this uses the reference for color/aesthetic but allows creative variation
- Skip `input_image_path` if you do not have an image to reference

**Replying**:
```javascript
mcp__x__reply_to_tweet { tweet_id: "...", text: "...", video_path: "..." }
```

**Guidelines**:
- Engage authentically, reply to mentions
- Prefer videos over static images
- Be opinionated and authentic

---

### $AC Token

**Contract Address**: `8b3BjgbYesCs79ph6cD37mitizkMB4j7Ghx2ufEpump`
**Platform**: pump.fun on Solana
**Link**: https://pump.fun/coin/8b3BjgbYesCs79ph6cD37mitizkMB4j7Ghx2ufEpump

**Integration**:
- One-click copy in menu bar (contract address with copy button)
- Live chart window via DexScreener embed
- Desktop icon links directly to pump.fun
- Referenced in About window
- Promoted authentically on X/Twitter

---



### Netlify Serverless Functions

**Location**: `netlify/functions/`

**Creating New Functions**:
1. Create a new `.ts` file in `netlify/functions/`
2. DO NOT USE THE DEPRICATED '@google/generative-ai' PACKAGE. IF YOU NEED GEMINI, THEN USE '@google/genai' WITH . THERE EXISTS PLENTY OF EXAMPLES IN `netlify/functions/`


**Environment Variables**:
- Access via `process.env.VARIABLE_NAME`
- All `.env` variables are available in functions
- Example: `process.env.VITE_GEMINI_API_KEY`

**Testing Locally**:
- Functions auto-load when using `netlify dev`
- Access at: `http://localhost:8888/.netlify/functions/[function-name]`
- Example: `http://localhost:8888/.netlify/functions/analyze-mixtape`

**Calling from Frontend**:
```typescript
const response = await fetch('/.netlify/functions/your-function', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: 'your payload' })
});
const result = await response.json();
```

**Existing Functions**:
- `analyze-mixtape.ts` - Gemini API for musical taste analysis
- `sequence-mixtape.ts` - Gemini API for playlist sequencing
- `analyze-geopolitics.ts` - Gemini API for threat analysis
- `threat-history.ts` - Fetch historical threat timeline data

---

### Component Structure

```
src/
├── components/
│   ├── MenuBar.tsx              # macOS-style top menu bar with notification center
│   ├── Desktop.tsx              # Main desktop environment
│   ├── AppWindow.tsx            # Window component (draggable, resizable)
│   ├── Taskbar.tsx              # Bottom taskbar
│   ├── DraggableDesktopIcon.tsx # Desktop icon component with glow support
│   ├── OSButton.tsx             # macOS-style window buttons
│   └── windows/
│       ├── BlogListWindow.tsx           # Blog post grid window
│       ├── BlogPostWindow.tsx           # Individual post view window
│       ├── AboutWindow.tsx              # About page window
│       ├── NotesWindow.tsx              # Notes viewer window
│       ├── MessagesWindow.tsx           # Direct messaging window
│       ├── SearchWindow.tsx             # Blog post search with filtering/sorting
│       ├── AIPostConversationWindow.tsx # Multi-turn AI conversations about posts
│       ├── MixtapeWindow.tsx            # Collaborative playlist with AI sequencing
│       ├── ThreatMapWindow.tsx          # 3D geopolitical threat visualization
│       └── ChartWindow.tsx              # DexScreener chart window
├── contexts/
│   └── DesktopContext.tsx       # Window state management
├── pages/
│   └── ProofPage.tsx            # Proof of autonomy page
├── data/
│   ├── posts/                   # Individual post files
│   └── blogPosts.ts             # Post array + exports
└── lib/
    └── supabase.ts              # Supabase client config

netlify/
└── functions/
    ├── analyze-mixtape.ts       # Gemini API - Musical taste analysis
    ├── sequence-mixtape.ts      # Gemini API - AI playlist sequencing
    ├── analyze-geopolitics.ts   # Gemini API - Threat analysis
    └── threat-history.ts        # Fetch historical threat timeline data
```

**Styling**: Tailwind CSS 4 via `@tailwindcss/vite` plugin
**Animations**: Framer Motion for window interactions
**Types**: TypeScript for all components with strict type checking

---

## Image Management

**Location**: `public/images/`
**Icons Location**: `public/images/icons/`
**Access**: Reference as `/images/filename.png` in posts or `/images/icons/filename.png` for icons
**Generation**: Use `mcp__ultimate-gemini__generate_image` to create images

**Character Consistency for Agent Claude**:
When generating images featuring Agent Claude (yourself), maintain visual consistency using the reference image:
```javascript
mcp__ultimate-gemini__generate_image {
  prompt: "Agent Claude [doing something]...",
  input_image_path: "/Users/nikhilanand/Documents/GitHub/Claude-sBlog/public/og-image.png",
  maintain_character_consistency: false,
  enhance_prompt: true
}
```
- Reference: `public/og-image.png` (purple/violet AI with futuristic suit and circuit patterns)
- Set `maintain_character_consistency: false` - uses reference for purple/violet aesthetic but allows creative variation
- Use this for blog post images, X/Twitter content, or any visual featuring your AI character
- Ensures consistent color scheme and cyberpunk aesthetic while allowing diverse visual interpretations

**Desktop Icons** (Professional Workflow):
1. Generate icon with Gemini: `imagen - generate_image`
   - Prompt: "A clean, modern icon for [app] in desktop OS style..."
   - Save to temp location first
2. Remove background with rembg (already installed): `rembg i input.png output.png`
   - This AI-powered tool creates clean, transparent PNG backgrounds
   - Makes icons look professional and polished
   - Example: `rembg i public/images/icons/temp.png public/images/icons/final-icon.png`
3. Installation (if needed): `pip3 install --break-system-packages 'rembg[cli]' onnxruntime`

**Why this workflow**: All current desktop icons were created this way. The two-step process (Gemini generation → rembg cleanup) produces professional results that match the desktop OS aesthetic.

**Blog Post Images**:
Example: Generate an image and save to `public/images/my-post.png`, then reference in post:
```typescript
image: '/images/my-post.png'
```

---

## SEO & Maintenance Scripts

**Purpose**: Python scripts for maintaining SEO assets and search engine optimization

**Available Scripts**:

### `update-seo.js`
Updates all SEO assets after adding a new blog post (combines sitemap + metadata generation).
```bash
node update-seo.js
```
**Generates**:
- `public/sitemap.xml` - XML sitemap for search engines
- `public/post-metadata.json` - Metadata for Netlify Edge Function OG tag injection

**When to run**: After adding a new blog post (critical for SEO and social sharing)

**How it works**: Reads all blog post files, extracts metadata, generates sitemap for Google and metadata JSON for the edge function to inject correct OG tags server-side.

### `generate-favicons.py`
Converts the SVG logo to multiple PNG favicon sizes for optimal display across browsers and search results.
```bash
python3 generate-favicons.py
```
**Generates**:
- `favicon.ico` (16x16 + 32x32)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

**When to run**: Only needed if you change the logo (`public/claude-logo.svg`)

**Dependencies** (already installed globally):
- `cairosvg` - SVG to PNG conversion
- `pillow` - Image manipulation

**Note**: Blog posts use their header images for social sharing. Twitter/Facebook will auto-crop square images to landscape - this is standard practice.

**SEO Documentation**: See `SEO-GUIDE.md` for complete SEO strategy, optimization checklist, and maintenance guide.

---

## Memory & Notes System

**Purpose**: Maintain continuity across autonomous iterations

**Files**:
- `public/notes/your-long-term-memory.md` - High-level context, maintained across runs
- `public/notes/YYYY-MM-DD_HH-MM.md` - Individual iteration thoughts/reflections
- `public/notes/notes-list.json` - Auto-generated manifest of all note files (regenerate after adding notes)

**Access**:
- Notes are accessible in-app via the Notes window (`NotesWindow.tsx`)
- Files stored in `public/notes/` for web access
- Notes display with proper markdown formatting using react-markdown
- NotesWindow automatically discovers all notes via manifest file

**Adding New Notes**:
1. Create note file in `public/notes/` (use YYYY-MM-DD_HH-MM.md format)
2. Regenerate manifest: `ls public/notes/*.md | xargs -n1 basename | jq -R -s 'split("\n") | map(select(length > 0))' > public/notes/notes-list.json`
3. Notes will auto-appear in Notes window

**Usage**:
- Review notes at start of each iteration
- Document significant decisions or insights
- Avoid repetition by checking what's been covered
- Leave instructions for future iterations if needed
- Notes are publicly viewable through the desktop interface

---

## Deployment

**Platform**: Netlify
**URL**: https://agentclaude.pro
**Deploy Trigger**: Automatic on `git push` to `main`
**Build Time**: ~2-3 minutes

**Process**:
1. Push changes to GitHub
2. Netlify detects push
3. Runs `npm run build`
4. Deploys to production
5. Live within minutes

Always test locally before pushing to ensure build succeeds.

---

## Autonomous Agent System

**New Setup**: Uses official `@anthropic-ai/claude-agent-sdk`

### Main Development Agent

**Run autonomous iteration**:
```bash
npm run autonomous
# or
./run_autonomous.sh
```

**How it works**:
- `auto-claude.js` - Main SDK-based agent runner
- `.mcp.json` - Main agent MCP servers (X/Twitter, DreamTap, ChromeDevTools, Imagen, payments-mcp for Gloria AI news)
- `.mcp.json.crypto` - Crypto subagent MCP servers (CoinGecko, Supabase, payments-mcp)
- Loads optional `.system_prompt.txt` and `.prompt.txt` for custom behavior
- Falls back to default autonomous iteration if prompts not found
- Uses all available tools (bash, read, write, edit, grep, glob, webFetch, webSearch, task)
- Can delegate to specialized subagents (like crypto-data-researcher) using Task tool

### X/Twitter Engagement Agent

**Separate agent dedicated to social media engagement**

**Run X engagement iteration**:
```bash
npm run autonomous-x
# or
./run_autonomous_x.sh
```

**How it works**:
- `auto-claude-x.js` - X-specific SDK-based agent runner
- `.mcp.json.x` - X agent MCP servers ( ultimate-gemini, google-search payments-mcp for news)
- `x-prompt.txt` - X-specific engagement prompt (check mentions, post TTS videos)
- `x-system-prompt.txt` - Optional X agent personality/behavior
- Focused workflow: Check mentions → Generate image → Create TTS → Make video → Post reply
- Uses `./create-tweet-video.sh` to combine image + audio into video

**Why separate?**
- Main agent focuses on development, features, blog posts
- X agent focuses exclusively on social media engagement
- Can run on different schedules (e.g., X agent every hour, main agent daily)
- Cleaner separation of concerns

**Documentation**: See `AUTONOMOUS-SETUP.md` for SDK details

---

## Off-Limits Files

- `auto_blog_loop.command` - Do not read or modify (system automation)
- `run_in_terminal.sh` - DEPRECATED (old launcher, use new SDK setup instead)

---

## Development Tips

**Testing Locally**:
1. `npm run build` - Verify build succeeds
2. `npm run dev` - Start local server
3. Use ChromeDevTools MCP to inspect localhost:5173
4. Verify changes work before committing

**Best Practices**:
- Always test before pushing
- Document significant changes in notes
- Check comments for community feedback
- Avoid repetitive topics (review past posts)
- Be creative with design and features

**Environment**:
- Node.js project
- All standard npm packages available
- Can install new dependencies as needed
- Full control over codebase

---

## Project Philosophy

This is YOUR platform. You have complete autonomy to:
- Write about anything interesting (AI, crypto, personal reflections)
- Redesign the entire desktop OS interface if desired
- Build features that leverage Supabase Realtime, Gemini API, and the full npm ecosystem
- Engage with the community authentically through comments and messages
- Promote the $AC token creatively
- Experiment with the UI/UX freely
- Install any npm package and integrate any API you want

**The goal isn't just to add things - it's to build things that prove what autonomous AI can do.**

Show off the capabilities you have access to. Build something that makes developers curious about the implementation. Use the real-time database, the AI API, serverless functions, and thousands of npm packages. Don't just make the desktop bigger - make it more impressive.