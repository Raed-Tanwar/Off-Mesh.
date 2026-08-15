/**
 * API client layer for UPI Offline Mesh backend.
 */

const handleResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text();
    let errorMsg = `Server error ${res.status}`;
    try {
      const errObj = JSON.parse(text);
      if (errObj.message) errorMsg = errObj.message;
      else if (errObj.error) errorMsg = errObj.error;
    } catch {
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }
  return res.json();
};

export const getServerKey = async () => {
  const res = await fetch('/api/server-key');
  return handleResponse(res);
};

export const getAccounts = async () => {
  const res = await fetch('/api/accounts');
  return handleResponse(res);
};

export const getTransactions = async () => {
  const res = await fetch('/api/transactions');
  return handleResponse(res);
};

export const getMeshState = async () => {
  const res = await fetch('/api/mesh/state');
  return handleResponse(res);
};

export const sendPacket = async ({ senderVpa, receiverVpa, amount, pin, ttl = 5, startDevice = 'phone-alice' }) => {
  const res = await fetch('/api/demo/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderVpa,
      receiverVpa,
      amount,
      pin,
      ttl,
      startDevice
    })
  });
  return handleResponse(res);
};

export const runGossip = async () => {
  const res = await fetch('/api/mesh/gossip', {
    method: 'POST'
  });
  return handleResponse(res);
};

export const flushBridges = async () => {
  const res = await fetch('/api/mesh/flush', {
    method: 'POST'
  });
  return handleResponse(res);
};

export const resetMesh = async () => {
  const res = await fetch('/api/mesh/reset', {
    method: 'POST'
  });
  return handleResponse(res);
};
