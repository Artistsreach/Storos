import React, { useEffect, useState, useCallback } from 'react';
import { functions } from '../../lib/firebaseClient';
import { httpsCallable } from 'firebase/functions';

export default function BankWindow({ isOpen, onClose, onMinimize, onMaximize, isMaximized, zIndex, position, onClick, onDragEnd, windowId }) {
  const [linkReady, setLinkReady] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Inject Plaid Link script lazily
  useEffect(() => {
    if (window.Plaid) { setLinkReady(true); return; }
    const src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      // If script exists but Plaid not ready yet, wait for load
      existing.addEventListener('load', () => setLinkReady(true));
      existing.addEventListener('error', () => setError('Failed to load Plaid Link'));
      return;
    }
    if (window.__plaidScriptLoading) {
      // Another component is loading it; poll until available
      const id = window.setInterval(() => {
        if (window.Plaid) {
          window.clearInterval(id);
          setLinkReady(true);
        }
      }, 50);
      return () => window.clearInterval(id);
    }
    window.__plaidScriptLoading = true;
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => { setLinkReady(true); window.__plaidScriptLoading = false; };
    script.onerror = () => { setError('Failed to load Plaid Link'); window.__plaidScriptLoading = false; };
    document.body.appendChild(script);
    return () => {
      // keep script for reuse
    };
  }, []);

  const isoDate = (d) => d.toISOString().slice(0, 10);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      const getTx = httpsCallable(functions, 'getPlaidTransactions');
      const res = await getTx({ start_date: isoDate(start), end_date: isoDate(end) });
      const data = res.data;
      setTransactions(data?.transactions || []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const beginPlaidLink = useCallback(async () => {
    if (!window.Plaid) return;
    setError(null);
    setLoading(true);
    try {
      const createLinkToken = httpsCallable(functions, 'createPlaidLinkToken');
      const res = await createLinkToken({ products: ['transactions'], country_codes: ['US'] });
      const link_token = res?.data?.link_token;
      if (!link_token) throw new Error('No link_token received');

      const handler = window.Plaid.create({
        token: link_token,
        onSuccess: async (public_token) => {
          try {
            const exchange = httpsCallable(functions, 'exchangePlaidPublicToken');
            await exchange({ public_token });
            setLinkOpen(false);
            await fetchTransactions();
          } catch (ex) {
            console.error(ex);
            setError(ex.message || 'Failed to exchange public token');
          }
        },
        onExit: (err) => {
          if (err) setError(err.display_message || err.error_message || 'Exited Plaid Link');
          setLinkOpen(false);
        },
      });

      handler.open();
      setLinkOpen(true);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to start Plaid Link');
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  useEffect(() => {
    if (isOpen && linkReady && !linkOpen) {
      // Auto open on first mount
      beginPlaidLink();
    }
  }, [isOpen, linkReady, linkOpen, beginPlaidLink]);

  if (!isOpen) return null;

  return (
    <div
      className={`ff-window absolute bg-gray-100/50 backdrop-blur-xl rounded-lg shadow-2xl flex flex-col overflow-visible border border-gray-300/20 ${isMaximized ? 'w-full h-full top-0 left-0 rounded-none' : ''}`}
      style={{ zIndex, width: isMaximized ? '100%' : 800, height: isMaximized ? '100%' : 520, top: isMaximized ? 0 : position?.top, left: isMaximized ? 0 : position?.left }}
      data-window-id={windowId}
      onClick={onClick}
    >
      <div className="relative flex items-center justify-between p-2 bg-gray-200/80 rounded-t-lg border-b border-gray-300/40">
        <div className="flex space-x-2">
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500" />
          <button onClick={onMinimize} className="w-3 h-3 rounded-full bg-yellow-500" />
          <button onClick={onMaximize} className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="drag-handle font-semibold text-sm text-black select-none">Bank</div>
        <div />
      </div>

      <div className="p-4 flex flex-col gap-3 overflow-auto">
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50" disabled={!linkReady || loading} onClick={beginPlaidLink}>
            {loading ? 'Loading…' : 'Connect bank'}
          </button>
          <button className="px-3 py-1 rounded bg-gray-700 text-white" onClick={fetchTransactions}>Refresh transactions</button>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="mt-2">
          <h3 className="font-semibold mb-2">Recent transactions</h3>
          {transactions.length === 0 ? (
            <div className="text-sm text-gray-700">No transactions loaded yet.</div>
          ) : (
            <ul className="divide-y divide-gray-200 bg-white/60 rounded">
              {transactions.map((t) => (
                <li key={t.transaction_id} className="p-2 flex items-center justify-between">
                  <div className="text-sm text-gray-900">{t.name}</div>
                  <div className="text-sm tabular-nums {t.amount < 0 ? 'text-green-700' : 'text-red-700'}">${'{'}t.amount.toFixed(2){'}'}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
