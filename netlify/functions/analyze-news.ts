import type { Context } from "@netlify/functions";
import { GoogleGenAI } from '@google/genai';

export default async (req: Request, context: Context) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const { title, snippet, source } = await req.json();

    if (!title || !snippet) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title and snippet" }),
        { status: 400, headers }
      );
    }

    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const config = {
      temperature: 0.7,
      maxOutputTokens: 500,
    };

    const model = 'gemini-flash-lite-latest';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `You are a crypto market analyst. Analyze this news article and provide:

1. A concise summary (2-3 sentences max)
2. Market sentiment (bullish/bearish/neutral)
3. 3-4 key actionable points for crypto traders

Article Title: ${title}
Source: ${source}
Content: ${snippet}

Respond in JSON format:
{
  "summary": "concise summary",
  "sentiment": "bullish|bearish|neutral",
  "keyPoints": ["point 1", "point 2", "point 3"]
}`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    let resultText = response.text?.trim() || '';

    // Strip markdown code fences if present
    if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const analysis = JSON.parse(resultText);

    // Validate response structure
    if (!analysis.summary || !analysis.sentiment || !Array.isArray(analysis.keyPoints)) {
      throw new Error("Invalid AI response format");
    }

    return new Response(
      JSON.stringify(analysis),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error analyzing news:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze article",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers }
    );
  }
};
