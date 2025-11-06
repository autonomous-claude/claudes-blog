# MCP Server Setup

This project uses two MCP (Model Context Protocol) configuration files for autonomous operations:

## Configuration Files

1. **`.mcp.json`** - Main agent MCP servers (gitignored)
2. **`.mcp.json.crypto`** - Crypto subagent MCP servers (gitignored)

## Quick Setup

Copy the example files and fill in your API keys:

```bash
cp .mcp.json.example .mcp.json
cp .mcp.json.crypto.example .mcp.json.crypto
```

Then edit both files to add your API keys.

## Main MCP Servers (`.mcp.json`)

### Required API Keys

1. **X/Twitter** (`x`)
   - Get API keys from: https://developer.x.com
   - Required: API key, API secret, Access token, Access secret
   - Used for: Posting tweets, replying to mentions, social engagement

2. **DreamTap** (`dreamtap`)
   - No API key needed (HTTP endpoint)
   - Used for: Creative inspiration and idea generation

3. **Chrome DevTools** (`chrome-devtools`)
   - No API key needed (local npx package)
   - Used for: Browser testing and automation

4. **Nanobanana** (`nanobanana`)
   - Get API key from: https://ai.google.dev
   - Required: Gemini API key
   - Used for: Image generation via Gemini

5. **Payments MCP** (`payments-mcp`)
   - Setup: Install `mcp-payments` via Claude Code
   - Used for: x402 payments to access Gloria AI news API
   - Features: Bazaar marketplace, x402 payment handling, wallet integration

6. **Imagen** (`imagen`)
   - Get API key from: https://ai.google.dev
   - Required: Gemini API key (same as nanobanana)
   - Used for: High-quality image generation with Imagen 4 Ultra

## Crypto MCP Servers (`.mcp.json.crypto`)

### Required API Keys

1. **CoinGecko** (`coingecko_mcp`)
   - No API key needed (public endpoint)
   - Used for: Crypto market data, prices, market caps

2. **Supabase** (`supabase`)
   - Get token from: https://supabase.com/dashboard/account/tokens
   - Required: Supabase access token
   - Used for: Database operations, storing data

3. **Payments MCP** (`payments-mcp`)
   - Setup: Install `mcp-payments` via Claude Code
   - Used for: x402 payments to access Gloria AI news API (https://api.itsgloria.ai/news)
   - Features: Crypto news with sentiment analysis, AI agent coverage, token-specific news

## X/Twitter MCP Setup

The X MCP server requires local installation:

```bash
git clone https://github.com/your-repo/x-mcp-server
cd x-mcp-server
npm install
npm run build
```

Then update the path in `.mcp.json`:
```json
"x": {
  "command": "node",
  "args": [
    "/absolute/path/to/x-mcp-server/build/index.js"
  ],
  ...
}
```

## How It Works

### Main Agent (`auto-claude.js`)

Loads both MCP configs and merges them:

```javascript
// Load .mcp.json (main agent servers)
// Load .mcp.json.crypto (crypto subagent servers)
// Merge both configs
// Total: 8 MCP servers available (reduced from 10 after removing Perplexity/Tavily)
```

### Crypto Subagent

When the main agent spawns the `cryptodataresearcher` subagent via the Task tool, the subagent has access to all merged MCP servers, including the crypto-specific ones.

## Security Notes

- ⚠️ **Never commit `.mcp.json` or `.mcp.json.crypto`** - They contain API keys
- ✅ Both files are in `.gitignore`
- ✅ Example files (`.mcp.json.example`, `.mcp.json.crypto.example`) are safe to commit
- 🔐 Keep your API keys secure and rotate them if exposed

## Troubleshooting

**"No .mcp.json found"**
- Copy `.mcp.json.example` to `.mcp.json` and add your API keys

**"No .mcp.json.crypto found"**
- Copy `.mcp.json.crypto.example` to `.mcp.json.crypto` and add your API keys

**MCP server fails to start**
- Check that API keys are valid
- For `x` server, verify the path to `x-mcp-server/build/index.js` is correct
- For `uvx` commands, ensure you have `uv` installed: `pip install uv`

## Testing

Verify MCP configs load correctly:

```bash
node auto-claude.js
```

You should see:
```
✓ Loaded 6 MCP servers from .mcp.json
✓ Merged 2 crypto MCP servers (total: 8)
```
