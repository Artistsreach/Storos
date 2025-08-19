import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { File as FileIcon, Video, ImageIcon, Package, Music, Mic, Store, AppWindow as AppWindowIcon, Globe, Gamepad2, Search, Building, Pin, ExternalLink } from 'lucide-react';
import { File } from '../../entities/File';
import AutomationWorkflowPage from './AutomationWorkflowPage';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

const FinderItem = ({ icon, name, isComingSoon, onPin, file, onFileDoubleClick }) => (
  <div
    className={`relative flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-200/70 text-black ${isComingSoon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    onDoubleClick={() => onFileDoubleClick(file)}
  >
    {icon}
    <span className="text-xs text-center">{name}</span>
    {!isComingSoon && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPin(file);
        }}
        className="absolute top-1 right-1 bg-white/50 rounded-full p-1 hover:bg-white"
      >
        <Pin size={12} />
      </button>
    )}
  </div>
);

const getIcon = (file) => {
  if (file.icon) {
    if (file.icon.startsWith('http')) {
      return (
        <div className="w-12 h-12 flex items-center justify-center">
          <img src={file.icon} alt={file.name} className="max-w-full max-h-full object-contain" />
        </div>
      );
    }
    switch (file.icon) {
      case '🎥': return <Video size={32} />;
      case '🖼️': return <ImageIcon size={32} />;
      case '📦': return <Package size={32} />;
      case '🎵': return <Music size={32} />;
      case '🎙️': return <Mic size={32} />;
      case '🛍️': return <Store size={32} />;
      case '⚙️': return <AppWindowIcon size={32} />;
      case '🌐': return <Globe size={32} />;
      case '🎮': return <Gamepad2 size={32} />;
      case '🔍': return <Search size={32} />;
      case '🏘️': return <Building size={32} />;
      default: return <FileIcon size={32} />;
    }
  }
  return <FileIcon size={32} />;
};

export default function FinderWindow({ isOpen, onClose, onMinimize, onMaximize, isMaximized, initialFolder, zIndex, onClick, onPin, onFileDoubleClick, initialUrl, position }) {
  const [folderFiles, setFolderFiles] = useState([]);
  const [iframeUrl, setIframeUrl] = useState(initialUrl);
  const [selectedFile, setSelectedFile] = useState(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);

  const handleFileDoubleClick = (file) => {
    if (file.workflow) {
      setSelectedFile(file);
      setIframeUrl(null);
    } else if (file.url) {
      if (file.url.startsWith('/')) {
        window.location.href = file.url;
      } else {
        setIframeUrl(file.url);
        setSelectedFile(null);
      }
    } else if (onFileDoubleClick) {
      onFileDoubleClick(file);
    }
  };

  const handlePin = (file) => {
    if (onPin) {
      onPin(file);
    }
  };

  useEffect(() => {
    if (initialFolder) {
      loadFolderFiles(initialFolder.id);
    }
  }, [initialFolder]);

  const loadFolderFiles = async (folderId) => {
    try {
      const files = await File.filter({ parent_id: folderId });
      setFolderFiles(files);
    } catch (error) {
      console.error('Error loading folder files:', error);
    }
  };

  if (!isOpen) return null;

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
        <div className="font-semibold text-sm text-black">{initialFolder ? initialFolder.name : 'Finder'}</div>
        <div>
          {iframeUrl && (
            <button
              onClick={() => window.open(iframeUrl, '_blank')}
              className="p-1 hover:bg-gray-300/50 rounded-md text-black"
            >
              <ExternalLink size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="flex-grow flex flex-col overflow-y-auto">
        {selectedFile ? (
          <AutomationWorkflowPage file={selectedFile} />
        ) : iframeUrl ? (
          <iframe src={iframeUrl} className="w-full h-full flex-grow" />
        ) : (
          <div className="p-4 flex-grow overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {folderFiles.map(file => (
                <FinderItem key={file.id} icon={getIcon(file)} name={file.name} isComingSoon={file.name.includes('soon')} onPin={handlePin} file={file} onFileDoubleClick={handleFileDoubleClick} />
              ))}
            </div>
          </div>
        )}
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
      </div>
    </motion.div>
  );
}
