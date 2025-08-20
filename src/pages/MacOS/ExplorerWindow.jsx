import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import Connector from './Connector';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

export default function ExplorerWindow({ isOpen, onClose, onMinimize, onMaximize, isMaximized, title, content, zIndex, onClick, position, windowId, onConnectorMouseDown }) {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);
  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragHandle=".drag-handle"
      className={`ff-window absolute bg-gray-100/50 backdrop-blur-xl rounded-lg shadow-2xl flex flex-col overflow-visible border border-gray-300/20 ${isMaximized ? 'w-full h-full top-0 left-0 rounded-none' : ''}`}
      style={{
        zIndex,
        width: isMaximized ? '100%' : width,
        height: isMaximized ? '100%' : height,
        top: isMaximized ? 0 : position?.top,
        left: isMaximized ? 0 : position?.left,
      }}
      data-window-id={windowId}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="relative flex items-center justify-between p-2 bg-gray-200/80 rounded-t-lg border-b border-gray-300/40">
        <div className="flex space-x-2">
          <TrafficLightButton color="bg-red-500" onClick={onClose} />
          <TrafficLightButton color="bg-yellow-500" onClick={onMinimize} />
          <TrafficLightButton color="bg-green-500" onClick={onMaximize} />
        </div>
        <div className="drag-handle font-semibold text-sm text-black select-none">{title}</div>
        <div></div>
      </div>
      <Connector side="left" windowId={windowId} />
      <Connector side="right" windowId={windowId} onMouseDown={onConnectorMouseDown} />
      <div className="flex-grow p-4 overflow-y-auto">
        <ReactMarkdown>{content}</ReactMarkdown>
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
