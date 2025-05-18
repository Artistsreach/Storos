import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"; // Added for navigation
import {
  Dialog, // This will likely be removed or replaced with page layout components
  DialogContent, // This will likely be removed or replaced with page layout components
  DialogHeader, // This will likely be removed or replaced with page layout components
  DialogTitle, // This will likely be removed or replaced with page layout components
  DialogDescription, // This will likely be removed or replaced with page layout components
  DialogFooter, // This will likely be removed or replaced with page layout components
  DialogClose, // This will likely be removed or replaced with page layout components
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateImagePromptSuggestions } from "@/lib/gemini.js"; // Added import
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { generateImageWithGemini, generateId } from "@/lib/utils.jsx"; // Corrected import
import { editImageWithGemini, generateCaptionForImageData } from "@/lib/geminiImageGeneration.js"; // Corrected import
import { generateVideoWithVeoFromImage } from "@/lib/geminiVideoGeneration"; // Assuming this is in geminiVideoGeneration.js
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
  ArrowLeft // Added for back button
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area"; // Added for timeline if it gets long

// Helper to convert image URL (http or data) to base64 and mimeType
// This is duplicated from other files, consider moving to a central util if not already there
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
      // Assuming it's an HTTP/HTTPS URL
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
    renderVoiceoverVideoWithCreatomate, 
    renderProductShowcaseVideoWithCreatomate,
    pollCreatomateRenderStatus 
} from "@/lib/creatomate.js";
import { 
    generateImageWithOpenAI, 
    editImageWithOpenAI,
    dataUrlToImageFile
} from "@/lib/openaiImageGeneration.js";
import { useStore } from "@/contexts/StoreContext"; // Added import
import { useParams, useLocation } from "react-router-dom"; // Added useParams and useLocation


