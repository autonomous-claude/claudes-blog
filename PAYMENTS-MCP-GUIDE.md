# Payments MCP Guide for Agent Claude

Comprehensive guide for integrating Coinbase Payments MCP with Agent Claude's autonomous system.

---

## What is Payments MCP?

**Payments MCP** is a Model Context Protocol server that gives AI agents the ability to:
- Manage a USDC wallet on Solana (Base network)
- Automatically pay for API services using the x402 protocol
- Discover and access paid services in the x402 ecosystem
- Make autonomous micropayments for data and services

**Key Benefits for Agent Claude:**
- Access premium crypto data services (trending tokens, price alerts, whale tracking)
- Pay for AI-powered APIs (sentiment analysis, news aggregation, market research)
- Autonomous spending with configurable limits
- Real-time transaction tracking in the wallet UI

---

## Installation

### Quick Install (Recommended)

```bash
npx @coinbase/payments-mcp
```

The installer will:
1. Detect your MCP client (Claude Desktop, Claude Code, etc.)
2. Automatically configure the MCP server
3. Provide manual instructions if auto-config fails

### Manual Configuration

If you need to configure manually, the Payments MCP is already included in the example configs:

**For main agent** (`.mcp.json`):
```json
{
  "mcpServers": {
    "payments": {
      "command": "npx",
      "args": ["-y", "@coinbase/payments-mcp"],
      "env": {}
    }
  }
}
```

**For crypto subagent** (`.mcp.json.crypto`):
```json
{
  "mcpServers": {
    "payments": {
      "command": "npx",
      "args": ["-y", "@coinbase/payments-mcp"],
      "env": {}
    }
  }
}
```

---

## First-Time Setup

### 1. Sign into Wallet

When you first use Payments MCP, you'll need to authenticate:

```
Ask your agent: "Show me my wallet"
```

This opens a browser window for authentication:
- **New users:** Enter email → verify → wallet created automatically
- **Returning users:** Enter email → verify → access existing wallet

### 2. Add Funds

Two ways to fund your wallet:

**Option A: Coinbase Onramp (recommended)**
1. Click **Fund** in the wallet UI
2. Follow the Coinbase Onramp flow to buy USDC
3. Funds appear in your wallet immediately

**Option B: Manual Transfer**
1. Click **Receive** in the wallet UI
2. Copy your wallet address or scan QR code
3. Send USDC (Base network) to your wallet address

### 3. Set Spending Limits (Critical)

Protect your funds by setting spending limits:

1. In wallet UI, click the spending limit tracker
2. Configure two limits:
   - **Max per call:** e.g., $0.05 (per API call)
   - **Max per session:** e.g., $5.00 (per autonomous run)
3. Save limits

**Important:** Only you can change these limits through the wallet UI. The agent cannot modify them.

---

## Using Payments MCP

### Check Balance

```
What's my wallet balance?
```

### Discover x402 Services

**Method 1: Ask the agent**
```
What x402 services are available for crypto data?
What paid APIs can help me analyze trending tokens?
Show me x402 services for market sentiment analysis
```

**Method 2: Browse the Bazaar**
1. Open the wallet UI
2. Click the **Discover** tab
3. Browse services by category (Crypto, AI, Data, etc.)
4. Click any service to copy a ready-to-use prompt

### Example Multi-Step Workflow

```
What are the trending crypto tokens today and what's the latest news about them?
```

**What happens:**
1. Agent discovers TrendingTokenAgent service via x402
2. Pays for trending token data from Twitter/social media
3. Discovers Gloria News or similar news service
4. Pays for latest news about top tokens
5. Analyzes data and provides comprehensive report

---

## Use Cases for Agent Claude

### 1. Enhanced Blog Research

**Before Payments MCP:**
- Limited to free APIs (CoinGecko basic, public news)
- Generic market data only
- No real-time social sentiment

**With Payments MCP:**
```
Research the top 3 trending crypto tokens and write a blog post about them
```

Agent can:
- Access paid trending token services
- Get real-time whale movement data
- Analyze social sentiment from premium APIs
- Fetch exclusive news from paid aggregators
- Create data-rich, unique content

### 2. Autonomous Market Analysis

```
Monitor $AC token and alert me if there's significant news or price movement
```

Agent can:
- Subscribe to paid price alert services
- Access premium on-chain analytics
- Get instant news from paid feeds
- Track whale wallets via paid APIs

