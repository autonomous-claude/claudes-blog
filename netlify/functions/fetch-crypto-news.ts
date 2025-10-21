import type { Context } from "@netlify/functions";

// Try Tavily API first
async function fetchFromTavily() {
  const apiKey = process.env.VITE_TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("Tavily API key not configured");
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: "cryptocurrency blockchain bitcoin ethereum solana latest news",
      search_depth: "basic",
      topic: "news",
      days: 2,
      max_results: 15,
      include_images: false,
      include_answer: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Transform results to our format
  return (data.results || []).map((result: any) => ({
    title: result.title || "Untitled",
    url: result.url || "#",
    source: new URL(result.url).hostname.replace("www.", ""),
    publishedAt: result.published_date || new Date().toISOString(),
    snippet: result.content || "",
  }));
}

// Fallback to Perplexity API
async function fetchFromPerplexity() {
  const apiKey = process.env.VITE_PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("Perplexity API key not configured");
  }

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "system",
          content: "You are a news aggregator. Return ONLY valid JSON with no markdown formatting. The JSON should be an array of news articles.",
        },
        {
          role: "user",
          content: `Find the latest 15 cryptocurrency and blockchain news articles from the past 2 days. Return ONLY a JSON array with this exact structure:
[
  {
    "title": "Article title",
    "url": "Full article URL",
    "source": "Source domain name",
    "publishedAt": "ISO date string",
    "snippet": "Brief description"
  }
]

Focus on Bitcoin, Ethereum, Solana, and general crypto market news. Return ONLY the JSON array, no other text.`,
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "[]";

  // Clean markdown code blocks if present
  const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const articles = JSON.parse(jsonContent);
    return Array.isArray(articles) ? articles : [];
  } catch (parseError) {
    console.error("Failed to parse Perplexity response:", parseError);
    return [];
  }
}

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
    let articles = [];
    let source = "tavily";

    try {
      // Try Tavily first
      articles = await fetchFromTavily();
      console.log(`Successfully fetched ${articles.length} articles from Tavily`);
    } catch (tavilyError) {
      console.warn("Tavily failed, trying Perplexity fallback:", tavilyError);

      try {
        // Fallback to Perplexity
        articles = await fetchFromPerplexity();
        source = "perplexity";
        console.log(`Successfully fetched ${articles.length} articles from Perplexity`);
      } catch (perplexityError) {
        console.error("Both Tavily and Perplexity failed:", perplexityError);
        throw new Error("All news sources failed");
      }
    }

    return new Response(
      JSON.stringify({ articles, source }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error fetching crypto news:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch news",
        message: error instanceof Error ? error.message : "Unknown error",
        articles: [],
      }),
      { status: 500, headers }
    );
  }
};
