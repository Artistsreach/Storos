import React, { useState, useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { PinOff } from 'lucide-react';

export default function DesktopIcon({ file, onDoubleClick, onDrag, onUnpin, isWiggleMode, onHold, onDropOnFolder, onDropOnDock, dockRef, folders }) {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const { name } = file;
  const dragControls = useDragControls();
  const touchTimeout = useRef(null);

  const getIcon = () => {
    const iconUrl = theme === 'dark' && file.dark_icon ? file.dark_icon : file.icon;
    if (typeof iconUrl === 'string' && iconUrl.startsWith('http')) {
      return (
        <div className="w-12 h-12 flex items-center justify-center">
          <img
            src={iconUrl}
            alt={name}
            className="max-w-full max-h-full object-contain"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      );
    }
    if (React.isValidElement(iconUrl)) {
      // If consumer passed an <img />, disable native drag to allow framer-motion drag
      if (iconUrl.type === 'img') {
        return React.cloneElement(iconUrl, {
          draggable: false,
          onDragStart: (e) => e.preventDefault(),
        });
      }
      return iconUrl;
    }
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
      id={`folder-${file.id}`}
      drag
      dragControls={dragControls}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(event, info) => {
        setIsDragging(false);

        if (dockRef.current) {
          const dockRect = dockRef.current.getBoundingClientRect();
          if (
            info.point.x >= dockRect.left &&
            info.point.x <= dockRect.right &&
            info.point.y >= dockRect.top &&
            info.point.y <= dockRect.bottom
          ) {
            onDropOnDock(file);
            return;
          }
        }

        for (const folder of folders) {
          if (file.id === folder.id) continue;
          const folderElement = document.getElementById(`folder-${folder.id}`);
          if (folderElement) {
            const folderRect = folderElement.getBoundingClientRect();
            if (
              info.point.x >= folderRect.left &&
              info.point.x <= folderRect.right &&
              info.point.y >= folderRect.top &&
              info.point.y <= folderRect.bottom
            ) {
              onDropOnFolder(file, folder);
              return;
            }
          }
        }

        if (onDrag) {
          onDrag(file.id, info.point.x, info.point.y);
        }
      }}
      initial={{ x: file.position_x || 0, y: file.position_y || 0 }}
      onDoubleClick={() => onDoubleClick(file)}
      className="absolute cursor-pointer select-none"
      style={{ zIndex: isDragging ? 1000 : 1 }} // Bring to front when dragging
      onPointerDown={(e) => {
        if (e.pointerType === 'touch') {
          touchTimeout.current = setTimeout(() => {
            dragControls.start(e, { snapToCursor: true });
          }, 500);
        }
      }}
      onPointerUp={() => {
        clearTimeout(touchTimeout.current);
      }}
      onPanStart={() => {
        let timer;
        const onPointerDown = () => {
          timer = setTimeout(onHold, 2000);
        };
        const onPointerUp = () => {
          clearTimeout(timer);
        };
        window.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointerup', onPointerUp);
        return () => {
          window.removeEventListener('pointerdown', onPointerDown);
          window.removeEventListener('pointerup', onPointerUp);
        };
      }}
    >
      <motion.div
        className="relative flex flex-col items-center space-y-2 p-2 rounded-md"
        animate={{
          scale: isDragging ? 1.1 : 1,
          rotate: isWiggleMode ? (file.id % 2 === 0 ? 2 : -2) : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30
        }}
      >
        {file.is_shortcut && isWiggleMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnpin(file);
            }}
            className="absolute top-1 right-1 bg-white/50 rounded-full p-1 hover:bg-white"
          >
            <PinOff size={12} />
          </button>
        )}
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
