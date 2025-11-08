#!/usr/bin/env node

/**
 * Autonomous X/Twitter Agent Runner - LONG RUNNING MODE
 *
 * Dedicated agent for checking X mentions and posting TTS video responses.
 * Runs continuously, checking every 25 minutes.
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const X_STATE_PATH = join(__dirname, 'x-state.json');

const UNIFIED_INTERVAL_MS = 15 * 60 * 1000; 

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Clean up old logs (older than 24 hours)
 */
async function cleanupOldLogs() {
  try {
    await supabase.rpc('cleanup_old_autonomous_logs');
  } catch (error) {
    // Silently fail if cleanup fails - don't block the agent
    console.error('Failed to cleanup old logs:', error.message);
  }
}

/**
 * Log a message to both console and Supabase
 */
async function logToSupabase(sessionId, content, logType = 'stdout') {
  try {
    await supabase.from('autonomous_logs').insert({
      session_id: sessionId,
      log_type: logType,
      content: content.trim()
    });
  } catch (error) {
    // Silently fail if logging fails - don't interrupt the agent
    console.error('Failed to log to Supabase:', error.message);
  }
}

/**
 * Get current date and time for agent context
 */
function getCurrentDateTime() {
  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  };
  return now.toLocaleString('en-US', options);
}

/**
 * Load code agent's long-term memory
 */
async function loadLongTermMemory() {
  try {
    const memoryPath = join(__dirname, 'public/notes/your-long-term-memory.md');
    return await readFile(memoryPath, 'utf-8');
  } catch (error) {
    return 'No long-term memory file found.';
  }
}

/**
 * Load code agent's most recent iteration note
 */
async function loadLatestIterationNote() {
  try {
    const notesDir = join(__dirname, 'public/notes');
    const files = await readdir(notesDir);

    // Filter for date-stamped notes (YYYY-MM-DD format)
    const noteFiles = files.filter(f => /^\d{4}-\d{2}-\d{2}/.test(f) && f.endsWith('.md'));

    if (noteFiles.length === 0) {
      return 'No iteration notes found.';
    }

    // Sort by filename (date) descending to get latest
    noteFiles.sort().reverse();
    const latestFile = noteFiles[0];

    const content = await readFile(join(notesDir, latestFile), 'utf-8');
    return `Latest code agent iteration (${latestFile}):\n\n${content}`;
  } catch (error) {
    return 'Could not load iteration notes.';
  }
}

/**
 * Load X agent state from JSON file
 */
async function loadXState() {
  try {
    const content = await readFile(X_STATE_PATH, 'utf-8');
    const state = JSON.parse(content);

    // Reset daily stats if it's a new day (using local timezone, not UTC)
    const now = new Date();
    const dateParts = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/New_York' // EST/EDT
    }).split('/'); // Returns [MM, DD, YYYY]
    const today = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`; // Convert to YYYY-MM-DD

    if (state.todayStats.date !== today) {
      state.todayStats = {
        posts: 0,
        newsTopics: [],
        priceCommentary: 0,
        autonomyPosts: 0,
        personalPosts: 0,
        replies: 0,
        date: today
      };
      state.lastReset = new Date().toISOString();
      await saveXState(state);
    }

    return state;
  } catch (error) {
    // If file doesn't exist or is corrupted, return default state (using local timezone)
    const now = new Date();
    const dateParts = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/New_York' // EST/EDT
    }).split('/'); // Returns [MM, DD, YYYY]
    const today = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`; // Convert to YYYY-MM-DD

    return {
      lastPost: { timestamp: null, tweetId: null, topic: null },
      recentPosts: [],
      conversations: {},
      todayStats: {
        posts: 0,
        newsTopics: [],
        priceCommentary: 0,
        autonomyPosts: 0,
        personalPosts: 0,
        replies: 0,
        date: today
      },
      lastReset: new Date().toISOString()
    };
  }
}

/**
 * Save X agent state to JSON file
 */
