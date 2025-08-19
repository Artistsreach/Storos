import React, { useState, useEffect, useRef, useCallback } from 'react';
import { File } from '../../entities/File';
import StatusBar from './StatusBar';
import Dock from './Dock';
import StripeAnalyticsWidget from './StripeAnalyticsWidget';
import DesktopIcon from './DesktopIcon';
import FinderWindow from './FinderWindow';
import AppWindow from './AppWindow';
import SearchWindow from './SearchWindow';
import YouTubePlayer from './YouTubePlayer';
import AgentModal from './AgentModal';
import ExplorerWindow from './ExplorerWindow';
import ImageViewerWindow from './ImageViewerWindow';
import NotepadWindow from './NotepadWindow';
import TableWindow from './TableWindow';
import TasksWindow from './TasksWindow';
import CalculatorWindow from './CalculatorWindow';
import ContractCreatorWindow from './ContractCreatorWindow';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { deepResearch } from '../../lib/firecrawl';
import { generateImage } from '../../lib/geminiImageGeneration';
import { GoogleGenAI } from '@google/genai';
import ConnectionsLayer from './ConnectionsLayer';

export default function Desktop() {
  const { theme, toggleTheme } = useTheme();
  const { profile } = useAuth();
  const [desktopFiles, setDesktopFiles] = useState([]);
  const [staticShortcuts, setStaticShortcuts] = useState([]);
  const dockRef = useRef(null);
  const [openWindows, setOpenWindows] = useState([]);
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [windowZIndex, setWindowZIndex] = useState(10);
  const [nextWindowPosition, setNextWindowPosition] = useState({ top: 50, left: 50 });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [youtubePlayerId, setYoutubePlayerId] = useState(null);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isWiggleMode, setIsWiggleMode] = useState(false);
  const [explorerWindow, setExplorerWindow] = useState({ isOpen: false, content: '' });
  const [imageViewerWindow, setImageViewerWindow] = useState({ isOpen: false, imageData: '' });
  const [tableWindow, setTableWindow] = useState({ isOpen: false, data: { headers: [], rows: [] } });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPannable, setIsPannable] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth * 2, height: window.innerHeight * 2 });
  const [connections, setConnections] = useState([]);
  const [newConnection, setNewConnection] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingColor, setDrawingColor] = useState('red');
  const [drawingSize, setDrawingSize] = useState(5);
  const [drawingTool, setDrawingTool] = useState('pencil');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const context = canvas.getContext('2d');
      contextRef.current = context;
    }
  }, [canvasSize]);

  useEffect(() => {
    const context = contextRef.current;
    if (context) {
      context.lineCap = 'round';
      context.strokeStyle = drawingColor;
      context.lineWidth = drawingSize;
    }
  }, [drawingColor, drawingSize]);

  const getEventPosition = (e) => {
    const canvas = canvasRef.current;
    if (e.touches && e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top,
      };
    }
    return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
  };

  const startDrawing = (e) => {
    if (!isDrawingMode) return;
    e.stopPropagation();
    const { offsetX, offsetY } = getEventPosition(e);
    if (drawingTool === 'pencil' || drawingTool === 'eraser') {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
    }
    setIsDrawing(true);
  };

  const finishDrawing = (e) => {
    if (!isDrawingMode) return;
    e.stopPropagation();
    if (drawingTool === 'pencil' || drawingTool === 'eraser') {
      contextRef.current.closePath();
    }
    setIsDrawing(false);
  };

  const draw = useCallback((e) => {
    if (!isDrawing || !isDrawingMode) return;
    e.stopPropagation();
    const { offsetX, offsetY } = getEventPosition(e);
    if (drawingTool === 'pencil') {
      contextRef.current.globalCompositeOperation = 'source-over';
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    } else if (drawingTool === 'eraser') {
      contextRef.current.globalCompositeOperation = 'destination-out';
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    }
  }, [isDrawing, isDrawingMode, drawingTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchMove = (e) => {
      if (isDrawingMode) {
        e.preventDefault();
        draw(e);
      }
    };

    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDrawingMode, draw]);

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
        const windowId = `app-${file.id || file.name}-${Date.now()}`;
        setOpenWindows(prev => [
            ...prev,
            {
              id: windowId,
              type: 'app',
              app: file,
              isMaximized: false,
              zIndex: windowZIndex,
              automation,
              position: nextWindowPosition,
            },
          ]);
          setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
          setWindowZIndex(prev => prev + 1);
      };

      switch (name) {
        case "automateTask":
          openAppWithAutomation('commandr-shortcut', { type: 'automateTask', ...args.tool_call });
          break;
        case "createStore":
          openAppWithAutomation('store-shortcut', {
            type: 'createStore',
            prompt: args?.description || '',
            name: args?.name || '',
            storeType: args?.storeType || 'print_on_demand',
          });
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
          const windowId = `notepad-${Date.now()}`;
          setOpenWindows(prev => [
            ...prev,
            {
              id: windowId,
              type: 'notepad',
              isMaximized: false,
              zIndex: windowZIndex,
              position: nextWindowPosition,
              content: '',
            },
          ]);
          setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
          setWindowZIndex(prev => prev + 1);
          const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
          ai.models.generateContentStream({
            model: "gemini-2.5-flash-lite",
            contents: args.prompt,
          }).then(async (response) => {
            for await (const chunk of response) {
              setOpenWindows(prev => prev.map(w => w.id === windowId ? { ...w, content: w.content + chunk.text } : w));
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
        case "openCalculator":
          const calculatorWindowId = `calculator-${Date.now()}`;
          setOpenWindows(prev => [
            ...prev,
            {
              id: calculatorWindowId,
              type: 'calculator',
              isMaximized: false,
              zIndex: windowZIndex,
              position: nextWindowPosition,
              width: 300,
              height: 400,
            },
          ]);
          setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
          setWindowZIndex(prev => prev + 1);
          break;
        case "createContract":
          const contractWindowId = `contract-creator-${Date.now()}`;
          setOpenWindows(prev => [
            ...prev,
            {
              id: contractWindowId,
              type: 'contract-creator',
              isMaximized: false,
              zIndex: windowZIndex,
              position: nextWindowPosition,
              width: 800,
              height: 600,
            },
          ]);
          setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
          setWindowZIndex(prev => prev + 1);
          break;
        default:
          console.warn("Unknown tool call:", name);
      }
    };

    window.addEventListener('gemini-tool-call', handleToolCall);

    return () => {
      window.removeEventListener('gemini-tool-call', handleToolCall);
    };
  }, []);

  const handleConnectorMouseDown = (e, fromWindowId) => {
    e.stopPropagation();
    setNewConnection({ from: fromWindowId, to: { x: e.clientX, y: e.clientY } });
  };

  const handleMouseMove = (e) => {
    if (newConnection) {
      setNewConnection({ ...newConnection, to: { x: e.clientX, y: e.clientY } });
    }
  };

  const handleMouseUp = (e) => {
    if (newConnection) {
      const toWindow = openWindows.find((w) => {
        if (!w.position) return false;
        const width = w.width || 800;
        const height = w.height || 600;
        return (
          e.clientX >= w.position.left &&
          e.clientX <= w.position.left + width &&
          e.clientY >= w.position.top &&
          e.clientY <= w.position.top + height
        );
      });

      if (toWindow && toWindow.id !== newConnection.from) {
        setConnections([...connections, { from: newConnection.from, to: toWindow.id }]);
      }
      setNewConnection(null);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [newConnection]);

  useEffect(() => {
    const shortcuts = [
      { id: 'agent-icon', name: 'Agent', icon: '💬', type: 'app', position_x: 220, position_y: 50 },
      { id: 'store-shortcut', name: 'Store', icon: '🛍️', url: 'https://freshfront.co/gen', type: 'link', is_shortcut: true, position_x: 219, position_y: 443 },
      { id: 'app-shortcut', name: 'App', icon: '📱', url: 'https://build.freshfront.co', type: 'app', is_shortcut: true, position_x: 221, position_y: 150 },
      { id: 'video-shortcut', name: 'Video', icon: '🎥', url: 'https://studio.freshfront.co', type: 'app', is_shortcut: true, position_x: 125, position_y: 443 },
      { id: 'nft-shortcut', name: 'NFT', icon: '🎨', url: 'https://nft.freshfront.co', type: 'app', is_shortcut: true, position_x: 125, position_y: 345 },
      { id: 'podcast-shortcut', name: 'Podcast', icon: '🎙️', url: 'https://freshfront.co/podcast', type: 'app', is_shortcut: true, position_x: 25, position_y: 443 },
      { id: 'stripe-analytics', name: 'Stripe', icon: 'https://vraplbexttpgnpnvdutg.supabase.co/storage/v1/object/public/content/IMG_7057.png', type: 'app', is_shortcut: true, position_x: 219, position_y: 345 },
      { id: 'commandr-shortcut', name: 'Commandr', icon: '🤖', url: 'https://commandr.co/', type: 'app', is_shortcut: true, isHidden: true, position_x: 195, position_y: 420 },
      { id: 'tasks-shortcut', name: 'Tasks', icon: '📝', type: 'app', is_shortcut: true, position_x: 220, position_y: 250 },
      { id: 'tools-folder', name: 'Tools', icon: '📁', type: 'folder', is_shortcut: true, position_x: 300, position_y: 50 },
    ];

    if (profile && profile.username) {
      const profileShortcut = {
        id: 'profile-shortcut',
        name: 'Profile',
        icon: '👤',
        url: `/${profile.username}`,
        type: 'link',
        position_x: 25,
        position_y: 345,
      };
      setStaticShortcuts([profileShortcut, ...shortcuts]);
    } else {
      setStaticShortcuts(shortcuts);
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
    const id = file.is_shortcut ? file.original_id || file.id : file.id;
    if (id === 'agent-icon') {
      setIsAgentModalOpen(true);
      return;
    }
    if (id === 'tasks-shortcut') {
      const windowId = `tasks-${Date.now()}`;
      setOpenWindows(prev => [
        ...prev,
        {
          id: windowId,
          type: 'tasks',
          isMaximized: false,
          zIndex: windowZIndex,
          position: nextWindowPosition,
          width: 800,
          height: 400,
        },
      ]);
      setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
      setWindowZIndex(prev => prev + 1);
      return;
    }
    if (id === 'calculator-shortcut') {
      const windowId = `calculator-${Date.now()}`;
      setOpenWindows(prev => [
        ...prev,
        {
          id: windowId,
          type: 'calculator',
          isMaximized: false,
          zIndex: windowZIndex,
          position: nextWindowPosition,
          width: 300,
          height: 400,
        },
      ]);
      setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
      setWindowZIndex(prev => prev + 1);
      return;
    }
    if (id === 'contract-creator-shortcut') {
      const windowId = `contract-creator-${Date.now()}`;
      setOpenWindows(prev => [
        ...prev,
        {
          id: windowId,
          type: 'contract-creator',
          isMaximized: false,
          zIndex: windowZIndex,
          position: nextWindowPosition,
          width: 800,
          height: 600,
        },
      ]);
      setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
      setWindowZIndex(prev => prev + 1);
      return;
    }
    if (id === 'notepad-shortcut') {
      const windowId = `notepad-${Date.now()}`;
      setOpenWindows(prev => [
        ...prev,
        {
          id: windowId,
          type: 'notepad',
          isMaximized: false,
          zIndex: windowZIndex,
          position: nextWindowPosition,
          content: '',
          width: 500,
          height: 400,
        },
      ]);
      setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
      setWindowZIndex(prev => prev + 1);
      return;
    }
    if (id === 'stripe-analytics') {
      const windowId = `app-stripe-analytics-${Date.now()}`;
      setOpenWindows(prev => [
        ...prev,
        {
          id: windowId,
          type: 'app',
          app: { id: 'stripe-analytics', name: 'Stripe Analytics' },
          isMaximized: false,
          zIndex: windowZIndex,
          position: nextWindowPosition,
          width: 800,
          height: 600,
        },
      ]);
      setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
      setWindowZIndex(prev => prev + 1);
      return;
    }
    if (file.content) {
      const windowId = `notepad-${Date.now()}`;
      setOpenWindows(prev => [
        ...prev,
        {
          id: windowId,
          type: 'notepad',
          isMaximized: false,
          zIndex: windowZIndex,
          position: nextWindowPosition,
          content: file.content,
          width: 500,
          height: 400,
        },
      ]);
      setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
      setWindowZIndex(prev => prev + 1);
      return;
    }
    if (file.url) {
        const windowId = `app-${file.id || file.name}-${Date.now()}`;
        setOpenWindows(prev => [
          ...prev,
          {
            id: windowId,
            type: 'app',
            app: file,
            isMaximized: false,
            zIndex: windowZIndex,
            position: nextWindowPosition,
            width: 800,
            height: 600,
          },
        ]);
        setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
        setWindowZIndex(prev => prev + 1);
    } else if (file.type === 'folder') {
      const windowId = `finder-${file.id}-${Date.now()}`;
      setOpenWindows(prev => [
        ...prev,
        {
          id: windowId,
          type: 'finder',
          title: file.name,
          folder: file,
          isMaximized: false,
          zIndex: windowZIndex,
          position: nextWindowPosition,
          width: 800,
          height: 400,
        },
      ]);
      setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
      setWindowZIndex(prev => prev + 1);
    }
  };

  const handleAppClick = (app) => {
    if (app.url) {
      const windowId = `app-${app.id}-${Date.now()}`;
      setOpenWindows(prev => [
        ...prev,
        {
          id: windowId,
          type: 'app',
          app: app,
          isMaximized: false,
          zIndex: windowZIndex,
          position: nextWindowPosition,
          width: 800,
          height: 600,
        },
      ]);
      setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
      setWindowZIndex(prev => prev + 1);
    } else if (app.name === 'Finder') {
      const windowId = `finder-main-${Date.now()}`;
      setOpenWindows(prev => [
        ...prev,
        {
          id: windowId,
          type: 'finder',
          title: 'Finder',
          folder: null,
          isMaximized: false,
          zIndex: windowZIndex,
          position: nextWindowPosition,
          width: 800,
          height: 400,
        },
      ]);
      setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
      setWindowZIndex(prev => prev + 1);
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

  const handleWindowDrag = (windowId, e, info) => {
    setOpenWindows(prev =>
      prev.map(w => {
        if (w.id === windowId) {
          const newPosition = {
            top: w.position.top + info.delta.y,
            left: w.position.left + info.delta.x,
          };

          const buffer = 100;
          if (newPosition.left + (w.width || 800) > canvasSize.width - buffer) {
            setCanvasSize(prev => ({ ...prev, width: prev.width + 500 }));
          }
          if (newPosition.top + (w.height || 600) > canvasSize.height - buffer) {
            setCanvasSize(prev => ({ ...prev, height: prev.height + 500 }));
          }

          return { ...w, position: newPosition };
        }
        return w;
      })
    );
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

  const handlePlayYoutubeVideo = (videoId) => {
    setYoutubePlayerId(videoId);
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
      className={`relative dot-grid ${
        theme === 'light' ? 'bg-[#ededed]' : 'bg-[#0a0a0a]'
      }`}
      style={{ width: canvasSize.width, height: canvasSize.height }}
      onMouseDown={(e) => {
        if (isDrawingMode) return;
        if (e.target === e.currentTarget) {
          setIsPannable(true);
          setPanStart({ x: e.clientX, y: e.clientY });
        }
      }}
      onMouseMove={(e) => {
        if (isDrawingMode) return;
        if (isPannable) {
          const dx = e.clientX - panStart.x;
          const dy = e.clientY - panStart.y;
          setPanOffset({ x: panOffset.x + dx, y: panOffset.y + dy });
          setPanStart({ x: e.clientX, y: e.clientY });
        }
      }}
      onMouseUp={() => {
        setIsPannable(false);
      }}
      onTouchStart={(e) => {
        if (isDrawingMode) return;
        if (e.target === e.currentTarget) {
          setIsPannable(true);
          setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }
      }}
      onTouchMove={(e) => {
        if (isDrawingMode) return;
        if (isPannable) {
          const dx = e.touches[0].clientX - panStart.x;
          const dy = e.touches[0].clientY - panStart.y;
          setPanOffset({ x: panOffset.x + dx, y: panOffset.y + dy });
          setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }
      }}
      onTouchEnd={() => {
        setIsPannable(false);
      }}
      onClick={() => setIsWiggleMode(false)}
    >
      <ConnectionsLayer connections={connections} openWindows={openWindows} newConnection={newConnection} />
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
      >
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
        <StatusBar
          onSearchClick={handleSearchClick}
          onMarkerClick={() => setIsDrawingMode(!isDrawingMode)}
          isDrawingMode={isDrawingMode}
          onColorChange={setDrawingColor}
          onSizeChange={setDrawingSize}
          onToolChange={setDrawingTool}
        />
        <div
          className="relative z-10 h-full"
          style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
        >
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0"
            style={{
              zIndex: windowZIndex + 1,
              pointerEvents: isDrawingMode ? 'auto' : 'none',
            }}
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            onMouseLeave={finishDrawing}
            onTouchStart={startDrawing}
            onTouchEnd={finishDrawing}
          />
          {/* Test button removed */}

        {/* Desktop Icons */}
        <div className="absolute inset-0 pt-7 pb-20" style={{ paddingRight: '80px', paddingBottom: '80px' }}>
          {[...staticShortcuts, ...desktopFiles].filter(file => !file.isHidden).map((file) => (
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
                position={window.position}
                onClick={() => bringToFront(window.id)}
                onPin={handlePin}
                onFileDoubleClick={handleDesktopIconDoubleClick}
                initialUrl={window.url}
                onDragEnd={(e, info) => handleWindowDrag(window.id, e, info)}
                windowId={window.id}
                onConnectorMouseDown={handleConnectorMouseDown}
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
                position={window.position}
                onClick={() => bringToFront(window.id)}
                automation={window.automation}
                onDragEnd={(e, info) => handleWindowDrag(window.id, e, info)}
                windowId={window.id}
                onConnectorMouseDown={handleConnectorMouseDown}
              />
            );
          }
          if (window.type === 'calculator') {
            return (
              <CalculatorWindow
                key={window.id}
                isOpen={!minimizedWindows.includes(window.id)}
                onClose={() => closeWindow(window.id)}
                zIndex={window.zIndex}
                position={window.position}
                onClick={() => bringToFront(window.id)}
                windowId={window.id}
                onConnectorMouseDown={handleConnectorMouseDown}
              />
            );
          }
          if (window.type === 'contract-creator') {
            return (
              <ContractCreatorWindow
                key={window.id}
                isOpen={!minimizedWindows.includes(window.id)}
                onClose={() => closeWindow(window.id)}
                zIndex={window.zIndex}
                position={window.position}
                onClick={() => bringToFront(window.id)}
                windowId={window.id}
                onConnectorMouseDown={handleConnectorMouseDown}
              />
            );
          }
          if (window.type === 'notepad') {
            return (
              <NotepadWindow
                key={window.id}
                isOpen={!minimizedWindows.includes(window.id)}
                onClose={() => closeWindow(window.id)}
                zIndex={window.zIndex}
                position={window.position}
                content={window.content}
                title="Notepad"
                onClick={() => bringToFront(window.id)}
                windowId={window.id}
                onConnectorMouseDown={handleConnectorMouseDown}
              />
            );
          }
          if (window.type === 'tasks') {
            return (
              <TasksWindow
                key={window.id}
                isOpen={!minimizedWindows.includes(window.id)}
                onClose={() => closeWindow(window.id)}
                zIndex={window.zIndex}
                position={window.position}
                onClick={() => bringToFront(window.id)}
                windowId={window.id}
                onConnectorMouseDown={handleConnectorMouseDown}
              />
            );
          }
          return null;
        })}



        <AgentModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)} />

        <ExplorerWindow
          isOpen={explorerWindow.isOpen}
          onClose={() => setExplorerWindow({ isOpen: false, content: '' })}
          title="Research Results"
          content={explorerWindow.content}
          zIndex={windowZIndex}
          position={nextWindowPosition}
          onClick={() => bringToFront('explorer-window')}
          windowId={'explorer-window'}
          onConnectorMouseDown={handleConnectorMouseDown}
        />

        <ImageViewerWindow
          isOpen={imageViewerWindow.isOpen}
          onClose={() => setImageViewerWindow({ isOpen: false, imageData: '' })}
          title="Generated Image"
          imageData={imageViewerWindow.imageData}
          zIndex={windowZIndex}
          position={nextWindowPosition}
          onClick={() => bringToFront('image-viewer-window')}
          windowId={'image-viewer-window'}
          onConnectorMouseDown={handleConnectorMouseDown}
        />

        <TableWindow
          isOpen={tableWindow.isOpen}
          onClose={() => setTableWindow({ isOpen: false, data: { headers: [], rows: [] } })}
          title="Table"
          data={tableWindow.data}
          zIndex={windowZIndex}
          position={nextWindowPosition}
          onClick={() => bringToFront('table-window')}
          windowId={'table-window'}
          onConnectorMouseDown={handleConnectorMouseDown}
        />

        </div>
        <SearchWindow
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          zIndex={openWindows.find(w => w.id === 'search-window')?.zIndex || 10}
          onClick={() => bringToFront('search-window')}
          onFileOpen={handleDesktopIconDoubleClick}
          onPlayYoutubeVideo={handlePlayYoutubeVideo}
        />
        <YouTubePlayer
          videoId={youtubePlayerId}
          onClose={() => setYoutubePlayerId(null)}
          zIndex={windowZIndex + 1}
        />
        <Dock onClick={handleAppClick} onDrop={handleDropFromDock} ref={dockRef} />
      </div>
    </div>
  );
}
