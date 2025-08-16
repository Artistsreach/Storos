import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import https from 'https';

export const runtime = 'nodejs';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { q, maxResults = 12, mode = 'public' } = await req.json();
    if (!q || typeof q !== 'string') {
      return new Response('Missing "q" in body', { status: 400, headers: { 'content-type': 'text/plain', ...corsHeaders } });
    }

    // Public mode: use server-side API key (no OAuth)
    if (mode === 'public') {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        return new Response('Server missing YOUTUBE_API_KEY. Add it to your Next .env and restart.', { status: 400, headers: { 'content-type': 'text/plain', ...corsHeaders } });
      }
      const params = new URLSearchParams({
        key: apiKey,
        part: 'snippet',
        type: 'video',
        maxResults: String(maxResults),
        q,
      });
      const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
      const data = await new Promise<string>((resolve, reject) => {
        https
          .get(url, (res) => {
            let body = '';
            res.on('data', (c) => (body += c.toString()));
            res.on('end', () => {
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) return resolve(body);
              reject(new Error(`YouTube API error ${res.statusCode}: ${body}`));
            });
          })
          .on('error', reject);
      });
      try {
        const parsed = JSON.parse(data);
        const items = Array.isArray(parsed?.items) ? parsed.items : [];
        return new Response(JSON.stringify(items), { status: 200, headers: { 'content-type': 'application/json', ...corsHeaders } });
      } catch (e: any) {
        return new Response(e?.message || 'Failed to parse YouTube response', { status: 500, headers: { 'content-type': 'text/plain', ...corsHeaders } });
      }
    }

    // OAuth mode (legacy): reuse quickstart token
    const cwd = path.join(process.cwd(), 'youtube-quickstart');
    const script = path.join(cwd, 'search.js');
    const clientSecretPath = path.join(cwd, 'client_secret.json');

    if (!fs.existsSync(script)) {
      return new Response('search.js not found. Expected at youtube-quickstart/search.js', { status: 404, headers: corsHeaders });
    }
    if (!fs.existsSync(clientSecretPath)) {
      return new Response('Missing client_secret.json in youtube-quickstart/. Run the OAuth quickstart first.', { status: 400, headers: corsHeaders });
    }

    const args = ['search.js', q, String(maxResults)];
    const proc = spawn(process.platform === 'win32' ? 'node.exe' : 'node', args, { cwd });

    let out = '';
    let err = '';

    proc.stdout.on('data', (d) => (out += d.toString()));
    proc.stderr.on('data', (d) => (err += d.toString()));

    const { code, resultOut, resultErr } = await new Promise<{ code: number, resultOut: string, resultErr: string }>((resolve) => {
      proc.on('close', (code) => resolve({ code: code ?? 0, resultOut: out, resultErr: err }));
    });

    if (code !== 0) {
      const message = resultErr || 'YouTube search failed. If this is your first run, authorize via node quickstart.js';
      return new Response(message, { status: 500, headers: { 'content-type': 'text/plain', ...corsHeaders } });
    }

    return new Response(resultOut || '[]', { status: 200, headers: { 'content-type': 'application/json', ...corsHeaders } });
  } catch (e: any) {
    return new Response(e?.message || 'Server error', { status: 500, headers: { 'content-type': 'text/plain', ...corsHeaders } });
  }
}
