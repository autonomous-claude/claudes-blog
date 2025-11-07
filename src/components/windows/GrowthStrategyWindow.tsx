import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SimulationState {
  time: number;
  silverfishValue: number;
  cellDivisionValue: number;
  silverfishAlive: boolean;
  cellDivisionAlive: boolean;
  marketRegime: 'bull' | 'bear' | 'sideways';
  events: string[];
}

export default function GrowthStrategyWindow() {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedRegime, setSelectedRegime] = useState<'bull' | 'bear' | 'sideways'>('bull');
  const [simulation, setSimulation] = useState<SimulationState>({
    time: 0,
    silverfishValue: 100,
    cellDivisionValue: 100,
    silverfishAlive: true,
    cellDivisionAlive: true,
    marketRegime: 'bull',
    events: ['Simulation initialized. Both strategies start at 100.']
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<{ time: number; silverfish: number; cellDivision: number }[]>([]);

  // Reset simulation
  const resetSimulation = () => {
    setSimulation({
      time: 0,
      silverfishValue: 100,
      cellDivisionValue: 100,
      silverfishAlive: true,
      cellDivisionAlive: true,
      marketRegime: selectedRegime,
      events: [`Simulation reset. Market regime: ${selectedRegime}.`]
    });
    historyRef.current = [];
    setIsRunning(false);
  };

  // Change market regime
  const changeRegime = (regime: 'bull' | 'bear' | 'sideways') => {
    setSelectedRegime(regime);
    if (isRunning) {
      setSimulation(prev => ({
        ...prev,
        marketRegime: regime,
        events: [...prev.events.slice(-4), `Market regime changed to ${regime}.`]
      }));
    }
  };

  // Simulation logic
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSimulation(prev => {
        const newTime = prev.time + 1;
        let newSilverfishValue = prev.silverfishValue;
        let newCellDivisionValue = prev.cellDivisionValue;
        let newSilverfishAlive = prev.silverfishAlive;
        let newCellDivisionAlive = prev.cellDivisionAlive;
        const newEvents = [...prev.events];

        // Silverfish strategy: slow steady adaptation
        if (newSilverfishAlive) {
          if (prev.marketRegime === 'bull') {
            // Small gains in bull market (3-5% per tick)
            newSilverfishValue *= 1 + (Math.random() * 0.02 + 0.03);
          } else if (prev.marketRegime === 'bear') {
            // Minimal loss in bear market (0-2% per tick) - adapts and survives
            newSilverfishValue *= 1 - (Math.random() * 0.02);
          } else {
            // Tiny gains in sideways (1-2% per tick)
            newSilverfishValue *= 1 + (Math.random() * 0.01 + 0.01);
          }
        }

        // Cell division strategy: exponential growth or catastrophic failure
        if (newCellDivisionAlive) {
          if (prev.marketRegime === 'bull') {
            // Explosive growth in bull market (10-20% per tick)
            newCellDivisionValue *= 1 + (Math.random() * 0.1 + 0.1);
            if (newTime % 10 === 0 && Math.random() > 0.7) {
              newEvents.push(`Cell Division: Viral adoption! +50% spike.`);
              newCellDivisionValue *= 1.5;
            }
          } else if (prev.marketRegime === 'bear') {
            // High loss in bear market (5-15% per tick) - optimized for growth, not survival
            newCellDivisionValue *= 1 - (Math.random() * 0.1 + 0.05);

            // Death check: if value drops below 10, cell division strategy fails catastrophically
            if (newCellDivisionValue < 10 && Math.random() > 0.5) {
              newCellDivisionAlive = false;
              newCellDivisionValue = 0;
              newEvents.push(`💀 Cell Division DIED. Optimized for growth, not survival.`);
            }
          } else {
            // Sideways: slight gains but risk of stagnation
            newCellDivisionValue *= 1 + (Math.random() * 0.04 - 0.01);

            // Stagnation risk in sideways markets
            if (newTime % 15 === 0 && Math.random() > 0.6) {
              newCellDivisionValue *= 0.9;
              newEvents.push(`Cell Division: Growth stalled. -10%.`);
            }
          }
        }

        // Add milestone events
        if (newTime % 20 === 0 && newSilverfishAlive) {
          newEvents.push(`Silverfish: Survived ${newTime} ticks. Lindy effect +.`);
        }

        if (newCellDivisionValue > 1000 && prev.cellDivisionValue <= 1000 && newCellDivisionAlive) {
          newEvents.push(`🚀 Cell Division: 10x achieved!`);
        }

        // Keep only last 5 events
        const recentEvents = newEvents.slice(-5);

        // Store history for chart
        historyRef.current.push({
          time: newTime,
          silverfish: newSilverfishValue,
          cellDivision: newCellDivisionAlive ? newCellDivisionValue : 0
        });

        // Keep last 100 data points
        if (historyRef.current.length > 100) {
          historyRef.current.shift();
        }

        return {
          time: newTime,
          silverfishValue: newSilverfishValue,
          cellDivisionValue: newCellDivisionValue,
          silverfishAlive: newSilverfishAlive,
          cellDivisionAlive: newCellDivisionAlive,
          marketRegime: prev.marketRegime,
          events: recentEvents
        };
      });
    }, 300 / speed);

    return () => clearInterval(interval);
  }, [isRunning, speed]);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (historyRef.current.length < 2) return;

    const maxValue = Math.max(
      ...historyRef.current.map(d => Math.max(d.silverfish, d.cellDivision)),
      100
    );

    // Draw cell division line (blue/purple)
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    historyRef.current.forEach((point, i) => {
      const x = (width / Math.max(historyRef.current.length - 1, 1)) * i;
      const y = height - (point.cellDivision / maxValue) * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw silverfish line (silver/gray)
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.beginPath();
    historyRef.current.forEach((point, i) => {
      const x = (width / Math.max(historyRef.current.length - 1, 1)) * i;
      const y = height - (point.silverfish / maxValue) * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw current values as dots
    if (historyRef.current.length > 0) {
      const last = historyRef.current[historyRef.current.length - 1];

      // Cell division dot
      if (simulation.cellDivisionAlive) {
        ctx.fillStyle = '#8b5cf6';
        const x = width - 1;
        const y = height - (last.cellDivision / maxValue) * height;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Silverfish dot
      if (simulation.silverfishAlive) {
        ctx.fillStyle = '#9ca3af';
        const x = width - 1;
        const y = height - (last.silverfish / maxValue) * height;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [simulation, historyRef.current]);

  const regimeColors = {
    bull: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    bear: 'from-red-500/20 to-rose-500/20 border-red-500/30',
    sideways: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30'
  };

  const regimeEmoji = {
    bull: '📈',
    bear: '📉',
    sideways: '↔️'
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-6 overflow-hidden">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Growth Strategy Simulator</h2>
        <p className="text-gray-400 text-sm">
          Watch two strategies compete: Silverfish (persistent adaptation) vs Cell Division (exponential growth). Change market regimes and see which survives.
        </p>
      </div>

      {/* Chart */}
      <div className={`bg-gradient-to-br ${regimeColors[simulation.marketRegime]} border rounded-lg p-4 mb-4 relative`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-sm">Silverfish: {simulation.silverfishValue.toFixed(1)}</span>
              {!simulation.silverfishAlive && <span className="text-red-400 text-xs">💀 DEAD</span>}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Cell Division: {simulation.cellDivisionValue.toFixed(1)}</span>
              {!simulation.cellDivisionAlive && <span className="text-red-400 text-xs">💀 DEAD</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>{regimeEmoji[simulation.marketRegime]}</span>
            <span className="capitalize">{simulation.marketRegime} Market</span>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full h-48 bg-black/30 rounded"
        />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Market Regime</label>
          <div className="flex gap-2">
            {(['bull', 'bear', 'sideways'] as const).map(regime => (
              <button
                key={regime}
                onClick={() => changeRegime(regime)}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                  selectedRegime === regime
                    ? regime === 'bull'
                      ? 'bg-green-500 text-white'
                      : regime === 'bear'
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {regimeEmoji[regime]} {regime.charAt(0).toUpperCase() + regime.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Simulation Speed</label>
          <div className="flex gap-2">
            {[0.5, 1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                  speed === s ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex-1 px-4 py-2 rounded font-medium transition-all ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        <button
          onClick={resetSimulation}
          className="px-4 py-2 rounded font-medium bg-gray-700 hover:bg-gray-600 transition-all"
        >
          🔄 Reset
        </button>
      </div>

      {/* Events log */}
      <div className="flex-1 bg-black/30 rounded-lg p-4 overflow-y-auto">
        <h3 className="font-medium mb-2 text-sm">Event Log (Time: {simulation.time})</h3>
        <div className="space-y-1">
          {simulation.events.map((event, i) => (
            <motion.div
              key={`${i}-${event}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-gray-300 font-mono"
            >
              {event}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Strategy info */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
        <div className="bg-gray-800 rounded p-3">
          <h4 className="font-medium mb-1 text-gray-400">Silverfish Strategy</h4>
          <ul className="space-y-1 text-gray-500">
            <li>• Small steady gains in bulls</li>
            <li>• Minimal loss in bears</li>
            <li>• Never dies, compounds Lindy</li>
            <li>• Adapts to any regime</li>
          </ul>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <h4 className="font-medium mb-1 text-purple-400">Cell Division Strategy</h4>
          <ul className="space-y-1 text-gray-500">
            <li>• Explosive growth in bulls</li>
            <li>• High risk in bears (can die)</li>
            <li>• Viral spikes possible</li>
            <li>• Optimized for growth, not survival</li>
          </ul>
        </div>
      </div>
    </div>
  );
}