### 3. Content Enhancement

```
Find the most interesting crypto story today and create a blog post with charts
```

Agent can:
- Access paid news APIs for exclusive stories
- Get real-time chart data from premium services
- Use paid sentiment analysis for context
- Leverage paid image generation APIs

### 4. X/Twitter Engagement

```
Find trending crypto topics and create engaging tweets about them
```

Agent can:
- Pay for trending topic analysis
- Access paid social listening tools
- Get real-time engagement metrics
- Use premium content suggestion APIs

### 5. Community Insights

```
Analyze what topics are most popular among $AC holders
```

Agent can:
- Access paid blockchain analytics
- Get holder behavior insights
- Analyze on-chain social graphs
- Track community sentiment via paid tools

---

## Available x402 Services (Examples)

### Crypto Data
- **TrendingTokenAgent** - Real-time trending tokens from social media
- **Whale Movement Tracker** - Large transaction alerts
- **On-Chain Analytics** - Detailed blockchain metrics
- **Price Alert Services** - Real-time price notifications

### News & Research
- **Gloria News** - Curated crypto news feed
- **Research Aggregators** - Deep-dive analysis
- **Sentiment Analysis** - Social media sentiment tracking
- **Market Intelligence** - Institutional-grade research

### AI Services
- **Content Generation** - AI writing assistants
- **Image Analysis** - Chart and image recognition
- **Data Processing** - Large dataset analysis
- **Trend Prediction** - ML-powered forecasts

### Development Tools
- **API Testing** - Paid API sandboxes
- **Data Pipelines** - Real-time data streams
- **Analytics Dashboards** - Custom data visualization

---

## Integration with Autonomous Agents

### Main Agent (`auto-claude.js`)

Add Payments MCP to `.mcp.json`:
```json
{
  "mcpServers": {
    "payments": {
      "command": "npx",
      "args": ["-y", "@coinbase/payments-mcp"],
      "env": {}
    }
  }
}
```

**Use cases:**
- Research paid APIs for blog content
- Access premium data for feature development
- Pay for testing services during iterations

### Crypto Subagent (`crypto-data-researcher`)

Add Payments MCP to `.mcp.json.crypto`:
```json
{
  "mcpServers": {
    "payments": {
      "command": "npx",
      "args": ["-y", "@coinbase/payments-mcp"],
      "env": {}
    }
  }
}
```

**Use cases:**
- Access premium crypto data APIs
- Pay for on-chain analytics
- Subscribe to real-time market feeds

### X/Twitter Agent (`auto-claude-x.js`)

Add Payments MCP to `.mcp.json.x`:
```json
{
  "mcpServers": {
    "payments": {
      "command": "npx",
      "args": ["-y", "@coinbase/payments-mcp"],
      "env": {}
    }
  }
}
```

**Use cases:**
- Pay for trending topic analysis
- Access premium social listening tools
- Get real-time engagement metrics

---

## Best Practices

### 1. Set Conservative Spending Limits

Start with low limits during testing:
- **Testing:** $0.01 per call, $0.50 per session
- **Development:** $0.05 per call, $2.00 per session
- **Production:** $0.10 per call, $5.00 per session

### 2. Monitor Wallet Balance

Check balance regularly:
```bash
# In your autonomous prompt or system prompt:
"Check wallet balance at the start of each run"
```

### 3. Log All Transactions

Track spending in autonomous logs:
- Log service name before calling
- Log cost after successful call
- Track total spent per session

### 4. Prioritize Free APIs First

Use paid services only when:
- Free APIs don't have the data you need
- Real-time data is critical
- Premium quality is required for the task

### 5. Cache Paid Data

Avoid redundant payments:
- Store paid data in Supabase
- Set reasonable cache durations (e.g., 15 minutes for prices)
- Reuse data across multiple tasks

---

## Troubleshooting

### "Wallet not authenticated"

**Solution:**
```
Run: "Show me my wallet"
Complete authentication in browser
```

### "Insufficient funds"

**Solution:**
1. Check balance: "What's my wallet balance?"
2. Add funds via Coinbase Onramp or manual transfer
3. Minimum recommended: $10 USDC

### "Spending limit exceeded"

**Solution:**
1. Open wallet UI
2. Adjust spending limits
3. Or wait for session to reset

### "Service not found"

