import React, { useMemo, useState } from 'react';

const OPTIONS = [
  { value: 'discover', label: 'Discover' },
  { value: 'domain-search', label: 'Domain Search' },
  { value: 'email-finder', label: 'Email Finder' },
];

export default function LeadsPage() {
  const [type, setType] = useState('domain-search');
  const [params, setParams] = useState({ domain: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const requiredFields = useMemo(() => {
    switch (type) {
      case 'domain-search':
        return ['domain'];
      case 'email-finder':
        return ['domain', 'first_name', 'last_name'];
      case 'discover':
      default:
        return ['query'];
    }
  }, [type]);

  const onChangeField = (k, v) => setParams(p => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Route to specific endpoints
      let path = '/api/hunter/discover';
      if (type === 'domain-search') path = '/api/hunter/domain-search';
      if (type === 'email-finder') path = '/api/hunter/email-finder';

      const query = new URLSearchParams({ ...params });
      const res = await fetch(path + '?' + query.toString());
      const text = await res.text();
      if (!res.ok) throw new Error(text || 'Failed to fetch');
      const data = JSON.parse(text);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch {}
  };

  const EmailListTable = ({ emails = [] }) => (
    <div className="overflow-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Position</th>
            <th className="text-left p-2">Department</th>
            <th className="text-left p-2">LinkedIn</th>
            <th className="text-left p-2">Confidence</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {emails.slice(0, 50).map((e, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2 font-mono">{e.value || e.email}</td>
              <td className="p-2">{[e.first_name, e.last_name].filter(Boolean).join(' ')}</td>
              <td className="p-2">{e.position || e.job_title}</td>
              <td className="p-2">{e.department}</td>
              <td className="p-2">
                {e.linkedin_url ? (
                  <a href={e.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Profile</a>
                ) : '-'}
              </td>
              <td className="p-2">{e.confidence != null ? e.confidence : (e.score != null ? e.score : '-')}</td>
              <td className="p-2">
                {(e.value || e.email) && (
                  <button onClick={() => copyToClipboard(e.value || e.email)} className="px-2 py-1 text-xs bg-gray-200 rounded">Copy</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const EmailFinderCard = ({ data }) => {
    const email = data?.email || data?.value;
    const score = data?.score ?? data?.confidence;
    const pattern = data?.pattern;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold font-mono">{email || 'No email found'}</div>
          {email && <button onClick={() => copyToClipboard(email)} className="px-2 py-1 text-xs bg-gray-200 rounded">Copy</button>}
        </div>
        <div className="text-sm text-gray-600">
          {score != null && <span className="mr-3">Confidence: {score}</span>}
          {pattern && <span>Pattern: {pattern}</span>}
        </div>
      </div>
    );
  };

  const DiscoverSummary = ({ payload }) => {
    const raw = payload?.data ?? payload; // payload.data may be an array
    const organizations = Array.isArray(raw)
      ? raw
      : (raw?.organizations || raw?.results || []);
    const meta = payload?.meta;

    if (!organizations?.length) {
      return <pre className="whitespace-pre-wrap text-sm overflow-auto">{JSON.stringify(payload, null, 2)}</pre>;
    }

    return (
      <>
        {meta && (
          <div className="text-sm text-gray-600 mb-2">
            <span className="mr-2">Total: {meta.results?.toLocaleString?.() ?? meta.results}</span>
            {meta.limit != null && <span className="mr-2">Limit: {meta.limit}</span>}
            {meta.offset != null && <span>Offset: {meta.offset}</span>}
            {meta?.params?.query && (
              <div className="mt-1">Query: <span className="font-medium">{meta.params.query}</span></div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {organizations.slice(0, 24).map((org, i) => {
            const name = org.organization || org.name || org.company || 'Organization';
            const location = [org.city, org.state, org.country].filter(Boolean).join(', ');
            const counts = org.emails_count || {};
            return (
              <div key={i} className="border rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold truncate" title={name}>{name}</div>
                  {org.domain && (
                    <a className="text-blue-600 underline truncate" href={`https://${org.domain}`} target="_blank" rel="noreferrer">{org.domain}</a>
                  )}
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  {org.industry && <div>Industry: {org.industry}</div>}
                  {location && <div>Location: {location}</div>}
                  {(org.size || org.headcount) && <div>Size: {org.headcount || org.size}</div>}
                  {org.company_type && <div>Type: {org.company_type}</div>}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {counts.total != null && (
                    <span className="px-2 py-1 text-xs bg-gray-100 rounded border">Total: {counts.total}</span>
                  )}
                  {counts.personal != null && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded border">Personal: {counts.personal}</span>
                  )}
                  {counts.generic != null && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded border">Generic: {counts.generic}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-4">
          <img
            src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Untitled%20design.png"
            alt="Leads logo"
            className="w-8 h-8 rounded-md object-cover"
            loading="lazy"
          />
          <h1 className="text-2xl font-bold">Leads</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 mb-6">
          <div className="flex gap-3 items-center">
            <label className="text-sm w-40">API</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setParams({}); }}
              className="border rounded px-3 py-2"
            >
              {OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {requiredFields.map((f) => (
            <div key={f} className="flex gap-3 items-center">
              <label className="text-sm w-40 capitalize">{f.replace('_', ' ')}</label>
              <input
                type="text"
                value={params[f] || ''}
                onChange={(e) => onChangeField(f, e.target.value)}
                className="flex-1 border rounded px-3 py-2"
                placeholder={
                  f === 'domain' ? 'example.com' :
                  f === 'email' ? 'user@example.com' :
                  f === 'first_name' ? 'John' :
                  f === 'last_name' ? 'Doe' :
                  f === 'query' ? 'e.g. Fintech startups in Europe' : f
                }
              />
            </div>
          ))}

          <div>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white rounded disabled:opacity-50">
              {loading ? 'Requesting…' : 'Send'}
            </button>
          </div>
        </form>

        {error && <div className="p-3 bg-red-100 text-red-800 rounded mb-4">{error}</div>}

        {result && (
          <div className="border rounded p-4 bg-white space-y-4">
            {type === 'domain-search' && (
              <>
                <h2 className="text-lg font-semibold">Emails at {params.domain}</h2>
                <EmailListTable emails={(result?.data && result?.data.emails) || result?.emails || []} />
              </>
            )}
            {type === 'email-finder' && (
              <>
                <h2 className="text-lg font-semibold">Found Email</h2>
                <EmailFinderCard data={result?.data || result} />
              </>
            )}
            {type === 'discover' && (
              <>
                <h2 className="text-lg font-semibold">Discover Results</h2>
                <DiscoverSummary payload={result} />
              </>
            )}

            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-gray-600">Raw JSON</summary>
              <pre className="whitespace-pre-wrap text-xs overflow-auto mt-2">{JSON.stringify(result, null, 2)}</pre>
            </details>
          </div>
        )}

        {!loading && !result && !error && (
          <p className="text-sm text-gray-500">Choose API, fill required fields, then Send.</p>
        )}
      </div>
    </div>
  );
}
