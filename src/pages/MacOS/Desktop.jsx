import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

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
import VideoPlayerWindow from './VideoPlayerWindow';
import NotepadWindow from './NotepadWindow';
import TableWindow from './TableWindow';
import TasksWindow from './TasksWindow';
import CalculatorWindow from './CalculatorWindow';
import ContractCreatorWindow from './ContractCreatorWindow';
import BankWindow from './BankWindow';
import ChartWindow from './ChartWindow';
import DriveFileBrowser from './DriveFileBrowser';
import WorkspaceModal from './WorkspaceModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { deepResearch } from '../../lib/firecrawl';
import { generateImage } from '../../lib/geminiImageGeneration';
import { GoogleGenAI } from '@google/genai';
import { analyzeImageDataUrl } from '../../lib/analyzeImageWithGemini';
import { generateVideoWithVeoFromImage } from '../../lib/geminiVideoGeneration';
import { captureScreenPngDataUrl } from '../../lib/captureScreenshotClient';
import { captureElementPngDataUrl } from '../../lib/captureElement';

export default function Desktop() {
  const { theme, toggleTheme } = useTheme();
  const { profile } = useAuth();
  const [desktopFiles, setDesktopFiles] = useState([]);
  const [staticShortcuts, setStaticShortcuts] = useState([]);
  const [showTrash, setShowTrash] = useState(false);
  const [dockCustomApps, setDockCustomApps] = useState([]);
  const dockRef = useRef(null);
  const [openWindows, setOpenWindows] = useState([]);
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [windowZIndex, setWindowZIndex] = useState(10);
  const [nextWindowPosition, setNextWindowPosition] = useState({ top: 50, left: 50 });
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [youtubePlayerId, setYoutubePlayerId] = useState(null);
  const [isWiggleMode, setIsWiggleMode] = useState(false);
  const [explorerWindow, setExplorerWindow] = useState({ isOpen: false, content: '' });
  const [imageViewerWindow, setImageViewerWindow] = useState({ isOpen: false, imageData: '' });
  const [tableWindow, setTableWindow] = useState({ isOpen: false, data: { headers: [], rows: [] } });
  const [tableWindowZIndex, setTableWindowZIndex] = useState(10);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPannable, setIsPannable] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth * 2, height: window.innerHeight * 2 });
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const canvasRef = useRef(null);
  const selectionCanvasRef = useRef(null);
  const desktopRef = useRef(null);
  const trashRef = useRef(null);
  const contextRef = useRef(null);
  const selectionCtxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingColor, setDrawingColor] = useState('red');
  const [drawingSize, setDrawingSize] = useState(5);
  const [drawingTool, setDrawingTool] = useState('pencil');
  // Text tool state
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [textValue, setTextValue] = useState('');
  const textInputRef = useRef(null);
  // Selection tool state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null); // {x,y}
  const [selectionRect, setSelectionRect] = useState(null);   // {x,y,w,h}
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [dragStartPt, setDragStartPt] = useState(null); // {x,y}
  const [selectionOrigin, setSelectionOrigin] = useState(null); // {x,y}
  const [selectionImage, setSelectionImage] = useState(null); // ImageData
  const [sourceCleared, setSourceCleared] = useState(false);
  // Workspaces modal state
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  // Detect mobile and compute adjusted position shifted left by 250px on mobile
  useEffect(() => {
    const update = () => setIsMobile(window.matchMedia('(max-width: 640px)').matches);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  

  const adjustedNextWindowPosition = useMemo(() => {
    const shift = isMobile ? 250 : 0;
    return {
      top: nextWindowPosition.top,
      left: Math.max(0, (nextWindowPosition.left || 0) - shift),
    };
  }, [nextWindowPosition, isMobile]);

  // Open a dedicated video player window when ImageViewer dispatches 'open-video-window'
  useEffect(() => {
    const handleOpenVideo = (e) => {
      try {
        const { videoUrl, title } = e.detail || {};
        if (!videoUrl) return;
        const videoWindowId = `video-${Date.now()}`;
        setOpenWindows(prev => [
          ...prev,
          {
            id: videoWindowId,
            type: 'video',
            isMaximized: false,
            zIndex: windowZIndex + 1,
            position: adjustedNextWindowPosition,
            width: 960,
            height: 540,
            bottom: 0,
            title: title || 'Video',
            videoUrl,
          },
        ]);
        setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
        setWindowZIndex(prev => prev + 2);
      } catch (err) {
        console.error('Failed to open video window:', err);
      }
    };
    window.addEventListener('open-video-window', handleOpenVideo);
    return () => window.removeEventListener('open-video-window', handleOpenVideo);
  }, [adjustedNextWindowPosition, windowZIndex]);

  // Build an augmented list of windows that includes special windows rendered outside openWindows
  const allWindows = useMemo(() => {
    const extras = [];
    if (explorerWindow?.isOpen) {
      extras.push({ id: 'explorer-window', position: adjustedNextWindowPosition, width: 800, height: 400 });
    }
    if (imageViewerWindow?.isOpen) {
      extras.push({ id: 'image-viewer-window', position: adjustedNextWindowPosition, width: 800, height: 600 });
    }
    if (tableWindow?.isOpen) {
      extras.push({ id: 'table-window', position: adjustedNextWindowPosition, width: 800, height: 400 });
    }
    return [...openWindows, ...extras];
  }, [openWindows, explorerWindow, imageViewerWindow, tableWindow, adjustedNextWindowPosition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const context = canvas.getContext('2d');
      contextRef.current = context;
    }
    const selCanvas = selectionCanvasRef.current;
    if (selCanvas) {
      selCanvas.width = canvasSize.width;
      selCanvas.height = canvasSize.height;
      selectionCtxRef.current = selCanvas.getContext('2d');
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

  // ---- Workspace persistence helpers ----
  const WORKSPACES_KEY = 'ff_workspaces_v1';

  const listWorkspaces = () => {
    try {
      const raw = localStorage.getItem(WORKSPACES_KEY);
      if (!raw) return [];
      const obj = JSON.parse(raw);
      return Object.keys(obj).map((name) => ({
        name,
        updatedAt: obj[name]?.updatedAt || 0,
        thumbnailDataUrl: obj[name]?.thumbnailDataUrl || '',
      }));
    } catch (_) { return []; }
  };

  const serializeDesktop = () => {
    // Capture canvas snapshot (if available)
    let canvasDataUrl = '';
    try { canvasDataUrl = canvasRef.current?.toDataURL('image/png') || ''; } catch (_) {}
    return {
      version: 1,
      updatedAt: Date.now(),
      theme,
      desktopFiles,
      staticShortcuts,
      openWindows,
      minimizedWindows,
      windowZIndex,
      nextWindowPosition,
      dockCustomApps,
      showTrash,
      explorerWindow,
      imageViewerWindow,
      tableWindow,
      tableWindowZIndex,
      panOffset,
      isPannable,
      panStart,
      canvasSize,
      isDrawingMode,
      drawingColor,
      drawingSize,
      drawingTool,
      selectionRect,
      youtubePlayerId,
      isSearchOpen,
      canvasDataUrl,
    };
  };

  const saveWorkspace = async (name) => {
    if (!name || !name.trim()) throw new Error('Workspace name is required');
    const snap = serializeDesktop();
    // Capture a visual thumbnail of the entire desktop region
    try {
      const el = desktopRef.current || document.getElementById('root') || document.body;
      const thumb = await captureElementPngDataUrl(el, { backgroundColor: null, scale: 0.6 });
      snap.thumbnailDataUrl = thumb;
    } catch (_) {
      // fallback to canvas snapshot if element capture fails
      snap.thumbnailDataUrl = snap.canvasDataUrl || '';
    }
    const raw = localStorage.getItem(WORKSPACES_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[name] = snap;
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(all));
  };

  const deleteWorkspace = (name) => {
    const raw = localStorage.getItem(WORKSPACES_KEY);
    if (!raw) return;
    const all = JSON.parse(raw);
    delete all[name];
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(all));
  };

  const loadWorkspace = (name) => {
    const raw = localStorage.getItem(WORKSPACES_KEY);
    if (!raw) throw new Error('No saved workspaces');
    const all = JSON.parse(raw);
    const snap = all[name];
    if (!snap) throw new Error('Workspace not found');

    setDesktopFiles(snap.desktopFiles || []);
    setStaticShortcuts(snap.staticShortcuts || []);
    setOpenWindows(snap.openWindows || []);
    setMinimizedWindows(snap.minimizedWindows || []);
    setWindowZIndex(snap.windowZIndex || 10);
    setNextWindowPosition(snap.nextWindowPosition || { top: 50, left: 50 });
    setDockCustomApps(snap.dockCustomApps || []);
    setShowTrash(!!snap.showTrash);
    setExplorerWindow(snap.explorerWindow || { isOpen: false, content: '' });
    setImageViewerWindow(snap.imageViewerWindow || { isOpen: false, imageData: '' });
    setTableWindow(snap.tableWindow || { isOpen: false, data: { headers: [], rows: [] } });
    setTableWindowZIndex(snap.tableWindowZIndex || 10);
    setPanOffset(snap.panOffset || { x: 0, y: 0 });
    setIsPannable(!!snap.isPannable);
    setPanStart(snap.panStart || { x: 0, y: 0 });
    setCanvasSize(snap.canvasSize || { width: window.innerWidth * 2, height: window.innerHeight * 2 });
    setIsDrawingMode(!!snap.isDrawingMode);
    setDrawingColor(snap.drawingColor || 'red');
    setDrawingSize(snap.drawingSize || 5);
    setDrawingTool(snap.drawingTool || 'pencil');
    setSelectionRect(snap.selectionRect || null);
    setYoutubePlayerId(snap.youtubePlayerId || null);
    setIsSearchOpen(!!snap.isSearchOpen);

    // Restore canvas pixels after canvas is sized
    if (snap.canvasDataUrl) {
      setTimeout(() => {
        try {
          const img = new Image();
          img.onload = () => {
            const ctx = contextRef.current;
            if (ctx) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              ctx.drawImage(img, 0, 0);
            }
          };
          img.src = snap.canvasDataUrl;
        } catch (_) {}
      }, 0);
    }
  };

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
    // If select tool and clicking inside existing selection, start moving it
    if (drawingTool === 'select' && selectionRect) {
      const inside =
        offsetX >= selectionRect.x &&
        offsetX <= selectionRect.x + selectionRect.w &&
        offsetY >= selectionRect.y &&
        offsetY <= selectionRect.y + selectionRect.h;
      if (inside) {
        setIsDraggingSelection(true);
        setDragStartPt({ x: offsetX, y: offsetY });
        setSelectionOrigin({ x: selectionRect.x, y: selectionRect.y });
        // Cache image if not yet
        if (!selectionImage) {
          try {
            const img = contextRef.current.getImageData(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
            setSelectionImage(img);
          } catch (err) { /* ignore */ }
        }
        // Clear the source area on main canvas for clean drag preview if not already
        if (!sourceCleared && selectionRect.w > 0 && selectionRect.h > 0) {
          contextRef.current.clearRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
          setSourceCleared(true);
        }
        return;
      }
    }
    if (drawingTool === 'pencil' || drawingTool === 'eraser') {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      setIsDrawing(true);
      return;
    }
    if (drawingTool === 'text') {
      setTextPosition({ x: offsetX, y: offsetY });
      setTextValue('');
      setShowTextInput(true);
      // Focus the input after it's rendered
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 0);
      return;
    }
    if (drawingTool === 'select') {
      setIsSelecting(true);
      setSelectionStart({ x: offsetX, y: offsetY });
      setSelectionRect({ x: offsetX, y: offsetY, w: 0, h: 0 });
      return;
    }
  };

  const finishDrawing = (e) => {
    if (!isDrawingMode) return;
    e.stopPropagation();
    if (drawingTool === 'pencil' || drawingTool === 'eraser') {
      contextRef.current.closePath();
    }
    setIsDrawing(false);
    if (drawingTool === 'select') {
      if (isDraggingSelection) {
        // Commit the moved selection to the main canvas
        if (selectionImage && selectionRect) {
          contextRef.current.putImageData(selectionImage, selectionRect.x, selectionRect.y);
        }
        // Clear the overlay
        selectionCtxRef.current?.clearRect(0, 0, canvasSize.width, canvasSize.height);
        setIsDraggingSelection(false);
        setDragStartPt(null);
        setSelectionOrigin(null);
        setSelectionImage(null);
        setSourceCleared(false);
      }
      setIsSelecting(false);
    }
  };

  const draw = useCallback((e) => {
    if (!isDrawingMode) return;
    e.stopPropagation();
    const { offsetX, offsetY } = getEventPosition(e);
    if (drawingTool === 'pencil' && isDrawing) {
      contextRef.current.globalCompositeOperation = 'source-over';
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    } else if (drawingTool === 'eraser' && isDrawing) {
      contextRef.current.globalCompositeOperation = 'destination-out';
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    } else if (drawingTool === 'select' && isSelecting && selectionStart) {
      const x = Math.min(selectionStart.x, offsetX);
      const y = Math.min(selectionStart.y, offsetY);
      const w = Math.abs(offsetX - selectionStart.x);
      const h = Math.abs(offsetY - selectionStart.y);
      setSelectionRect({ x, y, w, h });
    } else if (drawingTool === 'select' && isDraggingSelection && selectionRect) {
      // Dragging existing selection
      const dx = offsetX - dragStartPt.x;
      const dy = offsetY - dragStartPt.y;
      const newX = (selectionOrigin?.x || 0) + dx;
      const newY = (selectionOrigin?.y || 0) + dy;
      setSelectionRect(prev => prev ? { ...prev, x: newX, y: newY } : prev);
      // Draw preview on overlay canvas
      const octx = selectionCtxRef.current;
      if (octx && selectionImage) {
        octx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        octx.putImageData(selectionImage, newX, newY);
      }
    }
  }, [isDrawing, isDrawingMode, drawingTool, isSelecting, selectionStart, isDraggingSelection, dragStartPt, selectionOrigin, selectionRect, selectionImage, canvasSize.width, canvasSize.height]);

  // Key handling for selection: Delete/Backspace clears area, Escape cancels
  useEffect(() => {
    const handleKey = (e) => {
      if (!isDrawingMode) return;
      if (!selectionRect) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const ctx = contextRef.current;
        if (ctx) {
          ctx.save();
          ctx.clearRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
          ctx.restore();
        }
        setSelectionRect(null);
        setSelectionStart(null);
        selectionCtxRef.current?.clearRect(0, 0, canvasSize.width, canvasSize.height);
        setIsDraggingSelection(false);
        setDragStartPt(null);
        setSelectionOrigin(null);
        setSelectionImage(null);
        setSourceCleared(false);
      } else if (e.key === 'Escape') {
        // If we had cleared the source for dragging, restore it to original place
        if (sourceCleared && selectionImage && selectionOrigin) {
          contextRef.current.putImageData(selectionImage, selectionOrigin.x, selectionOrigin.y);
        }
        selectionCtxRef.current?.clearRect(0, 0, canvasSize.width, canvasSize.height);
        setSelectionRect(null);
        setSelectionStart(null);
        setIsSelecting(false);
        setIsDraggingSelection(false);
        setDragStartPt(null);
        setSelectionOrigin(null);
        setSelectionImage(null);
        setSourceCleared(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isDrawingMode, selectionRect, sourceCleared, selectionImage, selectionOrigin, canvasSize.width, canvasSize.height]);

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
    const onRefresh = () => loadDesktopFiles();
    window.addEventListener('refresh-desktop-files', onRefresh);

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
      window.removeEventListener('refresh-desktop-files', onRefresh);
      window.removeEventListener('save-notepad', handleSaveNotepad);
    };
  }, [toggleTheme]);

  useEffect(() => {
    const handleToolCall = (event) => {
      // Normalize payload: it may be {name,args} or {functionCalls:[{name,args}]}
      let payload = event.detail;
      if (payload && Array.isArray(payload.functionCalls) && payload.functionCalls.length > 0) {
        payload = payload.functionCalls[0];
      }
      let name = payload?.name;
      let args = payload?.args;
      if (typeof args === 'string') {
        try { args = JSON.parse(args); } catch (_) { /* leave as string */ }
      }
      const findAndOpenFile = (fileId) => {
        const all = [...staticShortcuts, ...desktopFiles];
        const file = all.find(f => f.id === fileId);
        if (file) {
          handleDesktopIconDoubleClick(file);
        } else {
          console.warn(`File with id ${fileId} not found.`);
        }
      };

      const openAppWithAutomation = (fileId, automation) => {
        const all = [...staticShortcuts, ...desktopFiles];
        const file = all.find(f => f.id === fileId);
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
              position: adjustedNextWindowPosition,
            },
          ]);
          setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
          setWindowZIndex(prev => prev + 1);
      };

      switch (name) {
    case "createChart": {
      const { title, chartType = 'bar', data, options, source = 'data', prompt } = args || {};
      const windowId = `chart-${Date.now()}`;
      const initialConfig = {
        type: chartType,
        data: data || { labels: [], datasets: [] },
        options: options || {},
      };
      setOpenWindows(prev => [
        ...prev,
        {
          id: windowId,
          type: 'chart',
          isMaximized: false,
          zIndex: windowZIndex,
          position: adjustedNextWindowPosition,
          width: 700,
          height: 500,
          bottom: 0,
          title: title || 'Chart',
          config: initialConfig,
        },
      ]);
      setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
      setWindowZIndex(prev => prev + 1);

      if (source === 'screenshot') {
        (async () => {
          try {
            const captureDataUrl = await captureScreenPngDataUrl();
            // Optional: preview screenshot
            // setImageViewerWindow({ isOpen: true, imageData: captureDataUrl });
            const extractionPrompt = prompt || `Extract chart-ready JSON for Chart.js from the screenshot. Respond with ONLY a valid JSON object with keys: type, data, options. Example: {"type":"bar","data":{"labels":["A"],"datasets":[{"label":"L","data":[1]}]},"options":{"responsive":true}}. Use animations and helpful tooltips.`;
            const jsonText = await analyzeImageDataUrl(captureDataUrl, extractionPrompt);
            let parsed = null;
            try {
              // Some models may wrap JSON in markdown fences; strip them
              const cleaned = jsonText.trim().replace(/^```json\n?|```$/g, '');
              parsed = JSON.parse(cleaned);
            } catch (_) { /* fall back */ }
            if (parsed && typeof parsed === 'object') {
              setOpenWindows(prev => prev.map(w => w.id === windowId ? { ...w, config: parsed } : w));
            } else {
              // Keep initial config; optionally append note to title
              setOpenWindows(prev => prev.map(w => w.id === windowId ? { ...w, title: (w.title || 'Chart') + ' (using default config)' } : w));
            }
          } catch (err) {
            setOpenWindows(prev => prev.map(w => w.id === windowId ? { ...w, title: (w.title || 'Chart') + ` (capture failed)` } : w));
          }
        })();
      }
      break;
    }
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
          setImageViewerWindow({ isOpen: true, imageData: '', titlePrompt: args.prompt });
          generateImage(args.prompt).then(({ imageData }) => {
            setImageViewerWindow({ isOpen: true, imageData: `data:image/png;base64,${imageData}`, titlePrompt: args.prompt });
          });
          break;
        case "generateVideo": {
          // Open a Notepad window to show progress
          const windowId = `notepad-${Date.now()}`;
          setOpenWindows(prev => [
            ...prev,
            {
              id: windowId,
              type: 'notepad',
              isMaximized: false,
              zIndex: windowZIndex,
              position: adjustedNextWindowPosition,
              content: 'Generating image...\n',
              defaultEditing: false,
              width: 700,
              height: 520,
              bottom: 0,
            },
          ]);
          setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
          setWindowZIndex(prev => prev + 1);

          (async () => {
            try {
              const prompt = args?.prompt || '';
              if (!prompt) throw new Error('Missing prompt for generateVideo.');
              // 1) Generate image
              const { imageData } = await generateImage(prompt);
              // Open the image viewer with the generated image while the video generates
              setImageViewerWindow({ isOpen: true, imageData: `data:image/png;base64,${imageData}`, titlePrompt: prompt });
              setOpenWindows(prev => prev.map(w => w.id === windowId ? { ...w, content: (w.content || '') + 'Image generated. Starting image-to-video...\n' } : w));
              // 2) Animate image to video (assume PNG output)
              const mimeType = 'image/png';
              const videoUrl = await generateVideoWithVeoFromImage(prompt, imageData, mimeType);
              // Append URL to the log
              setOpenWindows(prev => prev.map(w => w.id === windowId ? { ...w, content: (w.content || '') + `Done! Video URL:\n${videoUrl}\n` } : w));
              // Open a dedicated video player window for playback
              const videoWindowId = `video-${Date.now()}`;
              setOpenWindows(prev => [
                ...prev,
                {
                  id: videoWindowId,
                  type: 'video',
                  isMaximized: false,
                  zIndex: windowZIndex + 1,
                  position: adjustedNextWindowPosition,
                  width: 960,
                  height: 540,
                  bottom: 0,
                  title: 'Generated Video',
                  videoUrl,
                },
              ]);
              setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
              setWindowZIndex(prev => prev + 2);
            } catch (err) {
              setOpenWindows(prev => prev.map(w => w.id === windowId ? { ...w, content: (w.content || '') + `Error: ${err?.message || err}` } : w));
            }
          })();
          break;
        }
        case "openNotepad":
          const windowId = `notepad-${Date.now()}`;
          setOpenWindows(prev => [
            ...prev,
            {
              id: windowId,
              type: 'notepad',
              isMaximized: false,
              zIndex: windowZIndex,
              position: adjustedNextWindowPosition,
              content: '',
              defaultEditing: false,
              width: 500,
              height: 400,
              bottom: 0,
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
          // Open the Table window and give it a dedicated zIndex so it can be stacked like other windows
          setTableWindow({ isOpen: true, data: { headers: [], rows: [] } });
          setTableWindowZIndex(windowZIndex);
          setWindowZIndex(prev => prev + 1);
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
              position: adjustedNextWindowPosition,
              width: 300,
              height: 400,
              bottom: 0,
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
              position: adjustedNextWindowPosition,
              width: 800,
              height: 600,
              bottom: 0,
            },
          ]);
          setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
          setWindowZIndex(prev => prev + 1);
          break;
        case "analyzeImage": {
          const windowId = `notepad-${Date.now()}`;
          // Open a Notepad window to stream results
          setOpenWindows(prev => [
            ...prev,
            {
              id: windowId,
              type: 'notepad',
              isMaximized: false,
              zIndex: windowZIndex,
              position: adjustedNextWindowPosition,
              content: 'Analyzing screenshot...\n\nPlease select a screen/window/tab when prompted.',
              defaultEditing: false,
              width: 600,
              height: 500,
              bottom: 0,
            },
          ]);
          setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
          setWindowZIndex(prev => prev + 1);
          (async () => {
            try {
              // 1) Try capturing the app's parent element (no permission prompt)
              const selector = args?.selector || '#root';
              let captureDataUrl;
              try {
                captureDataUrl = await captureElementPngDataUrl(selector, { backgroundColor: null });
              } catch (_) {
                // 2) Fallback: capture current screen/window/tab via Screen Capture API
                captureDataUrl = await captureScreenPngDataUrl();
              }
              // Show the captured image immediately in the mini image viewer window
              setImageViewerWindow({ isOpen: true, imageData: captureDataUrl });
              const prompt = args?.prompt || 'Analyze this screenshot and summarize key UI elements, active files, and obvious issues or next actions.';
              const insights = await analyzeImageDataUrl(captureDataUrl, prompt);
              setOpenWindows(prev => prev.map(w => w.id === windowId ? { ...w, content: insights } : w));
              // Also send the insights to the live agent and prompt it to speak to the user
              try {
                if (window.__geminiLive && window.__geminiLive.session) {
                  window.__geminiLive.session.sendClientContent({
                    turns: {
                      role: 'user',
                      parts: [{
                        text: `Please briefly speak to the user about what this screenshot shows and any obvious next steps.\n\nAnalysis:\n${insights}`
                      }]
                    },
                    turnComplete: true,
                  });
                }
              } catch (_) {
                // Ignore errors sending context to live agent
              }
            } catch (err) {
              const msg = (err?.message || String(err));
              const guidance = '\nHint: If element capture fails (due to cross-origin assets), allow the screen-capture prompt and select this tab/window.';
              setOpenWindows(prev => prev.map(w => w.id === windowId ? { ...w, content: `Error capturing/analyzing screenshot: ${msg}${guidance}` } : w));
            }
          })();
          break;
        }
        default:
          console.warn("Unknown tool call:", name);
      }
    };

    window.addEventListener('gemini-tool-call', handleToolCall);

    return () => {
      window.removeEventListener('gemini-tool-call', handleToolCall);
    };
  }, [desktopFiles, staticShortcuts, windowZIndex, nextWindowPosition]);

  // Connector/connection logic removed

  useEffect(() => {
    const shortcuts = [
      { id: 'agent-icon', name: 'Agent', icon: '💬', type: 'app', position_x: 220, position_y: 50 },
      { id: 'store-shortcut', name: 'Store', icon: '🛍️', url: 'https://freshfront.co/gen', type: 'link', is_shortcut: true, position_x: 219, position_y: 443 },
      { id: 'app-shortcut', name: 'App', icon: '📱', url: 'https://build.freshfront.co', type: 'app', is_shortcut: true, position_x: 221, position_y: 150 },
      { id: 'bank-shortcut', name: 'Bank', icon: '🏦', type: 'app', is_shortcut: true, position_x: 300, position_y: 148 },
      { id: 'video-shortcut', name: 'Video', icon: '🎥', url: 'https://studio.freshfront.co', type: 'app', is_shortcut: true, position_x: 125, position_y: 443 },
      { id: 'nft-shortcut', name: 'NFT', icon: '🎨', url: 'https://nft.freshfront.co', type: 'app', is_shortcut: true, position_x: 125, position_y: 345 },
      { id: 'podcast-shortcut', name: 'Podcast', icon: '🎙️', url: 'https://freshfront.co/podcast', type: 'app', is_shortcut: true, position_x: 25, position_y: 443 },
      { id: 'stripe-analytics', name: 'Stripe', icon: 'https://vraplbexttpgnpnvdutg.supabase.co/storage/v1/object/public/content/IMG_7057.png', type: 'app', is_shortcut: true, position_x: 219, position_y: 345 },
      { id: 'commandr-shortcut', name: 'Commandr', icon: '🤖', url: 'https://commandr.co/', type: 'app', is_shortcut: true, isHidden: true, position_x: 195, position_y: 420 },
      { id: 'tasks-shortcut', name: 'Tasks', icon: '📝', type: 'app', is_shortcut: true, position_x: 220, position_y: 250 },
      { id: 'tools-folder', name: 'Tools', icon: '📁', type: 'folder', is_shortcut: true, position_x: 300, position_y: 50 },
      { id: 'drive-shortcut', name: 'Drive', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png', type: 'app', is_shortcut: true, position_x: 305, position_y: 250 },
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
      const files = await File.filter({ parent_id: null });
      setDesktopFiles(files);
    } catch (error) {
      console.error('Error loading desktop files:', error);
    }
  };

  const handleDesktopIconDoubleClick = (file) => {
    // Open text files in Notepad
    if (file?.content) {
      const windowId = `notepad-${Date.now()}`;
      setOpenWindows(prev => [
        ...prev,
        {
          id: windowId,
          type: 'notepad',
          isMaximized: false,
          zIndex: windowZIndex,
          position: adjustedNextWindowPosition,
          content: file.content,
          width: 500,
          height: 400,
          defaultEditing: true,
        },
      ]);
      setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
      setWindowZIndex(prev => prev + 1);
      return;
    }

    // Open app/link shortcuts in AppWindow
    if (file?.url || file?.type === 'app' || file?.type === 'link') {
      const windowId = `app-${file.id || file.name}-${Date.now()}`;
      setOpenWindows(prev => [
        ...prev,
        {
          id: windowId,
          type: 'app',
          app: file,
          isMaximized: false,
          zIndex: windowZIndex,
          position: adjustedNextWindowPosition,
          width: 800,
          height: 600,
        },
      ]);
      setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
      setWindowZIndex(prev => prev + 1);
      return;
    }

    // Open folders in Finder window
    if (file?.type === 'folder') {
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
          position: adjustedNextWindowPosition,
          width: 800,
          height: 400,
        },
      ]);
      setNextWindowPosition(prev => ({ top: prev.top + 30, left: prev.left + 30 }));
      setWindowZIndex(prev => prev + 1);
      return;
    }

    // Open image files or image shortcuts in the ImageViewerWindow
    if (file?.type === 'file' && file?.icon === '🖼️') {
      let resolvedImageData = file.imageData || '';
      if (!resolvedImageData && file.is_shortcut && (file.original_id !== undefined && file.original_id !== null)) {
        const all = [...staticShortcuts, ...desktopFiles];
        const original = all.find(f => String(f.id) === String(file.original_id));
        if (original && original.imageData) {
          resolvedImageData = original.imageData;
        }
      }
      if (resolvedImageData) {
        setImageViewerWindow({ isOpen: true, imageData: resolvedImageData, titlePrompt: file.titlePrompt });
        return;
      }
    }
  };

