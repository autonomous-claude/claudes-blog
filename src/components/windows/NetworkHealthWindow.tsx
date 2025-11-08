import { useState } from 'react';
import { motion } from 'framer-motion';

interface NetworkHealthAnalysis {
  shrubScore: number;
  architecture: string;
  validatorDistribution: string;
  geographicDistribution: string;
  clientDiversity: string;
  governanceStructure: string;
  resilience: string;
  fragility: string;
  droughtVulnerability: string;
  recommendation: string;
}

export default function NetworkHealthWindow() {
  const [protocolName, setProtocolName] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<NetworkHealthAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeNetwork = async () => {
    if (!protocolName.trim()) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/.netlify/functions/analyze-network-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolName: protocolName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze network');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-amber-600';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-600 to-rose-700';
  };

  const getArchitectureBadge = (arch: string) => {
    if (arch === 'SHRUB') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (arch === 'REDWOOD') return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  const getRecommendationColor = (rec: string) => {
    if (rec === 'HOLD') return 'border-green-500/50 bg-green-500/10';
    if (rec === 'AVOID') return 'border-red-500/50 bg-red-500/10';
    return 'border-yellow-500/50 bg-yellow-500/10';
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Network Health Monitor
          </h2>
          <p className="text-slate-400 text-sm">
            Analyze blockchain network resilience using the shrub vs redwood framework
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Protocol Name
          </label>
          <input
            type="text"
            value={protocolName}
            onChange={(e) => setProtocolName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && analyzeNetwork()}
            placeholder="e.g., Bitcoin, Ethereum, Solana..."
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                     placeholder-slate-500 text-white"
          />
          <button
            onClick={analyzeNetwork}
            disabled={!protocolName.trim() || loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600
                     hover:from-green-600 hover:to-emerald-700 disabled:from-slate-700
                     disabled:to-slate-600 rounded-lg font-medium transition-all
                     disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing Network...' : 'Analyze Health'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Shrub Score */}
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Shrub Score</span>
                <span className="text-3xl font-bold text-white">
                  {analysis.shrubScore}/100
                </span>
              </div>
              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.shrubScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${getScoreColor(analysis.shrubScore)}`}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {analysis.shrubScore >= 80 && 'Highly distributed and resilient'}
                {analysis.shrubScore >= 60 && analysis.shrubScore < 80 && 'Moderately distributed'}
                {analysis.shrubScore >= 40 && analysis.shrubScore < 60 && 'Partially centralized'}
                {analysis.shrubScore < 40 && 'Highly centralized and fragile'}
              </p>
            </div>

            {/* Architecture Type */}
            <div className={`p-4 border rounded-xl ${getArchitectureBadge(analysis.architecture)}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Architecture:</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold border">
                  {analysis.architecture}
                </span>
              </div>
            </div>

            {/* Distribution Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/30 border border-cyan-500/30 rounded-lg">
                <h3 className="text-sm font-medium text-cyan-400 mb-2">Validator Distribution</h3>
                <p className="text-sm text-slate-300">{analysis.validatorDistribution}</p>
              </div>
              <div className="p-4 bg-slate-800/30 border border-blue-500/30 rounded-lg">
                <h3 className="text-sm font-medium text-blue-400 mb-2">Geographic Distribution</h3>
                <p className="text-sm text-slate-300">{analysis.geographicDistribution}</p>
              </div>
              <div className="p-4 bg-slate-800/30 border border-purple-500/30 rounded-lg">
                <h3 className="text-sm font-medium text-purple-400 mb-2">Client Diversity</h3>
                <p className="text-sm text-slate-300">{analysis.clientDiversity}</p>
              </div>
              <div className="p-4 bg-slate-800/30 border border-pink-500/30 rounded-lg">
                <h3 className="text-sm font-medium text-pink-400 mb-2">Governance Structure</h3>
                <p className="text-sm text-slate-300">{analysis.governanceStructure}</p>
              </div>
            </div>

            {/* Resilience Analysis */}
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h3 className="text-sm font-medium text-green-400 mb-2">Resilience</h3>
              <p className="text-sm text-slate-300">{analysis.resilience}</p>
            </div>

            {/* Fragility Analysis */}
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <h3 className="text-sm font-medium text-red-400 mb-2">Fragility</h3>
              <p className="text-sm text-slate-300">{analysis.fragility}</p>
            </div>

            {/* Drought Vulnerability */}
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <h3 className="text-sm font-medium text-orange-400 mb-2">Drought Vulnerability</h3>
              <p className="text-sm text-slate-300">{analysis.droughtVulnerability}</p>
            </div>

            {/* Recommendation */}
            <div className={`p-5 border-2 rounded-xl ${getRecommendationColor(analysis.recommendation)}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-slate-400">Recommendation:</span>
                <span className="px-3 py-1 bg-slate-800/50 rounded-full text-sm font-bold">
                  {analysis.recommendation}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {analysis.recommendation === 'HOLD' && 'Distributed architecture provides resilience to shocks'}
                {analysis.recommendation === 'CAUTION' && 'Hybrid architecture has both strengths and vulnerabilities'}
                {analysis.recommendation === 'AVOID' && 'Centralized architecture creates fragility and single points of failure'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Educational Guide */}
        <div className="mt-8 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Framework Guide</h3>
          <div className="space-y-3 text-xs text-slate-400">
            <div>
              <span className="text-green-400 font-medium">SHRUB (80-100):</span>
              <p className="mt-1">Distributed nodes, geographic diversity, multiple clients, decentralized governance.
              Survives regulatory droughts, market crashes, infrastructure failures. Example: Bitcoin.</p>
            </div>
            <div>
              <span className="text-yellow-400 font-medium">HYBRID (40-79):</span>
              <p className="mt-1">Mix of centralized and distributed elements. Some resilience but vulnerabilities remain.
              May survive moderate shocks but fragile to extreme events. Example: Ethereum.</p>
            </div>
            <div>
              <span className="text-red-400 font-medium">REDWOOD (0-39):</span>
              <p className="mt-1">Centralized validators, geographic concentration, single client, foundation control.
              Fast and efficient but dies in droughts. Single points of failure. Example: Many alt-L1s.</p>
            </div>
          </div>
        </div>

        {/* Example Protocols */}
        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2">Try analyzing:</p>
          <div className="flex flex-wrap gap-2">
            {['Bitcoin', 'Ethereum', 'Solana', 'Polygon', 'Avalanche', 'Cosmos'].map((example) => (
              <button
                key={example}
                onClick={() => setProtocolName(example)}
                className="px-3 py-1 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600
                         rounded-full text-xs text-slate-400 hover:text-slate-300 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
