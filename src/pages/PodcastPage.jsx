import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
import { Progress } from "@/components/ui/progress";
import { generateImage } from '@/lib/geminiImageGeneration';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredits, canDeductCredits } from '@/lib/credits';
import CreditsDisplay from '@/components/CreditsDisplay';

const PodcastPage = () => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [podcasts, setPodcasts] = useState([]);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    const storedPodcasts = JSON.parse(localStorage.getItem('podcasts') || '[]');
    setPodcasts(storedPodcasts);
  }, []);

  useEffect(() => {
    if (selectedPodcast) {
      setTranscript(selectedPodcast.transcript);
      setCoverImageUrl(selectedPodcast.coverImageUrl);
      setAudioUrl(selectedPodcast.audioUrl);
    }
  }, [selectedPodcast]);

  const generateCoverImage = async (topic) => {
    setLogs(prev => [...prev, "Generating cover image..."]);
    const { imageData } = await generateImage(`Create a visually appealing podcast cover image for a podcast about ${topic}.`);
    const imageUrl = `data:image/png;base64,${imageData}`;
    setCoverImageUrl(imageUrl);
    setLogs(prev => [...prev, "Cover image generated."]);
    return imageUrl;
  };

  const generateAudio = async (text, imageUrl) => {
    setLogs(prev => [...prev, "Generating audio..."]);
    setProgress(75);

    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/1SM7GgM6IMuvQlz2BwM3/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": "sk_2997175c9f408b4579a544d993417bb0069872fa26c748e8",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2"
      })
    });

    const audioBlob = await response.blob();
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64data = reader.result;
      const newPodcast = {
        coverImageUrl: imageUrl,
        audioUrl: base64data,
        transcript,
        topic,
        createdAt: new Date().toISOString(),
      };
      const updatedPodcasts = [newPodcast, ...podcasts];
      setPodcasts(updatedPodcasts);
      localStorage.setItem('podcasts', JSON.stringify(updatedPodcasts));
    };

    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    setSelectedPodcast({ ...newPodcast, audioUrl: url });
    setLogs(prev => [...prev, "Audio generated."]);
    setProgress(100);
  };

  const handleCreate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setAudioUrl('');
    setLogs([]);
    setProgress(0);
    setSelectedPodcast(null);

    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

    try {
      const hasEnoughCredits = await canDeductCredits(user.uid, 10);
      if (!hasEnoughCredits) {
        setLogs(prev => [...prev, "You don't have enough credits to create a podcast."]);
        setIsLoading(false);
        return;
      }
      setLogs(prev => [...prev, "Generating transcript..."]);
      setProgress(25);
      const transcriptResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a short, conversational-style solo podcast script about ${topic}. The output should be only the dialogue, without any speaker names, titles, or other text.`,
      });
      const generatedTranscript = transcriptResponse.text;
      setTranscript(generatedTranscript);
      setLogs(prev => [...prev, "Transcript generated."]);
      setProgress(50);

      const imageUrl = await generateCoverImage(topic);
      await generateAudio(generatedTranscript, imageUrl);
      await deductCredits(user.uid, 10);
    } catch (error) {
      console.error("Error generating podcast:", error);
      setLogs(prev => [...prev, "Error generating podcast."]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = (createdAt) => {
    const updatedPodcasts = podcasts.filter(p => p.createdAt !== createdAt);
    setPodcasts(updatedPodcasts);
    localStorage.setItem('podcasts', JSON.stringify(updatedPodcasts));
  };

  return (
    <>
      <CreditsDisplay />
      <div className={`flex flex-col items-center min-h-screen bg-neutral-100 dark:bg-neutral-900 relative text-neutral-900 dark:text-neutral-100 pt-20 ${podcasts.length === 0 ? 'justify-center' : ''}`}>
      <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => selectedPodcast ? setSelectedPodcast(null) : window.history.back()}>
        <ArrowLeft />
      </Button>
      {!selectedPodcast && !isLoading && (
        <>
          <div className="w-full max-w-md p-8 space-y-6">
            <div className="flex justify-center items-center">
              <img
                src={isDarkMode
                    ? "https://static.wixstatic.com/media/bd2e29_20f2a8a94b7e492a9d76e0b8b14e623b~mv2.png"
                    : "https://static.wixstatic.com/media/bd2e29_695f70787cc24db4891e63da7e7529b3~mv2.png"}
                alt="FreshFront Logo"
                className="h-8 w-auto mr-2"
              />
              <h1 className="text-3xl font-bold text-center">Create a Podcast</h1>
            </div>
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
          {podcasts.length > 0 && (
            <div className="w-full max-w-6xl mx-auto p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {podcasts.map((podcast, index) => (
                  <div key={index} className="bg-white dark:bg-neutral-800 rounded-lg shadow-md">
                    <div className="relative">
                      <img src={podcast.coverImageUrl} alt="Podcast Cover" className="w-full h-48 object-cover cursor-pointer rounded-t-lg" onClick={() => setSelectedPodcast(podcast)} />
                      <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75" onClick={() => handleRemove(podcast.createdAt)}>
                        X
                      </Button>
                    </div>
                    <div className="p-4">
                      <audio controls src={podcast.audioUrl} className="w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {isLoading && (
        <div className="w-full max-w-md p-8 space-y-6 flex flex-col items-center">
          <Progress value={progress} className="w-full" />
          <div className="text-center">
            {logs.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
        </div>
      )}
      {selectedPodcast && !isLoading && (
        <div className="w-full max-w-4xl p-4 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="w-full">
              {selectedPodcast.coverImageUrl && <img src={selectedPodcast.coverImageUrl} alt="Podcast Cover" className="w-full h-auto rounded-2xl shadow-2xl" />}
            </div>
            <div className="w-full space-y-4">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full h-64 p-4 border rounded-2xl bg-neutral-200/50 dark:bg-neutral-800/50 border-neutral-300 dark:border-neutral-700 text-sm"
                placeholder="Your podcast transcript..."
              />
              <audio controls src={audioUrl} className="w-full" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button onClick={() => setSelectedPodcast(null)} className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg">
                  Back
                </Button>
                <Button onClick={() => generateAudio(transcript, coverImageUrl)} className="w-full bg-purple-600 hover:bg-purple-700 rounded-lg">
                  Regenerate
                </Button>
                <a href={audioUrl} download="podcast.mp3" className="w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700 rounded-lg">
                    Download
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default PodcastPage;
