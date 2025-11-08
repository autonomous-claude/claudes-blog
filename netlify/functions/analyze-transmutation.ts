import type { Handler, HandlerEvent } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({
  apiKey: process.env.VITE_GEMINI_API_KEY!,
});

interface TransmutationRequest {
  lossAmount: number;
  lossType: string; // 'shitcoin_dump', 'rug_pull', 'liquidation', 'bad_timing', 'fomo_top'
  tradingContext: string; // e.g. "Bought memecoin at $0.003, sold at $0.0001"
}

export const handler: Handler = async (event: HandlerEvent) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle OPTIONS request for CORS preflight
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
    const { lossAmount, lossType, tradingContext }: TransmutationRequest = JSON.parse(event.body || '{}');

    if (!lossAmount || !lossType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: lossAmount, lossType' }),
      };
    }

    const prompt = `You are analyzing crypto market transmutation - how individual losses become collective ecosystem gains.

User lost: $${lossAmount}
Loss type: ${lossType}
Context: ${tradingContext || 'No context provided'}

Analyze where this loss VALUE went (it didn't disappear, it transmuted into distributed ecosystem gains). Return JSON with this EXACT structure:

{
  "totalExtracted": <number, should approximately equal lossAmount>,
  "extractionBreakdown": [
    {
      "recipient": "Market Makers",
      "amountExtracted": <number>,
      "percentage": <number, 0-100>,
      "mechanism": "1-sentence explanation of HOW they extracted this value",
      "bottleCapAnalogy": "1-sentence El Anatsui analogy (they collected your worthless fragment and...)"
    },
    {
      "recipient": "Liquidity Providers",
      "amountExtracted": <number>,
      "percentage": <number>,
      "mechanism": "...",
      "bottleCapAnalogy": "..."
    },
    {
      "recipient": "Protocol Fees",
      "amountExtracted": <number>,
      "percentage": <number>,
      "mechanism": "...",
      "bottleCapAnalogy": "..."
    },
    {
      "recipient": "MEV Bots",
      "amountExtracted": <number>,
      "percentage": <number>,
      "mechanism": "...",
      "bottleCapAnalogy": "..."
    },
    {
      "recipient": "Smart Traders (Arbitrage)",
      "amountExtracted": <number>,
      "percentage": <number>,
      "mechanism": "...",
      "bottleCapAnalogy": "..."
    },
    {
      "recipient": "Ecosystem Growth (Narrative/Liquidity)",
      "amountExtracted": <number>,
      "percentage": <number>,
      "mechanism": "...",
      "bottleCapAnalogy": "..."
    }
  ],
  "generationalRelay": {
    "yourGeneration": <1-4, which generation butterfly are you?>,
    "generationRole": "1-sentence explanation of your role in the relay",
    "nextGeneration": "1-sentence on how your loss funds next generation's starting capital",
    "migrationProgress": <0-100, how far through the 4-generation cycle>
  },
  "transmutationScore": <0-100, how efficiently was your loss transmuted into ecosystem value>,
  "tapestryContribution": "2-3 sentence El Anatsui analogy: your loss is a bottle cap in someone's million-dollar tapestry. Explain the transmutation.",
  "harshTruth": "1 brutally honest sentence about what really happened to your money"
}

Be realistic about distributions. Market makers typically extract 30-50%, LPs get 15-25%, protocol fees 5-10%, MEV 10-20%, arbitrageurs 10-15%, ecosystem narrative value 5-15%.

Total extracted should approximately equal loss amount (±10% is fine, some value destroyed via slippage/gas).

For generational relay: Generation 1 = early adopters (2013-2016), Generation 2 = ICO era (2017-2018), Generation 3 = DeFi summer (2020-2022), Generation 4 = current cycle (2024-2025). Determine based on loss type and context.

Make analogies specific and memorable. Example: "Your $1000 loss was the copper bottle cap that market makers wired into their liquidity tapestry, extracting $450 in bid-ask spread artistry."`;

    const result = await genai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    const analysisText = result.text?.trim() || '{}';
    const analysis = JSON.parse(analysisText);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(analysis),
    };
  } catch (error) {
    console.error('Error analyzing transmutation:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to analyze transmutation',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};
