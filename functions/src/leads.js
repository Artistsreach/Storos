const functions = require('firebase-functions');
const axios = require('axios');

// Shared helpers
const getHunterKey = () => {
  const cfg = functions.config && functions.config();
  const keyFromConfig = cfg?.hunter?.api_key;
  return keyFromConfig || process.env.HUNTER_API_KEY || '';
};

const setCors = (res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
};

// 1) Discover (POST upstream). Accept GET or POST to this function
exports.hunterDiscover = functions.https.onRequest(async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).send('');

  const key = getHunterKey();
  if (!key) return res.status(500).json({ error: 'HUNTER_API_KEY is not configured' });

  try {
    const params = req.method === 'GET' ? req.query || {} : (req.body || {});

    // Normalize: prefer query; otherwise build organization from domain or name/company
    let body = {};
    if (params.query) {
      body = { query: params.query };
    } else if (params.domain) {
      body = { organization: { domain: Array.isArray(params.domain) ? params.domain : [params.domain] } };
    } else if (params.name || params.company) {
      const name = params.name || params.company;
      body = { organization: { name: Array.isArray(name) ? name : [name] } };
    } else {
      // If no meaningful input, forward as-is to let Hunter validate
      body = params;
    }

    const r = await axios.post(`https://api.hunter.io/v2/discover?api_key=${encodeURIComponent(key)}`,
      body,
      { timeout: 20000 }
    );
    return res.status(200).json(r.data);
  } catch (e) {
    const status = e?.response?.status || 500;
    const data = e?.response?.data || e?.message || 'Request failed';
    return res.status(status).json({ error: data });
  }
});

// 2) Domain Search (GET upstream)
exports.hunterDomainSearch = functions.https.onRequest(async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).send('');

  const key = getHunterKey();
  if (!key) return res.status(500).json({ error: 'HUNTER_API_KEY is not configured' });

  try {
    const params = req.query || {};
    const r = await axios.get('https://api.hunter.io/v2/domain-search', {
      params: { ...params, api_key: key },
      timeout: 20000,
    });
    return res.status(200).json(r.data);
  } catch (e) {
    const status = e?.response?.status || 500;
    const data = e?.response?.data || e?.message || 'Request failed';
    return res.status(status).json({ error: data });
  }
});

// 3) Email Finder (GET upstream)
exports.hunterEmailFinder = functions.https.onRequest(async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).send('');

  const key = getHunterKey();
  if (!key) return res.status(500).json({ error: 'HUNTER_API_KEY is not configured' });

  try {
    const params = req.query || {};
    const r = await axios.get('https://api.hunter.io/v2/email-finder', {
      params: { ...params, api_key: key },
      timeout: 20000,
    });
    return res.status(200).json(r.data);
  } catch (e) {
    const status = e?.response?.status || 500;
    const data = e?.response?.data || e?.message || 'Request failed';
    return res.status(status).json({ error: data });
  }
});
