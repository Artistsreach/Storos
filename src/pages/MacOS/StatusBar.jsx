import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wifi, Battery, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { GeminiDesktopLive } from '../../lib/geminiDesktopLive.js';

export default function StatusBar({ onSearchClick }) {
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [geminiLive, setGeminiLive] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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
    } else {
      const newGeminiLive = new GeminiDesktopLive(
        import.meta.env.VITE_GEMINI_API_KEY,
        (message) => console.log('onMessage', message),
        (error) => console.error('onError', error),
        () => console.log('onOpen'),
        () => console.log('onClose')
      );
      await newGeminiLive.init();
      newGeminiLive.startRecording();
      setGeminiLive(newGeminiLive);
      setIsRecording(true);
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
      <div className="flex items-center space-x-4">
        <Link to="/">
          <img
            src={
              theme === 'light'
                ? 'https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Untitled%20design.png'
                : 'https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Untitled%20design%20(4).png'
            }
            alt="logo"
            className="w-4 h-4 flex-shrink-0"
          />
        </Link>
        <span className="font-semibold">FreshFront</span> {/* This will likely be dynamic in a real app */}
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
