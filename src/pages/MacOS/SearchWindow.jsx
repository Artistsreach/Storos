import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, File as FileIcon, Folder, PlayCircle, X, Youtube as YoutubeIcon } from 'lucide-react';
import { File } from '../../entities/File';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

export default function SearchWindow({ isOpen, onClose, zIndex, onClick, onFileOpen, onPlayYoutubeVideo }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allFiles, setAllFiles] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [ytResults, setYtResults] = useState([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState('');

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

  const searchYouTube = async () => {
    setYtError('');
    setYtResults([]);
    const q = searchTerm.trim();
    if (!q) return;
    setYtLoading(true);
    try {
      const base = import.meta.env.VITE_YT_API_BASE; // e.g., http://localhost:3000 for Next API
      if (base) {
        try {
          const res = await fetch(`${base.replace(/\/$/, '')}/api/youtube/search`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ q, maxResults: 12 }),
          });
          if (!res.ok) {
            const t = await res.text();
            throw new Error(t || `YouTube search failed (${res.status})`);
          }
          const items = await res.json();
          setYtResults(Array.isArray(items) ? items : []);
          return;
        } catch (apiErr) {
          // Fallback to client API key if available
          const key = import.meta.env.VITE_YOUTUBE_API_KEY;
          if (key) {
            const params = new URLSearchParams({
              key,
              part: 'snippet',
              type: 'video',
              maxResults: '12',
              q,
            });
            const res2 = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
            if (!res2.ok) {
              const t2 = await res2.text();
              throw new Error(`YouTube API error ${res2.status}: ${t2}`);
            }
            const data2 = await res2.json();
            setYtResults(Array.isArray(data2.items) ? data2.items : []);
            return;
          }
          throw apiErr;
        }
      } else {
        const key = import.meta.env.VITE_YOUTUBE_API_KEY;
        if (!key) {
          throw new Error('Missing VITE_YT_API_BASE (Next API base, e.g., http://localhost:3000) or VITE_YOUTUBE_API_KEY.');
        }
        const params = new URLSearchParams({
          key,
          part: 'snippet',
          type: 'video',
          maxResults: '12',
          q,
        });
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
        if (!res.ok) {
          const t = await res.text();
          throw new Error(`YouTube API error ${res.status}: ${t}`);
        }
        const data = await res.json();
        setYtResults(Array.isArray(data.items) ? data.items : []);
      }
    } catch (e) {
      setYtError(e.message || 'YouTube search failed');
    } finally {
      setYtLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragHandle=".drag-handle"
      className="absolute w-1/2 bg-gray-100/50 backdrop-blur-xl rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-300/20"
      style={{ zIndex, top: 100, left: '25%' }}
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
        {searchTerm.trim().length > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={searchYouTube}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              disabled={ytLoading}
            >
              <YoutubeIcon className="w-4 h-4" />
              {ytLoading ? 'Searching…' : 'Search YouTube'}
            </button>
            {ytError && <span className="text-sm text-red-700">{ytError}</span>}
          </div>
        )}
        {ytResults.length > 0 && (
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wide text-gray-700 mb-2">YouTube Results</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {ytResults.map((item) => {
                const vid = item?.id?.videoId;
                const thumb = item?.snippet?.thumbnails?.medium?.url || item?.snippet?.thumbnails?.default?.url;
                const title = item?.snippet?.title;
                const channel = item?.snippet?.channelTitle;
                return (
                  <div key={vid || Math.random()} className="flex gap-3 p-2 rounded-md bg-white/60 hover:bg-white/80 cursor-pointer border border-gray-300/40"
                       onClick={() => vid && onPlayYoutubeVideo(vid)}>
                    <div className="shrink-0 w-28 h-16 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                      {thumb ? <img src={thumb} alt={title} className="w-full h-full object-cover" /> : <PlayCircle className="w-8 h-8 text-gray-600" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-black truncate" title={title}>{title}</div>
                      <div className="text-xs text-gray-700 truncate" title={channel}>{channel}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
