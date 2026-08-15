import React from 'react';
import { motion } from 'framer-motion';
import { Radio, ArrowRight, Smartphone, Wifi, Lock, Zap, Cpu, Database } from 'lucide-react';

export default function LandingPage({ onLaunchDashboard }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #c84028 0%, #b3321c 50%, #9e2713 100%)',
        color: '#ffffff'
      }}
    >
      {/* Chic Top Header (Without buttons) */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 48px',
          zIndex: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c84028',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
          }}>
            <Radio size={20} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.8px', color: '#ffffff' }}>
            OFF MESH.
          </span>
        </div>


      </header>

      {/* Hero Body: Giant Background Typography "OFF MESH" + Floating 3D Phone Displays */}
      <main
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 20px 60px 20px',
          zIndex: 10
        }}
      >
        {/* Giant White Block Typography spanning behind float elements */}
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: 'var(--font-display)',
            fontSize: 'min(24vw, 320px)',
            fontWeight: 900,
            letterSpacing: '-8px',
            color: 'rgba(255, 255, 255, 0.15)',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            zIndex: 1,
            lineHeight: 1
          }}
        >
          OFF MESH
        </div>

        {/* Center Floating 3D Graphic Display Elements */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
            margin: '20px 0 20px 0'
          }}
        >
          {/* Floating Phone 1: Alice Sender */}
          <motion.div
            animate={{ y: [-12, 12, -12], rotate: [-2, 2, -2] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: '#ffffff',
              color: '#111111',
              borderRadius: '24px',
              padding: '28px 32px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '240px',
              border: '2px solid rgba(255,255,255,0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Smartphone size={26} color="#c84028" />
              <span className="badge" style={{ background: '#c84028', color: '#ffffff', fontSize: '9px', fontWeight: 800 }}>
                ORIGIN NODE
              </span>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#666666' }}>alice@demo</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#111111' }}>₹500.00</div>
            </div>
            <div style={{ fontSize: '10px', color: '#c84028', fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} /> RSA-2048 / AES-GCM
            </div>
          </motion.div>

          {/* Floating Center Vermilion Red Disc */}
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95], rotate: [-4, 4, -4] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 30px 70px rgba(0, 0, 0, 0.4)',
              position: 'relative'
            }}
          >
            <Radio size={56} color="#c84028" />
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#111111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800
            }}>
              4G
            </div>
          </motion.div>

          {/* Floating Phone 2: Bridge Settlement */}
          <motion.div
            animate={{ y: [12, -12, 12], rotate: [2, -2, 2] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: '#111111',
              color: '#ffffff',
              borderRadius: '24px',
              padding: '28px 32px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '240px',
              border: '2px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Wifi size={26} color="#aaff3e" />
              <span className="badge" style={{ background: '#aaff3e', color: '#111111', fontSize: '9px', fontWeight: 800 }}>
                4G BRIDGE
              </span>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#888888' }}>SETTLEMENT ENGINE</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#aaff3e' }}>SETTLED</div>
            </div>
            <div style={{ fontSize: '10px', color: '#aaaaaa', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={12} color="#aaff3e" /> ATOMIC SETNX DEDUP
            </div>
          </motion.div>
        </div>
      </main>

      {/* Upward Arch Curved Bottom Sheet / Control Dock */}
      <footer
        style={{
          background: '#f6f4ee',
          color: '#111111',
          borderTopLeftRadius: '50% 40px',
          borderTopRightRadius: '50% 40px',
          padding: '36px 60px 36px 60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '32px',
          zIndex: 20,
          boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.2)',
          flexWrap: 'wrap'
        }}
      >
        {/* Left Side: Editorial Pitch Paragraph */}
        <div style={{ maxWidth: '380px' }}>
          <p style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#c84028',
            marginBottom: '6px'
          }}>
            DEFERRED MESH ROUTING ENGINE
          </p>
          <p style={{
            fontSize: '12px',
            color: '#444444',
            lineHeight: 1.5,
            fontWeight: 500
          }}>
            ZERO INTERNET REQUIRED AT POINT OF SALE. PAYMENTS HOP PHONE-TO-PHONE OVER BLUETOOTH UNTIL A 4G BRIDGE NODE SETTLES THEM.
          </p>
        </div>

        {/* Center: Single Prominent MAKE PAYMENT Button */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLaunchDashboard}
            style={{
              background: '#c84028',
              color: '#ffffff',
              border: 'none',
              padding: '18px 48px',
              borderRadius: '999px',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 12px 35px rgba(200, 64, 40, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>MAKE PAYMENT</span>
            <ArrowRight size={18} />
          </motion.button>
        </div>

        {/* Right Side: Feature Icon Cards */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2ded4',
            borderRadius: '16px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <Lock size={18} color="#c84028" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800 }}>RSA-2048</div>
              <div style={{ fontSize: '9px', color: '#666666' }}>HYBRID ENCRYPTION</div>
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2ded4',
            borderRadius: '16px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <Cpu size={18} color="#c84028" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800 }}>BLUETOOTH</div>
              <div style={{ fontSize: '9px', color: '#666666' }}>GOSSIP PROTOCOL</div>
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2ded4',
            borderRadius: '16px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <Database size={18} color="#c84028" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800 }}>IDEMPOTENCY</div>
              <div style={{ fontSize: '9px', color: '#666666' }}>SETNX DEDUPLICATION</div>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
