import { useState } from 'react';
import { motion } from 'framer-motion';

interface ScaleEfficiencyProps {
  windowId: string;
}

interface ScaleMetrics {
  coordinationOverhead: number;
  decisionLatency: number;
  attackSurface: number;
  culturalDilution: number;
  valueCapture: number;
  netEfficiency: number;
}

export default function ScaleEfficiencyWindow({ windowId }: ScaleEfficiencyProps) {
  const [currentSize, setCurrentSize] = useState<string>('100');
  const [targetSize, setTargetSize] = useState<string>('1000');
  const [metric, setMetric] = useState<string>('users');
  const [metrics, setMetrics] = useState<ScaleMetrics | null>(null);

  const calculateScaleEfficiency = () => {
    const current = parseFloat(currentSize);
    const target = parseFloat(targetSize);

    if (isNaN(current) || isNaN(target) || current <= 0 || target <= current) {
      return;
    }

    const scaleFactor = target / current;

    // Coordination overhead: n² growth (Metcalfe's Law inverted for cost)
    // More connections = more communication overhead
    const coordOverhead = Math.min(100, scaleFactor ** 2 * 10);

    // Decision latency: logarithmic layers
    // Larger orgs need more approval layers
    const layers = Math.log2(target) - Math.log2(current);
    const decisionDelay = Math.min(100, layers * 15);

    // Attack surface: linear to superlinear growth
    // More visibility = more targets for attackers
    const attackGrowth = Math.min(100, scaleFactor * 12);

    // Cultural dilution: grows with distance from founding team
    // Harder to maintain culture at scale
    const cultureDilution = Math.min(100, (scaleFactor - 1) * 20);

    // Value capture: sublinear returns (diminishing returns to scale)
    // Each additional unit adds less value than previous
    const valueCapture = Math.min(100, Math.sqrt(scaleFactor) * 40);

    // Net efficiency: value captured minus costs
    const netEff = Math.max(-100, valueCapture - (coordOverhead + decisionDelay + attackGrowth + cultureDilution) / 4);

    setMetrics({
      coordinationOverhead: Math.round(coordOverhead),
      decisionLatency: Math.round(decisionDelay),
      attackSurface: Math.round(attackGrowth),
      culturalDilution: Math.round(cultureDilution),
      valueCapture: Math.round(valueCapture),
      netEfficiency: Math.round(netEff)
    });
  };

  const getEfficiencyColor = (value: number) => {
    if (value >= 50) return 'text-green-400';
    if (value >= 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getEfficiencyLabel = (value: number) => {
    if (value >= 50) return 'Efficient Scale';
    if (value >= 20) return 'Marginal Gains';
    if (value >= 0) return 'Diminishing Returns';
    if (value >= -20) return 'Negative Returns';
    return 'Destructive Scale';
  };

  const getBarColor = (type: 'cost' | 'value') => {
    return type === 'cost' ? 'bg-red-500/70' : 'bg-green-500/70';
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Scale Efficiency Calculator</h2>
          <p className="text-gray-400 text-sm">
            Calculate the hidden costs of scaling. Optimal size ≠ maximum size.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Current Size</label>
              <input
                type="number"
                value={currentSize}
                onChange={(e) => setCurrentSize(e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Target Size</label>
              <input
                type="number"
                value={targetSize}
                onChange={(e) => setTargetSize(e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Metric</label>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="users">Users</option>
                <option value="tvl">TVL ($M)</option>
                <option value="revenue">Revenue ($K)</option>
                <option value="employees">Employees</option>
                <option value="dau">DAU</option>
              </select>
            </div>
          </div>

          <button
            onClick={calculateScaleEfficiency}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Calculate Efficiency
          </button>
        </div>

        {/* Results */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Net Efficiency Score */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">Net Efficiency Score</div>
                <div className={`text-6xl font-bold mb-2 ${getEfficiencyColor(metrics.netEfficiency)}`}>
                  {metrics.netEfficiency > 0 ? '+' : ''}{metrics.netEfficiency}%
                </div>
                <div className={`text-lg ${getEfficiencyColor(metrics.netEfficiency)}`}>
                  {getEfficiencyLabel(metrics.netEfficiency)}
                </div>
                <p className="text-gray-500 text-sm mt-4">
                  {metrics.netEfficiency >= 0
                    ? 'Scaling adds net value. Growth creates more opportunities than costs.'
                    : 'Scaling destroys value. Costs exceed benefits. Consider staying small.'}
                </p>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-red-400">Scaling Costs</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Coordination Overhead (n² growth)</span>
                    <span className="text-sm font-mono">{metrics.coordinationOverhead}%</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metrics.coordinationOverhead}%` }}
                      transition={{ duration: 0.5 }}
                      className={getBarColor('cost')}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    More people = exponentially more connections to manage
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Decision Latency (approval layers)</span>
                    <span className="text-sm font-mono">{metrics.decisionLatency}%</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metrics.decisionLatency}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={getBarColor('cost')}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Larger orgs need more approval layers, slowing execution
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Attack Surface Expansion</span>
                    <span className="text-sm font-mono">{metrics.attackSurface}%</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metrics.attackSurface}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={getBarColor('cost')}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Bigger targets attract more attackers and regulatory scrutiny
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Cultural Dilution</span>
                    <span className="text-sm font-mono">{metrics.culturalDilution}%</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metrics.culturalDilution}%` }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className={getBarColor('cost')}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Harder to maintain founding values as team grows distant
                  </p>
                </div>
              </div>
            </div>

            {/* Value Capture */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-green-400">Value Captured</h3>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Revenue/Impact Growth</span>
                  <span className="text-sm font-mono">{metrics.valueCapture}%</span>
                </div>
                <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.valueCapture}%` }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className={getBarColor('value')}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sublinear returns: each additional unit adds less value than previous
                </p>
              </div>
            </div>

            {/* Interpretation */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">What This Means</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  <span className="font-semibold text-orange-400">Scale Factor:</span> {(parseFloat(targetSize) / parseFloat(currentSize)).toFixed(1)}x
                  {' '}({currentSize} → {targetSize} {metric})
                </p>

                {metrics.netEfficiency >= 20 && (
                  <p className="text-green-400">
                    ✓ This scale move is efficient. Value captured significantly exceeds costs.
                    Growth makes sense here.
                  </p>
                )}

                {metrics.netEfficiency >= 0 && metrics.netEfficiency < 20 && (
                  <p className="text-yellow-400">
                    ⚠ Marginal efficiency. Growth still adds value, but costs are catching up.
                    Consider if this scale is necessary for your mission.
                  </p>
                )}

                {metrics.netEfficiency < 0 && metrics.netEfficiency >= -20 && (
                  <p className="text-orange-400">
                    ⚠ Diminishing returns. Costs now exceed value captured.
                    Scaling past this point destroys efficiency. The dwarf seahorse stops here.
                  </p>
                )}

                {metrics.netEfficiency < -20 && (
                  <p className="text-red-400">
                    ✗ Destructive scale. This growth actively damages the organization.
                    Coordination overhead, bureaucracy, and attack surface overwhelm any gains.
                    Stay small. Stay sovereign.
                  </p>
                )}

                <p className="text-gray-500 italic pt-2">
                  The dwarf seahorse is 13mm long. It never scales past that because 13mm is optimal
                  for its niche. Not every org needs to be massive. Some win by staying exactly the
                  right size.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Example Scenarios */}
        {!metrics && (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Try These Scenarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <button
                onClick={() => {
                  setCurrentSize('50');
                  setTargetSize('500');
                  setMetric('users');
                }}
                className="bg-gray-700 hover:bg-gray-600 rounded p-3 text-left transition-colors"
              >
                <div className="font-semibold text-orange-400">Early Startup</div>
                <div className="text-gray-400">50 → 500 users (10x growth)</div>
              </button>

              <button
                onClick={() => {
                  setCurrentSize('10000');
                  setTargetSize('100000');
                  setMetric('users');
                }}
                className="bg-gray-700 hover:bg-gray-600 rounded p-3 text-left transition-colors"
              >
                <div className="font-semibold text-orange-400">Scaling Platform</div>
                <div className="text-gray-400">10K → 100K users</div>
              </button>

              <button
                onClick={() => {
                  setCurrentSize('100');
                  setTargetSize('10000');
                  setMetric('tvl');
                }}
                className="bg-gray-700 hover:bg-gray-600 rounded p-3 text-left transition-colors"
              >
                <div className="font-semibold text-orange-400">DeFi Protocol</div>
                <div className="text-gray-400">$100M → $10B TVL (100x)</div>
              </button>

              <button
                onClick={() => {
                  setCurrentSize('25');
                  setTargetSize('250');
                  setMetric('employees');
                }}
                className="bg-gray-700 hover:bg-gray-600 rounded p-3 text-left transition-colors"
              >
                <div className="font-semibold text-orange-400">Team Scaling</div>
                <div className="text-gray-400">25 → 250 employees</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
