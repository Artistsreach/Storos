import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

export default function AppWindow({ isOpen, onClose, onMinimize, onMaximize, isMaximized, app, zIndex, onClick, automation }) {
  const [height, setHeight] = useState(400);
  const iframeRef = useRef(null);
  if (!isOpen) return null;

  useEffect(() => {
    if (!automation || automation.type !== 'buildApp' || !automation.prompt) return;
    const frameEl = iframeRef.current;
    if (!frameEl) return;

    const trySameOriginInject = () => {
      try {
        const win = frameEl.contentWindow;
        const doc = win?.document;
        if (!doc) return false;
        console.debug('[Desktop] Attempting same-origin injection');
        // 1) Prefer explicit element IDs provided by the builder
        const explicitInput = doc.getElementById('home-prompt-field');
        const explicitButton = doc.getElementById('home-build-button');
        if (explicitInput) {
          // If the ID is a container, find a real input/textarea/contenteditable inside
          const innerPrompt = explicitInput.matches('textarea, input, [contenteditable="true"]')
            ? explicitInput
            : explicitInput.querySelector('textarea, input[type="text"], input:not([type]), [contenteditable="true"]');
          if (innerPrompt) {
            if (innerPrompt.getAttribute('contenteditable') === 'true') {
              innerPrompt.focus();
              innerPrompt.textContent = automation.prompt;
              innerPrompt.dispatchEvent(new Event('input', { bubbles: true }));
              innerPrompt.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
              innerPrompt.focus();
              innerPrompt.value = automation.prompt;
              innerPrompt.dispatchEvent(new Event('input', { bubbles: true }));
              innerPrompt.dispatchEvent(new Event('change', { bubbles: true }));
            }
            // Simulate Enter key to trigger any listeners
            innerPrompt.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            innerPrompt.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
          }

          if (explicitButton) {
            // If the ID is a container, find a real clickable button inside
            const innerBtn = explicitButton.matches('button, [role="button"], input[type="submit"]')
              ? explicitButton
              : explicitButton.querySelector('button, [role="button"], input[type="submit"]');
            if (innerBtn) {
              console.debug('[Desktop] Clicking explicit build button');
              innerBtn.click();
              return true;
            }
          }
        }

        // 2) Fallback: heuristic selectors if IDs are not found
        const candidates = [
          'textarea#home-prompt-field',
          'input#home-prompt-field',
          'textarea[placeholder*="describe" i]',
          'textarea[placeholder*="prompt" i]',
          'input[placeholder*="describe" i]',
          'input[placeholder*="prompt" i]',
          'textarea',
          'input[type="text"]'
        ];
        let inputEl = null;
        for (const sel of candidates) {
          inputEl = doc.querySelector(sel);
          if (inputEl) break;
        }
        if (!inputEl) return false;
        inputEl.focus();
        inputEl.value = automation.prompt;
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        inputEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
        // Find a likely build button
        const btnById = doc.getElementById('home-build-button');
        if (btnById) { btnById.click(); return true; }
        const btns = Array.from(doc.querySelectorAll('button, [role="button"], input[type="submit"]'));
        const buildBtn = btns.find(b => /build\s*it|build|create|generate/i.test(b.textContent || b.value || ''));
        if (buildBtn) {
          buildBtn.click();
          return true;
        }
        return false;
      } catch (e) {
        // Cross-origin likely
        return false;
      }
    };

    const sendPostMessage = () => {
      try {
        const srcUrl = frameEl.getAttribute('src') || app?.url || '';
        const origin = srcUrl ? new URL(srcUrl).origin : '*';
        console.debug('[Desktop] postMessage FF_BUILD_APP to', origin);
        frameEl.contentWindow?.postMessage({ type: 'FF_BUILD_APP', prompt: automation.prompt }, origin || '*');
      } catch (_) {
        // ignore
      }
    };

    const setUrlParamsFallback = () => {
      try {
        const current = frameEl.getAttribute('src') || app?.url || '';
        if (!current) return;
        const url = new URL(current);
        url.searchParams.set('prompt', automation.prompt);
        url.searchParams.set('autobuild', '1');
        // Also mirror in hash for apps that read from location.hash
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
        hashParams.set('prompt', automation.prompt);
        hashParams.set('autobuild', '1');
        url.hash = hashParams.toString();
        const next = url.toString();
        if (next !== current) frameEl.setAttribute('src', next);
      } catch (_) {
        // ignore
      }
    };

    // Attempt immediately
    const successImmediate = trySameOriginInject();
    sendPostMessage();
    if (!successImmediate) setUrlParamsFallback();

    // Retry postMessage a few times in case the iframe app initializes late
    let attempts = 0;
    const maxAttempts = 5;
    const retryInterval = setInterval(() => {
      attempts += 1;
      sendPostMessage();
      if (attempts >= maxAttempts) clearInterval(retryInterval);
    }, 1000);

    // Listen for handshake messages from the iframe (e.g., FF_READY)
    const onMessage = (e) => {
      try {
        const srcUrl = frameEl.getAttribute('src') || app?.url || '';
        const origin = srcUrl ? new URL(srcUrl).origin : '';
        if (origin && e.origin !== origin) return;
      } catch (_) {}
      if (e.data && e.data.type === 'FF_READY') {
        console.debug('[Desktop] Received FF_READY from iframe');
        sendPostMessage();
      }
    };
    window.addEventListener('message', onMessage);

    // Also attempt again on load
    const onLoad = () => {
      // Wait a tick for inner scripts to attach
      setTimeout(() => {
        const success = trySameOriginInject();
        if (!success) sendPostMessage();
      }, 250);
    };
    frameEl.addEventListener('load', onLoad);
    return () => {
      frameEl.removeEventListener('load', onLoad);
      clearInterval(retryInterval);
      window.removeEventListener('message', onMessage);
    };
  }, [automation, app?.url]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragHandle=".drag-handle"
      className={`fixed top-1/4 left-1/4 w-3/4 bg-gray-100/50 backdrop-blur-xl rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-300/20 ${isMaximized ? 'w-full h-full top-0 left-0 rounded-none' : ''}`}
      style={{ zIndex, height: isMaximized ? '100%' : height }}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="drag-handle flex items-center justify-between p-2 bg-gray-200/80 rounded-t-lg border-b border-gray-300/40">
        <div className="flex space-x-2">
          <TrafficLightButton color="bg-red-500" onClick={onClose} />
          <TrafficLightButton color="bg-yellow-500" onClick={onMinimize} />
          <TrafficLightButton color="bg-green-500" onClick={onMaximize} />
        </div>
        <div className="font-semibold text-sm text-black">{app.name}</div>
        <div>
          {app.url && (
            <button
              onClick={() => window.open(app.url, '_blank')}
              className="p-1 hover:bg-gray-300/50 rounded-md text-black"
            >
              <ExternalLink size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="flex-grow flex flex-col">
        {app.url ? (
          <iframe ref={iframeRef} src={useMemo(() => {
            if (automation?.type === 'buildApp' && automation?.prompt) {
              try {
                const u = new URL(app.url);
                u.searchParams.set('prompt', automation.prompt);
                u.searchParams.set('autobuild', '1');
                return u.toString();
              } catch (_) {
                return app.url;
              }
            }
            return app.url;
          }, [app.url, automation?.type, automation?.prompt])} className="w-full h-full flex-grow" />
        ) : (
          <div className="p-4 flex-grow">
            {/* App content goes here */}
          </div>
        )}
      {!isMaximized && (
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDrag={(event, info) => {
            setHeight(h => Math.max(200, h + info.delta.y));
          }}
          className="h-4 flex items-center justify-center cursor-ns-resize flex-shrink-0"
        >
          <div className="w-10 h-1 bg-gray-400 rounded-full" />
        </motion.div>
      )}
      </div>
    </motion.div>
  );
}
