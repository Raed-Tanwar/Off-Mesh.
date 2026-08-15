import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function GossipChart({ data = [] }) {
  return (
    <div className="card-panel">
      <div className="section-header">
        <div className="section-title">
          <TrendingUp size={18} color="var(--accent-red)" />
          <span>Propagation Curve</span>
        </div>
        <span className="badge">
          Mesh Reachability
        </span>
      </div>

      {data.length === 0 ? (
        <div
          style={{
            height: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          Run a gossip round to view packet propagation curve
        </div>
      ) : (
        <div style={{ width: '100%', height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gossipGradientChic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-red)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-red)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="round"
                stroke="#88857f"
                tick={{ fill: '#66635c', fontSize: 11 }}
                tickFormatter={(r) => `Round ${r}`}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
                stroke="#88857f"
                tick={{ fill: '#66635c', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111111',
                  borderColor: '#111111',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}
                labelStyle={{ color: 'var(--accent-red)' }}
              />
              <Area
                type="monotone"
                dataKey="devices"
                stroke="var(--accent-red)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#gossipGradientChic)"
                dot={{ r: 5, fill: 'var(--accent-red)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
