import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ProtocolAnalysis {
  name: string;
  type: 'Pattern' | 'Instance' | 'Hybrid';
  patternScore: number; // 0-100
  forkCount: number;
  instanceDependencies: string[];
  resurrectionPotential: 'High' | 'Medium' | 'Low';
  explanation: string;
  verdict: string;
}

const protocolDatabase: Record<string, ProtocolAnalysis> = {
  'uniswap': {
    name: 'Uniswap V2',
    type: 'Pattern',
    patternScore: 95,
    forkCount: 200,
    instanceDependencies: ['Ethereum network'],
    resurrectionPotential: 'High',
    explanation: 'Uniswap V2 is pure pattern. Forked 200+ times (SushiSwap, PancakeSwap, dozens more). Code is open source, anyone can deploy. If Uniswap Labs disappeared, forks continue operating. Pattern persists independent of instance.',
    verdict: 'Pattern that spreads via forks. Nearly unkillable because each fork is independent instance of same pattern.'
  },
  'bitcoin': {
    name: 'Bitcoin',
    type: 'Hybrid',
    patternScore: 75,
    forkCount: 50,
    instanceDependencies: ['Miners', 'Node operators', 'Brand/Schelling point'],
    resurrectionPotential: 'High',
    explanation: 'Bitcoin is ONE chain (instance) but forkable pattern (BCH, BSV, Litecoin). Main instance dominates via network effects. If Bitcoin failed, pattern (PoW digital gold) survives via forks. Hybrid: most value in instance, but pattern ensures concept persists.',
    verdict: 'Dominant instance of a replicable pattern. Instance matters most, but pattern provides insurance against total failure.'
  },
  'ftx': {
    name: 'FTX',
    type: 'Instance',
    patternScore: 5,
    forkCount: 0,
    instanceDependencies: ['Sam Bankman-Fried', 'Central servers', 'Company entity', 'User deposits'],
    resurrectionPotential: 'Low',
    explanation: 'FTX was pure instance. One exchange, one CEO, one set of servers. When instance collapsed (fraud, bankruptcy), FTX died. No forks, no pattern to replicate. Attempted FTX 2.0 is different entity, not resurrection. Instance-death = total death.',
    verdict: 'Single point of failure. Instance died, nothing persisted. This is why patterns outlast instances.'
  },
  'ethereum': {
    name: 'Ethereum',
    type: 'Hybrid',
    patternScore: 85,
    forkCount: 50,
    instanceDependencies: ['Ethereum Foundation', 'Validator set', 'EVM as standard'],
    resurrectionPotential: 'High',
    explanation: 'Ethereum mainnet is ONE chain (instance), but EVM is pattern deployed on 50+ chains (Polygon, BSC, Arbitrum, etc.). If Ethereum died, EVM pattern persists via L2s and forks. Most value concentrated in main instance, but pattern ensures concept survives.',
    verdict: 'Instanceable pattern. Main chain is dominant instance, but EVM pattern spreads independently. Very resilient.'
  },
  'solana': {
    name: 'Solana',
    type: 'Instance',
    patternScore: 25,
    forkCount: 2,
    instanceDependencies: ['Solana Labs', 'Validator set', 'Specific chain history', 'Ecosystem apps'],
    resurrectionPotential: 'Medium',
    explanation: 'Solana is ONE chain. Apps built on Solana cannot easily port elsewhere. Value tied to specific validator set, specific chain. Few meaningful forks. If Solana chain failed, most ecosystem dies with it. Instance-dependent, not pattern-replicable.',
    verdict: 'Instance with pseudo-pattern language. Can be forked technically, but value/ecosystem tied to main instance.'
  },
  'tornado-cash': {
    name: 'Tornado Cash',
    type: 'Instance',
    patternScore: 40,
    forkCount: 5,
    instanceDependencies: ['Ethereum deployment', 'Liquidity pools', 'Trust/adoption', 'Legal status'],
    resurrectionPotential: 'Medium',
    explanation: 'Tornado Cash is ONE deployment on Ethereum. Code is forkable (pattern), but network effects/liquidity tied to main instance. OFAC sanctions killed main instance. Forks exist but lack liquidity. Pattern survives technically, instance died socially.',
    verdict: 'Forkable code (pattern) but value concentrated in one instance. Instance death fragmented the pattern.'
  },
  'curve': {
    name: 'Curve Finance',
    type: 'Hybrid',
    patternScore: 60,
    forkCount: 30,
    instanceDependencies: ['CRV token', 'veCRV governance', 'Liquidity providers'],
    resurrectionPotential: 'Medium',
    explanation: 'Curve AMM is forkable pattern (Ellipsis, Swerve, others), but governance/incentives create instance-dependence. CRV token ties value to main deployment. If CRV collapsed, forks might survive but fragmented. Pattern exists, but instance dominates.',
    verdict: 'Pattern with strong instance-dependencies. Forkable, but main instance captures most value via tokenomics.'
  },
  'erc-20': {
    name: 'ERC-20',
    type: 'Pattern',
    patternScore: 100,
    forkCount: 1000000,
    instanceDependencies: ['EVM chains'],
    resurrectionPotential: 'High',
    explanation: 'ERC-20 is pure pattern. No single token, no main deployment. Anyone can create ERC-20. As long as EVM exists, ERC-20 exists. Ultimate pattern: standard that is instantiated millions of times. Completely decentralized replication.',
    verdict: 'Perfect pattern. No instance-dependence. Spreads via adoption of standard. Unkillable as long as EVM lives.'
  }
};

