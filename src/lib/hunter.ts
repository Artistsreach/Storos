// Hunter API helper functions
// Reads HUNTER_API_KEY from environment

const HUNTER_BASE = "https://api.hunter.io/v2";

function getApiKey(): string {
  const key = process.env.HUNTER_API_KEY || process.env.NEXT_PUBLIC_HUNTER_API_KEY;
  if (!key) throw new Error("HUNTER_API_KEY is not set. Add it to your environment.");
  return key;
}

type DiscoverBody = {
  // Either 'query' natural language, or filters like 'organization', 'headquarters_location', etc.
  query?: string;
  organization?: {
    domain?: string[];
    name?: string[];
  };
  headquarters_location?: any;
  industry?: any;
  headcount?: string[];
  company_type?: any;
  year_founded?: any;
  keywords?: any;
  technology?: any;
  funding?: any;
  limit?: number;
  offset?: number;
};

export async function hunterDiscover(body: DiscoverBody) {
  const apiKey = getApiKey();
  const res = await fetch(`${HUNTER_BASE}/discover?api_key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

export async function hunterDomainSearch(params: {
  domain?: string;
  company?: string;
  limit?: number;
  offset?: number;
  type?: "personal" | "generic";
  seniority?: string;
  department?: string;
  required_field?: string;
}) {
  const apiKey = getApiKey();
  const url = new URL(`${HUNTER_BASE}/domain-search`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}` !== "") url.searchParams.set(k, String(v));
  });
  url.searchParams.set("api_key", apiKey);
  const res = await fetch(url.toString());
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

export async function hunterEmailFinder(params: {
  domain?: string;
  company?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  max_duration?: number;
}) {
  const apiKey = getApiKey();
  const url = new URL(`${HUNTER_BASE}/email-finder`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}` !== "") url.searchParams.set(k, String(v));
  });
  url.searchParams.set("api_key", apiKey);
  const res = await fetch(url.toString());
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

export async function hunterEmailEnrichment(params: {
  email?: string;
  linkedin_handle?: string;
  clearbit_format?: string | boolean;
}) {
  const apiKey = getApiKey();
  const url = new URL(`${HUNTER_BASE}/people/find`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}` !== "") url.searchParams.set(k, String(v));
  });
  url.searchParams.set("api_key", apiKey);
  const res = await fetch(url.toString());
  // this endpoint may return 404 with errors when not found; surface that gracefully
  const json = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 404) throw new Error(JSON.stringify(json));
  return { status: res.status, body: json };
}
