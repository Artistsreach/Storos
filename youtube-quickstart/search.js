/*
 YouTube Data API v3: Search helper using existing OAuth token.
 Usage: node search.js "query" [maxResults]
 Prints JSON array of items (search results) to stdout, or an error message to stderr with non-zero exit.
*/

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;
const HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const TOKEN_DIRS = [
  path.join(HOME, '.credentials'),
  path.join(__dirname, '.credentials'), // fallback in repo
];
const TOKEN_FILENAME = 'youtube-nodejs-quickstart.json';

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];

const q = process.argv[2] || '';
const maxResults = parseInt(process.argv[3] || '12', 10);

if (!q) {
  console.error('Missing query. Usage: node search.js "query" [maxResults]');
  process.exit(2);
}

function readClientSecret() {
  const p = path.join(__dirname, 'client_secret.json');
  if (!fs.existsSync(p)) throw new Error('client_secret.json not found in youtube-quickstart/');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function readToken() {
  for (const dir of TOKEN_DIRS) {
    try {
      const p = path.join(dir, TOKEN_FILENAME);
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    } catch {}
  }
  throw new Error('OAuth token not found. Run `node quickstart.js` once to authorize.');
}

async function main() {
  const credentials = readClientSecret();
  const token = readToken();

  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
  oauth2Client.credentials = token;

  const yt = google.youtube({ version: 'v3', auth: oauth2Client });
  const resp = await yt.search.list({
    part: ['snippet'],
    q,
    maxResults,
    type: ['video'],
  });
  const items = resp.data.items || [];
  process.stdout.write(JSON.stringify(items));
}

main().catch((e) => {
  process.stderr.write((e && e.message) ? e.message : String(e));
  process.exit(1);
});