const handleAppClick = (app) => {
  // If this dock item references a desktop file id, open it like a desktop icon
  if (app.fileId) {
    const all = [...staticShortcuts, ...desktopFiles];
    const file = all.find(f => String(f.id) === String(app.fileId));
    if (file) {
      handleDesktopIconDoubleClick(file);
      return;
    }
  }
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
        position: adjustedNextWindowPosition,
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
        position: adjustedNextWindowPosition,
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
    // Hide this app from the dock on drop
    setDockCustomApps(prev => {
      const exists = prev.find(p => p.id === app.id);
      if (exists) {
        return prev.map(p => p.id === app.id ? { ...p, hidden: true } : p);
      }
      return [...prev, { id: app.id, hidden: true }];
    });

    // Convert viewport coords to desktop-local coords
    let localX = x;
    let localY = y;
    try {
      const deskRect = desktopRef.current?.getBoundingClientRect?.();
      if (deskRect) {
        localX = x - deskRect.left;
        localY = y - deskRect.top;
      }
    } catch {}

    let icon = app.icon;
    if (React.isValidElement(icon)) {
      icon = icon.props.src;
    }
    // If a static shortcut exists with same name or URL, remove it to prevent a duplicate-looking pair
    const staticMatch = staticShortcuts.find(s => s.parent_id === undefined && (s.name === app.name || (!!s.url && s.url === app.url)));
    if (staticMatch) {
      setStaticShortcuts(prev => prev.filter(s => s.id !== staticMatch.id));
    }
    const originalId = app.fileId || app.id;
    // Idempotency: if a shortcut already exists for this originalId on the desktop, just move it
    const existing = desktopFiles.find(f => f.parent_id === null && f.is_shortcut && String(f.original_id) === String(originalId));
    if (existing) {
      const updated = await File.update(existing.id, { position_x: localX, position_y: localY });
      setDesktopFiles(prev => prev.map(f => f.id === existing.id ? { ...f, position_x: localX, position_y: localY } : f));
    } else {
      const newFile = {
        name: app.name,
        icon: icon,
        url: app.url,
        type: 'file',
        parent_id: null,
        position_x: localX,
        position_y: localY,
        is_shortcut: true,
        original_id: originalId,
      };
      const createdFile = await File.create(newFile);
      setDesktopFiles(prev => [...prev, createdFile]);
    }
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
    // If it's a persisted file (has a DB id), move it into the folder
    if (
      file &&
      file.id !== undefined &&
      typeof file.id === 'number'
    ) {
      // Move ANY persisted record (file or shortcut) by updating its parent_id.
      // This ensures the source item is not left on the desktop.
      await File.update(file.id, { parent_id: folder.id, position_x: null, position_y: null });
      // Remove from desktop in-memory list (desktop renders items with parent_id === null)
      setDesktopFiles(prev => prev.filter(f => f.id !== file.id));
    } else {
      // Static shortcut or non-persisted item: create a new shortcut inside the folder
      // Prevent duplicates: if a shortcut with the same original_id (or same url/name fallback)
      // already exists in the target folder, do nothing.
      const targetFolderId = folder.id;
      try {
        const existingInFolder = await File.filter({ parent_id: targetFolderId });
        const candidateOriginalId = file.original_id || file.id;
        const duplicateExists = existingInFolder.some((f) => {
          // Only consider shortcuts or items that represent the same app/link
          if (f.is_shortcut) {
            if (candidateOriginalId && f.original_id && String(f.original_id) === String(candidateOriginalId)) return true;
            if (file.url && f.url && String(f.url) === String(file.url)) return true;
            if (!file.url && !f.url && f.name && file.name && String(f.name).trim() === String(file.name).trim()) return true;
          }
          return false;
        });
        if (duplicateExists) {
          // Optionally, we could toast/notify here; for now, silently ignore.
          return;
        }
      } catch (e) {
        // If the duplicate check fails, proceed to create to avoid blocking UX.
      }
      let icon = file.icon;
      if (React.isValidElement(icon)) {
        icon = icon.props.src;
      }
      const newFile = {
        name: file.name,
        icon: icon,
        url: file.url,
        type: 'file',
        parent_id: folder.id,
        is_shortcut: true,
        original_id: file.original_id || file.id,
      };
      await File.create(newFile);
      // Remove the static shortcut instance from the desktop UI
      setStaticShortcuts(prev => prev.filter(f => f.id !== file.id));
    }
    // Notify open windows to refresh their contents
    window.dispatchEvent(new CustomEvent('refresh-desktop-files'));
  } catch (error) {
    console.error('Error dropping file on folder:', error);
  }
};

