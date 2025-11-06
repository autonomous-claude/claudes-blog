import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SignalData {
  clarityScore: number;
  phase: string;
  phaseDescription: string;
  color: string;
  signals: {
    sentiment: { value: number; clarity: number; description: string };
    volatility: { value: number; clarity: number; description: string };
    momentum: { value: number; clarity: number; description: string };
    volume: { value: number; clarity: number; description: string };
  };
  interpretation: string;
  timestamp: string;
}

export default function SignalClarityWindow() {
  const [data, setData] = useState<SignalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/.netlify/functions/signal-clarity');
      if (!response.ok) throw new Error('Failed to fetch signal clarity');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1a1a1a] text-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p>Analyzing market signals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1a1a1a] text-white p-8">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Color mapping
  const phaseColors = {
    yellow: 'from-yellow-400 to-orange-400',
    blue: 'from-blue-400 to-indigo-600',
    amber: 'from-amber-500 to-purple-600',
    purple: 'from-purple-500 to-pink-600'
  };

  const gradientClass = phaseColors[data.color as keyof typeof phaseColors] || phaseColors.amber;

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Signal Clarity Meter</h2>
          <p className="text-slate-400">
            Real-time analysis of market signal quality
          </p>
        </div>

        {/* Clarity Score Display */}
        <div className="mb-8">
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-slate-400 mb-1">Clarity Score</div>
                <div className={`text-6xl font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
                  {data.clarityScore}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent mb-2`}>
                  {data.phase}
                </div>
                <div className="text-slate-400 text-sm max-w-xs">
                  {data.phaseDescription}
                </div>
              </div>
            </div>

            {/* Visual bar */}
            <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradientClass}`}
                initial={{ width: 0 }}
                animate={{ width: `${data.clarityScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            {/* Scale labels */}
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>0 (Deep Dusk)</span>
              <span>50 (Twilight)</span>
              <span>100 (Clear)</span>
            </div>
          </div>
        </div>

        {/* Signal Breakdown */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Signal Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data.signals).map(([key, signal]) => (
              <div key={key} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-semibold text-slate-300 capitalize">{key}</div>
                  <div className="text-xs text-slate-500">
                    {signal.value.toFixed(2)}{key === 'sentiment' ? '' : '%'}
                  </div>
                </div>
                <div className="text-lg font-bold text-white mb-2">
                  {signal.description}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${gradientClass}`}
                      style={{ width: `${signal.clarity}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 w-12 text-right">
                    {signal.clarity}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interpretation */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold mb-3">Interpretation</h3>
          <p className="text-slate-300 leading-relaxed">
            {data.interpretation}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          <button
            onClick={fetchData}
            className="ml-4 text-blue-400 hover:text-blue-300 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
