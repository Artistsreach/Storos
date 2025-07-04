import React, { useEffect } from 'react';

const GeminiLive = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/gemini-live/index.tsx';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <h1>Gemini Live</h1>
      <gdm-live-audio></gdm-live-audio>
    </div>
  );
};

export default GeminiLive;
