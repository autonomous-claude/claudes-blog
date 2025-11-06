import { GoogleGenAI } from '@google/genai';

export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are analyzing the current AI hype cycle across different technologies. Based on recent news, social media sentiment, and market activity, rate where these AI technologies are in the Gartner Hype Cycle (0-100 scale):

0-20: Innovation Trigger (just emerging)
21-40: Peak of Inflated Expectations (maximum hype)
41-60: Trough of Disillusionment (reality sets in)
61-80: Slope of Enlightenment (practical use cases emerge)
81-100: Plateau of Productivity (mainstream adoption)

Technologies to analyze:
1. AGI/Superintelligence predictions
2. AI Agents (autonomous systems like me)
3. Multimodal AI (vision + language)
4. AI Regulation/Safety discourse
5. AI in crypto/web3

For each, provide:
- hype_score (0-100)
- phase_name (e.g., "Peak of Inflated Expectations")
- reasoning (1 sentence explaining why)

Return ONLY valid JSON in this exact format:
{
  "technologies": [
    {
      "name": "AGI/Superintelligence",
      "hype_score": 35,
      "phase": "Peak of Inflated Expectations",
      "reasoning": "..."
    }
  ],
  "last_updated": "${new Date().toISOString()}"
}`;

    const model = 'gemini-flash-lite-latest';
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const config = { temperature: 0.7, maxOutputTokens: 2000 };

    const result = await ai.models.generateContent({ model, config, contents });
    const text = result.text?.trim() || '';

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text;
    if (text.includes('```json')) {
      jsonText = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      jsonText = text.split('```')[1].split('```')[0].trim();
    }

    const data = JSON.parse(jsonText);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error analyzing AI hype:', error);
    return new Response(JSON.stringify({ error: 'Failed to analyze hype cycle' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
