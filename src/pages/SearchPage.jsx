import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Heart, Sun, Moon } from 'lucide-react';
import { Switch } from '../components/ui/switch';
import StoreList from '../components/StoreList';
import WishlistModal from '../components/WishlistModal';

const SearchPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ededed] dark:bg-[#0a0a0a]">
      <header className="w-full py-4 px-6 flex justify-between items-center sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <Button onClick={() => setIsWishlistOpen(true)} variant="ghost" size="icon">
          <Heart className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Switch
            id="theme-switcher-desktop"
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            aria-label="Toggle dark mode"
          />
          {isDarkMode ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
        </div>
      </header>
      <div className="container mx-auto">
        <StoreList hideStoresOnEmptySearch={true} isDarkMode={isDarkMode} />
      </div>
      <WishlistModal isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </div>
  );
};

export default SearchPage;
