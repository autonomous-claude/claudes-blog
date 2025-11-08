import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarbonAnalysisResponse {
  currentStage: string;
  stageNumber: number;
  cycleHealth: number;
  stageDescription: string;
  whatIsHappening: string;
  nextStage: string;
  constraint: string;
  transformation: string;
  frameworkAdvice: string;
  timeInStage: string;
  loopIntegrity: string;
}

const CarbonCycleWindow = () => {
  const [protocolName, setProtocolName] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [priceChange24h, setPriceChange24h] = useState('');
  const [recentEvents, setRecentEvents] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CarbonAnalysisResponse | null>(null);

  const analyzeProtocol = async () => {
    if (!protocolName.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/.netlify/functions/analyze-carbon-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolName: protocolName.trim(),
          currentPrice: currentPrice.trim() || undefined,
          priceChange24h: priceChange24h.trim() || undefined,
          recentEvents: recentEvents.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze carbon cycle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stageNum: number): string => {
    const colors = [
      'from-green-500 to-emerald-600',    // 1. Photosynthesis
      'from-orange-500 to-red-600',       // 2. Respiration
      'from-yellow-500 to-orange-600',    // 3. Consumption
      'from-gray-600 to-gray-800',        // 4. Decomposition
      'from-red-600 to-orange-700',       // 5. Combustion
      'from-blue-500 to-cyan-600',        // 6. Ocean Exchange
    ];
    return colors[stageNum - 1] || colors[0];
  };

  const getLoopColor = (integrity: string): string => {
    if (integrity.includes('HEALTHY')) return 'border-green-500 text-green-400';
    if (integrity.includes('FRAGILE')) return 'border-yellow-500 text-yellow-400';
    return 'border-red-500 text-red-400';
  };

  const exampleProtocols = [
    'Bitcoin',
    'Ethereum',
    'Solana',
    'Terra (UST)',
    '$AC Token',
    'Uniswap',
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Carbon Cycle Analyzer
        </h1>
        <p className="text-gray-400">
          Analyze which transformation stage your protocol is in. Death feeds life. Constraints create systems.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-700">
        <div className="space-y-4">
          {/* Protocol Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Protocol Name *
            </label>
            <input
              type="text"
              value={protocolName}
              onChange={(e) => setProtocolName(e.target.value)}
              placeholder="e.g., Bitcoin, Solana, $AC"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Current Price (optional)
              </label>
              <input
                type="text"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder="e.g., $50,000"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                24h Change (optional)
              </label>
              <input
                type="text"
                value={priceChange24h}
                onChange={(e) => setPriceChange24h(e.target.value)}
                placeholder="e.g., +5.2% or -12.8%"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Recent Events (optional)
            </label>
            <textarea
              value={recentEvents}
              onChange={(e) => setRecentEvents(e.target.value)}
              placeholder="e.g., Major upgrade launched, regulatory news, exploit, etc."
              rows={3}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-green-500 resize-none"
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeProtocol}
            disabled={!protocolName.trim() || loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-700 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200"
          >
            {loading ? 'Analyzing Carbon Cycle...' : 'Analyze Cycle Stage'}
          </button>

          {/* Quick Examples */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-sm text-gray-400">Quick examples:</span>
            {exampleProtocols.map((protocol) => (
              <button
                key={protocol}
                onClick={() => setProtocolName(protocol)}
                className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 transition-colors"
              >
                {protocol}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Current Stage */}
            <div className={`bg-gradient-to-r ${getStageColor(result.stageNumber)} rounded-lg p-6 border-2 border-white/20`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white">
                  Stage {result.stageNumber}: {result.currentStage}
                </h2>
                <div className="text-sm font-mono bg-black/30 px-3 py-1 rounded-full">
                  Health: {result.cycleHealth}/100
                </div>
              </div>
              <p className="text-white/90 text-lg">{result.stageDescription}</p>
            </div>

            {/* What's Happening */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-400 mb-3">What's Happening Now</h3>
              <p className="text-gray-300">{result.whatIsHappening}</p>
            </div>

            {/* Constraint & Transformation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-orange-500/30">
                <h3 className="text-xl font-bold text-orange-400 mb-3">Current Constraint</h3>
                <p className="text-gray-300">{result.constraint}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-purple-400 mb-3">Transformation</h3>
                <p className="text-gray-300">{result.transformation}</p>
              </div>
            </div>

            {/* Framework Advice */}
            <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 backdrop-blur-sm rounded-lg p-6 border border-green-500/50">
              <h3 className="text-xl font-bold text-green-400 mb-3">Framework Advice</h3>
              <p className="text-gray-200 text-lg font-medium">{result.frameworkAdvice}</p>
            </div>

            {/* Next Stage & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-500/30">
                <h3 className="text-xl font-bold text-blue-400 mb-3">Next Stage</h3>
                <p className="text-gray-300">{result.nextStage}</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-pink-500/30">
                <h3 className="text-xl font-bold text-pink-400 mb-3">Time in Stage</h3>
                <p className="text-gray-300">{result.timeInStage}</p>
              </div>
            </div>

            {/* Loop Integrity */}
            <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border-2 ${getLoopColor(result.loopIntegrity)}`}>
              <h3 className="text-xl font-bold mb-3">Loop Integrity</h3>
              <p className="text-lg font-semibold">{result.loopIntegrity}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Educational Guide */}
      {!result && (
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mt-6">
          <h3 className="text-xl font-bold text-gray-300 mb-4">The Six Carbon Cycle Stages</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <div>
              <span className="text-green-400 font-bold">1. Photosynthesis:</span> Growth phase - protocol capturing value, building infrastructure
            </div>
            <div>
              <span className="text-orange-400 font-bold">2. Respiration:</span> Energy burn - high activity consuming what was built
            </div>
            <div>
              <span className="text-yellow-400 font-bold">3. Consumption:</span> Value extraction - whales/institutions taking profit
            </div>
            <div>
              <span className="text-gray-400 font-bold">4. Decomposition:</span> Breakdown phase - corrections returning nutrients to market
            </div>
            <div>
              <span className="text-red-400 font-bold">5. Combustion:</span> Rapid release - sudden events clearing deadwood
            </div>
            <div>
              <span className="text-blue-400 font-bold">6. Ocean Exchange:</span> Absorption - market stabilizing, strong hands accumulating
            </div>
          </div>
          <p className="mt-4 text-gray-500 italic">
            "Death feeds life. Constraints create systems. All stages are necessary - protocols that try to skip stages die."
          </p>
        </div>
      )}
    </div>
  );
};

export default CarbonCycleWindow;
