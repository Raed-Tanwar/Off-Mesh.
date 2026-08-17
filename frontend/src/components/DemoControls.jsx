import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RefreshCw, UploadCloud, Trash2, Settings, AlertTriangle, ArrowRight, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';

export default function DemoControls({
  onSend,
  onGossip,
  onFlush,
  onReset,
  loadingAction,
  stressTest,
  setStressTest
}) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Compose, 2: Gossip, 3: Flush
  const [senderVpa, setSenderVpa] = useState('alice@demo');
  const [receiverVpa, setReceiverVpa] = useState('bob@demo');
  const [amount, setAmount] = useState(500);
  const [pin, setPin] = useState('1234');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [flushOutcome, setFlushOutcome] = useState(null); // null | 'settled' | 'rejected'

  const handleSendSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    await onSend({ senderVpa, receiverVpa, amount: parseFloat(amount), pin, ttl: 5, startDevice: 'phone-alice' });
    setFlushOutcome(null);
    setCurrentStep(2); // Slide to Step 2: Gossip
  };

  const handleFlushSubmit = async () => {
    const result = await onFlush();
    if (result && result.hasRejected) {
      setFlushOutcome('rejected');
    } else {
      setFlushOutcome('settled');
    }
  };

  const handleNewPayment = () => {
    setFlushOutcome(null);
    setCurrentStep(1); // Slide back to Step 1: Compose
  };

  const handleResetAll = async () => {
    setShowConfirmReset(false);
    await onReset();
    setFlushOutcome(null);
    setCurrentStep(1);
  };

  return (
    <div className="controls-stack">
      <div className="section-header">
        <div className="section-title">
          <span>Pipeline Actions</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="btn-icon"
          style={{ padding: '6px 14px', fontSize: '12px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Settings size={13} />
          <span>{showAdvanced ? 'Hide Options' : 'Options'}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1.5px solid var(--accent-red)',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={20} color="var(--accent-red)" />
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Duplicate-Storm Stress Test</strong>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    Seeds all 5 mesh devices before uploading to demonstrate atomic idempotency deduplication.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={stressTest}
                onChange={(e) => setStressTest(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-red)' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Sliding Step Container */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '340px' }}>
        <AnimatePresence mode="wait">
          {/* STEP 1: Compose Payment */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="step-card-chic"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="step-title-chic">01 / Compose Payment</div>
                <div className="step-number">01</div>
              </div>

              <form onSubmit={handleSendSubmit} className="form-group">
                <div className="form-row">
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>From Account</label>
                    <select className="select-field" value={senderVpa} onChange={(e) => setSenderVpa(e.target.value)}>
                      <option value="alice@demo">alice@demo</option>
                      <option value="bob@demo">bob@demo</option>
                      <option value="carol@demo">carol@demo</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>To Account</label>
                    <select className="select-field" value={receiverVpa} onChange={(e) => setReceiverVpa(e.target.value)}>
                      <option value="bob@demo">bob@demo</option>
                      <option value="carol@demo">carol@demo</option>
                      <option value="alice@demo">alice@demo</option>
                      <option value="dave@demo">dave@demo</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>Amount (₹)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>PIN Code</label>
                    <input
                      type="password"
                      className="input-field"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                </div>

                {/* Live Preview */}
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 16px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>PAYMENT:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{senderVpa}</span>
                  <ArrowRight size={12} color="var(--accent-red)" />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{receiverVpa}</span>
                  <span style={{ color: 'var(--accent-red)', marginLeft: 'auto', fontWeight: 700, fontSize: '14px' }}>₹{amount}</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="btn-primary btn-red"
                  disabled={loadingAction === 'send'}
                >
                  <Send size={15} />
                  <span>{loadingAction === 'send' ? 'Encrypting...' : 'Inject into Mesh (Next →)'}</span>
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: Gossip Propagation */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="step-card-chic"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="step-title-chic">02 / Gossip Propagation</div>
                <div className="step-number">02</div>
              </div>

              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 18px',
                fontSize: '13px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Current Mesh Payload
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)' }}>
                  <span>{senderVpa} → {receiverVpa}</span>
                  <strong style={{ color: 'var(--accent-red)', fontSize: '16px' }}>₹{amount}</strong>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Broadcast encrypted payment payload across neighboring phones via Bluetooth mesh. Run gossip rounds to spread the packet.
              </p>

              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="btn-primary btn-dark"
                  onClick={onGossip}
                  disabled={loadingAction === 'gossip'}
                  style={{ flex: 1 }}
                >
                  <RefreshCw size={14} className={loadingAction === 'gossip' ? 'spin' : ''} />
                  <span>{loadingAction === 'gossip' ? 'Hopping...' : 'Run Gossip Round'}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="btn-primary btn-red"
                  onClick={() => setCurrentStep(3)}
                  style={{ flex: 1 }}
                >
                  <span>Proceed to Bridge →</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: 4G Bridge Upload & Settlement */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="step-card-chic"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="step-title-chic">03 / 4G Bridge Upload</div>
                <div className="step-number">03</div>
              </div>

              {flushOutcome === 'rejected' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f97316' }}>
                    <XCircle size={28} />
                    <div>
                      <strong style={{ fontSize: '18px', fontFamily: 'var(--font-display)' }}>Payment Rejected</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Payment rejected: insufficient funds. Account balances remain unchanged.
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="btn-primary btn-red"
                    onClick={handleNewPayment}
                    style={{ marginTop: '12px' }}
                  >
                    <RotateCcw size={15} />
                    <span>Start New Payment (Slide to Step 1)</span>
                  </motion.button>
                </div>
              ) : flushOutcome === 'settled' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-green)' }}>
                    <CheckCircle2 size={28} />
                    <div>
                      <strong style={{ fontSize: '18px', fontFamily: 'var(--font-display)' }}>Payment Settled Successfully!</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Ledger debited ₹{amount} from {senderVpa} and credited {receiverVpa}.
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="btn-primary btn-red"
                    onClick={handleNewPayment}
                    style={{ marginTop: '12px' }}
                  >
                    <RotateCcw size={15} />
                    <span>Start New Payment (Slide to Step 1)</span>
                  </motion.button>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Simulates bridge node walking outside to 4G coverage. Uploads held packets to backend via parallel POST requests.
                  </p>

                  <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                    <button
                      className="btn-icon"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                      onClick={() => setCurrentStep(2)}
                    >
                      ← Back
                    </button>

                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      className="btn-primary btn-red"
                      onClick={handleFlushSubmit}
                      disabled={loadingAction === 'flush'}
                      style={{ flex: 1 }}
                    >
                      <UploadCloud size={15} />
                      <span>{loadingAction === 'flush' ? 'Uploading...' : 'Bridges Upload & Settle'}</span>
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Permanent Step 4: Clear Mesh & Cache (Placed down below) */}
      <motion.div className="step-card-chic" whileHover={{ y: -2 }} style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="step-title-chic">04 / Reset System State</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Clears all held packets across devices and wipes JVM idempotency cache to start fresh.
            </div>
          </div>

          <div style={{ minWidth: '160px', textAlign: 'right' }}>
            {showConfirmReset ? (
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  className="btn-primary btn-red"
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                  onClick={handleResetAll}
                >
                  Confirm
                </button>
                <button
                  className="btn-icon"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', padding: '8px 12px', fontSize: '12px' }}
                  onClick={() => setShowConfirmReset(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="btn-primary btn-outline-danger"
                style={{ padding: '10px 18px', fontSize: '13px' }}
                onClick={() => setShowConfirmReset(true)}
                disabled={loadingAction === 'reset'}
              >
                <Trash2 size={14} />
                <span>Reset State</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
