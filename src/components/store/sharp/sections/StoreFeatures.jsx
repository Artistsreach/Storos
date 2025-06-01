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
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  const primaryColor = store?.theme?.primaryColor || "#6366F1";
  const storeId = store?.id;
  const isAdmin = !isPublishedView;

  // Moved these declarations before the useEffect that uses featuresToDisplay
  const defaultSectionContent = {
    title: "An Exceptional Experience",
    subtitle: "We're committed to providing you with the best shopping experience through our premium services and customer-first approach.",
    items: [
      {
        emoji: "⚡",
        iconName: "Zap", 
        title: "Cutting-Edge Tech", 
        description: "Explore the latest innovations and high-performance gadgets.",
        color: "#3B82F6", // Blue-500
        stats: "New Arrivals",
        image: "https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=600&q=80", 
        videoUrl: "",
      },
      {
        emoji: "🚚",
        icon: Truck,
        title: "Fast Delivery",
        description: "Free shipping worldwide with express delivery options available.",
        color: "#2563EB", // Blue-600
        stats: "2-3 Days",
        image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80",
      },
      {
        emoji: "💳",
        icon: CreditCard,
        title: "Easy Returns",
        description: "30-day hassle-free returns with full refund guarantee.",
        color: "#1D4ED8", // Blue-700
        stats: "30 Days",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
      },
      {
        emoji: "🎧",
        icon: Headphones,
        title: "24/7 Support",
        description: "Round-the-clock customer support via chat, email, and phone.",
        color: "#60A5FA", // Blue-400
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
    if (featuresToDisplay && featuresToDisplay.length > 0 && activeFeature >= 0 && activeFeature < featuresToDisplay.length) {
      const currentItem = featuresToDisplay[activeFeature]; // Access is now strictly within the guard

      const fetchContextualVideo = async () => {
        if (currentItem && !currentItem.videoUrl) {
          const query = currentItem.title || currentItem.description || "abstract geometric animation";
          try {
            console.log(`[Sharp StoreFeatures] Fetching Pexels video for active feature "${query}"`);
            const result = await searchPexelsVideos(query, 1);
            if (result && result.videos && result.videos.length > 0) {
              setCurrentPexelsVideoUrl(result.videos[0].videoUrl);
              setCurrentPexelsVideoPosterUrl(result.videos[0].imageUrl);
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
        } else {
            setCurrentPexelsVideoUrl(null);
            setCurrentPexelsVideoPosterUrl(null);
        }
      };
      fetchContextualVideo();
    } else {
      // Handle cases where featuresToDisplay is not ready or activeFeature is out of bounds
      setCurrentPexelsVideoUrl(null);
      setCurrentPexelsVideoPosterUrl(null);
    }
  }, [activeFeature, featuresToDisplay]);

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
      className="relative py-20 text-white overflow-hidden gradient-bg"
      id={`features-${storeId}`}
    >
      {/* Background Elements - Sharp Theme */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-700/10 blur-3xl rounded-full opacity-60"
          style={{ y }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-600/10 blur-3xl rounded-full opacity-50"
          style={{ y }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-slate-700/10 blur-3xl rounded-full opacity-40"
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/40 text-blue-300 border border-blue-700/60 rounded-md text-xs font-mono uppercase tracking-widest mb-6"
          >
            <Star className="w-4 h-4" />
            <span>Why Choose Us</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tighter font-mono uppercase"
          >
            <InlineTextEdit
              initialText={sectionData.title}
              onSave={(newText) => handleSaveText('title', newText)}
              isAdmin={isAdmin}
              placeholder="Section Title"
              as="span"
              textClassName="bg-gradient-to-r from-slate-100 via-blue-400 to-sky-400 bg-clip-text text-transparent"
              style={{
                backgroundSize: "200% auto",
              }}
              // Add animate prop if you want the gradient to move like in hero
            />
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
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
                  className={`p-6 rounded-md border transition-all duration-300 cursor-pointer ${ // Sharper: rounded-md
                    isActive
                      ? "bg-slate-700/90 border-2 border-blue-500 shadow-xl ring-2 ring-blue-500/30" // Enhanced Sharp active style
                      : "bg-slate-800/70 border border-slate-700/50 shadow-lg hover:border-blue-500/80" // Enhanced Sharp inactive style
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
                      className="w-16 h-16 rounded-md flex items-center justify-center shadow-md text-3xl" // Sharper: rounded-md
                      style={{ backgroundColor: feature.color || `${primaryColor}DD` }} // Use feature color or a very opaque primary for pop
                    >
                      {feature.emoji || <IconComponent className="w-8 h-8 text-white" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-blue-400 font-mono uppercase"> {/* Title with accent color */}
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
                            className="text-xs font-medium font-mono uppercase"
                            style={{ backgroundColor: `${feature.color || primaryColor}40`, color: feature.color || primaryColor, borderColor: `${feature.color || primaryColor}60` }}
                          >
                            {feature.stats}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-slate-400 leading-relaxed">
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
                          className="mt-4 pt-4 border-t border-slate-700"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="group font-mono uppercase tracking-wider border-2 border-blue-600/70 text-blue-400 hover:bg-blue-600/20 hover:border-blue-500"
                            // style={{ borderColor: feature.color || primaryColor, color: feature.color || primaryColor }} // Replaced by classes
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
              className="relative aspect-square lg:aspect-[4/3] rounded-lg overflow-hidden shadow-2xl border-2 border-slate-700/50" // Style like Hero visual container
            >
              {!isPublishedView && (featuresToDisplay[activeFeature]?.videoUrl || currentPexelsVideoUrl) && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-3 left-3 z-20 bg-slate-800/70 hover:bg-slate-700/90 text-white rounded-full p-2" // Adjusted for sharp theme
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
                  className="absolute inset-0 w-full h-full object-cover rounded-md"
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
                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                />
              ) : featuresToDisplay[activeFeature]?.image ? ( // Specific image for the feature
                <motion.img
                  key={`feat-img-${activeFeature}`}
                  src={featuresToDisplay[activeFeature].image}
                  alt={featuresToDisplay[activeFeature].title || "Sharp feature image"}
                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
              ) : (
                <motion.img
                  key={`fallback-img-${activeFeature}`}
                  src={'https://images.pexels.com/photos/2110951/pexels-photo-2110951.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt="Default sharp feature background"
                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
              )}
              
              {/* Overlay - ensure it's applied if not a video or if video needs it */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-md" />
              
              {/* Feature Info Overlay */}
              <motion.div
                key={`overlay-${activeFeature}`} // Ensure this also re-triggers if content depends on activeFeature
                className="absolute bottom-4 left-4 right-4" // Adjusted padding
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-slate-800/80 backdrop-blur-md border border-slate-600/80 rounded-md p-4 shadow-lg"> {/* Sharper overlay */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-md flex items-center justify-center text-xl" // Adjusted size
                      style={{ backgroundColor: featuresToDisplay[activeFeature].color || `${primaryColor}CC` }}
                    >
                      {featuresToDisplay[activeFeature].emoji || React.createElement(featuresToDisplay[activeFeature].icon || Package, {
                        className: "w-5 h-5 text-white" // Adjusted size
                      })}
                    </div>
                    <div>
                      <h4 className="text-md font-bold text-blue-400 font-mono uppercase"> {/* Accent color title */}
                        {featuresToDisplay[activeFeature].title}
                      </h4>
                      {featuresToDisplay[activeFeature].stats && (
                        <p className="text-xs text-slate-300 font-mono uppercase"> {/* Uppercase stats */}
                          {featuresToDisplay[activeFeature].stats}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal"> {/* Adjusted size and leading */}
                    {featuresToDisplay[activeFeature].description}
                  </p>
                </div>
              </motion.div>

              {/* Decorative elements - Sharp Theme */}
                <motion.div
                  className="absolute -top-2 -right-2 w-16 h-16 bg-blue-600/40 backdrop-blur-sm rounded-md flex items-center justify-center border border-blue-500/60 z-10" // Adjusted styling, Added z-10
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
                className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-md border border-slate-700/50 hover:bg-slate-700/80 hover:border-blue-500/70 transition-all duration-300 shadow-lg" // Sharper cards
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-md flex items-center justify-center shadow-md" // Sharper: rounded-md
                  style={{ backgroundColor: primaryColor }} 
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-blue-400 mb-2 font-mono uppercase"> {/* Accent color title */}
                  <InlineTextEdit
                    initialText={feature.title}
                    onSave={(newText) => handleSaveText(`secondaryItemTitle.${index}`, newText)}
                    isAdmin={isAdmin}
                    placeholder="Feature Title"
                  />
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
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
          className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-slate-800/70 backdrop-blur-md rounded-md border border-slate-700/50 shadow-xl" // Sharper stats section
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
                  className="w-12 h-12 mx-auto mb-2 rounded-md flex items-center justify-center" // Sharper: rounded-md
                  style={{ backgroundColor: `${primaryColor}50` }} 
                >
                  <IconComponent className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <div className="text-2xl font-bold text-white mb-1 font-mono"> {/* Slightly smaller number for balance */}
                  <InlineTextEdit
                    initialText={stat.number}
                    onSave={(newText) => handleSaveText('statsItemNumber', newText, index)}
                    isAdmin={isAdmin}
                    placeholder="Stat Number"
                  />
                </div>
                <div className="text-xs text-slate-400 font-mono uppercase tracking-widest"> {/* Tracking widest for labels */}
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
