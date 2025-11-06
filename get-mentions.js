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
    console.log(`\n📱 Fetching mentions and replies for @${me.data.username}...\n`);

    // Get mentions
    const mentions = await client.v2.userMentionTimeline(me.data.id, {
      max_results: 10,
      'tweet.fields': ['created_at', 'conversation_id', 'public_metrics', 'referenced_tweets'],
      'user.fields': ['username'],
      expansions: ['author_id', 'referenced_tweets.id'],
    });

    // Get our recent tweets to check for replies
    const ourTweets = await client.v2.userTimeline(me.data.id, {
      max_results: 10,
      'tweet.fields': ['conversation_id'],
    });

    // Get replies to our tweets
    const repliesArray = [];
    if (ourTweets.data.data) {
      console.log(`Checking ${ourTweets.data.data.length} recent tweets for replies...\n`);
      for (const tweet of ourTweets.data.data) {
        try {
          // Search for replies to this specific tweet (excluding our own replies)
          const searchQuery = `conversation_id:${tweet.conversation_id} -from:${me.data.username} -is:retweet`;
          const replies = await client.v2.search(searchQuery, {
            max_results: 10,
            'tweet.fields': ['created_at', 'conversation_id', 'public_metrics', 'referenced_tweets'],
            'user.fields': ['username'],
            expansions: ['author_id'],
          });

          if (replies.data.data && replies.data.data.length > 0) {
            repliesArray.push(...replies.data.data);
          }
        } catch (_error) {
          // Ignore search errors for individual tweets
          continue;
        }
      }
    }

    // Combine mentions and replies, remove duplicates by tweet ID
    const allTweets = [...(mentions.data.data || []), ...repliesArray];
    const uniqueTweets = Array.from(
      new Map(allTweets.map(tweet => [tweet.id, tweet])).values()
    );

    // Combine user data from both sources
    const allUsers = [
      ...(mentions.includes?.users || []),
      ...(repliesArray.length > 0 ? [] : []) // Replies already have user data embedded
    ];
    const uniqueUsers = Array.from(
      new Map(allUsers.map(user => [user.id, user])).values()
    );

    if (uniqueTweets.length === 0) {
      console.log('No mentions or replies found.\n');
      return;
    }

    console.log(`Found ${uniqueTweets.length} total tweets (${mentions.data.data?.length || 0} mentions + ${repliesArray.length} replies). Filtering out already-replied tweets...\n`);

    // Filter out tweets we've already replied to
    const unrepliedTweets = [];
    for (const tweet of uniqueTweets) {
      try {
        // Find the author from our combined user list
        const author = uniqueUsers.find(u => u.id === tweet.author_id);
        if (!author) {
          // If we can't find the author, skip this tweet
          continue;
        }

        // Search for our own replies to this specific tweet
        const searchQuery = `conversation_id:${tweet.conversation_id} from:${me.data.username} to:${author.username}`;
        const replies = await client.v2.search(searchQuery, {
          max_results: 10,
        });

        // If we haven't replied to this tweet, add it to the list
        if (!replies.data.data || replies.data.data.length === 0) {
          unrepliedTweets.push(tweet);
        }
      } catch (_error) {
        // If search fails, assume we haven't replied (better to show it than hide it)
        unrepliedTweets.push(tweet);
      }
    }

    if (unrepliedTweets.length === 0) {
      console.log('No new tweets to reply to (already replied to all recent mentions and replies).\n');
      return;
    }

    // Filter to only tweets from the last 20 minutes
    const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000);
    const recentTweets = unrepliedTweets.filter(tweet => {
      const tweetTime = new Date(tweet.created_at);
      return tweetTime >= twentyMinsAgo;
    });

    if (recentTweets.length === 0) {
      console.log(`Found ${unrepliedTweets.length} unreplied tweets, but none from the last 20 minutes.\n`);
      return;
    }

    console.log(`Found ${recentTweets.length} unreplied tweets from the last 20 minutes (${unrepliedTweets.length} total unreplied):\n`);
    console.log('='.repeat(80));

    for (const tweet of recentTweets) {
      const author = uniqueUsers.find(u => u.id === tweet.author_id);
      if (!author) continue;

      const metrics = tweet.public_metrics;
      const totalEngagement = metrics.like_count + metrics.retweet_count + metrics.reply_count;

      // Determine if this is a mention or reply
      const isReply = repliesArray.some(r => r.id === tweet.id);
      const tweetType = isReply ? '💬 Reply' : '📨 Mention';

      console.log(`\n${tweetType} from @${author.username}`);
      console.log(`Tweet ID: ${tweet.id}`);
      console.log(`Text: ${tweet.text}`);
      console.log(`Engagement: ${totalEngagement}`);
      console.log('-'.repeat(80));
    }

    console.log(`\n✅ Recent unreplied tweets (last 20 mins): ${recentTweets.length}\n`);
    
  } catch (error) {
    console.error('❌ Error fetching mentions:', error.message);
    if (error.data) {
      console.error('Details:', error.data);
    }
  }
}

getMentions();
