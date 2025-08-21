import React, { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { PinOff } from 'lucide-react';
import { File } from '../../entities/File';

export default function DesktopIcon({ file, onDoubleClick, onDrag, onUnpin, isWiggleMode, onHold, onDropOnFolder, onDropOnDock, onDropOnTrash, dockRef, trashRef, folders }) {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const { name } = file;
  const dragControls = useDragControls();
  const touchTimeout = useRef(null);
  const holdTimeout = useRef(null);
  const inputRef = useRef(null);
  const [newName, setNewName] = useState(file.name || '');

  useEffect(() => {
    if (file.is_renaming && inputRef.current) {
      inputRef.current.focus();
      // Select all text for quick rename
      inputRef.current.select();
    }
  }, [file.is_renaming]);

  const commitRename = async (commit) => {
    try {
      if (commit) {
        const finalName = (newName || '').trim() || file.name || 'Untitled';
        await File.update(file.id, { name: finalName, is_renaming: false });
      } else {
        await File.update(file.id, { is_renaming: false });
      }
      window.dispatchEvent(new CustomEvent('refresh-desktop-files'));
    } catch (e) {
      console.error('Rename failed:', e);
    }
  };

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
      onDragStart={() => {
        setIsDragging(true);
        // Cancel long-press timer when a drag begins
        clearTimeout(holdTimeout.current);
      }}
      onDragEnd={(event, info) => {
        setIsDragging(false);
        const hitX = (event && event.clientX != null) ? event.clientX : info.point.x;
        const hitY = (event && event.clientY != null) ? event.clientY : info.point.y;

        // 0) Check over any open Finder window (full window area)
        const finderWindows = document.querySelectorAll('.ff-window[data-folder-id]');
        for (const win of finderWindows) {
          const rect = win.getBoundingClientRect();
          if (
            hitX >= rect.left &&
            hitX <= rect.right &&
            hitY >= rect.top &&
            hitY <= rect.bottom
          ) {
            const folderId = win.getAttribute('data-folder-id');
            if (folderId) {
              const targetFolder = folders.find(f => String(f.id) === String(folderId));
              onDropOnFolder(file, targetFolder || { id: folderId });
              return;
            }
          }
        }

        // 1) Check open Finder windows dropzones first
        const dropzones = document.querySelectorAll('[id^="finder-dropzone-"]');
        for (const dz of dropzones) {
          const rect = dz.getBoundingClientRect();
          if (
            hitX >= rect.left &&
            hitX <= rect.right &&
            hitY >= rect.top &&
            hitY <= rect.bottom
          ) {
            const folderId = dz.id.replace('finder-dropzone-', '');
            const targetFolder = folders.find(f => String(f.id) === String(folderId));
            // If the folder isn't on the desktop, still allow drop by passing minimal folder with id
            onDropOnFolder(file, targetFolder || { id: folderId });
            return;
          }
        }

        if (dockRef.current) {
          const dockRect = dockRef.current.getBoundingClientRect();
          if (
            hitX >= dockRect.left &&
            hitX <= dockRect.right &&
            hitY >= dockRect.top &&
            hitY <= dockRect.bottom
          ) {
            onDropOnDock(file);
            return;
          }
        }

        // 2. Check Trash bin drop
        if (trashRef && trashRef.current && onDropOnTrash) {
          const tRect = trashRef.current.getBoundingClientRect();
          if (
            hitX >= tRect.left &&
            hitX <= tRect.right &&
            hitY >= tRect.top &&
            hitY <= tRect.bottom
          ) {
            onDropOnTrash(file);
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
        // Start drag on touch after slight delay to avoid accidental drags
        if (e.pointerType === 'touch') {
          touchTimeout.current = setTimeout(() => {
            dragControls.start(e, { snapToCursor: true });
          }, 500);
        }
        // Start 2s hold timer to trigger wiggle mode
        clearTimeout(holdTimeout.current);
        holdTimeout.current = setTimeout(() => {
          try {
            onHold && onHold(file);
          } catch (err) {
            console.error('onHold error', err);
          }
        }, 2000);
      }}
      onPointerUp={() => {
        clearTimeout(touchTimeout.current);
        clearTimeout(holdTimeout.current);
      }}
      onPointerLeave={() => {
        clearTimeout(holdTimeout.current);
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
        {file.is_renaming ? (
          <input
            ref={inputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={() => commitRename(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename(true);
              if (e.key === 'Escape') commitRename(false);
            }}
            className={`text-sm font-medium text-center px-1 rounded outline-none border ${theme === 'light' ? 'bg-white/90 text-black border-gray-300' : 'bg-black/40 text-white border-gray-600'}`}
            style={{ minWidth: 80, maxWidth: 140 }}
          />
        ) : (
          <div
            className={`text-sm font-medium text-center ${theme === 'light' ? 'text-black' : 'text-white'}`}
            onDoubleClick={async (e) => {
              // Double-clicking the label should rename (and not open the folder)
              e.stopPropagation();
              e.preventDefault();
              try {
                // Only toggle rename for folders per request
                if (file.type === 'folder') {
                  await File.update(file.id, { is_renaming: true });
                  window.dispatchEvent(new CustomEvent('refresh-desktop-files'));
                } else {
                  // Optional: allow files too; currently no-op to match request
                }
              } catch (err) {
                console.error('Failed to start rename:', err);
              }
            }}
            title={file.type === 'folder' ? 'Double-click to rename' : undefined}
          >
            {name}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
