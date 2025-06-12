import { useState, useEffect, useCallback } from 'react';

export const useSlideshow = (items, autoPlay = true, interval = 5000) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const next = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  }, [items.length]);

  const previous = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  }, [items.length]);

  const goTo = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);

  useEffect(() => {
    if (isPlaying && items.length > 1) {
      const timer = setInterval(next, interval);
      return () => clearInterval(timer);
    }
  }, [isPlaying, next, interval, items.length]);

  return {
    currentIndex,
    next,
    previous,
    goTo,
    play,
    pause,
    isPlaying
  };
};
