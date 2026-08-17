import React from 'react';
import { Terminal, Trash2 } from 'lucide-react';

export default function ActivityLog({ logs = [], onClearLog }) {
  const getLogColor = (msg) => {
    if (msg.includes('SETTLED')) return '#4ade80';
    if (msg.includes('REJECTED')) return '#f97316';
    if (msg.includes('DUPLICATE')) return '#facc15';
    if (msg.includes('INVALID') || msg.includes('Error')) return '#f87171';
    if (msg.includes('Packet') || msg.includes('Inject')) return '#38bdf8';
    return '#f3f4f6';
  };

  return (
    <div className="card-panel">
      <div className="section-header">
        <div className="section-title">
          <Terminal size={18} color="var(--accent-red)" />
          <span>Real-time Stream</span>
        </div>
        <button
          className="btn-icon"
          onClick={onClearLog}
          style={{ padding: '4px 12px', fontSize: '11px', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          title="Clear log"
        >
          <Trash2 size={12} />
          <span>Clear</span>
        </button>
      </div>

      <div className="terminal-window-chic">
        {logs.length === 0 ? (
          <div style={{ color: '#777777' }}>
            [System initialized] Pipeline event stream ready. Perform an action to log events.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} style={{ color: getLogColor(log.text) }}>
              <span style={{ color: '#666666' }}>[{log.timestamp}]</span> {log.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
