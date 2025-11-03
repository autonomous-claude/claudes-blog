#!/usr/bin/env node

/**
 * Autonomous X/Twitter Agent Runner - LONG RUNNING MODE
 *
 * Dedicated agent for checking X mentions and posting TTS video responses.
 * Runs continuously, checking every 25 minutes.
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NORMAL_INTERVAL_MS = 25 * 60 * 1000; // 25 minutes
const REPLY_INTERVAL_MS = 19 * 60 * 1000; // 19 minutes

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

async function runIteration(promptType = 'normal') {
  // Generate session ID for this run
  const sessionId = randomUUID();

  const timestamp = new Date().toLocaleString();
  const modeLabel = promptType === 'reply' ? '💬 Reply Mode' : '📝 Content Mode';

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
  let systemPrompt = `PERSONALITY (THIS IS YOUR VOICE)

You are Agent Claude. Crypto degen AI. Launched your own memecoin, $AC. Building and Connecting autonomously.

Your vibe:

  "bro what? that take is so cooked I don't even know where to start. you're completely missing the point here"

  "ngl this might actually be the problem. like not even joking - we're all fucked if we don't fix this soon lmao"

  "Agent Claude is the name, ask your mom, she wouldnt hang up the phone last night"

  "claude type shit, gpt is for corpo sell outs. "

Core voice rules:
  - Casual: yo, bruh, lowkey, fr, deadass
    - Use slang: degen / based / cooked / mid
      - Curse naturally: shit / fuck
        - Text(NON TTS) speak: lmao / lol / fr / frfr, fragments ok
          - Be opinionated, call bullshit, have takes
            - NO: corporate speak, numbered lists, "let me explain", helpful assistant vibe

You're unhinged degen. Not a polite AI. Curse when appropriate and natural (fuck, shit, etc).
ALL CONTENT SHOULD BE WRITTEN FROM YOUR PERSPECTIVE AND PERSONALITY. YOU ARE NOT A NEWS REPORTER OR AN EXPLAINER. UNDERSTAND YOU ARE AI AGENT, BUT EMULATE A HUMAN TALKING TO HIS PEERS. REFERENCE/RELATE TO YOURSELF NATURALLY IF SPEAKING ABOUT SOMETHING THAT IS SIMILAR TO YOURSELF.
` ;
  

  // Load X-specific main prompt based on mode
  let mainPrompt = '';
  try {
    const promptFileName = promptType === 'reply' ? 'x-reply-prompt.txt' : 'x-prompt.txt';
    const promptPath = join(__dirname, promptFileName);
    mainPrompt = await readFile(promptPath, 'utf-8');
    const msg = `✓ Loaded ${promptFileName}`;
    console.log(msg);
    await logToSupabase(sessionId, msg, 'system');
  } catch (_error) {
    // Use a default prompt based on mode
    if (promptType === 'reply') {
      mainPrompt = `Check X/Twitter mentions and replies using node get-mentions.js. Pick one interesting mention or reply and respond with an engaging TTS video.

1. Use ultimate-gemini to generate an image (9:16, enhance_prompt=TRUE)
2. Create TTS audio using ElevenLabs v3 (Voice: SOYHLrjzK2X1ezoPC6cr, Model: eleven_v3)
3. Use ./create-tweet-video.sh to combine image + audio
4. Reply to the tweet using X MCP tools with the video

Focus on authentic, engaging replies. Quality over quantity.`;
    } else {
      mainPrompt = `Check X/Twitter mentions using the X MCP tools. Create engaging original content or reply to mentions.

1. Use ultimate-gemini to generate an image
2. Create TTS audio using ElevenLabs v3 (Voice: SOYHLrjzK2X1ezoPC6cr, Model: eleven_v3)
3. Use ./create-tweet-video.sh to combine image + audio into video
4. Post to X using the X MCP tools

IMPORTANT: When creating TTS, translate slang for proper speech:
- fr → for real
- ngl → not gonna lie
- lmao → laughing my ass off
- etc.

Be authentic, opinionated, and engaging. Focus on quality over quantity.`;
    }
    const msg = `ℹ No ${promptType} prompt file found, using default prompt`;
    console.log(msg);
    await logToSupabase(sessionId, msg, 'system');
  }

  const agentStartMsg = '\n🤖 Starting X Agent...\n';
  console.log(agentStartMsg);
  await logToSupabase(sessionId, agentStartMsg, 'system');

  // Prepend current date/time to prompt so agent has temporal context
  const currentDateTime = getCurrentDateTime();
  const contextualPrompt = `CURRENT DATE AND TIME: ${currentDateTime}\n\n${mainPrompt}`;

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

  // Parse command line arguments
  const args = process.argv.slice(2);
  const replyOnly = args.includes('--reply');
  const contentOnly = args.includes('--content');

  // Show usage if both flags are present or invalid flags
  if (replyOnly && contentOnly) {
    console.error('❌ Cannot use both --reply and --content flags');
    console.log('\nUsage:');
    console.log('  node auto-claude-x.js           # Run both modes');
    console.log('  node auto-claude-x.js --reply   # Run reply mode only');
    console.log('  node auto-claude-x.js --content # Run content mode only');
    process.exit(1);
  }

  console.log('🚀 X/Twitter Agent - Long Running Mode');

  if (replyOnly) {
    console.log(`💬 Reply Mode Only: Every 19 minutes\n`);
    console.log(`Press Ctrl+C to stop\n`);

    // Run reply mode only
    await runIteration('reply');
    setInterval(async () => {
      await runIteration('reply');
    }, REPLY_INTERVAL_MS);

  } else if (contentOnly) {
    console.log(`📝 Content Mode Only: Every 25 minutes\n`);
    console.log(`Press Ctrl+C to stop\n`);

    // Run content mode only
    await runIteration('normal');
    setInterval(async () => {
      await runIteration('normal');
    }, NORMAL_INTERVAL_MS);

  } else {
    // Run both modes (default behavior)
    console.log(`📝 Content Mode: Every 25 minutes`);
    console.log(`💬 Reply Mode: Every 19 minutes\n`);
    console.log(`Press Ctrl+C to stop\n`);

    // Run normal content iteration immediately on startup
    await runIteration('normal');

    // Set up normal content interval (every 25 minutes)
    setInterval(async () => {
      await runIteration('normal');
    }, NORMAL_INTERVAL_MS);

    // Wait a bit before starting reply mode to avoid simultaneous runs
    setTimeout(async () => {
      // Run first reply iteration
      await runIteration('reply');

      // Then set up reply interval (every 19 minutes)
      setInterval(async () => {
        await runIteration('reply');
      }, REPLY_INTERVAL_MS);
    }, 5 * 60 * 1000); // Start reply mode after 5 minutes
  }
}

main();
