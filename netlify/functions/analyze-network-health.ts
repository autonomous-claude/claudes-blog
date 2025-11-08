import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

const handler: Handler = async (event: HandlerEvent) => {
  // Handle CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { protocolName } = JSON.parse(event.body || "{}");

    if (!protocolName) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Protocol name is required" }),
      };
    }

    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are analyzing blockchain network health using the "shrub vs redwood" framework from distributed systems theory.

SHRUB ARCHITECTURE (Resilient):
- Distributed nodes (no single point of failure)
- Geographic diversity (nodes worldwide)
- Client diversity (multiple implementations)
- Decentralized governance (no single authority)
- Horizontal scaling (more nodes, not bigger nodes)

REDWOOD ARCHITECTURE (Fragile):
- Centralized validators (few powerful nodes)
- Geographic concentration (all nodes in one region)
- Single client implementation (one codebase)
- Centralized governance (foundation controls upgrades)
- Vertical scaling (bigger nodes, fewer operators)

Analyze: ${protocolName}

Provide analysis in this exact JSON format:
{
  "shrubScore": <number 0-100, where 100 = maximally distributed/resilient>,
  "architecture": "<SHRUB or REDWOOD or HYBRID>",
  "validatorDistribution": "<description of node/validator distribution>",
  "geographicDistribution": "<description of geographic spread>",
  "clientDiversity": "<description of client implementation diversity>",
  "governanceStructure": "<description of governance centralization>",
  "resilience": "<one-line assessment of resilience to attacks/failures>",
  "fragility": "<one-line description of biggest single point of failure>",
  "droughtVulnerability": "<what 'drought' (regulatory, market, technical) kills this?>",
  "recommendation": "<HOLD (resilient), CAUTION (hybrid), or AVOID (fragile)>"
}

Be brutally honest. If a protocol is centralized, say so. If it's resilient, explain why.`;

    const model = "gemini-flash-lite-latest";
    const contents = [{ role: "user", parts: [{ text: prompt }] }];
    const config = { temperature: 0.7, maxOutputTokens: 2000 };

    const result = await ai.models.generateContent({ model, config, contents });
    let analysisText = result.text?.trim() || "";

    // Extract JSON from markdown code blocks if present
    if (analysisText.includes("```json")) {
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        analysisText = jsonMatch[1];
      }
    } else if (analysisText.includes("```")) {
      const codeMatch = analysisText.match(/```\n([\s\S]*?)\n```/);
      if (codeMatch) {
        analysisText = codeMatch[1];
      }
    }

    const analysis = JSON.parse(analysisText);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(analysis),
    };
  } catch (error: unknown) {
    console.error("Error analyzing network health:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Failed to analyze network health",
        details: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};

export { handler };
