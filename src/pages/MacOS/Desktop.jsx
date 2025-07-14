import React, { useState, useEffect } from 'react';
import { File } from '../../entities/File';
import StatusBar from './StatusBar';
import Dock from './Dock';
import DesktopIcon from './DesktopIcon';
import FinderWindow from './FinderWindow';
import AppWindow from './AppWindow';
import SearchWindow from './SearchWindow';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Desktop() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [desktopFiles, setDesktopFiles] = useState([]);
  const [openWindows, setOpenWindows] = useState([]);
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [windowZIndex, setWindowZIndex] = useState(10);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    loadDesktopFiles();
  }, []);

  useEffect(() => {
    if (profile && profile.username) {
      setDesktopFiles(prevFiles => {
        if (prevFiles.some(f => f.id === 'profile-shortcut')) {
          return prevFiles; // Already added
        }

        const exploreFolder = prevFiles.find(f => f.name === 'Explore');
        const position = { x: 20, y: 120 };

        if (exploreFolder && typeof exploreFolder.position_x === 'number' && typeof exploreFolder.position_y === 'number') {
          position.x = exploreFolder.position_x;
          position.y = exploreFolder.position_y + 100;
        }

        const profileShortcut = {
          id: 'profile-shortcut',
          name: 'Profile',
          icon: '👤',
          url: `/${profile.username}`,
          type: 'link',
          position_x: position.x,
          position_y: position.y,
        };

        return [profileShortcut, ...prevFiles];
      });
    }
  }, [profile]);

  useEffect(() => {
    // Force re-render when desktopFiles changes
  }, [desktopFiles]);

  const loadDesktopFiles = async () => {
    try {
      const files = await File.filter({ parent_id: null });
      setDesktopFiles(files);
    } catch (error) {
      console.error('Error loading desktop files:', error);
    }
  };

  const handleDesktopIconDoubleClick = (file) => {
    if (file.url) {
      const windowId = `finder-${file.id || file.name}`;
      if (!openWindows.find(w => w.id === windowId)) {
        setOpenWindows(prev => [
          ...prev,
          {
            id: windowId,
            type: 'finder',
            title: file.name,
            folder: file,
            isMaximized: false,
            zIndex: windowZIndex,
            url: file.url,
          },
        ]);
        setWindowZIndex(prev => prev + 1);
      }
    } else if (file.type === 'folder') {
      const windowId = `finder-${file.id}`;
      if (!openWindows.find(w => w.id === windowId)) {
        setOpenWindows(prev => [
          ...prev,
          {
            id: windowId,
            type: 'finder',
            title: file.name,
            folder: file,
            isMaximized: false,
            zIndex: windowZIndex,
          },
        ]);
        setWindowZIndex(prev => prev + 1);
      }
    }
  };

  const handleAppClick = (app) => {
    if (app.url) {
      const windowId = `app-${app.id}`;
      if (!openWindows.find(w => w.id === windowId)) {
        setOpenWindows(prev => [
          ...prev,
          {
            id: windowId,
            type: 'app',
            app: app,
            isMaximized: false,
            zIndex: windowZIndex,
          },
        ]);
        setWindowZIndex(prev => prev + 1);
      }
    } else if (app.name === 'Finder') {
      const windowId = 'finder-main';
      if (!openWindows.find(w => w.id === windowId)) {
        setOpenWindows(prev => [
          ...prev,
          {
            id: windowId,
            type: 'finder',
            title: 'Finder',
            folder: null,
            isMaximized: false,
            zIndex: windowZIndex,
          },
        ]);
        setWindowZIndex(prev => prev + 1);
      }
    }
  };

  const closeWindow = (windowId) => {
    setOpenWindows(prev => prev.filter(w => w.id !== windowId));
    setMinimizedWindows(prev => prev.filter(w => w.id !== windowId));
  };

  const minimizeWindow = (windowId) => {
    setMinimizedWindows(prev => [...prev, windowId]);
  };

  const maximizeWindow = (windowId) => {
    setOpenWindows(prev =>
      prev.map(w =>
        w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
      )
    );
  };

  const bringToFront = (windowId) => {
    setOpenWindows(prev =>
      prev.map(w =>
        w.id === windowId ? { ...w, zIndex: windowZIndex } : w
      )
    );
    setWindowZIndex(prev => prev + 1);
  };

  const handleIconDrag = async (fileId, x, y) => {
    if (fileId === 'profile-shortcut') {
      setDesktopFiles(files =>
        files.map(f =>
          f.id === 'profile-shortcut' ? { ...f, position_x: x, position_y: y } : f
        )
      );
    } else {
      try {
        await File.update(fileId, { position_x: x, position_y: y });
        // We don't need to reload all files, just update the position of the dragged file
        setDesktopFiles(files =>
          files.map(f => (f.id === fileId ? { ...f, position_x: x, position_y: y } : f))
        );
      } catch (error) {
        console.error('Error updating file position:', error);
      }
    }
  };

  const handlePin = async (file) => {
    try {
      const shortcut = {
        ...file,
        id: undefined, // remove id to create a new file
        parent_id: null,
        name: file.name,
        is_shortcut: true,
        original_id: file.id,
      };
      const newFile = await File.create(shortcut);
      setDesktopFiles(prev => [...prev, newFile]);
    } catch (error) {
      console.error('Error creating shortcut:', error);
    }
  };

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
    bringToFront('search-window');
  };

  return (
    <div
      className={`min-h-screen relative ${
        theme === 'light' ? 'bg-[#ededed]' : 'bg-[#0a0a0a]'
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src={
            theme === 'light'
              ? 'https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Untitled%20design.png'
              : 'https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Untitled%20design%20(4).png'
          }
          alt="logo"
          className="w-64 h-64 opacity-20"
        />
      </div>

      <div className="relative z-10 h-full">
        <StatusBar onSearchClick={handleSearchClick} />

        {/* Desktop Icons */}
        <div className="absolute inset-0 pt-7 pb-20">
          {desktopFiles.map((file) => (
            <DesktopIcon
              key={file.id}
              file={file}
              onDoubleClick={() => handleDesktopIconDoubleClick(file)}
              onDrag={handleIconDrag}
            />
          ))}
        </div>

        {/* Windows */}
        {openWindows.map((window) => {
          if (window.type === 'finder') {
            return (
              <FinderWindow
                key={window.id}
                isOpen={!minimizedWindows.includes(window.id)}
                onClose={() => closeWindow(window.id)}
                onMinimize={() => minimizeWindow(window.id)}
                onMaximize={() => maximizeWindow(window.id)}
                isMaximized={window.isMaximized}
                initialFolder={window.folder}
                zIndex={window.zIndex}
                onClick={() => bringToFront(window.id)}
                onPin={handlePin}
                onFileDoubleClick={handleDesktopIconDoubleClick}
                initialUrl={window.url}
              />
            );
          }
          if (window.type === 'app') {
            return (
              <AppWindow
                key={window.id}
                isOpen={!minimizedWindows.includes(window.id)}
                onClose={() => closeWindow(window.id)}
                onMinimize={() => minimizeWindow(window.id)}
                onMaximize={() => maximizeWindow(window.id)}
                isMaximized={window.isMaximized}
                app={window.app}
                zIndex={window.zIndex}
                onClick={() => bringToFront(window.id)}
              />
            );
          }
          return null;
        })}

        <SearchWindow
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          zIndex={openWindows.find(w => w.id === 'search-window')?.zIndex || 10}
          onClick={() => bringToFront('search-window')}
          onFileOpen={handleDesktopIconDoubleClick}
        />

        <Dock onClick={handleAppClick} />
      </div>
    </div>
  );
}
