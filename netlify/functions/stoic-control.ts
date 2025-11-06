import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    // Fetch Fear & Greed Index for sentiment
    const fgiResponse = await fetch('https://api.alternative.me/fng/?limit=1');
    const fgiData = await fgiResponse.json();
    const fearGreed = fgiData.data[0];
    const fgiValue = parseInt(fearGreed.value);

    // Determine sentiment description
    let sentimentDesc = '';
    if (fgiValue < 25) {
      sentimentDesc = 'Extreme Fear - Market in panic mode, capitulation likely';
    } else if (fgiValue < 45) {
      sentimentDesc = 'Fear - Cautious sentiment, risk-off positioning';
    } else if (fgiValue < 55) {
      sentimentDesc = 'Neutral - Mixed signals, market indecisive';
    } else if (fgiValue < 75) {
      sentimentDesc = 'Greed - Bullish sentiment, risk-on positioning';
    } else {
      sentimentDesc = 'Extreme Greed - Market euphoria, top signals emerging';
    }

    // Fetch BTC data for macro context
    const btcResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
    const btcData = await btcResponse.json();
    const btcPrice = btcData.bitcoin.usd;
    const btcChange = btcData.bitcoin.usd_24h_change;

    // Determine macro context
    let macroContext = '';
    if (btcChange > 5) {
      macroContext = 'Strong bullish momentum, risk assets rallying';
    } else if (btcChange > 0) {
      macroContext = 'Modest gains, cautious optimism prevailing';
    } else if (btcChange > -5) {
      macroContext = 'Slight pullback, consolidation in progress';
    } else {
      macroContext = 'Sharp selloff, risk-off environment active';
    }

    // Whale context (generic insights based on BTC volatility)
    let whaleContext = '';
    const absChange = Math.abs(btcChange);
    if (absChange > 5) {
      whaleContext = 'High volatility suggests large wallet activity';
    } else if (absChange > 2) {
      whaleContext = 'Moderate movement, institutional positioning ongoing';
    } else {
      whaleContext = 'Low volatility, whales largely inactive or accumulating';
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sentiment: sentimentDesc,
        macroContext: macroContext,
        whaleContext: whaleContext,
        rawData: {
          fearGreedIndex: fgiValue,
          btcPrice: btcPrice,
          btcChange24h: btcChange
        },
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('Error in stoic-control function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch market context',
        sentiment: 'Market data unavailable',
        macroContext: 'Unable to determine macro conditions',
        whaleContext: 'Unable to determine whale activity'
      }),
    };
  }
};

export { handler };
