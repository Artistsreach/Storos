'use client';

import React, { useState, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useSearchParams } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function PlayPage() {
  const spline = useRef();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const storeName = searchParams.get('storeName') || 'Store Name';

  function onLoad(splineApp) {
    spline.current = splineApp;
    spline.current.setVariable('storeName', storeName);
  }

  const handleGenerateText = async () => {
    if (!prompt) return;
    setIsLoading(true);
    try {
      const functions = getFunctions();
      const generateText = httpsCallable(functions, 'generateText'); 
      const result = await generateText({ prompt });
      const assistantResponse = result.data.text;
      if (spline.current) {
        spline.current.setVariable('assistant', assistantResponse);
      }
    } catch (error) {
      console.error('Error generating text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative w-full h-screen">
      <Spline
        scene="https://prod.spline.design/yFIOdXedSXf3xr4m/scene.splinecode"
        onLoad={onLoad}
      />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md p-4">
        <div className="bg-background/80 backdrop-blur-md p-4 rounded-lg shadow-lg flex gap-2">
          <Input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt for the assistant..."
            disabled={isLoading}
          />
          <Button onClick={handleGenerateText} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </div>
    </main>
  );
}
