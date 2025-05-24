import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button.jsx";
import {
  ArrowRight,
  Edit2Icon,
  Play,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import ReplaceVideoModal from "./ReplaceVideoModal";
import { useStore } from "../../contexts/StoreContext.jsx";
import InlineTextEdit from "../ui/InlineTextEdit.jsx";
import { fetchPexelsVideos } from "../../lib/utils.jsx"; // Import Pexels video function

const StoreHero = ({ store, isPublishedView = false }) => {
  const { updateStore, updateStoreTextContent, viewMode } = useStore();
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroVideoUrl, setHeroVideoUrl] = useState(store?.hero_video_url || null);
  const { scrollY } = useScroll();

  // Parallax effects - Slowed down y-axis movement
  const y = useTransform(scrollY, [0, 800], [0, 150]); // Changed 500 to 800
  const opacity = useTransform(scrollY, [0, 400], [1, 0.7]); // Slightly adjusted opacity range for slower fade

  // Extract values from store prop
  const storeId = store?.id;
  const title =
    store?.content?.heroTitle || store?.name || "Elevate Your Everyday";
  const subtitle =
    store?.content?.heroDescription ||
    "Discover premium collections designed for modern living. Quality craftsmanship, timeless style.";
  // const videoUrl = store?.hero_video_url; // Will use heroVideoUrl state instead
  const imageUrl =
    store?.heroImage?.src?.large ||
    store?.heroImage?.url ||
    store?.hero_video_poster_url ||
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80";
  const primaryCtaText = "Shop New Arrivals";
  const primaryCtaLink = `#products-${store?.id || "featured-products"}`;
  const secondaryCtaText = "Explore Collections";
  const secondaryCtaLink = `#collections-${store?.id || "featured-collections"}`;
  const primaryColor = store?.theme?.primaryColor || "#3B82F6";

  // Dynamic background images for rotation
  const backgroundImages = [
    imageUrl,
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80",
  ];

  // Rotate background images every 5 seconds
  useEffect(() => {
    if (!heroVideoUrl) { // Use heroVideoUrl state
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroVideoUrl, backgroundImages.length]);

  useEffect(() => {
    if (!store?.hero_video_url && store?.name) {
      const fetchVideo = async () => {
        try {
          const query = store.type || store.name; // Use store type or name for video query
          const videos = await fetchPexelsVideos(query, 1, 'landscape');
          if (videos && videos.length > 0 && videos[0].url) {
            setHeroVideoUrl(videos[0].url);
            // Optionally, update the store object in context/DB if you want to persist this Pexels video
            // await updateStore(store.id, { hero_video_url: videos[0].url, hero_video_poster_url: videos[0].image });
          }
        } catch (error) {
          console.error("Failed to fetch Pexels video for hero:", error);
        }
      };
      fetchVideo();
    } else if (store?.hero_video_url) {
      setHeroVideoUrl(store.hero_video_url);
    }
  }, [store?.hero_video_url, store?.name, store?.type, store?.id]);


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
        staggerChildren: 0.2,
        delayChildren: 0.1,
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
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <React.Fragment>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video/Image Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          {heroVideoUrl ? (
            <video
              key={heroVideoUrl}
              src={heroVideoUrl}
              poster={imageUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={backgroundImages[currentImageIndex]}
                alt="Hero background"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              />
            </AnimatePresence>
          )}
          {/* Vertical Gradient Blur Overlay: Transparent at top, darkens and blurs towards bottom */}
          <div 
            className="absolute inset-0 backdrop-blur-sm md:backdrop-blur-md"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.0) 20%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.8) 100%)',
            }}
          ></div>
        </div>
        
        {/* Animated decorative background elements (on top of video/image and overlay) */}
        <div className="absolute inset-0 overflow-hidden z-10"> {/* Ensure these are above video/overlay */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ backgroundColor: `${primaryColor}20` }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-2xl"
          animate={{
            x: [-50, 50, -50],
            y: [-30, 30, -30],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Floating decorative elements (on top of video/image and overlay) */}
      <motion.div
        className="absolute top-20 right-20 text-white/70 z-10" // Changed to white
        variants={floatingVariants}
        animate="animate"
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-16 text-white/70 z-10" // Changed to white
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 2 }}
      >
        <Star className="w-6 h-6" />
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-1/4 text-white/70 z-10" // Changed to white
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 4 }}
      >
        <TrendingUp className="w-7 h-7" />
      </motion.div>

      {/* Main Content Grid (on top of everything else) */}
      <motion.div
        className="container mx-auto px-4 relative z-20" // Higher z-index for content
        style={{ y, opacity }}
      >
        <motion.div
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh] text-white" // Ensure text is visible on dark overlay
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Text Content */}
          <motion.div
            variants={itemVariants}
            className="text-center lg:text-left space-y-8 lg:space-y-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary border border-primary/20 mt-[70px]"
              style={{
                color: primaryColor,
                borderColor: `${primaryColor}30`,
                backgroundColor: `${primaryColor}15`,
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>New Collection Available</span>
            </motion.div>

            {/* Main Title */}
            <InlineTextEdit
              initialText={title}
              onSave={updateStoreTextContent}
              identifier="content.heroTitle"
              as="h1" // The Tag component will be h1
              textClassName="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7.5rem] font-bold leading-none tracking-tighter font-poppins text-white drop-shadow-xl" // Decreased sizes by approx 1/4
              className="w-full" // Basic class for the container Tag if needed
            >
              <motion.span
                className="bg-clip-text text-transparent" // Shimmer effect applied here
                style={{
                  backgroundImage: `linear-gradient(110deg, ${primaryColor} 20%, #ffffff 50%, ${primaryColor} 80%)`, // Adjusted gradient for better visibility on video
                  backgroundSize: "250% 100%", // Wider gradient for smoother shimmer
                }}
                animate={{
                  backgroundPosition: ["250% center", "-150% center"], // Adjusted animation range
                }}
                transition={{
                  duration: 4, // Slightly slower for a more subtle effect
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {title}
              </motion.span>
            </InlineTextEdit>

            {/* Subtitle */}
            <InlineTextEdit
              initialText={subtitle}
              onSave={updateStoreTextContent}
              identifier="content.heroDescription"
              as="p" // The Tag component will be p
              textClassName="text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-100 dark:text-slate-200 max-w-3xl mx-auto lg:mx-0 leading-relaxed drop-shadow-lg" // Moved to textClassName
              className="w-full" // Basic class for the container Tag if needed
            >
              {subtitle}
            </InlineTextEdit>

            {/* Stats or Features */}
            <motion.div
              className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-base" // Increased gap and base text size
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 text-white/90"> {/* Changed to white */}
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-md"></div>
                <span className="font-medium">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-white/90"> {/* Changed to white */}
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse shadow-md"></div>
                <span className="font-medium">30-Day Returns</span>
              </div>
              <div className="flex items-center gap-2 text-white/90"> {/* Changed to white */}
                <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse shadow-md"></div>
                <span className="font-medium">Premium Quality</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-6"
              variants={itemVariants}
            >
              <Button
                asChild
                size="lg"
                className="group relative overflow-hidden rounded-full px-8 py-6 text-lg font-semibold shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                <Link
                  to={primaryCtaLink}
                  onClick={(e) =>
                    handleScrollTo(e, primaryCtaLink.substring(1))
                  }
                >
                  <motion.span
                    className="relative z-10 flex items-center gap-2"
                    whileHover={{ x: 5 }}
                  >
                    {primaryCtaText}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </motion.span>
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="group rounded-full px-8 py-6 text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300 hover:scale-105"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Link
                  to={secondaryCtaLink}
                  onClick={(e) =>
                    handleScrollTo(e, secondaryCtaLink.substring(1))
                  }
                >
                  <motion.span
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    {secondaryCtaText}
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Visual Content - New Video Player */}
          <motion.div
            variants={itemVariants}
            className="relative group aspect-video md:aspect-[4/3] max-w-2xl mx-auto lg:mx-0 lg:max-w-none" // Adjusted for alignment
          >
            <div className="rounded-lg overflow-hidden shadow-2xl relative z-10 bg-black">
              {!isPublishedView && heroVideoUrl && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-3 right-3 z-20 bg-background/70 hover:bg-background/90 text-foreground rounded-full p-2"
                  onClick={handleOpenReplaceModal}
                  title="Replace Hero Video"
                >
                  <Edit2Icon className="h-5 w-5" />
                </Button>
              )}
              {heroVideoUrl ? (
                <video
                  src={heroVideoUrl}
                  key={heroVideoUrl} // Ensure re-render on URL change
                  poster={imageUrl} // Use existing imageUrl as poster
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  onError={(e) => console.error("Error playing hero video:", e)}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                // Fallback if no video URL, show the primary hero image
                <img
                  alt={store?.name || "Hero visual"}
                  className="w-full h-full object-cover"
                  src={imageUrl}
                />
              )}
            </div>
          </motion.div>
          {/* End of New Video Player */}
        </motion.div>
      </motion.div>
  
      {/* Replace Video Modal - ensure it's available for the new button */}
      {!isPublishedView && storeId && (
        <ReplaceVideoModal
          open={isReplaceModalOpen}
          onOpenChange={setIsReplaceModalOpen}
          storeId={storeId}
          currentVideoUrl={heroVideoUrl} // Pass the state variable
          onVideoReplaced={handleVideoReplaced}
        />
      )}
  
        {/* Scroll indicator (ensure z-index) */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20" // Ensure z-index
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center" // Adjusted border color for visibility
            // style={{ borderColor: `${primaryColor}50` }} // This might be hard to see on video
          >
            <motion.div
              className="w-1 h-3 bg-white rounded-full mt-2" // Adjusted color for visibility
              // style={{ backgroundColor: primaryColor }} // This might be hard to see on video
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>
      {/* Removed the separate video section from below the hero */}
    </React.Fragment>
  );
};

export default StoreHero;
