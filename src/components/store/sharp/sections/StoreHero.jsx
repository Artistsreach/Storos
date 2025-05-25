import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../ui/button"; // Corrected path
import {
  ArrowRight,
  Edit2Icon,
  Play,
  Shield,
  Target,
  Crosshair,
  Zap,
  Award,
  Users,
  CheckCircle,
  Star,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import ReplaceVideoModal from "../../premium/ReplaceVideoModal"; // Corrected path to premium component
import { useStore } from "../../../../contexts/StoreContext"; // Corrected path
import InlineTextEdit from "../../../ui/InlineTextEdit"; // Corrected path
import { Badge } from "../../../ui/badge"; // Corrected path

const StoreHero = ({ store, isPublishedView = false }) => {
  const { updateStore, updateStoreTextContent, viewMode } = useStore();
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { scrollY } = useScroll();

  // Parallax effects
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Extract values from store prop
  const storeId = store?.id;
  const heroBadgeText = store?.content?.heroBadgeText || "Featured Collection";
  const title = store?.content?.heroTitle || store?.name || "Your Store Title";
  const subtitle =
    store?.content?.heroDescription ||
    "Describe your store and what makes it special. Highlight your unique products and brand mission here.";
  const feature1Text = store?.content?.heroFeature1Text || "Quality Assured";
  const feature2Text = store?.content?.heroFeature2Text || "Best Sellers";
  const feature3Text = store?.content?.heroFeature3Text || "Fast Shipping";
  const primaryCtaText = store?.content?.heroPrimaryCtaText || "Shop Now";
  const secondaryCtaText = store?.content?.heroSecondaryCtaText || "Learn More";

  const videoUrl = store?.hero_video_url || "https://videos.pexels.com/video-files/4691532/4691532-hd_1280_720_30fps.mp4"; // General placeholder video
  const imageUrl =
    store?.heroImage?.src?.large ||
    store?.heroImage?.url ||
    store?.hero_video_poster_url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80"; // General product placeholder image
  const primaryCtaLink = `#products-${store?.id || "featured-products"}`;
  const secondaryCtaLink = `#features-${store?.id || "features"}`;
  // const primaryColor = store?.theme?.primaryColor || "#DC2626";

  // General background images
  const backgroundImages = [
    imageUrl,
    "https://images.unsplash.com/photo-1481437156560-3205f6a85705?w=1200&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
  ];

  // Rotate background images every 6 seconds
  useEffect(() => {
    if (!videoUrl) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [videoUrl, backgroundImages.length]);

  const handleScrollTo = (event, targetId) => {
    event.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenReplaceModal = () => {
    setIsReplaceModalOpen(true);
  };

  const handleVideoReplaced = async (newVideoUrl) => {
    if (storeId && newVideoUrl) {
      try {
        await updateStore(storeId, {
          hero_video_url: newVideoUrl,
          hero_video_poster_url: "",
        });
      } catch (error) {
        console.error("Failed to update store with new video URL:", error);
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 2, 0, -2, 0], // Reduced rotation for a sharper feel
      transition: {
        duration: 10, // Slower, more subtle
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 text-white">
      {/* Animated background elements - more subtle for sharp theme */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-700/10 rounded-full blur-3xl opacity-50"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl opacity-40"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Floating decorative elements - more tactical */}
      <motion.div
        className="absolute top-1/4 left-10 text-red-500/20"
        variants={floatingVariants}
        animate="animate"
      >
        <Shield className="w-10 h-10" />
      </motion.div>
      <motion.div
        className="absolute bottom-1/3 right-10 text-orange-500/20"
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 3 }}
      >
        <Target className="w-8 h-8" />
      </motion.div>
      <motion.div
        className="absolute top-2/3 left-1/3 text-yellow-500/10" // Very subtle
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 6 }}
      >
        <Crosshair className="w-6 h-6" />
      </motion.div>

      <motion.div
        className="container mx-auto px-6 relative z-10"
        style={{ y, opacity }}
      >
        <motion.div
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]" // Slightly less than full screen
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Text Content */}
          <motion.div
            variants={itemVariants}
            className="text-center lg:text-left space-y-8" // Reduced spacing
          >
            {/* Mission Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Badge
                variant="outline"
                className="px-4 py-2 bg-red-900/40 text-red-300 border-red-700/60 font-mono uppercase tracking-widest text-xs"
              >
                <Star className="w-4 h-4 mr-2" />
                <InlineTextEdit
                  initialText={heroBadgeText}
                  onSave={(newText) => updateStoreTextContent('heroBadgeText', newText)}
                  isAdmin={!isPublishedView && viewMode === 'edit'}
                  as="span"
                  textClassName="" // Inherits from Badge
                  inputClassName="bg-transparent"
                />
              </Badge>
            </motion.div>

            {/* Main Title */}
            <InlineTextEdit
              initialText={title}
              onSave={(newText) => updateStoreTextContent('heroTitle', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="h1"
              textClassName="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tighter font-mono uppercase"
              inputClassName="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tighter font-mono uppercase bg-transparent"
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tighter font-mono uppercase" // Adjusted sizes and tracking
            >
              <motion.span
                className="bg-gradient-to-r from-slate-100 via-red-400 to-orange-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "200% 50%"], // Faster animation
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{
                  backgroundSize: "200% auto",
                }}
              >
                {title}
              </motion.span>
            </InlineTextEdit>

            {/* Subtitle */}
            <InlineTextEdit
              initialText={subtitle}
              onSave={(newText) => updateStoreTextContent('heroDescription', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="p"
              textClassName="text-lg md:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              inputClassName="text-lg md:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed bg-transparent"
              className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed" // Max width for readability
              useTextarea={true}
            />

            {/* Mission Features */}
            <motion.div
              className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-xs"
              variants={itemVariants}
            >
              {[
                { icon: CheckCircle, text: feature1Text, identifier: 'heroFeature1Text' },
                { icon: Award, text: feature2Text, identifier: 'heroFeature2Text' },
                { icon: Zap, text: feature3Text, identifier: 'heroFeature3Text' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center gap-2 text-slate-400"
                  whileHover={{ scale: 1.05, color: store?.theme?.primaryColor || "#f87171" }}
                >
                  <feature.icon className="w-4 h-4" style={{color: store?.theme?.primaryColor || "#DC2626"}} />
                  <InlineTextEdit
                    initialText={feature.text}
                    onSave={(newText) => updateStoreTextContent(feature.identifier, newText)}
                    isAdmin={!isPublishedView && viewMode === 'edit'}
                    as="span"
                    textClassName="font-mono font-medium uppercase tracking-wider"
                    inputClassName="font-mono font-medium uppercase tracking-wider bg-transparent"
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-6" // Reduced gap
              variants={itemVariants}
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  asChild
                  size="lg"
                  className="group relative overflow-hidden rounded-md px-8 py-3 text-base font-semibold shadow-lg transition-all duration-300 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white border-0 font-mono uppercase tracking-wider"
                >
                  <Link
                    to={primaryCtaLink}
                    onClick={(e) => handleScrollTo(e, primaryCtaLink.substring(1))}
                  >
                    <motion.span
                      className="relative z-10 flex items-center gap-2"
                    >
                      <Target className="w-5 h-5" />
                      <InlineTextEdit
                        initialText={primaryCtaText}
                        onSave={(newText) => updateStoreTextContent('heroPrimaryCtaText', newText)}
                        isAdmin={!isPublishedView && viewMode === 'edit'}
                        as="span"
                        textClassName=""
                        inputClassName="bg-transparent"
                      />
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="group rounded-md px-8 py-3 text-base font-semibold border-2 border-red-600/70 text-red-400 hover:bg-red-600/10 hover:border-red-500 transition-all duration-300 backdrop-blur-sm font-mono uppercase tracking-wider"
                >
                  <Link
                    to={secondaryCtaLink}
                    onClick={(e) => handleScrollTo(e, secondaryCtaLink.substring(1))}
                  >
                    <motion.span className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <InlineTextEdit
                        initialText={secondaryCtaText}
                        onSave={(newText) => updateStoreTextContent('heroSecondaryCtaText', newText)}
                        isAdmin={!isPublishedView && viewMode === 'edit'}
                        as="span"
                        textClassName=""
                        inputClassName="bg-transparent"
                      />
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Visual Content */}
          <motion.div
            variants={itemVariants}
            className="relative aspect-video lg:aspect-[16/10] max-w-2xl mx-auto" // Adjusted aspect ratio
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl border-2 border-slate-700/50">
              {!isPublishedView && (videoUrl || imageUrl) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-3 right-3 z-20 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-red-400 backdrop-blur-sm border-slate-600 rounded-md shadow-md"
                    onClick={handleOpenReplaceModal}
                    title="Replace Media"
                  >
                    <Edit2Icon className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {videoUrl ? (
                <div className="relative w-full h-full group">
                  <video
                    key={videoUrl}
                    src={videoUrl}
                    poster={imageUrl}
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
                        <div className="w-16 h-16 bg-red-600/70 backdrop-blur-sm rounded-full flex items-center justify-center border border-red-500/60 shadow-xl">
                          <Play className="w-6 h-6 text-white ml-0.5" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <AnimatePresence mode="sync">
                    <motion.img
                      key={currentImageIndex}
                      src={backgroundImages[currentImageIndex]}
                      alt="Tactical Gear"
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0.7, filter: "blur(4px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0.7, filter: "blur(4px)" }}
                      transition={{ duration: 1 }}
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-orange-900/20" />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {!isPublishedView && storeId && (
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
