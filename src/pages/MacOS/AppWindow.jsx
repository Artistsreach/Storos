import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

export default function AppWindow({ isOpen, onClose, onMinimize, onMaximize, isMaximized, app, zIndex, onClick }) {
  const [height, setHeight] = useState(400);
  if (!isOpen) return null;

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
          <iframe src={app.url} className="w-full h-full flex-grow" />
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
