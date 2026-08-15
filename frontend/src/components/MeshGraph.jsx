import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Wifi, WifiOff, Radio } from 'lucide-react';

const NODE_POSITIONS = {
  'phone-alice': { x: 130, y: 120, label: 'Alice', color: '#111111' },
  'phone-bob': { x: 370, y: 85, label: 'Bob', color: '#111111' },
  'phone-carol': { x: 190, y: 285, label: 'Carol', color: '#111111' },
  'phone-dave': { x: 470, y: 285, label: 'Dave', color: '#111111' },
  'phone-bridge': { x: 630, y: 160, label: 'Bridge Node', color: 'var(--accent-red)' }
};

const EDGES = [
  ['phone-alice', 'phone-bob'],
  ['phone-alice', 'phone-carol'],
  ['phone-bob', 'phone-carol'],
  ['phone-bob', 'phone-dave'],
  ['phone-carol', 'phone-dave'],
  ['phone-bob', 'phone-bridge'],
  ['phone-dave', 'phone-bridge']
];

export default function MeshGraph({ devices = [], activeTransfers = [] }) {
  const [transferParticles, setTransferParticles] = useState([]);

  useEffect(() => {
    if (activeTransfers.length > 0) {
      const particles = activeTransfers.map((t, idx) => ({
        id: `${t.from}-${t.to}-${Date.now()}-${idx}`,
        fromPos: NODE_POSITIONS[t.from] || NODE_POSITIONS['phone-alice'],
        toPos: NODE_POSITIONS[t.to] || NODE_POSITIONS['phone-bridge']
      }));

      setTransferParticles((prev) => [...prev, ...particles]);

      const timer = setTimeout(() => {
        setTransferParticles((prev) => prev.filter((p) => !particles.includes(p)));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [activeTransfers]);

  const getDeviceData = (id) => {
    return devices.find((d) => d.deviceId === id) || { packetCount: 0, hasInternet: id === 'phone-bridge', packetIds: [] };
  };

  return (
    <div className="mesh-card-chic">
      <div className="section-header">
        <div className="section-title">
          <Radio size={20} color="var(--accent-red)" />
          <span>Mesh Topology Visualizer</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge badge-red">
            <Wifi size={12} /> Bridge 4G Active
          </span>
          <span className="badge">
            <WifiOff size={12} /> Offline Nodes
          </span>
        </div>
      </div>

      <div className="svg-container">
        <svg width="100%" height="100%" viewBox="0 0 760 380" style={{ overflow: 'visible' }}>
          {/* Mesh Connection Lines */}
          {EDGES.map(([nodeA, nodeB], idx) => {
            const posA = NODE_POSITIONS[nodeA];
            const posB = NODE_POSITIONS[nodeB];
            const devA = getDeviceData(nodeA);
            const devB = getDeviceData(nodeB);
            const isEdgeActive = devA.packetCount > 0 && devB.packetCount > 0;

            return (
              <line
                key={`edge-${idx}`}
                x1={posA.x}
                y1={posA.y}
                x2={posB.x}
                y2={posB.y}
                stroke={isEdgeActive ? 'var(--accent-red)' : '#d8d5cc'}
                strokeWidth={isEdgeActive ? 2.5 : 1.5}
                strokeDasharray={isEdgeActive ? '6,4' : 'none'}
              />
            );
          })}

          {/* Smooth Native SVG Packet Flow Animation */}
          <AnimatePresence>
            {transferParticles.map((p) => (
              <g key={p.id}>
                {/* Glowing Outer Particle Ring */}
                <motion.circle
                  r="12"
                  fill="none"
                  stroke="var(--accent-red)"
                  strokeWidth="1.5"
                  initial={{ cx: p.fromPos.x, cy: p.fromPos.y, opacity: 0.8 }}
                  animate={{ cx: p.toPos.x, cy: p.toPos.y, opacity: 0.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
                {/* Solid Inner Particle Dot */}
                <motion.circle
                  r="6"
                  fill="var(--accent-red)"
                  initial={{ cx: p.fromPos.x, cy: p.fromPos.y, opacity: 1 }}
                  animate={{ cx: p.toPos.x, cy: p.toPos.y, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
              </g>
            ))}
          </AnimatePresence>

          {/* Stable SVG Mesh Nodes */}
          {Object.entries(NODE_POSITIONS).map(([id, pos]) => {
            const dev = getDeviceData(id);
            const hasPackets = dev.packetCount > 0;
            const isBridge = id === 'phone-bridge';

            return (
              <g key={id} transform={`translate(${pos.x}, ${pos.y})`}>
                {/* Smooth Expanding Ripple Ring */}
                {hasPackets && (
                  <motion.circle
                    r="28"
                    fill="none"
                    stroke={isBridge ? 'var(--accent-red)' : '#111111'}
                    strokeWidth="1.5"
                    initial={{ r: 28, opacity: 0.8 }}
                    animate={{ r: [28, 44], opacity: [0.8, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}

                {/* Node Body Circle */}
                <circle
                  r="26"
                  fill={hasPackets ? (isBridge ? 'var(--accent-red)' : '#111111') : '#ffffff'}
                  stroke={isBridge ? 'var(--accent-red)' : '#111111'}
                  strokeWidth="2.5"
                />

                {/* Node Icon */}
                <g transform="translate(-10, -10)">
                  {isBridge ? (
                    <Wifi size={20} color={hasPackets ? '#ffffff' : 'var(--accent-red)'} />
                  ) : (
                    <Smartphone size={20} color={hasPackets ? '#ffffff' : '#111111'} />
                  )}
                </g>

                {/* Packet Count Badge */}
                {dev.packetCount > 0 && (
                  <g transform="translate(16, -16)">
                    <circle r="11" fill="var(--accent-red)" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="var(--font-mono)"
                    >
                      {dev.packetCount}
                    </text>
                  </g>
                )}

                {/* Node Labels */}
                <text
                  x="0"
                  y="44"
                  textAnchor="middle"
                  fill="var(--text-primary)"
                  fontSize="13"
                  fontWeight="700"
                  fontFamily="var(--font-display)"
                >
                  {id}
                </text>
                <text
                  x="0"
                  y="58"
                  textAnchor="middle"
                  fill={isBridge ? 'var(--accent-red)' : 'var(--text-secondary)'}
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {isBridge ? '🌐 4G Bridge' : dev.packetCount > 0 ? `${dev.packetCount} packet(s)` : 'offline'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
