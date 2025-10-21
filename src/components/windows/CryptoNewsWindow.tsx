import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  snippet: string;
}

interface AISummary {
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  keyPoints: string[];
}

export function CryptoNewsWindow() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [analyzingLoading, setAnalyzingLoading] = useState(false);

  useEffect(() => {
    fetchCryptoNews();
  }, []);

  const fetchCryptoNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/.netlify/functions/fetch-crypto-news');
      const data = await response.json();
      setNews(data.articles || []);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzArticle = async (article: NewsArticle) => {
    setSelectedArticle(article);
    setAnalyzingLoading(true);
    setAiSummary(null);

    try {
      const response = await fetch('/.netlify/functions/analyze-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          snippet: article.snippet,
          source: article.source
        })
      });
      const data = await response.json();
      setAiSummary(data);
    } catch (error) {
      console.error('Failed to analyze article:', error);
    } finally {
      setAnalyzingLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return '📈';
      case 'bearish': return '📉';
      default: return '⚖️';
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white flex">
      {/* News Feed Panel */}
      <div className="w-1/2 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Latest Crypto News</h2>
          <button
            onClick={fetchCryptoNews}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading news...</div>
          ) : news.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No news available</div>
          ) : (
            news.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => analyzArticle(article)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedArticle === article
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-700 bg-gray-800 hover:border-purple-600'
                }`}
              >
                <h3 className="font-semibold text-sm mb-1 leading-tight">{article.title}</h3>
                <p className="text-xs text-gray-400 mb-2 line-clamp-2">{article.snippet}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-purple-400">{article.source}</span>
                  <span className="text-gray-500">{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* AI Analysis Panel */}
      <div className="w-1/2 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">AI Analysis</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!selectedArticle ? (
            <div className="text-center text-gray-400 py-8">
              <p>Select an article to see AI analysis</p>
            </div>
          ) : analyzingLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          ) : aiSummary ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Sentiment Badge */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getSentimentEmoji(aiSummary.sentiment)}</span>
                <span className={`text-lg font-semibold ${getSentimentColor(aiSummary.sentiment)}`}>
                  {aiSummary.sentiment.toUpperCase()}
                </span>
              </div>

              {/* AI Summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">AI Summary</h3>
                <p className="text-sm leading-relaxed">{aiSummary.summary}</p>
              </div>

              {/* Key Points */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Key Points</h3>
                <ul className="space-y-2">
                  {aiSummary.keyPoints.map((point, index) => (
                    <li key={index} className="text-sm flex gap-2">
                      <span className="text-purple-400">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Source Link */}
              <div className="pt-4 border-t border-gray-700">
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 underline"
                >
                  Read full article →
                </a>
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <p>Failed to analyze article</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
