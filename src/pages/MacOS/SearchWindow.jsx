import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, File as FileIcon, Folder } from 'lucide-react';
import { File } from '../../entities/File';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

export default function SearchWindow({ isOpen, onClose, zIndex, onClick, onFileOpen }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allFiles, setAllFiles] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const files = await File.getAll();
      setAllFiles(files);
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const results = allFiles.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, allFiles]);

  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragHandle=".drag-handle"
      className="fixed top-1/4 left-1/4 w-1/2 bg-gray-100/50 backdrop-blur-xl rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-300/20"
      style={{ zIndex }}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="drag-handle flex items-center justify-between p-2 bg-gray-200/80 rounded-t-lg border-b border-gray-300/40">
        <div className="flex space-x-2">
          <TrafficLightButton color="bg-red-500" onClick={onClose} />
          <TrafficLightButton color="bg-yellow-500" onClick={() => {}} />
          <TrafficLightButton color="bg-green-500" onClick={() => {}} />
        </div>
        <div className="font-semibold text-sm text-black">Search</div>
        <div></div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-white/50 border border-gray-300/50 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-grow overflow-y-auto">
          {searchResults.map(file => (
            <div
              key={file.id}
              className="flex items-center p-2 rounded-md hover:bg-gray-200/70 cursor-pointer text-black"
              onDoubleClick={() => onFileOpen(file)}
            >
              {file.type === 'folder' ? <Folder className="w-5 h-5 mr-2" /> : <FileIcon className="w-5 h-5 mr-2" />}
              <span>{file.name}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
