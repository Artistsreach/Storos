import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: (currency || 'usd').toUpperCase() }).format((amount || 0) / 100);
  } catch {
    return `${(amount || 0) / 100} ${currency || ''}`.trim();
  }
}

export default function StripeAnalyticsWidget() {
  const { profile } = useAuth();
  const connectedAccount = profile?.stripe_account_id || null;

  const accountParam = useMemo(() => {
    return connectedAccount || undefined; // default to connected when present
  }, [connectedAccount]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshMs, setRefreshMs] = useState(30000);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = accountParam ? `?account=${encodeURIComponent(accountParam)}` : '';
      const [balRes, txRes] = await Promise.all([
        fetch(`/api/stripe/balance${qs}`),
        fetch(`/api/stripe/balance-transactions${qs}`),
      ]);

      if (!balRes.ok) {
        const txt = await balRes.text().catch(() => '');
        throw new Error(`Balance request failed: ${balRes.status} ${txt?.slice(0, 200)}`);
      }
      if (!txRes.ok) {
        const txt = await txRes.text().catch(() => '');
        throw new Error(`Transactions request failed: ${txRes.status} ${txt?.slice(0, 200)}`);
      }

      const balCt = balRes.headers.get('content-type') || '';
      const txCt = txRes.headers.get('content-type') || '';
      if (!balCt.includes('application/json') || !txCt.includes('application/json')) {
        const btxt = await balRes.text().catch(() => '');
        const ttxt = await txRes.text().catch(() => '');
        throw new Error(`Unexpected response format. Balance CT: ${balCt}. Tx CT: ${txCt}. Snippets: ${btxt.slice(0,80)} | ${ttxt.slice(0,80)}`);
      }

      const balJson = await balRes.json();
      const txJson = await txRes.json();
      if (txJson?.error) {
        throw new Error(txJson?.error || 'Failed to load transactions');
      }
      setBalance(balJson.balance);
      setTransactions(txJson.transactions || []);
    } catch (e) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountParam]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(load, Math.max(5000, refreshMs || 30000));
    return () => clearInterval(id);
  }, [autoRefresh, refreshMs, accountParam]);

  const available = useMemo(() => balance?.available?.[0], [balance]);
  const pending = useMemo(() => balance?.pending?.[0], [balance]);

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-lg">
          Stripe Analytics
          <span className="ml-2 text-xs text-gray-500">
            {connectedAccount ? `Connected: ${connectedAccount}` : 'Platform'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 ml-2" htmlFor="auto-refresh">
            <input
              id="auto-refresh"
              name="auto-refresh"
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span className="text-xs">Auto refresh</span>
          </label>
          <select
            id="refresh-interval"
            name="refresh-interval"
            className="text-xs border rounded px-1 py-0.5"
            value={refreshMs}
            onChange={(e) => setRefreshMs(parseInt(e.target.value, 10))}
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>60s</option>
          </select>
          <button
            onClick={load}
            className="px-2 py-1 text-xs rounded bg-gray-800 text-white hover:bg-gray-700"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/70 border border-gray-200">
          <div className="text-xs text-gray-500">Available</div>
          <div className="text-2xl font-bold">
            {loading ? '—' : formatMoney(available?.amount || 0, available?.currency || 'usd')}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-white/70 border border-gray-200">
          <div className="text-xs text-gray-500">Pending</div>
          <div className="text-2xl font-bold">
            {loading ? '—' : formatMoney(pending?.amount || 0, pending?.currency || 'usd')}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <div className="font-medium mb-2">Recent balance transactions</div>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 w-8">{''}</th>
                <th className="p-2">Created</th>
                <th className="p-2">Type</th>
                <th className="p-2">Status</th>
                <th className="p-2 text-right">Gross</th>
                <th className="p-2 text-right">Fee</th>
                <th className="p-2 text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-2 text-center text-gray-500" colSpan={7}>Loading…</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td className="p-2 text-center text-gray-500" colSpan={7}>No transactions</td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <>
                    <tr key={tx.id} className="border-t border-gray-100">
                      <td className="p-2 align-top">
                        <button
                          className="text-gray-600 hover:text-black"
                          onClick={() => setExpanded(prev => ({ ...prev, [tx.id]: !prev[tx.id] }))}
                          aria-label="Toggle details"
                        >
                          {expanded[tx.id] ? '−' : '+'}
                        </button>
                      </td>
                      <td className="p-2">{new Date((tx.created || 0) * 1000).toLocaleString()}</td>
                      <td className="p-2">{tx.type}</td>
                      <td className="p-2">{tx.status}</td>
                      <td className="p-2 text-right">{formatMoney(tx.amount, tx.currency)}</td>
                      <td className="p-2 text-right">{formatMoney(tx.fee, tx.currency)}</td>
                      <td className="p-2 text-right">{formatMoney(tx.net, tx.currency)}</td>
                    </tr>
                    {expanded[tx.id] && (
                      <tr className="bg-gray-50 border-t border-gray-100">
                        <td colSpan={7} className="p-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-[11px] text-gray-500">ID</div>
                              <div className="font-mono break-all">{tx.id}</div>
                            </div>
                            <div>
                              <div className="text-[11px] text-gray-500">Source</div>
                              <div className="font-mono break-all">{tx.source || '—'}</div>
                            </div>
                            <div>
                              <div className="text-[11px] text-gray-500">Reporting category</div>
                              <div>{tx.reporting_category}</div>
                            </div>
                            <div>
                              <div className="text-[11px] text-gray-500">Description</div>
                              <div>{tx.description || '—'}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
