import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, UploadCloud, CheckCircle2, XCircle } from 'lucide-react';

export default function PaymentProgress({ activePayment }) {
  if (!activePayment) return null;

  const { stage, packetId, senderVpa, receiverVpa, amount } = activePayment;

  // Stages: 1 = Injected (25%), 2 = Gossiping (60%), 3 = Uploading (85%), 4 = Settled/Rejected (100%)
  const getProgressPercent = () => {
    switch (stage) {
      case 'injected': return 25;
      case 'gossiping': return 65;
      case 'uploading': return 88;
      case 'settled': return 100;
      case 'rejected': return 100;
      default: return 0;
    }
  };

  const percent = getProgressPercent();
  const isRejected = stage === 'rejected';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'var(--text-secondary)'
          }}>
            LIFECYCLE TRACKER
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--accent-red)'
          }}>
            #{packetId ? packetId.substring(0, 8) : 'PACKET'}
          </span>
        </div>

        <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          <span>{senderVpa}</span>
          <span style={{ color: 'var(--accent-red)', margin: '0 6px' }}>→</span>
          <span>{receiverVpa}</span>
          <span style={{ color: 'var(--text-primary)', marginLeft: '12px', fontWeight: 700 }}>₹{amount}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '8px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-pill)',
        overflow: 'hidden'
      }}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%',
            background: isRejected ? '#f97316' : stage === 'settled' ? 'var(--accent-green)' : 'var(--accent-red)',
            borderRadius: 'var(--radius-pill)'
          }}
        />
      </div>

      {/* Step Indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ color: percent >= 25 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: percent >= 25 ? 700 : 400, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={13} color={percent >= 25 ? 'var(--accent-red)' : 'var(--text-muted)'} />
          <span>1. Injected (Alice)</span>
        </div>

        <div style={{ color: percent >= 65 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: percent >= 65 ? 700 : 400, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={13} color={percent >= 65 ? 'var(--accent-red)' : 'var(--text-muted)'} />
          <span>2. Mesh Hopping</span>
        </div>

        <div style={{ color: percent >= 88 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: percent >= 88 ? 700 : 400, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UploadCloud size={13} color={percent >= 88 ? 'var(--accent-red)' : 'var(--text-muted)'} />
          <span>3. 4G Bridge Upload</span>
        </div>

        <div style={{
          color: isRejected ? '#f97316' : percent >= 100 ? 'var(--accent-green)' : 'var(--text-muted)',
          fontWeight: percent >= 100 ? 700 : 400,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {isRejected ? (
            <>
              <XCircle size={13} color="#f97316" />
              <span>4. Rejected (Insufficient Funds)</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={13} color={percent >= 100 ? 'var(--accent-green)' : 'var(--text-muted)'} />
              <span>4. Settled Ledger</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
