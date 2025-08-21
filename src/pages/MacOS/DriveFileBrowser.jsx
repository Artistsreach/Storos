import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, RefreshCw, LogIn, FolderOpen, FileText, Copy } from 'lucide-react';
import { ensureAuthorized, signInWithGoogle, downloadFileContent } from '../../lib/googleDrive';
import { listFilesPaged } from '../../lib/googleDrive';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

export default function DriveFileBrowser({
  isOpen,
  onClose,
  onMinimize,
  onMaximize,
  isMaximized,
  zIndex,
  position,
  onClick,
  onDragEnd,
  windowId,
}) {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(520);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Clamp width for mobile
  useEffect(() => {
    const clampForViewport = () => {
      if (window.innerWidth < 640) {
        setWidth((w) => Math.min(380, w));
      }
    };
    clampForViewport();
    window.addEventListener('resize', clampForViewport);
    return () => window.removeEventListener('resize', clampForViewport);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setError('');
        setLoading(true);
        await ensureAuthorized({ interactive: true });
        setAuthorized(true);
        const { files: first, nextPageToken: token } = await listFilesPaged({ pageSize: 25, orderBy: 'modifiedTime desc' });
        setFiles(first);
        setNextPageToken(token || null);
      } catch (e) {
        setAuthorized(false);
        setError(e?.message || 'Authorization failed.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      setAuthorized(true);
      const { files: first, nextPageToken: token } = await listFilesPaged({ pageSize: 25, orderBy: 'modifiedTime desc' });
      setFiles(first);
      setNextPageToken(token || null);
    } catch (e) {
      setError(e?.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!selected) return;
    try {
      setCopying(true);
      setCopied(false);
      let text = preview;
      if (!text) {
        try {
          text = await downloadFileContent(selected.id, selected.mimeType);
        } catch (_) {
          // If non-text or fails, surface a friendly error
          throw new Error('This file type may not be copyable as text.');
        }
      }
      await navigator.clipboard.writeText(text || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      setError(e?.message || 'Failed to copy');
    } finally {
      setCopying(false);
    }
  };

  const refresh = async () => {
    try {
      setLoading(true);
      setError('');
      const { files: first, nextPageToken: token } = await listFilesPaged({ pageSize: 25, orderBy: 'modifiedTime desc' });
      setFiles(first);
      setNextPageToken(token || null);
      setSelected(null);
      setPreview('');
    } catch (e) {
      setError(e?.message || 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!nextPageToken) return;
    try {
      setLoading(true);
      const { files: more, nextPageToken: token } = await listFilesPaged({ pageSize: 25, pageToken: nextPageToken, orderBy: 'modifiedTime desc' });
      setFiles(prev => [...prev, ...(more || [])]);
      setNextPageToken(token || null);
    } catch (e) {
      setError(e?.message || 'Failed to load more');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (file) => {
    setSelected(file);
    setPreview('');
    // Try preview for Google Docs
    try {
      if (file.mimeType === 'application/vnd.google-apps.document') {
        const text = await downloadFileContent(file.id, file.mimeType);
        setPreview(text);
      } else {
        setPreview('No inline preview available.');
      }
    } catch (e) {
      setPreview(`Failed to preview: ${e?.message || e}`);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragHandle=".drag-handle"
      onDragEnd={onDragEnd}
      className={`ff-window absolute bg-gray-100/50 backdrop-blur-xl rounded-lg shadow-2xl flex flex-col overflow-visible border border-gray-300/20 max-w-[380px] sm:max-w-none ${isMaximized ? 'w-full h-full top-0 left-0 rounded-none' : ''}`}
      style={{
        zIndex,
        width: isMaximized ? '100%' : width,
        height: isMaximized ? '100%' : height,
        top: isMaximized ? 0 : position?.top,
        left: isMaximized ? 0 : position?.left,
      }}
      data-window-id={windowId}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="relative flex items-center justify-between p-2 bg-gray-200/80 rounded-t-lg border-b border-gray-300/40">
        <div className="flex space-x-2">
          <TrafficLightButton color="bg-red-500" onClick={onClose} />
          <TrafficLightButton color="bg-yellow-500" onClick={onMinimize} />
          <TrafficLightButton color="bg-green-500" onClick={onMaximize} />
        </div>
        <div className="drag-handle font-semibold text-sm text-black select-none">Google Drive</div>
        <div className="flex items-center space-x-1">
          <button onClick={refresh} className="p-1 hover:bg-gray-300/50 rounded-md text-black" title="Refresh">
            <RefreshCw size={16} />
          </button>
          {!authorized && (
            <button onClick={handleSignIn} className="p-1 hover:bg-gray-300/50 rounded-md text-black" title="Sign in">
              <LogIn size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-gray-300/30 overflow-y-auto">
          {error && (
            <div className="m-3 text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded">{error}</div>
          )}
          {loading && (
            <div className="m-3 text-xs text-gray-700">Loading...</div>
          )}
          <div className="p-3 grid grid-cols-1 gap-2">
            {files.map(f => (
              <button
                key={f.id}
                onClick={() => handleSelect(f)}
                className={`w-full flex items-center justify-between text-left text-sm px-2 py-2 rounded hover:bg-gray-200/60 ${selected?.id === f.id ? 'bg-gray-300/60' : ''}`}
                title={f.mimeType}
              >
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/70 border border-gray-300">
                    {f.mimeType?.includes('folder') ? <FolderOpen size={14} /> : <FileText size={14} />}
                  </span>
                  <span className="truncate max-w-[200px]">{f.name}</span>
                </div>
                <ExternalLink size={14} className="opacity-40" />
              </button>
            ))}
          </div>
          <div className="p-3">
            <button
              onClick={loadMore}
              disabled={!nextPageToken || loading}
              className="px-3 py-1 text-sm rounded bg-white/80 border border-gray-300 hover:bg-white disabled:opacity-50"
            >
              {nextPageToken ? 'Load more' : 'No more files'}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {selected ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm text-black truncate pr-2" title={selected.name}>{selected.name}</div>
                <button
                  onClick={handleCopy}
                  disabled={!selected || copying}
                  className="p-1 hover:bg-gray-300/50 rounded-md text-black disabled:opacity-50"
                  title={copied ? 'Copied!' : 'Copy contents'}
                >
                  <Copy size={16} />
                </button>
              </div>
              <pre className="text-xs whitespace-pre-wrap bg-white/70 p-2 rounded border border-gray-300/40 min-h-[200px]">
                {preview || 'Select a Google Doc to preview its text here.'}
              </pre>
            </div>
          ) : (
            <div className="text-sm text-gray-700">Select a file to preview.</div>
          )}
        </div>
      </div>

      {!isMaximized && (
        <motion.div
          drag
          dragMomentum={false}
          dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
          dragElastic={0}
          onDrag={(event, info) => {
            setWidth((w) => {
              const next = Math.max(300, w + info.delta.x);
              return window.innerWidth < 640 ? Math.min(380, next) : next;
            });
            setHeight(h => Math.max(300, h + info.delta.y));
          }}
          className="absolute bottom-2 right-2 w-4 h-4 cursor-nwse-resize"
        >
          <div className="w-full h-full bg-gray-500/40 rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
}