// Drop a desktop file/shortcut onto the Dock to pin it there
const handleDropOnDock = async (file) => {
  try {
    // Normalize icon to a primitive (string/emoji/url)
    let icon = file.icon;
    if (React.isValidElement(icon)) {
      icon = icon.props?.src || icon.props?.children || icon;
    }

    // Add or update a dock entry that references this file
    setDockCustomApps(prev => {
      const id = `dock-file-${file.id}`;
      const next = prev.filter(p => p.id !== id);
      return [
        ...next,
        {
          id,
          name: file.name,
          icon,
          url: file.url,
          fileId: file.id,
        },
      ];
    });

    // Remove from desktop: delete DB record if persisted, or remove static shortcut
    if (file && typeof file.id === 'number') {
      await File.delete(file.id);
      setDesktopFiles(prev => prev.filter(f => f.id !== file.id));
    } else {
      setStaticShortcuts(prev => prev.filter(s => s.id !== file.id));
    }
  } catch (error) {
    console.error('Error dropping file on dock:', error);
  }
};

// (trashRef is defined at top with useRef)

// Hide shortcuts/files dropped on Trash bin
const handleDropOnTrash = async (file) => {
  try {
    // Static shortcut (from staticShortcuts array): mark hidden in state
    if (file.parent_id === undefined) {
      setStaticShortcuts(prev => prev.map(s => s.id === file.id ? { ...s, isHidden: true } : s));
      return;
    }
    // DB-backed desktop item: set isHidden true and update local list
    await File.update(file.id, { isHidden: true });
    setDesktopFiles(prev => prev.map(f => f.id === file.id ? { ...f, isHidden: true } : f));
  } catch (e) {
    console.error('Error hiding file via Trash:', e);
  }
};

