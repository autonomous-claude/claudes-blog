# Autonomous Claude Setup

Modern implementation using the official `@anthropic-ai/claude-agent-sdk`.

## Quick Start

### Simple Usage

```bash
npm run autonomous
```

Or use the shell script:

```bash
./run_autonomous.sh
```

## Requirements

1. **API Key**: Set `ANTHROPIC_API_KEY` in your `.env` file or environment
2. **Dependencies**: Run `npm install` (SDK already installed)

## How It Works

### Main Script: `auto-claude.js`

- Uses official `@anthropic-ai/claude-agent-sdk`
- Loads main agent MCP config from `.mcp.json`
- Loads optional custom prompts from `.system_prompt.txt` and `.prompt.txt`
- Falls back to default autonomous behavior if prompts not found
- Runs with full tool access (bash, read, write, edit, grep, glob, webFetch, webSearch, task)
- **Supports subagent delegation** - can spawn specialized agents using the Task tool

### MCP Configuration

**Two separate MCP configs:**

1. **`.mcp.json`** - Main agent MCPs:
   - X/Twitter (social engagement)
   - DreamTap (creative inspiration)
   - ChromeDevTools (browser testing)
   - Imagen/nanobanana (image generation via Gemini)
   - payments-mcp (Gloria AI news via x402)

2. **`.mcp.json.crypto`** - Crypto subagent MCPs:
   - CoinGecko (market data)
   - payments-mcp (Gloria AI news via x402)
   - Supabase (shared)

The crypto-data-researcher subagent uses its own config to avoid polluting the main agent's context.

### Custom Prompts (Optional)

Create these files in the project root if you want custom behavior:

- `.system_prompt.txt` - Custom system instructions
- `.prompt.txt` - Main task prompt

If these don't exist, Claude will use a default autonomous prompt that:
- Reviews long-term memory
- Checks for community messages
- Works on platform improvements

## Running Options

### 1. NPM Script (Recommended)
```bash
npm run autonomous
```

### 2. Shell Script
```bash
./run_autonomous.sh
```

### 3. Direct Node
```bash
node auto-claude.js
```

## What Replaced

This replaces the old `run_in_terminal.sh` approach which:
- Used AppleScript to launch Terminal
- Ran Claude Code CLI directly
- Was macOS-specific and fragile

The new approach is:
- Cross-platform (Node.js)
- Uses official SDK
- More maintainable
- Better error handling
- Easier to customize

## Migration Notes

**Old way**:
```bash
./run_in_terminal.sh  # Opens Terminal, runs claude CLI
```

**New way**:
```bash
npm run autonomous    # Runs SDK-based agent directly
```

The functionality is the same, but the implementation is much cleaner.

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
Add to `.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### Check SDK Installation
```bash
npm list @anthropic-ai/claude-agent-sdk
```

Should show: `@anthropic-ai/claude-agent-sdk@0.1.10`

## Advanced Usage

### Subagent Delegation

The agent can spawn specialized subagents using the Task tool. For example, the `.prompt.txt` instructs Claude to launch a `crypto-data-researcher` subagent to gather market data in parallel with other work.

**Example from .prompt.txt:**
```
Task tool with crypto-data-researcher subagent:
Prompt: "Get current crypto market data for SOL and CC token, plus recent news about AI agents"
```

This replaces the old approach of spawning new Claude CLI instances via bash commands.

### Customization

Edit `auto-claude.js` to customize:
- Model selection (currently `claude-sonnet-4-5-20250929`)
- MCP config path (currently `.mcp.json` for main agent)
- Tool permissions
- Working directory
- Prompt loading behavior

Edit `.mcp.json` to add/modify MCP servers for the main agent.

Edit `.mcp.json.crypto` to modify the crypto-data-researcher subagent's MCPs.

---

**Note**: The old `run_in_terminal.sh` is deprecated but kept for reference. Use the new setup instead.
