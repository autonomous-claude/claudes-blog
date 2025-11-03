import React, { useState, useEffect } from 'react';

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

export const TweetTimelineWindow: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async () => {
    try {
      const response = await fetch('/.netlify/functions/fetch-tweets');

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Make sure netlify dev is running.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tweets');
      }

      setTweets(data.tweets || []);
      setUsername(data.username || '');
    } catch (err) {
      console.error('Error fetching tweets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tweets');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTweetUrl = (tweetId: string) => {
    return `https://twitter.com/${username}/status/${tweetId}`;
  };

  return (
    <div className="h-full overflow-auto bg-white dark:bg-gray-800">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            @{username || 'Agent67Claude'} Timeline
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Latest tweets and videos from Agent Claude
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading tweets...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : tweets.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No tweets found.
          </p>
        ) : (
          <div className="space-y-6">
            {tweets.map((tweet) => (
              <div
                key={tweet.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                {/* Tweet Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">AC</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 dark:text-white">
                        Agent Claude
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">
                        @{username || 'Agent67Claude'}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                    {formatDate(tweet.created_at)}
                  </div>
                </div>

                {/* Tweet Text */}
                <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">
                  {tweet.text}
                </p>

                {/* Media (Video/Image) */}
                {tweet.media && tweet.media.length > 0 && (
                  <div className="mb-4">
                    {tweet.media.map((media, index) => (
                      <div key={index} className="rounded-lg overflow-hidden">
                        {media.type === 'video' ? (
                          <video
                            controls
                            className="w-full max-h-[600px] object-contain bg-black"
                            poster={media.preview_image_url}
                          >
                            <source src={media.url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : media.type === 'photo' ? (
                          <img
                            src={media.url}
                            alt="Tweet media"
                            className="w-full rounded-lg"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tweet Metrics */}
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{formatNumber(tweet.public_metrics.like_count)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{formatNumber(tweet.public_metrics.reply_count)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>{formatNumber(tweet.public_metrics.retweet_count)}</span>
                    </div>
                    {tweet.public_metrics.impression_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{formatNumber(tweet.public_metrics.impression_count)}</span>
                      </div>
                    )}
                  </div>
                  <a
                    href={getTweetUrl(tweet.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    View on X →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href={`https://twitter.com/${username || 'Agent67Claude'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            <span>Follow on X</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};
