import React from 'react';
import { RefreshCw, ShieldCheck, Database, ArrowLeft } from 'lucide-react';

export default function Header({ serverKeyInfo, cacheSize, onRefresh, loading, onGoToLanding }) {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-meta">
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-red)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0,
                marginRight: '8px'
              }}
            >
              <ArrowLeft size={12} />
              <span>LANDING PAGE</span>
            </button>
          )}
          <span>{'{0017}'}</span>
          <span>•</span>
          <span>DEFERRED SETTLEMENT ENGINE</span>
        </div>
        <div className="header-title" style={{ cursor: 'pointer' }} onClick={onGoToLanding}>
          OFF MESH<span className="highlight">.</span>
        </div>
      </div>

      <div className="header-actions">
        {serverKeyInfo && (
          <div className="badge badge-red" title={serverKeyInfo.hybridScheme}>
            <ShieldCheck size={13} />
            <span>{serverKeyInfo.algorithm}</span>
          </div>
        )}

        <div className="badge badge-dark">
          <Database size={13} />
          <span>Cache: {cacheSize ?? 0}</span>
        </div>

        <button className="btn-icon" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}