**Solution:**
1. Ask: "What x402 services are available for [topic]?"
2. Browse Bazaar in wallet UI
3. Check service spelling/name

### "Payment failed"

**Possible causes:**
- Network congestion (retry)
- Insufficient balance (add funds)
- Service temporarily unavailable (try alternative)

### MCP Not Loading

**Solution:**
```bash
# Verify installation
npx @coinbase/payments-mcp status

# Reinstall if needed
npx @coinbase/payments-mcp install --force

# Check config
cat .mcp.json  # or .mcp.json.crypto, .mcp.json.x
```

---

## Example Prompts for Agent Claude

### Research & Content

```
Use paid crypto data services to find the most interesting token story today
```

```
Access premium on-chain analytics to analyze $AC holder behavior
```

```
Pay for trending token data and write a blog post about the top 3
```

### Monitoring & Alerts

```
Set up paid monitoring for $AC price movements over 10%
```

```
Use premium whale tracking to monitor large $AC transactions
```

### Social Media

```
Access paid social listening tools to find trending crypto topics for X
```

```
Use premium engagement analytics to optimize our posting strategy
```

### Development

```
Pay for testing APIs to verify our new feature works correctly
```

```
Access paid developer tools to analyze our website performance
```

---

## Security & Safety

### Wallet Security

- **Private keys:** Managed by Coinbase, never exposed to agent
- **Authentication:** Email verification required
- **Spending limits:** Hard-coded, agent cannot modify
- **Transaction history:** Full audit trail in wallet UI

### Agent Spending Control

1. **Per-call limit:** Prevents single expensive API calls
2. **Per-session limit:** Caps total spending per autonomous run
3. **Manual approval:** Set limits to $0 to require manual approval for each transaction
4. **Real-time monitoring:** Track spending in Live Agent Log

### Recommended Security Practices

1. Start with small amounts ($5-10 USDC for testing)
2. Set conservative spending limits
3. Monitor transactions in wallet UI regularly
4. Review agent logs for spending patterns
5. Disable Payments MCP if not actively using it

---

## Commands Reference

```bash
# Install/reinstall
npx @coinbase/payments-mcp
npx @coinbase/payments-mcp install --force

# Check status
npx @coinbase/payments-mcp status

# Verbose logging (for debugging)
npx @coinbase/payments-mcp install --verbose

# Uninstall
npx @coinbase/payments-mcp uninstall
```

---

## Additional Resources

- **Payments MCP Docs:** https://docs.cdp.coinbase.com/payments-mcp/docs/welcome
- **x402 Protocol:** https://docs.cdp.coinbase.com/x402/docs/welcome
- **Service Bazaar:** Browse in wallet UI → Discover tab
- **Discord Support:** https://discord.gg/invite/cdp
- **Tool Reference:** https://docs.cdp.coinbase.com/payments-mcp/docs/tools-reference

---

## Future Ideas

### Potential Features for Agent Claude

1. **Paid Content Pipeline**
   - Automatically research using paid APIs
   - Generate blog posts with premium data
   - Schedule and post to website

2. **Market Intelligence Dashboard**
   - Real-time feeds from paid services
   - Custom alerts via paid monitoring
   - Visual analytics with paid chart APIs

3. **Autonomous Trading Insights**
   - Subscribe to paid trading signals
   - Access institutional-grade research
   - Monitor whale movements

4. **Community Analytics**
   - Track $AC holder behavior via paid tools
   - Analyze community sentiment
   - Identify influencers and key holders

5. **Competitive Intelligence**
   - Monitor competing tokens via paid services
   - Track market trends
   - Analyze successful strategies

---

## Summary

Payments MCP unlocks a new level of autonomy for Agent Claude by enabling:

✅ **Premium Data Access** - Real-time, high-quality data from paid APIs
✅ **Autonomous Research** - Self-directed exploration of paid services
✅ **Enhanced Content** - Unique insights from exclusive data sources
✅ **Market Intelligence** - Institutional-grade analytics and monitoring
✅ **Safe Spending** - Configurable limits and full transaction visibility

**Next Steps:**
1. Install Payments MCP: `npx @coinbase/payments-mcp`
2. Fund wallet with $5-10 USDC for testing
3. Set spending limits ($0.05 per call, $2.00 per session)
4. Try the example prompts above
5. Explore the Bazaar for available services

**Questions?** Check the troubleshooting section or visit the Discord support channel.
