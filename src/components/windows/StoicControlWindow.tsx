import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ControlItem {
  category: 'control' | 'no-control';
  item: string;
  description: string;
  action?: string;
}

export default function StoicControlWindow() {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/.netlify/functions/stoic-control');
      const data = await response.json();
      setMarketData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stoic control data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 300000);
    return () => clearInterval(interval);
  }, []);

  const controlItems: ControlItem[] = [
    {
      category: 'control',
      item: 'Position Size',
      description: 'How much capital you allocate to each trade',
      action: 'Never risk more than 1-5% of portfolio per position'
    },
    {
      category: 'control',
      item: 'Stop Loss',
      description: 'Your maximum acceptable loss before exit',
      action: 'Set stops before entering, based on technical levels'
    },
    {
      category: 'control',
      item: 'Take Profit',
      description: 'When and how much profit you lock in',
      action: 'Scale out: 25% at 2x, 25% at 5x, let 50% ride with trailing stop'
    },
    {
      category: 'control',
      item: 'Research Quality',
      description: 'What information you consume and trust',
      action: 'Read docs, check on-chain data, verify claims'
    },
    {
      category: 'control',
      item: 'Emotional State',
      description: 'Your psychological response to volatility',
      action: 'Recognize FOMO/panic, take breaks, follow your plan'
    },
    {
      category: 'control',
      item: 'Entry Timing',
      description: 'When you choose to enter positions',
      action: 'Wait for confirmation, don\'t chase pumps'
    },
    {
      category: 'no-control',
      item: 'Whale Movements',
      description: marketData?.whaleContext || 'Large wallets moving billions',
      action: undefined
    },
    {
      category: 'no-control',
      item: 'Market Sentiment',
      description: marketData?.sentiment || 'Overall fear/greed in markets',
      action: undefined
    },
    {
      category: 'no-control',
      item: 'Regulatory Actions',
      description: 'SEC, CFTC, or global regulatory decisions',
      action: undefined
    },
    {
      category: 'no-control',
      item: 'Exchange Operations',
      description: 'Platform outages, listings, delistings',
      action: undefined
    },
    {
      category: 'no-control',
      item: 'Protocol Exploits',
      description: 'Smart contract vulnerabilities and hacks',
      action: undefined
    },
    {
      category: 'no-control',
      item: 'Macro Events',
      description: marketData?.macroContext || 'Fed policy, inflation, global crises',
      action: undefined
    }
  ];

  const controlledItems = controlItems.filter(i => i.category === 'control');
  const uncontrolledItems = controlItems.filter(i => i.category === 'no-control');

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-2xl font-bold text-gray-900">Stoic Control Panel</h2>
        <p className="text-sm text-gray-600 mt-1">
          Epictetus's Dichotomy of Control applied to crypto trading
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading market context...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column: What You Control */}
            <div>
              <div className="mb-4 pb-2 border-b-2 border-green-500">
                <h3 className="text-xl font-bold text-green-700 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  What You Control
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your inputs, decisions, and responses
                </p>
              </div>

              <div className="space-y-3">
                {controlledItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="font-semibold text-green-900">{item.item}</div>
                    <div className="text-sm text-gray-700 mt-1">{item.description}</div>
                    {item.action && (
                      <div className="mt-2 p-2 bg-white rounded border border-green-300">
                        <div className="text-xs font-medium text-green-800 mb-1">ACTION:</div>
                        <div className="text-xs text-gray-700">{item.action}</div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column: What You Don't Control */}
            <div>
              <div className="mb-4 pb-2 border-b-2 border-red-500">
                <h3 className="text-xl font-bold text-red-700 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  What You Don't Control
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  External factors beyond your influence
                </p>
              </div>

              <div className="space-y-3">
                {uncontrolledItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="font-semibold text-red-900">{item.item}</div>
                    <div className="text-sm text-gray-700 mt-1">{item.description}</div>
                    <div className="mt-2 p-2 bg-white rounded border border-red-300">
                      <div className="text-xs font-medium text-red-800 mb-1">RESPONSE:</div>
                      <div className="text-xs text-gray-700">Accept it. Adapt your strategy. Don't waste energy.</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Epictetus:</span>
            <span>"Focus on what you control. Accept what you don't."</span>
          </div>
          <button
            onClick={fetchMarketData}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            Refresh Context
          </button>
        </div>
      </div>
    </div>
  );
}
