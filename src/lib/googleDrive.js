// Google Drive/Docs integration helpers (browser-only)
// Uses Google Identity Services (GIS) for OAuth and direct REST fetch calls to Drive API.
// Env vars required:
// - VITE_GOOGLE_CLIENT_ID (OAuth client ID for Web)
//
const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
];

let gisLoaded = false;
let tokenClient = null;
let accessToken = null;
let tokenExpiryTs = 0; // epoch ms

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => { script.dataset.loaded = 'true'; resolve(); };
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

async function ensureGISLoaded() {
  if (gisLoaded) return;
  await loadScript('https://accounts.google.com/gsi/client');
  gisLoaded = true;
}

function initTokenClient(scopes = DEFAULT_SCOPES) {
  if (tokenClient) return tokenClient;
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('Missing VITE_GOOGLE_CLIENT_ID');
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: scopes.join(' '),
    callback: () => {},
  });
  return tokenClient;
}

async function obtainAccessToken({ prompt = 'consent' } = {}) {
  await ensureGISLoaded();
  initTokenClient();
  return new Promise((resolve, reject) => {
    tokenClient.callback = (resp) => {
      if (resp?.error) return reject(resp);
      accessToken = resp.access_token;
      const now = Date.now();
      tokenExpiryTs = now + ((resp.expires_in || 3600) - 60) * 1000; // 60s buffer
      resolve(accessToken);
    };
    tokenClient.requestAccessToken({ prompt });
  });
}

async function getValidAccessToken({ interactive = true } = {}) {
  if (accessToken && Date.now() < tokenExpiryTs) return accessToken;
  try {
    // Try silent refresh if we had a token before
    if (accessToken) {
      return await obtainAccessToken({ prompt: 'none' });
    }
  } catch (_) {
    // fall through to interactive
  }
  if (interactive) {
    return obtainAccessToken({ prompt: 'consent' });
  }
  throw new Error('Not authorized');
}

export async function ensureAuthorized(options = {}) {
  await getValidAccessToken(options);
}

export async function signOut() {
  if (accessToken) {
    try { window.google.accounts.oauth2.revoke(accessToken); } catch (_) {}
  }
  accessToken = null;
  tokenExpiryTs = 0;
}

async function fetchWithRetry(url, options = {}, retries = 1) {
  const res = await fetch(url, options);
  if (!res.ok && res.status >= 500 && retries > 0) {
    return fetchWithRetry(url, options, retries - 1);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res;
}

export async function listFiles({ pageSize = 20, query = '', fields = 'files(id,name,mimeType,modifiedTime)' } = {}) {
  const token = await getValidAccessToken();
  const params = new URLSearchParams();
  if (pageSize) params.set('pageSize', String(pageSize));
  if (query) params.set('q', query);
  if (fields) params.set('fields', fields);
  const url = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
  const res = await fetchWithRetry(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.files || [];
}

// Paginated listing helper used by DriveFileBrowser
export async function listFilesPaged({ pageSize = 25, query = '', pageToken = '', orderBy = 'modifiedTime desc', fields = 'nextPageToken, files(id,name,mimeType,modifiedTime)' } = {}) {
  const token = await getValidAccessToken();
  const params = new URLSearchParams();
  if (pageSize) params.set('pageSize', String(pageSize));
  if (query) params.set('q', query);
  if (orderBy) params.set('orderBy', orderBy);
  if (pageToken) params.set('pageToken', pageToken);
  if (fields) params.set('fields', fields);
  const url = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
  const res = await fetchWithRetry(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  return { files: data.files || [], nextPageToken: data.nextPageToken || null };
}

// Upload a note as a Google Doc (converts from text/plain)
export async function uploadNoteAsDoc(title, content) {
  const token = await getValidAccessToken();
  const metadata = {
    name: title || 'Untitled Note',
    mimeType: 'application/vnd.google-apps.document',
  };
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;
  const multipartBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    (content || '') +
    closeDelim;

  const res = await fetchWithRetry('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });
  return res.json();
}

// Download/export file content.
// For Google Docs, export to plain text; for others, fetch media.
export async function downloadFileContent(fileId, mimeType) {
  const token = await getValidAccessToken();
  const isGoogleDoc = mimeType === 'application/vnd.google-apps.document';
  const url = isGoogleDoc
    ? `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export?mimeType=text/plain`
    : `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`;
  const res = await fetchWithRetry(url, { headers: { Authorization: `Bearer ${token}` } });
  return res.text();
}

// Explicitly trigger the OAuth consent popup.
export async function signInWithGoogle() {
  return obtainAccessToken({ prompt: 'consent' });
}
