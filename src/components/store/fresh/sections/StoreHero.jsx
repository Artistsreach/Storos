import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Star, Edit2Icon } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import InlineTextEdit from "@/components/ui/InlineTextEdit";
import { Link } from "react-router-dom";
import FreshReplaceVideoModal from "./ReplaceVideoModal"; // Updated import path and name
import { searchPexelsPhotos } from "@/lib/pexels";

const StoreHero = ({ store, isPublishedView = false }) => {
  const { name, theme, heroImage, content, id: storeId, hero_video_url, hero_video_poster_url } = store;
  const { updateStoreTextContent, updateStore, viewMode } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideshowImages, setSlideshowImages] = useState([]);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.9]);

  const heroTitle = content?.heroTitle || `Welcome to ${name}`;
  const heroDescription =
    content?.heroDescription ||
    `Discover amazing products and experiences that will transform your lifestyle. Fresh ideas, delivered daily.`;
  const primaryCtaText = content?.heroPrimaryCtaText || "Explore Collection";
  const secondaryCtaText = content?.heroSecondaryCtaText || "Watch Our Story";
  const badgeText = content?.heroBadgeText || "Fresh Arrivals Daily";

  const videoUrl = store?.hero_video_url;
  const initialPosterUrl = store?.hero_video_poster_url || heroImage?.src?.large || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80";

  useEffect(() => {
    const fetchAndSetImages = async () => {
      if (!videoUrl) {
        let images = [];
        if (initialPosterUrl) {
          images.push(initialPosterUrl);
        }

        const query = name || "lifestyle"; // Use store name or fallback
        try {
          const pexelsResult = await searchPexelsPhotos(query, 3); // Fetch 3 images
          if (pexelsResult && pexelsResult.photos && pexelsResult.photos.length > 0) {
            const pexelsImageUrls = pexelsResult.photos.map(p => p.src).filter(src => src !== initialPosterUrl);
            images = [...new Set([...images, ...pexelsImageUrls])]; // Add unique Pexels images
          }
        } catch (error) {
          console.error("Failed to fetch Pexels photos for slideshow:", error);
        }
        
        // Fallback if not enough images
        if (images.length < 2) {
            const fallbackImages = [
                "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80",
                "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
                "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80"
            ].filter(src => !images.includes(src));
            images.push(...fallbackImages.slice(0, 3 - images.length));
        }
        
        setSlideshowImages(images.slice(0, 4)); // Max 4 images for slideshow
        setCurrentImageIndex(0); // Reset index

        const interval = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % (images.slice(0, 4).length || 1));
        }, 6000);
        return () => clearInterval(interval);
      } else {
        setSlideshowImages([]); // Clear images if video is present
      }
    };

    fetchAndSetImages();
  }, [videoUrl, name, initialPosterUrl]); // Rerun if videoUrl, store name or initial poster changes

  const handleOpenReplaceModal = () => {
    setIsReplaceModalOpen(true);
  };

  const handleVideoReplaced = async (newVideoUrl) => {
    if (storeId) {
      try {
        await updateStore(storeId, {
          hero_video_url: newVideoUrl,
          hero_video_poster_url: newVideoUrl ? "" : initialPosterUrl, // Keep poster if video removed, clear if added
        });
      } catch (error) {
        console.error("Failed to update store with new hero video URL:", error);
      }
    }
  };

  const scrollToProducts = () => {
    const productsSection = document.getElementById(`products-${storeId}`);
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById(`features-${storeId}`);
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {videoUrl ? (
          <div className="relative w-full h-full group">
            <video
              key={videoUrl}
              src={videoUrl}
              poster={initialPosterUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
          <AnimatePresence>
            {!isVideoPlaying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-xl">
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        slideshowImages.length > 0 && slideshowImages.map((imageSrc, index) => (
          <motion.div
            key={imageSrc + '-' + index} // Ensure key is unique if imageSrc can repeat
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{
              opacity: index === currentImageIndex ? 1 : 0,
              scale: index === currentImageIndex ? 1 : 1.05,
            }}
            transition={{ duration: 1.2, ease: [0.42, 0, 0.58, 1] }}
          >
            <img
              src={imageSrc}
              alt="Hero background"
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))
      )}
      {!videoUrl && slideshowImages.length === 0 && ( // Fallback if no images loaded
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <p className="text-slate-500">Loading background...</p>
          </div>
      )}
      {!videoUrl && slideshowImages.length > 0 && <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />}
    </div>
    
    {!isPublishedView && viewMode === 'edit' && (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-[76px] right-4 z-20 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border-white/30 rounded-md shadow-md" // Includes previous top-[76px] change
          onClick={handleOpenReplaceModal}
          title="Replace Media"
        >
          <Edit2Icon className="h-4 w-4" />
        </Button>
      )}

      <motion.div
        className="container mx-auto px-4 sm:px-6 relative z-10"
        style={{ y, opacity }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-md rounded-full text-white text-xs sm:text-sm font-medium mb-6 border border-white/25"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <InlineTextEdit
              initialText={badgeText}
              onSave={(newText) => updateStoreTextContent('heroBadgeText', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="span"
              textClassName=""
              inputClassName="bg-transparent"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
          >
            <InlineTextEdit
              initialText={heroTitle}
              onSave={(newText) => updateStoreTextContent('heroTitle', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="h1"
              textClassName="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white mb-5"
              inputClassName="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white mb-5 bg-transparent"
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white mb-5"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" }}
            className="mb-5"
          >
            <InlineTextEdit
              initialText={heroDescription}
              onSave={(newText) => updateStoreTextContent('heroDescription', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="p"
              textClassName="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
              inputClassName="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed bg-transparent"
              className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
              useTextarea={true}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7, ease: "easeOut" }}
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={scrollToProducts}
                size="lg"
                className="group relative overflow-hidden bg-white text-slate-900 hover:bg-slate-50 border-0 rounded-xl px-7 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                <InlineTextEdit
                  initialText={primaryCtaText}
                  onSave={(newText) => updateStoreTextContent('heroPrimaryCtaText', newText)}
                  isAdmin={!isPublishedView && viewMode === 'edit'}
                  as="span"
                  textClassName=""
                  inputClassName="bg-transparent"
                />
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={scrollToFeatures}
                variant="outline"
                size="lg"
                className="group relative overflow-hidden bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-white/30 hover:border-white/40 rounded-xl px-7 py-3 text-base font-semibold transition-all duration-300 w-full sm:w-auto"
              >
                <InlineTextEdit
                  initialText={secondaryCtaText}
                  onSave={(newText) => updateStoreTextContent('heroSecondaryCtaText', newText)}
                  isAdmin={!isPublishedView && viewMode === 'edit'}
                  as="span"
                  textClassName=""
                  inputClassName="bg-transparent"
                />
                <Play className="w-4 h-4 ml-2 group-hover:fill-white/20 transition-all" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      {!isPublishedView && storeId && (
        <FreshReplaceVideoModal
          open={isReplaceModalOpen}
          onOpenChange={setIsReplaceModalOpen}
          storeId={storeId}
          currentVideoUrl={videoUrl}
          onVideoReplaced={handleVideoReplaced}
        />
      )}
    </section>
  );
};

export default StoreHero;
