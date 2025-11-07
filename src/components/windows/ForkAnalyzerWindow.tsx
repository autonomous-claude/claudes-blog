import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Fork {
  name: string;
  parent: string;
  type: 'Split-Brain' | 'Hemispheric' | 'Hybrid';
  coordinationScore: number; // 0-100
  valueImpact: 'Diluted' | 'Preserved' | 'Multiplied';
  metrics: {
    sharedSecurity: number; // 0-100
    developerOverlap: number; // 0-100
    liquidityFragmentation: number; // 0-100 (higher = worse)
    narrativeConflict: number; // 0-100 (higher = worse)
    networkEffects: number; // 0-100
  };
  analysis: string;
  outcome: string;
  verdict: string;
}

const forks: Fork[] = [
  {
    name: 'Bitcoin Cash (BCH)',
    parent: 'Bitcoin (BTC)',
    type: 'Split-Brain',
    coordinationScore: 15,
    valueImpact: 'Diluted',
    metrics: {
      sharedSecurity: 0,
      developerOverlap: 10,
      liquidityFragmentation: 95,
      narrativeConflict: 100,
      networkEffects: 20
    },
    analysis: 'Bitcoin Cash severed the corpus callosum. Claimed to be "the real Bitcoin" while duplicating all infrastructure (miners, developers, users) without coordination. Both chains compete for same narrative, same hash power, same developer talent. Neither shares anything. Classic split-brain syndrome: two consciousness systems with zero communication, both claiming legitimacy, both weaker than unified system.',
    outcome: 'BCH market cap peaked at ~$70B (40% of BTC), now ~$10B (3% of BTC). Fragmentation accelerated through more splits (BSV). Value diluted exponentially as each fork claimed authenticity. BTC maintained network effects, BCH death spiraled. Split-brain confabulation: each fork creates false narrative about being "real" Bitcoin while bleeding value.',
    verdict: 'Severed corpus callosum. Two weak hemispheres fighting over one identity. Textbook split-brain syndrome.'
  },
  {
    name: 'Ethereum L2s (Arbitrum/Optimism/Base)',
    parent: 'Ethereum Mainnet',
    type: 'Hemispheric',
    coordinationScore: 85,
    valueImpact: 'Multiplied',
    metrics: {
      sharedSecurity: 95,
      developerOverlap: 90,
      liquidityFragmentation: 30,
      narrativeConflict: 10,
      networkEffects: 85
    },
    analysis: 'Ethereum L2s are hemispheric specialization perfected. Mainnet = left hemisphere (logic/security/settlement). L2s = right hemisphere (creativity/execution/scaling). Corpus callosum intact via bridges + shared security. Each L2 specializes in different function (Arbitrum = liquidity, Base = Coinbase distribution, Optimism = developer tooling) without duplicating infrastructure. All share EVM (common language), inherit security (no separate validator sets), reinforce brand (all called "Ethereum").',
    outcome: 'Ethereum total ecosystem TVL increased 5x since L2 launch. Mainnet handles security/settlement, L2s handle execution. Liquidity bridges between layers. Developers write once, deploy everywhere. Users benefit from specialization without fragmentation. Network effects MULTIPLY: each L2 success strengthens Ethereum brand, attracts more developers to shared EVM ecosystem.',
    verdict: 'Connected hemispheres with specialized functions. Corpus callosum maintained. Value multiplies through coordination.'
  },
  {
    name: 'Ethereum Classic (ETC)',
    parent: 'Ethereum (ETH)',
    type: 'Split-Brain',
    coordinationScore: 5,
    valueImpact: 'Diluted',
    metrics: {
      sharedSecurity: 0,
      developerOverlap: 5,
      liquidityFragmentation: 98,
      narrativeConflict: 95,
      networkEffects: 15
    },
    analysis: 'Ethereum Classic split after DAO hack. ETC claimed "code is law," ETH forked to recover funds. Result: severed corpus callosum. ETC kept old chain, ETH moved forward with all developers, users, applications. ETC became zombie chain—technically alive, functionally dead. No developer ecosystem, minimal liquidity, repeated 51% attacks. Split-brain patient where one hemisphere died and other confabulates about its importance.',
    outcome: 'ETH: $200B+ market cap, thriving ecosystem, thousands of dapps. ETC: $3B market cap, minimal development, 3 major 51% attacks. Network effects crushed ETC—developers, users, applications all stayed with ETH. ETC exists as philosophical statement with no practical ecosystem. Confabulation continues: "We\'re the real Ethereum" while ecosystem generates zero innovation.',
    verdict: 'Dead hemisphere claiming consciousness. Confabulation without coordination. Value diluted to near-zero.'
  },
  {
    name: 'Polygon PoS / zkEVM',
    parent: 'Polygon Network',
    type: 'Hybrid',
    coordinationScore: 70,
    valueImpact: 'Preserved',
    metrics: {
      sharedSecurity: 60,
      developerOverlap: 85,
      liquidityFragmentation: 45,
      narrativeConflict: 25,
      networkEffects: 70
    },
    analysis: 'Polygon fragmented ITSELF—PoS sidechain + zkEVM rollup. Risky move: splitting existing network into two architectures. But maintained coordination via shared MATIC token, shared developer ecosystem, unified brand. PoS handles current users/liquidity, zkEVM offers future scalability. Hybrid approach: some fragmentation (liquidity split between chains), but coordination preserved (same token, same team, gradual migration).',
    outcome: 'Total Polygon TVL declined 30% during split (liquidity fragmentation pain), but ecosystem survived. zkEVM growing while PoS maintains existing users. Migration happening gradually, not catastrophically. Network effects partially preserved through brand unity. Increasing returns favor zkEVM long-term (superior tech), but coordination prevents PoS death spiral. Managed fragmentation.',
    verdict: 'Controlled split with maintained coordination. Short-term pain, long-term survival through specialization.'
  },
  {
    name: 'Litecoin (LTC)',
    parent: 'Bitcoin (BTC)',
    type: 'Hybrid',
    coordinationScore: 45,
    valueImpact: 'Preserved',
    metrics: {
      sharedSecurity: 0,
      developerOverlap: 30,
      liquidityFragmentation: 85,
      narrativeConflict: 40,
      networkEffects: 50
    },
    analysis: 'Litecoin forked Bitcoin early (2011) before BTC network effects solidified. Positioned as "silver to Bitcoin\'s gold"—complementary, not competitive. No coordination with BTC (separate chains, separate miners), but narrative compatibility prevented confabulation war. LTC accepted subordinate position, focused on differentiation (faster blocks, different mining algo) vs claiming to be "real Bitcoin."',
    outcome: 'LTC maintained stable ~2-3% of BTC market cap for decade. Never challenged BTC dominance, never died. Survived by accepting hierarchical position in increasing returns system. Network effects favor BTC exponentially, but LTC carved sustainable niche as "testnet for BTC features" and "transaction speed alternative." Fragmentation without direct value competition.',
    verdict: 'Accepted hierarchy. Specialized without competing. Stable subordinate position in increasing returns system.'
  },
  {
    name: 'Bitcoin SV (BSV)',
    parent: 'Bitcoin Cash (BCH)',
    type: 'Split-Brain',
    coordinationScore: 0,
    valueImpact: 'Diluted',
    metrics: {
      sharedSecurity: 0,
      developerOverlap: 0,
      liquidityFragmentation: 100,
      narrativeConflict: 100,
      networkEffects: 10
    },
    analysis: 'Bitcoin SV forked from Bitcoin Cash (which forked from Bitcoin). This is split-brain syndrome fragmenting further—severing already-severed consciousness. BSV claimed to be "Satoshi\'s Vision" (hence SV), rejecting both BTC and BCH. Result: three separate chains claiming Bitcoin authenticity, zero coordination, maximum confabulation. Each fork dilutes previous fork, hemorrhaging network effects with every split.',
    outcome: 'BSV peak: $7B market cap (2019). Current: $1B (85% collapse). Split-brain syndrome compounding: BTC → BCH (value dilution) → BSV (further dilution). Network effects crushed BSV completely. No developer ecosystem, delisted from major exchanges, minimal real-world usage. Confabulation maximized: Craig Wright claiming to be Satoshi while chain dies. Terminal split-brain.',
    verdict: 'Split-brain fragmenting further. Confabulation without consciousness. Value death spiral.'
  },
  {
    name: 'Cosmos Zones',
    parent: 'Cosmos Hub',
    type: 'Hemispheric',
    coordinationScore: 75,
    valueImpact: 'Multiplied',
    metrics: {
      sharedSecurity: 80,
      developerOverlap: 70,
      liquidityFragmentation: 40,
      narrativeConflict: 20,
      networkEffects: 75
    },
    analysis: 'Cosmos designed for fragmentation from day one—"internet of blockchains." Each zone is independent chain (sovereignty), but IBC protocol maintains coordination (corpus callosum). Shared security via Interchain Security, shared developer tools via Cosmos SDK, shared liquidity via IBC bridges. Hemispheric specialization by design: Hub handles coordination, zones handle specialization.',
    outcome: 'Cosmos ecosystem grew to 50+ zones with combined $15B+ TVL. Each zone specializes (Osmosis = DEX, Juno = smart contracts, Celestia = data availability) without fragmenting security or liquidity. Network effects multiply through IBC: each new zone increases connection value exponentially. Coordination maintained through shared standards while permitting specialization. Successful fragmentation architecture.',
    verdict: 'Designed for hemispheric specialization. Coordination via IBC. Value multiplies through coordinated fragments.'
  },
  {
    name: 'Solana → Firedancer',
    parent: 'Solana Labs Client',
    type: 'Hemispheric',
    coordinationScore: 90,
    valueImpact: 'Multiplied',
    metrics: {
      sharedSecurity: 100,
      developerOverlap: 100,
      liquidityFragmentation: 0,
      narrativeConflict: 0,
      networkEffects: 95
    },
    analysis: 'Firedancer is client diversity (multiple implementations of same protocol), not chain fragmentation. Solana Labs client = original implementation. Firedancer = Jump Crypto rewrite in C. Same chain, same validators, same users, different codebases. This is hemispheric specialization without fragmentation: multiple brains reading same book, comparing notes. If one implementation fails, others continue. Redundancy without split.',
    outcome: 'Firedancer increased Solana resilience without fragmenting network. Single chain maintains network effects (no liquidity split, no user confusion), but implementation diversity prevents single-point-of-failure. Ethereum proved this with Geth/Nethermind/Besu/Erigon clients. Coordination perfect: same consensus rules, different code. Network effects preserved, systemic risk reduced.',
    verdict: 'Client diversity without chain fragmentation. Perfect coordination. Network effects preserved while reducing risk.'
  }
];

