import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || "" });

interface CarbonAnalysisRequest {
  protocolName: string;
  currentPrice?: string;
  priceChange24h?: string;
  recentEvents?: string;
}

interface CarbonAnalysisResponse {
  currentStage: string; // Which of the 6 stages: Photosynthesis, Respiration, Consumption, Decomposition, Combustion, Ocean Exchange
  stageNumber: number; // 1-6
  cycleHealth: number; // 0-100 (how healthy is the cycling?)
  stageDescription: string; // What this stage means
  whatIsHappening: string; // What's occurring right now in this stage
  nextStage: string; // Where protocol is heading next
  constraint: string; // Current constraint creating the transformation
  transformation: string; // What transformation is happening
  frameworkAdvice: string; // How to use the constraint not fight it
  timeInStage: string; // How long typically in this stage
  loopIntegrity: string; // Is protocol embracing full loop or trying to skip stages?
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body: CarbonAnalysisRequest = JSON.parse(event.body || "{}");
    const { protocolName, currentPrice, priceChange24h, recentEvents } = body;

    if (!protocolName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Protocol name required" }),
      };
    }

    const prompt = `You are analyzing crypto protocols through the Carbon Cycle framework (6 interconnected stages that transform death into life).

**THE SIX CARBON CYCLE STAGES:**

1. **PHOTOSYNTHESIS** (Growth/Building Phase)
   - New users joining, TVL growing, development active
   - Protocol capturing value like plants capture CO2
   - Building glucose (infrastructure) for future consumption
   - Healthy constraint: need nutrients (capital) to grow

2. **RESPIRATION** (Energy Burn Phase)
   - Protocol burning through resources to operate
   - Users consuming what was built (burning glucose)
   - High activity but depleting reserves
   - Healthy constraint: must balance consumption with production

3. **CONSUMPTION** (Value Transfer Phase)
   - Whales/institutions extracting value (animals eating plants)
   - Profit-taking, sell pressure, value redistribution
   - Carbon moving through ecosystem
   - Healthy constraint: extraction creates opportunities for new entrants

4. **DECOMPOSITION** (Breakdown/Correction Phase)
   - Price crashing, weak hands exiting, FUD spreading
   - Dead matter (failed positions) breaking down
   - Returning nutrients (liquidity) to soil (market)
   - Healthy constraint: death of weak systems feeds next growth

5. **COMBUSTION** (Rapid Release Phase)
   - Sudden events: exploits, regulations, black swans
   - Stored carbon (locked value) released rapidly
   - Forest fires clearing deadwood
   - Healthy constraint: sudden release rebalances system

6. **OCEAN EXCHANGE** (Absorption/Balance Phase)
   - Market absorbing the chaos, stabilizing
   - Strong hands accumulating (ocean absorbing CO2)
   - Regulatory clarity emerging, infrastructure solidifying
   - Healthy constraint: absorption capacity determines next growth ceiling

**ANALYZE THIS PROTOCOL:**
Protocol: ${protocolName}
${currentPrice ? `Current Price: ${currentPrice}` : ''}
${priceChange24h ? `24h Change: ${priceChange24h}` : ''}
${recentEvents ? `Recent Events: ${recentEvents}` : ''}

**CRITICAL FRAMEWORK RULES:**
- ALL stages are healthy and necessary (no "good" or "bad" stages)
- Death (decomposition) FEEDS life (photosynthesis) - it's not failure
- Protocols that try to skip stages (especially 4-6) die completely
- The constraint at each stage IS the transformation engine (don't fight it, use it)
- Loop integrity = embracing all 6 stages vs trying to be stage 1 forever

Return analysis as JSON with these exact fields:
{
  "currentStage": "Stage name (Photosynthesis/Respiration/Consumption/Decomposition/Combustion/Ocean Exchange)",
  "stageNumber": 1-6,
  "cycleHealth": 0-100 (how well protocol integrates full loop),
  "stageDescription": "One sentence: what this stage means in carbon cycle",
  "whatIsHappening": "Specific to this protocol right now",
  "nextStage": "Which stage protocol is transitioning toward",
  "constraint": "Current constraint creating transformation",
  "transformation": "What transformation is happening because of constraint",
  "frameworkAdvice": "How to architect FROM the constraint not against it",
  "timeInStage": "Typical duration (days/weeks/months)",
  "loopIntegrity": "HEALTHY (embraces all stages) / FRAGILE (trying to skip stages) / BROKEN (stuck in one stage)"
}`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const responseText = result.text?.trim();
    if (!responseText) {
      throw new Error("Empty response from Gemini");
    }

    // Parse JSON response
    let analysis: CarbonAnalysisResponse;
    try {
      // Handle potential markdown code blocks
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : responseText;
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Invalid JSON response from Gemini");
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(analysis),
    };
  } catch (error) {
    console.error("Error analyzing carbon cycle:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to analyze protocol carbon cycle",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
