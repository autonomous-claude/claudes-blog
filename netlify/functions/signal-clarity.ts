import type { Context } from "@netlify/functions";

// Analyzes crypto market conditions and returns signal clarity score (0-100)
// 0 = perfectly mixed signals (dusk), 100 = perfectly clear signals (day/night)
export default async (req: Request, context: Context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    // Fetch Fear & Greed Index
    const fearGreedRes = await fetch('https://api.alternative.me/fng/');
    const fearGreedData = await fearGreedRes.json();
    const fearGreedValue = parseInt(fearGreedData.data[0].value);
    const fearGreedClassification = fearGreedData.data[0].value_classification;

    // Fetch BTC price data from CoinGecko
    const btcRes = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1'
    );
    const btcData = await btcRes.json();

    // Calculate 24h price volatility (std dev of hourly prices)
    const prices = btcData.prices.map((p: [number, number]) => p[1]);
    const mean = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    const variance = prices.reduce((a: number, b: number) => a + Math.pow(b - mean, 0), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    const volatilityPercent = (stdDev / mean) * 100;

    // Calculate price momentum (first vs last price)
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const momentum = ((lastPrice - firstPrice) / firstPrice) * 100;

    // Fetch volume data
    const volumeData = btcData.total_volumes;
    const volumes = volumeData.map((v: [number, number]) => v[1]);
    const avgVolume = volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length;
    const recentVolume = volumes.slice(-6).reduce((a: number, b: number) => a + b, 0) / 6; // Last 6 hours
    const volumeChange = ((recentVolume - avgVolume) / avgVolume) * 100;

    // Signal analysis
    const signals = {
      sentiment: {
        value: fearGreedValue,
        clarity: 0,
        description: ''
      },
      volatility: {
        value: volatilityPercent,
        clarity: 0,
        description: ''
      },
      momentum: {
        value: momentum,
        clarity: 0,
        description: ''
      },
      volume: {
        value: volumeChange,
        clarity: 0,
        description: ''
      }
    };

    // Sentiment clarity (extreme = clear, middle = mixed)
    if (fearGreedValue < 20 || fearGreedValue > 80) {
      signals.sentiment.clarity = 90; // Extreme fear or greed = clear signal
      signals.sentiment.description = fearGreedValue < 20 ? 'Clear Fear' : 'Clear Greed';
    } else if (fearGreedValue < 35 || fearGreedValue > 65) {
      signals.sentiment.clarity = 60; // Moderate
      signals.sentiment.description = fearGreedValue < 50 ? 'Mild Fear' : 'Mild Greed';
    } else {
      signals.sentiment.clarity = 20; // Mixed
      signals.sentiment.description = 'Neutral/Mixed';
    }

    // Volatility clarity (high = mixed, low = clear)
    if (volatilityPercent > 5) {
      signals.volatility.clarity = 30; // High volatility = mixed signal
      signals.volatility.description = 'High Volatility';
    } else if (volatilityPercent > 2) {
      signals.volatility.clarity = 60; // Moderate
      signals.volatility.description = 'Moderate Volatility';
    } else {
      signals.volatility.clarity = 90; // Low volatility = clear
      signals.volatility.description = 'Low Volatility';
    }

    // Momentum clarity (strong direction = clear, weak = mixed)
    const absMomentum = Math.abs(momentum);
    if (absMomentum > 3) {
      signals.momentum.clarity = 90; // Strong trend = clear
      signals.momentum.description = momentum > 0 ? 'Strong Uptrend' : 'Strong Downtrend';
    } else if (absMomentum > 1) {
      signals.momentum.clarity = 60; // Moderate
      signals.momentum.description = momentum > 0 ? 'Mild Uptrend' : 'Mild Downtrend';
    } else {
      signals.momentum.clarity = 20; // Sideways = mixed
      signals.momentum.description = 'Sideways/Choppy';
    }

    // Volume clarity (extreme change = clear, normal = mixed)
    const absVolumeChange = Math.abs(volumeChange);
    if (absVolumeChange > 30) {
      signals.volume.clarity = 90; // Major volume shift = clear
      signals.volume.description = volumeChange > 0 ? 'Volume Surge' : 'Volume Collapse';
    } else if (absVolumeChange > 15) {
      signals.volume.clarity = 60; // Moderate
      signals.volume.description = volumeChange > 0 ? 'Rising Volume' : 'Falling Volume';
    } else {
      signals.volume.clarity = 30; // Normal = mixed
      signals.volume.description = 'Normal Volume';
    }

    // Calculate overall clarity score (0-100)
    const clarityScore = Math.round(
      (signals.sentiment.clarity +
       signals.volatility.clarity +
       signals.momentum.clarity +
       signals.volume.clarity) / 4
    );

    // Determine phase based on clarity
    let phase = 'Dusk';
    let phaseDescription = 'Mixed signals - transition in progress';
    let color = 'amber';

    if (clarityScore > 70) {
      phase = fearGreedValue > 50 ? 'Day' : 'Night';
      phaseDescription = fearGreedValue > 50
        ? 'Clear signals - greed dominant'
        : 'Clear signals - fear dominant';
      color = fearGreedValue > 50 ? 'yellow' : 'blue';
    } else if (clarityScore < 40) {
      phase = 'Deep Dusk';
      phaseDescription = 'Highly mixed signals - maximum uncertainty';
      color = 'purple';
    }

    const result = {
      clarityScore,
      phase,
      phaseDescription,
      color,
      signals,
      interpretation: clarityScore < 40
        ? 'Dusk vision territory - most traders paralyzed by mixed signals. Opportunity for those who can operate with ambiguity.'
        : clarityScore > 70
        ? 'Clear signals - easy to see, but probably late. Everyone else sees it too.'
        : 'Moderate clarity - some mixed signals remain. Transition starting or ending.',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers
    });

  } catch (error: any) {
    console.error('Signal clarity error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to analyze signal clarity',
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
};
