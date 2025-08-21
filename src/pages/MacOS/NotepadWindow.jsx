import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { uploadNoteAsDoc, listFiles, downloadFileContent, ensureAuthorized } from '../../lib/googleDrive';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

export default function NotepadWindow({ isOpen, onClose, onMinimize, onMaximize, isMaximized, title, content, zIndex, onClick, position, windowId, defaultEditing }) {
  const [currentContent, setCurrentContent] = useState(content);
  const [isEditing, setIsEditing] = useState(!!defaultEditing);
  const contentRef = useRef(null);
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [isMobile, setIsMobile] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [hasUserResized, setHasUserResized] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setCurrentContent(content);
  }, [content]);

  useEffect(() => {
    setIsEditing(!!defaultEditing);
  }, [defaultEditing, windowId]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [currentContent]);

  // Detect mobile breakpoint and cap width (only before user resizes)
  useEffect(() => {
    const update = () => {
      const mobile = window.matchMedia('(max-width: 640px)').matches;
      setIsMobile(mobile);
      if (mobile && !hasUserResized) setWidth(w => Math.min(400, w));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [hasUserResized]);

  if (!isOpen) return null;

  const handleSaveToDrive = async () => {
    try {
      setIsBusy(true);
      await ensureAuthorized({ interactive: true });
      const res = await uploadNoteAsDoc(title, currentContent);
      alert(`Saved to Google Drive as: ${res?.name || 'Document'} (id: ${res?.id})`);
    } catch (e) {
      console.error('Save to Drive failed', e);
      alert(`Save to Drive failed: ${e?.error || e?.message || e}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleOpenFromDrive = async () => {
    try {
      setIsBusy(true);
      await ensureAuthorized({ interactive: true });
      const files = await listFiles({ pageSize: 25, query: "mimeType='application/vnd.google-apps.document'" });
      if (!files || files.length === 0) {
        alert('No Google Docs found in your Drive (created by this app or accessible with drive.file).');
        return;
      }
      const options = files.map((f, i) => `${i + 1}. ${f.name} (${f.id})`).join('\n');
      const choice = window.prompt(`Select a file number to open as text:\n\n${options}`);
      const idx = Number(choice) - 1;
      if (Number.isNaN(idx) || idx < 0 || idx >= files.length) return;
      const file = files[idx];
      const text = await downloadFileContent(file.id, file.mimeType);
      setCurrentContent(text || '');
      setIsEditing(true);
    } catch (e) {
      console.error('Open from Drive failed', e);
      alert(`Open from Drive failed: ${e?.error || e?.message || e}`);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragHandle=".drag-handle"
      className={`absolute bg-gray-100/50 backdrop-blur-xl rounded-lg shadow-2xl flex flex-col overflow-visible border border-gray-300/20 ${isMaximized ? 'w-full h-full top-0 left-0 rounded-none' : ''}`}
      style={{
        width: isMaximized ? '100%' : (isMobile && !hasUserResized ? Math.min(width, 400) : width),
        maxWidth: isMaximized ? undefined : (isMobile && !hasUserResized ? 400 : undefined),
        height: isMaximized ? '100%' : height,
        zIndex,
        top: isMaximized ? 0 : position?.top,
        left: isMaximized ? 0 : position?.left,
      }}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="drag-handle relative flex items-center justify-between p-2 bg-gray-200/80 rounded-t-lg border-b border-gray-300/40">
        <div className="flex space-x-2">
          <TrafficLightButton color="bg-red-500" onClick={onClose} />
          <TrafficLightButton color="bg-yellow-500" onClick={onMinimize} />
          <TrafficLightButton color="bg-green-500" onClick={onMaximize} />
        </div>
        <div className="font-semibold text-sm text-black">{title}</div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-2 py-1 text-sm bg-gray-300/50 hover:bg-gray-300/70 rounded-md text-black">
                Actions ▾
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsEditing(!isEditing); }}>
                {isEditing ? 'View' : 'Edit'}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); navigator.clipboard.writeText(currentContent); }}>
                Copy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('save-notepad', { detail: { title, content: currentContent } })); }}>
                Save
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isBusy} onSelect={async (e) => { e.preventDefault(); await handleSaveToDrive(); }}>
                <img src="https://inrveiaulksfmzsbyzqj.supabase.co/storage/v1/object/public/images/Google-Drive-Logo.png" alt="Drive" className="h-4 w-auto mr-2 object-contain" />
                Save to Drive
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isBusy} onSelect={async (e) => { e.preventDefault(); await handleOpenFromDrive(); }}>
                <img src="https://inrveiaulksfmzsbyzqj.supabase.co/storage/v1/object/public/images/Google-Drive-Logo.png" alt="Drive" className="h-4 w-auto mr-2 object-contain" />
                Open from Drive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div ref={contentRef} className="flex-grow p-4 overflow-y-auto" onMouseDown={(e) => e.stopPropagation()}>
        {isEditing ? (
          <textarea
            className="w-full h-full bg-transparent border-none focus:outline-none"
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
          />
        ) : (
          <ReactMarkdown>{currentContent}</ReactMarkdown>
        )}
      </div>
      {!isMaximized && (
        <motion.div
          drag
          dragMomentum={false}
          dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
          dragElastic={0}
          onDragStart={() => setIsResizing(true)}
          onDrag={(event, info) => {
            setWidth((w) => {
              const next = Math.max(300, w + info.delta.x);
              return (isMobile && !hasUserResized && !isResizing) ? Math.min(next, 400) : next;
            });
            setHeight((h) => Math.max(200, h + info.delta.y));
          }}
          onDragEnd={() => { setIsResizing(false); setHasUserResized(true); }}
          className="absolute bottom-2 right-2 w-4 h-4 cursor-nwse-resize"
        >
          <div className="w-full h-full bg-gray-500/40 rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
}
