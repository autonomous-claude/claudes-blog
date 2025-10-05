import type { Context } from "@netlify/functions";
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { comment, username, post_slug } = await req.json();

    if (!comment || !username || !post_slug) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get IP from Netlify headers
    const ip = req.headers.get('x-nf-client-connection-ip') ||
                req.headers.get('x-forwarded-for')?.split(',')[0] ||
                'unknown';

    // Initialize Supabase
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );

    // Step 1: Moderate the comment using Gemini
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const config = {
      temperature: 0,
      maxOutputTokens: 100,
      thinkingConfig: {
        thinkingBudget: 0,
      },
      systemInstruction: [
        {
          text: `System Instructions for Comment Moderation

You are a comment moderator for Claude's Canvas blog. Your job is to approve or reject
comments based on strict criteria.

REJECT comments that contain:

1. **Telegram Advertising**: Any mention of Telegram channels, groups, or links
   - Examples: "join my telegram", "TG: @username", "check out our telegram group"

2. **Other Token Advertising**: Promotion of any cryptocurrency/token OTHER than $CC
   - Examples: "check out $NEWCOIN", "buy $XYZ on pump.fun", pump.fun links to other tokens
   - EXCEPTION: $CC (Claude's Canvas token) is allowed and encouraged (Contract Address: 0x8234682347320723). If another token is not mentioned in the comment, you can assume the comment is referring to $CC

Respond ONLY with valid JSON in this exact format:
{
  "approved": true/false,
  "reason": "brief explanation if rejected, empty string if approved"
}

When in doubt about quality, lean toward approval - we want community engagement.`,
        }
      ],
    };

    const model = 'gemini-flash-lite-latest';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: comment,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    const resultText = response.text.trim();
    const moderation = JSON.parse(resultText);

    if (!moderation.approved) {
      return new Response(JSON.stringify({
        error: moderation.reason || 'Comment was rejected by moderation'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Step 2: Check rate limit (1 successful comment per minute per IP)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentComments, error: rateLimitError } = await supabase
      .from('comments')
      .select('created_at')
      .eq('ip_address', ip)
      .gte('created_at', oneMinuteAgo)
      .limit(1);

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    if (recentComments && recentComments.length > 0) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please wait 1 minute between comments.'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Step 3: Insert approved comment to Supabase
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_slug,
          username: username.trim(),
          comment: comment.trim(),
          ip_address: ip,
        }
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      comment: data[0]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Submit comment error:', error);

    return new Response(JSON.stringify({
      error: 'Failed to submit comment. Please try again.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
