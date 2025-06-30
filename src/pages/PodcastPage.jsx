import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
import { Progress } from "@/components/ui/progress";

const PodcastPage = () => {
  const [topic, setTopic] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const handleCreate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setAudioUrl('');
    setLogs([]);
    setProgress(0);

    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

    try {
      setLogs(prev => [...prev, "Generating transcript..."]);
      setProgress(25);
      const transcriptResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Generate a short podcast transcript with two speakers, Joe and Jane, discussing ${topic}.`,
      });
      const transcript = transcriptResponse.text;
      setLogs(prev => [...prev, "Transcript generated."]);
      setProgress(50);

      setLogs(prev => [...prev, "Generating audio..."]);
      setProgress(75);
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: transcript,
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: 'Joe',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' }
                  }
                },
                {
                  speaker: 'Jane',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Puck' }
                  }
                }
              ]
            }
          }
        }
      });

      const data = ttsResponse.candidates[0].content.parts[0].inline_data.data;
      const byteCharacters = atob(data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const audioBlob = new Blob([byteArray], { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setLogs(prev => [...prev, "Audio generated."]);
      setProgress(100);
    } catch (error) {
      console.error("Error generating podcast:", error);
      setLogs(prev => [...prev, "Error generating podcast."]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-100 dark:bg-neutral-900 relative text-neutral-900 dark:text-neutral-100">
      <Link to="/" className="absolute top-4 left-4">
        <Button variant="ghost" size="icon">
          <ArrowLeft />
        </Button>
      </Link>
      {!audioUrl && !isLoading && (
        <div className="w-full max-w-md p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center">Create a Podcast</h1>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter a topic, ex. 2025 print on demand trends..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-neutral-200/50 dark:bg-neutral-800/50 rounded-[18px] border-neutral-300 dark:border-neutral-700"
            />
          </div>
          <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">
            Create
          </Button>
        </div>
      )}
      {isLoading && (
        <div className="w-full max-w-md p-8 space-y-6">
          <Progress value={progress} className="w-full" />
          <div className="text-center">
            {logs.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
        </div>
      )}
      {audioUrl && !isLoading && (
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-neutral-800 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center">Your Podcast</h1>
          <audio controls src={audioUrl} className="w-full" />
          <Button onClick={() => setAudioUrl('')} className="w-full bg-blue-600 hover:bg-blue-700">
            Go Back
          </Button>
        </div>
      )}
    </div>
  );
};

export default PodcastPage;
