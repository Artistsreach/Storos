import React, { useState } from 'react';
import { motion } from 'framer-motion';

const dockApps = [
  { id: 'video', name: 'Video', icon: '🎥', url: 'https://studio.freshfront.co' },
  { id: 'nft', name: 'NFT', icon: '🖼️', url: 'https://nft.freshfront.co' },
  { id: 'music', name: 'Music', icon: '🎵', url: 'https://musicmigo.com' },
  { id: 'product', name: 'Product', icon: '📦', url: 'https://freshfront.co/designer' },
  { id: 'podcast', name: 'Podcast', icon: '🎙️', url: 'https://freshfront.co/podcast' },
  { id: 'store', name: 'Store', icon: '🛍️', url: 'https://freshfront.co' },
  { id: 'app', name: 'App', icon: '⚙️', url: 'https://build.freshfront.co' },
  { id: 'website', name: 'Website', icon: '🌐', url: 'https://freshfront.co/page-generator' },
  { id: 'search', name: 'Search', icon: '🔍', url: 'https://freshfront.co/search' },
  { id: 'frontst', name: 'Front St.', icon: '🏘️', url: '/play' },
];

export default function Dock({ onClick }) {
  const [hoveredApp, setHoveredApp] = useState(null);

  return (
    <div className="fixed bottom-2 inset-x-0 flex justify-center mx-4 z-40">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 flex space-x-2 shadow-lg overflow-x-auto max-w-full">
        {dockApps.map((app, index) => (
          <motion.div
            key={app.id}
            className="relative flex-shrink-0"
            onMouseEnter={() => setHoveredApp(index)}
            onMouseLeave={() => setHoveredApp(null)}
            onClick={() => onClick(app)}
          >
            <motion.div
              className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center cursor-pointer"
              animate={{
                scale: hoveredApp === index ? 1.2 : 1,
                y: hoveredApp === index ? -8 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30
              }}
            >
              <span className="text-2xl">{app.icon}</span>
            </motion.div>
            {hoveredApp === index && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap"
              >
                {app.name}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
