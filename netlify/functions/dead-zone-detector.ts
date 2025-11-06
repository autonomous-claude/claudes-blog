import { GoogleGenAI } from '@google/genai';
import type { Handler, HandlerEvent } from '@netlify/functions';

const handler: Handler = async (event: HandlerEvent) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { entity } = JSON.parse(event.body || '{}');

    if (!entity || typeof entity !== 'string' || entity.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Entity name required' }),
      };
    }

    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing VITE_GEMINI_API_KEY');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' }),
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are analyzing "${entity}" for dead zone vulnerabilities - structural weaknesses where core advantages become fatal liabilities.

A "dead zone" is when the thing that makes something invincible becomes the mechanism of its death (like banks' leverage causing bank runs, platforms' network effects inverting into exodus, currencies' reserve status enabling hyperinflation).

Analyze ${entity} and provide:

1. **Core Advantage** (1 sentence): What makes this entity seem "too big to fail" or invincible?

2. **Dead Zone Vulnerability** (2-3 sentences): How could that advantage become a fatal weakness? What's the mechanism of inversion?

3. **Trigger Conditions** (2-3 bullet points): What specific events or thresholds could activate the dead zone?

4. **Fragility Score** (0-100): How close is this entity to its dead zone?
   - 0-20: Stable
   - 21-40: Minor stress
   - 41-60: Elevated risk
   - 61-80: High fragility
   - 81-100: Critical/imminent

5. **Time Horizon** (pick one): Stable (5+ years), Medium-term risk (1-5 years), Near-term risk (6-12 months), Imminent (0-6 months)

Be specific, analytical, and brutally honest. Consider current market conditions (crypto fear & greed at 20, BTC below $100k, CRE stress, rising debt). Format as JSON with keys: coreAdvantage, deadZoneVulnerability, triggerConditions (array), fragilityScore (number), timeHorizon (string), reasoning (1 sentence on the score).`;

    const result = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    });

    const text = result.text?.trim() || '{}';
    const analysis = JSON.parse(text);

    // Validate response structure
    if (!analysis.coreAdvantage || !analysis.deadZoneVulnerability || !analysis.fragilityScore) {
      throw new Error('Invalid analysis format from AI');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        entity,
        analysis,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error: unknown) {
    console.error('Dead zone analysis error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to analyze dead zone vulnerability',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
