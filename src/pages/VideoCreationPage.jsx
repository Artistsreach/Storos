import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateImagePromptSuggestions } from "@/lib/gemini.js"; 
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { generateImageWithGemini, generateId } from "@/lib/utils.jsx"; 
import { editImageWithGemini, generateCaptionForImageData } from "@/lib/geminiImageGeneration.js"; 
import { generateVideoWithVeoFromImage } from "@/lib/geminiVideoGeneration"; 
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Wand,
  ImageIcon,
  VideoIcon,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit3,
  Plus,
  Film,
  Upload,
  ShoppingBag,
  MoveUp,
  MoveDown,
  Pencil,
  Save,
  Play,
  ImagePlus,
  Scissors,
  ChevronsUpDown,
  Eye,
  Download,
  Share2,
  ArrowLeft,
  X
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area"; 

const convertImageSrcToBasics = (imageSrc) => {
  return new Promise((resolve, reject) => {
    if (!imageSrc) {
      return reject(new Error("Image source is undefined or null."));
    }
    if (imageSrc.startsWith("data:")) {
      try {
        const parts = imageSrc.split(",");
        if (parts.length < 2) throw new Error("Invalid data URL structure.");
        const metaPart = parts[0];
        const base64Data = parts[1];
        const mimeTypeMatch = metaPart.match(/:(.*?);/);
        if (!mimeTypeMatch || !mimeTypeMatch[1])
          throw new Error("Could not parse MIME type from data URL.");
        const mimeType = mimeTypeMatch[1];
        resolve({ base64ImageData: base64Data, mimeType });
      } catch (error) {
        console.error("Error parsing data URL:", imageSrc, error);
        reject(new Error(`Invalid data URL format: ${error.message}`));
      }
    } else {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        try {
          let mimeType = "image/png";
          if (
            imageSrc.toLowerCase().endsWith(".jpg") ||
            imageSrc.toLowerCase().endsWith(".jpeg")
          ) {
            mimeType = "image/jpeg";
          }
          const dataUrl = canvas.toDataURL(mimeType);
          const parts = dataUrl.split(",");
          const base64Data = parts[1];
          resolve({ base64ImageData: base64Data, mimeType });
        } catch (e) {
          console.error("Canvas toDataURL failed:", e);
          reject(new Error("Canvas toDataURL failed. " + e.message));
        }
      };
      img.onerror = (e) => {
        console.error(
          "Failed to load image from URL for conversion:",
          imageSrc,
          e,
        );
        reject(new Error("Failed to load image from URL for conversion."));
      };
      img.src = imageSrc;
    }
  });
};

import { 
    generateImageWithOpenAI, 
    editImageWithOpenAI,
    dataUrlToImageFile
} from "@/lib/openaiImageGeneration.js";
import { useAuth } from "@/contexts/AuthContext";
import { deductCredits, canDeductCredits } from "@/lib/credits";

const VideoCreationPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("text-to-image");

  const [textPrompt, setTextPrompt] = useState(""); 
  const [openAITextPrompt, setOpenAITextPrompt] = useState(""); 
  const [isGeneratingWithGemini, setIsGeneratingWithGemini] = useState(false);
  const [isGeneratingWithOpenAI, setIsGeneratingWithOpenAI] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null); 
  const [suggestedImagePrompts, setSuggestedImagePrompts] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const [imageEditPrompt, setImageEditPrompt] = useState(""); 
  const [selectedImageForEditing, setSelectedImageForEditing] = useState(null); 
  const [isEditingWithGemini, setIsEditingWithGemini] = useState(false);
  const [editedImage, setEditedImage] = useState(null); 

  const [timelineItems, setTimelineItems] = useState([]); 
  const [activeSelectedCaption, setActiveSelectedCaption] = useState(""); 
  const [isConvertingToVeo, setIsConvertingToVeo] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null); 
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  const [viewingMedia, setViewingMedia] = useState(null);

  const handleDownloadMedia = async () => {
    if (!viewingMedia || !viewingMedia.url) return;

    try {
      const link = document.createElement('a');
      let fileName = "download";

      if (viewingMedia.url.startsWith('data:')) {
        const mimeTypeMatch = viewingMedia.url.match(/:(.*?);/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'application/octet-stream';
        const extension = mimeType.split('/')[1] || 'bin';
        fileName = `${viewingMedia.caption?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'media'}.${extension}`;
        link.href = viewingMedia.url;
      } else {
        const response = await fetch(viewingMedia.url);
        const blob = await response.blob();
        link.href = URL.createObjectURL(blob);
        
        const nameFromUrl = viewingMedia.url.substring(viewingMedia.url.lastIndexOf('/') + 1).split('?')[0];
        const extFromUrl = nameFromUrl.includes('.') ? nameFromUrl.substring(nameFromUrl.lastIndexOf('.') + 1) : '';
        const defaultExt = viewingMedia.type === 'video' ? 'mp4' : 'png';
        fileName = nameFromUrl || `${viewingMedia.caption?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'media'}.${extFromUrl || defaultExt}`;
      }

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (!viewingMedia.url.startsWith('data:')) {
        URL.revokeObjectURL(link.href);
      }
      toast({ title: "Download Started", description: `Downloading ${fileName}` });
    } catch (error) {
      console.error("Error downloading media:", error);
      toast({ title: "Download Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleGenerateImageWithGemini = async () => {
    if (!textPrompt.trim()) {
      toast({ title: "Error", description: "Please enter a prompt for image generation", variant: "destructive" });
      return;
    }
    setIsGeneratingWithGemini(true);
    setGeneratedImage(null);
    setActiveSelectedCaption("");
    try {
      const result = await generateImageWithGemini(textPrompt); 
      let captions = result.alt ? [result.alt] : [`Image for: ${textPrompt.substring(0,30)}`];
      if (result.url) {
         try {
            const { base64ImageData, mimeType } = await convertImageSrcToBasics(result.url);
            captions = await generateCaptionForImageData(base64ImageData, mimeType, `Image of ${textPrompt}`);
         } catch (captionError) {
            console.error("Error generating caption for Gemini image:", captionError);
            captions = [`Failed to generate caption for: ${textPrompt.substring(0,30)}`];
         }
      }
      setGeneratedImage({ url: result.url, captions: captions, sourceApi: 'gemini' });
      if (captions && captions.length > 0) setActiveSelectedCaption(captions[0]);

    } catch (error) {
      console.error("Error generating image with Gemini:", error);
      toast({ title: "Image Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGeneratingWithGemini(false);
    }
  };

  const handleGenerateImageWithOpenAI_UI = async () => {
    if (!openAITextPrompt.trim()) {
      toast({ title: "Error", description: "Please enter a prompt for OpenAI image generation", variant: "destructive" });
      return;
    }
    setIsGeneratingWithOpenAI(true);
    setGeneratedImage(null);
    setActiveSelectedCaption("");
    try {
      const result = await generateImageWithOpenAI(openAITextPrompt); 
      const imageDataUrl = `data:image/png;base64,${result.b64_json}`; 
      let captions = result.alt ? [result.alt] : [`OpenAI image for: ${openAITextPrompt.substring(0,30)}`];
      try {
          const { base64ImageData, mimeType } = await convertImageSrcToBasics(imageDataUrl);
          captions = await generateCaptionForImageData(base64ImageData, mimeType, `OpenAI-generated image of ${openAITextPrompt}`);
      } catch (captionError) {
          console.error("Error generating caption for OpenAI image:", captionError);
          captions = [`Failed to generate caption for: ${openAITextPrompt.substring(0,30)}`];
      }
      setGeneratedImage({ url: imageDataUrl, captions: captions, sourceApi: 'openai' });
      if (captions && captions.length > 0) setActiveSelectedCaption(captions[0]);
      toast({ title: "Image Generated (OpenAI)", description: "Image successfully generated using OpenAI." });
    } catch (error) {
      console.error("Error generating image with OpenAI:", error);
      toast({ title: "OpenAI Image Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGeneratingWithOpenAI(false);
    }
  };

  const handleEditImageWithGemini = async (itemToEdit, editPromptForGemini) => {
    if (!itemToEdit || !itemToEdit.url) {
        toast({ title: "Error", description: "No image selected to edit with Gemini.", variant: "destructive" });
        return;
    }
    if (!editPromptForGemini.trim()) {
        toast({ title: "Error", description: "Please enter an edit prompt for Gemini.", variant: "destructive" });
        return;
    }
    setIsEditingWithGemini(true);
    setEditedImage(null);
    setActiveSelectedCaption("");
    try {
        const { base64ImageData, mimeType } = await convertImageSrcToBasics(itemToEdit.url);
        const result = await editImageWithGemini(base64ImageData, mimeType, editPromptForGemini); 
        if (result && result.editedImageData) {
            const newImageDataUrl = `data:${result.newMimeType};base64,${result.editedImageData}`;
            let captions = result.editTextResponse ? [result.editTextResponse] : [`Edited with Gemini: ${itemToEdit.caption || itemToEdit.id}`];
            try {
                captions = await generateCaptionForImageData(result.editedImageData, result.newMimeType, `Edited image based on: ${editPromptForGemini}`);
            } catch (captionError) {
                console.error("Error generating caption for Gemini edited image:", captionError);
            }
            setEditedImage({ url: newImageDataUrl, captions: captions, sourceApi: 'gemini' });
            if (captions && captions.length > 0) setActiveSelectedCaption(captions[0]);
            toast({ title: "Image Edited (Gemini)", description: "Image successfully edited with Gemini." });
        } else {
            throw new Error("Gemini image edit did not return image data.");
        }
    } catch (error) {
        console.error("Error editing image with Gemini:", error);
        toast({ title: "Gemini Edit Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsEditingWithGemini(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessingUpload(true);
    setUploadedFile(null);
    setActiveSelectedCaption("");
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        const fileType = file.type.startsWith('video/') ? 'video' : 'image';
        let captions = [file.name];
        
        if (fileType === 'image') {
          try {
            const { base64ImageData, mimeType } = await convertImageSrcToBasics(dataUrl);
            captions = await generateCaptionForImageData(base64ImageData, mimeType, "Uploaded image caption");
          } catch (captionError) {
            console.error("Error generating caption for uploaded image:", captionError);
          }
        } else {
          captions = [`Uploaded video: ${file.name}`];
        }

        setUploadedFile({ url: dataUrl, captions: captions, type: fileType });
        if (captions && captions.length > 0) setActiveSelectedCaption(captions[0]);
        setIsProcessingUpload(false);
      };
      reader.onerror = () => {
        toast({ title: "Upload Failed", description: "Failed to read the selected file", variant: "destructive" });
        setIsProcessingUpload(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing uploaded file:", error);
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
      setIsProcessingUpload(false);
    }
  };

  const addToTimeline = (itemUrl, caption, type = "image") => {
    if (!itemUrl) {
        toast({ title: "Cannot Add", description: "Item URL is missing.", variant: "destructive"});
        return;
    }
    const newItem = {
      id: generateId(),
      type,
      url: itemUrl,
      caption: caption || `Item ${timelineItems.length + 1}`,
      isVideo: type === "video",
    };
    setTimelineItems((prev) => [...prev, newItem]);
    toast({ title: "Added to Timeline", description: `${type === "video" ? "Video" : "Image"} added to your content timeline.` });
    setGeneratedImage(null);
    setEditedImage(null);
    setUploadedFile(null);
    setSelectedImageForEditing(null); 
    setActiveSelectedCaption(""); 
  };

  const moveItem = (index, direction) => {
    const newItems = [...timelineItems];
    const item = newItems[index];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newItems.length) return;
    newItems.splice(index, 1);
    newItems.splice(newIndex, 0, item);
    setTimelineItems(newItems);
  };

  const removeItemFromTimeline = (id) => {
    setTimelineItems((prev) => prev.filter((item) => item.id !== id));
    toast({ title: "Removed from Timeline", description: "Item removed." });
  };

  const handleConvertToVeoVideo = async (item, index) => {
    if (item.isVideo) {
      toast({ title: "Already a Video", description: "This item is already a video." });
      return;
    }
    setIsConvertingToVeo(true);
    try {
      const hasEnoughCredits = await canDeductCredits(user.uid, 15);
      if (!hasEnoughCredits) {
        toast({ title: "Error", description: "You don't have enough credits to generate a video.", variant: "destructive" });
        setIsConvertingToVeo(false);
        return;
      }
      const { base64ImageData, mimeType } = await convertImageSrcToBasics(item.url);
      const prompt = item.caption || `Create a short video from this image`;
      
      const videoUrl = await generateVideoWithVeoFromImage(prompt, base64ImageData, mimeType); 

      const newItems = [...timelineItems];
      newItems[index] = { ...item, url: videoUrl, isVideo: true, type: "video", caption: item.caption + " (Veo Video)" };
      setTimelineItems(newItems);
      await deductCredits(user.uid, 15);
      toast({ title: "Veo Video Generated", description: "Image converted to video using Veo." });
    } catch (error) {
      console.error("Error converting to Veo video:", error);
      toast({ title: "Veo Conversion Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsConvertingToVeo(false);
    }
  };

  const handleEditTimelineItemCaption = (id) => {
    const item = timelineItems.find(i => i.id === id);
    if (!item) return;
    const newCaption = prompt("Edit caption:", item.caption);
    if (newCaption !== null && newCaption.trim() !== item.caption) {
      setTimelineItems(prev => prev.map(i => i.id === id ? { ...i, caption: newCaption.trim() } : i));
      toast({title: "Caption Updated"});
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 bg-background">
      <header className="relative text-center pb-4"> 
        <Link to="/" className="absolute left-0 top-0">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Home</span>
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">AI Content Creation Studio</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Generate images, edit them, create videos, and build your content sequence.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text-to-image"><Wand className="mr-1 h-4 w-4 inline-block"/>Gen Image</TabsTrigger>
              <TabsTrigger value="image-edit"><Scissors className="mr-1 h-4 w-4 inline-block"/>Edit Image</TabsTrigger>
              <TabsTrigger value="upload"><Upload className="mr-1 h-4 w-4 inline-block"/>Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="text-to-image" className="mt-4 p-4 border rounded-lg bg-card shadow">
              <Label htmlFor="text-prompt-model1" className="text-lg font-semibold">Text-to-Image (Quick)</Label>
              <Textarea
                id="text-prompt-model1"
                placeholder="e.g., 'A futuristic cityscape at sunset'"
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                rows={3}
                className="mt-2"
                disabled={isGeneratingWithGemini || isGeneratingWithOpenAI}
              />
              {isLoadingSuggestions && <p className="text-xs text-muted-foreground mt-1">Loading prompt suggestions...</p>}
              {suggestedImagePrompts.length > 0 && !isLoadingSuggestions && (
                <div className="mt-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">Suggestions:</Label>
                  <div className="flex flex-wrap gap-1">
                    {suggestedImagePrompts.map((suggestion, idx) => (
                      <Button key={idx} variant="outline" size="xs" onClick={() => setTextPrompt(suggestion)} className="text-xs">
                        {suggestion.length > 40 ? suggestion.substring(0, 37) + "..." : suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={handleGenerateImageWithGemini} disabled={isGeneratingWithGemini || isGeneratingWithOpenAI || !textPrompt.trim()} className="w-full mt-3">
                {isGeneratingWithGemini ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                Generate with Quick
              </Button>

              <Separator className="my-4"/>
              
              <Label htmlFor="text-prompt-model2" className="text-lg font-semibold">Text-to-Image (Quality)</Label>
              <Textarea
                id="text-prompt-model2"
                placeholder="e.g., 'A photorealistic cat astronaut'"
                value={openAITextPrompt} 
                onChange={(e) => setOpenAITextPrompt(e.target.value)}
                rows={3}
                className="mt-2"
                disabled={isGeneratingWithGemini || isGeneratingWithOpenAI}
              />
              <Button onClick={handleGenerateImageWithOpenAI_UI} disabled={isGeneratingWithGemini || isGeneratingWithOpenAI || !openAITextPrompt.trim()} className="w-full mt-3">
                {isGeneratingWithOpenAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
                Generate with Quality
              </Button>

              {generatedImage && generatedImage.url && (
                <div className="mt-4 border rounded-md p-4 space-y-3 bg-muted/50 min-h-[320px]"> 
                  <img src={generatedImage.url} alt={`Generated by ${generatedImage.sourceApi === 'gemini' ? 'Quick' : (generatedImage.sourceApi === 'openai' ? 'Quality' : 'AI')}`} className="w-full rounded-md object-contain max-h-96" /> 
                  <p className="text-xs text-muted-foreground">Source: {generatedImage.sourceApi === 'gemini' ? 'Quick' : (generatedImage.sourceApi === 'openai' ? 'Quality' : 'AI')}</p>
                  <Label className="text-sm font-medium">Choose a caption:</Label>
                  <div className="flex flex-wrap gap-2">
                    {(generatedImage.captions || []).map((cap, idx) => (
                      <Button
                        key={idx}
                        variant={activeSelectedCaption === cap ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveSelectedCaption(cap)}
                        className="text-xs"
                      >
                        {cap}
                      </Button>
                    ))}
                  </div>
                  <Button onClick={() => addToTimeline(generatedImage.url, activeSelectedCaption)} size="sm" className="w-full mt-2" disabled={!activeSelectedCaption}>
                    <Plus className="mr-2 h-4 w-4" /> Add to Timeline
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="image-edit" className="mt-4 p-4 border rounded-lg bg-card shadow">
              <Label className="text-lg font-semibold">Image Editing</Label>
              {!selectedImageForEditing && <p className="text-sm text-muted-foreground mt-1">Select an image from the timeline to enable editing.</p>}
              
              {selectedImageForEditing && (
                <div className="mt-2 space-y-3">
                    <p className="text-sm font-medium">Editing: <span className="text-primary truncate">{selectedImageForEditing.caption}</span></p>
                    <img src={selectedImageForEditing.url} alt="Selected for editing" className="w-full rounded-md object-contain max-h-48 border" />
                    
                    <Label htmlFor="edit-prompt-model1">Edit with Quick</Label>
                     <Textarea
                        id="edit-prompt-model1"
                        placeholder="Describe edits (e.g., 'change background to a beach')"
                        value={imageEditPrompt} 
                        onChange={(e) => setImageEditPrompt(e.target.value)}
                        rows={2}
                        disabled={isEditingWithGemini}
                    />
                    <Button onClick={() => handleEditImageWithGemini(selectedImageForEditing, imageEditPrompt)} disabled={isEditingWithGemini || !imageEditPrompt.trim()} className="w-full">
                        {isEditingWithGemini ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                        Edit with Quick
                    </Button>
                </div>
              )}
              {editedImage && editedImage.url && (
                <div className="mt-4 border rounded-md p-4 space-y-3 bg-muted/50 min-h-[320px]"> 
                  <img src={editedImage.url} alt={`Edited by ${editedImage.sourceApi === 'gemini' ? 'Quick' : 'AI'}`} className="w-full rounded-md object-contain max-h-96" /> 
                   <p className="text-xs text-muted-foreground">Source: {editedImage.sourceApi === 'gemini' ? 'Quick' : 'AI'}</p>
                  <Label className="text-sm font-medium">Choose a caption for the edited image:</Label>
                   <div className="flex flex-wrap gap-2">
                    {(editedImage.captions || []).map((cap, idx) => (
                      <Button
                        key={idx}
                        variant={activeSelectedCaption === cap ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveSelectedCaption(cap)}
                        className="text-xs"
                      >
                        {cap}
                      </Button>
                    ))}
                  </div>
                  <Button onClick={() => addToTimeline(editedImage.url, activeSelectedCaption)} size="sm" className="w-full mt-2" disabled={!activeSelectedCaption}>
                    <Plus className="mr-2 h-4 w-4" /> Add Edited to Timeline
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="mt-4 p-4 border rounded-lg bg-card shadow">
              <Label htmlFor="file-upload" className="text-lg font-semibold">Upload Image or Video</Label>
              <Input id="file-upload" type="file" accept="image/*,video/*" onChange={handleFileUpload} className="mt-2" disabled={isProcessingUpload} />
              {isProcessingUpload && <div className="mt-2 flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</div>}
              {uploadedFile && uploadedFile.url && (
                <div className="mt-4 border rounded-md p-4 space-y-3 bg-muted/50 min-h-[320px]">
                  {uploadedFile.type === 'image' ? (
                    <img src={uploadedFile.url} alt="Uploaded content" className="w-full rounded-md object-contain max-h-96" />
                  ) : (
                    <video src={uploadedFile.url} controls className="w-full rounded-md max-h-96">Your browser does not support the video tag.</video>
                  )}
                  <Label className="text-sm font-medium">Choose a caption for the uploaded content:</Label>
                  <div className="flex flex-wrap gap-2">
                    {(uploadedFile.captions || []).map((cap, idx) => (
                      <Button
                        key={idx}
                        variant={activeSelectedCaption === cap ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveSelectedCaption(cap)}
                        className="text-xs"
                      >
                        {cap}
                      </Button>
                    ))}
                  </div>
                  <Button onClick={() => addToTimeline(uploadedFile.url, activeSelectedCaption, uploadedFile.type)} size="sm" className="w-full mt-2" disabled={!activeSelectedCaption}>
                    <Plus className="mr-2 h-4 w-4" /> Add to Timeline
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="p-4 md:p-6 border rounded-lg bg-card shadow min-h-[400px]">
            <h2 className="text-2xl font-semibold mb-4">Content Timeline</h2>
            <ScrollArea className="h-[calc(100vh-350px)] min-h-[300px] pr-3"> 
              {timelineItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Film className="h-12 w-12 mb-3" />
                  <p>Your timeline is empty.</p>
                  <p className="text-sm">Generate or upload content to get started.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {timelineItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="mb-3 p-3 border rounded-md flex items-start gap-3 hover:shadow-md transition-shadow bg-background cursor-pointer"
                      onClick={() => setViewingMedia(item)}
                    >
                      <div className="w-24 h-24 flex-shrink-0 relative rounded overflow-hidden group bg-muted">
                        {item.isVideo ? (
                          <video src={item.url} className="w-full h-full object-cover" controls={false} muted loop onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                        ) : (
                          <img src={item.url} alt={item.caption} className="w-full h-full object-cover" />
                        )}
                        {!item.isVideo && (
                          <Button
                            size="icon" variant="secondary"
                            className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); handleConvertToVeoVideo(item, index); }}
                            disabled={isConvertingToVeo}
                            title="Convert to Veo Video"
                          >
                            {isConvertingToVeo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                          </Button>
                        )}
                          <Button
                            size="icon" variant="outline"
                            className="absolute bottom-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageForEditing(item);
                              setActiveTab("image-edit");
                            }}
                            disabled={item.isVideo}
                            title="Edit this image"
                          >
                           <Scissors className="h-4 w-4" />
                          </Button>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center">
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-sm ${item.isVideo ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {item.isVideo ? "Video" : "Image"} {index + 1}
                            </span>
                            <div className="flex items-center">
                                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); moveItem(index, -1);}} disabled={index === 0} className="h-7 w-7"><MoveUp className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); moveItem(index, 1);}} disabled={index === timelineItems.length - 1} className="h-7 w-7"><MoveDown className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditTimelineItemCaption(item.id);}} className="h-7 w-7"><Pencil className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); removeItemFromTimeline(item.id);}} className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground line-clamp-3" title={item.caption}>{item.caption}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </ScrollArea>
            {timelineItems.length > 0 && <Separator className="my-4" />}
            
            {/* Media Viewer Section */}
            {viewingMedia && (
              <div className="mt-6 p-4 border rounded-lg bg-card shadow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Media Viewer</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownloadMedia}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setViewingMedia(null)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                {viewingMedia.type === 'image' || !viewingMedia.isVideo ? (
                  <img 
                    src={viewingMedia.url} 
                    alt={viewingMedia.caption || 'Viewing media'} 
                    className="w-full max-h-[60vh] rounded-md object-contain border" 
                  />
                ) : (
                  <video 
                    src={viewingMedia.url} 
                    controls 
                    className="w-full max-h-[60vh] rounded-md border bg-black"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
                <p className="text-sm text-muted-foreground mt-2 text-center">{viewingMedia.caption}</p>
              </div>
            )}
             {/* End Media Viewer Section */}

            {/* Video Editor section removed as per user request */}
            {/* 
            <div className="space-y-3 p-4 border rounded-lg bg-card shadow">
              <h3 className="text-xl font-semibold mb-2">Video Editor (VEO 2 Output)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Combine and sequence your VEO 2 videos from the timeline.
              </p>
              // <VideoEditor timelineVideos={timelineItems.filter(item => item.isVideo)} />
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Video editing features are currently under review.
              </p>
            </div>
            */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCreationPage;