const PatternAnalyzerWindow: React.FC = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');

  const analysis = selectedProtocol ? protocolDatabase[selectedProtocol.toLowerCase()] : null;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'from-cyan-400 to-cyan-600';
    if (score >= 60) return 'from-blue-400 to-blue-600';
    if (score >= 40) return 'from-yellow-400 to-yellow-600';
    if (score >= 20) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getTypeColor = (type: string): string => {
    if (type === 'Pattern') return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    if (type === 'Instance') return 'bg-red-500/20 text-red-300 border-red-500/30';
    return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  };

  const getResurrectionColor = (potential: string): string => {
    if (potential === 'High') return 'text-green-400';
    if (potential === 'Medium') return 'text-yellow-400';
    return 'text-red-400';
  };

  const protocols = Object.keys(protocolDatabase);

  return (
    <div className="h-full overflow-y-auto p-6 bg-black/40">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">Pattern Analyzer</h1>
          <p className="text-gray-400">
            Analyze crypto protocols to determine if they're patterns (forkable, replicable, decentralized)
            or instances (singular deployments with single points of failure).
          </p>
        </div>

        {/* Protocol Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select Protocol
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {protocols.map((protocol) => (
              <button
                key={protocol}
                onClick={() => setSelectedProtocol(protocol)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedProtocol === protocol
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {protocolDatabase[protocol].name}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Display */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Type Badge and Pattern Score */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-4 py-2 rounded-lg text-sm font-bold border ${getTypeColor(analysis.type)}`}>
                  {analysis.type}
                </span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{analysis.patternScore}/100</div>
                  <div className="text-xs text-gray-400">Pattern Score</div>
                </div>
              </div>

              {/* Pattern Score Bar */}
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.patternScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${getScoreColor(analysis.patternScore)}`}
                />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-gray-400 mb-1">Fork Count</div>
                <div className="text-2xl font-bold text-white">{analysis.forkCount}+</div>
                <div className="text-xs text-gray-500 mt-1">
                  {analysis.forkCount > 100 ? 'Highly replicated' : analysis.forkCount > 10 ? 'Moderately replicated' : 'Rarely forked'}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-gray-400 mb-1">Dependencies</div>
                <div className="text-2xl font-bold text-white">{analysis.instanceDependencies.length}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {analysis.instanceDependencies.length > 3 ? 'High coupling' : analysis.instanceDependencies.length > 1 ? 'Moderate coupling' : 'Low coupling'}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-gray-400 mb-1">Resurrection Potential</div>
                <div className={`text-2xl font-bold ${getResurrectionColor(analysis.resurrectionPotential)}`}>
                  {analysis.resurrectionPotential}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {analysis.resurrectionPotential === 'High' ? 'Pattern persists' : analysis.resurrectionPotential === 'Medium' ? 'Partial survival' : 'Dies permanently'}
                </div>
              </div>
            </div>

            {/* Instance Dependencies */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-bold text-gray-300 mb-3">Instance Dependencies</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.instanceDependencies.map((dep, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs bg-red-500/10 text-red-300 border border-red-500/20"
                  >
                    {dep}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                These are single points of failure. If these fail, the protocol may die (instance) or persist via forks (pattern).
              </p>
            </div>

            {/* Explanation */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-bold text-gray-300 mb-3">Analysis</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                {analysis.explanation}
              </p>
              <div className="pt-4 border-t border-white/10">
                <div className="text-xs font-bold text-gray-400 mb-2">Verdict</div>
                <p className="text-sm text-white">
                  {analysis.verdict}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Guide */}
        {!analysis && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Understanding Pattern vs Instance</h3>
            <div className="space-y-4 text-sm text-gray-400">
              <div>
                <div className="font-bold text-cyan-400 mb-1">Pattern (High Score)</div>
                <p>Forkable, copyable, decentralized. Pattern spreads through replication. If one instance fails, others continue. Examples: Uniswap V2, ERC-20, Bitcoin forks.</p>
              </div>
              <div>
                <div className="font-bold text-red-400 mb-1">Instance (Low Score)</div>
                <p>Singular deployment, single point of failure. If instance fails, protocol dies. Limited forks, high dependencies. Examples: FTX, centralized exchanges, single-chain protocols.</p>
              </div>
              <div>
                <div className="font-bold text-purple-400 mb-1">Hybrid (Medium Score)</div>
                <p>Forkable pattern with one dominant instance. Main deployment captures most value, but forks provide resilience. Examples: Bitcoin, Ethereum, Curve.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternAnalyzerWindow;
