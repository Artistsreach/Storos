import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit2Icon, Replace, Edit3, Wand, Loader2, ImageDown as ImageUp, UploadCloud, CheckCircle as CheckCircleIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import ReplaceVideoModal from './ReplaceVideoModal';
import { useStore } from '@/contexts/StoreContext';
import InlineTextEdit from '@/components/ui/InlineTextEdit';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fetchPexelsImages, generateImageWithGemini, generateId } from '@/lib/utils';
import { editImageWithGemini } from '@/lib/geminiImageGeneration';
import { useToast } from '@/components/ui/use-toast';

const StoreHero = ({ store, isPublishedView = false }) => {
  const { updateStore, updateStoreTemplateVersion, viewMode } = useStore(); // updateStoreTemplateVersion is needed now
  const { toast } = useToast();

  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [searchedImages, setSearchedImages] = useState([]);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imageEditPrompt, setImageEditPrompt] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);

  const storeId = store?.id;
  const title = store?.content?.classicHeroTitle || store?.name || "Elevate Your Everyday";
  const subtitle = store?.content?.classicHeroDescription || "Discover premium collections designed for modern living. Quality craftsmanship, timeless style.";
  const videoUrl = store?.hero_video_url; 
  const currentHeroImageUrl = store?.heroImage?.src?.large || store?.heroImage?.url || store?.hero_video_poster_url || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80";
  const primaryCtaText = store?.content?.classicHeroPrimaryCtaText || "Shop New Arrivals";
  const primaryCtaLink = `#products-${store?.id || 'featured-products'}`; 
  const secondaryCtaText = store?.content?.classicHeroSecondaryCtaText || "Explore Collections";
  const secondaryCtaLink = `#collections-${store?.id || 'featured-collections'}`;
  const primaryColor = store?.theme?.primaryColor;

  const isAdmin = !isPublishedView;

  useEffect(() => {
    if (store?.name && !imageSearchQuery) {
      setImageSearchQuery(store.name + " hero background");
    }
  }, [store?.name, imageSearchQuery]);

  const handleScrollTo = (event, targetId) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenReplaceModal = () => setIsReplaceModalOpen(true);

  const handleVideoReplaced = async (newVideoUrl) => {
    if (storeId && newVideoUrl) {
      try {
        await updateStore(storeId, { hero_video_url: newVideoUrl, hero_video_poster_url: '' });
      } catch (error) {
        console.error("Failed to update store with new video URL:", error);
      }
    }
  };

  const handleSaveText = async (field, value) => {
    if (storeId) {
      try {
        await updateStore(storeId, { content: { ...store.content, [field]: value } });
        // Re-add V1 -> V2 -> V1 theme switch logic for text edits
        const originalVersion = store?.template_version || 'v1';
        if (originalVersion === 'v1') {
          await updateStoreTemplateVersion(storeId, 'v2'); // Switch to Modern
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait
          await updateStoreTemplateVersion(storeId, originalVersion); // Switch back to Classic
        }
      } catch (error) {
        console.error(`Failed to update store ${field}:`, error);
      }
    }
  };

  const convertImageSrcToBasics = useCallback((imageSrc) => {
    return new Promise((resolve, reject) => {
      if (!imageSrc) return reject(new Error("Image source is undefined or null."));
      if (imageSrc.startsWith('data:')) {
        try {
          const parts = imageSrc.split(',');
          if (parts.length < 2) throw new Error("Invalid data URL structure.");
          const metaPart = parts[0];
          const base64Data = parts[1];
          const mimeTypeMatch = metaPart.match(/:(.*?);/);
          if (!mimeTypeMatch || !mimeTypeMatch[1]) throw new Error("Could not parse MIME type from data URL.");
          resolve({ base64ImageData: base64Data, mimeType: mimeTypeMatch[1] });
        } catch (error) { reject(new Error(`Invalid data URL format: ${error.message}`)); }
      } else { 
        const img = new Image();
        img.crossOrigin = 'Anonymous'; 
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          try {
            const dataUrl = canvas.toDataURL('image/png'); 
            const [, base64Data] = dataUrl.split(',');
            resolve({ base64ImageData: base64Data, mimeType: 'image/png' });
          } catch (e) { reject(new Error("Canvas toDataURL failed: " + e.message)); }
        };
        img.onerror = () => reject(new Error("Failed to load image from URL."));
        img.src = imageSrc;
      }
    });
  }, []);

  const handlePexelsSearch = async () => {
    if (!imageSearchQuery.trim()) return;
    setIsImageLoading(true); setSearchedImages([]);
    try {
      const images = await fetchPexelsImages(imageSearchQuery, 5, 'landscape');
      setSearchedImages(images);
    } catch (error) { toast({ title: "Image search failed", description: error.message, variant: "destructive" }); }
    setIsImageLoading(false);
  };
  
  const handleGeminiGenerate = async () => {
    if (!imageSearchQuery.trim()) return;
    setIsImageLoading(true);
    try {
      const geminiPrompt = `Store hero image for: ${imageSearchQuery}, theme: ${store?.theme?.name || 'classic e-commerce'}`;
      const newImage = await generateImageWithGemini(geminiPrompt, 'landscape');
      setSearchedImages(prev => [{ id: Date.now().toString(), src: { medium: newImage.url, large: newImage.url }, url: newImage.url, alt: newImage.alt, photographer: "Gemini AI" }, ...prev.slice(0,4)]);
      toast({title: "Image Generated", description: "Gemini AI generated an image."});
    } catch (error) { toast({ title: "Gemini image generation failed", description: error.message, variant: "destructive" }); }
    setIsImageLoading(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsImageLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = {
          id: generateId(),
          src: { medium: reader.result, large: reader.result },
          url: reader.result,
          alt: file.name,
          photographer: "Uploaded by user" 
        };
        selectHeroImage(newImage); 
        toast({ title: "Image Uploaded", description: `${file.name} has been set as the hero image.` });
        setIsImageLoading(false); setIsImageModalOpen(false);
      };
      reader.onerror = () => { toast({ title: "Upload Failed", description: "Could not read the selected file.", variant: "destructive" }); setIsImageLoading(false); };
      reader.readAsDataURL(file);
    }
  };

  const selectHeroImage = async (selectedImg) => {
    if (storeId) {
      const newImageObject = {
        id: selectedImg.id || generateId(),
        src: { 
          large: selectedImg.src.large,
          medium: selectedImg.src.medium || selectedImg.src.large 
        },
        url: selectedImg.src.large,
        alt: selectedImg.alt || imageSearchQuery || "Hero Image",
        photographer: selectedImg.photographer || "Unknown"
      };
      try {
        await updateStore(storeId, { heroImage: newImageObject });
        toast({ title: "Hero Image Updated", description: "The hero image has been changed." });
        setIsImageModalOpen(false);
        setSearchedImages([]);
        // No theme switch for image updates
      } catch (error) {
        console.error("Failed to update hero image:", error);
        toast({ title: "Update Failed", description: "Could not save the new hero image.", variant: "destructive" });
      }
    }
  };

  const handleHeroImageEditSave = useCallback(async () => {
    if (!imageEditPrompt.trim() || !currentHeroImageUrl) {
      toast({ title: "Missing data", description: "Original image or edit prompt is missing.", variant: "destructive" }); return;
    }
    setIsEditingImage(true);
    try {
      const { base64ImageData, mimeType } = await convertImageSrcToBasics(currentHeroImageUrl);
      const result = await editImageWithGemini(base64ImageData, mimeType, imageEditPrompt);
      
      if (result && result.editedImageData) {
        const newImageDataUrl = `data:${result.newMimeType};base64,${result.editedImageData}`;
        const editedImageObject = {
          id: generateId(),
          src: { large: newImageDataUrl, medium: newImageDataUrl },
          url: newImageDataUrl,
          alt: `Edited hero image: ${imageEditPrompt.substring(0,30)}...`,
          photographer: "Edited with Gemini AI"
        };
        await updateStore(storeId, { heroImage: editedImageObject });
        toast({ title: "Hero Image Edited", description: "Hero image updated with AI edit." });
        setIsEditModalOpen(false); setImageEditPrompt('');
        // No theme switch for image updates
      } else { throw new Error("AI did not return an edited image."); }
    } catch (error) {
      console.error("Error editing hero image:", error);
      toast({ title: "Image Edit Failed", description: error.message, variant: "destructive" });
    }
    setIsEditingImage(false);
  }, [currentHeroImageUrl, imageEditPrompt, storeId, updateStore, toast, convertImageSrcToBasics]);

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-gray-100 to-stone-200 dark:from-slate-900 dark:via-gray-800 dark:to-stone-900 py-20 md:py-32 lg:py-40 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left space-y-6 lg:space-y-8"
          >
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight"
              style={primaryColor ? { color: primaryColor } : {}}
            >
              <InlineTextEdit
                as="div"
                textClassName="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight"
                initialText={title}
                onSave={(newText) => handleSaveText('classicHeroTitle', newText)}
                isAdmin={isAdmin}
                placeholder="Enter Hero Title"
                useTextarea={true}
              />
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              <InlineTextEdit
                as="div"
                textClassName="text-lg md:text-xl text-muted-foreground"
                initialText={subtitle}
                onSave={(newText) => handleSaveText('classicHeroDescription', newText)}
                isAdmin={isAdmin}
                placeholder="Enter Hero Subtitle"
                useTextarea={true}
              />
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
              <Button asChild size="lg" className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
                <Link to={primaryCtaLink} onClick={(e) => handleScrollTo(e, primaryCtaLink.substring(1))}>
                  <InlineTextEdit
                    as="span"
                    initialText={primaryCtaText}
                    onSave={(newText) => handleSaveText('classicHeroPrimaryCtaText', newText)}
                    isAdmin={isAdmin}
                    placeholder="Shop Now"
                  />
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 text-foreground border-foreground/30 hover:bg-foreground/5">
                <Link to={secondaryCtaLink} onClick={(e) => handleScrollTo(e, secondaryCtaLink.substring(1))}>
                  <InlineTextEdit
                    as="span"
                    initialText={secondaryCtaText}
                    onSave={(newText) => handleSaveText('classicHeroSecondaryCtaText', newText)}
                    isAdmin={isAdmin}
                    placeholder="Explore"
                  />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
            className="relative aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl group"
          >
            {!isPublishedView && videoUrl && (
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 z-20 bg-background/70 hover:bg-background/90 text-foreground"
                onClick={handleOpenReplaceModal}
                title="Replace Video"
              >
                <Edit2Icon className="h-5 w-5" />
              </Button>
            )}
            {videoUrl ? (
              <video
                key={videoUrl} 
                src={videoUrl}
                poster={currentHeroImageUrl} 
                autoPlay
                loop
                muted
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img
                src={currentHeroImageUrl}
                alt="Hero visual"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                loading="eager"
              />
            )}
            {isAdmin && !videoUrl && (
              <div className="absolute top-2 right-2 z-20 flex flex-col space-y-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setIsImageModalOpen(true)}
                  className="shadow-md"
                >
                  <Replace className="mr-2 h-4 w-4" /> Change Image
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="shadow-md bg-background/70 hover:bg-background/90"
                >
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Image
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {!isPublishedView && videoUrl && storeId && (
        <ReplaceVideoModal
          open={isReplaceModalOpen}
          onOpenChange={setIsReplaceModalOpen}
          storeId={storeId}
          currentVideoUrl={videoUrl}
          onVideoReplaced={handleVideoReplaced}
        />
      )}

      {isAdmin && !videoUrl && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Change Hero Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Search Pexels or describe for AI..." 
                  value={imageSearchQuery}
                  onChange={(e) => setImageSearchQuery(e.target.value)}
                />
                <Button onClick={handlePexelsSearch} disabled={isImageLoading || !imageSearchQuery.trim()}>
                  {isImageLoading && searchedImages.length === 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />} <span className="ml-2 hidden sm:inline">Pexels</span>
                </Button>
                <Button onClick={handleGeminiGenerate} variant="outline" disabled={isImageLoading || !imageSearchQuery.trim()}>
                    {isImageLoading && searchedImages.length > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand className="h-4 w-4" />} <span className="ml-2 hidden sm:inline">Gemini</span>
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('upload-v1-hero-image-input')?.click()} disabled={isImageLoading}>
                  <UploadCloud className="h-4 w-4" /> <span className="ml-2 hidden sm:inline">Upload</span>
                </Button>
                <Input 
                  type="file" 
                  id="upload-v1-hero-image-input" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
              </div>
              {isImageLoading && searchedImages.length === 0 && <p className="text-center text-sm text-muted-foreground">Searching for images or processing upload...</p>}
              {searchedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                  {searchedImages.map(img => (
                    <motion.div 
                      key={img.id} 
                      className="relative aspect-video rounded-md overflow-hidden cursor-pointer group border-2 border-transparent hover:border-primary transition-all"
                      onClick={() => selectHeroImage(img)}
                      whileHover={{scale: 1.05}}
                      initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}}
                    >
                      <img src={img.src.medium} alt={img.alt || 'Search result'} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <CheckCircleIcon className="h-8 w-8 text-white"/>
                      </div>
                      <p className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                        {img.photographer || img.alt}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isAdmin && !videoUrl && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Hero Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {currentHeroImageUrl && (
                <div className="flex items-center space-x-2 mb-4">
                  <img src={currentHeroImageUrl} alt="Current hero image to edit" className="h-20 w-auto object-contain rounded border"/>
                  <p className="text-sm text-muted-foreground">Editing current hero image</p>
                </div>
              )}
              <Label htmlFor="v1HeroEditPrompt" className="text-left">Edit Instruction:</Label>
              <Textarea
                id="v1HeroEditPrompt"
                placeholder="e.g., 'make the background blue', 'add sunglasses'"
                value={imageEditPrompt}
                onChange={(e) => setImageEditPrompt(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isEditingImage}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleHeroImageEditSave} disabled={isEditingImage || !imageEditPrompt.trim()}>
                {isEditingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                Apply Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};

export default StoreHero;
