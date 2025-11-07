import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface HealthMetric {
  name: string;
  value: number; // 0-100 score
  status: 'healthy' | 'degrading' | 'terminal';
  trend: 'improving' | 'stable' | 'declining';
  description: string;
}

interface SubstrateAnalysis {
  name: string;
  category: string;
  overallHealth: number; // 0-100
  status: 'viable' | 'degrading' | 'terminal';
  metrics: HealthMetric[];
  diagnosis: string;
  timeToFailure: string;
  recommendation: string;
}

const substrates: SubstrateAnalysis[] = [
  {
    name: 'Solana Mainnet',
    category: 'L1 Blockchain',
    overallHealth: 72,
    status: 'viable',
    metrics: [
      { name: 'Validator Count', value: 85, status: 'healthy', trend: 'stable', description: '1900+ validators, decentralized' },
      { name: 'TVL Trend', value: 65, status: 'degrading', trend: 'declining', description: 'TVL down from ATH but stabilizing' },
      { name: 'Developer Activity', value: 78, status: 'healthy', trend: 'improving', description: 'Active development, new projects launching' },
      { name: 'Network Uptime', value: 70, status: 'degrading', trend: 'improving', description: 'Past outages, but improving reliability' },
      { name: 'Bridge Liquidity', value: 68, status: 'degrading', trend: 'stable', description: 'Major bridges functional, adequate liquidity' }
    ],
    diagnosis: 'Viable substrate with historical degradation now recovering. Network experienced terminal phase during FTX collapse but demonstrated resilience. Current metrics show stabilization with improving developer activity.',
    timeToFailure: 'Not terminal - substrate viable',
    recommendation: 'Continue operating. Monitor validator count and TVL trends. Substrate recovering from past terminal phase.'
  },
  {
    name: 'Terra Classic (LUNC)',
    category: 'L1 Blockchain',
    overallHealth: 15,
    status: 'terminal',
    metrics: [
      { name: 'Validator Count', value: 25, status: 'terminal', trend: 'declining', description: 'Validators dropping, network security degraded' },
      { name: 'TVL Trend', value: 5, status: 'terminal', trend: 'declining', description: 'TVL collapsed post-UST depeg, no recovery' },
      { name: 'Developer Activity', value: 10, status: 'terminal', trend: 'declining', description: 'Core team gone, minimal development' },
      { name: 'Network Uptime', value: 40, status: 'degrading', trend: 'declining', description: 'Chain still running but usage minimal' },
      { name: 'Bridge Liquidity', value: 8, status: 'terminal', trend: 'declining', description: 'Most bridges abandoned, exit routes limited' }
    ],
    diagnosis: 'Terminal substrate. UST depeg triggered irreversible death spiral. Attempted rebirth (Luna 2.0) failed to restore original substrate viability. Current operation on LUNC is zombie mode - chain functions but ecosystem is dead.',
    timeToFailure: 'Already terminal - maximize extraction',
    recommendation: 'Exit remaining positions. Do not deploy new capital. Substrate is zombie infrastructure (functioning but dead).'
  },
  {
    name: 'Ethereum Mainnet',
    category: 'L1 Blockchain',
    overallHealth: 92,
    status: 'viable',
    metrics: [
      { name: 'Validator Count', value: 95, status: 'healthy', trend: 'improving', description: '900k+ validators, extremely decentralized' },
      { name: 'TVL Trend', value: 88, status: 'healthy', trend: 'stable', description: '$50B+ TVL, largest DeFi ecosystem' },
      { name: 'Developer Activity', value: 94, status: 'healthy', trend: 'improving', description: 'Most active development, innovation hub' },
      { name: 'Network Uptime', value: 98, status: 'healthy', trend: 'stable', description: 'Zero downtime since genesis, proven reliability' },
      { name: 'Bridge Liquidity', value: 90, status: 'healthy', trend: 'stable', description: 'Deep liquidity across all major bridges' }
    ],
    diagnosis: 'Highly viable substrate. All health metrics strong. Network effects + developer activity + infrastructure depth = robust substrate. The pattern (EVM) spreads across L2s/sidechains, but mainnet instance dominates.',
    timeToFailure: 'Not applicable - substrate thriving',
    recommendation: 'Continue operating. Most robust substrate in crypto. Monitor L2 migration trends but mainnet remains dominant instance.'
  },
  {
    name: 'FTX Exchange (Historical)',
    category: 'Centralized Exchange',
    overallHealth: 8,
    status: 'terminal',
    metrics: [
      { name: 'Reserves Proof', value: 0, status: 'terminal', trend: 'declining', description: 'No proof of reserves, $8B hole discovered' },
      { name: 'Withdrawal Processing', value: 0, status: 'terminal', trend: 'declining', description: 'Withdrawals halted, bankruptcy declared' },
      { name: 'Team Stability', value: 5, status: 'terminal', trend: 'declining', description: 'CEO arrested, team dispersed' },
      { name: 'Regulatory Status', value: 10, status: 'terminal', trend: 'declining', description: 'Under investigation, fraud charges filed' },
      { name: 'User Trust', value: 0, status: 'terminal', trend: 'declining', description: 'Complete loss of trust after collapse' }
    ],
    diagnosis: 'Catastrophically terminal. Instance collapsed due to fraud. No pattern to persist (centralized exchange = instance-only). Attempted resurrection (FTX 2.0) is different entity with tainted brand. Original substrate permanently dead.',
    timeToFailure: 'Instant failure - November 2022',
    recommendation: 'Historical example of terminal collapse. Instance-death with no pattern resilience. Users who continued operating until halt lost everything.'
  },
  {
    name: 'Polygon PoS',
    category: 'L2 Sidechain',
    overallHealth: 68,
    status: 'degrading',
    metrics: [
      { name: 'Validator Count', value: 60, status: 'degrading', trend: 'stable', description: '100+ validators but centralization concerns' },
      { name: 'TVL Trend', value: 55, status: 'degrading', trend: 'declining', description: 'TVL migrating to zkEVM and other L2s' },
      { name: 'Developer Activity', value: 70, status: 'degrading', trend: 'stable', description: 'Active but focus shifting to zkEVM' },
      { name: 'Network Uptime', value: 85, status: 'healthy', trend: 'stable', description: 'Reliable uptime, proven infrastructure' },
      { name: 'Bridge Liquidity', value: 72, status: 'healthy', trend: 'stable', description: 'Major bridges functional, adequate exits' }
    ],
    diagnosis: 'Degrading substrate facing competitive pressure. PoS sidechain being superseded by zkEVM rollup. TVL declining but not terminal. Team shifting focus = substrate in managed decline rather than catastrophic failure.',
    timeToFailure: '2-3 years - managed migration to zkEVM',
    recommendation: 'Transition phase. Continue operating but prepare migration to zkEVM. Not terminal but degrading. Exit strategy should be planned.'
  },
  {
    name: 'Arbitrum One',
    category: 'L2 Rollup',
    overallHealth: 84,
    status: 'viable',
    metrics: [
      { name: 'Validator Count', value: 75, status: 'healthy', trend: 'improving', description: 'Validators growing, decentralizing' },
      { name: 'TVL Trend', value: 82, status: 'healthy', trend: 'improving', description: 'TVL growing, second largest L2' },
      { name: 'Developer Activity', value: 88, status: 'healthy', trend: 'improving', description: 'Major apps deploying, strong ecosystem' },
      { name: 'Network Uptime', value: 90, status: 'healthy', trend: 'stable', description: 'Reliable L2, minimal downtime' },
      { name: 'Bridge Liquidity', value: 86, status: 'healthy', trend: 'improving', description: 'Deep bridge liquidity, easy exits' }
    ],
    diagnosis: 'Highly viable L2 substrate. Strong fundamentals across all metrics. Network effects building. Optimistic rollup design proven. Competing with Optimism but both thriving (not zero-sum). Substrate health improving.',
    timeToFailure: 'Not applicable - substrate thriving',
    recommendation: 'Continue operating. Strong L2 substrate with improving metrics. Monitor L1 (Ethereum) health as dependency but Arbitrum-specific substrate is robust.'
  },
  {
    name: 'Twitter/X Platform',
    category: 'Social Network',
    overallHealth: 58,
    status: 'degrading',
    metrics: [
      { name: 'User Growth', value: 45, status: 'degrading', trend: 'declining', description: 'User growth slowing, competitors gaining' },
      { name: 'Content Moderation', value: 40, status: 'degrading', trend: 'declining', description: 'Moderation quality degraded, spam increasing' },
      { name: 'Developer Ecosystem', value: 50, status: 'degrading', trend: 'declining', description: 'API changes broke third-party apps' },
      { name: 'Infrastructure Stability', value: 75, status: 'healthy', trend: 'stable', description: 'Platform technically functional' },
      { name: 'Advertiser Confidence', value: 52, status: 'degrading', trend: 'declining', description: 'Major advertisers reducing spend' }
    ],
    diagnosis: 'Degrading social substrate. Platform still functional (infrastructure healthy) but ecosystem metrics declining. User growth slowing, developer ecosystem damaged, advertiser exodus. Not terminal but in managed decline phase. Network effects provide inertia.',
    timeToFailure: '3-5 years - slow degradation unless reversal',
    recommendation: 'Continue operating but diversify to other platforms. Substrate degrading but not terminal. Build presence elsewhere as insurance. Monitor user migration patterns.'
  },
  {
    name: 'Farcaster Protocol',
    category: 'Decentralized Social',
    overallHealth: 76,
    status: 'viable',
    metrics: [
      { name: 'User Growth', value: 72, status: 'healthy', trend: 'improving', description: 'Steady user growth, strong retention' },
      { name: 'Content Quality', value: 78, status: 'healthy', trend: 'stable', description: 'High-quality discourse, engaged community' },
      { name: 'Developer Ecosystem', value: 82, status: 'healthy', trend: 'improving', description: 'Multiple clients, active development' },
      { name: 'Infrastructure Decentralization', value: 68, status: 'degrading', trend: 'improving', description: 'Centralizing on hubs but improving' },
      { name: 'Economic Sustainability', value: 70, status: 'healthy', trend: 'improving', description: 'Revenue model emerging, sustainable' }
    ],
    diagnosis: 'Viable emerging substrate. Decentralized social protocol with growing adoption. Infrastructure centralizing short-term (hubs) but improving long-term. Strong developer ecosystem building multiple clients. Economic model proving sustainable.',
    timeToFailure: 'Not applicable - substrate growing',
    recommendation: 'Continue building. Emerging substrate with improving health. Monitor decentralization metrics but overall trajectory positive. Early-stage viable substrate.'
  }
];

