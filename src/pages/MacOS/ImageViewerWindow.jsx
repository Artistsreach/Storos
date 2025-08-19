import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { editImage } from '../../lib/geminiImageGeneration';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

export default function ImageViewerWindow({ isOpen, onClose, onMinimize, onMaximize, isMaximized, title, imageData, zIndex, onClick, position }) {
  const [editPrompt, setEditPrompt] = useState('');
  const [currentImageData, setCurrentImageData] = useState(imageData);

  useEffect(() => {
    setCurrentImageData(imageData);
  }, [imageData]);

  const handleEdit = async () => {
    if (!editPrompt) return;
    const { imageData: newImageData } = await editImage(editPrompt, currentImageData.split(',')[1], 'image/png');
    setCurrentImageData(`data:image/png;base64,${newImageData}`);
  };

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
        <div></div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <img src={currentImageData} alt={title} className="w-full h-full object-contain" />
      </div>
      <div className="p-2 bg-gray-200/80 rounded-b-lg border-t border-gray-300/40 flex">
        <input
          type="text"
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
          placeholder="Enter a prompt to edit the image..."
          className="w-full p-2 border rounded"
        />
        <button onClick={handleEdit} className="p-2 bg-blue-500 text-white rounded ml-2">Edit</button>
      </div>
    </motion.div>
  );
}
