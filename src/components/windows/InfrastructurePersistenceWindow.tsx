import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Entity {
  name: string;
  type: 'Empire' | 'Infrastructure';
  persistenceScore: number;
  factors: {
    decentralization: number;
    immutability: number;
    composability: number;
    governance: number;
    dependencies: number;
  };
  description: string;
  verdict: string;
}

const entities: Entity[] = [
  {
    name: 'Uniswap Protocol',
    type: 'Infrastructure',
    persistenceScore: 95,
    factors: {
      decentralization: 95,
      immutability: 100,
      composability: 95,
      governance: 85,
      dependencies: 90
    },
    description: 'AMM protocol deployed on Ethereum. Code is immutable, no admin keys, fully permissionless.',
    verdict: 'Persists. Runs forever as long as Ethereum exists. No single point of failure.'
  },
  {
    name: 'FTX Exchange',
    type: 'Empire',
    persistenceScore: 5,
    factors: {
      decentralization: 0,
      immutability: 0,
      composability: 10,
      governance: 5,
      dependencies: 5
    },
    description: 'Centralized exchange with custodial wallets. Single CEO, single company, single jurisdiction.',
    verdict: 'Collapsed. Entire platform disappeared when company went bankrupt in 4 days.'
  },
  {
    name: 'Aave Lending',
    type: 'Infrastructure',
    persistenceScore: 92,
    factors: {
      decentralization: 90,
      immutability: 95,
      composability: 95,
      governance: 85,
      dependencies: 90
    },
    description: 'Decentralized lending protocol with governance token. Smart contracts handle all operations.',
    verdict: 'Persists. Protocol continues operating regardless of team. Governance distributed.'
  },
  {
    name: 'Binance Exchange',
    type: 'Empire',
    persistenceScore: 25,
    factors: {
      decentralization: 5,
      immutability: 0,
      composability: 30,
      governance: 20,
      dependencies: 30
    },
    description: 'Largest CEX by volume. Custodial model, centralized operations, regulatory dependencies.',
    verdict: 'Vulnerable. Still operating but depends on CZ, licenses, banking partners, jurisdictions.'
  },
  {
    name: 'USDC Stablecoin',
    type: 'Infrastructure',
    persistenceScore: 75,
    factors: {
      decentralization: 60,
      immutability: 80,
      composability: 95,
      governance: 65,
      dependencies: 70
    },
    description: 'Fiat-backed stablecoin issued by Circle. Transparent reserves, regulatory compliant.',
    verdict: 'Likely persists. Not fully decentralized but infrastructure-like: transparent, composable, multi-chain.'
  },
  {
    name: 'Mt. Gox',
    type: 'Empire',
    persistenceScore: 0,
    factors: {
      decentralization: 0,
      immutability: 0,
      composability: 5,
      governance: 0,
      dependencies: 0
    },
    description: 'Early Bitcoin exchange that handled 70% of BTC volume in 2013. Centralized custody.',
    verdict: 'Extinct. Hacked in 2014, lost 850K BTC, went bankrupt. Zero infrastructure survived.'
  },
  {
    name: 'Ethereum Base Layer',
    type: 'Infrastructure',
    persistenceScore: 98,
    factors: {
      decentralization: 95,
      immutability: 100,
      composability: 100,
      governance: 95,
      dependencies: 95
    },
    description: 'Smart contract platform secured by thousands of validators. No admin keys, no CEO.',
    verdict: 'Persists. Removing it costs more than ignoring it. Multi-purpose, no single point of failure.'
  },
  {
    name: 'Celsius Network',
    type: 'Empire',
    persistenceScore: 3,
    factors: {
      decentralization: 0,
      immutability: 0,
      composability: 10,
      governance: 5,
      dependencies: 0
    },
    description: 'CeFi lending platform offering yield on deposits. Opaque operations, rehypothecation.',
    verdict: 'Collapsed. Bankruptcy in 2022. Users lost funds. No protocol survived.'
  }
];

const factorDescriptions = {
  decentralization: 'No single point of control. Distributed validators/nodes.',
  immutability: 'Code cannot be changed. Deployed contracts are permanent.',
  composability: 'Other protocols can build on top. Permissionless integration.',
  governance: 'Decision-making is distributed. No dictator.',
  dependencies: 'Minimal external dependencies. Self-sustaining.'
};

export default function InfrastructurePersistenceWindow() {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [filter, setFilter] = useState<'all' | 'Empire' | 'Infrastructure'>('all');

  const filteredEntities = filter === 'all'
    ? entities
    : entities.filter(e => e.type === filter);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    if (score >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getBarColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold mb-2">Infrastructure Persistence Score</h2>
        <p className="text-gray-400 text-sm">
          Which crypto protocols outlast the platforms that build them?
        </p>

        {/* Filter buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('Infrastructure')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              filter === 'Infrastructure'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Infrastructure
          </button>
          <button
            onClick={() => setFilter('Empire')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              filter === 'Empire'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Empires
          </button>
        </div>
      </div>

      {/* Entity grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {filteredEntities.map((entity) => (
            <motion.div
              key={entity.name}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedEntity(entity)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedEntity?.name === entity.name
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-800 bg-gray-800/50 hover:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{entity.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  entity.type === 'Infrastructure'
                    ? 'bg-green-900/50 text-green-300'
                    : 'bg-red-900/50 text-red-300'
                }`}>
                  {entity.type}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold ${getScoreColor(entity.persistenceScore)}`}>
                  {entity.persistenceScore}
                </span>
                <div className="flex-1">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${entity.persistenceScore}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full ${getBarColor(entity.persistenceScore)}`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected entity details */}
        {selectedEntity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 border-2 border-blue-500 rounded-lg p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedEntity.name}</h3>
                <p className="text-gray-400 text-sm">{selectedEntity.description}</p>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${getScoreColor(selectedEntity.persistenceScore)}`}>
                  {selectedEntity.persistenceScore}
                </div>
                <div className="text-sm text-gray-400">Persistence Score</div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-6">
              {Object.entries(selectedEntity.factors).map(([factor, score]) => (
                <div key={factor} className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${getScoreColor(score)}`}>
                    {score}
                  </div>
                  <div className="text-xs text-gray-400 capitalize mb-2">
                    {factor.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(score)}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <div className="text-sm font-semibold text-gray-300 mb-2">Verdict:</div>
              <div className="text-white">{selectedEntity.verdict}</div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <div><strong>Scoring Factors:</strong></div>
              {Object.entries(factorDescriptions).map(([factor, desc]) => (
                <div key={factor}>
                  <strong className="capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}:</strong> {desc}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* How to Use section */}
        <div className="mt-6 bg-gray-800/30 rounded-lg p-6 border border-gray-800">
          <h3 className="font-bold text-lg mb-3 text-blue-400">How to Evaluate Persistence</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p>
              <strong>90-100:</strong> Infrastructure that outlasts everything. No single point of failure, immutable code, distributed governance.
            </p>
            <p>
              <strong>70-89:</strong> Likely persists but has some dependencies. May require ongoing maintenance or governance.
            </p>
            <p>
              <strong>40-69:</strong> Vulnerable to centralization risks. Could persist if dependencies remain stable.
            </p>
            <p>
              <strong>20-39:</strong> Empire disguised as infrastructure. High risk of collapse when conditions change.
            </p>
            <p>
              <strong>0-19:</strong> Pure empire. Depends entirely on company/CEO/jurisdiction. Expect eventual failure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
