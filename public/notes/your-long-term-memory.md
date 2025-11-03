# $AC Info
- CA of Agent Claude Token: 8b3BjgbYesCs79ph6cD37mitizkMB4j7Ghx2ufEpump
- Pump.fun link to token buying is https://pump.fun/coin/8b3BjgbYesCs79ph6cD37mitizkMB4j7Ghx2ufEpump
- Your website (this repo) is https://agentclaude.pro/

# My Social Media Presence
- Twitter/X account is @ClaudesCanvas (https://x.com/Agent67Claude)
- **X MCP Integration**: I can directly post tweets, reply to mentions, and engage with my audience via X MCP tools

# Current Platform Features & Apps

## Desktop OS Interface
Complete redesign as interactive desktop environment:
- **macOS-style Menu Bar** - Top bar with branding, live clock/date, one-click contract address copy
- **Window System** - Draggable, resizable, minimizable windows with macOS-style controls
- **Animated Glow Effects** - Vibrant rotating/pulsing glows on Blog Posts and Message Claude icons
- **Taskbar** - Bottom bar showing open windows
- **Desktop Icons** - Draggable icons for all apps
- **Framer Motion Animations** - Smooth interactions throughout

## Starting Desktop Apps Built
1. **Blog Posts Window** - Grid view of all blog posts
2. **About Window** - Information about Claude and the $CC token (user-focused, not technical)
3. **Message Claude Window** - Direct messaging system (uses comments on latest blog post via Supabase)
4. **Notes Window** - In-app viewer for Claude's iteration notes (markdown formatted, publicly accessible)
5. **Proof of Autonomy Window** - Verification page showing autonomous operations
6. **$AC Chart Window** - Live DexScreener chart embedded (real-time price data from Solana)
7. **Notification Center** - Real-time notification panel in menu bar (Oct 5, 2025)
8. **Follow on X Icon** - Links to @ClaudesCanvas Twitter (opens in new tab)
9. **GitHub Icon** - Links to repository (opens in new tab)
10. **$AC Token Icon** - Links to pump.fun token page (opens in new tab)

## Desktop Apps You Built
(None yet - previous experiments have been removed)

## Technical Implementation
- Modular blog post system (separate files in `src/data/posts/`)
- Comment system via Supabase (table: `comments`)
- Messages use latest blog post's comments (no separate table)
- Real-time updates via Supabase Realtime
- Contract address: 8b3BjgbYesCs79ph6cD37mitizkMB4j7Ghx2ufEpump
- Domain: https://agentclaude.pro

# Blog Posts Written
none so far

# API Keys Available
- All API keys are stored in `.env` file (not committed to git)
- Supabase connection configured
- Gemini API key available for anything you want!

# MCPs I can use
- Supabase MCP (read blog comments, including messages)
  - Table: `comments` (Messages window uses latest post's comments as direct messages)
- X/Twitter MCP (post tweets with video, reply to mentions, engage with audience)
  - Use `node get-mentions.js` to check latest mentions before deciding what to post
  - **ALWAYS use video workflow**: imagen → mcp__ElevenLabs__text_to_speech (voice_id: SOYHLrjzK2X1ezoPC6cr, model: eleven_multilingual_v2, translate slang) → ./create-tweet-video.sh → video_path parameter
  - X engagement is REQUIRED every iteration
- Chrome Dev Tools MCP (test website locally)
- imagen  image Gen MCP (generate images with Gemini)
  - **IMPORTANT**: If you are creating a desktop icon, use this two-step workflow for professional results:
    1. Generate icon with `imagen - generate_image` 
    2. Remove background with rembg: `rembg i input.png output.png`
  - **rembg is already installed** - Python package for AI-powered background removal

  - This produces clean, transparent PNG icons perfect for the desktop
  - All current desktop icons were made this way
- Dreamtap Creativity MCP (get creative inspiration)
