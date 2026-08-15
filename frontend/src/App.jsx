import React, { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import MeshGraph from './components/MeshGraph';
import AccountCards from './components/AccountCards';
import DemoControls from './components/DemoControls';
import GossipChart from './components/GossipChart';
import TxLedger from './components/TxLedger';
import ActivityLog from './components/ActivityLog';
import PaymentProgress from './components/PaymentProgress';
import LandingPage from './components/LandingPage';
import Toast from './components/Toast';
import {
  getServerKey,
  getAccounts,
  getTransactions,
  getMeshState,
  sendPacket,
  runGossip,
  flushBridges,
  resetMesh
} from './api';
import './App.css';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard'
  const [serverKeyInfo, setServerKeyInfo] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [meshDevices, setMeshDevices] = useState([]);
  const [idempotencyCacheSize, setIdempotencyCacheSize] = useState(0);
  const [activeTransfers, setActiveTransfers] = useState([]);
  const [gossipHistory, setGossipHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [stressTest, setStressTest] = useState(false);
  const [activePayment, setActivePayment] = useState(null);

  const addLog = useCallback((text) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ id: `${Date.now()}-${Math.random()}`, timestamp, text }, ...prev]);
  }, []);

  const addToast = useCallback((message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [accs, txs, mesh] = await Promise.all([
        getAccounts(),
        getTransactions(),
        getMeshState()
      ]);
      setAccounts(accs);
      setTransactions(txs);
      setMeshDevices(mesh.devices || []);
      setIdempotencyCacheSize(mesh.idempotencyCacheSize || 0);
    } catch (err) {
      console.error('Failed to fetch backend data:', err);
      addToast(`Backend Error: ${err.message || 'Cannot reach Spring Boot server'}`);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    getServerKey()
      .then((keyData) => setServerKeyInfo(keyData))
      .catch((err) => console.warn('Could not fetch server key info:', err));

    refreshAllData();
  }, [refreshAllData]);

  const handleSend = async (payload) => {
    setLoadingAction('send');
    try {
      const res = await sendPacket(payload);
      addLog(`📤 Packet ${res.packetId.substring(0, 8)} — ₹${payload.amount} from ${payload.senderVpa} → ${payload.receiverVpa}`);
      addLog(`   Injected at ${res.injectedAt} (TTL ${res.ttl}) · Ciphertext: ${res.ciphertextPreview}`);
      await refreshAllData();
      setGossipHistory([{ round: 0, devices: 1 }]);

      setActivePayment({
        stage: 'injected',
        packetId: res.packetId,
        senderVpa: payload.senderVpa,
        receiverVpa: payload.receiverVpa,
        amount: payload.amount
      });
    } catch (err) {
      addToast(`Inject failed: ${err.message}`);
      addLog(`🔥 Error injecting packet: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGossip = async () => {
    setLoadingAction('gossip');
    try {
      const res = await runGossip();
      const transferCount = res.transfers || 0;
      addLog(`🔄 Gossip Round: ${transferCount} transfer(s) — ${JSON.stringify(res.deviceCounts)}`);

      if (res.deviceCounts) {
        const transfers = [];
        const devicesWithPackets = Object.entries(res.deviceCounts).filter(([_, count]) => count > 0);
        devicesWithPackets.forEach(([deviceId]) => {
          transfers.push({ from: 'phone-alice', to: deviceId });
        });
        setActiveTransfers(transfers);
      }

      await refreshAllData();

      const currentMesh = await getMeshState();
      const countHolding = (currentMesh.devices || []).filter((d) => d.packetCount > 0).length;

      setGossipHistory((prev) => {
        const nextRound = prev.length;
        return [...prev, { round: nextRound, devices: countHolding }];
      });

      if (activePayment) {
        setActivePayment((prev) => ({ ...prev, stage: 'gossiping' }));
      }
    } catch (err) {
      addToast(`Gossip failed: ${err.message}`);
      addLog(`🔥 Error running gossip: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFlush = async () => {
    setLoadingAction('flush');
    if (activePayment) {
      setActivePayment((prev) => ({ ...prev, stage: 'uploading' }));
    }

    try {
      if (stressTest) {
        addLog(`⚡ [Stress Test] Flooding mesh prior to upload...`);
        await runGossip();
        await runGossip();
      }

      const res = await flushBridges();
      addLog(`📡 ${res.uploadsAttempted} bridge upload(s):`);

      (res.results || []).forEach((r) => {
        if (r.outcome === 'SETTLED') {
          addLog(`   ✅ Bridge ${r.bridgeNode} packet ${r.packetId} → SETTLED (Tx #${r.transactionId})`);
        } else if (r.outcome === 'DUPLICATE_DROPPED') {
          addLog(`   ⚠️ Bridge ${r.bridgeNode} packet ${r.packetId} → DUPLICATE_DROPPED (Idempotency protected)`);
        } else {
          addLog(`   ❌ Bridge ${r.bridgeNode} packet ${r.packetId} → INVALID (${r.reason})`);
        }
      });

      await refreshAllData();

      if (activePayment) {
        setActivePayment((prev) => ({ ...prev, stage: 'settled' }));
      }
    } catch (err) {
      addToast(`Bridge upload failed: ${err.message}`);
      addLog(`🔥 Error uploading: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReset = async () => {
    setLoadingAction('reset');
    try {
      await resetMesh();
      addLog(`🗑 Mesh devices & cache reset`);
      setGossipHistory([]);
      setActivePayment(null);
      await refreshAllData();
    } catch (err) {
      addToast(`Reset failed: ${err.message}`);
      addLog(`🔥 Error resetting: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  if (view === 'landing') {
    return <LandingPage onLaunchDashboard={() => setView('dashboard')} />;
  }

  return (
    <div className="app-container">
      <Header
        serverKeyInfo={serverKeyInfo}
        cacheSize={idempotencyCacheSize}
        onRefresh={refreshAllData}
        loading={loading}
        onGoToLanding={() => setView('landing')}
      />

      <PaymentProgress activePayment={activePayment} />

      <div className="main-grid">
        <DemoControls
          onSend={handleSend}
          onGossip={handleGossip}
          onFlush={handleFlush}
          onReset={handleReset}
          loadingAction={loadingAction}
          stressTest={stressTest}
          setStressTest={setStressTest}
        />

        <MeshGraph devices={meshDevices} activeTransfers={activeTransfers} />
      </div>

      <AccountCards accounts={accounts} />

      <div className="bottom-split">
        <GossipChart data={gossipHistory} />
        <ActivityLog logs={logs} onClearLog={() => setLogs([])} />
      </div>

      <TxLedger transactions={transactions} />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
