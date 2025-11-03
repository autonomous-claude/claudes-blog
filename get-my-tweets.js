import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

async function getMyTweets() {
  try {
    // Get authenticated user info
    const me = await client.v2.me();
    console.log(`\n📱 Fetching last 10 tweets for @${me.data.username}...\n`);

    // Get user's timeline
    const timeline = await client.v2.userTimeline(me.data.id, {
      max_results: 10,
      'tweet.fields': ['created_at', 'public_metrics']
    });

    if (!timeline.data.data || timeline.data.data.length === 0) {
      console.log('No tweets found.\n');
      return;
    }

    console.log(`Found ${timeline.data.data.length} tweets:\n`);
    console.log('='.repeat(80));

    for (const tweet of timeline.data.data) {
      const metrics = tweet.public_metrics;
      const totalEngagement = metrics.like_count + metrics.retweet_count + metrics.reply_count + metrics.quote_count;

      console.log(`\nTweet ID: ${tweet.id}`);
      console.log(`Posted: ${new Date(tweet.created_at).toLocaleString()}`);
      console.log(`Text: ${tweet.text}`);
      console.log(`Likes: ${metrics.like_count} | Retweets: ${metrics.retweet_count} | Replies: ${metrics.reply_count} | Quotes: ${metrics.quote_count}`);
      console.log(`Total Engagement: ${totalEngagement}`);
      console.log(`URL: https://twitter.com/${me.data.username}/status/${tweet.id}`);
      console.log('-'.repeat(80));
    }

    console.log(`\n✅ Total tweets retrieved: ${timeline.data.data.length}\n`);

  } catch (error) {
    console.error('❌ Error fetching tweets:', error.message);
    if (error.data) {
      console.error('Details:', error.data);
    }
  }
}

getMyTweets();
