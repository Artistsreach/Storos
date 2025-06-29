import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateVideoWithVeo } from '@/lib/geminiVideoGeneration';
import { searchPexelsVideos } from '@/lib/pexels';
import { UploadCloud, Film, Search, Sparkles as AiIcon } from 'lucide-react'; // Using Film for Pexels
import { useStore } from '@/contexts/StoreContext'; // To get theme colors

const FreshReplaceVideoModal = ({ open, onOpenChange, storeId, currentVideoUrl, onVideoReplaced }) => {
  const { store } = useStore(); // Get current store for theme
  const primaryColor = store?.theme?.primaryColor || '#3B82F6'; // Default Fresh primary

  const [activeTab, setActiveTab] = useState('ai');
  
  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Pexels Search State
  const [pexelsQuery, setPexelsQuery] = useState('');
  const [pexelsVideo, setPexelsVideo] = useState(null); // Changed to single video
  const [isPexelsLoading, setIsPexelsLoading] = useState(false);
  const [pexelsError, setPexelsError] = useState(null);

  // Upload State
  const [uploadedVideoFile, setUploadedVideoFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setAiPrompt(''); setIsAiLoading(false); setAiError(null);
      setPexelsQuery(''); setPexelsVideo(null); setIsPexelsLoading(false); setPexelsError(null);
      setUploadedVideoFile(null); setUploadError(null); setIsUploading(false);
    }
  }, [open]);

  const handleAiGenerateVideo = async () => {
    if (!aiPrompt.trim()) { setAiError('Please enter a prompt.'); return; }
    setIsAiLoading(true); setAiError(null);
    try {
      const newVideoUrl = await generateVideoWithVeo(aiPrompt);
      if (onVideoReplaced) onVideoReplaced(newVideoUrl);
      onOpenChange(false); setAiPrompt('');
    } catch (err) { setAiError(err.message || 'Failed to generate video.'); }
    finally { setIsAiLoading(false); }
  };

  const handlePexelsSearch = async () => {
    if (!pexelsQuery.trim()) { setPexelsError('Please enter a search query.'); return; }
    setIsPexelsLoading(true); setPexelsError(null); setPexelsVideo(null);
    try {
      const result = await searchPexelsVideos(pexelsQuery);
      if (result.error) { setPexelsError(result.error); }
      else if (result.video) {
        setPexelsVideo(result.video);
      } else {
        setPexelsError('No video found for your query.');
      }
    } catch (err) { setPexelsError(err.message || 'Failed to search Pexels.'); }
    finally { setIsPexelsLoading(false); }
  };

  const handlePexelsVideoSelect = (videoUrl) => {
    if (onVideoReplaced && videoUrl) { onVideoReplaced(videoUrl); onOpenChange(false); }
    else { setPexelsError("Invalid video URL or handler missing."); }
  };

  const handleVideoFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { setUploadError("Max 50MB."); setUploadedVideoFile(null); return; }
      if (!file.type.startsWith('video/')) { setUploadError("Invalid file type."); setUploadedVideoFile(null); return; }
      setUploadedVideoFile(file); setUploadError(null);
    }
  };

  const handleConfirmUpload = () => {
    if (uploadedVideoFile && onVideoReplaced) {
      setIsUploading(true); setUploadError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        onVideoReplaced(reader.result); onOpenChange(false); setUploadedVideoFile(null); setIsUploading(false);
      };
      reader.onerror = () => { setUploadError("Failed to read file."); setIsUploading(false); };
      reader.readAsDataURL(uploadedVideoFile);
    } else { setUploadError("No file or handler missing."); }
  };

  const inputStyles = "w-full pl-3 pr-4 py-2.5 text-sm bg-white/70 dark:bg-slate-700/50 backdrop-blur-sm border-slate-300/70 dark:border-slate-600/70 rounded-xl focus:ring-primary/30 focus:border-primary/60 transition-colors text-slate-700 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400";
  const buttonBaseStyles = "rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-slate-800";
  const primaryButtonStyles = `${buttonBaseStyles} text-white`; // Primary color will be applied via style
  const outlineButtonStyles = `${buttonBaseStyles} border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700`;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[672px] bg-slate-50 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-white">Replace Hero Media</DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Current: <a href={currentVideoUrl} target="_blank" rel="noopener noreferrer" className="underline truncate block max-w-full" style={{color: primaryColor}}>{currentVideoUrl || 'No media set'}</a>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-6 pt-2 pb-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-lg mb-4">
            <TabsTrigger value="ai" className={`flex items-center justify-center gap-2 text-xs sm:text-sm py-2 px-3 rounded-md transition-colors ${activeTab === 'ai' ? 'text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`} style={activeTab === 'ai' ? {backgroundColor: primaryColor} : {}}>
              <AiIcon className="w-4 h-4" /> AI Generate
            </TabsTrigger>
            <TabsTrigger value="pexels" className={`flex items-center justify-center gap-2 text-xs sm:text-sm py-2 px-3 rounded-md transition-colors ${activeTab === 'pexels' ? 'text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`} style={activeTab === 'pexels' ? {backgroundColor: primaryColor} : {}}>
              <Film className="w-4 h-4" /> Pexels Video
            </TabsTrigger>
            <TabsTrigger value="upload" className={`flex items-center justify-center gap-2 text-xs sm:text-sm py-2 px-3 rounded-md transition-colors ${activeTab === 'upload' ? 'text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`} style={activeTab === 'upload' ? {backgroundColor: primaryColor} : {}}>
              <UploadCloud className="w-4 h-4" /> Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai" className="space-y-4">
            <div>
              <Label htmlFor="aiPrompt" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">AI Video Prompt</Label>
              <Input id="aiPrompt" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g., Serene beach with calm waves" disabled={isAiLoading} className={inputStyles} />
            </div>
            {aiError && <p className="text-xs text-red-500 text-center">{aiError}</p>}
            <DialogFooter className="justify-start pt-2">
              <Button className={outlineButtonStyles} onClick={() => onOpenChange(false)} disabled={isAiLoading}>Cancel</Button>
              <Button style={{backgroundColor: primaryColor}} className={primaryButtonStyles} onClick={handleAiGenerateVideo} disabled={isAiLoading || !aiPrompt.trim()}>
                {isAiLoading ? 'Generating...' : 'Generate Video'}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="pexels" className="space-y-4">
            <div className="flex gap-2 items-center">
              <Input id="pexelsQuery" value={pexelsQuery} onChange={(e) => setPexelsQuery(e.target.value)} placeholder="e.g., Nature, Business" disabled={isPexelsLoading} className={`${inputStyles} flex-grow`} />
              <Button style={{backgroundColor: primaryColor}} className={`${primaryButtonStyles} h-10`} onClick={handlePexelsSearch} disabled={isPexelsLoading || !pexelsQuery.trim()}>
                {isPexelsLoading ? 'Searching...' : <Search className="w-4 h-4"/>}
              </Button>
            </div>
            {pexelsError && <p className="text-xs text-red-500 text-center">{pexelsError}</p>}
            {isPexelsLoading && <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Loading video...</p>}
            
            {!isPexelsLoading && pexelsVideo && (
              <div className="flex justify-center">
                <div 
                  className="relative aspect-video rounded-md overflow-hidden cursor-pointer group border-2 border-transparent hover:border-primary transition-all w-full max-w-md" 
                  onClick={() => handlePexelsVideoSelect(pexelsVideo.videoUrl)} 
                  style={{'--hover-border-color': primaryColor}}
                >
                  <img src={pexelsVideo.imageUrl} alt={`Pexels video by ${pexelsVideo.photographer}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            )}
             <DialogFooter className="justify-start pt-2">
                <Button className={outlineButtonStyles} onClick={() => onOpenChange(false)} disabled={isPexelsLoading}>Cancel</Button>
             </DialogFooter>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div>
              <Label htmlFor="video-upload-input" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Select Video File (Max 50MB)</Label>
              <Input id="video-upload-input" type="file" accept="video/*" onChange={handleVideoFileUpload} className={`${inputStyles} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 dark:file:bg-primary/20 file:text-primary dark:file:text-primary-light hover:file:bg-primary/20 dark:hover:file:bg-primary/30`} style={{'--file-text-color': primaryColor}} disabled={isUploading} />
              {uploadedVideoFile && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Selected: {uploadedVideoFile.name} ({(uploadedVideoFile.size / 1024 / 1024).toFixed(2)} MB)</p>}
              {uploadError && <p className="text-xs text-red-500 text-center mt-1.5">{uploadError}</p>}
            </div>
            <DialogFooter className="justify-start pt-2">
              <Button className={outlineButtonStyles} onClick={() => onOpenChange(false)} disabled={isUploading}>Cancel</Button>
              <Button style={{backgroundColor: primaryColor}} className={primaryButtonStyles} onClick={handleConfirmUpload} disabled={isUploading || !uploadedVideoFile}>
                {isUploading ? 'Uploading...' : 'Confirm Upload'}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FreshReplaceVideoModal;
