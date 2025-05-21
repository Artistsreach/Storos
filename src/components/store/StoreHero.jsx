import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit2Icon } from 'lucide-react';
import { motion } from 'framer-motion';
import ReplaceVideoModal from './ReplaceVideoModal';
import { useStore } from '@/contexts/StoreContext';
import InlineTextEdit from '@/components/ui/InlineTextEdit'; // Import InlineTextEdit

// Props from advanced theme's HeroSection.tsx
// We'll use default values for now, or adapt them if 'store' prop from modern theme is available
const StoreHero = ({ store, isPublishedView = false }) => {
  const { updateStore, updateStoreTextContent, viewMode } = useStore(); // Added updateStoreTextContent and viewMode
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);

  // Extract values from 'store' prop if available, otherwise use defaults
  const storeId = store?.id;
  const title = store?.content?.heroTitle || store?.name || "Elevate Your Everyday";
  const subtitle = store?.content?.heroDescription || "Discover premium collections designed for modern living. Quality craftsmanship, timeless style.";
  const videoUrl = store?.hero_video_url;
  const imageUrl = store?.heroImage?.src?.large || store?.heroImage?.url || store?.hero_video_poster_url || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80";
  const primaryCtaText = "Shop New Arrivals";
  const primaryCtaLink = `#products-${store?.id || 'featured-products'}`; // Link to products section in modern theme
  const secondaryCtaText = "Explore Collections";
  const secondaryCtaLink = `#collections-${store?.id || 'featured-collections'}`; // Link to collections section in modern theme
  const primaryColor = store?.theme?.primaryColor; // Use theme color from modern theme

  const handleScrollTo = (event, targetId) => {
    // event.preventDefault(); // Link component handles hash navigation
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenReplaceModal = () => { // Added function
    setIsReplaceModalOpen(true);
  };

  const handleVideoReplaced = async (newVideoUrl) => { // Added function
    if (storeId && newVideoUrl) {
      try {
        await updateStore(storeId, { hero_video_url: newVideoUrl, hero_video_poster_url: '' });
      } catch (error) {
        console.error("Failed to update store with new video URL:", error);
      }
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-gray-100 to-stone-200 dark:from-slate-900 dark:via-gray-800 dark:to-stone-900 py-20 md:py-32 lg:py-40 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left space-y-6 lg:space-y-8"
          >
            <InlineTextEdit
              initialText={title}
              onSave={updateStoreTextContent}
              identifier="content.heroTitle"
              as="h1"
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight"
              style={primaryColor ? { color: primaryColor } : {}}
            >
              {title} 
            </InlineTextEdit>
            <InlineTextEdit
              initialText={subtitle}
              onSave={updateStoreTextContent}
              identifier="content.heroDescription"
              as="p"
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0"
            >
              {subtitle}
            </InlineTextEdit>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
              {/* CTA buttons might also need to be editable if their text is dynamic */}
              <Button asChild size="lg" className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
                <Link to={primaryCtaLink} onClick={(e) => handleScrollTo(e, primaryCtaLink.substring(1))}>
                  {primaryCtaText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 text-foreground border-foreground/30 hover:bg-foreground/5">
                <Link to={secondaryCtaLink} onClick={(e) => handleScrollTo(e, secondaryCtaLink.substring(1))}>
                  {secondaryCtaText}
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Visual Content (Image/Video) */}
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
                poster={imageUrl} 
                autoPlay
                loop
                muted
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img
                src={imageUrl}
                alt="Hero visual"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                loading="eager"
              />
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
    </section>
  );
};

export default StoreHero;
