import type { Context } from "@netlify/functions";

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
    const apiKey = process.env.VITE_TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error("Tavily API key not configured");
    }

    // Fetch latest crypto news using Tavily Search API
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
    const articles = (data.results || []).map((result: any) => ({
      title: result.title || "Untitled",
      url: result.url || "#",
      source: new URL(result.url).hostname.replace("www.", ""),
      publishedAt: result.published_date || new Date().toISOString(),
      snippet: result.content || "",
    }));

    return new Response(
      JSON.stringify({ articles }),
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
