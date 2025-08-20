import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

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

  // Detect mobile breakpoint and cap width
  useEffect(() => {
    const update = () => {
      const mobile = window.matchMedia('(max-width: 640px)').matches;
      setIsMobile(mobile);
      if (mobile) setWidth(w => Math.min(350, w));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragHandle=".drag-handle"
      className={`absolute bg-gray-100/50 backdrop-blur-xl rounded-lg shadow-2xl flex flex-col overflow-visible border border-gray-300/20 ${isMaximized ? 'w-full h-full top-0 left-0 rounded-none' : ''}`}
      style={{
        width: isMaximized ? '100%' : (isMobile ? Math.min(width, 350) : width),
        maxWidth: isMaximized ? undefined : (isMobile ? 350 : undefined),
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
          <button onClick={() => setIsEditing(!isEditing)} className="p-1 hover:bg-gray-300/50 rounded-md text-black">
            {isEditing ? 'View' : 'Edit'}
          </button>
          <button onClick={() => navigator.clipboard.writeText(currentContent)} className="p-1 hover:bg-gray-300/50 rounded-md text-black">
            Copy
          </button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('save-notepad', { detail: { title, content: currentContent } }))} className="p-1 hover:bg-gray-300/50 rounded-md text-black">
            Save
          </button>
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
          onDrag={(event, info) => {
            setWidth((w) => {
              const next = Math.max(300, w + info.delta.x);
              return isMobile ? Math.min(next, 350) : next;
            });
            setHeight((h) => Math.max(200, h + info.delta.y));
          }}
          className="absolute bottom-2 right-2 w-4 h-4 cursor-nwse-resize"
        >
          <div className="w-full h-full bg-gray-500/40 rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
}