const ContentCreationPage = ({ product: productProp, storeId: storeIdProp, onContentCreated }) => {
  const { toast } = useToast();
  const { storeId: storeIdFromParams } = useParams(); // Get storeId from URL
  const location = useLocation(); // To get product passed via state if any
  
  const storeId = storeIdFromParams || storeIdProp; // Prioritize storeId from URL params
  const product = productProp || location.state?.product; // Use product from prop or location state

  const { getStoreById } = useStore(); 
  const [activeTab, setActiveTab] = useState("text-to-image");

  // Text-to-image state
  const [textPrompt, setTextPrompt] = useState(""); // For Gemini
  const [openAITextPrompt, setOpenAITextPrompt] = useState(""); // For OpenAI
  const [isGeneratingWithGemini, setIsGeneratingWithGemini] = useState(false);
  const [isGeneratingWithOpenAI, setIsGeneratingWithOpenAI] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null); // { url: string, captions: string[], sourceApi?: 'gemini' | 'openai' }
  const [suggestedImagePrompts, setSuggestedImagePrompts] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // Image-to-image state
  const [imageEditPrompt, setImageEditPrompt] = useState(""); // For Gemini edit
  // const [openAIImageEditPrompt, setOpenAIImageEditPrompt] = useState(""); // For OpenAI edit - REMOVED
  const [selectedImageForEditing, setSelectedImageForEditing] = useState(null); // { url: string, captions: string[] (or original single caption), id: string }
  const [isEditingWithGemini, setIsEditingWithGemini] = useState(false);
  // const [isEditingWithOpenAI, setIsEditingWithOpenAI] = useState(false); // REMOVED
  const [editedImage, setEditedImage] = useState(null); // { url: string, captions: string[] }

  // Timeline state
  const [timelineItems, setTimelineItems] = useState([]); // Array of { id, type: 'image' | 'video', url, caption: string, isVideo }
  const [activeSelectedCaption, setActiveSelectedCaption] = useState(""); // Holds the user-selected caption for the current preview
  const [isConvertingToVeo, setIsConvertingToVeo] = useState(false);
  const [isGeneratingCreatomateVideo, setIsGeneratingCreatomateVideo] = useState(false);
  const [creatomateRenderStatus, setCreatomateRenderStatus] = useState("");
  const [selectedCreatomateTemplate, setSelectedCreatomateTemplate] = useState("voiceover"); // 'voiceover' or 'product_showcase'

  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null); // { url: string, caption: string }
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // Product Catalog State
  const [productCatalog, setProductCatalog] = useState([]);
  const [isLoadingProductCatalog, setIsLoadingProductCatalog] = useState(false);
  const [showCatalogPicker, setShowCatalogPicker] = useState(false);


  // Initialize with product info, fetch prompt suggestions, and load product catalog
  useEffect(() => {
    let currentStore = null;
    if (storeId) {
      currentStore = getStoreById(storeId);
    } else if (product && product.store_id) { // Fallback if product has store_id
      currentStore = getStoreById(product.store_id);
    }

    if (currentStore && currentStore.products) {
      setIsLoadingProductCatalog(true);
      // Map products from store context to the simpler format needed by the picker
      const mappedCatalog = currentStore.products.map(p => ({
        id: p.id,
        name: p.name,
        // Ensure image and src exist, provide placeholder if not
        image: {
          src: {
            medium: p.image?.src?.medium || `https://via.placeholder.com/100x100.png?text=${encodeURIComponent(p.name?.substring(0,10) || 'P')}`
          }
        }
      }));
      setProductCatalog(mappedCatalog);
      setIsLoadingProductCatalog(false);
    } else {
      // Fallback to sample data if no store-specific products are found
      console.warn("[ContentCreationPage] No current store products found or storeId not available. Falling back to sample product catalog.");
      setProductCatalog([
        { id: "sample_prod_1", name: "Sample Product Alpha", image: { src: { medium: "https://via.placeholder.com/100x100.png?text=Alpha" } } },
        { id: "sample_prod_2", name: "Sample Product Beta", image: { src: { medium: "https://via.placeholder.com/100x100.png?text=Beta" } } },
        { id: "sample_prod_3", name: "Sample Product Gamma", image: { src: { medium: "https://via.placeholder.com/100x100.png?text=Gamma" } } },
      ]);
      setIsLoadingProductCatalog(false); // Ensure loading is false even for fallback
    }

    if (product && product.name) {
      setTextPrompt(`A captivating image of ${product.name}`);
      
      const fetchSuggestions = async () => {
        setIsLoadingSuggestions(true);
        try {
          const productInfo = {
            name: product.name,
            description: product.description || "", 
            niche: currentStore?.type || product.niche || "", 
            storeName: currentStore?.name || product.storeName || "" 
          };
          const result = await generateImagePromptSuggestions(productInfo);
          if (result.suggestions && result.suggestions.length > 0) {
            setSuggestedImagePrompts(result.suggestions);
          } else if (result.error) {
            console.warn("Could not fetch prompt suggestions:", result.error);
          }
        } catch (error) {
          console.error("Error fetching prompt suggestions:", error);
        } finally {
          setIsLoadingSuggestions(false);
        }
      };
      fetchSuggestions();
    }
  }, [product, storeId, getStoreById]);

  // Handle text-to-image generation (Gemini Flash Preview)
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

  // Handle text-to-image generation with OpenAI
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

  // Handle image editing with Gemini (text-and-image-to-image)
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

  // Handle file upload
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
        let captions = [file.name];
        try {
          const { base64ImageData, mimeType } = await convertImageSrcToBasics(dataUrl);
          captions = await generateCaptionForImageData(base64ImageData, mimeType, "Uploaded image caption");
        } catch (captionError) {
          console.error("Error generating caption for uploaded image:", captionError);
        }
        setUploadedFile({ url: dataUrl, captions: captions });
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

  // Add item to timeline
  const addToTimeline = (imageUrl, caption, type = "image") => {
    if (!imageUrl) {
        toast({ title: "Cannot Add", description: "Image URL is missing.", variant: "destructive"});
        return;
    }
    const newItem = {
      id: generateId(),
      type,
      url: imageUrl,
      caption: caption || `Item ${timelineItems.length + 1}`,
      isVideo: type === "video",
    };
    setTimelineItems((prev) => [...prev, newItem]);
    toast({ title: "Added to Timeline", description: `${type === "video" ? "Video" : "Image"} added to your content timeline.` });
    // Clear the source fields after adding to timeline
    setGeneratedImage(null);
    setEditedImage(null);
    setUploadedFile(null);
    setSelectedImageForEditing(null); // This clears the image selected for editing
    setActiveSelectedCaption(""); // Clear the active caption
  };

  // Move item in timeline
  const moveItem = (index, direction) => {
    const newItems = [...timelineItems];
    const item = newItems[index];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newItems.length) return;
    newItems.splice(index, 1);
    newItems.splice(newIndex, 0, item);
    setTimelineItems(newItems);
  };

  // Remove item from timeline
  const removeItemFromTimeline = (id) => {
    setTimelineItems((prev) => prev.filter((item) => item.id !== id));
    toast({ title: "Removed from Timeline", description: "Item removed." });
  };

  // Convert image in timeline to video using Veo 2
  const handleConvertToVeoVideo = async (item, index) => {
    if (item.isVideo) {
      toast({ title: "Already a Video", description: "This item is already a video." });
      return;
    }
    setIsConvertingToVeo(true);
    try {
      const { base64ImageData, mimeType } = await convertImageSrcToBasics(item.url);
      const prompt = item.caption || `Create a short video from this image: ${product ? product.name : 'product showcase'}`;
      
      // generateVideoWithVeoFromImage is from lib/geminiVideoGeneration.js
      const videoUrl = await generateVideoWithVeoFromImage(prompt, base64ImageData, mimeType); 

      const newItems = [...timelineItems];
      newItems[index] = { ...item, url: videoUrl, isVideo: true, type: "video", caption: item.caption + " (Veo Video)" };
      setTimelineItems(newItems);
      toast({ title: "Veo Video Generated", description: "Image converted to video using Veo." });
    } catch (error) {
      console.error("Error converting to Veo video:", error);
      toast({ title: "Veo Conversion Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsConvertingToVeo(false);
    }
  };

  // Generate final video using Creatomate
  const handleGenerateCreatomateVideo = async () => {
    if (timelineItems.length === 0) {
      toast({ title: "Empty Timeline", description: "Add content to the timeline first.", variant: "destructive" });
      return;
    }
    setIsGeneratingCreatomateVideo(true);
    setCreatomateRenderStatus("Starting video generation...");
    toast({ title: "Creatomate Process Started", description: "Your video is being prepared." });

    try {
      let renderResponse;
      if (selectedCreatomateTemplate === "voiceover") {
        if (timelineItems.length === 0) {
            toast({ title: "Error", description: "Please add items to the timeline for the voiceover video.", variant: "destructive" });
            setIsGeneratingCreatomateVideo(false);
            return;
        }
        renderResponse = await renderVoiceoverVideoWithCreatomate(timelineItems);
      } else if (selectedCreatomateTemplate === "product_showcase") {
        const productItem = timelineItems.find(item => !item.isVideo) || timelineItems[0]; // Use first image or first item
        if (!productItem) {
            toast({ title: "Error", description: "Please add at least one image to the timeline for the product showcase.", variant: "destructive" });
            setIsGeneratingCreatomateVideo(false);
            return;
        }
        // Example branding - this could be configurable
        const branding = { websiteUrl: product?.storeUrl || "www.yourstore.com", ctaText: "Shop Now!" };
        renderResponse = await renderProductShowcaseVideoWithCreatomate(productItem, branding);
      } else {
        throw new Error("Invalid Creatomate template selected.");
      }

      if (renderResponse && renderResponse.id) {
        setCreatomateRenderStatus(`Render initiated (ID: ${renderResponse.id}). Waiting for completion...`);
        
        const finalRender = await pollCreatomateRenderStatus(renderResponse.id, (progress) => {
          setCreatomateRenderStatus(`Processing: ${progress.status} ${progress.progress ? '(' + Math.round(progress.progress * 100) + '%)' : ''}`);
        });

        if (finalRender.status === 'succeeded' && finalRender.url) {
          toast({ title: "Creatomate Video Generated!", description: `Video successfully created: ${finalRender.url}`, duration: 9000 });
          setCreatomateRenderStatus(`Video ready: ${finalRender.url}`);
          if (onContentCreated) {
            onContentCreated({ type: "video", url: finalRender.url, source: "creatomate", renderDetails: finalRender });
          }
          // Optionally, add the final video to the timeline or display it
          // addToTimeline(finalRender.url, `Final Video (${selectedCreatomateTemplate})`, "video");

        } else {
          throw new Error(finalRender.error_message || "Creatomate video generation failed after polling.");
        }
      } else {
        throw new Error("Creatomate API did not return a valid render ID.");
      }
    } catch (error) {
      console.error("Error generating Creatomate video:", error);
      toast({ title: "Creatomate Video Failed", description: error.message, variant: "destructive", duration: 9000 });
      setCreatomateRenderStatus(`Error: ${error.message}`);
    } finally {
      setIsGeneratingCreatomateVideo(false);
    }
  };
  
  // Edit caption for timeline item
  const handleEditTimelineItemCaption = (id) => {
    const item = timelineItems.find(i => i.id === id);
    if (!item) return;
    const newCaption = prompt("Edit caption:", item.caption);
    if (newCaption !== null && newCaption.trim() !== item.caption) {
      setTimelineItems(prev => prev.map(i => i.id === id ? { ...i, caption: newCaption.trim() } : i));
      toast({title: "Caption Updated"});
    }
  };

  const handleSelectProductFromCatalog = (selectedProduct) => {
    if (selectedProduct.image && selectedProduct.image.src && selectedProduct.image.src.medium) {
        const caption = `Product: ${selectedProduct.name}`;
        addToTimeline(selectedProduct.image.src.medium, caption);
    } else {
        toast({ title: "No Image", description: `Product ${selectedProduct.name} has no image.`, variant: "destructive"});
    }
    setShowCatalogPicker(false);
  };


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <header className="relative text-center pb-4"> {/* Added relative positioning and padding */}
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
        {/* Left Column: Generation & Editing Tools */}
        <div className="lg:col-span-1 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text-to-image"><Wand className="mr-1 h-4 w-4 inline-block"/>Gen Image</TabsTrigger>
              <TabsTrigger value="image-edit"><Scissors className="mr-1 h-4 w-4 inline-block"/>Edit Image</TabsTrigger>
              <TabsTrigger value="upload"><Upload className="mr-1 h-4 w-4 inline-block"/>Upload</TabsTrigger>
            </TabsList>

            {/* Text to Image Tab (Gemini & OpenAI) */}
            <TabsContent value="text-to-image" className="mt-4 p-4 border rounded-lg bg-card shadow">
              <Label htmlFor="text-prompt-gemini" className="text-lg font-semibold">Text-to-Image (Gemini)</Label>
              <Textarea
                id="text-prompt-gemini"
                placeholder="e.g., 'A futuristic cityscape at sunset' (Gemini)"
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                rows={3}
                className="mt-2"
                disabled={isGeneratingWithGemini || isGeneratingWithOpenAI}
              />
              {isLoadingSuggestions && <p className="text-xs text-muted-foreground mt-1">Loading prompt suggestions...</p>}
              {suggestedImagePrompts.length > 0 && !isLoadingSuggestions && (
                <div className="mt-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">Suggestions for Gemini:</Label>
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
                Generate with Gemini
              </Button>

              <Separator className="my-4"/>
              
              <Label htmlFor="text-prompt-openai" className="text-lg font-semibold">Text-to-Image (OpenAI gpt-image-1)</Label>
              <Textarea
                id="text-prompt-openai"
                placeholder="e.g., 'A photorealistic cat astronaut' (OpenAI)"
                value={openAITextPrompt} 
                onChange={(e) => setOpenAITextPrompt(e.target.value)}
                rows={3}
                className="mt-2"
                disabled={isGeneratingWithGemini || isGeneratingWithOpenAI}
              />
              <Button onClick={handleGenerateImageWithOpenAI_UI} disabled={isGeneratingWithGemini || isGeneratingWithOpenAI || !openAITextPrompt.trim()} className="w-full mt-3">
                {isGeneratingWithOpenAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
                Generate with OpenAI
              </Button>

              {generatedImage && generatedImage.url && (
                <div className="mt-4 border rounded-md p-4 space-y-3 bg-muted/50 min-h-[320px]"> {/* Increased padding and space, added min-h */}
                  <img src={generatedImage.url} alt={`Generated by ${generatedImage.sourceApi || 'AI'}`} className="w-full rounded-md object-contain max-h-96" /> {/* Increased max-h */}
                  <p className="text-xs text-muted-foreground">Source: {generatedImage.sourceApi?.toUpperCase()}</p>
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

            {/* Image Editing Tab (OpenAI / Gemini) */}
            <TabsContent value="image-edit" className="mt-4 p-4 border rounded-lg bg-card shadow">
              <Label className="text-lg font-semibold">Image Editing</Label>
              {!selectedImageForEditing && <p className="text-sm text-muted-foreground mt-1">Select an image from the timeline to enable editing.</p>}
              
              {selectedImageForEditing && (
                <div className="mt-2 space-y-3">
                    <p className="text-sm font-medium">Editing: <span className="text-primary truncate">{selectedImageForEditing.caption}</span></p>
                    <img src={selectedImageForEditing.url} alt="Selected for editing" className="w-full rounded-md object-contain max-h-48 border" />
                    
                    {/* OpenAI Edit Section Removed */}
                    {/* <Label htmlFor="edit-prompt-openai">Edit with OpenAI (gpt-image-1)</Label>
                    <Textarea
                        id="edit-prompt-openai"
                        placeholder="Describe OpenAI edits (e.g., 'add a hat on the person')"
                        value={openAIImageEditPrompt} 
                        onChange={(e) => setOpenAIImageEditPrompt(e.target.value)}
                        rows={2}
                        disabled={isEditingWithOpenAI || isEditingWithGemini}
                    />
                    <Button onClick={() => handleEditImageWithOpenAI(selectedImageForEditing, openAIImageEditPrompt)} disabled={isEditingWithOpenAI || isEditingWithGemini || !openAIImageEditPrompt.trim()} className="w-full">
                        {isEditingWithOpenAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scissors className="mr-2 h-4 w-4" />}
                        Edit with OpenAI (gpt-image-1)
                    </Button>

                    <Separator className="my-3"/> */}

                    <Label htmlFor="edit-prompt-gemini">Edit with Gemini</Label>
                     <Textarea
                        id="edit-prompt-gemini"
                        placeholder="Describe Gemini edits (e.g., 'change background to a beach')"
                        value={imageEditPrompt} 
                        onChange={(e) => setImageEditPrompt(e.target.value)}
                        rows={2}
                        disabled={isEditingWithGemini}
                    />
                    <Button onClick={() => handleEditImageWithGemini(selectedImageForEditing, imageEditPrompt)} disabled={isEditingWithGemini || !imageEditPrompt.trim()} className="w-full">
                        {isEditingWithGemini ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                        Edit with Gemini
                    </Button>
                </div>
              )}
              {editedImage && editedImage.url && (
                <div className="mt-4 border rounded-md p-4 space-y-3 bg-muted/50 min-h-[320px]"> {/* Increased padding and space, added min-h */}
                  <img src={editedImage.url} alt={`Edited by ${editedImage.sourceApi || 'AI'}`} className="w-full rounded-md object-contain max-h-96" /> {/* Increased max-h */}
                   <p className="text-xs text-muted-foreground">Source: {editedImage.sourceApi?.toUpperCase()}</p>
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

            {/* Upload Tab */}
            <TabsContent value="upload" className="mt-4 p-4 border rounded-lg bg-card shadow">
              <Label htmlFor="image-upload" className="text-lg font-semibold">Upload Image</Label>
              <Input id="image-upload" type="file" accept="image/*" onChange={handleFileUpload} className="mt-2" disabled={isProcessingUpload} />
              {isProcessingUpload && <div className="mt-2 flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</div>}
              {uploadedFile && uploadedFile.url && (
                <div className="mt-4 border rounded-md p-4 space-y-3 bg-muted/50 min-h-[320px]"> {/* Increased padding and space, added min-h */}
                  <img src={uploadedFile.url} alt="Uploaded content" className="w-full rounded-md object-contain max-h-96" /> {/* Increased max-h */}
                  <Label className="text-sm font-medium">Choose a caption for the uploaded image:</Label>
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
                  <Button onClick={() => addToTimeline(uploadedFile.url, activeSelectedCaption)} size="sm" className="w-full mt-2" disabled={!activeSelectedCaption}>
                    <Plus className="mr-2 h-4 w-4" /> Add to Timeline
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Product Catalog Picker */}
          <div className="p-4 border rounded-lg bg-card shadow">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Product Catalog</h3>
                <Button variant="outline" size="sm" onClick={() => setShowCatalogPicker(!showCatalogPicker)}>
                    {showCatalogPicker ? "Hide" : "Show"} Products <ChevronsUpDown className="ml-2 h-4 w-4"/>
                </Button>
            </div>
            {showCatalogPicker && (
                <ScrollArea className="mt-2 h-48 border rounded-md p-2">
                    <div className="space-y-2">
                    {productCatalog.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer" onClick={() => handleSelectProductFromCatalog(p)}>
                            <div className="flex items-center gap-2">
                                <img src={p.image?.src?.medium} alt={p.name} className="w-10 h-10 object-cover rounded"/>
                                <span className="text-sm">{p.name}</span>
                            </div>
                            <Button size="xs" variant="ghost"><Plus className="h-4 w-4"/></Button>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
            )}
          </div>
        </div>

        {/* Right Column: Timeline & Final Output */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-4 md:p-6 border rounded-lg bg-card shadow min-h-[400px]">
            <h2 className="text-2xl font-semibold mb-4">Content Timeline</h2>
            <ScrollArea className="h-[calc(100vh-350px)] min-h-[300px] pr-3"> {/* Adjust height as needed */}
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
                      className="mb-3 p-3 border rounded-md flex items-start gap-3 hover:shadow-md transition-shadow bg-background"
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
                            onClick={() => handleConvertToVeoVideo(item, index)}
                            disabled={isConvertingToVeo}
                            title="Convert to Veo Video"
                          >
                            {isConvertingToVeo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                          </Button>
                        )}
                         <Button
                            size="icon" variant="outline"
                            className="absolute bottom-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setSelectedImageForEditing(item)}
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
                                <Button size="icon" variant="ghost" onClick={() => moveItem(index, -1)} disabled={index === 0} className="h-7 w-7"><MoveUp className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => moveItem(index, 1)} disabled={index === timelineItems.length - 1} className="h-7 w-7"><MoveDown className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => handleEditTimelineItemCaption(item.id)} className="h-7 w-7"><Pencil className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => removeItemFromTimeline(item.id)} className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
            <div className="space-y-3">
              <Label htmlFor="creatomate-template-select">Creatomate Template</Label>
              <div className="flex gap-2">
                <Button 
                    variant={selectedCreatomateTemplate === 'voiceover' ? 'default' : 'outline'}
                    onClick={() => setSelectedCreatomateTemplate('voiceover')}
                    className="flex-1"
                >
                    Voiceover Slideshow
                </Button>
                <Button 
                    variant={selectedCreatomateTemplate === 'product_showcase' ? 'default' : 'outline'}
                    onClick={() => setSelectedCreatomateTemplate('product_showcase')}
                    className="flex-1"
                >
                    Product Showcase
                </Button>
              </div>

              <Button
                onClick={handleGenerateCreatomateVideo}
                disabled={isGeneratingCreatomateVideo || timelineItems.length === 0}
                className="w-full"
                size="lg"
              >
                {isGeneratingCreatomateVideo ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Film className="mr-2 h-5 w-5" />}
                Generate with Creatomate
              </Button>
              {creatomateRenderStatus && (
                <p className="text-xs text-muted-foreground mt-1 text-center p-2 bg-muted rounded-md">
                  Status: {creatomateRenderStatus}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Uses selected Creatomate template with ElevenLabs narration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCreationPage;
