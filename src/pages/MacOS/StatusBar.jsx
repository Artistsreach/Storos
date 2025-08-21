import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Wifi, Battery, Search, Sun, Moon, Pencil, Eraser, Check, Type, Square } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { GeminiDesktopLive } from '../../lib/geminiDesktopLive.js';
import { File } from '../../entities/File';
import { Popover, PopoverTrigger, PopoverContent } from '../../components/ui/popover';

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
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

  // Mini calendar built from scratch to ensure weekday/date alignment
  const MiniCalendar = ({ value, onChange }) => {
    const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const startWeekday = startOfMonth.getDay(); // 0=Sun ... 6=Sat

    // Build 42 cells (6 weeks * 7 days) starting from the Sunday on/before the 1st
    const firstCellDate = new Date(startOfMonth);
    firstCellDate.setDate(firstCellDate.getDate() - startWeekday);

    const cells = Array.from({ length: 42 }, (_, i) => {
      const d = new Date(firstCellDate);
      d.setDate(firstCellDate.getDate() + i);
      return d;
    });

    const isSameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    const isToday = (d) => isSameDay(d, new Date());
    const inCurrentMonth = (d) => d.getMonth() === viewDate.getMonth();

    const header = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const monthLabel = viewDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    return (
      <div className="select-none">
        <div className="flex items-center justify-between mb-2 px-1">
          <button
            className="px-2 py-1 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          >
            ‹
          </button>
          <div className="text-sm font-medium">{monthLabel}</div>
          <button
            className="px-2 py-1 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          >
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-[11px] text-center mb-1 opacity-80">
          {header.map((h) => (
            <div key={h} className="py-1">{h}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, idx) => {
            const current = inCurrentMonth(d);
            const selected = value && isSameDay(d, value);
            const today = isToday(d);
            const base = 'w-8 h-8 flex items-center justify-center rounded-md text-sm cursor-pointer';
            const dim = current ? '' : ' opacity-40';
            const sel = selected ? (theme === 'light' ? ' bg-gray-900 text-white' : ' bg-white text-black') : '';
            const ring = !selected && today ? ' ring-1 ring-blue-500' : '';
            const hover = selected ? '' : ' hover:bg-gray-200 dark:hover:bg-gray-700';
            return (
              <button
                key={idx}
                className={`${base}${dim}${sel}${ring}${hover}`}
                onClick={() => onChange && onChange(new Date(d))}
                title={d.toDateString()}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

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
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-sm leading-none px-1 py-0.5 rounded hover:bg-white/20 focus:outline-none">
              {formatDate(currentTime)}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="p-2 w-auto">
            <MiniCalendar
              value={selectedDate}
              onChange={(d) => {
                setSelectedDate(d);
                setViewDate(d);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
