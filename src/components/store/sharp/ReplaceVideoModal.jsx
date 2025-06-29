import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateVideoWithVeo } from "@/lib/geminiVideoGeneration";
import { searchPexelsVideos } from "@/lib/pexels";
import { UploadCloud } from "lucide-react";

const ReplaceVideoModal = ({
  open,
  onOpenChange,
  storeId,
  currentVideoUrl,
  onVideoReplaced,
}) => {
  const [activeTab, setActiveTab] = useState("ai");

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Pexels Search State
  const [pexelsQuery, setPexelsQuery] = useState("");
  const [pexelsVideo, setPexelsVideo] = useState(null); // Changed to single video
  const [isPexelsLoading, setIsPexelsLoading] = useState(false);
  const [pexelsError, setPexelsError] = useState(null);

  // Upload State
  const [uploadedVideoFile, setUploadedVideoFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Reset states when modal opens or tab changes
  useEffect(() => {
    if (open) {
      setAiPrompt("");
      setIsAiLoading(false);
      setAiError(null);
      setPexelsQuery("");
      setPexelsVideo(null); // Reset single video
      setIsPexelsLoading(false);
      setPexelsError(null);
      setUploadedVideoFile(null);
      setUploadError(null);
      setIsUploading(false);
    }
  }, [open]);

  const handleAiGenerateVideo = async () => {
    if (!aiPrompt.trim()) {
      setAiError("Please enter a prompt for the video.");
      return;
    }
    setIsAiLoading(true);
    setAiError(null);
    try {
      console.log(
        `Generating video for store ${storeId} with prompt: "${aiPrompt}"`,
      );
      const newVideoUrl = await generateVideoWithVeo(aiPrompt);
      if (onVideoReplaced) {
        onVideoReplaced(newVideoUrl);
      }
      onOpenChange(false);
      setAiPrompt("");
    } catch (err) {
      console.error("Error generating video with AI:", err);
      setAiError(err.message || "Failed to generate video. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePexelsSearch = async () => {
    if (!pexelsQuery.trim()) {
      setPexelsError("Please enter a search query for Pexels.");
      return;
    }
    setIsPexelsLoading(true);
    setPexelsError(null);
    setPexelsVideo(null);
    try {
      const result = await searchPexelsVideos(pexelsQuery);
      if (result.error) {
        setPexelsError(result.error);
      } else if (result.video) {
        setPexelsVideo(result.video);
      } else {
        setPexelsError("No video found for your query.");
      }
    } catch (err) {
      console.error("Error searching Pexels videos:", err);
      setPexelsError(
        err.message || "Failed to search Pexels. Please try again.",
      );
    } finally {
      setIsPexelsLoading(false);
    }
  };

  const handlePexelsVideoSelect = (videoUrl) => {
    if (onVideoReplaced && videoUrl) {
      onVideoReplaced(videoUrl);
      onOpenChange(false);
    } else {
      setPexelsError(
        "Invalid video URL selected or replacement handler missing.",
      );
    }
  };

  const handleVideoFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        setUploadError("File is too large. Please select a video under 50MB.");
        setUploadedVideoFile(null);
        return;
      }
      if (!file.type.startsWith("video/")) {
        setUploadError("Invalid file type. Please select a video file.");
        setUploadedVideoFile(null);
        return;
      }
      setUploadedVideoFile(file);
      setUploadError(null);
    }
  };

  const handleConfirmUpload = () => {
    if (uploadedVideoFile && onVideoReplaced) {
      setIsUploading(true);
      setUploadError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        onVideoReplaced(reader.result);
        onOpenChange(false);
        setUploadedVideoFile(null);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setUploadError("Failed to read video file for upload.");
        setIsUploading(false);
      };
      reader.readAsDataURL(uploadedVideoFile);
    } else {
      setUploadError("No video file selected or replacement handler missing.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[672px] bg-slate-900 border-slate-700">
        <DialogHeader className="text-left">
          <DialogTitle className="text-white font-mono uppercase tracking-wide">
            Replace Hero Video
          </DialogTitle>
          <DialogDescription className="text-left text-slate-400">
            Current video:{" "}
            <a
              href={currentVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline truncate block max-w-full"
            >
              {currentVideoUrl || "No video set"}
            </a>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger
              value="ai"
              className="text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-mono"
            >
              AI Generation (Veo)
            </TabsTrigger>
            <TabsTrigger
              value="pexels"
              className="text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-mono"
            >
              Search Pexels
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-mono"
            >
              Upload Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4 py-4">
            <div>
              <Label
                htmlFor="aiPrompt"
                className="text-left block mb-1 text-slate-300 font-mono"
              >
                AI Video Prompt
              </Label>
              <Input
                id="aiPrompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Military tactical gear in action"
                disabled={isAiLoading}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 font-mono"
              />
            </div>
            {aiError && (
              <p className="text-sm text-blue-400 text-center font-mono">
                {aiError}
              </p>
            )}
            <DialogFooter className="justify-start pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isAiLoading}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 font-mono"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAiGenerateVideo}
                disabled={isAiLoading || !aiPrompt.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-mono"
              >
                {isAiLoading ? "Generating..." : "Generate Video"}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="pexels" className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                id="pexelsQuery"
                value={pexelsQuery}
                onChange={(e) => setPexelsQuery(e.target.value)}
                placeholder="e.g., Military, Tactical, Combat"
                disabled={isPexelsLoading}
                className="flex-grow bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 font-mono"
              />
              <Button
                onClick={handlePexelsSearch}
                disabled={isPexelsLoading || !pexelsQuery.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-mono"
              >
                {isPexelsLoading ? "Searching..." : "Search"}
              </Button>
            </div>
            {pexelsError && (
              <p className="text-sm text-blue-400 text-center font-mono">
                {pexelsError}
              </p>
            )}
            {isPexelsLoading && (
              <p className="text-sm text-slate-400 text-center font-mono">
                Loading Pexels video...
              </p>
            )}

            {!isPexelsLoading && pexelsVideo && (
              <div className="flex justify-center">
                <div
                  className="relative aspect-video rounded-md overflow-hidden cursor-pointer group border border-slate-700 hover:border-blue-600 w-full max-w-md"
                  onClick={() => handlePexelsVideoSelect(pexelsVideo.videoUrl)}
                >
                  <img
                    src={pexelsVideo.imageUrl}
                    alt={`Pexels video by ${pexelsVideo.photographer}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <p className="text-white text-lg font-semibold text-center p-2 bg-black/50 rounded font-mono">
                      Use This Video
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="justify-start pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPexelsLoading}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 font-mono"
              >
                Cancel
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 py-4">
            <div>
              <Label
                htmlFor="video-upload-input"
                className="text-left block mb-1 text-slate-300 font-mono"
              >
                Select Video File
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="video-upload-input"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileUpload}
                  className="flex-grow bg-slate-800 border-slate-600 text-white font-mono"
                  disabled={isUploading}
                />
              </div>
              {uploadedVideoFile && (
                <p className="text-sm text-slate-400 mt-2 font-mono">
                  Selected: {uploadedVideoFile.name} (
                  {(uploadedVideoFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              {uploadError && (
                <p className="text-sm text-blue-400 text-center mt-2 font-mono">
                  {uploadError}
                </p>
              )}
            </div>
            <DialogFooter className="justify-start pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUploading}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 font-mono"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUpload}
                disabled={isUploading || !uploadedVideoFile}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-mono"
              >
                {isUploading ? "Uploading..." : "Confirm Upload"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ReplaceVideoModal;
