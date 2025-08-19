import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { functions } from '../../lib/firebaseClient';
import { httpsCallable } from 'firebase/functions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: (currency || 'usd').toUpperCase() }).format((amount || 0) / 100);
  } catch {
    return `${(amount || 0) / 100} ${currency || ''}`.trim();
  }
}

export default function StripeAnalyticsWidget() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const connectedAccount = profile?.stripe_account_id || null;
  const [isLoading, setIsLoading] = useState(false);

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

  const mockData = {
    balance: {
      available: [{ amount: 12345, currency: 'usd' }],
      pending: [{ amount: 6789, currency: 'usd' }],
    },
    transactions: [
      { id: 'txn_1', created: Date.now() / 1000, type: 'charge', status: 'succeeded', amount: 10000, fee: 300, net: 9700, currency: 'usd', source: 'src_1', reporting_category: 'charge', description: 'App Subscription' },
      { id: 'txn_2', created: Date.now() / 1000 - 86400, type: 'charge', status: 'succeeded', amount: 2500, fee: 75, net: 2425, currency: 'usd', source: 'src_2', reporting_category: 'charge', description: 'Store Purchase' },
      { id: 'txn_3', created: Date.now() / 1000 - 172800, type: 'charge', status: 'succeeded', amount: 5000, fee: 150, net: 4850, currency: 'usd', source: 'src_3', reporting_category: 'charge', description: 'NFT Sale' },
    ],
    sources: [
      { name: 'App', icon: '📱', value: 10000 },
      { name: 'Store', icon: '🛍️', value: 2500 },
      { name: 'NFT', icon: '🎨', value: 5000 },
      { name: 'Link', icon: '🔗', value: 0 },
    ],
  };

  const chartData = mockData.sources.map(source => ({ name: source.name, amount: source.value / 100 }));

  const handleOnboard = async () => {
    setIsLoading(true);
    try {
      const createStripeAccount = httpsCallable(functions, 'createStripeAccount');
      const result = await createStripeAccount();
      const data = result.data;

      if (data && data.accountLinkUrl) {
        window.location.href = data.accountLinkUrl;
      } else {
        throw new Error('Failed to retrieve the Stripe onboarding link.');
      }
    } catch (err) {
      console.error("Stripe onboarding error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`text-sm h-full ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
      <div className={`flex items-center justify-between sticky top-0 ${theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/70'} backdrop-blur-sm p-4 z-10`}>
        <div className="font-semibold text-lg">
          Stripe Analytics
          <span className={`ml-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {connectedAccount ? `Connected: ${connectedAccount}` : (
              <button
                onClick={handleOnboard}
                className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Onboard'}
              </button>
            )}
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
            className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="p-4">
      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded hidden">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/70'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Available</div>
          <div className="text-2xl font-bold">
            {loading ? '—' : formatMoney(connectedAccount ? available?.amount : mockData.balance.available[0].amount, connectedAccount ? available?.currency : mockData.balance.available[0].currency)}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/70'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pending</div>
          <div className="text-2xl font-bold">
            {loading ? '—' : formatMoney(connectedAccount ? pending?.amount : mockData.balance.pending[0].amount, connectedAccount ? pending?.currency : mockData.balance.pending[0].currency)}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <div className="font-medium mb-2">Sources</div>
        <div className="grid grid-cols-4 gap-4">
          {mockData.sources.map(source => (
            <div key={source.name} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/70'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} text-center`}>
              <div className="text-2xl">{source.icon}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{source.name}</div>
              <div className="text-lg font-bold">{formatMoney(source.value, 'usd')}</div>
            </div>
          ))}
        </div>
      </div>

      {!connectedAccount && (
        <div className="mt-2">
          <div className="font-medium mb-2">Revenue Breakdown</div>
          <div className={`rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden p-4`}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#444' : '#ccc'} />
                <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#fff' : '#000' }} />
                <YAxis tick={{ fill: theme === 'dark' ? '#fff' : '#000' }} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}` }} />
                <Legend wrapperStyle={{ color: theme === 'dark' ? '#fff' : '#000' }} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="mt-2">
        <div className="font-medium mb-2">Recent balance transactions</div>
        <div className={`rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
          <table className="w-full text-left text-xs">
            <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
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
                  <td className={`p-2 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} colSpan={7}>Loading…</td>
                </tr>
              ) : (connectedAccount ? transactions : mockData.transactions).length === 0 ? (
                <tr>
                  <td className={`p-2 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} colSpan={7}>No transactions</td>
                </tr>
              ) : (
                (connectedAccount ? transactions : mockData.transactions).map(tx => (
                  <>
                    <tr key={tx.id} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className="p-2 align-top">
                        <button
                          className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
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
                      <tr className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td colSpan={7} className="p-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className={`text-[11px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>ID</div>
                              <div className="font-mono break-all">{tx.id}</div>
                            </div>
                            <div>
                              <div className={`text-[11px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Source</div>
                              <div className="font-mono break-all">{tx.source || '—'}</div>
                            </div>
                            <div>
                              <div className={`text-[11px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Reporting category</div>
                              <div>{tx.reporting_category}</div>
                            </div>
                            <div>
                              <div className={`text-[11px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Description</div>
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
    </div>
  );
}
