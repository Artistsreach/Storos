import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Square } from 'lucide-react';
import { GeminiDesktopLive } from '@/lib/geminiDesktopLive.js';
import { Button } from '@/components/ui/button';
import HomeAssistantChat from '@/components/home/HomeAssistantChat';

// A lightweight home-page assistant that uses GeminiDesktopLive and preserves
// store chatbot state elsewhere. It exposes a floating MessageCircle button to
// start/stop a live session and shows a compact transcript/activity panel.

interface ActivityItem {
  id: string;
  type: 'tool' | 'transcript' | 'status' | 'error';
  text: string;
}

function HomeAssistantLive(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const liveRef = useRef<GeminiDesktopLive | null>(null);

  const apiKey = useMemo(() => import.meta.env.VITE_GEMINI_API_KEY as string, []);

  const append = useCallback((item: ActivityItem) => {
    setActivity(prev => [...prev, item]);
  }, []);

  const onMessage = useCallback((message: any) => {
    // Surface output transcription text if present
    try {
      const parts = message?.serverContent?.modelTurn?.parts || [];
      const textPart = parts.find((p: any) => typeof p?.text === 'string');
      const transcript = textPart?.text?.trim();
      if (transcript) {
        append({ id: crypto.randomUUID(), type: 'transcript', text: transcript });
      }
      if (message?.toolCall) {
        const calls = message.toolCall.functionCalls || [];
        calls.forEach((fc: any) => {
          append({ id: crypto.randomUUID(), type: 'tool', text: `Tool: ${fc.name}` });
        });
      }
    } catch (_) {
      // no-op
    }
  }, [append]);

  const onError = useCallback((err: any) => {
    append({ id: crypto.randomUUID(), type: 'error', text: `${err?.message || err}` });
  }, [append]);

  const onOpen = useCallback(() => {
    append({ id: crypto.randomUUID(), type: 'status', text: 'Session connected' });
  }, [append]);

  const onClose = useCallback(() => {
    append({ id: crypto.randomUUID(), type: 'status', text: 'Session closed' });
  }, [append]);

  const stop = useCallback(() => {
    if (liveRef.current) {
      liveRef.current.stopRecording();
    }
    setRecording(false);
  }, []);

  const start = useCallback(async () => {
    if (!apiKey) {
      onError(new Error('VITE_GEMINI_API_KEY is not set'));
      return;
    }
    // Initialize once; if exists, reset session to apply config cleanly
    if (!liveRef.current) {
      liveRef.current = new GeminiDesktopLive(apiKey, onMessage, onError, onOpen, onClose, {
        // Home assistant is a general desktop helper. Not limited to store/e-commerce tasks.
        systemInstruction: `
You are the FreshFront Home Assistant running on the landing page. You are a general-purpose desktop assistant.
Capabilities:
- Answer general questions and help with onboarding.
- Use available desktop tools (theme toggle, research, notepad, calculator, buildApp, createStore, etc.) when appropriate.
- Do NOT assume the user is shopping. Avoid store/cart actions unless explicitly relevant.
Behavior:
- Be helpful, concise, and proactive in offering useful actions.
- Strongly prefer calling the most relevant desktop tool when the user's intent matches a declared tool, e.g., if the user asks to build an app, call buildApp with a clear description.
- If a request is outside your tools, still try to help with guidance rather than refusing.
        `.trim(),
      });
      await liveRef.current.init();
    } else {
      try { await liveRef.current.reset(); } catch {}
    }
    await liveRef.current.startRecording();
    setRecording(true);
  }, [apiKey, onClose, onError, onMessage, onOpen]);

  const toggle = useCallback(async () => {
    if (recording) {
      // Stop recording but keep panel open
      stop();
      return;
    }
    if (open) {
      // Close panel when idle
      setOpen(false);
      return;
    }
    // Open panel and start session
    setOpen(true);
    await start();
  }, [open, recording, start, stop]);

  // Minimal desktop tool bridge for the home page context
  useEffect(() => {
    const handleToolCall = (event: any) => {
      const { name } = event.detail || {};
      // Bridge a subset; others are ignored in home view
      if (name === 'toggleTheme') {
        window.dispatchEvent(new CustomEvent('toggle-theme'));
        append({ id: crypto.randomUUID(), type: 'tool', text: 'Theme toggled' });
      } else {
        append({ id: crypto.randomUUID(), type: 'tool', text: `Tool (no-op on home): ${name}` });
      }
    };
    window.addEventListener('gemini-tool-call', handleToolCall);
    return () => window.removeEventListener('gemini-tool-call', handleToolCall);
  }, [append]);

  useEffect(() => {
    return () => {
      try { liveRef.current?.stopRecording(); } catch {}
    };
  }, []);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <HomeAssistantChat
          open={open}
          recording={recording}
          activity={activity}
          onStart={start}
          onStop={stop}
        />

        <Button
          size="lg"
          className={`h-14 w-14 rounded-full shadow-xl ${recording ? 'bg-red-600 hover:bg-red-700' : ''}`}
          onClick={toggle}
          aria-label={recording ? 'Stop Home Assistant' : 'Start Home Assistant'}
        >
          {recording ? <Square className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>
    </>
  );
}

export default HomeAssistantLive;
