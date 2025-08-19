import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

export default function NotepadWindow({ isOpen, onClose, onMinimize, onMaximize, isMaximized, title, content, zIndex, onClick, position }) {
  const [currentContent, setCurrentContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    setCurrentContent(content);
  }, [content]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [currentContent]);

  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragHandle=".drag-handle"
      className={`absolute w-1/2 h-1/2 bg-gray-100/50 backdrop-blur-xl rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-300/20 ${isMaximized ? 'w-full h-full top-0 left-0 rounded-none' : ''}`}
      style={{
        zIndex,
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
    </motion.div>
  );
}
