
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ArrowRight, ShoppingBag, Edit2Icon, Replace, Edit3, Wand, Loader2, ImageDown as ImageUp, UploadCloud } from 'lucide-react'; // Corrected ImageUp import
import ReplaceVideoModal from './ReplaceVideoModal';
import { useStore } from '@/contexts/StoreContext';
import InlineTextEdit from '@/components/ui/InlineTextEdit'; // Added for inline editing
import { generateHeroContent } from '@/lib/gemini'; // Import Gemini function
import { fetchPexelsImages, generateImageWithGemini, generateId } from '@/lib/utils';
import { editImageWithGemini } from '@/lib/geminiImageGeneration';
import { useToast } from '@/components/ui/use-toast';

// Helper to check if a string is likely Base64 (copied from ProductDetail.jsx for consistency if needed, though not directly used for Pexels URL)
const isBase64 = (str) => {
  if (typeof str !== 'string' || str.includes('://')) return false;
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
};

const StoreHero = ({ store, isPublishedView = false }) => {
  const { name, theme, heroImage, content, id: storeId, hero_video_url, hero_video_poster_url, niche, description: storeDescription, targetAudience, style } = store;
  const { updateStore, updateStoreTextContent } = useStore(); // Added updateStoreTextContent
  const { toast } = useToast();

  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);

  const [aiHeroTitle, setAiHeroTitle] = useState('');
  const [aiHeroDescription, setAiHeroDescription] = useState('');
  const [isLoadingAiContent, setIsLoadingAiContent] = useState(false);

  // State for Pexels background image
  const [pexelsImageUrl, setPexelsImageUrl] = useState(
    store.heroPexelsImageUrl || 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  );

  // States for "Change Background Image" modal
  const [isChangeBgImageModalOpen, setIsChangeBgImageModalOpen] = useState(false);
  const [bgImageSearchQuery, setBgImageSearchQuery] = useState(store.niche || name || 'modern abstract');
  const [searchedBgImages, setSearchedBgImages] = useState([]);
  const [isBgImageLoading, setIsBgImageLoading] = useState(false);

  // States for "Edit Background Image" modal
  const [isEditBgImageModalOpen, setIsEditBgImageModalOpen] = useState(false);
  const [bgImageEditPrompt, setBgImageEditPrompt] = useState('');
  const [isEditingBgImage, setIsEditingBgImage] = useState(false);
  
  const convertImageSrcToBasics = useCallback((imageSrc) => {
    return new Promise((resolve, reject) => {
      if (!imageSrc) {
        return reject(new Error("Image source is undefined or null."));
      }
      if (imageSrc.startsWith('data:')) {
        try {
          const parts = imageSrc.split(',');
          if (parts.length < 2) throw new Error("Invalid data URL structure.");
          const metaPart = parts[0];
          const base64Data = parts[1];
          const mimeTypeMatch = metaPart.match(/:(.*?);/);
          if (!mimeTypeMatch || !mimeTypeMatch[1]) throw new Error("Could not parse MIME type from data URL.");
          const mimeType = mimeTypeMatch[1];
          resolve({ base64ImageData: base64Data, mimeType });
        } catch (error) {
          console.error("Error parsing data URL:", imageSrc, error);
          reject(new Error(`Invalid data URL format: ${error.message}`));
        }
      } else { 
        const img = new Image();
        img.crossOrigin = 'Anonymous'; 
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          try {
            const dataUrl = canvas.toDataURL('image/png'); 
            const parts = dataUrl.split(',');
            const base64Data = parts[1];
            resolve({ base64ImageData: base64Data, mimeType: 'image/png' });
          } catch (e) {
            console.error("Canvas toDataURL failed:", e);
            reject(new Error("Canvas toDataURL failed, possibly due to CORS or tainted canvas. " + e.message));
          }
        };
        img.onerror = (e) => {
          console.error("Failed to load image from URL for conversion:", imageSrc, e);
          reject(new Error("Failed to load image from URL for conversion."));
        };
        img.src = imageSrc;
      }
    });
  }, []);

  useEffect(() => {
    const fetchInitialPexelsImage = async () => {
      if (store.heroPexelsImageUrl) {
        setPexelsImageUrl(store.heroPexelsImageUrl);
      } else {
        // Attempt to fetch a relevant Pexels image if no custom one is set
        const query = store.niche || name || storeDescription || 'modern abstract background';
        if (query) {
          try {
            // Fetch 1 image, landscape orientation
            const images = await fetchPexelsImages(query, 1, 'landscape'); 
            if (images && images.length > 0 && images[0].src && images[0].src.large) {
              setPexelsImageUrl(images[0].src.large);
              // Do NOT save this back to the store automatically. 
              // This is just a dynamic default.
            } else {
              // Fallback to the hardcoded default if Pexels fetch fails or returns no image
              setPexelsImageUrl('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
            }
          } catch (error) {
            console.error("Error fetching initial Pexels image for hero:", error);
            // Fallback to the hardcoded default on error
            setPexelsImageUrl('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
          }
        } else {
           // Fallback if no query terms are available
           setPexelsImageUrl('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
        }
      }
    };

    fetchInitialPexelsImage();
  }, [storeId, store.heroPexelsImageUrl, store.niche, name, storeDescription, fetchPexelsImages]); // Added storeId to dependencies


  useEffect(() => {
    if (store && name) { // Only run if store and name are available
      setIsLoadingAiContent(true);
      const storeInfoForAI = {
        name,
        niche: store.niche || content?.niche, // Prioritize top-level, then content
        description: store.description || content?.description, // Prioritize top-level, then content
        targetAudience: store.targetAudience || content?.targetAudience,
        style: store.style || content?.style,
      };
      
      generateHeroContent(storeInfoForAI)
        .then(data => {
          if (data && !data.error) {
            setAiHeroTitle(data.heroTitle);
            setAiHeroDescription(data.heroDescription);
          } else {
            console.error("Failed to generate AI hero content:", data?.error);
            // Optionally, clear AI content or use defaults explicitly
            setAiHeroTitle(''); 
            setAiHeroDescription('');
          }
        })
        .catch(error => {
          console.error("Error calling generateHeroContent:", error);
          setAiHeroTitle('');
          setAiHeroDescription('');
        })
        .finally(() => {
          setIsLoadingAiContent(false);
        });
    }
  }, [storeId, name, store.niche, store.description, store.targetAudience, store.style, content?.niche, content?.description, content?.targetAudience, content?.style]); // Re-run if these specific store details change

  const heroTitle = isLoadingAiContent ? "Crafting something special..." : (aiHeroTitle || content?.heroTitle || `Welcome to ${name}`);
  const heroDescription = isLoadingAiContent ? "Just a moment..." : (aiHeroDescription || content?.heroDescription || `Explore ${name}, your destination for amazing products.`);
  
  const imageUrl = heroImage?.src?.large || heroImage?.url || 'https://via.placeholder.com/1200x800.png?text=Store+Image'; // This is for the foreground image element, not the pexels background
  const imageAlt = heroImage?.alt || heroImage?.altText || `${name} hero image`;

  const videoPoster = hero_video_poster_url || imageUrl;

  const handleOpenReplaceModal = () => {
    setIsReplaceModalOpen(true);
  };

  const handleVideoReplaced = async (newVideoUrl) => {
    if (storeId && newVideoUrl) {
      try {
        // We might want to generate a new poster for the new video, or clear it.
        // For now, let's clear it. A more advanced solution could generate a poster.
        await updateStore(storeId, { hero_video_url: newVideoUrl, hero_video_poster_url: '' });
        // The modal closes itself on success, so no need to setIsReplaceModalOpen(false) here
      } catch (error) {
        console.error("Failed to update store with new video URL:", error);
        // Optionally, show a toast message for failure here
      }
    }
  };
  
  // Handlers for background image change
  const handleBgPexelsSearch = async () => {
    if (!bgImageSearchQuery.trim()) return;
    setIsBgImageLoading(true);
    try {
      const images = await fetchPexelsImages(bgImageSearchQuery, 5, 'landscape'); // landscape for hero
      setSearchedBgImages(images);
    } catch (error) {
      toast({ title: "Pexels search failed", description: error.message, variant: "destructive" });
    }
    setIsBgImageLoading(false);
  };

  const handleBgGeminiGenerate = async () => {
    if (!bgImageSearchQuery.trim()) return;
    setIsBgImageLoading(true);
    try {
      const geminiPrompt = `Hero background image for a store about: ${bgImageSearchQuery}, ${store?.niche || store?.type || 'ecommerce site'}. Style: ${store?.style || 'modern and appealing'}.`;
      const newImage = await generateImageWithGemini(geminiPrompt);
      setSearchedBgImages(prev => [{ id: Date.now().toString(), src: { large: newImage.url, medium: newImage.url }, alt: newImage.alt, photographer: "Gemini AI" }, ...prev.slice(0,4)]);
      toast({title: "Image Generated", description: "Gemini AI generated a background image."});
    } catch (error) {
      toast({ title: "Gemini image generation failed", description: error.message, variant: "destructive" });
    }
    setIsBgImageLoading(false);
  };

  const handleBgImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsBgImageLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = {
          id: generateId(),
          src: { large: reader.result, medium: reader.result }, // Use large for background
          alt: file.name,
          photographer: "Uploaded by user" 
        };
        selectBgImage(newImage); // This will also close the modal
        toast({ title: "Image Uploaded", description: `${file.name} has been set as the hero background.` });
        setIsBgImageLoading(false);
      };
      reader.onerror = () => {
        toast({ title: "Upload Failed", description: "Could not read the selected file.", variant: "destructive" });
        setIsBgImageLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const selectBgImage = async (selectedImg) => {
    const newImageUrl = selectedImg.src.large; // Pexels items have src.large
    try {
      await updateStore(storeId, { heroPexelsImageUrl: newImageUrl });
      setPexelsImageUrl(newImageUrl);
      setIsChangeBgImageModalOpen(false);
      setSearchedBgImages([]);
      toast({ title: "Hero Background Updated", description: "The hero background image has been changed." });
    } catch (error) {
      console.error("Failed to update hero background image:", error);
      toast({ title: "Update Failed", description: "Could not save the new hero background.", variant: "destructive" });
    }
  };

  const handleBgImageEditSave = useCallback(async () => {
    if (!bgImageEditPrompt.trim() || !pexelsImageUrl) {
      toast({ title: "Missing data", description: "Original image URL or edit prompt is missing.", variant: "destructive" });
      return;
    }
    setIsEditingBgImage(true);
    try {
      const { base64ImageData, mimeType } = await convertImageSrcToBasics(pexelsImageUrl);
      const result = await editImageWithGemini(base64ImageData, mimeType, bgImageEditPrompt);
      
      if (result && result.editedImageData) {
        const newImageDataUrl = `data:${result.newMimeType};base64,${result.editedImageData}`;
        await updateStore(storeId, { heroPexelsImageUrl: newImageDataUrl });
        setPexelsImageUrl(newImageDataUrl);
        toast({ title: "Background Image Edited", description: "Hero background updated with AI edit." });
        setIsEditBgImageModalOpen(false);
        setBgImageEditPrompt('');
      } else {
        throw new Error("AI did not return an edited image.");
      }
    } catch (error) {
      console.error("Error editing background image:", error);
      toast({ title: "Background Edit Failed", description: error.message, variant: "destructive" });
    }
    setIsEditingBgImage(false);
  }, [pexelsImageUrl, bgImageEditPrompt, storeId, updateStore, toast, convertImageSrcToBasics, setPexelsImageUrl, setIsEditBgImageModalOpen, setBgImageEditPrompt, setIsEditingBgImage]);


  const scrollToProducts = () => {
    const productsSection = document.getElementById(`products-${storeId}`);
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="relative overflow-hidden text-white bg-cover bg-center group" // Added group for button visibility
      style={{ backgroundImage: `url(${pexelsImageUrl})` }}
    >
      {!isPublishedView && (
        <>
          <Button 
            variant="secondary" 
            onClick={() => setIsChangeBgImageModalOpen(true)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md z-20"
            aria-label="Change hero background image"
          >
            <Replace className="mr-2 h-4 w-4" /> Change Background
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditBgImageModalOpen(true)}
            className="absolute top-16 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md z-20 bg-background/50 hover:bg-background/80"
            aria-label="Edit hero background image"
          >
            <Edit3 className="mr-2 h-4 w-4" /> Edit Background
          </Button>
        </>
      )}
      {/* Optional: A semi-transparent overlay can be added here if text readability is an issue over diverse images */}
      {/* <div className="absolute inset-0 bg-black/20"></div> */}
      <div className="absolute inset-0 hero-pattern opacity-10 dark:opacity-5"></div>
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent"
      ></div>
      
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="space-y-6 text-center md:text-left"
          >
            <InlineTextEdit
              initialText={heroTitle}
              onSave={updateStoreTextContent}
              identifier="content.heroTitle"
              isPublishedView={isPublishedView}
              as="h1"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
              style={{ color: theme.primaryColor }}
              disabled={isLoadingAiContent} // Disable editing while AI content is loading
            />
            
            <InlineTextEdit
              initialText={heroDescription}
              onSave={updateStoreTextContent}
              identifier="content.heroDescription"
              isPublishedView={isPublishedView}
              as="p"
              className="text-lg text-white max-w-lg mx-auto md:mx-0"
              disabled={isLoadingAiContent} // Disable editing while AI content is loading
            />
            
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-4">
              <Button 
                size="lg"
                className="rounded shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-opacity-80 transform hover:scale-105"
                style={{ backgroundColor: theme.primaryColor, color: 'white' }}
                onClick={scrollToProducts}
              >
                Shop Collection
                <ShoppingBag className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="rounded shadow-sm hover:shadow-md transition-all duration-300 hover:text-white"
                style={{ 
                  borderColor: theme.primaryColor,
                  color: theme.primaryColor,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={scrollToProducts} 
              >
                Explore More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 100 }}
            className="relative group"
          >
            <div 
              className="absolute -inset-2 rounded-md opacity-50 group-hover:opacity-70 transition-opacity duration-300" 
              style={{ background: `linear-gradient(45deg, ${theme.secondaryColor || '#FF00FF'}, ${theme.primaryColor || '#00FFFF'})`}} // Changed glow
            ></div>
            <div className="aspect-video md:aspect-[5/4] rounded-md overflow-hidden shadow-2xl relative z-10 transform group-hover:scale-105 transition-transform duration-300 bg-black"> {/* Added bg-black for video letterboxing */}
              {!isPublishedView && hero_video_url && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 z-20 bg-background/70 hover:bg-background/90 text-foreground rounded"
                  onClick={handleOpenReplaceModal}
                  title="Replace Video"
                >
                  <Edit2Icon className="h-5 w-5" />
                </Button>
              )}
              {hero_video_url ? (
                <video
                  src={hero_video_url}
                  key={hero_video_url} // Add key to force re-render when src changes
                  poster={videoPoster}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  onError={(e) => console.error("Error playing video:", e)}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  alt={imageAlt}
                  className="w-full h-full object-cover"
                  src={imageUrl} 
                />
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute bottom-4 left-4 right-4 md:left-auto md:bottom-4 md:right-4 md:w-auto bg-background/80 backdrop-blur-sm rounded p-4 shadow-xl z-20 hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="h-12 w-12 rounded flex items-center justify-center text-white text-2xl font-bold" 
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {name.substring(0,1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white">{name}</p> 
                    <p className="text-sm text-indigo-200">New Arrivals Daily</p>
                  </div>
                </div>
              </motion.div>
            </div>

          </motion.div>
        </div>
      </div>
      {!isPublishedView && hero_video_url && storeId && (
        <ReplaceVideoModal
          open={isReplaceModalOpen}
          onOpenChange={setIsReplaceModalOpen}
          storeId={storeId}
          currentVideoUrl={hero_video_url}
          onVideoReplaced={handleVideoReplaced}
        />
      )}

      {!isPublishedView && (
        <>
          {/* Dialog for Changing Hero Background Image */}
          <Dialog open={isChangeBgImageModalOpen} onOpenChange={setIsChangeBgImageModalOpen}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Change Hero Background Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Search Pexels or describe for AI..." 
                    value={bgImageSearchQuery}
                    onChange={(e) => setBgImageSearchQuery(e.target.value)}
                  />
                  <Button onClick={handleBgPexelsSearch} disabled={isBgImageLoading || !bgImageSearchQuery.trim()}>
                    {isBgImageLoading && searchedBgImages.length === 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />} <span className="ml-2 hidden sm:inline">Pexels</span>
                  </Button>
                  <Button onClick={handleBgGeminiGenerate} variant="outline" disabled={isBgImageLoading || !bgImageSearchQuery.trim()}>
                     {isBgImageLoading && searchedBgImages.length > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand className="h-4 w-4" />} <span className="ml-2 hidden sm:inline">Gemini</span>
                  </Button>
                  <Button variant="outline" onClick={() => document.getElementById('upload-bg-image-input')?.click()} disabled={isBgImageLoading}>
                    <UploadCloud className="h-4 w-4" /> <span className="ml-2 hidden sm:inline">Upload</span>
                  </Button>
                  <Input 
                    type="file" 
                    id="upload-bg-image-input" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleBgImageUpload}
                  />
                </div>
                {isBgImageLoading && searchedBgImages.length === 0 && <p className="text-center text-sm text-muted-foreground">Searching for images or processing upload...</p>}
                {searchedBgImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                    {searchedBgImages.map(img => (
                      <motion.div 
                        key={img.id} 
                        className="relative aspect-video rounded-md overflow-hidden cursor-pointer group border-2 border-transparent hover:border-primary transition-all" // aspect-video for landscape
                        onClick={() => selectBgImage(img)}
                        whileHover={{scale: 1.05}}
                        initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}}
                      >
                        <img src={img.src.medium} alt={img.alt || 'Search result'} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-white"/>
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

          {/* Dialog for Editing Hero Background Image */}
          <Dialog open={isEditBgImageModalOpen} onOpenChange={setIsEditBgImageModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Hero Background Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {pexelsImageUrl && (
                  <div className="flex items-center space-x-2 mb-4">
                    <img src={pexelsImageUrl} alt="Current hero background to edit" className="h-20 w-32 object-cover rounded border"/> {/* Aspect ratio for hero */}
                    <p className="text-sm text-muted-foreground">Editing current background</p>
                  </div>
                )}
                <Label htmlFor="bgEditPrompt" className="text-left">Edit Instruction:</Label>
                <Textarea
                  id="bgEditPrompt"
                  placeholder="e.g., 'make the sky purple', 'add a futuristic city skyline'"
                  value={bgImageEditPrompt}
                  onChange={(e) => setBgImageEditPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isEditingBgImage}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleBgImageEditSave} disabled={isEditingBgImage || !bgImageEditPrompt.trim()}>
                  {isEditingBgImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                  Apply Edit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </section>
  );
};

// CheckCircle icon component (copied from ProductDetail.jsx)
const CheckCircle = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default StoreHero;
