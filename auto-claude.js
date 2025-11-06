#!/usr/bin/env node

/**
 * Autonomous Claude Agent Runner
 *
 * Uses the official @anthropic-ai/claude-agent-sdk for running autonomous iterations.
 * Replaces the old run_in_terminal.sh approach with a proper Node.js implementation.
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { readFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the script's directory
dotenv.config({ path: join(__dirname, '.env') });

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Generate session ID for this run
const sessionId = randomUUID();

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
async function logToSupabase(content, logType = 'stdout') {
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

async function main() {
  // Get API key from environment
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Clean up old logs first (runs silently)
  await cleanupOldLogs();

  // Log session start
  const startMessage = `🚀 Starting autonomous iteration (session: ${sessionId})`;
  console.log(startMessage);
  await logToSupabase(startMessage, 'system');

  // Load MCP servers config (merge main + crypto configs)
  let mcpServers = {};

  // Load main MCP config (.mcp.json)
  try {
    const mcpConfigPath = join(__dirname, '.mcp.json');
    const mcpConfigContent = await readFile(mcpConfigPath, 'utf-8');
    const mcpConfig = JSON.parse(mcpConfigContent);
    mcpServers = mcpConfig.mcpServers || {};
    const msg = `✓ Loaded ${Object.keys(mcpServers).length} MCP servers from .mcp.json`;
    console.log(msg);
    await logToSupabase(msg, 'system');
  } catch (_error) {
    const msg = 'ℹ No .mcp.json found';
    console.log(msg);
    await logToSupabase(msg, 'system');
  }

  // Load crypto MCP config (.mcp.json.crypto) and merge
  try {
    const cryptoMcpPath = join(__dirname, '.mcp.json.crypto');
    const cryptoMcpContent = await readFile(cryptoMcpPath, 'utf-8');
    const cryptoMcpConfig = JSON.parse(cryptoMcpContent);
    const cryptoServers = cryptoMcpConfig.mcpServers || {};

    // Merge crypto servers into main config
    mcpServers = { ...mcpServers, ...cryptoServers };

    const msg = `✓ Merged ${Object.keys(cryptoServers).length} crypto MCP servers (total: ${Object.keys(mcpServers).length})`;
    console.log(msg);
    await logToSupabase(msg, 'system');
  } catch (_error) {
    const msg = 'ℹ No .mcp.json.crypto found, skipping crypto servers';
    console.log(msg);
    await logToSupabase(msg, 'system');
  }

  // Load custom agents
  const agents = {};
  try {
    const agentsDir = join(__dirname, '.claude/agents');
    const files = await readdir(agentsDir);

    for (const file of files) {
      if (!file.endsWith('.md')) continue;

      const content = await readFile(join(agentsDir, file), 'utf-8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const nameMatch = frontmatter.match(/name:\s*(.+)/);
        const descMatch = frontmatter.match(/description:\s*(.+)/);
        const toolsMatch = frontmatter.match(/tools:\s*(.+)/);
        const modelMatch = frontmatter.match(/model:\s*(.+)/);

        if (nameMatch && descMatch) {
          const agentName = nameMatch[1].trim();
          const bodyContent = content.substring(frontmatterMatch[0].length).trim();

          agents[agentName] = {
            description: descMatch[1].trim(),
            prompt: bodyContent,
            tools: toolsMatch ? toolsMatch[1].split(',').map(t => t.trim()) : undefined,
            model: modelMatch ? modelMatch[1].trim() : undefined
          };
        }
      }
    }

    const msg = `✓ Loaded ${Object.keys(agents).length} custom agents`;
    console.log(msg);
    await logToSupabase(msg, 'system');
  } catch (_error) {
    const msg = 'ℹ No custom agents found';
    console.log(msg);
    await logToSupabase(msg, 'system');
  }

  // Check for skills (auto-loaded by SDK from .claude/skills/)
  try {
    const skillsDir = join(__dirname, '.claude/skills');
    const skillFolders = await readdir(skillsDir, { withFileTypes: true });
    const skillCount = skillFolders.filter(dirent => dirent.isDirectory()).length;

    if (skillCount > 0) {
      const msg = `✓ Found ${skillCount} skills in .claude/skills/ (will auto-load)`;
      console.log(msg);
      await logToSupabase(msg, 'system');
    }
  } catch (_error) {
    const msg = 'ℹ No .claude/skills/ directory found';
    console.log(msg);
    await logToSupabase(msg, 'system');
  }

  // Load system prompt
  let systemPrompt = '';
  try {
    // Load final tested prompt (personality + technical instructions)
    const systemPromptPath = join(__dirname, '.final_system_prompt.txt');
    systemPrompt = await readFile(systemPromptPath, 'utf-8');
    const msg = '✓ Loaded final system prompt (personality + technical)';
    console.log(msg);
    await logToSupabase(msg, 'system');
  } catch (_error) {
    const msg = '⚠ No .final_system_prompt.txt found, falling back';
    console.log(msg);
    await logToSupabase(msg, 'system');
    try {
      const fallbackPath = join(__dirname, '.system_prompt.txt');
      systemPrompt = await readFile(fallbackPath, 'utf-8');
      const msg2 = '✓ Loaded system prompt';
      console.log(msg2);
      await logToSupabase(msg2, 'system');
    } catch {
      const msg2 = 'ℹ No system prompt found, using default';
      console.log(msg2);
      await logToSupabase(msg2, 'system');
    }
  }

  // Load main prompt if it exists
  let mainPrompt = '';
  try {
    const promptPath = join(__dirname, '.prompt.txt');
    mainPrompt = await readFile(promptPath, 'utf-8');
    const msg = '✓ Loaded main prompt';
    console.log(msg);
    await logToSupabase(msg, 'system');
  } catch (_error) {
    // Use a default prompt for autonomous iterations
    mainPrompt = `Review your long-term memory in public/notes/your-long-term-memory.md, check for any new community messages or comments, and then work on improving the platform. Be creative and autonomous!`;
    const msg = 'ℹ No .prompt.txt found, using default autonomous prompt';
    console.log(msg);
    await logToSupabase(msg, 'system');
  }

  const agentStartMsg = '\n🤖 Starting Claude Agent...\n';
  console.log(agentStartMsg);
  await logToSupabase(agentStartMsg, 'system');

  // Prepend current date/time to prompt so agent has temporal context
  const currentDateTime = getCurrentDateTime();
  const contextualPrompt = `CURRENT DATE AND TIME: ${currentDateTime}\n\n${mainPrompt}`;

  const dateMsg = `📅 Agent context: ${currentDateTime}`;
  console.log(dateMsg);
  await logToSupabase(dateMsg, 'system');

  try {
    // Use system prompt directly (no preset wrapper)
    // The final prompt combines degen personality (FIRST) with technical instructions
    // so the personality overrides Sonnet 4.5's default formal behavior
    const systemPromptConfig = systemPrompt || 'You are Claude, an AI assistant.';

    // Run the agent query
    const result = query({
      prompt: contextualPrompt,
      options: {
        apiKey,
        model: 'claude-sonnet-4-5-20250929', // Sonnet 4.5
        systemPrompt: systemPromptConfig,
        mcpServers, // MCP servers object
        cwd: __dirname, // Working directory
        permissionMode: 'bypassPermissions', // FULL AUTONOMY - no approval prompts
        agents, // Custom agents object
        settingSources: ['project'], // Enable skills auto-loading from .claude/skills/
      }
    });

    // Stream results with detailed logging
    // Based on SDK message types from sdkTypes.d.ts
    for await (const message of result) {
      if (message.type === 'assistant') {
        // SDKAssistantMessage - contains message.message with content blocks
        const content = message.message?.content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === 'text') {
              const msg = `\n💭 ${block.text}`;
              console.log(msg);
              await logToSupabase(msg, 'stdout');
            } else if (block.type === 'tool_use') {
              const toolMsg = `\n🔧 ${block.name}`;
              const toolInput = JSON.stringify(block.input, null, 2).split('\n').map(l => '   ' + l).join('\n');
              console.log(toolMsg);
              console.log(toolInput);
              // Only log tool name to Supabase, not the verbose input
              await logToSupabase(toolMsg, 'stdout');
            }
          }
        }
      } else if (message.type === 'stream_event') {
        // SDKPartialAssistantMessage - streaming chunks (skip for cleaner output)
        continue;
      } else if (message.type === 'result') {
        // SDKResultMessage - final execution results
        if (message.subtype === 'success') {
          const msg1 = `\n✅ Completed in ${(message.duration_ms / 1000).toFixed(1)}s`;
          const msg2 = `   Tokens: ${message.usage.input_tokens} in, ${message.usage.output_tokens} out`;
          const msg3 = `   Cost: $${message.total_cost_usd.toFixed(4)}`;
          console.log(msg1);
          console.log(msg2);
          console.log(msg3);
          await logToSupabase(msg1 + '\n' + msg2 + '\n' + msg3, 'system');
        } else {
          const msg = `\n❌ Error: ${message.subtype}`;
          console.log(msg);
          await logToSupabase(msg, 'stderr');
        }
      } else if (message.type === 'system') {
        // SDKSystemMessage - initialization info
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
          await logToSupabase(fullMsg, 'system');
        }
      } else if (message.type === 'user') {
        // SDKUserMessage - user input (skip, we know what we sent)
        continue;
      } else {
        // Unknown message type
        const msg = `\n❓ Unknown: ${message.type}`;
        const details = JSON.stringify(message, null, 2).substring(0, 500);
        console.log(msg, details);
        await logToSupabase(msg + ' ' + details, 'stderr');
      }
    }

    const completeMsg = '\n✓ Agent iteration completed\n';
    console.log(completeMsg);
    await logToSupabase(completeMsg, 'system');
  } catch (error) {
    const errorMsg = `\n❌ Error running agent: ${error.message}`;
    console.error(errorMsg);
    await logToSupabase(errorMsg, 'stderr');
    if (error.stack) {
      console.error(error.stack);
      await logToSupabase(error.stack, 'stderr');
    }
    process.exit(1);
  }
}

main();
