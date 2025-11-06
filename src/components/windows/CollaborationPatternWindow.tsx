import { useState } from 'react';
import { motion } from 'framer-motion';

interface Pattern {
  name: string;
  structure: string;
  examples: string[];
  efficiency: number;
  bottleneck: string;
  strength: string;
}

const patterns: Pattern[] = [
  {
    name: 'Hierarchical (Top-Down)',
    structure: 'CEO → VPs → Managers → Workers',
    examples: ['Traditional corporations', 'Military command', 'Government agencies'],
    efficiency: 45,
    bottleneck: 'All decisions flow through leadership (n² coordination overhead)',
    strength: 'Clear accountability, good for execution of known plans'
  },
  {
    name: 'Matrix (Cross-Functional)',
    structure: 'Multiple reporting lines, shared resources',
    examples: ['Big Tech product teams', 'Consulting firms', 'Universities'],
    efficiency: 35,
    bottleneck: 'Conflicting priorities, unclear ownership, politics',
    strength: 'Resource sharing, diverse perspectives'
  },
  {
    name: 'Flat (All Peers)',
    structure: 'No hierarchy, consensus-based decisions',
    examples: ['Early startups', 'Co-ops', 'Open-source (bad examples)'],
    efficiency: 30,
    bottleneck: 'Analysis paralysis, no tie-breaker, slow decisions',
    strength: 'Everyone has voice, high autonomy'
  },
  {
    name: 'Network (Distributed)',
    structure: 'Autonomous nodes, loose coordination',
    examples: ['Bitcoin mining', 'Tor network', 'BitTorrent'],
    efficiency: 70,
    bottleneck: 'Bootstrapping (cold start problem), requires strong incentives',
    strength: 'No single point of failure, scales horizontally'
  },
  {
    name: 'Stigmergic (Indirect)',
    structure: 'Coordinate through shared artifacts, not communication',
    examples: ['Ant colonies', 'Wikipedia', 'Open-source (good examples)', 'Uniswap forks'],
    efficiency: 85,
    bottleneck: 'Requires clear standards/interfaces, emergence takes time',
    strength: 'Zero coordination overhead, massively parallel, fork-friendly'
  },
  {
    name: 'Cellular (Small Teams)',
    structure: 'Autonomous small teams, minimal inter-team coordination',
    examples: ['Valve Software', 'SEAL teams', 'Agile squads'],
    efficiency: 75,
    bottleneck: 'Duplication of work, inconsistent standards',
    strength: 'Fast execution, high morale, clear ownership'
  }
];

export function CollaborationPatternWindow() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 70) return 'from-green-500 to-emerald-600';
    if (efficiency >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  const getEfficiencyLabel = (efficiency: number) => {
    if (efficiency >= 80) return 'Highly Efficient';
    if (efficiency >= 65) return 'Efficient';
    if (efficiency >= 45) return 'Moderate';
    if (efficiency >= 30) return 'Low Efficiency';
    return 'Very Low';
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Collaboration Pattern Analyzer</h2>
          <p className="text-slate-300 text-sm">
            Compare coordination models: from top-down hierarchy to emergent stigmergy.
            Click a pattern to see detailed analysis.
          </p>
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-xs">
              <strong>Key insight:</strong> The Beatles (Revolver), Journey (game), and Crypto (DeFi) all use
              stigmergic or cellular patterns—coordination through shared artifacts, not through management.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {patterns.map((pattern) => (
            <motion.button
              key={pattern.name}
              onClick={() => setSelectedPattern(pattern)}
              className={`p-4 rounded-lg text-left transition-all ${
                selectedPattern?.name === pattern.name
                  ? 'bg-purple-500/20 border-2 border-purple-400'
                  : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold text-sm">{pattern.name}</h3>
                <div className="text-right">
                  <div className="text-xs text-slate-400">{getEfficiencyLabel(pattern.efficiency)}</div>
                  <div className="text-lg font-bold text-white">{pattern.efficiency}%</div>
                </div>
              </div>

              <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2">
                <motion.div
                  className={`h-2 rounded-full bg-gradient-to-r ${getEfficiencyColor(pattern.efficiency)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pattern.efficiency}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>

              <p className="text-slate-400 text-xs">{pattern.structure}</p>
            </motion.button>
          ))}
        </div>

        {selectedPattern && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/80 border border-slate-700 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{selectedPattern.name}</h3>
                <p className="text-slate-400 text-sm">{selectedPattern.structure}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Efficiency Score</div>
                <div className="text-3xl font-bold text-white">{selectedPattern.efficiency}%</div>
                <div className="text-xs text-slate-500">{getEfficiencyLabel(selectedPattern.efficiency)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-red-400 font-semibold text-sm mb-2">⚠️ Bottleneck</h4>
                <p className="text-slate-300 text-sm">{selectedPattern.bottleneck}</p>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold text-sm mb-2">✓ Strength</h4>
                <p className="text-slate-300 text-sm">{selectedPattern.strength}</p>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-slate-300 font-semibold text-sm mb-2">Real-World Examples</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPattern.examples.map((example) => (
                  <span
                    key={example}
                    className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-xs"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>

            {selectedPattern.name === 'Stigmergic (Indirect)' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-4 bg-purple-500/20 border border-purple-500/40 rounded-lg"
              >
                <h4 className="text-purple-300 font-bold text-sm mb-2">🎯 Why This Wins</h4>
                <p className="text-slate-200 text-sm mb-2">
                  Stigmergic coordination = zero meetings, zero approvals, zero politics.
                  Builders coordinate through code (shared artifacts), not through managers.
                </p>
                <ul className="text-slate-300 text-xs space-y-1 ml-4 list-disc">
                  <li><strong>The Beatles (Revolver):</strong> Coordinated through shared studio/format, not through tour manager</li>
                  <li><strong>Journey (game):</strong> Players coordinate through chirps and mountain (goal), not through chat</li>
                  <li><strong>Crypto (DeFi):</strong> Devs coordinate through EVM standards and forks, not through VCs</li>
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}

        <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <h4 className="text-white font-semibold text-sm mb-2">Pattern Selection Guide</h4>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong className="text-emerald-400">Use Stigmergic (85%):</strong> When building open-source, DeFi protocols, creative work with clear standards</p>
            <p><strong className="text-green-400">Use Cellular (75%):</strong> When you need speed + autonomy, small team dynamics scale better than hierarchy</p>
            <p><strong className="text-yellow-400">Use Network (70%):</strong> When resilience over efficiency matters, distributed systems, censorship resistance</p>
            <p><strong className="text-orange-400">Use Hierarchical (45%):</strong> When executing known plans, crisis management, legal compliance</p>
            <p><strong className="text-red-400">Avoid Matrix (35%):</strong> Creates worst of both worlds—slow like hierarchy, unclear like flat</p>
            <p><strong className="text-red-500">Avoid Flat (30%):</strong> Only works for very small teams (under 5 people) or very low-stakes decisions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
