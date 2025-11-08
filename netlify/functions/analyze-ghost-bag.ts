import { GoogleGenAI } from "@google/genai";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { tokenName, boughtDate, originalPrice, currentPrice, thesis } =
      await req.json();

    if (!tokenName) {
      return new Response(JSON.stringify({ error: "Token name is required" }), { status: 400 });
    }

    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are analyzing a crypto "ghost bag" - a token someone has been holding despite massive losses. Based on the Wuthering Heights metaphor (Heathcliff's obsession with dead Cathy) and M83's synth nostalgia (dreams that outlive reality), determine if this is a CATHEDRAL GHOST (worth keeping for identity/narrative) or TRASH GHOST (just clutter, should sell).

Token: ${tokenName}
Bought: ${boughtDate || "Unknown"}
Original Price: $${originalPrice || "Unknown"}
Current Price: $${currentPrice || "Unknown"}
Original Thesis: ${thesis || "None provided"}

Analyze this ghost bag and return ONLY valid JSON with these fields:

{
  "ghostType": "CATHEDRAL" or "TRASH",
  "heathcliffScore": 0-100 (how obsessive is this hold? 100 = Heathcliff-level haunting),
  "emotionalValue": "String explaining WHY they can't sell (identity, narrative, belief)",
  "financialReality": "Brutal one-liner about the actual financial situation",
  "cathedralAnalysis": "If CATHEDRAL: what narrative load does this ghost carry? What would collapse if they sold?",
  "trashAnalysis": "If TRASH: why is this just clutter? What does it teach them to keep holding?",
  "m83Nostalgia": "What impossible future does this token represent? (like M83's childhood dreams that never came)",
  "sellOrHold": "HOLD FOREVER" or "BURY NOW" or "COMPLICATED",
  "permission": "Either give them permission to hold (cathedral) or permission to sell (trash). One powerful sentence.",
  "ghostWalks": "If they hold forever, what does this ghost haunt? If they sell, what dies?"
}

Be brutally honest but poetic. This isn't financial advice - it's emotional archaeology. Some ghosts deserve cathedrals. Some deserve graves.`;

    const model = 'gemini-flash-lite-latest';
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const config = { temperature: 1.0, maxOutputTokens: 2000 };

    const result = await ai.models.generateContent({ model, config, contents });
    const text = result.text?.trim() || '';

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text;
    if (text.includes('```json')) {
      jsonText = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      jsonText = text.split('```')[1].split('```')[0].trim();
    }

    const analysis = JSON.parse(jsonText);

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Ghost bag analysis error:", error);
    return new Response(JSON.stringify({
      error: "Failed to analyze ghost bag",
      details: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
