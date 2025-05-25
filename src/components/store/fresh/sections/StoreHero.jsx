import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Star } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import InlineTextEdit from "@/components/ui/InlineTextEdit";
import { Link } from "react-router-dom";

const StoreHero = ({ store, isPublishedView = false }) => {
  const { name, theme, heroImage, content, id: storeId } = store;
  const { updateStoreTextContent, viewMode } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]); // Softer parallax
  const opacity = useTransform(scrollY, [0, 300], [1, 0.9]); // Subtle opacity change

  const heroTitle = content?.heroTitle || `Welcome to ${name}`;
  const heroDescription =
    content?.heroDescription ||
    `Discover amazing products and experiences that will transform your lifestyle. Fresh ideas, delivered daily.`;
  const primaryCtaText = content?.heroPrimaryCtaText || "Explore Collection";
  const secondaryCtaText = content?.heroSecondaryCtaText || "Watch Our Story";
  const badgeText = content?.heroBadgeText || "Fresh Arrivals Daily";


  const backgroundImages = [
    heroImage?.src?.large ||
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80", // Default fresh/clean image
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80", // Lifestyle
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80", // People enjoying products
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000); // Slightly longer interval
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

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
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden"> {/* Adjusted min-height */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{
              opacity: index === currentImageIndex ? 1 : 0,
              scale: index === currentImageIndex ? 1 : 1.05,
            }}
            transition={{ duration: 1.2, ease: [0.42, 0, 0.58, 1] }} // Smoother ease
          >
            <img
              src={image}
              alt="Hero background"
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
         {/* Optional: Softer top gradient if needed: */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent opacity-50" /> */}
      </div>

      <motion.div
        className="container mx-auto px-4 sm:px-6 relative z-10"
        style={{ y, opacity }}
      >
        <div className="max-w-3xl mx-auto text-center"> {/* Centered and slightly narrower max-width */}
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
            className="mb-5" // Added mb-5 (20px)
          >
            <InlineTextEdit
              initialText={heroDescription}
              onSave={(newText) => updateStoreTextContent('heroDescription', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="p"
              textClassName="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
              inputClassName="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed bg-transparent"
              className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed" // Removed mb-10 from here
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
                size="lg" // Larger default size
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
                size="lg" // Larger default size
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
    </section>
  );
};

export default StoreHero;
