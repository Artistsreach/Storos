import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export default function DesktopIcon({ file, onDoubleClick, onDrag }) {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const { name } = file;

  const getIcon = () => {
    if (file.icon) return file.icon; // Use custom icon from entity
    if (file.type === 'folder') return '📁';
    if (name.endsWith('.pdf')) return '📄';
    if (name.endsWith('.txt')) return '📝';
    if (name.endsWith('.jpg') || name.endsWith('.png')) return '🖼️';
    if (name.endsWith('.mp3')) return '🎵';
    if (name.endsWith('.mp4')) return '📹';
    return '📄'; // Default icon
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(event, info) => {
        setIsDragging(false);
        if (onDrag) {
          onDrag(file.id, info.point.x, info.point.y);
        }
      }}
      initial={{ x: file.position_x || 0, y: file.position_y || 0 }}
      onDoubleClick={() => onDoubleClick(file)}
      className="absolute cursor-pointer select-none"
      style={{ zIndex: isDragging ? 1000 : 1 }} // Bring to front when dragging
    >
      <motion.div
        className="flex flex-col items-center space-y-2 p-2 rounded-md"
        animate={{
          scale: isDragging ? 1.1 : 1,
          rotate: isDragging ? 5 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30
        }}
      >
        <div className="text-5xl drop-shadow-lg">
          {getIcon()}
        </div>
        <div className={`text-sm font-medium text-center ${theme === 'light' ? 'text-black' : 'text-white'}`}>
          {name}
        </div>
      </motion.div>
    </motion.div>
  );
}
