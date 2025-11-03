import type { Context } from "@netlify/functions";
import { TwitterApi } from 'twitter-api-v2';

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  media?: {
    type: string;
    url: string;
    preview_image_url?: string;
  }[];
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    impression_count: number;
  };
}

export default async (req: Request, context: Context) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    // Initialize Twitter client
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });

    // Get authenticated user info
    const me = await client.v2.me();

    // Fetch user's tweets with media
    const tweets = await client.v2.userTimeline(me.data.id, {
      max_results: 20,
      'tweet.fields': ['created_at', 'public_metrics', 'attachments'],
      'media.fields': ['type', 'url', 'preview_image_url', 'variants'],
      expansions: ['attachments.media_keys'],
    });

    // Check if we have tweets
    if (!tweets.data.data || tweets.data.data.length === 0) {
      return new Response(
        JSON.stringify({
          tweets: [],
          username: me.data.username
        }),
        { status: 200, headers }
      );
    }

    // Transform tweets to our format
    const transformedTweets: Tweet[] = tweets.data.data.map((tweet: any) => {
      // Find media for this tweet
      let media: Tweet['media'] = undefined;

      if (tweet.attachments?.media_keys && tweets.includes?.media) {
        media = tweet.attachments.media_keys
          .map((key: string) => {
            const mediaItem = tweets.includes.media.find((m: any) => m.media_key === key);
            if (!mediaItem) return null;

            // For videos, get the highest quality variant
            if (mediaItem.type === 'video') {
              const variants = mediaItem.variants || [];
              const mp4Variants = variants.filter((v: any) => v.content_type === 'video/mp4');
              const highestQuality = mp4Variants.sort((a: any, b: any) =>
                (b.bit_rate || 0) - (a.bit_rate || 0)
              )[0];

              return {
                type: mediaItem.type,
                url: highestQuality?.url || mediaItem.url,
                preview_image_url: mediaItem.preview_image_url,
              };
            }

            return {
              type: mediaItem.type,
              url: mediaItem.url,
              preview_image_url: mediaItem.preview_image_url,
            };
          })
          .filter(Boolean);
      }

      return {
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        media,
        public_metrics: tweet.public_metrics,
      };
    });

    return new Response(
      JSON.stringify({
        tweets: transformedTweets,
        username: me.data.username
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Error fetching tweets:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch tweets",
        message: error instanceof Error ? error.message : "Unknown error",
        tweets: [],
      }),
      { status: 500, headers }
    );
  }
};
