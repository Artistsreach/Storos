import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Wifi, Battery, Search, Sun, Moon, Pencil, Eraser, Check, Type, Square } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { GeminiDesktopLive } from '../../lib/geminiDesktopLive.js';
import { File } from '../../entities/File';

export default function StatusBar({
  onSearchClick,
  onMarkerClick,
  isDrawingMode,
  onColorChange,
  onSizeChange,
  onToolChange,
  trashEnabled,
  onToggleTrash,
}) {
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [geminiLive, setGeminiLive] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showDrawingOptions, setShowDrawingOptions] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleMarkerClick = () => {
    onMarkerClick();
    setShowDrawingOptions(!showDrawingOptions);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleGeminiClick = async () => {
    if (isRecording) {
      geminiLive.stopRecording();
      setIsRecording(false);
      try { delete window.__geminiLive; } catch (_) {}
      window.dispatchEvent(new CustomEvent('gemini-live-status', { detail: { enabled: false } }));
    } else {
      const newGeminiLive = new GeminiDesktopLive(
        import.meta.env.VITE_GEMINI_API_KEY,
        (message) => {
          // GeminiDesktopLive already dispatches 'gemini-live-text' and tool-call events.
          // Keep this hook for future UI side-effects if needed.
        },
        (error) => console.error('onError', error),
        () => console.log('onOpen'),
        () => console.log('onClose')
      );
      await newGeminiLive.init();
      newGeminiLive.startRecording();
      setGeminiLive(newGeminiLive);
      setIsRecording(true);
      window.__geminiLive = newGeminiLive;
      window.dispatchEvent(new CustomEvent('gemini-live-status', { detail: { enabled: true } }));
    }
  };

  const statusBarClasses = `
    fixed top-0 left-0 right-0 h-7 backdrop-blur-xl 
    flex justify-between items-center px-4 z-50
    ${theme === 'light' ? 'bg-white/30 text-gray-800' : 'bg-black/20 text-white'}
  `;

  return (
    <div className={statusBarClasses}>
      {/* Left side - Apple Menu and app name */}
      <div className="flex items-center space-x-4 relative" ref={menuRef}>
        <button onClick={() => setMenuOpen((v) => !v)} className="focus:outline-none">
          <img
            src={
              theme === 'light'
                ? 'https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Untitled%20design.png'
                : 'https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Untitled%20design%20(4).png'
            }
            alt="logo"
            className="w-4 h-4 flex-shrink-0"
          />
        </button>
        <span className="font-semibold">FreshFront</span>

        {menuOpen && (
          <div className={`absolute top-6 left-0 mt-1 w-40 rounded-md shadow-lg border ${theme === 'light' ? 'bg-white text-gray-800 border-gray-200' : 'bg-gray-800 text-white border-gray-700'}`}>
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              onClick={async () => {
                try {
                  const posY = Math.round(window.innerHeight * 0.5);
                  const newFolder = {
                    name: 'New Folder',
                    type: 'folder',
                    parent_id: null,
                    position_x: 60,
                    position_y: posY,
                    is_shortcut: true,
                    is_renaming: true,
                  };
                  await File.create(newFolder);
                  window.dispatchEvent(new CustomEvent('refresh-desktop-files'));
                } catch (e) {
                  console.error('Failed to create folder:', e);
                } finally {
                  setMenuOpen(false);
                }
              }}
            >
              New Folder
            </button>
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              onClick={() => {
                onToggleTrash && onToggleTrash();
                setMenuOpen(false);
              }}
            >
              {trashEnabled ? 'Hide Trash Bin' : 'Show Trash Bin'}
            </button>
          </div>
        )}
      </div>

      {/* Right side - System controls w/ time and battery */}
      <div className="flex items-center space-x-3">
        <button onClick={handleGeminiClick} className="focus:outline-none">
          <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </button>
        <button onClick={toggleTheme} className="focus:outline-none">
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
        <button onClick={onSearchClick} className="flex items-center space-x-1 focus:outline-none">
          <Search className="w-4 h-4" />
        </button>
        <button onClick={handleMarkerClick} className="flex items-center space-x-1 focus:outline-none">
          {isDrawingMode ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
        </button>
        {showDrawingOptions && isDrawingMode && (
          <div className="flex items-center space-x-2">
            <button onClick={() => onToolChange('select')} className="focus:outline-none" title="Select">
              <Square className="w-4 h-4" />
            </button>
            <button onClick={() => onToolChange('pencil')} className="focus:outline-none">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => onToolChange('eraser')} className="focus:outline-none">
              <Eraser className="w-4 h-4" />
            </button>
            <button onClick={() => onToolChange('text')} className="focus:outline-none">
              <Type className="w-4 h-4" />
            </button>
            <input
              type="color"
              onChange={(e) => onColorChange(e.target.value)}
              className="w-6 h-6"
            />
            <input
              type="range"
              min="1"
              max="20"
              defaultValue="5"
              onChange={(e) => onSizeChange(e.target.value)}
              className="w-20"
            />
          </div>
        )}
        <div className="hidden sm:flex items-center space-x-1">
          <Wifi className="w-4 h-4" />
        </div>
        <div className="hidden sm:flex items-center space-x-1">
          <Battery className="w-4 h-4" fill="lightgreen" />
        </div>
        <span className="text-sm leading-none">{formatTime(currentTime)}</span>
        <span className="text-sm leading-none">{formatDate(currentTime)}</span>
      </div>
    </div>
  );
}
