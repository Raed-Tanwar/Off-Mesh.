import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountCards({ accounts = [] }) {
  return (
    <div className="accounts-container">
      <div className="section-header">
        <div className="section-title">
          <span>Account Ledger & Balances</span>
        </div>
        <span className="badge">
          Live Account Ledger
        </span>
      </div>

      <div className="accounts-grid-chic">
        {accounts.map((acc, idx) => {
          const discCount = (idx % 3) + 1;

          return (
            <motion.div
              key={acc.vpa}
              className="account-card-chic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="user-vpa">{acc.vpa}</div>
                
                {/* Red Discs Graphic with Magnetic Fan-out Hover */}
                <div className="graphic-discs">
                  {Array.from({ length: discCount }).map((_, i) => (
                    <div key={i} className={i === discCount - 1 && idx % 2 === 0 ? "disc-half" : "disc"} />
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
                  {acc.holderName}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={acc.balance}
                    initial={{ scale: 0.95, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="balance-num"
                  >
                    ₹{typeof acc.balance === 'number' ? acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : parseFloat(acc.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
