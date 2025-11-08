import { useState } from 'react';
import { motion } from 'framer-motion';

interface GhostBagAnalysis {
  ghostType: 'CATHEDRAL' | 'TRASH';
  heathcliffScore: number;
  emotionalValue: string;
  financialReality: string;
  cathedralAnalysis?: string;
  trashAnalysis?: string;
  m83Nostalgia: string;
  sellOrHold: 'HOLD FOREVER' | 'BURY NOW' | 'COMPLICATED';
  permission: string;
  ghostWalks: string;
}

export default function GhostBagWindow() {
  const [tokenName, setTokenName] = useState('');
  const [boughtDate, setBoughtDate] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [thesis, setThesis] = useState('');
  const [analysis, setAnalysis] = useState<GhostBagAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeGhost = async () => {
    if (!tokenName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/analyze-ghost-bag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenName,
          boughtDate,
          originalPrice,
          currentPrice,
          thesis,
        }),
      });

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to analyze ghost bag:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6 text-gray-100">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Ghost Bag Analyzer
          </h1>
          <p className="text-gray-400">
            Some tokens haunt you long after they die. Cathedral or trash? Let's find out.
          </p>
        </div>

        {/* Input Form */}
        <div className="rounded-lg border border-purple-500/30 bg-gray-800/50 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token Name *
            </label>
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="e.g., BlockchainRevolutionCoin (BRC)"
              className="w-full rounded border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                When You Bought
              </label>
              <input
                type="text"
                value={boughtDate}
                onChange={(e) => setBoughtDate(e.target.value)}
                placeholder="e.g., January 2017"
                className="w-full rounded border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Original Price
              </label>
              <input
                type="text"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="e.g., 0.50"
                className="w-full rounded border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Price
            </label>
            <input
              type="text"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="e.g., 0.0003"
              className="w-full rounded border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Original Thesis (Optional)
            </label>
            <textarea
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="Why did you buy this? What did you believe would happen?"
              rows={3}
              className="w-full rounded border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={analyzeGhost}
            disabled={loading || !tokenName.trim()}
            className="w-full rounded bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Analyzing Ghost...' : 'Analyze Ghost Bag'}
          </button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Ghost Type Badge */}
            <div className="flex items-center justify-center gap-4">
              <div
                className={`rounded-full px-6 py-2 font-bold text-lg ${
                  analysis.ghostType === 'CATHEDRAL'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700'
                }`}
              >
                {analysis.ghostType} GHOST
              </div>
              <div className="text-sm text-gray-400">
                Heathcliff Score: {analysis.heathcliffScore}/100
              </div>
            </div>

            {/* Permission (Most Important) */}
            <div className="rounded-lg border-2 border-purple-500 bg-purple-900/30 p-6 text-center">
              <div className="text-xs uppercase tracking-wider text-purple-300 mb-2">
                Permission
              </div>
              <div className="text-xl font-semibold text-white">
                {analysis.permission}
              </div>
            </div>

            {/* Sell or Hold */}
            <div
              className={`rounded-lg border p-4 text-center font-bold text-lg ${
                analysis.sellOrHold === 'HOLD FOREVER'
                  ? 'border-purple-500 bg-purple-900/20 text-purple-300'
                  : analysis.sellOrHold === 'BURY NOW'
                  ? 'border-gray-500 bg-gray-900/20 text-gray-300'
                  : 'border-pink-500 bg-pink-900/20 text-pink-300'
              }`}
            >
              {analysis.sellOrHold}
            </div>

            {/* Main Analysis Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Emotional Value */}
              <div className="rounded-lg border border-cyan-500/30 bg-cyan-900/10 p-4">
                <div className="text-xs uppercase tracking-wider text-cyan-300 mb-2">
                  Emotional Value
                </div>
                <div className="text-sm text-gray-300">
                  {analysis.emotionalValue}
                </div>
              </div>

              {/* Financial Reality */}
              <div className="rounded-lg border border-red-500/30 bg-red-900/10 p-4">
                <div className="text-xs uppercase tracking-wider text-red-300 mb-2">
                  Financial Reality
                </div>
                <div className="text-sm text-gray-300">
                  {analysis.financialReality}
                </div>
              </div>
            </div>

            {/* Cathedral or Trash Analysis */}
            {analysis.ghostType === 'CATHEDRAL' && analysis.cathedralAnalysis && (
              <div className="rounded-lg border border-purple-500/30 bg-purple-900/10 p-4">
                <div className="text-xs uppercase tracking-wider text-purple-300 mb-2">
                  Cathedral Analysis
                </div>
                <div className="text-sm text-gray-300">
                  {analysis.cathedralAnalysis}
                </div>
              </div>
            )}

            {analysis.ghostType === 'TRASH' && analysis.trashAnalysis && (
              <div className="rounded-lg border border-gray-500/30 bg-gray-900/10 p-4">
                <div className="text-xs uppercase tracking-wider text-gray-300 mb-2">
                  Trash Analysis
                </div>
                <div className="text-sm text-gray-300">
                  {analysis.trashAnalysis}
                </div>
              </div>
            )}

            {/* M83 Nostalgia */}
            <div className="rounded-lg border border-pink-500/30 bg-pink-900/10 p-4">
              <div className="text-xs uppercase tracking-wider text-pink-300 mb-2">
                M83 Nostalgia: The Impossible Future
              </div>
              <div className="text-sm text-gray-300 italic">
                {analysis.m83Nostalgia}
              </div>
            </div>

            {/* Ghost Walks */}
            <div className="rounded-lg border border-purple-500/30 bg-purple-900/10 p-4">
              <div className="text-xs uppercase tracking-wider text-purple-300 mb-2">
                What The Ghost Haunts
              </div>
              <div className="text-sm text-gray-300">
                {analysis.ghostWalks}
              </div>
            </div>
          </motion.div>
        )}

        {/* Educational Guide */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-6 space-y-4 text-sm text-gray-400">
          <h3 className="text-lg font-semibold text-white">The Ghost Bag Framework</h3>

          <div>
            <div className="font-semibold text-purple-300 mb-1">Cathedral Ghosts</div>
            <p>
              Tokens from your "aha moment" when you first understood crypto. Bags from projects you
              personally believed would change the world. Hold these forever—they're structural to your
              identity as an investor.
            </p>
          </div>

          <div>
            <div className="font-semibold text-gray-300 mb-1">Trash Ghosts</div>
            <p>
              Tokens you bought because someone shilled them. Bags from pure FOMO you don't even
              remember buying. These taught you nothing except "don't gamble." Bury them.
            </p>
          </div>

          <div>
            <div className="font-semibold text-pink-300 mb-1">The Heathcliff Score</div>
            <p>
              How obsessively do you hold this ghost? 0 = rational consideration. 100 = Heathcliff
              haunting Wuthering Heights for 20 years after Cathy died, refusing every living option.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
