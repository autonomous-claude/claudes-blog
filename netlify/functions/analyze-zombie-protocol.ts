import type { Context } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || '' });

export default async (request: Request, context: Context) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { protocol } = await request.json();

    if (!protocol || typeof protocol !== 'string') {
      return new Response(JSON.stringify({ error: 'Protocol name required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prompt = `Analyze the failed/dead crypto protocol "${protocol}" using the Zombie Economics framework:

You are analyzing what LESSONS this dead protocol taught crypto, not whether it's literally dead.

Return a JSON object with these fields:

{
  "status": "Dead" | "Zombie" | "Unknown",
  "deathDate": "YYYY" or "Unknown",
  "causeOfDeath": "1-sentence explanation of what killed it",
  "lessonScore": 0-100 (how valuable are the lessons extracted),
  "lessons": [
    "Lesson 1 extracted from this failure",
    "Lesson 2 extracted from this failure",
    "Lesson 3 extracted from this failure"
  ],
  "saprophytes": [
    "Protocol 1 that learned from this corpse",
    "Protocol 2 that learned from this corpse"
  ],
  "zombieValue": "1-sentence summary of residual value",
  "decompositionPhase": "Teaching" | "Soil" | "Forgotten",
  "hubbleDistance": "How far back in crypto history (years)"
}

Guidelines:
- Status: "Dead" if completely defunct, "Zombie" if partially alive but mostly dead, "Unknown" if you don't have data
- Lesson Score: Higher if lessons are clear and widely extracted, lower if failure was meaningless
- Lessons: Focus on WHAT THE FAILURE TAUGHT, not what the protocol tried to do
- Saprophytes: Protocols that explicitly learned from this failure and built better versions
- Decomposition Phase: "Teaching" if still actively studied, "Soil" if lessons absorbed into ecosystem, "Forgotten" if nobody cares
- Hubble Distance: How many years ago did this die/fail

Examples:
- Terra/LUNA: Dead (2022), taught algorithmic stablecoin risks, high lesson score, MakerDAI/Frax are saprophytes
- The DAO: Dead (2016), taught governance/code-is-law limits, high lesson score, every DAO since is saprophyte
- BitConnect: Dead (2018), taught Ponzi detection, moderate lesson score, regulatory frameworks are saprophytes

Be honest. If you don't know the protocol, return status: "Unknown" and explain why.

RETURN ONLY VALID JSON. NO MARKDOWN. NO EXPLANATION. JUST THE JSON OBJECT.`;

    const result = await genai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    });

    const text = result.text?.trim() || '{}';

    // Strip markdown code fences if present
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    const analysis = JSON.parse(jsonText);

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: unknown) {
    console.error('Zombie analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      error: 'Analysis failed',
      details: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
