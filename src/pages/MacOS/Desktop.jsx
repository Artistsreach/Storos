import React, { useState, useEffect, useRef } from 'react';
import { File } from '../../entities/File';
import StatusBar from './StatusBar';
import Dock from './Dock';
import DesktopIcon from './DesktopIcon';
import FinderWindow from './FinderWindow';
import AppWindow from './AppWindow';
import SearchWindow from './SearchWindow';
import AgentModal from './AgentModal';
import ExplorerWindow from './ExplorerWindow';
import ImageViewerWindow from './ImageViewerWindow';
import NotepadWindow from './NotepadWindow';
import TableWindow from './TableWindow';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { deepResearch } from '../../lib/firecrawl';
import { generateImage } from '../../lib/geminiImageGeneration';
import { GoogleGenAI } from '@google/genai';

export default function Desktop() {
  const { theme, toggleTheme } = useTheme();
  const { profile } = useAuth();
  const [desktopFiles, setDesktopFiles] = useState([]);
  const dockRef = useRef(null);
  const [openWindows, setOpenWindows] = useState([]);
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [windowZIndex, setWindowZIndex] = useState(10);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isWiggleMode, setIsWiggleMode] = useState(false);
  const [explorerWindow, setExplorerWindow] = useState({ isOpen: false, content: '' });
  const [imageViewerWindow, setImageViewerWindow] = useState({ isOpen: false, imageData: '' });
  const [notepadWindow, setNotepadWindow] = useState({ isOpen: false, content: '' });
  const [tableWindow, setTableWindow] = useState({ isOpen: false, data: { headers: [], rows: [] } });

  useEffect(() => {
    loadDesktopFiles();

    window.addEventListener('toggle-theme', toggleTheme);

    const handleSaveNotepad = async (event) => {
      const { title, content } = event.detail;
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: `Generate a short, descriptive title for the following note (maximum 3 words):\n\n${content}`,
      });
      const newFile = {
        name: result.text.split(' ').slice(0, 3).join(' '),
        content,
        type: 'file',
        parent_id: null,
        is_shortcut: true,
        icon: '🗒️',
      };
      const createdFile = await File.create(newFile);
      setDesktopFiles(prev => [...prev, createdFile]);
    };

    window.addEventListener('save-notepad', handleSaveNotepad);

    return () => {
      window.removeEventListener('toggle-theme', toggleTheme);
      window.removeEventListener('save-notepad', handleSaveNotepad);
    };
  }, [toggleTheme]);

  useEffect(() => {
    const handleToolCall = (event) => {
      const { name, args } = event.detail;
      const findAndOpenFile = (fileId) => {
        const file = desktopFiles.find(f => f.id === fileId);
        if (file) {
          handleDesktopIconDoubleClick(file);
        } else {
          console.warn(`File with id ${fileId} not found.`);
        }
      };

      const openAppWithAutomation = (fileId, automation) => {
        const file = desktopFiles.find(f => f.id === fileId);
        if (!file) {
          console.warn(`File with id ${fileId} not found.`);
          return;
        }
        const windowId = `app-${file.id || file.name}`;
        const existing = openWindows.find(w => w.id === windowId);
        if (existing) {
          // Bring to front and attach/replace automation payload
          setOpenWindows(prev => prev.map(w => w.id === windowId ? { ...w, automation } : w));
          bringToFront(windowId);
        } else {
          setOpenWindows(prev => [
            ...prev,
            {
              id: windowId,
              type: 'app',
              app: file,
              isMaximized: false,
              zIndex: windowZIndex,
              automation,
            },
          ]);
          setWindowZIndex(prev => prev + 1);
        }
      };

      switch (name) {
        case "automateTask":
          findAndOpenFile(129);
          break;
        case "createStore":
          findAndOpenFile('store-shortcut');
          break;
        case "buildApp":
          openAppWithAutomation('app-shortcut', { type: 'buildApp', prompt: args?.description || '' });
          break;
        case "createVideo":
          findAndOpenFile('video-shortcut');
          break;
        case "createNFT":
          findAndOpenFile('nft-shortcut');
          break;
        case "createPodcast":
          findAndOpenFile('podcast-shortcut');
          break;
        case "toggleTheme":
          window.dispatchEvent(new CustomEvent('toggle-theme'));
          break;
        case "deepResearch":
          setExplorerWindow({ isOpen: true, content: '' });
          deepResearch(args.query, (log) => {
            setExplorerWindow(prev => ({ ...prev, content: `${prev.content}\n\n${log}` }));
          }).then(content => {
            setExplorerWindow(prev => ({ ...prev, content: `${prev.content}\n\n${content}` }));
          });
          break;
        case "generateImage":
          setImageViewerWindow({ isOpen: true, imageData: '' });
          generateImage(args.prompt).then(({ imageData }) => {
            setImageViewerWindow({ isOpen: true, imageData: `data:image/png;base64,${imageData}` });
          });
          break;
        case "openNotepad":
          setNotepadWindow({ isOpen: true, content: '' });
          const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
          ai.models.generateContentStream({
            model: "gemini-2.5-flash-lite",
            contents: args.prompt,
          }).then(async (response) => {
            for await (const chunk of response) {
              setNotepadWindow(prev => ({ ...prev, content: prev.content + chunk.text }));
            }
          });
          break;
        case "createTable":
          setTableWindow({ isOpen: true, data: { headers: [], rows: [] } });
          const ai2 = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
          ai2.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a table with the following data: ${args.prompt}. Return the data as a JSON object with two keys: "headers" (an array of strings) and "rows" (an array of arrays of strings).`,
          }).then(response => {
            const data = JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, ''));
            setTableWindow({ isOpen: true, data });
          });
          break;
        default:
          console.warn("Unknown tool call:", name);
      }
    };

    window.addEventListener('gemini-tool-call', handleToolCall);

    return () => {
      window.removeEventListener('gemini-tool-call', handleToolCall);
    };
  }, [desktopFiles]);

  useEffect(() => {
    if (profile && profile.username) {
      setDesktopFiles(prevFiles => {
        // Create a mutable copy to work with
        let newFiles = [...prevFiles];
        let profileShortcut = newFiles.find(f => f.id === 'profile-shortcut');

        // Add profile shortcut if it doesn't exist
        if (!profileShortcut) {
          const exploreFolder = newFiles.find(f => f.name === 'Explore');
          const position = { x: 20, y: 120 };

          if (exploreFolder && typeof exploreFolder.position_x === 'number' && typeof exploreFolder.position_y === 'number') {
            position.x = exploreFolder.position_x;
            position.y = exploreFolder.position_y + 100;
          }

          profileShortcut = {
            id: 'profile-shortcut',
            name: 'Profile',
            icon: '👤',
            url: `/${profile.username}`,
            type: 'link',
            position_x: position.x,
            position_y: position.y,
          };
          newFiles.unshift(profileShortcut); // Add to the beginning
        }

        // Add agent icon if it doesn't exist
        if (!newFiles.some(f => f.id === 'agent-icon')) {
          const automateFolder = newFiles.find(f => f.name === 'Automate');
          const position = { x: 20, y: 200 };

          if (automateFolder && typeof automateFolder.position_x === 'number' && typeof automateFolder.position_y === 'number') {
            position.x = automateFolder.position_x + 80;
            position.y = automateFolder.position_y;
          }

          const agentIcon = {
            id: 'agent-icon',
            name: 'Agent',
            icon: '💬',
            type: 'app',
            position_x: position.x,
            position_y: position.y,
          };
          newFiles.push(agentIcon);
        }

        // Add store shortcut if it doesn't exist
        if (!newFiles.some(f => f.id === 'store-shortcut')) {
          const storeShortcut = {
            id: 'store-shortcut',
            name: 'Store',
            icon: '🛍️',
            url: 'https://freshfront.co',
            type: 'link',
            is_shortcut: true,
            position_x: profileShortcut.position_x + 80,
            position_y: profileShortcut.position_y,
          };
          newFiles.push(storeShortcut);
        }

        const appShortcut = {
          id: 'app-shortcut', name: 'App', icon: '📱', url: 'https://build.freshfront.co',
          position_x: newFiles.find(f => f.id === 'agent-icon')?.position_x,
          position_y: newFiles.find(f => f.id === 'agent-icon')?.position_y + 80,
        };
        const videoShortcut = {
          id: 'video-shortcut', name: 'Video', icon: '🎥', url: 'https://studio.freshfront.co',
          position_x: profileShortcut.position_x,
          position_y: profileShortcut.position_y + 80,
        };
        const nftShortcut = {
          id: 'nft-shortcut', name: 'NFT', icon: '🎨', url: 'https://nft.freshfront.co',
          position_x: newFiles.find(f => f.id === 'store-shortcut')?.position_x,
          position_y: newFiles.find(f => f.id === 'store-shortcut')?.position_y + 80,
        };
        const podcastShortcut = {
          id: 'podcast-shortcut', name: 'Podcast', icon: '🎙️', url: 'https://freshfront.co/podcast',
          position_x: appShortcut.position_x,
          position_y: appShortcut.position_y + 80,
        };

        const shortcuts = [appShortcut, videoShortcut, nftShortcut, podcastShortcut];

        shortcuts.forEach(shortcut => {
          if (!newFiles.some(f => f.id === shortcut.id)) {
            newFiles.push({
              ...shortcut,
              type: 'app',
              is_shortcut: true,
            });
          }
        });

        // Only update state if there were changes
        if (newFiles.length > prevFiles.length) {
          return newFiles;
        }
        
        return prevFiles;
      });
    }
  }, [profile]);

  useEffect(() => {
    // Force re-render when desktopFiles changes
  }, [desktopFiles]);


  const loadDesktopFiles = async () => {
    try {
      let files = await File.filter({ parent_id: null });
      setDesktopFiles(files);
    } catch (error) {
      console.error('Error loading desktop files:', error);
    }
  };

  const handleDesktopIconDoubleClick = (file) => {
    if (file.id === 'agent-icon') {
      setIsAgentModalOpen(true);
      return;
    }
    if (file.content) {
      setNotepadWindow({ isOpen: true, content: file.content });
      return;
    }
    if (file.url) {
        const windowId = `app-${file.id || file.name}`;
        if (!openWindows.find(w => w.id === windowId)) {
          setOpenWindows(prev => [
            ...prev,
            {
              id: windowId,
              type: 'app',
              app: file,
              isMaximized: false,
              zIndex: windowZIndex,
            },
          ]);
          setWindowZIndex(prev => prev + 1);
        }
    } else if (file.type === 'folder') {
      const windowId = `finder-${file.id}`;
      const existingWindow = openWindows.find(w => w.id === windowId);
      if (existingWindow) {
        bringToFront(windowId);
      } else {
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
    if (fileId === 'profile-shortcut' || fileId === 'store-shortcut') {
      setDesktopFiles(files =>
        files.map(f =>
          f.id === fileId ? { ...f, position_x: x, position_y: y } : f
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

  const handleDropFromDock = async (app, x, y) => {
    try {
      let icon = app.icon;
      if (React.isValidElement(icon)) {
        icon = icon.props.src;
      }
      const newFile = {
        name: app.name,
        icon: icon,
        url: app.url,
        type: 'file',
        parent_id: null,
        position_x: x,
        position_y: y,
        is_shortcut: true,
        original_id: app.id,
      };
      const createdFile = await File.create(newFile);
      setDesktopFiles(prev => [...prev, createdFile]);
    } catch (error) {
      console.error('Error creating file from dock drop:', error);
    }
  };

  const handleUnpin = async (file) => {
    try {
      await File.delete(file.id);
      setDesktopFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (error) {
      console.error('Error unpinning file:', error);
    }
  };

  const handleIconHold = () => {
    setIsWiggleMode(true);
  };

  const handleDropOnFolder = async (file, folder) => {
    try {
      await File.update(file.id, { parent_id: folder.id });
      setDesktopFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (error) {
      console.error('Error dropping file on folder:', error);
    }
  };

  const handleDropOnDock = async (file) => {
    try {
      await File.delete(file.id);
      setDesktopFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (error) {
      console.error('Error dropping file on dock:', error);
    }
  };

  return (
    <div
      className={`min-h-screen relative ${
        theme === 'light' ? 'bg-[#ededed]' : 'bg-[#0a0a0a]'
      }`}
      onClick={() => setIsWiggleMode(false)}
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
              onUnpin={handleUnpin}
              isWiggleMode={isWiggleMode}
              onHold={handleIconHold}
              onDropOnFolder={handleDropOnFolder}
              onDropOnDock={handleDropOnDock}
              dockRef={dockRef}
              folders={desktopFiles.filter(f => f.type === 'folder')}
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
                automation={window.automation}
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

        <AgentModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)} />

        <ExplorerWindow
          isOpen={explorerWindow.isOpen}
          onClose={() => setExplorerWindow({ isOpen: false, content: '' })}
          title="Research Results"
          content={explorerWindow.content}
          zIndex={windowZIndex}
          onClick={() => bringToFront('explorer-window')}
        />

        <ImageViewerWindow
          isOpen={imageViewerWindow.isOpen}
          onClose={() => setImageViewerWindow({ isOpen: false, imageData: '' })}
          title="Generated Image"
          imageData={imageViewerWindow.imageData}
          zIndex={windowZIndex}
          onClick={() => bringToFront('image-viewer-window')}
        />

        <NotepadWindow
          isOpen={notepadWindow.isOpen}
          onClose={() => setNotepadWindow({ isOpen: false, content: '' })}
          title="Notepad"
          content={notepadWindow.content}
          zIndex={windowZIndex}
          onClick={() => bringToFront('notepad-window')}
        />

        <TableWindow
          isOpen={tableWindow.isOpen}
          onClose={() => setTableWindow({ isOpen: false, data: { headers: [], rows: [] } })}
          title="Table"
          data={tableWindow.data}
          zIndex={windowZIndex}
          onClick={() => bringToFront('table-window')}
        />

        <Dock onClick={handleAppClick} onDrop={handleDropFromDock} ref={dockRef} />
      </div>
    </div>
  );
}
