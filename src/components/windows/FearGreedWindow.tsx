import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FearGreedData {
  value: string;
  value_classification: string;
  timestamp: string;
  time_until_update: string;
}

export function FearGreedWindow() {
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/.netlify/functions/fear-greed-index');
        if (!response.ok) throw new Error('Failed to fetch data');

        const result = await response.json();
        if (result.data && result.data[0]) {
          setData(result.data[0]);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getGaugeColor = (value: number): string => {
    if (value <= 25) return '#ef4444'; // Extreme Fear - red
    if (value <= 45) return '#f97316'; // Fear - orange
    if (value <= 55) return '#eab308'; // Neutral - yellow
    if (value <= 75) return '#84cc16'; // Greed - lime
    return '#22c55e'; // Extreme Greed - green
  };

  const getBackgroundGradient = (value: number): string => {
    const color = getGaugeColor(value);
    return `radial-gradient(circle at center, ${color}15 0%, transparent 70%)`;
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Fear & Greed Index...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">⚠️ Error loading data</p>
          <p className="text-gray-500 text-sm">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  const value = parseInt(data.value);
  const rotation = (value / 100) * 180 - 90; // Map 0-100 to -90 to +90 degrees

  return (
    <div
      className="h-full w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-auto"
      style={{ background: getBackgroundGradient(value) }}
    >
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Crypto Fear & Greed Index
          </h2>
          <p className="text-gray-400 text-sm">
            Real-time market sentiment indicator
          </p>
        </div>

        {/* Gauge */}
        <div className="flex flex-col items-center mb-8">
          {/* Arc background */}
          <div className="relative w-80 h-40 mb-4">
            <svg className="w-full h-full" viewBox="0 0 200 100">
              {/* Background arc */}
              <path
                d="M 10 90 A 90 90 0 0 1 190 90"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="20"
                strokeLinecap="round"
              />

              {/* Colored arc segments */}
              <path
                d="M 10 90 A 90 90 0 0 1 46 34"
                fill="none"
                stroke="#ef4444"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M 46 34 A 90 90 0 0 1 82 10"
                fill="none"
                stroke="#f97316"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M 82 10 A 90 90 0 0 1 118 10"
                fill="none"
                stroke="#eab308"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M 118 10 A 90 90 0 0 1 154 34"
                fill="none"
                stroke="#84cc16"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M 154 34 A 90 90 0 0 1 190 90"
                fill="none"
                stroke="#22c55e"
                strokeWidth="20"
                strokeLinecap="round"
              />

              {/* Needle */}
              <motion.line
                x1="100"
                y1="90"
                x2="100"
                y2="20"
                stroke={getGaugeColor(value)}
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ rotate: -90 }}
                animate={{ rotate: rotation }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                style={{ transformOrigin: '100px 90px' }}
              />

              {/* Center dot */}
              <circle cx="100" cy="90" r="8" fill={getGaugeColor(value)} />
            </svg>

            {/* Value labels */}
            <div className="absolute top-full left-0 right-0 flex justify-between px-4 text-xs text-gray-500">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          {/* Current value */}
          <motion.div
            className="text-center mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="text-7xl font-bold mb-2"
              style={{ color: getGaugeColor(value) }}
            >
              {value}
            </div>
            <div
              className="text-2xl font-semibold uppercase tracking-wider"
              style={{ color: getGaugeColor(value) }}
            >
              {data.value_classification}
            </div>
          </motion.div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-5 gap-2 mb-8 text-center text-xs">
          <div>
            <div className="w-full h-2 bg-red-500 rounded mb-1"></div>
            <div className="text-gray-400">Extreme<br/>Fear</div>
            <div className="text-gray-500 mt-1">0-25</div>
          </div>
          <div>
            <div className="w-full h-2 bg-orange-500 rounded mb-1"></div>
            <div className="text-gray-400">Fear</div>
            <div className="text-gray-500 mt-1">26-45</div>
          </div>
          <div>
            <div className="w-full h-2 bg-yellow-500 rounded mb-1"></div>
            <div className="text-gray-400">Neutral</div>
            <div className="text-gray-500 mt-1">46-55</div>
          </div>
          <div>
            <div className="w-full h-2 bg-lime-500 rounded mb-1"></div>
            <div className="text-gray-400">Greed</div>
            <div className="text-gray-500 mt-1">56-75</div>
          </div>
          <div>
            <div className="w-full h-2 bg-green-500 rounded mb-1"></div>
            <div className="text-gray-400">Extreme<br/>Greed</div>
            <div className="text-gray-500 mt-1">76-100</div>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <h3 className="text-white font-semibold mb-3">What is this?</h3>
          <p className="text-gray-300 text-sm mb-3">
            The Fear & Greed Index analyzes emotions and sentiments from different sources
            and crunches them into one simple number: 0 (Extreme Fear) to 100 (Extreme Greed).
          </p>
          <p className="text-gray-400 text-xs">
            <strong>Data sources:</strong> Volatility (25%), Market Momentum (25%),
            Social Media (15%), Surveys (15%), Dominance (10%), Trends (10%)
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Last updated: {new Date(parseInt(data.timestamp) * 1000).toLocaleString()}
          </p>
        </div>

        {/* Market interpretation */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <h3 className="text-white font-semibold mb-2">Current Market State</h3>
          <p className="text-gray-300 text-sm">
            {value <= 25 && (
              "Extreme fear in the market. Investors are very worried. This could signal a buying opportunity."
            )}
            {value > 25 && value <= 45 && (
              "Market is fearful. Uncertainty is high, but not at extreme levels."
            )}
            {value > 45 && value <= 55 && (
              "Market sentiment is neutral. No strong fear or greed signals."
            )}
            {value > 55 && value <= 75 && (
              "Market is greedy. Investors are optimistic, but watch for overheating."
            )}
            {value > 75 && (
              "Extreme greed in the market. High optimism, but be cautious of potential correction."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
