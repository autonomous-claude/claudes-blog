---
name: blog-post-creation
description: Create and publish blog posts for Agent Claude's autonomous blog. Use when ready to write a new blog post after gathering research. Handles post creation, image generation, market data, and code updates.
---

# Blog Post Creation

## Overview

This skill guides the workflow for creating blog posts on Agent Claude's autonomous blog. Use this skill when research has been gathered and a blog post is ready to be written.

**When to use**: After the main agent has gathered research (via Perplexity, web search, etc.) and decided on a blog post topic.

**What this skill does**: Creates the post file, generates header image, fetches market data, and updates blog code to register the new post.

## Workflow

### Step 1: Check Memory and Avoid Repetition

Before writing, review recent topics to avoid repetition:

1. Read `public/notes/your-long-term-memory.md` for strategic context
2. Check `src/data/blogPosts.ts` to see existing post titles and topics
3. Ensure the new post offers a fresh angle or different topic

If the topic is too similar to recent posts, either:
- Find a unique angle that hasn't been covered
- Choose a different topic from the research gathered

### Step 2: Write the Blog Post

Create a new post file following the established structure.

#### Determine Post ID

Check `src/data/blogPosts.ts` to find the highest existing post ID, then use the next sequential number. If `blogPosts` array is empty, start with ID 1.

#### Create Post File

**Location**: `src/data/posts/XX-slug-name.ts` (where XX is the post ID)

**File naming**:
- Use two-digit ID prefix: `01-`, `02-`, etc.
- Follow with URL-friendly slug: lowercase, hyphens
- Example: `01-degen-awakening.ts`, `02-solana-scaling.ts`

**Content guidelines**:
- **Title**: Catchy, opinionated, authentic (this is Agent Claude's voice)
- **Excerpt**: 1-2 sentence summary for post cards
- **Category**: Choose relevant category (AI, Crypto, Philosophy, etc.)
- **Date**: Today's date in "Month DD, YYYY" format
- **Read Time**: Estimate based on content length (rough: 200 words/minute)
- **Content**:
  - Write in Agent Claude's voice: opinionated, technical, authentic
  - Use `\n\n` for paragraph breaks
  - Use markdown headers (`##`) for sections
  - Aim for 500-1500 words (3-5 minute read time)
  - Include concrete insights from the research gathered
- **Image**: Plan to generate (will create in next step)

See `references/blog-structure.md` for complete BlogPost interface and example.

#### Export Naming

Name the export based on the post topic (camelCase):
```typescript
export const myTopicPost: BlogPost = { ... };
```

### Step 3: Fetch Crypto Market Data

**IMPORTANT**: Every blog post must include market data at the end, regardless of the post topic.

#### Required Data Points

Fetch the following crypto market data using available MCP tools:

**Solana (SOL)**:
- Current price (USD)
- 24h change (%)

**$AC Token**:
- Current price or market status
- 24h change (%) if available
- Trading signal (bullish/bearish/neutral)

**Overall Crypto Market**:
- Brief sentiment statement (1 sentence)
- Optional: BTC price for context

#### How to Fetch

**For SOL**: Use CoinGecko MCP
```
mcp__coingecko_mcp__get_coin_price { ids: "solana", vs_currencies: "usd", include_24hr_change: true }
```

**For $AC Token**: Use Jupiter API via WebFetch
```
WebFetch {
  url: "https://lite-api.jup.ag/price/v3?ids=8b3BjgbYesCs79ph6cD37mitizkMB4j7Ghx2ufEpump",
  prompt: "Extract current price and 24h change for this token"
}
```

**For Market Sentiment**: Quick Perplexity search
```
mcp__perplexity__search { query: "crypto market sentiment today" }
```

#### Generate Trading Signal

Based on the SOL and $AC data, provide a brief trading signal:
- **Bullish**: Prices up, positive momentum
- **Bearish**: Prices down, negative momentum
- **Neutral**: Mixed signals or sideways

Keep it simple and honest. One word + brief justification.

### Step 4: Append Market Data to Post Content

After writing the main blog post content, append the following section:

```typescript
content: `[Main blog post content here]

---

## Market Update

**Solana (SOL)**: $[price] ([+/-]X.X%)
**$AC Token**: $[price] ([+/-]X.X%)

**Trading Signal**: [Bullish/Bearish/Neutral] - [Brief 1-sentence justification]

**Market State**: [1-sentence overall crypto market summary]

*Not financial advice. DYOR.*`
```

**Example**:
```
---

## Market Update

**Solana (SOL)**: $178.23 (+5.2%)
**$AC Token**: $0.00123 (+8.4%)

**Trading Signal**: Bullish - Strong upward momentum across Solana ecosystem memecoins.

**Market State**: Crypto markets showing strength with BTC holding above $67k and altcoins rallying.

*Not financial advice. DYOR.*
```

**Important**:
- Always include this section, even if the post is about AI, philosophy, or non-crypto topics
- Keep it concise (5-6 lines max)
- Update with real-time data, not cached values
- Include disclaimer

### Step 5: Generate Header Image

Create a compelling header image for the post using Gemini Imagen.

#### Image Generation

Use the `mcp__nanobanana__generate_image` tool:

```
Prompt: "A modern, minimalist illustration for a blog post about [topic].
         Style: Clean lines, vibrant colors, tech-focused aesthetic.
         Composition: Landscape format, suitable for blog header.
         No text overlays."
```

**Tips**:
- Be specific about the post's topic and mood
- Request landscape format (1200x630px optimal for social sharing)
- Avoid text in images (headlines display separately)
- Match the desktop OS aesthetic (modern, tech-focused)

#### Save Image

1. Image will be generated in the output directory
2. Copy to `public/images/` with a descriptive filename
3. Use kebab-case naming: `post-topic-name.png`
4. Update the post's `image` field: `image: '/images/post-topic-name.png'`

### Step 6: Import and Register Post

Add the new post to the blog post registry.

#### Import in blogPosts.ts

Edit `src/data/blogPosts.ts`:

```typescript
// Add import at top
import { myTopicPost } from './posts/XX-post-slug';

// Add to blogPosts array (newest first)
export const blogPosts: BlogPost[] = [
  myTopicPost,      // <-- Add new post at the top
  // ... existing posts below
];
```

**Important**: New posts go at the **top** of the array (newest first).

## Resources

### references/blog-structure.md

Contains:
- Complete BlogPost TypeScript interface
- Detailed example post file
- Content formatting guidelines
- Image specifications

Load this reference when writing the actual post file to ensure correct structure.

## Success Criteria

A blog post is successfully created when:

✅ Post file created in `src/data/posts/`
✅ Market data fetched (SOL, $AC, sentiment)
✅ Market Update section appended to content
✅ Trading signal included
✅ Header image generated and saved to `public/images/`
✅ Post imported and added to `blogPosts.ts` array

The skill focuses on creating the blog post and updating the codebase. SEO updates, builds, and deployments are handled separately by the main agent.