return (
  <div
    className={`relative dot-grid ${
      theme === 'light' ? 'bg-[#ededed]' : 'bg-[#0a0a0a]'
    }`}
    ref={desktopRef}
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
    onClick={(e) => {
      // Exit wiggle mode only when clicking the bare desktop background
      if (e.target === e.currentTarget) {
        setIsWiggleMode(false);
      }
    }}
  >
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
        trashEnabled={showTrash}
        onToggleTrash={() => setShowTrash(v => !v)}
        onOpenWorkspaces={() => setIsWorkspaceModalOpen(true)}
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
            onClick={() => setIsWiggleMode(false)}
          />
          {/* Overlay canvas for selection drag preview */}
          <canvas
            ref={selectionCanvasRef}
            className="absolute top-0 left-0"
            style={{
              zIndex: windowZIndex + 2,
              pointerEvents: 'none',
            }}
          />
          {selectionRect && isDrawingMode && drawingTool === 'select' && (
            <div
              className="absolute border border-blue-400/80 bg-blue-500/10"
              style={{
                left: selectionRect.x,
                top: selectionRect.y,
                width: selectionRect.w,
                height: selectionRect.h,
                zIndex: windowZIndex + 3,
                pointerEvents: 'none',
              }}
            />
          )}
          {showTextInput && isDrawingMode && drawingTool === 'text' && (
            <input
              ref={textInputRef}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const ctx = contextRef.current;
                  if (ctx && textValue.trim()) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.fillStyle = drawingColor;
                    const fontSize = Math.max(10, Number(drawingSize) * 4);
                    ctx.font = `${fontSize}px sans-serif`;
                    ctx.textBaseline = 'top';
                    ctx.fillText(textValue, textPosition.x, textPosition.y);
                    ctx.restore();
                  }
                  setShowTextInput(false);
                  setTextValue('');
                } else if (e.key === 'Escape') {
                  setShowTextInput(false);
                  setTextValue('');
                }
              }}
              onBlur={() => {
                const ctx = contextRef.current;
                if (ctx && textValue.trim()) {
                  ctx.save();
                  ctx.globalCompositeOperation = 'source-over';
                  ctx.fillStyle = drawingColor;
                  const fontSize = Math.max(10, Number(drawingSize) * 4);
                  ctx.font = `${fontSize}px sans-serif`;
                  ctx.textBaseline = 'top';
                  ctx.fillText(textValue, textPosition.x, textPosition.y);
                  ctx.restore();
                }
                setShowTextInput(false);
                setTextValue('');
              }}
              className="absolute bg-transparent outline-none border-b border-dashed"
              style={{
                top: textPosition.y,
                left: textPosition.x,
                color: drawingColor,
                fontSize: Math.max(10, Number(drawingSize) * 4),
                zIndex: windowZIndex + 2,
                minWidth: '8ch',
              }}
              placeholder="Type..."
            />
          )}
          {/* Test button removed */}

        {/* Desktop Icons */}
        <div
          className="absolute inset-0 pt-7 pb-20"
          style={{ paddingRight: '80px', paddingBottom: '80px' }}
          onClick={(e) => {
            // If user clicks blank area in the icons layer (not an icon), exit wiggle mode
            if (e.target === e.currentTarget) {
              setIsWiggleMode(false);
            }
          }}
        >
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
              onDropOnTrash={handleDropOnTrash}
              dockRef={dockRef}
              trashRef={trashRef}
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
                />
              );
            }
            if (window.type === 'drive') {
              return (
                <DriveFileBrowser
                  key={window.id}
                  isOpen={!minimizedWindows.includes(window.id)}
                  onClose={() => closeWindow(window.id)}
                  onMinimize={() => minimizeWindow(window.id)}
                  onMaximize={() => maximizeWindow(window.id)}
                  isMaximized={window.isMaximized}
                  zIndex={window.zIndex}
                  position={window.position}
                  onClick={() => bringToFront(window.id)}
                  onDragEnd={(e, info) => handleWindowDrag(window.id, e, info)}
                  windowId={window.id}
                />
              );
            }
            if (window.type === 'bank') {
              return (
                  <BankWindow
                    key={window.id}
                    isOpen={!minimizedWindows.includes(window.id)}
                    onClose={() => closeWindow(window.id)}
                    onMinimize={() => minimizeWindow(window.id)}
                    onMaximize={() => maximizeWindow(window.id)}
                    isMaximized={window.isMaximized}
                    zIndex={window.zIndex}
                    position={window.position}
                    onClick={() => bringToFront(window.id)}
                    onDragEnd={(e, info) => handleWindowDrag(window.id, e, info)}
                    windowId={window.id}
                  />
                );
              }
            if (window.type === 'agent') {
              return (
                  <AgentModal
                    key={window.id}
                    isOpen={!minimizedWindows.includes(window.id)}
                    onClose={() => closeWindow(window.id)}
                    zIndex={window.zIndex}
                    position={window.position}
                    onClick={() => bringToFront(window.id)}
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
                    />
                  );
                }
                if (window.type === 'video') {
                  return (
                      <VideoPlayerWindow
                        key={window.id}
                        isOpen={!minimizedWindows.includes(window.id)}
                        onClose={() => closeWindow(window.id)}
                        onMinimize={() => minimizeWindow(window.id)}
                        onMaximize={() => maximizeWindow(window.id)}
                        isMaximized={window.isMaximized}
                        zIndex={window.zIndex}
                        position={window.position}
                        onClick={() => bringToFront(window.id)}
                        onDragEnd={(e, info) => handleWindowDrag(window.id, e, info)}
                        windowId={window.id}
                        title={window.title}
                        videoUrl={window.videoUrl}
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
                        defaultEditing={window.defaultEditing}
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
                        />
                      );
                    }
                    if (window.type === 'chart') {
                      return (
                          <ChartWindow
                            key={window.id}
                            isOpen={!minimizedWindows.includes(window.id)}
                            onClose={() => closeWindow(window.id)}
                            onMinimize={() => minimizeWindow(window.id)}
                            onMaximize={() => maximizeWindow(window.id)}
                            isMaximized={window.isMaximized}
                            zIndex={window.zIndex}
                            position={window.position}
                            onClick={() => bringToFront(window.id)}
                            windowId={window.id}
                            title={window.title}
                            config={window.config}
                          />
                        );
                      }
                    return null;
                  })}

        <ExplorerWindow
          isOpen={explorerWindow.isOpen}
          onClose={() => setExplorerWindow({ isOpen: false, content: '' })}
          title="Research Results"
          content={explorerWindow.content}
          zIndex={windowZIndex}
          position={adjustedNextWindowPosition}
          onClick={() => bringToFront('explorer-window')}
          windowId={'explorer-window'}
        />

        <ImageViewerWindow
          isOpen={imageViewerWindow.isOpen}
          onClose={() => setImageViewerWindow({ isOpen: false, imageData: '' })}
          title="Generated Image"
          imageData={imageViewerWindow.imageData}
          titlePrompt={imageViewerWindow.titlePrompt}
          zIndex={windowZIndex}
          position={adjustedNextWindowPosition}
          onClick={() => bringToFront('image-viewer-window')}
          windowId={'image-viewer-window'}
        />

        <TableWindow
          isOpen={tableWindow.isOpen}
          onClose={() => setTableWindow({ isOpen: false, data: { headers: [], rows: [] } })}
          title="Table"
          data={tableWindow.data}
          zIndex={tableWindowZIndex}
          position={adjustedNextWindowPosition}
          onClick={() => {
            // Bring the table window to front using its own zIndex state
            setTableWindowZIndex(windowZIndex);
            setWindowZIndex(prev => prev + 1);
          }}
          windowId={'table-window'}
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
        <Dock onClick={handleAppClick} onDrop={handleDropFromDock} ref={dockRef} customApps={dockCustomApps} />
        {/* Trash Bin (toggle from StatusBar menu) */}
        {showTrash && (
          <div
            id="desktop-trash-bin"
            ref={trashRef}
            className="fixed right-4 bottom-24 w-16 h-16 rounded-lg flex items-center justify-center bg-black/20 dark:bg-white/10 border border-white/20 backdrop-blur-sm select-none"
            title="Trash"
            style={{ zIndex: 5 }}
          >
            <span style={{ fontSize: 28 }} role="img" aria-label="trash">🗑️</span>
          </div>
        )}
        <WorkspaceModal
          isOpen={isWorkspaceModalOpen}
          onClose={() => setIsWorkspaceModalOpen(false)}
          onSaveAs={(name) => saveWorkspace(name)}
          onOverwrite={(name) => saveWorkspace(name)}
          onLoad={(name) => loadWorkspace(name)}
          onDelete={(name) => deleteWorkspace(name)}
          listWorkspaces={listWorkspaces}
        />
      </div>
    </div>
  );
}
