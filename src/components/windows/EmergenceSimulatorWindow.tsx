import React, { useRef, useEffect, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'builder' | 'connector' | 'explorer';
}

const SCENARIOS = [
  {
    name: 'Beaver Dam',
    description: 'Builders create structure, connectors form networks, explorers discover new territory',
    builderCount: 50,
    connectorCount: 30,
    explorerCount: 20
  },
  {
    name: 'Crypto Ecosystem',
    description: 'Developers build protocols, DAOs coordinate, degens explore opportunities',
    builderCount: 40,
    connectorCount: 40,
    explorerCount: 20
  },
  {
    name: 'Lost Generation',
    description: 'Artists build culture, intellectuals connect ideas, rebels explore boundaries',
    builderCount: 30,
    connectorCount: 25,
    explorerCount: 45
  },
  {
    name: 'Network Formation',
    description: 'Equal distribution shows how infrastructure naturally emerges',
    builderCount: 33,
    connectorCount: 33,
    explorerCount: 34
  }
];

export function EmergenceSimulatorWindow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [showTrails, setShowTrails] = useState(true);
  const [speed, setSpeed] = useState(1);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  const initializeParticles = (scenario: typeof SCENARIOS[0]) => {
    const particles: Particle[] = [];
    const width = 800;
    const height = 500;

    // Add builders
    for (let i = 0; i < scenario.builderCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: 'builder'
      });
    }

    // Add connectors
    for (let i = 0; i < scenario.connectorCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: 'connector'
      });
    }

    // Add explorers
    for (let i = 0; i < scenario.explorerCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 3, // Explorers move faster
        vy: (Math.random() - 0.5) * 3,
        type: 'explorer'
      });
    }

    particlesRef.current = particles;
  };

  useEffect(() => {
    initializeParticles(SCENARIOS[selectedScenario]);
  }, [selectedScenario]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const animate = () => {
      if (!isRunning) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Clear with slight trail effect if enabled
      if (showTrails) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = 'rgb(15, 23, 42)';
        ctx.fillRect(0, 0, width, height);
      }

      const particles = particlesRef.current;

      // Draw connections between nearby connectors and others
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
      ctx.lineWidth = 1;

      particles.forEach((p1, i) => {
        if (p1.type !== 'connector') return;

        particles.forEach((p2, j) => {
          if (i >= j) return;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      // Update and draw particles
      particles.forEach(p => {
        // Update position
        p.x += p.vx * speed;
        p.y += p.vy * speed;

        // Bounce off walls
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Keep within bounds
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        // Behavioral rules
        if (p.type === 'builder') {
          // Builders slow down and cluster
          p.vx *= 0.99;
          p.vy *= 0.99;

          // Attract to other builders (infrastructure clustering)
          particles.forEach(other => {
            if (other.type === 'builder' && other !== p) {
              const dx = other.x - p.x;
              const dy = other.y - p.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 80 && distance > 10) {
                p.vx += (dx / distance) * 0.01;
                p.vy += (dy / distance) * 0.01;
              }
            }
          });
        } else if (p.type === 'connector') {
          // Connectors maintain steady pace and bridge groups
          const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (currentSpeed > 0) {
            p.vx = (p.vx / currentSpeed) * 1.5;
            p.vy = (p.vy / currentSpeed) * 1.5;
          }
        } else if (p.type === 'explorer') {
          // Explorers avoid crowds and speed up
          let crowdFactor = 0;
          particles.forEach(other => {
            if (other !== p) {
              const dx = other.x - p.x;
              const dy = other.y - p.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 60) {
                crowdFactor++;
                p.vx -= (dx / distance) * 0.02;
                p.vy -= (dy / distance) * 0.02;
              }
            }
          });

          // Speed up when avoiding crowds
          if (crowdFactor > 3) {
            p.vx *= 1.05;
            p.vy *= 1.05;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.type === 'explorer' ? 3 : 4, 0, Math.PI * 2);

        if (p.type === 'builder') {
          ctx.fillStyle = '#10b981'; // Green - infrastructure
        } else if (p.type === 'connector') {
          ctx.fillStyle = '#22d3ee'; // Cyan - network
        } else {
          ctx.fillStyle = '#f59e0b'; // Amber - exploration
        }

        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, showTrails, speed]);

  const handleReset = () => {
    initializeParticles(SCENARIOS[selectedScenario]);
  };

  const scenario = SCENARIOS[selectedScenario];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold mb-2">Emergence Simulator</h2>
        <p className="text-sm text-slate-400">
          Watch how simple agents following basic rules create complex emergent systems.
          Builders cluster (infrastructure), connectors bridge (networks), explorers discover (new territory).
        </p>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="border border-slate-700 rounded"
        />
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-slate-700 space-y-4">
        {/* Scenario Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Scenario:</label>
          <div className="grid grid-cols-2 gap-2">
            {SCENARIOS.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedScenario(i)}
                className={`p-3 rounded text-left transition-colors ${
                  selectedScenario === i
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-xs opacity-75">{s.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Scenario Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Builders: {scenario.builderCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span>Connectors: {scenario.connectorCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Explorers: {scenario.explorerCount}</span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
          >
            {isRunning ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`px-4 py-2 rounded transition-colors ${
              showTrails
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            Trails: {showTrails ? 'On' : 'Off'}
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm">Speed:</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-32"
            />
            <span className="text-sm">{speed}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
