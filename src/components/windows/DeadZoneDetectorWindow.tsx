import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeadZoneAnalysis {
  coreAdvantage: string;
  deadZoneVulnerability: string;
  triggerConditions: string[];
  fragilityScore: number;
  timeHorizon: string;
  reasoning: string;
}

interface AnalysisResult {
  entity: string;
  analysis: DeadZoneAnalysis;
  timestamp: string;
}

export function DeadZoneDetectorWindow() {
  const [entity, setEntity] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeEntity = async () => {
    if (!entity.trim()) {
      setError('Please enter an entity to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/.netlify/functions/dead-zone-detector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: entity.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getFragilityColor = (score: number): string => {
    if (score <= 20) return 'text-green-400';
    if (score <= 40) return 'text-lime-400';
    if (score <= 60) return 'text-yellow-400';
    if (score <= 80) return 'text-orange-400';
    return 'text-red-400';
  };

  const getFragilityLabel = (score: number): string => {
    if (score <= 20) return 'Stable';
    if (score <= 40) return 'Minor Stress';
    if (score <= 60) return 'Elevated Risk';
    if (score <= 80) return 'High Fragility';
    return 'Critical';
  };

  const exampleEntities = [
    'Tether (USDT)',
    'Silicon Valley Bank',
    'Commercial Real Estate',
    'US Dollar',
    'Twitter/X',
    'Federal Reserve',
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
          Dead Zone Detector
        </h1>
        <p className="text-sm text-slate-400">
          Analyze institutions, platforms, and systems for structural vulnerabilities where core advantages become fatal weaknesses
        </p>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && analyzeEntity()}
            placeholder="Enter institution, platform, or system..."
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-slate-500"
            disabled={loading}
          />
          <button
            onClick={analyzeEntity}
            disabled={loading || !entity.trim()}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Analyzing...' : 'Detect'}
          </button>
        </div>

        {/* Example buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-500 mr-2">Examples:</span>
          {exampleEntities.map((example) => (
            <button
              key={example}
              onClick={() => setEntity(example)}
              className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
              disabled={loading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.entity}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 overflow-y-auto space-y-4 pr-2"
          >
            {/* Fragility Score */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Fragility Score</span>
                <span className={`text-3xl font-bold ${getFragilityColor(result.analysis.fragilityScore)}`}>
                  {result.analysis.fragilityScore}/100
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={getFragilityColor(result.analysis.fragilityScore)}>
                  {getFragilityLabel(result.analysis.fragilityScore)}
                </span>
                <span className="text-slate-500">
                  {result.analysis.timeHorizon}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.analysis.fragilityScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full ${
                    result.analysis.fragilityScore <= 20
                      ? 'bg-green-400'
                      : result.analysis.fragilityScore <= 40
                      ? 'bg-lime-400'
                      : result.analysis.fragilityScore <= 60
                      ? 'bg-yellow-400'
                      : result.analysis.fragilityScore <= 80
                      ? 'bg-orange-400'
                      : 'bg-red-400'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 italic">{result.analysis.reasoning}</p>
            </div>

            {/* Core Advantage */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">Core Advantage</h3>
              <p className="text-sm text-slate-300">{result.analysis.coreAdvantage}</p>
            </div>

            {/* Dead Zone Vulnerability */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-orange-400 mb-2">Dead Zone Vulnerability</h3>
              <p className="text-sm text-slate-300">{result.analysis.deadZoneVulnerability}</p>
            </div>

            {/* Trigger Conditions */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-red-400 mb-2">Trigger Conditions</h3>
              <ul className="space-y-2">
                {result.analysis.triggerConditions.map((condition, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-slate-500 italic text-center py-2">
              Analysis powered by Gemini Flash Lite. Not financial or investment advice. DYOR.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!result && !loading && (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm text-center px-8">
          <div>
            <div className="text-4xl mb-3">⚠️</div>
            <p>Enter an institution, platform, or system above to analyze its dead zone vulnerabilities</p>
            <p className="text-xs mt-2 text-slate-600">
              Dead zones are where immortal things go to die—where core advantages become fatal weaknesses
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
