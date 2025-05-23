import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag, Edit2Icon, Replace, Edit3, Wand, Loader2, ImageDown as ImageUp, UploadCloud, CheckCircle as CheckCircleIcon } from 'lucide-react';
import ReplaceVideoModal from './ReplaceVideoModal';
import { useStore } from '@/contexts/StoreContext';
import { generateHeroContent } from '@/lib/gemini';
import InlineTextEdit from '@/components/ui/InlineTextEdit';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fetchPexelsImages, generateImageWithGemini, generateId } from '@/lib/utils';
import { editImageWithGemini } from '@/lib/geminiImageGeneration';
import { useToast } from '@/components/ui/use-toast';

const StoreHero = ({ store, isPublishedView = false }) => {
  const { name, theme, heroImage, content, id: storeId, hero_video_url, hero_video_poster_url, niche, description: storeDescription, targetAudience, style, template_version } = store;
  const { updateStore, updateStoreTemplateVersion } = useStore(); // Ensure updateStoreTemplateVersion is available
  const { toast } = useToast();

  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const isAdmin = !isPublishedView;

  const [aiHeroTitle, setAiHeroTitle] = useState('');
  const [aiHeroDescription, setAiHeroDescription] = useState('');
  const [isLoadingAiContent, setIsLoadingAiContent] = useState(false);

  const initialBackgroundImage = store?.theme?.heroConfig?.backgroundImage || {
    src: { large: 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    url: 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    alt: 'Default hero background'
  };
  const [currentBackgroundImage, setCurrentBackgroundImage] = useState(initialBackgroundImage);
  
  const currentBackgroundImageUrl = currentBackgroundImage?.src?.large || currentBackgroundImage?.url || 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [searchedImages, setSearchedImages] = useState([]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imageEditPrompt, setImageEditPrompt] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);
  
  useEffect(() => {
    if (store?.niche || store?.name) {
      setImageSearchQuery(store.niche || store.name + " abstract background");
    }
    const newBgImageFromStore = store?.theme?.heroConfig?.backgroundImage || initialBackgroundImage;
    if (newBgImageFromStore?.src?.large !== currentBackgroundImage?.src?.large) {
      setCurrentBackgroundImage(newBgImageFromStore);
    }
  }, [store?.theme?.heroConfig?.backgroundImage, store?.niche, store?.name]);

  useEffect(() => {
    const fetchAndSetInitialPexelsImage = async () => {
      const isDefaultOrUnset = !store?.theme?.heroConfig?.backgroundImage || 
                               store?.theme?.heroConfig?.backgroundImage?.url === 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' ||
                               !store?.theme?.heroConfig?.backgroundImageUrl ||
                               store?.theme?.heroConfig?.backgroundImageUrl === 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

      if (storeId && isDefaultOrUnset && (store.niche || store.name)) {
        const query = `${store.niche || store.name} abstract background`;
        try {
          const images = await fetchPexelsImages(query, 1, 'landscape');
          if (images && images.length > 0) {
            const pexelsImage = images[0];
            const newImageObject = {
              id: pexelsImage.id?.toString() || generateId(),
              src: { 
                large: pexelsImage.src.large,
                medium: pexelsImage.src.medium || pexelsImage.src.large 
              },
              url: pexelsImage.src.large,
              alt: pexelsImage.alt || query,
              photographer: pexelsImage.photographer || "Pexels"
            };
            const updatedTheme = {
              ...theme,
              heroConfig: {
                ...(theme?.heroConfig || {}),
                backgroundImage: newImageObject,
                backgroundImageUrl: newImageObject.src.large 
              }
            };
            await updateStore(storeId, { theme: updatedTheme });
            setCurrentBackgroundImage(newImageObject);
            toast({ title: "Hero Background Updated", description: "Set a relevant hero background from Pexels." });
          }
        } catch (error) {
          console.error("Error fetching initial Pexels image for hero:", error);
        }
      }
    };
    fetchAndSetInitialPexelsImage();
  }, [storeId, store?.niche, store?.name, store?.theme?.heroConfig?.backgroundImage, store?.theme?.heroConfig?.backgroundImageUrl, theme, updateStore, toast ]);

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
        img.onerror = (e) => reject(new Error("Failed to load image from URL."));
        img.src = imageSrc;
      }
    });
  }, []);

  const handlePexelsSearch_v2 = async () => {
    if (!imageSearchQuery.trim()) return;
    setIsImageLoading(true); setSearchedImages([]);
    try {
      const images = await fetchPexelsImages(imageSearchQuery, 5, 'landscape');
      setSearchedImages(images);
    } catch (error) { toast({ title: "Image search failed", description: error.message, variant: "destructive" }); }
    setIsImageLoading(false);
  };
  
  const handleGeminiGenerate_v2 = async () => {
    if (!imageSearchQuery.trim()) return;
    setIsImageLoading(true);
    try {
      const geminiPrompt = `Store hero background image for: ${imageSearchQuery}, theme: ${theme?.name || 'general e-commerce'}`;
      const newImage = await generateImageWithGemini(geminiPrompt, 'landscape');
      setSearchedImages(prev => [{ id: Date.now().toString(), src: { medium: newImage.url, large: newImage.url }, url: newImage.url, alt: newImage.alt, photographer: "Gemini AI" }, ...prev.slice(0,4)]);
      toast({title: "Image Generated", description: "Gemini AI generated an image."});
    } catch (error) { toast({ title: "Gemini image generation failed", description: error.message, variant: "destructive" }); }
    setIsImageLoading(false);
  };

  const handleImageUpload_v2 = (event) => {
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
        selectHeroBackgroundImage(newImage); 
        toast({ title: "Image Uploaded", description: `${file.name} has been set as the background image.` });
        setIsImageLoading(false); setIsImageModalOpen(false);
      };
      reader.onerror = () => { toast({ title: "Upload Failed", description: "Could not read the selected file.", variant: "destructive" }); setIsImageLoading(false); };
      reader.readAsDataURL(file);
    }
  };

  const performThemeSwitch = async () => { // Re-add function definition
    const originalVersion = store?.template_version || 'v2';
    if (originalVersion === 'v2') {
      await updateStoreTemplateVersion(storeId, 'v1');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await updateStoreTemplateVersion(storeId, originalVersion);
    }
  };

  const selectHeroBackgroundImage = async (selectedImg) => {
    if (!storeId) return;
    const newImageObject = {
      id: selectedImg.id || generateId(),
      src: { 
        large: selectedImg.src.large,
        medium: selectedImg.src.medium || selectedImg.src.large 
      },
      url: selectedImg.src.large,
      alt: selectedImg.alt || imageSearchQuery || "Hero Background Image",
      photographer: selectedImg.photographer || "Unknown"
    };
    try {
      const updatedTheme = {
        ...theme,
        heroConfig: {
          ...(theme?.heroConfig || {}),
          backgroundImage: newImageObject,
          backgroundImageUrl: newImageObject.src.large 
        }
      };
      await updateStore(storeId, { theme: updatedTheme });
      setCurrentBackgroundImage(newImageObject); 
      toast({ title: "Background Image Updated", description: "The hero background image has been changed." });
      setIsImageModalOpen(false); setSearchedImages([]);
      // No theme switch here
    } catch (error) {
      console.error("Failed to update hero background image:", error);
      toast({ title: "Update Failed", description: "Could not save the new background image.", variant: "destructive" });
    }
  };

  const handleHeroBackgroundImageEditSave = useCallback(async () => {
    if (!imageEditPrompt.trim() || !currentBackgroundImageUrl) {
      toast({ title: "Missing data", description: "Original image or edit prompt is missing.", variant: "destructive" }); return;
    }
    setIsEditingImage(true);
    try {
      const { base64ImageData, mimeType } = await convertImageSrcToBasics(currentBackgroundImageUrl);
      const result = await editImageWithGemini(base64ImageData, mimeType, imageEditPrompt);
      
      if (result && result.editedImageData) {
        const newImageDataUrl = `data:${result.newMimeType};base64,${result.editedImageData}`;
        const editedImageObject = {
          id: generateId(),
          src: { large: newImageDataUrl, medium: newImageDataUrl },
          url: newImageDataUrl,
          alt: `Edited hero background: ${imageEditPrompt.substring(0,30)}...`,
          photographer: "Edited with Gemini AI"
        };
        const updatedTheme = {
          ...theme,
          heroConfig: {
            ...(theme?.heroConfig || {}),
            backgroundImage: editedImageObject,
            backgroundImageUrl: newImageDataUrl
          }
        };
        await updateStore(storeId, { theme: updatedTheme });
        setCurrentBackgroundImage(editedImageObject);
        toast({ title: "Background Image Edited", description: "Background image updated with AI edit." });
        setIsEditModalOpen(false); setImageEditPrompt('');
        // No theme switch here
      } else { throw new Error("AI did not return an edited image."); }
    } catch (error) {
      console.error("Error editing background image:", error);
      toast({ title: "Image Edit Failed", description: error.message, variant: "destructive" });
    }
    setIsEditingImage(false);
  }, [currentBackgroundImageUrl, imageEditPrompt, storeId, updateStore, toast, convertImageSrcToBasics, theme]);


  useEffect(() => {
    if (store && name) { 
      setIsLoadingAiContent(true);
      const storeInfoForAI = {
        name, niche: store.niche || content?.niche, 
        description: store.description || content?.description, 
        targetAudience: store.targetAudience || content?.targetAudience,
        style: store.style || content?.style,
      };
      generateHeroContent(storeInfoForAI)
        .then(data => {
          if (data && !data.error) {
            setAiHeroTitle(data.heroTitle); setAiHeroDescription(data.heroDescription);
          } else {
            console.error("Failed to generate AI hero content:", data?.error);
            setAiHeroTitle(''); setAiHeroDescription('');
          }
        })
        .catch(error => {
          console.error("Error calling generateHeroContent:", error);
          setAiHeroTitle(''); setAiHeroDescription('');
        })
        .finally(() => setIsLoadingAiContent(false));
    }
  }, [storeId, name, store.niche, store.description, store.targetAudience, store.style, content?.niche, content?.description, content?.targetAudience, content?.style]);

  const heroTitle = isLoadingAiContent ? "Crafting something special..." : (content?.modernHeroTitle || aiHeroTitle || `Welcome to ${name}`);
  const heroDescription = isLoadingAiContent ? "Just a moment..." : (content?.modernHeroDescription || aiHeroDescription || `Explore ${name}, your destination for amazing products.`);
  const primaryCtaText = content?.modernHeroPrimaryCtaText || content?.heroPrimaryCtaText || "Shop Collection";
  const secondaryCtaText = content?.modernHeroSecondaryCtaText || content?.heroSecondaryCtaText || "Explore More";
  const overlaySubText = content?.modernHeroOverlaySubText || content?.heroOverlaySubText || "New Arrivals Daily";

  const displayImageUrl = heroImage?.src?.large || heroImage?.url || 'https://via.placeholder.com/1200x800.png?text=Store+Image';
  const imageAlt = heroImage?.alt || heroImage?.altText || `${name} hero image`;
  const videoPoster = hero_video_poster_url || displayImageUrl;

  const handleOpenReplaceModal = () => setIsReplaceModalOpen(true);

  const handleVideoReplaced = async (newVideoUrl) => {
    if (storeId && newVideoUrl) {
      try { await updateStore(storeId, { hero_video_url: newVideoUrl, hero_video_poster_url: '' }); } 
      catch (error) { console.error("Failed to update store with new video URL:", error); }
    }
  };

  const scrollToProducts = () => {
    const productsSection = document.getElementById(`products-${storeId}`);
    if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveText = async (field, value) => {
    if (storeId) {
      try {
        await updateStore(storeId, { content: { ...content, [field]: value } });
        await performThemeSwitch(); // Re-add theme switch for text edits
      } catch (error) { console.error(`Failed to update store ${field}:`, error); }
    }
  };

  return (
    <section
      key={currentBackgroundImageUrl} 
      className="relative overflow-hidden text-white bg-cover bg-center group"
      style={{ backgroundImage: `url(${currentBackgroundImageUrl})` }}
    >
      {isAdmin && (
        <div className="absolute top-4 right-4 z-30 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="secondary" size="sm" onClick={() => setIsImageModalOpen(true)} className="shadow-md">
            <Replace className="mr-2 h-4 w-4" /> Change Image
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} className="shadow-md bg-background/70 hover:bg-background/90">
            <Edit3 className="mr-2 h-4 w-4" /> Edit Image
          </Button>
        </div>
      )}
      <div className="absolute inset-0 hero-pattern opacity-10 dark:opacity-5"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent"></div>
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }} className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight" style={{ color: theme.primaryColor }}>
              <InlineTextEdit
                as="div"
                textClassName="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight"
                initialText={heroTitle}
                onSave={(newText) => handleSaveText('modernHeroTitle', newText)}
                isAdmin={isAdmin}
                placeholder="Hero Title"
                useTextarea={true} 
              />
            </h1>
            <p className="text-lg text-white max-w-lg mx-auto md:mx-0">
              <InlineTextEdit
                as="div"
                textClassName="text-lg text-white" 
                initialText={heroDescription}
                onSave={(newText) => handleSaveText('modernHeroDescription', newText)}
                isAdmin={isAdmin}
                placeholder="Hero Description"
                useTextarea={true}
              />
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-4">
              <Button size="lg" className="rounded shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-opacity-80 transform hover:scale-105" style={{ backgroundColor: theme.primaryColor, color: 'white' }} onClick={scrollToProducts}>
                <InlineTextEdit
                  as="span"
                  initialText={primaryCtaText}
                  onSave={(newText) => handleSaveText('modernHeroPrimaryCtaText', newText)}
                  isAdmin={isAdmin}
                  placeholder="Shop Button"
                />
                <ShoppingBag className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="rounded shadow-sm hover:shadow-md transition-all duration-300 hover:text-white" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} onClick={scrollToProducts}>
                <InlineTextEdit
                  as="span"
                  initialText={secondaryCtaText}
                  onSave={(newText) => handleSaveText('modernHeroSecondaryCtaText', newText)}
                  isAdmin={isAdmin}
                  placeholder="Explore Button"
                />
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 100 }} className="relative group">
            <div className="absolute -inset-2 rounded-md opacity-50 group-hover:opacity-70 transition-opacity duration-300" style={{ background: `linear-gradient(45deg, ${theme.secondaryColor || '#FF00FF'}, ${theme.primaryColor || '#00FFFF'})`}}></div>
            <div className="aspect-video md:aspect-[5/4] rounded-md overflow-hidden shadow-2xl relative z-10 transform group-hover:scale-105 transition-transform duration-300 bg-black">
              {!isPublishedView && hero_video_url && (
                <Button variant="outline" size="icon" className="absolute top-2 right-2 z-20 bg-background/70 hover:bg-background/90 text-foreground rounded" onClick={handleOpenReplaceModal} title="Replace Video">
                  <Edit2Icon className="h-5 w-5" />
                </Button>
              )}
              {hero_video_url ? (
                <video src={hero_video_url} key={hero_video_url} poster={videoPoster} autoPlay loop muted playsInline className="w-full h-full object-cover" onError={(e) => console.error("Error playing video:", e)}>
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img alt={imageAlt} className="w-full h-full object-cover" src={displayImageUrl} />
              )}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="absolute bottom-4 left-4 right-4 md:left-auto md:bottom-4 md:right-4 md:w-auto bg-background/80 backdrop-blur-sm rounded p-4 shadow-xl z-20 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: theme.primaryColor }}>
                    {name.substring(0,1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white">{name}</p>
                    <p className="text-sm text-indigo-200">
                       <InlineTextEdit
                        as="span" 
                        textClassName="text-sm text-indigo-200"
                        initialText={overlaySubText}
                        onSave={(newText) => handleSaveText('modernHeroOverlaySubText', newText)}
                        isAdmin={isAdmin}
                        placeholder="Overlay Subtext"
                      />
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      {!isPublishedView && hero_video_url && storeId && (
        <ReplaceVideoModal open={isReplaceModalOpen} onOpenChange={setIsReplaceModalOpen} storeId={storeId} currentVideoUrl={hero_video_url} onVideoReplaced={handleVideoReplaced} />
      )}
      {isAdmin && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>Change Hero Background Image</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input placeholder="Search Pexels or describe for AI..." value={imageSearchQuery} onChange={(e) => setImageSearchQuery(e.target.value)} />
                <Button onClick={handlePexelsSearch_v2} disabled={isImageLoading || !imageSearchQuery.trim()}>
                  {isImageLoading && searchedImages.length === 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />} <span className="ml-2 hidden sm:inline">Pexels</span>
                </Button>
                <Button onClick={handleGeminiGenerate_v2} variant="outline" disabled={isImageLoading || !imageSearchQuery.trim()}>
                    {isImageLoading && searchedImages.length > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand className="h-4 w-4" />} <span className="ml-2 hidden sm:inline">Gemini</span>
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('upload-hero-bg-input')?.click()} disabled={isImageLoading}>
                  <UploadCloud className="h-4 w-4" /> <span className="ml-2 hidden sm:inline">Upload</span>
                </Button>
                <Input type="file" id="upload-hero-bg-input" className="hidden" accept="image/*" onChange={handleImageUpload_v2} />
              </div>
              {isImageLoading && searchedImages.length === 0 && <p className="text-center text-sm text-muted-foreground">Searching for images or processing upload...</p>}
              {searchedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                  {searchedImages.map(img => (
                    <motion.div key={img.id} className="relative aspect-video rounded-md overflow-hidden cursor-pointer group border-2 border-transparent hover:border-primary transition-all" onClick={() => selectHeroBackgroundImage(img)} whileHover={{scale: 1.05}} initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}}>
                      <img src={img.src.medium} alt={img.alt || 'Search result'} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <CheckCircleIcon className="h-8 w-8 text-white"/>
                      </div>
                      <p className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">{img.photographer || img.alt}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {isAdmin && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Edit Hero Background Image</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              {currentBackgroundImageUrl && (
                <div className="flex items-center space-x-2 mb-4">
                  <img src={currentBackgroundImageUrl} alt="Current background to edit" className="h-20 w-auto object-contain rounded border"/>
                  <p className="text-sm text-muted-foreground">Editing current background</p>
                </div>
              )}
              <Label htmlFor="heroBgEditPrompt" className="text-left">Edit Instruction:</Label>
              <Textarea id="heroBgEditPrompt" placeholder="e.g., 'make the sky dramatic sunset colors', 'add a futuristic city skyline'" value={imageEditPrompt} onChange={(e) => setImageEditPrompt(e.target.value)} rows={3} className="resize-none" />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={isEditingImage}>Cancel</Button></DialogClose>
              <Button onClick={handleHeroBackgroundImageEditSave} disabled={isEditingImage || !imageEditPrompt.trim()}>
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
