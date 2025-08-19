import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import StripeAnalyticsWidget from './StripeAnalyticsWidget';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

export default function AppWindow({ isOpen, onClose, onMinimize, onMaximize, isMaximized, app, zIndex, onClick, automation, position }) {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);
  const iframeRef = useRef(null);
  if (!isOpen) return null;

  useEffect(() => {
    if (!automation) return;
    const frameEl = iframeRef.current;
    if (!frameEl) return;

    // For createStore, defer to the dedicated effect below to avoid premature submission
    if (automation.type === 'createStore') {
      return;
    }

    if (automation.type !== 'buildApp' || !automation.prompt) return;

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
        const desiredOrigin = srcUrl ? new URL(srcUrl).origin : '*';
        let targetOrigin = desiredOrigin || '*';
        // If the iframe is still about:blank or inherits parent origin (localhost), fall back to '*'
        try {
          const actualOrigin = frameEl.contentWindow?.location?.origin;
          if (actualOrigin && desiredOrigin && actualOrigin !== desiredOrigin) {
            targetOrigin = '*';
          }
        } catch (_) {
          // Cross-origin access throws; keep desiredOrigin
        }
        console.debug('[Desktop] postMessage FF_BUILD_APP to', targetOrigin);
        frameEl.contentWindow?.postMessage({ type: 'FF_BUILD_APP', prompt: automation.prompt }, targetOrigin);
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

  useEffect(() => {
    if (!automation || automation.type !== 'automateTask') return;
    const frameEl = iframeRef.current;
    if (!frameEl) return;

    const url = `https://commandr.co/?command=${encodeURIComponent(automation.task)}`;
    frameEl.setAttribute('src', url);
  }, [automation]);

  useEffect(() => {
    if (!automation || automation.type !== 'createStore') return;
    const frameEl = iframeRef.current;
    if (!frameEl) return;

    const desiredType = automation.storeType || 'print_on_demand';

    const trySameOriginInject = () => {
      try {
        const win = frameEl.contentWindow;
        const doc = win?.document;
        if (!doc) return false;
        console.debug('[Desktop] [Store] Attempting same-origin injection');

        // Fill name
        const nameEl = doc.getElementById('storeName') || doc.querySelector('input#storeName, input[name="storeName"], input[placeholder*="store" i]');
        if (nameEl) {
          nameEl.focus();
          nameEl.value = automation.name || '';
          nameEl.dispatchEvent(new Event('input', { bubbles: true }));
          nameEl.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Fill description
        const descEl = doc.getElementById('storePrompt') || doc.querySelector('textarea#storePrompt, textarea[name="storePrompt"], textarea');
        if (descEl) {
          descEl.focus();
          descEl.value = automation.prompt || '';
          descEl.dispatchEvent(new Event('input', { bubbles: true }));
          descEl.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Toggle the correct checkbox (mutually exclusive handled by app)
        const idMap = {
          print_on_demand: 'printOnDemandCheckbox',
          dropship: 'dropshippingCheckbox',
          fund: 'fundCheckbox',
        };
        const checkboxId = idMap[desiredType];
        const cbEl = checkboxId ? doc.getElementById(checkboxId) : null;
        if (cbEl) {
          if (!cbEl.checked) cbEl.click(); // click to ensure onChange logic runs
        }

        // Click submit button
        let submitEl = doc.getElementById('generateStoreButton');
        if (!submitEl) {
          const btns = Array.from(doc.querySelectorAll('form button[type="submit"], button[type="submit"], button, [role="button"], input[type="submit"]'));
          submitEl = btns.find(b => /generate\s*store/i.test(b.textContent || b.value || '')) || btns.find(b => b.type === 'submit');
        }
        if (submitEl) {
          console.debug('[Desktop] [Store] Clicking generate');
          submitEl.click();
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    };

    const sendPostMessage = () => {
      try {
        const srcUrl = frameEl.getAttribute('src') || app?.url || '';
        const desiredOrigin = srcUrl ? new URL(srcUrl).origin : '*';
        let targetOrigin = desiredOrigin || '*';
        try {
          const actualOrigin = frameEl.contentWindow?.location?.origin;
          if (actualOrigin && desiredOrigin && actualOrigin !== desiredOrigin) {
            targetOrigin = '*';
          }
        } catch (_) {
          // ignore
        }
        console.debug('[Desktop] postMessage FF_CREATE_STORE to', targetOrigin);
        frameEl.contentWindow?.postMessage({
          type: 'FF_CREATE_STORE',
          name: automation.name || '',
          description: automation.prompt || '',
          storeType: desiredType,
        }, targetOrigin);
      } catch (_) { }
    };

    const setUrlParamsFallback = () => {
      try {
        const current = frameEl.getAttribute('src') || app?.url || '';
        if (!current) return;
        const url = new URL(current);
        url.searchParams.set('storeName', automation.name || '');
        url.searchParams.set('storePrompt', automation.prompt || '');
        url.searchParams.set('autocreate', '1');
        // encode type flags
        url.searchParams.set('pod', desiredType === 'print_on_demand' ? '1' : '0');
        url.searchParams.set('dropship', desiredType === 'dropship' ? '1' : '0');
        url.searchParams.set('fund', desiredType === 'fund' ? '1' : '0');

        // mirror to hash as well
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
        hashParams.set('storeName', automation.name || '');
        hashParams.set('storePrompt', automation.prompt || '');
        hashParams.set('autocreate', '1');
        hashParams.set('pod', desiredType === 'print_on_demand' ? '1' : '0');
        hashParams.set('dropship', desiredType === 'dropship' ? '1' : '0');
        hashParams.set('fund', desiredType === 'fund' ? '1' : '0');
        url.hash = hashParams.toString();

        const next = url.toString();
        if (next !== current) frameEl.setAttribute('src', next);
      } catch (_) { }
    };

    const successImmediate = trySameOriginInject();
    sendPostMessage();
    if (!successImmediate) setUrlParamsFallback();

    let attempts = 0;
    const maxAttempts = 5;
    const retryInterval = setInterval(() => {
      attempts += 1;
      sendPostMessage();
      if (attempts >= maxAttempts) clearInterval(retryInterval);
    }, 1000);

    const onMessage = (e) => {
      try {
        const srcUrl = frameEl.getAttribute('src') || app?.url || '';
        const origin = srcUrl ? new URL(srcUrl).origin : '';
        if (origin && e.origin !== origin) return;
      } catch (_) {}
      if (e.data && (e.data.type === 'FF_READY_GEN' || e.data.type === 'FF_READY')) {
        console.debug('[Desktop] Received store READY from iframe');
        sendPostMessage();
      }
    };
    window.addEventListener('message', onMessage);

    const onLoad = () => {
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
      className={`absolute bg-gray-100/50 backdrop-blur-xl rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-300/20 ${isMaximized ? 'w-full h-full top-0 left-0 rounded-none' : ''}`}
      style={{
        zIndex,
        width: isMaximized ? '100%' : width,
        height: isMaximized ? '100%' : height,
        top: isMaximized ? 0 : position?.top,
        left: isMaximized ? 0 : position?.left,
      }}
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
            try {
              if (automation?.type === 'buildApp' && automation?.prompt) {
                const u = new URL(app.url);
                u.searchParams.set('prompt', automation.prompt);
                u.searchParams.set('autobuild', '1');
                return u.toString();
              }
              if (automation?.type === 'createStore') {
                const u = new URL(app.url);
                if (automation.name) u.searchParams.set('storeName', automation.name);
                if (automation.description) u.searchParams.set('storePrompt', automation.description);
                u.searchParams.set('autocreate', '1');
                const t = automation.storeType || 'print_on_demand';
                u.searchParams.set('pod', t === 'print_on_demand' ? '1' : '0');
                u.searchParams.set('dropship', t === 'dropship' ? '1' : '0');
                u.searchParams.set('fund', t === 'fund' ? '1' : '0');
                return u.toString();
              }
            } catch (_) { /* fallthrough */ }
            return app.url;
          }, [app.url, automation?.type, automation?.prompt, automation?.name, automation?.description, automation?.storeType])} className="w-full h-full flex-grow" />
        ) : (
          <div className="p-4 flex-grow overflow-auto">
            {app?.id === 'stripe-analytics' ? (
              <StripeAnalyticsWidget />
            ) : (
              <div>
                {/* App content goes here */}
              </div>
            )}
          </div>
        )}
      </div>
      {!isMaximized && (
        <motion.div
          drag
          dragMomentum={false}
          dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
          dragElastic={0}
          onDrag={(event, info) => {
            setWidth(w => Math.max(300, w + info.delta.x));
            setHeight(h => Math.max(200, h + info.delta.y));
          }}
          className="absolute bottom-2 right-2 w-4 h-4 cursor-nwse-resize"
        >
          <div className="w-full h-full bg-gray-500/40 rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
}
