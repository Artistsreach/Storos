import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest) {
  try {
    const cwd = path.join(process.cwd(), 'youtube-quickstart');
    const quickstartPath = path.join(cwd, 'quickstart.js');
    const clientSecretPath = path.join(cwd, 'client_secret.json');

    if (!fs.existsSync(quickstartPath)) {
      return new Response('quickstart.js not found. Expected at youtube-quickstart/quickstart.js', { status: 404 });
    }

    if (!fs.existsSync(clientSecretPath)) {
      return new Response('Missing client_secret.json in youtube-quickstart/. Follow README to download and place it.', { status: 400 });
    }

    const proc = spawn(process.platform === 'win32' ? 'node.exe' : 'node', ['quickstart.js'], { cwd });

    let out = '';
    let err = '';

    proc.stdout.on('data', (d) => (out += d.toString()));
    proc.stderr.on('data', (d) => (err += d.toString()));

    const result: string = await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        try { proc.kill(); } catch {}
        resolve((out + '\n' + err + '\n[Timed out after 25s]').trim());
      }, 25000);
      proc.on('close', (_code) => {
        clearTimeout(timeout);
        resolve((out + (err ? '\n' + err : '')).trim());
      });
    });

    return new Response(result || 'Done.', { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  } catch (e: any) {
    return new Response(`Error: ${e?.message || String(e)}`.trim(), { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
}
