import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MessageCircle, X } from 'lucide-react';
import { tools } from '../../lib/desktop-tools.js';

// Normalize/extract function calls from various chunk shapes
function extractFunctionCalls(chunk) {
  const out = [];
  if (!chunk) return out;
  // Preferred: chunk.toolCall.functionCalls (Live-like)
  if (chunk.toolCall && Array.isArray(chunk.toolCall.functionCalls)) {
    for (const fc of chunk.toolCall.functionCalls) out.push(fc);
  }
  // Some SDKs: chunk.functionCalls (array)
  if (Array.isArray(chunk.functionCalls)) {
    for (const fc of chunk.functionCalls) out.push(fc);
  }
  // Parts-based: candidates[0].content.parts with part.functionCall
  const parts = chunk?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    for (const p of parts) {
      if (p?.functionCall) out.push(p.functionCall);
    }
  }
  return out;
}

// Simple, text-only chatbot for the MacOS Desktop page
// Anchored bottom-right, toggled by a floating button.
// Uses the same Gemini setup (API key, SDK) as geminiDesktopLive.js, but text-only.

const bubbleBase =
  'fixed bottom-6 right-6 z-[1000] flex items-center justify-center rounded-full shadow-lg';

export default function DesktopTextChatbot() {
  const [open, setOpen] = useState(false);
  const [liveEnabled, setLiveEnabled] = useState(!!window.__geminiLive);
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hi! I'm your desktop assistant. How can I help?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY }), []);

  useEffect(() => {
    if (!open) return;
    // Scroll to bottom when messages update
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [open, messages]);

  // Listen for audio-mode transcriptions and model text to mirror in chat
  useEffect(() => {
    const handler = (e) => {
      const { role, text } = e.detail || {};
      if (!text) return;
      // Avoid duplicating user messages (we already add them on send)
      if (role === 'user') return;
      // Coalesce model streaming chunks into a single growing message
      setMessages((prev) => {
        if (!prev.length) return [{ role: 'model-temp', text }];
        const last = prev[prev.length - 1];
        if (last.role.startsWith('model')) {
          const copy = prev.slice(0, -1);
          const merged = (last.text ? last.text + (last.text.endsWith('\n') ? '' : ' ') : '') + text;
          return [...copy, { role: last.role, text: merged }];
        }
        return [...prev, { role: 'model-temp', text }];
      });
    };
    window.addEventListener('gemini-live-text', handler);
    return () => window.removeEventListener('gemini-live-text', handler);
  }, []);

  // Listen for live enable/disable toggle
  useEffect(() => {
    const statusHandler = (e) => {
      const enabled = !!(e?.detail?.enabled);
      setLiveEnabled(enabled);
      if (!enabled) setOpen(false);
    };
    window.addEventListener('gemini-live-status', statusHandler);
    // initialize from current handle if present
    setLiveEnabled(!!window.__geminiLive);
    return () => window.removeEventListener('gemini-live-status', statusHandler);
  }, []);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    if (!window.__geminiLive || !window.__geminiLive.session) {
      setMessages(prev => [...prev, { role: 'model', text: 'Live mode is not active. Click the red button in the status bar to enable it.' }]);
      return;
    }
    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      // Send text into the Live session; responses and tool calls are handled by GeminiDesktopLive onmessage
      await window.__geminiLive.session.sendClientContent({
        turns: { role: 'user', parts: [{ text: trimmed }] },
        turnComplete: true,
      });
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'model', text: `Sorry, I ran into an error: ${err?.message || err}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button (visible only when Live is enabled) */}
      {liveEnabled && (
        <button
          aria-label="Open Desktop Chatbot"
          className={`${bubbleBase} h-14 w-14 bg-blue-600 text-white hover:bg-blue-700 transition`}
          onClick={() => setOpen(true)}
        >
          <MessageCircle size={22} />
        </button>
      )}

      {/* Panel */}
      {open && liveEnabled && (
        <div className="fixed bottom-24 right-6 z-[1001] w-[360px] max-h-[70vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-800">
            <div className="text-sm font-medium">Desktop Assistant</div>
            <button className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role.startsWith('model') ? 'text-sm text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap leading-relaxed' : 'text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap leading-relaxed'}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="text-xs text-neutral-500">Thinking…</div>}
          </div>

          <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                placeholder="Ask anything…"
                className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function buildContents(history, latestInput) {
  // Convert internal message format to Gemini Content[]
  // Each item is { role: 'user'|'model', parts: [{ text }] }
  const items = [];
  for (const m of history) {
    if (!m?.text) continue;
    const role = m.role === 'user' ? 'user' : 'model';
    items.push({ role, parts: [{ text: m.text }] });
  }
  if (latestInput) {
    items.push({ role: 'user', parts: [{ text: latestInput }] });
  }
  return items;
}
