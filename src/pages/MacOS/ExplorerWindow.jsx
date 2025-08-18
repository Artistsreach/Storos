import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

export default function ExplorerWindow({ isOpen, onClose, onMinimize, onMaximize, isMaximized, title, content, zIndex, onClick }) {
  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragHandle=".drag-handle"
      className={`fixed top-12 left-1/2 transform -translate-x-1/2 w-11/12 md:w-3/4 h-3/4 md:h-1/2 bg-gray-100/50 backdrop-blur-xl rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-300/20 ${isMaximized ? 'w-full h-full top-0 left-0 rounded-none' : ''}`}
      style={{ zIndex }}
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
        <div></div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </motion.div>
  );
}
