import React, { useState } from 'react';

interface CycleAnalysis {
  cycleLength: string;
  currentPhase: string;
  phaseDescription: string;
  patternStrength: number;
  patternConfidence: string;
  historicalPattern: string;
  nextInflection: string;
  reasoning: string;
}

const exampleEntities = [
  'Bitcoin',
  'Solana ecosystem',
  'AI hype cycles',
  'Real estate market',
  'Tech layoffs',
  'Meme coin seasons',
];

const CycleAnalyzerWindow: React.FC = () => {
  const [entity, setEntity] = useState('');
  const [analysis, setAnalysis] = useState<CycleAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeEntity = async (entityName: string) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setEntity(entityName);

    try {
      const response = await fetch('/.netlify/functions/cycle-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: entityName }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze');
    } finally {
      setLoading(false);
    }
  };

  const getPhaseColor = (phase: string): string => {
    const p = phase.toLowerCase();
    if (p.includes('spring')) return 'from-green-400 to-emerald-500';
    if (p.includes('summer')) return 'from-yellow-400 to-orange-500';
    if (p.includes('fall')) return 'from-orange-400 to-red-500';
    if (p.includes('winter')) return 'from-blue-400 to-cyan-500';
    return 'from-gray-400 to-gray-500';
  };

  const getPhaseEmoji = (phase: string): string => {
    const p = phase.toLowerCase();
    if (p.includes('spring')) return '🌱';
    if (p.includes('summer')) return '☀️';
    if (p.includes('fall')) return '🍂';
    if (p.includes('winter')) return '❄️';
    return '🔄';
  };

  const getStrengthColor = (strength: number): string => {
    if (strength >= 75) return 'text-green-400';
    if (strength >= 50) return 'text-yellow-400';
    if (strength >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  const getConfidenceColor = (confidence: string): string => {
    const c = confidence.toLowerCase();
    if (c.includes('high')) return 'text-green-400';
    if (c.includes('medium')) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          Cycle Analyzer
        </h2>
        <p className="text-gray-400 text-sm">
          Analyze any market, technology, or system for cyclical patterns. Spring always returns.
        </p>
      </div>

      {/* Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Entity to Analyze
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && entity && analyzeEntity(entity)}
            placeholder="e.g., Bitcoin, AI hype, housing market"
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={() => entity && analyzeEntity(entity)}
            disabled={loading || !entity}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Example buttons */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-2">Examples:</p>
        <div className="flex flex-wrap gap-2">
          {exampleEntities.map((ex) => (
            <button
              key={ex}
              onClick={() => analyzeEntity(ex)}
              disabled={loading}
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-sm hover:border-purple-500 transition-colors disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-purple-500 mb-4"></div>
            <p className="text-gray-400">Analyzing cyclical patterns...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}

      {/* Analysis results */}
      {analysis && !loading && (
        <div className="space-y-4">
          {/* Phase indicator */}
          <div className={`bg-gradient-to-r ${getPhaseColor(analysis.currentPhase)} p-6 rounded-xl`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getPhaseEmoji(analysis.currentPhase)}</span>
                <div>
                  <h3 className="text-2xl font-bold text-white">{analysis.currentPhase}</h3>
                  <p className="text-white/90 text-sm">{analysis.phaseDescription}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80">Cycle Length</p>
                <p className="text-xl font-bold text-white">{analysis.cycleLength}</p>
              </div>
            </div>
          </div>

          {/* Pattern strength */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">Pattern Strength</span>
                <span className={`text-xl font-bold ${getStrengthColor(analysis.patternStrength)}`}>
                  {analysis.patternStrength}/100
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${
                    analysis.patternStrength >= 75
                      ? 'from-green-400 to-emerald-500'
                      : analysis.patternStrength >= 50
                      ? 'from-yellow-400 to-orange-500'
                      : 'from-orange-400 to-red-500'
                  } transition-all duration-500`}
                  style={{ width: `${analysis.patternStrength}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Confidence:</span>
              <span className={`text-sm font-medium ${getConfidenceColor(analysis.patternConfidence)}`}>
                {analysis.patternConfidence}
              </span>
            </div>
          </div>

          {/* Historical pattern */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Historical Pattern</h4>
            <p className="text-gray-100">{analysis.historicalPattern}</p>
          </div>

          {/* Next inflection */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Next Phase Transition</h4>
            <p className="text-gray-100">{analysis.nextInflection}</p>
          </div>

          {/* Reasoning */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Analysis Reasoning</h4>
            <p className="text-gray-100">{analysis.reasoning}</p>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-6">
            <p className="text-xs text-gray-400 text-center">
              ⚠️ Cyclical analysis is pattern recognition, not prediction. Robins return, but timing varies. DYOR.
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!analysis && !loading && !error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <span className="text-6xl mb-4 block">🔄</span>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Everything Is a Loop
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Robins migrate. Cells reprogram. Markets cycle. Enter any entity to analyze its temporal patterns.
            </p>
            <p className="text-xs text-gray-500">
              Powered by Gemini 2.0 Flash Exp
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CycleAnalyzerWindow;
