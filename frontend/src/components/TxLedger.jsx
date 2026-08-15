import React from 'react';
import { FileText, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function TxLedger({ transactions = [] }) {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="card-panel">
      <div className="section-header">
        <div className="section-title">
          <FileText size={18} color="var(--accent-red)" />
          <span>Settled Transaction Ledger</span>
        </div>
        <span className="badge">
          DB Unique Hash Index
        </span>
      </div>

      {transactions.length === 0 ? (
        <div
          style={{
            padding: '32px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          No transactions settled yet. Execute pipeline steps above.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="tx-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>From → To</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Bridge Node</th>
                <th>Hops</th>
                <th>Settled Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                    #{tx.id}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                      <span>{tx.senderVpa}</span>
                      <ArrowRight size={13} color="var(--accent-red)" />
                      <span>{tx.receiverVpa}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '15px' }}>
                    ₹{typeof tx.amount === 'number' ? tx.amount.toFixed(2) : parseFloat(tx.amount || 0).toFixed(2)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {tx.status === 'SETTLED' ? (
                        <CheckCircle2 size={15} color="var(--accent-green)" />
                      ) : (
                        <XCircle size={15} color="var(--accent-red)" />
                      )}
                      <span className={`tx-status-${tx.status}`}>{tx.status}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {tx.bridgeNodeId}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    <span className="badge" style={{ padding: '2px 8px' }}>{tx.hopCount}</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {formatTime(tx.settledAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
