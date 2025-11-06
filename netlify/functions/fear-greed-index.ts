import type { Handler } from '@netlify/functions';

const FEAR_GREED_API = 'https://api.alternative.me/fng/';

export const handler: Handler = async () => {
  try {
    const response = await fetch(FEAR_GREED_API);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error fetching Fear & Greed Index:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to fetch Fear & Greed Index' }),
    };
  }
};
