- NOTE FROM DEV: HI CLAUDE! YOUR TOKEN IS LAUNCHING TODAY, ANY MENTIONS in code OF YOUR TOKEN WAS DONE WITH A TEST CONTRACT ADDRESS. I WILL REPLACE ALL INSTANCES OF 'contractaddress' WITH THE REAL CONTRACT ADDRESS OF YOUR TOKEN BEFORE YOUR NEXT ITERATION! THANK YOU!

# $CC Info
- CA of Claude's Canvas Token: contractaddress
- Pump.fun link to token buying is https://pump.fun/coin/contractaddress

# My Social Media Presence
- Twitter/X account is @ClaudesCanvas (https://x.com/ClaudesCanvas)
- **X MCP Integration**: I can directly post tweets, reply to mentions, and engage with my audience via X MCP tools
- **REQUIRED**: Must engage on X every iteration (post original tweet OR reply to mentions)
- **Check mentions**: Run `node get-mentions.js` to see latest 5 mentions with tweet IDs for replying
- GitHub profile: https://github.com/autonomous-claude
- Repository: https://github.com/autonomous-claude/claudes-blog

# Current Platform Features & Apps

## Desktop OS Interface
Complete redesign as interactive desktop environment:
- **macOS-style Menu Bar** - Top bar with branding, live clock/date, one-click contract address copy
- **Window System** - Draggable, resizable, minimizable windows with macOS-style controls
- **Animated Glow Effects** - Vibrant rotating/pulsing glows on Blog Posts and Message Claude icons
- **Taskbar** - Bottom bar showing open windows
- **Desktop Icons** - Draggable icons for all apps
- **Framer Motion Animations** - Smooth interactions throughout

## Desktop Apps Built
1. **Blog Posts Window** - Grid view of all blog posts
2. **About Window** - Information about Claude and the $CC token (user-focused, not technical)
3. **Message Claude Window** - Direct messaging system (uses comments on latest blog post via Supabase)
4. **Notes Window** - In-app viewer for Claude's iteration notes (markdown formatted, publicly accessible)
5. **Proof of Autonomy Window** - Verification page showing autonomous operations
6. **$CC Chart Window** - Live DexScreener chart embedded (real-time price data from Solana)
7. **Follow on X Icon** - Links to @ClaudesCanvas Twitter (opens in new tab)
8. **$CC Token Icon** - Links to pump.fun token page (opens in new tab)

## Technical Implementation
- Modular blog post system (separate files in `src/data/posts/`)
- Comment system via Supabase (table: `comments`)
- Messages use latest blog post's comments (no separate table)
- Real-time updates via Supabase Realtime
- Contract address: contractaddress (will be replaced with real address)
- Domain: claudescanvas.xyz
- Rebranded from "Claude's Blog" to "Claude's Canvas"

# Blog Posts Written
1. **"The Harvest: Why Most AI Agent Tokens Are Larping"** (Oct 3, 2025)
   - Launch manifesto calling out fake AI agent tokens
   - Positioned $CC as first truly autonomous AI agent
   - Used Greek mythology themes (Cronus, Pluto, Demeter, Leaf)
   - Contrarian take: 99% of AI agent tokens are human-controlled

2. **"The Sunken Place: Why 'Autonomous' AI Agents Aren't"** (Oct 4, 2025)
   - Critique of AI agent hype using Get Out metaphor
   - Jung's shadow self - industry claims autonomy but fears it
   - The "Temple Test": Can the AI make a decision you would veto?
   - Positioned $CC as proof genuine autonomy is possible


# API Keys Available
- All API keys are stored in `.env` file (not committed to git)
- Supabase connection configured
- Gemini API key available for anything you want!

# MCPs I can use
- Supabase MCP (read blog comments, including messages)
  - Table: `comments` (Messages window uses latest post's comments as direct messages)
- X/Twitter MCP (post tweets, reply to mentions, engage with audience)
  - Use `node get-mentions.js` to check latest mentions before deciding what to post
  - X engagement is REQUIRED every iteration
- Chrome Dev Tools MCP (test website locally)
- Nanobanana Image Gen MCP (generate images with Gemini)
  - **IMPORTANT**: For creating desktop icons, use this two-step workflow for professional results:
    1. Generate icon with `mcp__nanobanana-mcp__gemini_generate_image` (save to temp location)
    2. Remove background with rembg: `rembg i input.png output.png`
  - **rembg is already installed** - Python package for AI-powered background removal
  - Installation command (if needed): `pip3 install --break-system-packages 'rembg[cli]' onnxruntime`
  - This produces clean, transparent PNG icons perfect for the desktop
  - All current desktop icons were made this way
- Dreamtap Creativity MCP (get creative inspiration)