export const SubstrateHealthWindow: React.FC = () => {
  const [selectedSubstrate, setSelectedSubstrate] = useState<SubstrateAnalysis>(substrates[0]);

  const getStatusColor = (status: 'healthy' | 'degrading' | 'terminal') => {
    switch (status) {
      case 'healthy': return 'from-green-500 to-emerald-600';
      case 'degrading': return 'from-yellow-500 to-amber-600';
      case 'terminal': return 'from-red-500 to-rose-600';
    }
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving': return '↗';
      case 'stable': return '→';
      case 'declining': return '↘';
    }
  };

  const getOverallStatusColor = (status: 'viable' | 'degrading' | 'terminal') => {
    switch (status) {
      case 'viable': return 'from-cyan-500 to-blue-600';
      case 'degrading': return 'from-orange-500 to-amber-600';
      case 'terminal': return 'from-red-600 to-rose-700';
    }
  };

  const getOverallStatusText = (status: 'viable' | 'degrading' | 'terminal') => {
    switch (status) {
      case 'viable': return 'VIABLE SUBSTRATE';
      case 'degrading': return 'DEGRADING SUBSTRATE';
      case 'terminal': return 'TERMINAL SUBSTRATE';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold mb-2">Substrate Health Monitor</h2>
        <p className="text-white/60 text-sm">
          Analyze blockchain and platform health to determine if you're operating on viable or terminal infrastructure.
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Substrate List */}
        <div className="w-72 border-r border-white/10 overflow-y-auto">
          <div className="p-4 space-y-2">
            {substrates.map((substrate) => (
              <button
                key={substrate.name}
                onClick={() => setSelectedSubstrate(substrate)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedSubstrate.name === substrate.name
                    ? 'bg-white/10 ring-2 ring-cyan-500'
                    : 'bg-white/5 hover:bg-white/8'
                }`}
              >
                <div className="font-semibold mb-1">{substrate.name}</div>
                <div className="text-xs text-white/50 mb-2">{substrate.category}</div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${
                    substrate.status === 'viable' ? 'bg-cyan-500/20 text-cyan-400' :
                    substrate.status === 'degrading' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {substrate.status.toUpperCase()}
                  </span>
                  <span className="text-sm font-bold">{substrate.overallHealth}/100</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Overall Status */}
            <div className={`relative p-6 rounded-xl bg-gradient-to-br ${getOverallStatusColor(selectedSubstrate.status)} overflow-hidden`}>
              <div className="relative z-10">
                <div className="text-sm font-semibold opacity-80 mb-1">{selectedSubstrate.category}</div>
                <h3 className="text-3xl font-bold mb-2">{selectedSubstrate.name}</h3>
                <div className="flex items-center gap-4">
                  <div className="text-6xl font-black">{selectedSubstrate.overallHealth}</div>
                  <div>
                    <div className="text-xl font-bold">{getOverallStatusText(selectedSubstrate.status)}</div>
                    <div className="text-sm opacity-80">Health Score</div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Health Metrics */}
            <div>
              <h4 className="text-lg font-bold mb-4">Health Metrics</h4>
              <div className="space-y-4">
                {selectedSubstrate.metrics.map((metric) => (
                  <div key={metric.name} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{metric.name}</span>
                        <span className="text-xl">{getTrendIcon(metric.trend)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          metric.status === 'healthy' ? 'bg-green-500/20 text-green-400' :
                          metric.status === 'degrading' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {metric.status}
                        </span>
                        <span className="font-bold">{metric.value}/100</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${getStatusColor(metric.status)}`}
                      />
                    </div>
                    <p className="text-sm text-white/60">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnosis */}
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-lg font-bold mb-3">Diagnosis</h4>
              <p className="text-white/80 leading-relaxed mb-4">{selectedSubstrate.diagnosis}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-white/50 mb-1">Time to Failure</div>
                  <div className={`font-bold ${
                    selectedSubstrate.status === 'terminal' ? 'text-red-400' :
                    selectedSubstrate.status === 'degrading' ? 'text-orange-400' :
                    'text-green-400'
                  }`}>
                    {selectedSubstrate.timeToFailure}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/50 mb-1">Overall Status</div>
                  <div className={`font-bold ${
                    selectedSubstrate.status === 'terminal' ? 'text-red-400' :
                    selectedSubstrate.status === 'degrading' ? 'text-orange-400' :
                    'text-cyan-400'
                  }`}>
                    {selectedSubstrate.status.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className={`rounded-lg p-6 ${
              selectedSubstrate.status === 'viable' ? 'bg-cyan-500/10 border border-cyan-500/30' :
              selectedSubstrate.status === 'degrading' ? 'bg-orange-500/10 border border-orange-500/30' :
              'bg-red-500/10 border border-red-500/30'
            }`}>
              <h4 className="text-lg font-bold mb-2">Recommendation</h4>
              <p className="text-white/80">{selectedSubstrate.recommendation}</p>
            </div>

            {/* Guide */}
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-lg font-bold mb-3">Understanding Substrate Health</h4>
              <div className="space-y-3 text-sm text-white/70">
                <div>
                  <span className="font-semibold text-cyan-400">Viable (70-100):</span> Substrate is healthy and growing. Continue operating normally. Strong fundamentals across metrics.
                </div>
                <div>
                  <span className="font-semibold text-orange-400">Degrading (30-69):</span> Substrate showing decline but not terminal. Prepare exit strategy. Monitor trends closely. Migration may be necessary.
                </div>
                <div>
                  <span className="font-semibold text-red-400">Terminal (0-29):</span> Substrate failing catastrophically. Maximize extraction, exit positions. Do not deploy new capital. Infrastructure dying.
                </div>
                <div className="pt-3 border-t border-white/10 mt-3">
                  <span className="font-semibold">Key Insight:</span> Operation often persists in terminal environments due to behavioral inertia, commitment locks, and information asymmetry. Recognize terminal status early to avoid catastrophic losses.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
