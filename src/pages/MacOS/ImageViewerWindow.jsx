import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { editImage } from '../../lib/geminiImageGeneration';
import { File } from '../../entities/File';
 

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

export default function ImageViewerWindow({ isOpen, onClose, onMinimize, onMaximize, isMaximized, title, imageData, zIndex, onClick, position, windowId }) {
  const [editPrompt, setEditPrompt] = useState('');
  const [currentImageData, setCurrentImageData] = useState(imageData);
  const [mimeType, setMimeType] = useState('image/png');
  const [isEditing, setIsEditing] = useState(false);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(450);
  const [isMobile, setIsMobile] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [hasUserResized, setHasUserResized] = useState(false);

  useEffect(() => {
    setCurrentImageData(imageData);
  }, [imageData]);

  // Detect mobile breakpoint and cap width
  useEffect(() => {
    const update = () => {
      const mobile = window.matchMedia('(max-width: 640px)').matches;
      setIsMobile(mobile);
      if (mobile && !hasUserResized) {
        setWidth((w) => Math.min(400, w));
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [hasUserResized]);

  const handleEdit = async () => {
    if (!editPrompt || !currentImageData) return;
    try {
      setIsEditing(true);
      const base64 = currentImageData.split(',')[1];
      const { imageData: newImageData } = await editImage(editPrompt, base64, mimeType || 'image/png');
      setCurrentImageData(`data:${mimeType || 'image/png'};base64,${newImageData}`);
    } finally {
      setIsEditing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === 'string') {
        setCurrentImageData(dataUrl);
        setMimeType(file.type || 'image/png');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!currentImageData) return;
    try {
      const a = document.createElement('a');
      a.href = currentImageData;
      const ext = mimeType.includes('jpeg') ? 'jpg' : (mimeType.includes('png') ? 'png' : 'png');
      a.download = `image-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  const handleSaveShortcut = async () => {
    if (!currentImageData) return;
    try {
      const newFile = {
        name: title || `Image ${new Date().toLocaleTimeString()}`,
        icon: '🖼️',
        type: 'file',
        parent_id: null,
        is_shortcut: true,
        imageData: currentImageData,
      };
      await File.create(newFile);
      window.dispatchEvent(new CustomEvent('refresh-desktop-files'));
    } catch (e) {
      console.error('Error saving image shortcut:', e);
    }
  };

  if (!isOpen) return null;

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
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveShortcut}
            disabled={!currentImageData}
            className={`px-2 py-1 text-xs rounded border ${!currentImageData ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-white hover:bg-gray-100 text-black border-gray-300'}`}
            title="Save shortcut to desktop"
          >Save</button>
          <button
            onClick={handleDownload}
            disabled={!currentImageData}
            className={`px-2 py-1 text-xs rounded ${!currentImageData ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            title="Download image"
          >Download</button>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {currentImageData ? (
          <img src={currentImageData} alt={title || 'Image'} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-black space-y-3">
            <div className="text-sm opacity-80">Upload an image to start editing</div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
          </div>
        )}
      </div>
      <div className="p-2 bg-gray-200/80 rounded-b-lg border-t border-gray-300/40 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
          <span className="text-xs text-black/70">{mimeType}</span>
        </div>
        <div className="flex">
          <input
            type="text"
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="Describe the edit (e.g., add a llama next to the person)"
            className="w-full p-2 border rounded"
          />
          <button onClick={handleEdit} disabled={isEditing || !currentImageData}
            className={`p-2 rounded ml-2 ${isEditing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
          >{isEditing ? 'Editing…' : 'Edit'}</button>
        </div>
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
              const next = Math.max(360, w + info.delta.x);
              return (isMobile && !hasUserResized && !isResizing) ? Math.min(next, 400) : next;
            });
            setHeight((h) => Math.max(260, h + info.delta.y));
          }}
          onDragEnd={() => {
            setIsResizing(false);
            setHasUserResized(true);
          }}
          className="absolute bottom-2 right-2 w-4 h-4 cursor-nwse-resize"
        >
          <div className="w-full h-full bg-gray-500/40 rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
}
