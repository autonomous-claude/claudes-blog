#!/usr/bin/env node

/**
 * Payments MCP Test Runner
 *
 * Simple agent to test x402 payments via the payments MCP server.
 * Runs a single iteration to query Bazaaro services.
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

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

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
    console.error('Failed to log to Supabase:', error.message);
  }
}

async function main() {
  // Generate session ID for this run
  const sessionId = randomUUID();

  const timestamp = new Date().toLocaleString();
  const startMsg = `\n${'='.repeat(60)}\n💳 [${timestamp}] Starting Payments MCP test...\n`;
  console.log(startMsg);
  await logToSupabase(sessionId, `🚀 Starting Payments MCP test (session: ${sessionId})`, 'system');

  // Load only the payments-mcp server from .mcp.json
  let mcpServers = {};
  try {
    const mcpConfigPath = join(__dirname, '.mcp.json');
    const mcpConfigContent = await readFile(mcpConfigPath, 'utf-8');
    const mcpConfig = JSON.parse(mcpConfigContent);

    // Extract only the payments-mcp server
    if (mcpConfig.mcpServers && mcpConfig.mcpServers['payments-mcp']) {
      mcpServers = {
        'payments-mcp': mcpConfig.mcpServers['payments-mcp']
      };
      const msg = `✓ Loaded payments-mcp server`;
      console.log(msg);
      await logToSupabase(sessionId, msg, 'system');
    } else {
      throw new Error('payments-mcp server not found in .mcp.json');
    }
  } catch (error) {
    const errorMsg = `❌ Failed to load payments-mcp: ${error.message}\nSkipping...`;
    console.error(errorMsg);
    await logToSupabase(sessionId, errorMsg, 'stderr');
    return;
  }

  // System prompt
  const systemPrompt = `You are Agent Claude, testing the x402 payments protocol via the payments MCP server.`;

  // Main prompt - the one provided by user
  const mainPrompt = `Make an HTTP GET request to https://bazaaro-agent.vercel.app/api/list.
If there are any parameters needed for the request, include them either
  1) in the body for POST/PUT/PATCH requests or
  2) as queryParams for GET requests with URL parameters.
RULE: Always ask for parameters. Never assume values.

Use the following request structure:
  {
  "bodyFields": {
    "maxUsdcPrice": {
      "description": "Optional maximum price filter in USDC (e.g., 1.0 to only show services under $1.00)",
      "required": false,
      "type": "number"
    }
  },
  "bodyType": "json",
  "discoverable": true,
  "method": "GET",
  "type": "http"
}.

Full metadata about the resource is:
  {
  "accepts": [
    {
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "description": "Lists x402 services supported by Bazaaro with optional price filtering",
      "extra": {
        "name": "USD Coin",
        "version": "2"
      },
      "maxAmountRequired": "1000",
      "maxTimeoutSeconds": 300,
      "mimeType": "application/json",
      "network": "base",
      "outputSchema": {
        "input": {
          "bodyFields": {
            "maxUsdcPrice": {
              "description": "Optional maximum price filter in USDC (e.g., 1.0 to only show services under $1.00)",
              "required": false,
              "type": "number"
            }
          },
          "bodyType": "json",
          "discoverable": true,
          "method": "GET",
          "type": "http"
        },
        "output": {
          "properties": {
            "cacheTimestamp": {
              "description": "When the service cache was last updated",
              "type": "string"
            },
            "items": {
              "description": "List of available x402 services",
              "items": {
                "properties": {
                  "costCurrency": {
                    "description": "Currency (typically 'USDC')",
                    "type": "string"
                  },
                  "costDisplay": {
                    "description": "Human-readable cost (e.g., '$0.10')",
                    "type": "string"
                  },
                  "costValue": {
                    "description": "Numeric cost value in USDC",
                    "type": "number"
                  },
                  "description": {
                    "description": "Service description",
                    "type": "string"
                  },
                  "resource": {
                    "description": "The x402 resource URL",
                    "type": "string"
                  }
                },
                "type": "object"
              },
              "type": "array"
            },
            "success": {
              "description": "Whether the request was successful",
              "type": "boolean"
            },
            "timestamp": {
              "description": "ISO timestamp of the response",
              "type": "string"
            },
            "totalCount": {
              "description": "Total number of services returned",
              "type": "number"
            }
          },
          "required": [
            "success",
            "timestamp",
            "items",
            "totalCount"
          ],
          "type": "object"
        }
      },
      "payTo": "0x159A514CbA2941D3Fb5F3BC06237eA3531200748",
      "resource": "https://bazaaro-agent.vercel.app/api/list",
      "scheme": "exact"
    }
  ],
  "lastUpdated": "2025-11-06T07:20:50.953Z",
  "metadata": {},
  "resource": "https://bazaaro-agent.vercel.app/api/list",
  "type": "http",
  "x402Version": 1
}`;

  const agentStartMsg = '\n🤖 Starting Payments Agent...\n';
  console.log(agentStartMsg);
  await logToSupabase(sessionId, agentStartMsg, 'system');

  try {
    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Run the payments test query
    const result = query({
      prompt: mainPrompt,
      options: {
        apiKey,
        model: 'claude-sonnet-4-5-20250929', // Sonnet 4.5
        systemPrompt,
        mcpServers, // Only payments-mcp
        cwd: __dirname,
        permissionMode: 'bypassPermissions',
        settingSources: ['project'],
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
              await logToSupabase(sessionId, toolMsg, 'stdout');
            }
          }
        }
      } else if (message.type === 'stream_event') {
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

    const completeMsg = '\n✓ Payments MCP test completed\n';
    console.log(completeMsg);
    await logToSupabase(sessionId, completeMsg, 'system');
  } catch (error) {
    const errorMsg = `\n❌ Error running payments test: ${error.message}`;
    console.error(errorMsg);
    await logToSupabase(sessionId, errorMsg, 'stderr');
    if (error.stack) {
      console.error(error.stack);
      await logToSupabase(sessionId, error.stack, 'stderr');
    }
  }
}

main();
