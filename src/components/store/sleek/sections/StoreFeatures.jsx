import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
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
  Edit2Icon, // Added
  // Icons for secondary features
  Globe as GlobeIcon,
  Award as AwardIcon,
  Users as UsersIcon,
  Heart as HeartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/contexts/StoreContext";
import InlineTextEdit from "@/components/ui/InlineTextEdit";
import { searchPexelsVideos } from "../../../../lib/pexels"; // Changed to searchPexelsVideos
import ReplaceVideoModal from "@/components/store/ReplaceVideoModal"; // Added

const StoreFeatures = ({ store, isPublishedView = false }) => {
  const { updateStore } = useStore(); // Use updateStore for complex content
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentPexelsVideoUrl, setCurrentPexelsVideoUrl] = useState(null);
  const [currentPexelsVideoPosterUrl, setCurrentPexelsVideoPosterUrl] = useState(null);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false); // Added
  const sectionRef = useRef(null);

  const iconMap = {
    Shield, Truck, CreditCard, Headphones, Star, Zap, GlobeIcon, AwardIcon, UsersIcon, HeartIcon, CheckCircle, Sparkles, ArrowRight, Play, Pause, Package
  };
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]); // Uncommented to define y
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);

  const primaryColor = store?.theme?.primaryColor || "#6366F1";
  const storeId = store?.id;
  const isAdmin = !isPublishedView;

  // Moved these declarations before the useEffect that uses featuresToDisplay
  const defaultSectionContent = {
    title: "An Exceptional Experience",
    subtitle: "We're committed to providing you with the best shopping experience through our premium services and customer-first approach.",
    items: [
      {
        emoji: "💎",
        iconName: "Gem", // Assuming Gem is available or mapped in iconMap, or use another like StarIcon
        title: "Refined Aesthetics", 
        description: "Discover products with unparalleled design and elegance.",
        color: "#5E5CE6", // A sleek, modern color
        stats: "Top Tier",
        image: "https://images.pexels.com/photos/1212487/pexels-photo-1212487.jpeg?auto=compress&cs=tinysrgb&w=600&q=80", 
        videoUrl: "",
      },
      {
        emoji: "🚚",
        icon: Truck,
        title: "Fast Delivery",
        description: "Free shipping worldwide with express delivery options available.",
        color: "#3B82F6",
        stats: "2-3 Days",
        image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80",
      },
      {
        emoji: "💳",
        icon: CreditCard,
        title: "Easy Returns",
        description: "30-day hassle-free returns with full refund guarantee.",
        color: "#8B5CF6",
        stats: "30 Days",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
      },
      {
        emoji: "🎧",
        icon: Headphones,
        title: "24/7 Support",
        description: "Round-the-clock customer support via chat, email, and phone.",
        color: "#F59E0B",
        stats: "Always On",
        image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=600&q=80",
      },
    ],
    secondaryItems: [ // Default secondary features
      { iconName: "GlobeIcon", title: "Global Reach", description: "Serving customers in 50+ countries" },
      { iconName: "AwardIcon", title: "Premium Quality", description: "Certified products with quality guarantee" },
      { iconName: "UsersIcon", title: "Community Driven", description: "Join 100K+ satisfied customers" },
      { iconName: "HeartIcon", title: "Eco-Conscious", description: "Sustainable packaging and practices" },
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
      if (currentItem && !currentItem.videoUrl) { 
        const query = currentItem.title || currentItem.description || "minimalist abstract animation";
        try {
          console.log(`[Sleek StoreFeatures] Fetching Pexels video for active feature "${query}"`);
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
        setCurrentPexelsVideoUrl(null);
        setCurrentPexelsVideoPosterUrl(null);
      }
    };
    if (featuresToDisplay && featuresToDisplay.length > 0 && activeFeature < featuresToDisplay.length) {
      fetchContextualVideo();
    }
  }, [activeFeature, featuresToDisplay]);

  const handleSaveText = async (field, value) => { 
    if (!storeId || !isAdmin) return;

    let newStoreFeaturesContent = JSON.parse(JSON.stringify(sectionData)); 

    const fieldParts = field.split('.'); 
    const baseFieldKey = fieldParts[0]; 
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
    } else if (baseFieldKey.startsWith('statsItem') && itemArrayIndex !== null) {
      const actualItemProperty = baseFieldKey.replace('statsItem', '').toLowerCase();
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

  const handleOpenReplaceModal = () => setIsReplaceModalOpen(true);

  const handleVideoReplaced = async (newVideoUrl) => {
    if (!storeId || !isAdmin || activeFeature === null || !featuresToDisplay[activeFeature]) return;

    const newStoreFeaturesContent = JSON.parse(JSON.stringify(sectionData)); 
    
    if (newStoreFeaturesContent.items && newStoreFeaturesContent.items[activeFeature]) {
      newStoreFeaturesContent.items[activeFeature].videoUrl = newVideoUrl;
      newStoreFeaturesContent.items[activeFeature].image = ""; // Clear image if video is set
      setCurrentPexelsVideoUrl(null); 
      setCurrentPexelsVideoPosterUrl(null);
    } else {
      console.error("Cannot update video URL: active feature item not found.");
      setIsReplaceModalOpen(false);
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
      console.error("Failed to update store with new feature video URL:", error);
    }
    setIsReplaceModalOpen(false);
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
      className="relative py-20 gradient-bg overflow-hidden font-inter"
      id={`features-${storeId}`}
    >
      {/* Background Elements - Sleek Theme */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 w-1/2 h-1/2 bg-primary/10 blur-3xl" // Sleek: larger, softer blurs
          style={{ backgroundColor: `${primaryColor}1A`, y }} // Use primaryColor with alpha
        />
        <motion.div
          className="absolute bottom-10 right-10 w-1/2 h-1/2 bg-secondary/10 blur-3xl" // Sleek: larger, softer blurs
          style={{ backgroundColor: `${store?.theme?.secondaryColor || primaryColor}1A`, y: useTransform(scrollYProgress, [0, 1], [-100, 100]) }} // Example secondary color usage
        />
        <motion.div
          className="absolute top-1/3 left-1/3 w-2/5 h-2/5 bg-accent/10 blur-3xl" // Sleek: larger, softer blurs
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
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
            className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 text-sm font-medium mb-6 shadow-glass" // Sleek: shadow-glass
            style={{ color: primaryColor, borderColor: `${primaryColor}40` }} // Slightly more prominent border for sleek
          >
            <Sparkles className="w-5 h-5" /> 
            <span className="tracking-wide">Why Choose Us</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-6 tracking-tight" // Sleek: slightly softer text color than pure black/white
          >
            <InlineTextEdit
              initialText={sectionData.title}
              onSave={(newText) => handleSaveText('title', newText)}
              isAdmin={isAdmin}
              placeholder="Section Title"
              as="span"
              textClassName="text-gray-800 dark:text-gray-100" // No gradient for sleek, clean text
            />
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed" // Standard muted foreground for sleek
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
                  key={feature.title + index} // Ensure unique key
                  className={`p-6 border transition-all duration-300 cursor-pointer backdrop-blur-md shadow-glass ${ // Sleek: glassmorphism
                    isActive
                      ? "bg-white/20 dark:bg-black/20 border-primary/50 dark:border-primary/40 ring-2 ring-primary/30" // Sleek active
                      : "bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 hover:bg-white/15 dark:hover:bg-black/15 hover:border-white/30 dark:hover:border-white/20" // Sleek inactive
                  }`}
                  onClick={() => setActiveFeature(index)}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 flex items-center justify-center shadow-md text-3xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10" // Sleek icon container
                      style={{ borderColor: feature.color || `${primaryColor}50` }}
                    >
                      {feature.emoji || <IconComponent className="w-8 h-8" style={{color: feature.color || primaryColor}} />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100"> {/* Sleek: font-semibold */}
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
                            className="text-xs font-medium tracking-wide px-2.5 py-1 bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5" // Sleek badge
                            style={{ color: feature.color || primaryColor, borderColor: `${feature.color || primaryColor}30` }}
                          >
                            {feature.stats}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed"> {/* Sleek description text */}
                        <InlineTextEdit
                          initialText={feature.description}
                          onSave={(newText) => handleSaveText('itemDescription', newText, index)}
                          isAdmin={isAdmin}
                          placeholder="Feature Description"
                          useTextarea={true}
                        />
                      </p>
                      
                      {isActive && ( // This "Learn More" can be removed or made dynamic if not part of AI content
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-white/10 dark:border-white/5" // Sleek border
                        >
                          <Button
                            variant="ghost" // Sleek: ghost or link button
                            size="sm"
                            className="group text-sm tracking-wide"
                            style={{ color: feature.color || primaryColor }}
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
              className="relative aspect-square lg:aspect-[4/3] overflow-hidden shadow-float-lg"
            >
              {!isPublishedView && (featuresToDisplay[activeFeature]?.videoUrl || currentPexelsVideoUrl) && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-3 left-3 z-20 bg-background/70 hover:bg-background/90 text-foreground p-2" // Style for Sleek
                  onClick={handleOpenReplaceModal}
                  title="Replace Feature Video"
                >
                  <Edit2Icon className="h-5 w-5" />
                </Button>
              )}
              {featuresToDisplay[activeFeature]?.videoUrl ? ( // Specific video for the feature
                <video
                  key={`feat-video-${activeFeature}`}
                  src={featuresToDisplay[activeFeature].videoUrl}
                  poster={featuresToDisplay[activeFeature].image || currentPexelsVideoPosterUrl || ''}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : currentPexelsVideoUrl ? ( // Contextual Pexels video
                <video
                  key={`current-pexels-video-${activeFeature}`}
                  src={currentPexelsVideoUrl}
                  poster={currentPexelsVideoPosterUrl || featuresToDisplay[activeFeature]?.image || ''}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : featuresToDisplay[activeFeature]?.image ? ( // Specific image for the feature
                <motion.img
                  key={`feat-img-${activeFeature}`}
                  src={featuresToDisplay[activeFeature].image}
                  alt={featuresToDisplay[activeFeature].title || "Sleek feature image"}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
              ) : (
                <motion.img
                  key={`fallback-img-${activeFeature}`}
                  src={'https://images.pexels.com/photos/268351/pexels-photo-268351.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt="Default sleek feature background"
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
              )}
              
              {/* Overlay - ensure it's applied if not a video or if video needs it */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" /> 
              
              {/* Feature Info Overlay */}
              <motion.div
                key={`overlay-${activeFeature}`} // Ensure this also re-triggers if content depends on activeFeature
                className="absolute bottom-6 left-6 right-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/10 dark:border-white/5 p-6 shadow-glass-light"> {/* Sleek overlay */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 flex items-center justify-center text-2xl bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5" // Sleek icon container in overlay
                      style={{ borderColor: featuresToDisplay[activeFeature].color || `${primaryColor}50` }}
                    >
                      {featuresToDisplay[activeFeature].emoji || React.createElement(featuresToDisplay[activeFeature].icon || Package, {
                        className: "w-6 h-6", style: {color: featuresToDisplay[activeFeature].color || primaryColor}
                      })}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-100 dark:text-white"> {/* Sleek text */}
                        {featuresToDisplay[activeFeature].title}
                      </h4>
                      {featuresToDisplay[activeFeature].stats && (
                        <p className="text-sm text-gray-300 dark:text-gray-400"> {/* Sleek text */}
                          {featuresToDisplay[activeFeature].stats}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-200 dark:text-gray-300 text-sm leading-relaxed"> {/* Sleek text */}
                    {featuresToDisplay[activeFeature].description}
                  </p>
                </div>
              </motion.div>

              {/* Decorative elements - Sleek Theme */}
                <motion.div
                  className="absolute -top-5 -right-5 w-28 h-28 bg-primary/10 backdrop-blur-xl flex items-center justify-center border border-white/10 dark:border-white/5 z-10" // Added z-10
                  style={{ backgroundColor: `${primaryColor}1A`}}
                  animate={{
                    y: [-8, 8, -8],
                  rotate: [0, 10, 0],
                }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                <CheckCircle className="w-12 h-12 text-green-400" />
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Additional Features Grid - Kept as is for now, can be made dynamic later */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {(sectionData.secondaryItems || []).map((feature, index) => {
            const IconComponent = iconMap[feature.iconName] || Package;
            return (
              <motion.div
                key={feature.title + index}
                variants={itemVariants}
                className="text-center p-6 bg-white/5 dark:bg-black/5 backdrop-blur-md border border-white/10 dark:border-white/5 hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-300 shadow-glass-light" // Sleek card
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10" // Sleek icon container
                  style={{ borderColor: primaryColor+"50" }}
                >
                  <IconComponent className="w-8 h-8" style={{color: primaryColor}} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2"> {/* Sleek text */}
                  <InlineTextEdit
                    initialText={feature.title}
                    onSave={(newText) => handleSaveText(`secondaryItemTitle.${index}`, newText)}
                    isAdmin={isAdmin}
                    placeholder="Feature Title"
                  />
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"> {/* Sleek text */}
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
          className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-white/5 dark:bg-black/5 backdrop-blur-lg border border-white/10 dark:border-white/5 shadow-glass" // Sleek card
        >
          {(sectionData.statsItems || []).map((stat, index) => {
            const IconComponent = iconMap[stat.iconName] || Package;
            return (
              <motion.div
                key={stat.label + index}
                variants={itemVariants}
                className="text-center"
              >
                <div
                  className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5" // Sleek icon container
                  style={{ borderColor: `${primaryColor}40` }}
                >
                  <IconComponent className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1"> {/* Sleek text */}
                  <InlineTextEdit
                    initialText={stat.number}
                    onSave={(newText) => handleSaveText('statsItemNumber', newText, index)}
                    isAdmin={isAdmin}
                    placeholder="Stat Number"
                  />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300"> {/* Sleek text */}
                  <InlineTextEdit
                    initialText={stat.label}
                    onSave={(newText) => handleSaveText('statsItemLabel', newText, index)}
                    isAdmin={isAdmin}
                    placeholder="Stat Label"
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
      {!isPublishedView && storeId && (
        <ReplaceVideoModal
          open={isReplaceModalOpen}
          onOpenChange={setIsReplaceModalOpen}
          storeId={storeId}
          currentVideoUrl={featuresToDisplay[activeFeature]?.videoUrl || currentPexelsVideoUrl}
          onVideoReplaced={handleVideoReplaced}
        />
      )}
    </section>
  );
};

export default StoreFeatures;
