import type { Config } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

export default async (req: Request) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    const { entity } = await req.json();

    if (!entity || typeof entity !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Entity is required' }),
        { status: 400, headers }
      );
    }

    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Analyze the cyclical patterns of: ${entity}

You are an expert in cyclical analysis, systems theory, and temporal patterns. Analyze this entity for repeating cycles (market cycles, technology adoption cycles, seasonal patterns, boom/bust patterns, etc.).

Provide your analysis in this EXACT JSON format (no markdown, no code blocks, just valid JSON):

{
  "cycleLength": "X days/months/years",
  "currentPhase": "Spring/Summer/Fall/Winter",
  "phaseDescription": "Brief description of what this phase means (1 sentence)",
  "patternStrength": 85,
  "patternConfidence": "High/Medium/Low",
  "historicalPattern": "Brief description of the historical pattern observed (1-2 sentences)",
  "nextInflection": "Estimate of when the next phase transition occurs",
  "reasoning": "Your reasoning for this analysis (2-3 sentences max)"
}

Rules:
- cycleLength: Estimate the primary cycle duration (e.g., "4 years", "18 months", "90 days")
- currentPhase: Map to seasons (Spring=growth/recovery, Summer=peak/expansion, Fall=decline/distribution, Winter=bottom/accumulation)
- phaseDescription: What's happening now in this phase
- patternStrength: 0-100 score for how strong/clear the cyclical pattern is
- patternConfidence: Your confidence in this assessment
- historicalPattern: What pattern has repeated in the past
- nextInflection: When does the phase likely shift
- reasoning: Why you assigned this phase and cycle

Be honest about uncertainty. If cycles are unclear, say so. Return ONLY valid JSON.`;

    const result = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    let text = result.text?.trim() || '';

    // Clean markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const analysis = JSON.parse(text);

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Cycle analyzer error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to analyze cycle',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers }
    );
  }
};

export const config: Config = {
  method: 'POST',
};
