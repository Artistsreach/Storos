import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  Shield,
  Truck,
  CreditCard,
  Headphones,
  Star,
  Zap,
  Globe,
  Award,
  Users,
  Heart,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Package, // Example for a default icon
  Edit2Icon, // Added for edit button
  // Icons for secondary features - ensure all used ones are here
  Briefcase, // Example, add actual icons used
  DollarSign,
  ThumbsUp,
  TrendingUp,
  Gift as GiftIcon, // Renaming if 'Gift' is already used or for clarity
  Shield as ShieldIcon,
  Truck as TruckIcon,
  CreditCard as CreditCardIcon,
  Headphones as HeadphonesIcon,
  Star as StarIcon,
  Zap as ZapIcon,
  Globe as GlobeIcon,
  Award as AwardIcon,
  Users as UsersIcon,
  Heart as HeartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/contexts/StoreContext";
import InlineTextEdit from "@/components/ui/InlineTextEdit";
import ReplaceVideoModal from "@/components/store/ReplaceVideoModal"; // Added import
import { searchPexelsVideos } from "../../../../lib/pexels"; // Changed from searchPexelsPhotos

const StoreFeatures = ({ store, isPublishedView = false }) => {
  const { updateStore, updateStoreTextContent } = useStore(); // Use updateStore for complex content
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false); 
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false); 
  const [currentPexelsVideoUrl, setCurrentPexelsVideoUrl] = useState(null); // Renamed
  const [currentPexelsVideoPosterUrl, setCurrentPexelsVideoPosterUrl] = useState(null); // Renamed
  const sectionRef = useRef(null);

  // Icon mapping for dynamic rendering
  const iconMap = {
    Shield, Truck, CreditCard, Headphones, Star, Zap, Globe, Award, Users, Heart, CheckCircle, Sparkles, ArrowRight, Play, Pause, Package, Edit2Icon,
    Briefcase, DollarSign, ThumbsUp, TrendingUp, GiftIcon, ShieldIcon, TruckIcon, CreditCardIcon, HeadphonesIcon, StarIcon, ZapIcon, GlobeIcon, AwardIcon, UsersIcon, HeartIcon
    // Add any other icons you might use by string name here
  };
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);

  const themePrimaryColor = store?.theme?.primaryColor || "#6366F1"; // Renamed to avoid conflict
  const storeId = store?.id;
  const isAdmin = !isPublishedView;

  // Moved these declarations before the useEffect that uses featuresToDisplay
  const defaultSectionContent = {
    title: "An Exceptional Experience",
    subtitle: "We're committed to providing you with the best shopping experience through our premium services and customer-first approach.",
    items: [
      {
        emoji: "✨",
        iconName: "Sparkles", // Changed from Shield
        title: "Innovative Designs", // Changed from Secure Payments
        description: "Experience cutting-edge features and a unique aesthetic.",
        color: "#8B5CF6", // Example color
        stats: "Always Fresh",
        image: "https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg?auto=compress&cs=tinysrgb&w=600&q=80", // New default image
        videoUrl: "", // No default video, will be fetched or use Pexels
      },
      {
        emoji: "🚚",
        icon: Truck,
        title: "Fast Delivery",
        description: "Free shipping worldwide with express delivery options available.",
        color: "#3B82F6",
        stats: "2-3 Days",
        image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80",
        videoUrl: "https://videos.pexels.com/video-files/4904400/4904400-hd_1280_720_24fps.mp4", // Default Pexels video
      },
      {
        emoji: "💳",
        icon: CreditCard,
        title: "Easy Returns",
        description: "30-day hassle-free returns with full refund guarantee.",
        color: "#8B5CF6",
        stats: "30 Days",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
        videoUrl: "https://videos.pexels.com/video-files/7578549/7578549-hd_1280_720_30fps.mp4", // Default Pexels video
      },
      {
        emoji: "🎧",
        icon: Headphones,
        title: "24/7 Support",
        description: "Round-the-clock customer support via chat, email, and phone.",
        color: "#F59E0B",
        stats: "Always On",
        image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=600&q=80",
        videoUrl: "https://videos.pexels.com/video-files/853875/853875-hd_1280_720_30fps.mp4", // Default Pexels video
      },
    ],
    secondaryItems: [ // Default secondary features
      { iconName: "GlobeIcon", title: "Global Reach", description: "Serving customers in 50+ countries" },
      { iconName: "AwardIcon", title: "Premium Quality", description: "Certified products with quality guarantee" },
      { iconName: "UsersIcon", title: "Community First", description: "Join 100K+ satisfied customers" },
      { iconName: "HeartIcon", title: "Eco-Friendly", description: "Sustainable packaging and practices" },
    ],
    statsItems: [ // Default stats items
      { iconName: "UsersIcon", number: "50K+", label: "Happy Customers" },
      { iconName: "ZapIcon", number: "99.9%", label: "Uptime" },
      { iconName: "HeadphonesIcon", number: "24/7", label: "Support" },
      { iconName: "StarIcon", number: "4.9★", label: "Rating" },
    ],
  };
  
  const sectionData = store?.content?.storeFeatures 
    ? { 
        ...defaultSectionContent, 
        ...store.content.storeFeatures, 
        items: (store.content.storeFeatures.items && store.content.storeFeatures.items.length > 0) ? store.content.storeFeatures.items : defaultSectionContent.items, 
        secondaryItems: (store.content.storeFeatures.secondaryItems && store.content.storeFeatures.secondaryItems.length > 0) ? store.content.storeFeatures.secondaryItems : defaultSectionContent.secondaryItems, 
        statsItems: (store.content.storeFeatures.statsItems && store.content.storeFeatures.statsItems.length > 0) ? store.content.storeFeatures.statsItems : defaultSectionContent.statsItems 
      } 
    : defaultSectionContent;

  const featuresToDisplay = (sectionData.items && sectionData.items.length > 0) 
    ? sectionData.items 
    : defaultSectionContent.items;

  useEffect(() => {
    const fetchContextualVideo = async () => {
      const currentItem = featuresToDisplay[activeFeature];
      if (currentItem && !currentItem.videoUrl) { // Only fetch if no specific video is set for the item
        const query = currentItem.title || currentItem.description || "abstract background"; // Use item title/desc for query
        try {
          console.log(`[Premium StoreFeatures] Fetching Pexels video for active feature "${query}"`);
          const result = await searchPexelsVideos(query);
          if (result && result.video) {
            setCurrentPexelsVideoUrl(result.video.videoUrl);
            setCurrentPexelsVideoPosterUrl(result.video.imageUrl);
          } else {
            console.warn(`No Pexels video found for query: "${query}". Clearing previous Pexels video.`);
            setCurrentPexelsVideoUrl(null);
            setCurrentPexelsVideoPosterUrl(null);
          }
        } catch (error) {
          console.error(`Failed to fetch Pexels video for query "${query}":`, error);
          setCurrentPexelsVideoUrl(null);
          setCurrentPexelsVideoPosterUrl(null);
        }
      } else if (currentItem && currentItem.videoUrl) {
        // If item has its own video, clear any fetched Pexels video for this slot
        setCurrentPexelsVideoUrl(null);
        setCurrentPexelsVideoPosterUrl(null);
      }
    };

    if (featuresToDisplay && featuresToDisplay.length > 0 && activeFeature < featuresToDisplay.length) {
      fetchContextualVideo();
    }
  }, [activeFeature, featuresToDisplay]); // Re-fetch when activeFeature or its content changes

  // Helper function to generate a slightly darker shade
  const getDarkerShade = (color, percent = 20) => {
    if (!color.startsWith("#")) return color;
    let num = parseInt(color.slice(1), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
    R = Math.max(0, R); G = Math.max(0, G); B = Math.max(0, B);
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };
  const primaryColor = themePrimaryColor; // Main theme color
  const secondaryColor = getDarkerShade(primaryColor, 20); // Darker shade for gradients

  const handleSaveText = async (field, value) => { // itemIndex removed as it's derived from field
    if (!storeId || !isAdmin) return;

    let newStoreFeaturesContent = JSON.parse(JSON.stringify(sectionData)); 

    const fieldParts = field.split('.'); 
    const baseFieldKey = fieldParts[0]; // e.g., 'itemTitle', 'secondaryItemTitle', 'title'
    const itemArrayIndex = fieldParts.length > 1 ? parseInt(fieldParts[1]) : null;

    if (baseFieldKey.startsWith('item') && itemArrayIndex !== null) {
      const actualItemProperty = baseFieldKey.replace('item', '').toLowerCase();
      if (newStoreFeaturesContent.items && newStoreFeaturesContent.items[itemArrayIndex]) {
        newStoreFeaturesContent.items[itemArrayIndex][actualItemProperty] = value;
      } else {
        console.warn(`Attempted to save to non-existent item: ${field}`);
        return;
      }
    } else if (baseFieldKey.startsWith('secondaryItem') && itemArrayIndex !== null) {
      const actualItemProperty = baseFieldKey.replace('secondaryItem', '').toLowerCase();
      if (newStoreFeaturesContent.secondaryItems && newStoreFeaturesContent.secondaryItems[itemArrayIndex]) {
        newStoreFeaturesContent.secondaryItems[itemArrayIndex][actualItemProperty] = value;
      } else {
        console.warn(`Attempted to save to non-existent secondaryItem: ${field}`);
        return;
      }
    } else if (baseFieldKey.startsWith('statsItem') && itemArrayIndex !== null) { // Added for statsItems
      const actualItemProperty = baseFieldKey.replace('statsItem', '').toLowerCase(); // e.g., number, label
      if (newStoreFeaturesContent.statsItems && newStoreFeaturesContent.statsItems[itemArrayIndex]) {
        newStoreFeaturesContent.statsItems[itemArrayIndex][actualItemProperty] = value;
      } else {
        console.warn(`Attempted to save to non-existent statsItem: ${field}`);
        return;
      }
    } else if (field === 'title' || field === 'subtitle') {
      newStoreFeaturesContent[field] = value;
    } else {
      console.warn("handleSaveText called with unhandled field structure:", field);
      return;
    }
    
    try {
      await updateStore(storeId, {
        content: {
          ...store.content,
          storeFeatures: newStoreFeaturesContent,
        },
      });
    } catch (error) {
      console.error(`Failed to update store features content for field "${field}":`, error);
    }
  };

  const handleOpenReplaceModal = () => {
    setIsReplaceModalOpen(true);
  };

  const handleVideoReplaced = async (newVideoUrl) => {
    if (storeId && newVideoUrl && featuresToDisplay[activeFeature]) {
      let newStoreFeaturesContent = JSON.parse(JSON.stringify(sectionData));
      if (newStoreFeaturesContent.items[activeFeature]) {
        newStoreFeaturesContent.items[activeFeature].videoUrl = newVideoUrl;
        // Optionally clear image if video is set, or keep it as poster
        // newStoreFeaturesContent.items[activeFeature].image = ""; 
      }
      try {
        await updateStore(storeId, {
          content: {
            ...store.content,
            storeFeatures: newStoreFeaturesContent,
          },
        });
      } catch (error) {
        console.error("Failed to update store with new video URL for feature:", error);
      }
    }
  };


  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-20 overflow-hidden premium-font-body gradient-bg"
      id={`features-${storeId}`}
    >
      {/* Background Elements - Premium Theme */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 w-1/2 h-1/2 opacity-20 blur-3xl rounded-full"
          style={{ y, background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-1/2 h-1/2 opacity-15 blur-3xl rounded-full"
          style={{ y: useTransform(scrollYProgress, [0, 1], [-100, 100]), background: `linear-gradient(to right, ${secondaryColor}, ${getDarkerShade(primaryColor, 40)})` }}
        />
        <motion.div
          className="absolute top-1/3 left-1/3 w-2/5 h-2/5 opacity-10 blur-3xl rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ background: `linear-gradient(to right, ${primaryColor}, ${getDarkerShade(secondaryColor, -20)})` }}
        />
      </div>

      <motion.div
        className="container mx-auto px-6 relative z-10"
        style={{ opacity, scale }}
      >
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-20"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold border backdrop-blur-md shadow-lg mb-6"
             style={{
              background: `linear-gradient(to right, ${primaryColor}26, ${secondaryColor}26)`, // Lighter gradient for badge
              color: primaryColor,
              borderColor: `${primaryColor}80`
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
            <span className="premium-font-body">Why Choose Us</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter premium-font-display"
          >
            <InlineTextEdit
              initialText={sectionData.title}
              onSave={(newText) => handleSaveText('title', newText)}
              isAdmin={isAdmin}
              placeholder="Section Title"
              as="span"
              textClassName="bg-clip-text text-transparent dark:text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                backgroundSize: "200% auto",
              }}
            />
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed premium-font-body"
          >
            <InlineTextEdit
              initialText={sectionData.subtitle}
              onSave={(newText) => handleSaveText('subtitle', newText)}
              isAdmin={isAdmin}
              placeholder="Section Subtitle"
              as="span"
            />
          </motion.p>
        </motion.div>

        {/* Main Features */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid lg:grid-cols-2 gap-16 mb-20"
        >
          {/* Features List */}
          <motion.div variants={featureVariants} className="space-y-6">
            {featuresToDisplay.map((feature, index) => {
              const IconComponent = feature.icon || Package; // Use Lucide icon from feature or default
              const isActive = activeFeature === index;
              
              return (
                <motion.div
                  key={feature.title + index}
                  className={`p-8 rounded-2xl border transition-all duration-300 cursor-pointer shadow-xl ${
                    isActive
                      ? `bg-white dark:bg-gray-800 ring-2`
                      : "bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:shadow-2xl"
                  }`}
                  style={isActive ? { borderColor: primaryColor, ringColor: `${primaryColor}80` } : { borderColor: 'transparent', '--hover-border-color': `${primaryColor}B3` }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = `${primaryColor}B3`; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'transparent'; }}
                  onClick={() => setActiveFeature(index)}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg text-3xl"
                      style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                    >
                      {feature.emoji || <IconComponent className="w-8 h-8 text-white" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white premium-font-display">
                           <InlineTextEdit
                            initialText={feature.title}
                            onSave={(newText) => handleSaveText('itemTitle', newText, index)}
                            isAdmin={isAdmin}
                            placeholder="Feature Title"
                          />
                        </h3>
                        {feature.stats && (
                          <Badge
                            variant="secondary"
                            className="text-xs font-semibold premium-font-body px-3 py-1 rounded-full border"
                            style={{ 
                              backgroundColor: `${primaryColor}1A`, 
                              color: primaryColor,
                              borderColor: `${primaryColor}4D`
                            }}
                          >
                            {feature.stats}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed premium-font-body">
                        <InlineTextEdit
                          initialText={feature.description}
                          onSave={(newText) => handleSaveText('itemDescription', newText, index)}
                          isAdmin={isAdmin}
                          placeholder="Feature Description"
                          useTextarea={true}
                        />
                      </p>
                      
                      {isActive && ( 
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="group rounded-full premium-font-body font-semibold border-2"
                            style={{ 
                              borderColor: primaryColor, 
                              color: primaryColor,
                              '--hover-bg-color': `${primaryColor}1A`
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${primaryColor}1A`}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            Learn More
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Feature Image/Video - This part uses the 'image' from the featuresToDisplay */}
          {featuresToDisplay[activeFeature] && (
            <motion.div
              variants={itemVariants}
              className="relative aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-float-lg"
            >
              {!isPublishedView && (featuresToDisplay[activeFeature]?.videoUrl || currentPexelsVideoUrl) && ( // Check Pexels URL too
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }} // Delay slightly after main content
                  // className="absolute top-4 right-4 z-20" // Original position
                  className="absolute top-3 left-3 z-20" // Changed to top-left
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 text-gray-900 dark:text-white backdrop-blur-md border-white/30 dark:border-gray-700/30 rounded-full shadow-lg"
                    onClick={handleOpenReplaceModal}
                    title="Replace Feature Video" // Title updated
                  >
                    <Edit2Icon className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}

              {featuresToDisplay[activeFeature]?.videoUrl ? ( // Specific video for the feature
                <div className="relative w-full h-full group">
                  <video
                    key={featuresToDisplay[activeFeature].videoUrl + activeFeature} // Key ensures re-render if URL changes
                    src={featuresToDisplay[activeFeature].videoUrl}
                    poster={featuresToDisplay[activeFeature].image || currentPexelsVideoPosterUrl || ''}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-2xl" />
                  <AnimatePresence>
                    {!isVideoPlaying && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-20 h-20 bg-white/20 dark:bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/30 dark:border-white/20 shadow-glass rounded-full">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : currentPexelsVideoUrl ? ( // Corrected from defaultThemeVideoUrl
                <div className="relative w-full h-full group">
                  <video
                    key={currentPexelsVideoUrl + activeFeature} // Key ensures re-render
                    src={currentPexelsVideoUrl}
                    poster={currentPexelsVideoPosterUrl || featuresToDisplay[activeFeature]?.image || ''}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-2xl" />
                  <AnimatePresence>
                    {!isVideoPlaying && ( // Show play button if video is not playing (e.g. on load before autoplay kicks in or if paused by browser)
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-20 h-20 bg-white/20 dark:bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/30 dark:border-white/20 shadow-glass rounded-full">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : featuresToDisplay[activeFeature]?.image ? ( // Specific image for the feature
                <motion.img
                  key={`image-${activeFeature}`}
                  src={featuresToDisplay[activeFeature].image}
                  alt={featuresToDisplay[activeFeature].title || "Premium feature image"}
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
              ) : ( // Ultimate fallback static image
                <motion.img
                  key={`fallback-image-${activeFeature}`}
                  src="https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Default feature background"
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
              )}
              
              {/* Overlay for text legibility if an image is shown (and not a video with its own overlay) */}
              {!(featuresToDisplay[activeFeature]?.videoUrl || currentPexelsVideoUrl) && <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 rounded-2xl" /> }
              
              {/* Feature Info Overlay */}
              <motion.div
                key={`overlay-${activeFeature}`} // Ensure this also re-triggers if content depends on activeFeature
                className="absolute bottom-8 left-8 right-8" // Premium: more padding
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl shadow-lg"
                       style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                    >
                      {featuresToDisplay[activeFeature].emoji || React.createElement(featuresToDisplay[activeFeature].icon || Package, {
                        className: "w-7 h-7 text-white"
                      })}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 dark:text-white premium-font-display">
                        {featuresToDisplay[activeFeature].title}
                      </h4>
                      {featuresToDisplay[activeFeature].stats && (
                        <p className="text-sm premium-font-body font-semibold" style={{ color: primaryColor }}>
                          {featuresToDisplay[activeFeature].stats}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed premium-font-body">
                    {featuresToDisplay[activeFeature].description}
                  </p>
                </div>
              </motion.div>

              {/* Decorative elements - Premium Theme */}
              <motion.div
                className="absolute -top-5 -right-5 w-28 h-28 opacity-30 blur-xl rounded-full flex items-center justify-center border border-white/20 dark:border-gray-700/30"
                style={{ background: `linear-gradient(to right, ${primaryColor}80, ${secondaryColor}80)`}}
                animate={{
                  y: [-8, 8, -8],
                  rotate: [0, 10, 0],
                }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                <CheckCircle className="w-12 h-12" style={{color: primaryColor}} />
              </motion.div>
            </motion.div>
          )}
        </motion.div>
        
        {!isPublishedView && storeId && (
          <ReplaceVideoModal
            open={isReplaceModalOpen}
            onOpenChange={setIsReplaceModalOpen}
            storeId={storeId}
            currentVideoUrl={featuresToDisplay[activeFeature]?.videoUrl || currentPexelsVideoUrl || ""} // Ensure correct current video
            currentImageUrl={featuresToDisplay[activeFeature]?.image || currentPexelsVideoPosterUrl || ""} 
            onVideoReplaced={handleVideoReplaced}
          />
        )}

        {/* Additional Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {(sectionData.secondaryItems || []).map((feature, index) => {
            const IconComponent = iconMap[feature.iconName] || Package; // Fallback to Package icon
            return (
              <motion.div
                key={feature.title + index}
                variants={itemVariants}
                className="text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 shadow-xl"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div
                  className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                >
                  <IconComponent className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 premium-font-display">
                  <InlineTextEdit
                    initialText={feature.title}
                    onSave={(newText) => handleSaveText(`secondaryItemTitle.${index}`, newText)}
                    isAdmin={isAdmin}
                    placeholder="Feature Title"
                  />
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed premium-font-body">
                  <InlineTextEdit
                    initialText={feature.description}
                    onSave={(newText) => handleSaveText(`secondaryItemDescription.${index}`, newText)}
                    isAdmin={isAdmin}
                    placeholder="Feature Description"
                    useTextarea={true}
                  />
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 p-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border-gray-200 dark:border-gray-700 shadow-xl" // Premium card
        >
          {(sectionData.statsItems || []).map((stat, index) => {
            const IconComponent = iconMap[stat.iconName] || Package; // Use iconMap
            return (
              <motion.div
                key={stat.label + index}
                variants={itemVariants}
                className="text-center"
              >
                <div
                  className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center shadow-md"
                   style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                >
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl font-black text-gray-800 dark:text-white mb-1 premium-font-display">
                  <InlineTextEdit
                    initialText={stat.number}
                    onSave={(newText) => handleSaveText(`statsItemNumber.${index}`, newText)}
                    isAdmin={isAdmin}
                    placeholder="Stat Number"
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 premium-font-body uppercase tracking-wider">
                  <InlineTextEdit
                    initialText={stat.label}
                    onSave={(newText) => handleSaveText(`statsItemLabel.${index}`, newText)}
                    isAdmin={isAdmin}
                    placeholder="Stat Label"
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default StoreFeatures;