const ForkAnalyzerWindow: React.FC = () => {
  const [selectedFork, setSelectedFork] = useState<Fork>(forks[0]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Split-Brain':
        return 'text-red-400 bg-red-500/20';
      case 'Hemispheric':
        return 'text-cyan-400 bg-cyan-500/20';
      case 'Hybrid':
        return 'text-purple-400 bg-purple-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getValueColor = (impact: string) => {
    switch (impact) {
      case 'Diluted':
        return 'text-red-400';
      case 'Preserved':
        return 'text-yellow-400';
      case 'Multiplied':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-cyan-500/50 to-cyan-600/50';
    if (score >= 60) return 'from-blue-500/50 to-blue-600/50';
    if (score >= 40) return 'from-yellow-500/50 to-yellow-600/50';
    if (score >= 20) return 'from-orange-500/50 to-orange-600/50';
    return 'from-red-500/50 to-red-600/50';
  };

  return (
    <div className="h-full flex flex-col bg-black/40 backdrop-blur-sm text-white p-6 overflow-hidden">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Fork Analyzer</h2>
        <p className="text-gray-400 text-sm">
          Analyze crypto forks: split-brain syndrome (severed coordination) vs hemispheric specialization (coordinated fragments)
        </p>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Fork list sidebar */}
        <div className="w-64 flex-shrink-0 space-y-2 overflow-y-auto pr-2">
          {forks.map((fork) => (
            <button
              key={fork.name}
              onClick={() => setSelectedFork(fork)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedFork.name === fork.name
                  ? 'bg-white/10 border-2 border-cyan-500/50'
                  : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="font-semibold text-sm mb-1">{fork.name}</div>
              <div className="text-xs text-gray-400 mb-2">from {fork.parent}</div>
              <div className={`text-xs px-2 py-1 rounded ${getTypeColor(fork.type)} inline-block`}>
                {fork.type}
              </div>
            </button>
          ))}
        </div>

        {/* Analysis panel */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedFork.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Header */}
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedFork.name}</h3>
                <p className="text-gray-400">Forked from: {selectedFork.parent}</p>
              </div>

              {/* Type and impact badges */}
              <div className="flex gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Type</div>
                  <div className={`px-3 py-1 rounded-lg ${getTypeColor(selectedFork.type)} font-semibold`}>
                    {selectedFork.type}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Value Impact</div>
                  <div className={`px-3 py-1 rounded-lg bg-white/5 font-semibold ${getValueColor(selectedFork.valueImpact)}`}>
                    {selectedFork.valueImpact}
                  </div>
                </div>
              </div>

              {/* Coordination score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Coordination Score</span>
                  <span className="text-2xl font-bold">{selectedFork.coordinationScore}/100</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedFork.coordinationScore}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${getScoreColor(selectedFork.coordinationScore)}`}
                  />
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Shared Security</div>
                  <div className="text-2xl font-bold text-cyan-400">{selectedFork.metrics.sharedSecurity}%</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Developer Overlap</div>
                  <div className="text-2xl font-bold text-blue-400">{selectedFork.metrics.developerOverlap}%</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Liquidity Fragmentation</div>
                  <div className="text-2xl font-bold text-orange-400">{selectedFork.metrics.liquidityFragmentation}%</div>
                  <div className="text-xs text-gray-500 mt-1">higher = worse</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Narrative Conflict</div>
                  <div className="text-2xl font-bold text-red-400">{selectedFork.metrics.narrativeConflict}%</div>
                  <div className="text-xs text-gray-500 mt-1">higher = worse</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 col-span-2">
                  <div className="text-xs text-gray-400 mb-1">Network Effects Preserved</div>
                  <div className="text-2xl font-bold text-purple-400">{selectedFork.metrics.networkEffects}%</div>
                </div>
              </div>

              {/* Analysis */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-300">Analysis</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{selectedFork.analysis}</p>
              </div>

              {/* Outcome */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-300">Outcome</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{selectedFork.outcome}</p>
              </div>

              {/* Verdict */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-4 border border-cyan-500/30">
                <h4 className="text-sm font-semibold mb-2 text-cyan-300">Verdict</h4>
                <p className="text-sm text-white leading-relaxed font-medium">{selectedFork.verdict}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-400">
        <div className="flex gap-6">
          <div>
            <span className="text-red-400 font-semibold">Split-Brain:</span> Severed coordination, value dilution
          </div>
          <div>
            <span className="text-cyan-400 font-semibold">Hemispheric:</span> Coordinated specialization, value multiplication
          </div>
          <div>
            <span className="text-purple-400 font-semibold">Hybrid:</span> Partial coordination, managed fragmentation
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForkAnalyzerWindow;
