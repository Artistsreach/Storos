import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Edit2Icon,
  Play,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
  Award,
  Users,
  CheckCircle,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import ReplaceVideoModal from "@/components/store/ReplaceVideoModal";
import { useStore } from "@/contexts/StoreContext";
import InlineTextEdit from "@/components/ui/InlineTextEdit";
import { Badge } from "@/components/ui/badge";

const StoreHero = ({ store, isPublishedView = false }) => {
  const { updateStore, updateStoreTextContent, viewMode } = useStore();
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { scrollY } = useScroll();

  // Parallax effects
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.05]);

  // Extract values from store prop
  const storeId = store?.id;
  const title =
    store?.content?.heroTitle || store?.name || "Elevate Your Style";
  const subtitle =
    store?.content?.heroDescription ||
    "Discover premium collections crafted with precision and designed for the modern lifestyle. Experience luxury redefined.";
  const videoUrl = store?.hero_video_url;
  const imageUrl =
    store?.heroImage?.src?.large ||
    store?.heroImage?.url ||
    store?.hero_video_poster_url ||
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80";
  const primaryCtaText = "Explore Collection";
  const primaryCtaLink = `#products-${store?.id || "featured-products"}`;
  const secondaryCtaText = "Learn More";
  const secondaryCtaLink = `#features-${store?.id || "features"}`;
  const primaryColor = store?.theme?.primaryColor || "#3B82F6";

  // Premium background images for rotation
  const backgroundImages = [
    imageUrl,
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80",
  ];

  // Rotate background images every 7 seconds
  useEffect(() => {
    if (!videoUrl) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
      }, 7000);
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
        delayChildren: 0.3,
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
      y: [-15, 15, -15],
      rotate: [0, 5, 0, -5, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ backgroundColor: `${primaryColor}20` }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-secondary/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-80 h-80 bg-accent/10 blur-2xl"
          animate={{
            x: [-50, 50, -50],
            y: [-30, 30, -30],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-32 right-20 text-primary/30"
        variants={floatingVariants}
        animate="animate"
      >
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 p-4">
          <Sparkles className="w-10 h-10" />
        </div>
      </motion.div>
      <motion.div
        className="absolute bottom-40 left-16 text-primary/30"
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 2 }}
      >
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 p-3">
          <Star className="w-8 h-8" />
        </div>
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-1/4 text-primary/30"
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 4 }}
      >
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 p-3">
          <TrendingUp className="w-8 h-8" />
        </div>
      </motion.div>

      <motion.div
        className="container mx-auto px-6 relative z-10"
        style={{ y, opacity }}
      >
        <motion.div
          className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center min-h-[85vh]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Text Content */}
          <motion.div
            variants={itemVariants}
            className="text-center lg:text-left space-y-6 lg:space-y-8" // Reduced space-y
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 text-sm font-medium text-primary shadow-glass mt-[80px]" // Increased mt
              style={{
                color: primaryColor,
                borderColor: `${primaryColor}30`,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <span className="font-inter tracking-wide">
                Premium Collection 2024
              </span>
            </motion.div>

            {/* Main Title */}
            <InlineTextEdit
              initialText={title}
              onSave={(newText) => updateStoreTextContent('content.heroTitle', newText)}
              isAdmin={!isPublishedView}
              as="h1"
              textClassName="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight font-heading"
              className="w-full"
            >
              <motion.span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${store?.theme?.darkMode ? '#E5E7EB' : '#4B5563'} 30%, ${primaryColor} 50%, ${store?.theme?.darkMode ? '#E5E7EB' : '#4B5563'} 70%)`,
                  backgroundSize: "200% auto",
                }}
                animate={{
                  backgroundPosition: ["200% center", "0% center"],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                {title}
              </motion.span>
            </InlineTextEdit>

            {/* Subtitle */}
            <InlineTextEdit
              initialText={subtitle}
              onSave={(newText) => updateStoreTextContent('content.heroDescription', newText)}
              isAdmin={!isPublishedView}
              useTextarea={true}
              as="p"
              textClassName="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto lg:mx-0 leading-relaxed font-inter"
              className="w-full"
            >
              {subtitle}
            </InlineTextEdit>

            {/* Premium Features */}
            <motion.div
              className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm"
              variants={itemVariants}
            >
              <motion.div
                className="flex items-center gap-2 text-muted-foreground bg-white/5 dark:bg-black/5 backdrop-blur-md px-4 py-2 border border-white/10 dark:border-white/5"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="w-3 h-3 bg-green-500 animate-pulse" />
                <span className="font-inter font-medium tracking-wide">
                  Premium Quality
                </span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 text-muted-foreground bg-white/5 dark:bg-black/5 backdrop-blur-md px-4 py-2 border border-white/10 dark:border-white/5"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="w-3 h-3 bg-blue-500 animate-pulse" />
                <span className="font-inter font-medium tracking-wide">
                  Fast Delivery
                </span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 text-muted-foreground bg-white/5 dark:bg-black/5 backdrop-blur-md px-4 py-2 border border-white/10 dark:border-white/5"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="w-3 h-3 bg-purple-500 animate-pulse" />
                <span className="font-inter font-medium tracking-wide">
                  Lifetime Support
                </span>
              </motion.div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6 pt-4" // Reduced pt
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="group relative overflow-hidden px-10 py-6 text-lg font-semibold shadow-float hover:shadow-float-lg transition-all duration-500 bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-foreground border border-white/20 dark:border-white/10 backdrop-blur-md font-inter tracking-wide"
                  style={{
                    borderColor: `${primaryColor}40`,
                    color: primaryColor,
                  }}
                >
                  <Link
                    to={primaryCtaLink}
                    onClick={(e) =>
                      handleScrollTo(e, primaryCtaLink.substring(1))
                    }
                  >
                    <motion.span
                      className="relative z-10 flex items-center gap-3"
                      whileHover={{ x: 5 }}
                    >
                      <Zap className="w-6 h-6" />
                      {primaryCtaText}
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="group px-10 py-6 text-lg font-semibold border border-white/20 dark:border-white/10 hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-300 backdrop-blur-md font-inter tracking-wide"
                  style={{
                    borderColor: `${primaryColor}40`,
                    color: primaryColor,
                  }}
                >
                  <Link
                    to={secondaryCtaLink}
                    onClick={(e) =>
                      handleScrollTo(e, secondaryCtaLink.substring(1))
                    }
                  >
                    <motion.span
                      className="flex items-center gap-3"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Play className="w-5 h-5" />
                      {secondaryCtaText}
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4" // Reduced pt
              variants={itemVariants}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      className="w-12 h-12 bg-gradient-to-br from-primary to-secondary border-2 border-background flex items-center justify-center text-white font-bold text-sm backdrop-blur-md"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                      }}
                    >
                      {String.fromCharCode(65 + i - 1)}
                    </motion.div>
                  ))}
                </div>
                <div className="ml-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground font-inter">
                    <span
                      className="font-semibold"
                      style={{ color: primaryColor }}
                    >
                      10,000+
                    </span>{" "}
                    satisfied customers
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Content */}
          <motion.div
            variants={itemVariants}
            className="relative aspect-square lg:aspect-[4/3] max-w-3xl mx-auto"
            style={{ scale }}
          >
            {/* Glassmorphism container */}
            <div className="relative w-full h-full overflow-hidden shadow-float-lg backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10">
              {/* Edit button */}
              {!isPublishedView && (videoUrl || imageUrl) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-4 right-4 z-20 bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-foreground backdrop-blur-md border border-white/20 dark:border-white/10 shadow-glass"
                    onClick={handleOpenReplaceModal}
                    title="Replace Media"
                  >
                    <Edit2Icon className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}

              {/* Video content */}
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
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                  />

                  {/* Video overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                  {/* Play indicator */}
                  <AnimatePresence>
                    {!isVideoPlaying && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-20 h-20 bg-white/20 dark:bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/30 dark:border-white/20 shadow-glass">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Image content with rotation */
                <div className="relative w-full h-full">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={backgroundImages[currentImageIndex]}
                      alt="Hero visual"
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="eager"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 1.5 }}
                    />
                  </AnimatePresence>

                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10" />
                </div>
              )}

              {/* Decorative elements */}
              <motion.div
                className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 6, repeat: Infinity }}
                style={{ backgroundColor: `${primaryColor}30` }}
              />
              <motion.div
                className="absolute -bottom-8 -left-8 w-40 h-40 bg-secondary/20 blur-3xl"
                animate={{
                  scale: [1.1, 1, 1.1],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </div>

            {/* Floating elements around the image */}
            <motion.div
              className="absolute -top-8 -left-8 w-20 h-20 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center shadow-glass"
              animate={{
                y: [-8, 8, -8],
                rotate: [0, 10, 0],
              }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <Sparkles className="w-10 h-10" style={{ color: primaryColor }} />
            </motion.div>

            <motion.div
              className="absolute -bottom-6 -right-10 w-24 h-24 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center shadow-glass"
              animate={{
                y: [8, -8, 8],
                rotate: [0, -10, 0],
              }}
              transition={{ duration: 7, repeat: Infinity, delay: 1 }}
            >
              <Star className="w-12 h-12 text-yellow-400" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Replace Video Modal */}
      {!isPublishedView && storeId && (
        <ReplaceVideoModal
          open={isReplaceModalOpen}
          onOpenChange={setIsReplaceModalOpen}
          storeId={storeId}
          currentVideoUrl={videoUrl}
          onVideoReplaced={handleVideoReplaced}
        />
      )}

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div
          className="w-6 h-10 border border-white/30 dark:border-white/20 flex justify-center backdrop-blur-md"
          style={{ borderColor: `${primaryColor}50` }}
        >
          <motion.div
            className="w-1 h-3 bg-primary mt-2"
            style={{ backgroundColor: primaryColor }}
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default StoreHero;
