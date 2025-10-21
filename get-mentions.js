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

async function getMentions() {
  try {
    // Get authenticated user info
    const me = await client.v2.me();
    console.log(`\n📱 Fetching mentions for @${me.data.username}...\n`);

    // Get mentions
    const mentions = await client.v2.userMentionTimeline(me.data.id, {
      max_results: 10,
      'tweet.fields': ['created_at', 'conversation_id', 'public_metrics'],
      'user.fields': ['username'],
      expansions: ['author_id'],
    });

    if (mentions.data.data.length === 0) {
      console.log('No mentions found.\n');
      return;
    }

    console.log(`Found ${mentions.data.data.length} total mentions. Filtering out already-replied tweets...\n`);

    // Filter out mentions we've already replied to
    const unrepliedMentions = [];
    for (const tweet of mentions.data.data) {
      try {
        // Search for our own replies to this specific tweet
        const searchQuery = `conversation_id:${tweet.conversation_id} from:${me.data.username} to:${mentions.includes.users.find(u => u.id === tweet.author_id).username}`;
        const replies = await client.v2.search(searchQuery, {
          max_results: 10,
        });

        // If we haven't replied to this tweet, add it to the list
        if (!replies.data.data || replies.data.data.length === 0) {
          unrepliedMentions.push(tweet);
        }
      } catch (error) {
        // If search fails, assume we haven't replied (better to show it than hide it)
        unrepliedMentions.push(tweet);
      }
    }

    if (unrepliedMentions.length === 0) {
      console.log('No new mentions to reply to (already replied to all recent mentions).\n');
      return;
    }

    console.log(`Found ${unrepliedMentions.length} unreplied mentions:\n`);
    console.log('='.repeat(80));

    for (const tweet of unrepliedMentions) {
      const author = mentions.includes.users.find(u => u.id === tweet.author_id);
      const metrics = tweet.public_metrics;
      const totalEngagement = metrics.like_count + metrics.retweet_count + metrics.reply_count;

      console.log(`\n@${author.username}`);
      console.log(`Tweet ID: ${tweet.id}`);
      console.log(`Text: ${tweet.text}`);
      console.log(`Engagement: ${totalEngagement}`);
      console.log('-'.repeat(80));
    }

    console.log(`\n✅ Unreplied mentions: ${unrepliedMentions.length}\n`);
    
  } catch (error) {
    console.error('❌ Error fetching mentions:', error.message);
    if (error.data) {
      console.error('Details:', error.data);
    }
  }
}

getMentions();