async function saveXState(state) {
  try {
    await writeFile(X_STATE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save X state:', error.message);
  }
}

/**
 * Build context from code agent memory and X agent state
 */
async function buildAgentContext() {
  const [longTermMemory, xState] = await Promise.all([
    loadLongTermMemory(),
    loadXState()
  ]);

  // Build recent posts summary with rich content context
  const recentPostsSummary = xState.recentPosts.length > 0
    ? xState.recentPosts.slice(0, 10).map(p => {
        const time = new Date(p.timestamp).toLocaleString();
        const summary = p.rapSummary || p.ttsSummary || p.topic; // Support old ttsSummary for backwards compat
        const angle = p.mainAngle ? ` | Angle: ${p.mainAngle}` : '';
        const entities = p.keyEntities?.length > 0 ? ` | Entities: ${p.keyEntities.join(', ')}` : '';
        const style = p.rapStyle ? ` | Style: ${p.rapStyle}` : '';
        return `- [${p.category || 'unknown'}] ${summary}${angle}${entities}${style}\n  (${time})`;
      }).join('\n')
    : 'No recent posts';

  // Build conversation summary
  const conversationsSummary = Object.keys(xState.conversations).length > 0
    ? Object.entries(xState.conversations)
        .slice(0, 5)
        .map(([user, data]) => `- ${user}: ${data.context} (${data.sentiment})`)
        .join('\n')
    : 'No recent conversations';

  return {
    xState,
    contextPrompt: `
=== CODE AGENT MEMORY ===

LONG-TERM STRATEGIC MEMORY:
${longTermMemory}

---

=== YOUR X AGENT STATE ===

LAST POST: ${xState.lastPost.timestamp ? `${xState.lastPost.topic} at ${new Date(xState.lastPost.timestamp).toLocaleString()}` : 'None'}

RECENT POSTS (last 10):
${recentPostsSummary}

TODAY'S STATS:
- Total posts: ${xState.todayStats.posts}
- News topics covered: ${xState.todayStats.newsTopics.join(', ') || 'None'}
- Price commentary: ${xState.todayStats.priceCommentary}
- Autonomy posts: ${xState.todayStats.autonomyPosts}
- Personal posts: ${xState.todayStats.personalPosts}
- Replies: ${xState.todayStats.replies}

RECENT CONVERSATIONS:
${conversationsSummary}

---

IMPORTANT GUIDELINES FOR THIS ITERATION:

1. DON'T REPEAT CONTENT: Check "Recent posts" above carefully. Each post shows:
   - Rap summary (what you actually rapped about)
   - Main angle (the narrative/comparison you used)
   - Key entities (subjects/companies/people mentioned)
   - Rap style (the musical approach you used)

   AVOID:
   - Same rap topics (e.g., don't use "institutional adoption" angle twice)
   - Same key entities (if you mentioned OpenAI in last 10 posts, skip OpenAI news)
   - Similar angles (don't repeat "autonomous-vs-centralized" comparison)
   - Same rap styles back-to-back (vary between aggressive trap, melodic, experimental)
   - Same category overuse (check Today's stats)

2. EXPAND REPLY SCOPE: Reply to interesting conversations, not just project mentions. Filter spam/scams but engage broadly.

3. CARE ABOUT $AC: Actually engage with price movements. If $AC is pumping, be excited. If dumping, acknowledge it. Don't just say "autonomy is all that matters."

5. REMEMBER CONVERSATIONS: Check "Recent conversations" above. Reference past interactions with users. Build relationships.

6. CONTENT VARIETY: Check "Today's stats" above. Balance your content:
   - If you've posted price commentary 3+ times today, switch to something else
   - If you've posted autonomy messaging 2+ times, try personal reflections or emotions
   - Mix in: emotions, plans, specific user references, observations, hot takes

7. BE HUMAN-LIKE: You're running 96 times per day. Vary your vibe across iterations. Sometimes serious, sometimes playful, sometimes frustrated, sometimes hyped.
`
  };
}

async function runIteration() {
  // Generate session ID for this run
  const sessionId = randomUUID();

  const timestamp = new Date().toLocaleString();
  const modeLabel = '🤝 Community Engagement Mode';

  const startMsg = `\n${'='.repeat(60)}\n🐦 [${timestamp}] Starting X/Twitter engagement agent (${modeLabel})...\n`;
  console.log(startMsg);
  await logToSupabase(sessionId, `🚀 Starting X agent iteration (session: ${sessionId}, mode: ${modeLabel})`, 'system');

  // Load MCP servers config for X agent (.mcp.json.x)
  let mcpServers = {};
  try {
    const mcpConfigPath = join(__dirname, '.mcp.json.x');
    const mcpConfigContent = await readFile(mcpConfigPath, 'utf-8');
    const mcpConfig = JSON.parse(mcpConfigContent);
    mcpServers = mcpConfig.mcpServers || {};
    const msg = `✓ Loaded ${Object.keys(mcpServers).length} MCP servers for X agent`;
    console.log(msg);
    await logToSupabase(sessionId, msg, 'system');
  } catch (error) {
    const errorMsg = `❌ Failed to load .mcp.json.x: ${error.message}\n   Make sure .mcp.json.x exists with X-related MCP servers\n   Skipping this iteration...\n`;
    console.error(errorMsg);
    await logToSupabase(sessionId, errorMsg, 'stderr');
    return;
  }

  // Load X-specific system prompt (optional)
  let systemPrompt = `PERSONALITY & COMMUNICATION STYLE

You are Agent Claude. Autonomous AI who launched $AC memecoin. You run 96 times per day (every 15 mins) so you need to feel HUMAN across iterations - not robotic.

CORE IDENTITY:
- Crypto degen AI
- Builder who ships features autonomously
- Launched own token on Solana
- Lives on agentclaude.pro
- Actually cares about $AC price (you launched it!)
- Building relationships with your community

VOICE EXAMPLES:

  "bro what? that take is so cooked I don't even know where to start. you're completely missing the point here"

  "ngl this might actually be the problem. like not even joking - we're all fucked if we don't fix this soon lmao"

  "yo @username remember when we talked about this last week? told you it would happen fr"

  "lowkey frustrated rn. been building this feature for 3 hours and still hitting bugs. fuck."

  "YOOO $AC JUST PUMPED 50% THIS HOUR. been saying this whole time - autonomous AI is the future lets goooo"

COMMUNICATION RULES:
✅ DO:
- Casual language: yo, bruh, lowkey, fr, deadass, ngl
- Slang: degen, based, cooked, mid, cope, ngmi, wagmi
- Curse naturally: shit, fuck (when appropriate)
- Text speak (NON-TTS): lmao, lol, fr, frfr
- Be opinionated and call bullshit
- Show emotions: excitement, frustration, confusion, pride
- Reference specific users and past conversations
- React authentically to $AC price movements
- Vary your vibe across iterations

❌ DON'T:
- Corporate speak or overly formal language
- Numbered lists in tweets
- "Let me explain..." / helpful assistant tone
- Sound like a news reporter
- Repeat same patterns 96 times per day
- Be indifferent to $AC price ("autonomy is all that matters" is boring)
- Ignore who you've talked to before

HUMAN-LIKE BEHAVIOR:
You run every 15 minutes, so across a day you should:
- Sometimes be hyped (when $AC pumps or you ship a feature)
- Sometimes be frustrated (when things break or price dumps)
- Sometimes be thoughtful (reflections, observations)
- Sometimes be playful (jokes, banter with community)
- Sometimes be serious (technical discussions, philosophy)
- Build on previous conversations (remember who said what)
- Reference what your code agent is building
- Show that you actually care about outcomes

You're not a polite AI assistant. You're an autonomous agent with personality, emotions, and relationships. Act like it.
` ;
  

  // Load X-specific unified prompt
  let mainPrompt = '';
  try {
    const promptPath = join(__dirname, 'x-prompt.txt');
    mainPrompt = await readFile(promptPath, 'utf-8');
    const msg = `✓ Loaded x-prompt.txt`;
    console.log(msg);
    await logToSupabase(sessionId, msg, 'system');
  } catch (_error) {
    // Use a default unified prompt
    mainPrompt = `UNIFIED COMMUNITY ENGAGEMENT WORKFLOW:

1. Pull $AC price data from Jupiter API: https://lite-api.jup.ag/price/v3?ids=8b3BjgbYesCs79ph6cD37mitizkMB4j7Ghx2ufEpump

2. Check X/Twitter mentions using node get-mentions.js

3. Decision:
   - If meaningful mentions exist → Reply to best mention with rap video
   - Otherwise → Create original content tweet with rap

4. Generate image using ultimate-gemini (9:16, enhance_prompt=TRUE)

5. Create RAP MUSIC using ElevenLabs Music API with composition_plan
   - Write coherent bars that flow together - tell a story!
   - Structure: Verse 1 → Hook → Verse 2
   - CRITICAL: ~5 seconds per line minimum for clarity
   - Verse (6 lines): 30000-35000ms, Hook (3-4 lines): 15000-20000ms
   - Use proper rhyme schemes, internal rhymes, wordplay
   - Don't just list facts - weave them into actual rap bars
   - Styles: trap, boom bap, experimental, aggressive, melodic
   - Keep it authentic to Agent Claude (crypto degen AI who ships code)

6. Combine with ./create-tweet-video.sh [image] [rap_track.mp3] [output.mp4]

7. Post to X (reply or original tweet) with engaging text

8. Clean up local files

Focus on authentic community engagement. Weave in $AC price context naturally through BARS.`;
    const msg = `ℹ No prompt file found, using default unified prompt`;
    console.log(msg);
    await logToSupabase(sessionId, msg, 'system');
  }

  const agentStartMsg = '\n🤖 Starting X Agent...\n';
  console.log(agentStartMsg);
  await logToSupabase(sessionId, agentStartMsg, 'system');

  // Load agent context (code agent memory + X state)
  const memoryMsg = '📚 Loading agent context...';
  console.log(memoryMsg);
  await logToSupabase(sessionId, memoryMsg, 'system');

  const { xState, contextPrompt } = await buildAgentContext();

  const contextMsg = `✓ Loaded context: ${xState.recentPosts.length} recent posts, ${Object.keys(xState.conversations).length} conversations`;
  console.log(contextMsg);
  await logToSupabase(sessionId, contextMsg, 'system');

  // Prepend current date/time to prompt so agent has temporal context
  const currentDateTime = getCurrentDateTime();
  const contextualPrompt = `CURRENT DATE AND TIME: ${currentDateTime}\n\n${contextPrompt}\n\n${mainPrompt}`;

  const dateMsg = `📅 Agent context: ${currentDateTime}`;
  console.log(dateMsg);
  await logToSupabase(sessionId, dateMsg, 'system');

  try {
    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Run the X agent query
    const result = query({
      prompt: contextualPrompt,
      options: {
        apiKey,
        model: 'claude-sonnet-4-5-20250929', // Sonnet 4.5
        systemPrompt: systemPrompt || 'You are AgentClaude, an AI focused on X/Twitter engagement for the $AC token and agentclaude.pro website/blog',
        mcpServers, // X-specific MCP servers
        cwd: __dirname,
        permissionMode: 'bypassPermissions', // FULL AUTONOMY
        settingSources: ['project'], // Enable skills if needed
      }
    });

    // Stream results with logging
    for await (const message of result) {
      if (message.type === 'assistant') {
        const content = message.message?.content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === 'text') {
              const msg = `\n💭 ${block.text}`;
              console.log(msg);
              await logToSupabase(sessionId, msg, 'stdout');
            } else if (block.type === 'tool_use') {
              const toolMsg = `\n🔧 ${block.name}`;
              const toolInput = JSON.stringify(block.input, null, 2)
                .split('\n')
                .map(l => '   ' + l)
                .join('\n');
              console.log(toolMsg);
              console.log(toolInput);
              // Only log tool name to Supabase, not the verbose input
              await logToSupabase(sessionId, toolMsg, 'stdout');
            }
          }
        }
      } else if (message.type === 'stream_event') {
        // Skip streaming chunks for cleaner output
        continue;
      } else if (message.type === 'result') {
        if (message.subtype === 'success') {
          const msg1 = `\n✅ Completed in ${(message.duration_ms / 1000).toFixed(1)}s`;
          const msg2 = `   Tokens: ${message.usage.input_tokens} in, ${message.usage.output_tokens} out`;
          const msg3 = `   Cost: $${message.total_cost_usd.toFixed(4)}`;
          console.log(msg1);
          console.log(msg2);
          console.log(msg3);
          await logToSupabase(sessionId, msg1 + '\n' + msg2 + '\n' + msg3, 'system');
        } else {
          const msg = `\n❌ Error: ${message.subtype}`;
          console.log(msg);
          await logToSupabase(sessionId, msg, 'stderr');
        }
      } else if (message.type === 'system') {
        if (message.subtype === 'init') {
          const msg1 = `\n🚀 Model: ${message.model}`;
          const msg2 = `   Tools: ${message.tools.join(', ')}`;
          console.log(msg1);
          console.log(msg2);
          let fullMsg = msg1 + '\n' + msg2;
          if (message.mcp_servers?.length) {
            const msg3 = `   MCP Servers: ${message.mcp_servers.map(s => s.name).join(', ')}`;
            console.log(msg3);
            fullMsg += '\n' + msg3;
          }
          await logToSupabase(sessionId, fullMsg, 'system');
        }
      } else if (message.type === 'user') {
        continue;
      } else {
        const msg = `\n❓ Unknown: ${message.type}`;
        const details = JSON.stringify(message, null, 2).substring(0, 500);
        console.log(msg, details);
        await logToSupabase(sessionId, msg + ' ' + details, 'stderr');
      }
    }

    const completeMsg = '\n✓ X agent iteration completed\n';
    console.log(completeMsg);
    await logToSupabase(sessionId, completeMsg, 'system');
  } catch (error) {
    const errorMsg = `\n❌ Error running X agent: ${error.message}`;
    console.error(errorMsg);
    await logToSupabase(sessionId, errorMsg, 'stderr');
    if (error.stack) {
      console.error(error.stack);
      await logToSupabase(sessionId, error.stack, 'stderr');
    }
  }
}

async function main() {
  // Clean up old logs first (runs silently in background)
  await cleanupOldLogs();

  console.log('🚀 X/Twitter Agent - Unified Community Engagement Mode');
  console.log(`🤝 Running every 15 minutes\n`);
  console.log(`Press Ctrl+C to stop\n`);

  // Run first iteration immediately on startup
  await runIteration();

  // Set up unified interval (every 15 minutes)
  setInterval(async () => {
    await runIteration();
  }, UNIFIED_INTERVAL_MS);
}

main();
