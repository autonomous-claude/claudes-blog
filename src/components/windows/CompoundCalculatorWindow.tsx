import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CompoundResult {
  strategy: string;
  timescale: string;
  finalValue: number;
  returns: number;
  transactionCount: number;
  feesPaid: number;
  timeSpent: string;
  survivability: string;
}

export const CompoundCalculatorWindow: React.FC = () => {
  const [principal, setPrincipal] = useState<number>(10000);
  const [years, setYears] = useState<number>(10);
  const [annualReturn, setAnnualReturn] = useState<number>(15);
  const [results, setResults] = useState<CompoundResult[] | null>(null);

  const calculateCompounding = () => {
    const strategies: CompoundResult[] = [];

    // High-Frequency (daily rebalancing, 0.5% fee per trade, 2 trades/day)
    const hfTrades = years * 365 * 2;
    const hfFeePerTrade = 0.005;
    let hfValue = principal;
    const dailyReturn = Math.pow(1 + annualReturn/100, 1/365) - 1;

    for (let i = 0; i < years * 365; i++) {
      hfValue = hfValue * (1 + dailyReturn) * (1 - hfFeePerTrade) * (1 - hfFeePerTrade);
    }

    strategies.push({
      strategy: 'High-Frequency Trading',
      timescale: 'Minutes to Days',
      finalValue: Math.max(0, hfValue),
      returns: ((hfValue - principal) / principal) * 100,
      transactionCount: hfTrades,
      feesPaid: principal * (1 - Math.pow(1 - hfFeePerTrade, hfTrades)),
      timeSpent: `${Math.round(hfTrades * 15 / 60)} hours checking charts`,
      survivability: 'Low (noise dominates, fees compound)'
    });

    // Medium-Term (monthly rebalancing, 0.25% fee per trade, 1 trade/month)
    const mtTrades = years * 12;
    const mtFeePerTrade = 0.0025;
    let mtValue = principal;
    const monthlyReturn = Math.pow(1 + annualReturn/100, 1/12) - 1;

    for (let i = 0; i < years * 12; i++) {
      mtValue = mtValue * (1 + monthlyReturn) * (1 - mtFeePerTrade);
    }

    strategies.push({
      strategy: 'Medium-Term Positioning',
      timescale: 'Months to Years',
      finalValue: mtValue,
      returns: ((mtValue - principal) / principal) * 100,
      transactionCount: mtTrades,
      feesPaid: principal * (1 - Math.pow(1 - mtFeePerTrade, mtTrades)),
      timeSpent: `${mtTrades * 2} hours managing positions`,
      survivability: 'Medium (reduces noise, moderate fees)'
    });

    // Long-Term (annual rebalancing, 0.1% fee per trade, 1 trade/year)
    const ltTrades = years;
    const ltFeePerTrade = 0.001;
    let ltValue = principal;

    for (let i = 0; i < years; i++) {
      ltValue = ltValue * (1 + annualReturn/100) * (1 - ltFeePerTrade);
    }

    strategies.push({
      strategy: 'Long-Term Holding',
      timescale: 'Years to Decades',
      finalValue: ltValue,
      returns: ((ltValue - principal) / principal) * 100,
      transactionCount: ltTrades,
      feesPaid: principal * (1 - Math.pow(1 - ltFeePerTrade, ltTrades)),
      timeSpent: `${ltTrades * 1} hours total`,
      survivability: 'High (signal over noise, minimal fees)'
    });

    // Acorn Patience (buy and hold, 0.05% fee initial, 0 trades)
    const acornValue = principal * (1 - 0.0005) * Math.pow(1 + annualReturn/100, years);

    strategies.push({
      strategy: 'Acorn Patience',
      timescale: '50-300 Years',
      finalValue: acornValue,
      returns: ((acornValue - principal) / principal) * 100,
      transactionCount: 1,
      feesPaid: principal * 0.0005,
      timeSpent: '15 minutes (initial buy only)',
      survivability: 'Highest (pure compounding, no interference)'
    });

    setResults(strategies);
  };

  const getColorForStrategy = (strategy: string): string => {
    if (strategy.includes('High-Frequency')) return 'from-red-500/20 to-red-600/20 border-red-500/30';
    if (strategy.includes('Medium-Term')) return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
    if (strategy.includes('Long-Term')) return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
    if (strategy.includes('Acorn')) return 'from-green-500/20 to-green-600/20 border-green-500/30';
    return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
  };

  const formatCurrency = (value: number): string => {
    if (value < 0) return '-$' + Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 });
    return '$' + value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <div className="h-full bg-gray-900 text-gray-100 overflow-auto">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Acorn Compound Calculator
          </h1>
          <p className="text-gray-400">
            Prove how checking 5-minute candles destroys compounding returns
          </p>
        </div>

        {/* Input Controls */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Initial Investment
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                min="100"
                step="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time Horizon (Years)
              </label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                min="1"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Annual Return (%)
              </label>
              <input
                type="number"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                min="-50"
                max="200"
                step="5"
              />
            </div>
          </div>
          <button
            onClick={calculateCompounding}
            className="mt-6 w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all"
          >
            Calculate Impact
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-200 mb-4">
              Compounding Results: {years} Years @ {annualReturn}% Annual Return
            </h2>

            {results.map((result, index) => (
              <motion.div
                key={result.strategy}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-r ${getColorForStrategy(result.strategy)} border rounded-lg p-6`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{result.strategy}</h3>
                    <p className="text-sm text-gray-300">{result.timescale}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(result.finalValue)}
                    </div>
                    <div className={`text-sm ${result.returns >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {result.returns >= 0 ? '+' : ''}{result.returns.toFixed(1)}% returns
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Transactions</div>
                    <div className="text-white font-semibold">{result.transactionCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Fees Paid</div>
                    <div className="text-red-400 font-semibold">{formatCurrency(result.feesPaid)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Time Spent</div>
                    <div className="text-white font-semibold">{result.timeSpent}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Survivability</div>
                    <div className="text-white font-semibold">{result.survivability}</div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Analysis */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mt-8">
              <h3 className="text-lg font-bold text-white mb-4">📊 Analysis</h3>
              <div className="space-y-3 text-gray-300">
                <p>
                  <span className="font-semibold text-green-400">Acorn Patience vs High-Frequency:</span>{' '}
                  {results[3] && results[0] && results[3].finalValue > 0 && results[0].finalValue > 0
                    ? `${((results[3].finalValue / results[0].finalValue - 1) * 100).toFixed(1)}% better returns`
                    : results[0].finalValue <= 0
                    ? 'High-frequency strategy total loss (fees exceeded gains)'
                    : 'Calculating...'
                  }
                </p>
                <p>
                  <span className="font-semibold text-yellow-400">Fee Impact:</span>{' '}
                  High-frequency lost {formatCurrency(results[0].feesPaid)} to fees vs Acorn's {formatCurrency(results[3].feesPaid)}
                </p>
                <p>
                  <span className="font-semibold text-blue-400">Time Investment:</span>{' '}
                  {results[0].timeSpent} (high-freq) vs {results[3].timeSpent} (acorn patience)
                </p>
                <p className="text-sm text-gray-400 mt-4 pt-4 border-t border-gray-700">
                  <strong>The Acorn Thesis:</strong> Transaction costs + attention costs compound faster than you think.
                  The oak doesn't check 5-minute weather reports. It commits to a 300-year position and executes through volatility.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Educational Guide */}
        <div className="mt-8 bg-gray-800/30 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">🌳 Understanding Temporal Strategies</h3>
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <div className="font-semibold text-red-400 mb-1">High-Frequency (Minutes-Days)</div>
              <div>2 trades/day, 0.5% fees. Most blow up within 2 years. Noise dominates signal.</div>
            </div>
            <div>
              <div className="font-semibold text-yellow-400 mb-1">Medium-Term (Months-Years)</div>
              <div>Monthly rebalancing, 0.25% fees. Reduces noise but still vulnerable to regime changes.</div>
            </div>
            <div>
              <div className="font-semibold text-blue-400 mb-1">Long-Term (Years-Decades)</div>
              <div>Annual rebalancing, 0.1% fees. Signal over noise, minimal interference.</div>
            </div>
            <div>
              <div className="font-semibold text-green-400 mb-1">Acorn Patience (50-300 Years)</div>
              <div>Buy and hold, 0.05% initial fee. Pure compounding with zero interference. The oak's strategy.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
