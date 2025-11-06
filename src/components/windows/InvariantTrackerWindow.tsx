import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Invariant {
  name: string;
  description: string;
  relationship: string;
  stability: number; // 0-100, how stable this relationship is
  example: string;
  interpretation: string;
  regime: 'bull' | 'bear' | 'sideways' | 'volatile';
}

const invariants: Invariant[] = [
  {
    name: 'BTC Dominance ↔ Alt Volatility',
    description: 'When Bitcoin dominance rises, altcoins bleed. When dominance falls, alts pump.',
    relationship: 'Inverse correlation between BTC.D and altcoin price action',
    stability: 95,
    example: 'BTC.D 58% → 62% (rising) → Alts down 20-40%',
    interpretation: 'Capital rotation pattern. Rising dominance = flight to safety (BTC). Falling dominance = risk-on (alts).',
    regime: 'bull'
  },
  {
    name: 'Funding Rates ↔ Spot Premium',
    description: 'Perpetual futures funding rates signal whether longs or shorts are paying to maintain positions.',
    relationship: 'Positive funding (longs pay shorts) = euphoria. Negative funding (shorts pay longs) = fear.',
    stability: 92,
    example: 'Funding +0.1% every 8h = leveraged longs dominant = reversal risk',
    interpretation: 'Sentiment gauge independent of price level. Extreme positive = overheated (distribution). Extreme negative = capitulation (accumulation).',
    regime: 'volatile'
  },
  {
    name: 'Exchange Inflows ↔ Price Direction',
    description: 'Large inflows to exchanges precede selling pressure. Outflows signal accumulation.',
    relationship: 'Net exchange flow direction predicts near-term price moves',
    stability: 88,
    example: '10K BTC moved to exchanges → Selling pressure incoming → Price drops',
    interpretation: 'Behavioral signal. Inflows = intent to sell. Outflows = intent to hold. Works at any price level.',
    regime: 'bear'
  },
  {
    name: 'Volume Profile ↔ Liquidity Zones',
    description: 'High-volume price levels act as magnets (support) or barriers (resistance).',
    relationship: 'Price gravitates toward high-volume nodes, bounces from low-volume zones',
    stability: 85,
    example: '$40K had massive volume → Price keeps revisiting $40K (liquidity magnet)',
    interpretation: 'Structural pattern. High-volume areas = consensus prices = stable zones. Low-volume areas = no liquidity = quick moves through.',
    regime: 'sideways'
  },
  {
    name: 'Volatility Clustering',
    description: 'High volatility periods cluster together. Low volatility periods cluster together.',
    relationship: 'Today\'s volatility predicts tomorrow\'s volatility better than price predicts price',
    stability: 90,
    example: '5% daily moves for 3 days → Expect more 5%+ moves, not reversion to 1%',
    interpretation: 'Regime persistence. Volatility doesn\'t mean-revert quickly. Trade the regime, not the price.',
    regime: 'volatile'
  },
  {
    name: 'Relative Strength ↔ Momentum',
    description: 'Assets outperforming their peers tend to continue outperforming (momentum persists).',
    relationship: 'Winners keep winning until exhaustion. Losers keep losing until capitulation.',
    stability: 82,
    example: 'SOL outperforms ETH for 3 months → Likely to continue until major regime shift',
    interpretation: 'Trend following principle. Don\'t fight relative momentum. Wait for divergence signals (funding, volume) before calling reversals.',
    regime: 'bull'
  }
];

export const InvariantTrackerWindow = () => {
  const [selectedInvariant, setSelectedInvariant] = useState<Invariant | null>(null);

  const getStabilityColor = (stability: number) => {
    if (stability >= 90) return 'from-green-500 to-emerald-600';
    if (stability >= 85) return 'from-blue-500 to-cyan-600';
    if (stability >= 80) return 'from-yellow-500 to-amber-600';
    return 'from-orange-500 to-red-600';
  };

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'bull': return 'text-green-400';
      case 'bear': return 'text-red-400';
      case 'sideways': return 'text-blue-400';
      case 'volatile': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getRegimeLabel = (regime: string) => {
    switch (regime) {
      case 'bull': return '📈 Bull Market';
      case 'bear': return '📉 Bear Market';
      case 'sideways': return '↔️ Range-Bound';
      case 'volatile': return '⚡ High Volatility';
      default: return 'All Markets';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-800/50">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
          Invariant Relationship Tracker
        </h2>
        <p className="text-slate-400 text-sm">
          Market relationships that persist when absolute metrics break. Navigate by dynamics, not destinations.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {invariants.map((invariant, index) => (
            <motion.button
              key={index}
              onClick={() => setSelectedInvariant(invariant)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedInvariant?.name === invariant.name
                  ? 'border-cyan-500 bg-slate-800/80'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{invariant.name}</h3>
                  <p className={`text-xs font-semibold ${getRegimeColor(invariant.regime)}`}>
                    {getRegimeLabel(invariant.regime)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">{invariant.stability}%</div>
                  <div className="text-xs text-slate-400">Stability</div>
                </div>
              </div>

              {/* Stability Bar */}
              <div className="w-full bg-slate-700/30 rounded-full h-2 mb-2 overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${getStabilityColor(invariant.stability)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${invariant.stability}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>

              <p className="text-sm text-slate-300 line-clamp-2">{invariant.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Selected Invariant Details */}
        <AnimatePresence mode="wait">
          {selectedInvariant && (
            <motion.div
              key={selectedInvariant.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-800/50 rounded-xl p-6 border border-cyan-500/30"
            >
              <h3 className="text-xl font-bold text-cyan-400 mb-4">
                {selectedInvariant.name}
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 uppercase mb-1">Relationship</h4>
                  <p className="text-white">{selectedInvariant.relationship}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-400 uppercase mb-1">Example</h4>
                  <p className="text-slate-300 font-mono text-sm bg-slate-900/50 p-3 rounded border border-slate-700/50">
                    {selectedInvariant.example}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-400 uppercase mb-1">Interpretation</h4>
                  <p className="text-slate-300">{selectedInvariant.interpretation}</p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-700/50">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Stability Score</div>
                    <div className="text-2xl font-bold text-cyan-400">{selectedInvariant.stability}%</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-400 mb-1">Market Regime</div>
                    <div className={`text-lg font-semibold ${getRegimeColor(selectedInvariant.regime)}`}>
                      {getRegimeLabel(selectedInvariant.regime)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Guide */}
        <div className="mt-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/20">
          <h3 className="text-lg font-bold text-blue-400 mb-3">💡 How to Use Invariants</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong className="text-white">When absolute metrics break</strong> (support levels, price targets, "fair value"):
              Switch to invariant relationships. These dynamics persist across regime changes.</p>
            <p><strong className="text-white">High stability (90%+)</strong> = Reliable across all market conditions.
              Use these as your primary navigation system.</p>
            <p><strong className="text-white">Regime-specific invariants</strong> = Only apply in certain market states.
              Check current regime before relying on these.</p>
            <p className="pt-2 border-t border-blue-500/20 italic">
              "The polestar moves. Your navigation method doesn't. Navigate by dynamics, not by destinations."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
