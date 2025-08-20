"use client";

import React, { useState } from "react";

export default function LeadsPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setResults(null);
    if (!query.trim()) {
      setError("Enter a query, email, domain, or name + domain.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(json.errors || json));
      setResults(json.data);
    } catch (err: any) {
      setError(err?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Leads</h1>
      <p className="text-sm text-gray-600 mb-4">
        Single search across Hunter: Discover, Domain Search, Email Finder, and Enrichment.
      </p>
      <form onSubmit={runSearch} className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try: hunter.io | alexis@reddit.com | Alexis Ohanian reddit.com | Companies in Europe in the Tech Industry"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {error && (
        <div className="text-red-600 text-sm mb-4 break-words">{error}</div>
      )}

      {results && (
        <div className="space-y-4">
          {results.map((block: any, idx: number) => (
            <ResultBlock key={idx} data={block} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultBlock({ data }: { data: any }) {
  if (data?.error) {
    return (
      <div className="border rounded p-3 bg-red-50">
        <div className="font-medium text-red-700">Error</div>
        <pre className="text-xs whitespace-pre-wrap break-words">{data.reason}</pre>
      </div>
    );
  }

  // Normalize a few known shapes
  const label = inferLabel(data);

  return (
    <div className="border rounded p-3">
      <div className="font-medium mb-2">{label}</div>
      <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function inferLabel(v: any) {
  if (!v) return "Result";
  // hunterDiscover returns { data: [...], meta: {...} }
  if (Array.isArray(v?.data)) return "Discover";
  if (v?.data?.domain && Array.isArray(v?.data?.emails)) return "Domain Search";
  if (v?.data?.email && v?.data?.score !== undefined) return "Email Finder";
  if (v?.status === 200 || v?.status === 404) return "Enrichment";
  return "Result";
}
