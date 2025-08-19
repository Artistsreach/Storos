import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const YouTubePlayer = ({ videoId, onClose, zIndex }) => {
  if (!videoId) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] bg-black rounded-lg shadow-2xl overflow-hidden border border-gray-800"
      style={{ zIndex }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-center justify-between px-2 py-1 bg-gray-900 text-white text-xs">
        <span>YouTube Player</span>
        <button className="p-1 hover:text-red-400" onClick={onClose}><X className="w-4 h-4" /></button>
      </div>
      <div className="aspect-video bg-black">
        <iframe
          key={videoId}
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </motion.div>
  );
};

export default YouTubePlayer;
