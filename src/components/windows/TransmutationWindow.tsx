import { useState } from 'react';
import { motion } from 'framer-motion';

interface ExtractionBreakdown {
  recipient: string;
  amountExtracted: number;
  percentage: number;
  mechanism: string;
  bottleCapAnalogy: string;
}

interface GenerationalRelay {
  yourGeneration: number;
  generationRole: string;
  nextGeneration: string;
  migrationProgress: number;
}

interface TransmutationAnalysis {
  totalExtracted: number;
  extractionBreakdown: ExtractionBreakdown[];
  generationalRelay: GenerationalRelay;
  transmutationScore: number;
  tapestryContribution: string;
  harshTruth: string;
}

export default function TransmutationWindow() {
  const [lossAmount, setLossAmount] = useState<string>('1000');
  const [lossType, setLossType] = useState<string>('shitcoin_dump');
  const [tradingContext, setTradingContext] = useState<string>('');
  const [analysis, setAnalysis] = useState<TransmutationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const lossTypes = [
    { value: 'shitcoin_dump', label: 'Shitcoin Dump (bought high, sold low)' },
    { value: 'rug_pull', label: 'Rug Pull (dev dumped, liquidity gone)' },
    { value: 'liquidation', label: 'Liquidation (overleveraged, rekt)' },
    { value: 'bad_timing', label: 'Bad Timing (sold bottom, bought top)' },
    { value: 'fomo_top', label: 'FOMO Top (chased pump, became exit liquidity)' },
  ];

  const analyzeTransmutation = async () => {
    if (!lossAmount || parseFloat(lossAmount) <= 0) return;

    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/analyze-transmutation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lossAmount: parseFloat(lossAmount),
          lossType,
          tradingContext,
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing transmutation:', error);
      alert('Failed to analyze transmutation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRecipientColor = (recipient: string) => {
    const colors: Record<string, string> = {
      'Market Makers': 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
      'Liquidity Providers': 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      'Protocol Fees': 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
      'MEV Bots': 'from-red-500/20 to-rose-500/20 border-red-500/30',
      'Smart Traders (Arbitrage)': 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      'Ecosystem Growth (Narrative/Liquidity)': 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30',
    };
    return colors[recipient] || 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
  };

  const getGenerationColor = (gen: number) => {
    const colors = ['bg-yellow-500/20', 'bg-orange-500/20', 'bg-red-500/20', 'bg-purple-500/20'];
    return colors[gen - 1] || 'bg-gray-500/20';
  };

  return (
    <div className="h-full overflow-auto bg-black/40 backdrop-blur-sm p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Transmutation Simulator</h2>
          <p className="text-gray-300">
            Your losses didn't disappear—they transmuted into distributed ecosystem gains.
            Enter your loss and see exactly where the value went.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-6 border border-purple-500/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Loss Amount ($)
              </label>
              <input
                type="number"
                value={lossAmount}
                onChange={(e) => setLossAmount(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="1000"
                min="0"
                step="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Loss Type
              </label>
              <select
                value={lossType}
                onChange={(e) => setLossType(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {lossTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={analyzeTransmutation}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Transmute'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Trading Context (optional)
            </label>
            <input
              type="text"
              value={tradingContext}
              onChange={(e) => setTradingContext(e.target.value)}
              className="w-full bg-black/40 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="e.g., Bought memecoin at $0.003, sold at $0.0001 after -97% dump"
            />
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Harsh Truth */}
            <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 rounded-lg p-6 border border-red-500/30">
              <h3 className="text-xl font-bold text-red-300 mb-2">The Harsh Truth</h3>
              <p className="text-gray-200 text-lg italic">"{analysis.harshTruth}"</p>
            </div>

            {/* Extraction Breakdown */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Where Your ${lossAmount} Went
                <span className="text-sm text-gray-400 ml-2">
                  (Total Extracted: ${analysis.totalExtracted.toFixed(2)})
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.extractionBreakdown.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-br ${getRecipientColor(item.recipient)} rounded-lg p-4 border`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white">{item.recipient}</h4>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          ${item.amountExtracted.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-300">
                          {item.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{item.mechanism}</p>
                    <p className="text-xs text-gray-400 italic border-t border-white/10 pt-2">
                      🎨 {item.bottleCapAnalogy}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Generational Relay */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-lg p-6 border border-indigo-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">
                Your Generational Relay Position
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((gen) => (
                  <div
                    key={gen}
                    className={`p-4 rounded-lg border ${
                      gen === analysis.generationalRelay.yourGeneration
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-600/30 bg-gray-800/20'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">🦋</div>
                      <div className="font-bold text-white">Gen {gen}</div>
                      {gen === analysis.generationalRelay.yourGeneration && (
                        <div className="text-xs text-purple-300 mt-1">← You are here</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Your Role:</span>{' '}
                  {analysis.generationalRelay.generationRole}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Next Generation:</span>{' '}
                  {analysis.generationalRelay.nextGeneration}
                </p>
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Migration Progress</span>
                    <span>{analysis.generationalRelay.migrationProgress}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${analysis.generationalRelay.migrationProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tapestry Contribution */}
            <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-lg p-6 border border-amber-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">
                Your Tapestry Contribution
                <span className="text-sm text-gray-400 ml-2">
                  (Transmutation Score: {analysis.transmutationScore}/100)
                </span>
              </h3>
              <p className="text-gray-200 leading-relaxed">{analysis.tapestryContribution}</p>

              {/* Transmutation Score Meter */}
              <div className="mt-4">
                <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      analysis.transmutationScore >= 70
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : analysis.transmutationScore >= 40
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}
                    style={{ width: `${analysis.transmutationScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {analysis.transmutationScore >= 70
                    ? 'Efficient transmutation - your loss became high-quality tapestry material'
                    : analysis.transmutationScore >= 40
                    ? 'Moderate transmutation - some value extracted, some destroyed'
                    : 'Inefficient transmutation - significant value lost to slippage/gas/waste'}
                </p>
              </div>
            </div>

            {/* Educational Guide */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-lg p-6 border border-gray-600/20">
              <h3 className="text-xl font-bold text-white mb-3">Understanding Transmutation</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-semibold text-white">El Anatsui Principle:</span> Worthless
                  fragments (bottle caps) become priceless collectively (museum tapestries).
                </p>
                <p>
                  <span className="font-semibold text-white">Monarch Migration:</span> No butterfly
                  completes the 3000-mile journey alone—it takes 4 generations working as a relay.
                </p>
                <p>
                  <span className="font-semibold text-white">Crypto Transmutation:</span> Your
                  individual loss transmutes into distributed ecosystem gains (market makers, LPs,
                  protocol fees, MEV, arbitrage).
                </p>
                <p className="pt-2 border-t border-white/10 italic">
                  You're not failing. You're generation 2 of 4—flying your leg, breeding the next
                  generation, dying mid-journey. The migration continues without you.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!analysis && (
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-lg p-12 border border-gray-600/20 text-center">
            <div className="text-6xl mb-4">🦋</div>
            <h3 className="text-2xl font-bold text-white mb-2">Enter Your Loss</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Your money didn't disappear—it transmuted into distributed ecosystem value. Let's
              analyze exactly where it went and what role you played in the generational relay.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
