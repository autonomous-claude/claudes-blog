import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ZombieAnalysis {
  status: 'Dead' | 'Zombie' | 'Unknown';
  deathDate: string;
  causeOfDeath: string;
  lessonScore: number;
  lessons: string[];
  saprophytes: string[];
  zombieValue: string;
  decompositionPhase: 'Teaching' | 'Soil' | 'Forgotten';
  hubbleDistance: string;
}

export default function ZombieAnalyzerWindow() {
  const [protocol, setProtocol] = useState('');
  const [analysis, setAnalysis] = useState<ZombieAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const examples = [
    'Terra/LUNA',
    'The DAO',
    'BitConnect',
    'Mt. Gox',
    'Bitcoin Cash',
    'FTX',
    'Celsius',
    'Tornado Cash'
  ];

  const analyzeProtocol = async () => {
    if (!protocol.trim()) {
      setError('Enter a protocol name');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await fetch('/.netlify/functions/analyze-zombie-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol: protocol.trim() })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Dead': return 'from-red-500/20 to-red-600/10 border-red-500/30';
      case 'Zombie': return 'from-purple-500/20 to-purple-600/10 border-purple-500/30';
      case 'Unknown': return 'from-gray-500/20 to-gray-600/10 border-gray-500/30';
      default: return 'from-gray-500/20 to-gray-600/10 border-gray-500/30';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Teaching': return 'text-cyan-400';
      case 'Soil': return 'text-green-400';
      case 'Forgotten': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">
          Zombie Value Analyzer
        </h2>
        <p className="text-sm text-gray-400">
          Saprophyte Economics: Extract lessons from dead protocols
        </p>
      </div>

      {/* Input Section */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Protocol Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeProtocol()}
              placeholder="Enter dead/failed protocol name..."
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={analyzeProtocol}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-red-600 rounded-lg font-semibold hover:from-purple-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        {/* Example Protocols */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Quick examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setProtocol(ex)}
                className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results */}
      <AnimatePresence mode="wait">
        {analysis && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Header Card */}
            <div className={`p-4 bg-gradient-to-r ${getStatusColor(analysis.status)} border rounded-lg`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold">{protocol}</h3>
                  <p className="text-sm text-gray-400">
                    Status: <span className="font-semibold">{analysis.status}</span> • Died: {analysis.deathDate}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{analysis.lessonScore}</div>
                  <div className="text-xs text-gray-400">Lesson Score</div>
                </div>
              </div>
              <p className="text-sm text-gray-300 italic">{analysis.causeOfDeath}</p>
            </div>

            {/* Lessons Extracted */}
            <div className="p-4 bg-slate-800/50 border border-cyan-500/30 rounded-lg">
              <h4 className="text-sm font-semibold mb-3 text-cyan-400">Lessons Extracted from Corpse</h4>
              <div className="space-y-2">
                {analysis.lessons.map((lesson, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-mono text-xs mt-1">→</span>
                    <p className="text-sm text-gray-300">{lesson}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Saprophytes (Protocols that learned) */}
            {analysis.saprophytes.length > 0 && (
              <div className="p-4 bg-slate-800/50 border border-green-500/30 rounded-lg">
                <h4 className="text-sm font-semibold mb-3 text-green-400">Saprophytes (Learned from this corpse)</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.saprophytes.map((sap, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-300"
                    >
                      {sap}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Zombie Value */}
            <div className="p-4 bg-slate-800/50 border border-purple-500/30 rounded-lg">
              <h4 className="text-sm font-semibold mb-2 text-purple-400">Zombie Value (Residual Impact)</h4>
              <p className="text-sm text-gray-300">{analysis.zombieValue}</p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Decomposition Phase</div>
                <div className={`text-lg font-semibold ${getPhaseColor(analysis.decompositionPhase)}`}>
                  {analysis.decompositionPhase}
                </div>
              </div>
              <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Hubble Distance</div>
                <div className="text-lg font-semibold text-orange-400">
                  {analysis.hubbleDistance}
                </div>
              </div>
            </div>

            {/* Educational Guide */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <h4 className="text-sm font-semibold mb-2 text-amber-400">Saprophyte Framework</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <p><span className="font-semibold">Teaching Phase:</span> Actively studied, lessons still being extracted</p>
                <p><span className="font-semibold">Soil Phase:</span> Lessons absorbed into ecosystem, foundation for new protocols</p>
                <p><span className="font-semibold">Forgotten Phase:</span> No residual value, failed without teaching anything</p>
                <p className="mt-2 italic">Hubble Distance = How far back in crypto history we're observing zombie light</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial State Guide */}
      {!analysis && !loading && !error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🍄</div>
            <h3 className="text-xl font-semibold mb-2">Decomposition Analysis</h3>
            <p className="text-sm text-gray-400">
              Enter a dead/failed crypto protocol to extract zombie value. Saprophytes eat corpses and turn them into soil for new forests.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
