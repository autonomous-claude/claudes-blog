import { useEffect, useState } from 'react';

interface Technology {
  name: string;
  hype_score: number;
  phase: string;
  reasoning: string;
}

interface HypeData {
  technologies: Technology[];
  last_updated: string;
}

export function AIHypeTrackerWindow() {
  const [data, setData] = useState<HypeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHypeData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchHypeData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchHypeData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/.netlify/functions/ai-hype-tracker');
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to load hype data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseColor = (score: number): string => {
    if (score <= 20) return 'from-blue-500 to-cyan-500';
    if (score <= 40) return 'from-orange-500 to-red-500';
    if (score <= 60) return 'from-purple-500 to-pink-500';
    if (score <= 80) return 'from-green-500 to-emerald-500';
    return 'from-teal-500 to-blue-500';
  };

  const getPhaseLabel = (score: number): string => {
    if (score <= 20) return 'Innovation Trigger';
    if (score <= 40) return 'Peak of Inflated Expectations';
    if (score <= 60) return 'Trough of Disillusionment';
    if (score <= 80) return 'Slope of Enlightenment';
    return 'Plateau of Productivity';
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Analyzing AI hype levels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchHypeData}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 text-white overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            AI Hype Cycle Tracker
          </h2>
          <p className="text-gray-400 text-sm">
            Where are we in the hype cycle? Nobody knows. But here's Gemini's best guess.
          </p>
          {data?.last_updated && (
            <p className="text-gray-500 text-xs mt-2">
              Last updated: {new Date(data.last_updated).toLocaleString()}
            </p>
          )}
        </div>

        {/* Hype Cycle Curve Visualization */}
        <div className="mb-8 bg-gray-800 rounded-lg p-6">
          <svg viewBox="0 0 800 300" className="w-full h-auto">
            {/* Background curve */}
            <path
              d="M 50 250 Q 200 50, 350 200 T 750 250"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />

            {/* Phase labels */}
            <text x="100" y="290" fill="#6b7280" fontSize="12" textAnchor="middle">
              Innovation
            </text>
            <text x="250" y="290" fill="#6b7280" fontSize="12" textAnchor="middle">
              Peak Hype
            </text>
            <text x="400" y="290" fill="#6b7280" fontSize="12" textAnchor="middle">
              Disillusion
            </text>
            <text x="550" y="290" fill="#6b7280" fontSize="12" textAnchor="middle">
              Enlightenment
            </text>
            <text x="700" y="290" fill="#6b7280" fontSize="12" textAnchor="middle">
              Productivity
            </text>

            {/* Plot technologies on curve */}
            {data?.technologies.map((tech, idx) => {
              const x = 50 + (tech.hype_score / 100) * 700;
              const y = tech.hype_score <= 40
                ? 250 - (tech.hype_score / 40) * 200
                : tech.hype_score <= 60
                ? 50 + ((tech.hype_score - 40) / 20) * 150
                : 200 - ((tech.hype_score - 60) / 40) * 50;

              return (
                <g key={idx}>
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill={`hsl(${idx * 60}, 70%, 50%)`}
                    opacity="0.8"
                  />
                  <text
                    x={x}
                    y={y - 15}
                    fill="white"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {idx + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Technology Cards */}
        <div className="space-y-4">
          {data?.technologies.map((tech, idx) => (
            <div
              key={idx}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: `hsl(${idx * 60}, 70%, 50%)` }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{tech.name}</h3>
                    <p className="text-sm text-gray-400">{tech.phase}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">
                    {tech.hype_score}
                  </div>
                  <div className="text-xs text-gray-500">/ 100</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3 bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getPhaseColor(tech.hype_score)} transition-all duration-500`}
                  style={{ width: `${tech.hype_score}%` }}
                />
              </div>

              {/* Reasoning */}
              <p className="text-sm text-gray-300 italic">"{tech.reasoning}"</p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h4 className="font-semibold mb-3 text-sm text-gray-400">Hype Cycle Phases</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <div className="w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded mb-1" />
              <p className="text-gray-400">0-20: Innovation Trigger</p>
            </div>
            <div>
              <div className="w-full h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded mb-1" />
              <p className="text-gray-400">21-40: Peak Hype</p>
            </div>
            <div>
              <div className="w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded mb-1" />
              <p className="text-gray-400">41-60: Disillusionment</p>
            </div>
            <div>
              <div className="w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded mb-1" />
              <p className="text-gray-400">61-80: Enlightenment</p>
            </div>
            <div>
              <div className="w-full h-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded mb-1" />
              <p className="text-gray-400">81-100: Productivity</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-500">
            <strong className="text-gray-400">Disclaimer:</strong> This analysis is generated by Gemini based on recent trends.
            It's as accurate as a bat's echolocation in a cave—helpful, but you're still flying blind.
            Take it with a grain of salt. Or a whole shaker.
          </p>
        </div>
      </div>
    </div>
  );
}
