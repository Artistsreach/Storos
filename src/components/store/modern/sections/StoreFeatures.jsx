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
  Wand2 as WandIcon, // Added for Edit with AI button
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
import ReplaceVideoModal from "@/components/store/ReplaceVideoModal"; // Added - Keep one
import ChangeImageModal from "@/components/store/ChangeImageModal"; // Import the new generic modal
import EditImageModal from "@/components/store/EditImageModal";   // Import the new generic edit modal

const StoreFeatures = ({ store, isPublishedView = false }) => {
  const { updateStore, updateStoreTextContent } = useStore(); 
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentPexelsVideoUrl, setCurrentPexelsVideoUrl] = useState(null);
  const [currentPexelsVideoPosterUrl, setCurrentPexelsVideoPosterUrl] = useState(null);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false); 
  const [isChangeFeatureImageModalOpen, setIsChangeFeatureImageModalOpen] = useState(false);
  const [isEditFeatureImageModalOpen, setIsEditFeatureImageModalOpen] = useState(false); // State for EditImageModal
  const [currentEditingFeatureIndex, setCurrentEditingFeatureIndex] = useState(null); 
  const sectionRef = useRef(null);

  const iconMap = {
    Shield, Truck, CreditCard, Headphones, Star, Zap, GlobeIcon, AwardIcon, UsersIcon, HeartIcon, CheckCircle, Sparkles, ArrowRight, Play, Pause, Package
  };
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]); // Uncommented y
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);

  const primaryColor = store?.theme?.primaryColor || "#6366F1";
  const storeId = store?.id;
  const isAdmin = !isPublishedView;

  const defaultSectionContent = {
    title: "An Exceptional Experience",
    subtitle: "We're committed to providing you with the best shopping experience through our premium services and customer-first approach.",
    items: [
      {
        emoji: "",
        iconName: "Zap", // Or Lightbulb if available in iconMap
        title: "Smart Solutions", 
        description: "Innovative products designed for modern living and efficiency.",
        color: "#007AFF", // A modern blue
        stats: "Future Ready",
        image: "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=600&q=80", 
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
        const query = currentItem.title || currentItem.description || "modern abstract motion"; 
        try {
          console.log(`[Modern StoreFeatures] Fetching Pexels video for active feature "${query}"`);
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
    if (featuresToDisplay && featuresToDisplay.length > 0 && activeFeature < featuresToDisplay.length) { // Added check for activeFeature bounds
      fetchContextualVideo();
    }
  }, [activeFeature, featuresToDisplay]);

  const handleSaveText = async (field, value) => { 
    if (!storeId || !isAdmin) return;
    // This function is now managed by InlineTextEdit's onSave, which calls updateStoreTextContent
    // updateStoreTextContent handles the path like 'content.storeFeatures.title'
    // For items, it would be 'content.storeFeatures.items.0.title'
    // The InlineTextEdit components need to be configured with the correct identifier path.
    // This handleSaveText function can be simplified or removed if InlineTextEdit handles all direct updates.
    // For now, let's assume InlineTextEdit is correctly configured and this function might be redundant for text.
    // However, if we need to update other non-text properties of items, this structure is useful.

    // Let's adapt this to be more generic or ensure InlineTextEdit is correctly used.
    // For simplicity, I'll assume InlineTextEdit handles its own saving via updateStoreTextContent.
    // This function will be kept for potential future use or removed if fully redundant.
    console.log(`[ModernStoreFeatures] handleSaveText called with field: ${field}, value: ${value}. This might be redundant if InlineTextEdit is used.`);
    
    // Example of how it *would* work if InlineTextEdit wasn't directly calling updateStoreTextContent:
    // updateStoreTextContent(`content.storeFeatures.${field}`, value); // This assumes field is a direct path like "title" or "items.0.title"
  };
  
  const handleOpenChangeFeatureImageModal = (index) => {
    setCurrentEditingFeatureIndex(index);
    setIsChangeFeatureImageModalOpen(true);
  };

  const handleFeatureImageChanged = async (newImageUrl) => {
    if (storeId == null || currentEditingFeatureIndex == null || !newImageUrl) return;

    const newStoreFeaturesContent = JSON.parse(JSON.stringify(sectionData));
    if (newStoreFeaturesContent.items && newStoreFeaturesContent.items[currentEditingFeatureIndex]) {
      newStoreFeaturesContent.items[currentEditingFeatureIndex].image = newImageUrl;
      newStoreFeaturesContent.items[currentEditingFeatureIndex].videoUrl = ""; // Clear video if image is set
      
      // Update local state for immediate reflection if needed, though re-fetch/prop update is better
      // For example, if featuresToDisplay is derived from sectionData which is from store.content:
      // This change will be reflected when `store` prop updates.
    } else {
      console.error("Cannot update feature image: active feature item not found.");
      setIsChangeFeatureImageModalOpen(false);
      return;
    }

    try {
      await updateStore(storeId, {
        content: {
          ...store.content,
          storeFeatures: newStoreFeaturesContent,
        },
      });
      // The activeFeature's image might need to be re-evaluated if it was the one changed.
      // This should happen naturally if featuresToDisplay re-derives from the updated store prop.
    } catch (error) {
      console.error("Failed to update store with new feature image URL:", error);
    }
    setIsChangeFeatureImageModalOpen(false);
    setCurrentEditingFeatureIndex(null);
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
      className="relative py-20 gradient-bg overflow-hidden"
      id={`features-${storeId}`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-primary/5 blur-3xl rounded-full"
          style={{ backgroundColor: `${primaryColor}10`, y }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/5 blur-3xl rounded-full"
          style={{ y: y }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 blur-3xl rounded-full"
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full text-sm font-medium mb-6"
            style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Why Choose Us</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight"
          >
            <InlineTextEdit
              initialText={sectionData.title}
              onSave={(newText) => handleSaveText('title', newText)}
              isAdmin={isAdmin}
              placeholder="Section Title"
              as="span"
              textClassName="bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary dark:to-white bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, currentColor, ${primaryColor}, currentColor)`,
              }}
            />
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
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
                  className={`p-6 rounded-3xl border transition-all duration-500 cursor-pointer ${
                    isActive
                      ? "bg-white/20 dark:bg-black/20 border-white/30 dark:border-white/20 shadow-float-lg"
                      : "bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 hover:bg-white/15 dark:hover:bg-black/15"
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
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-3xl" // Emoji size
                      style={{ backgroundColor: feature.color || primaryColor + '30' }} // Use feature color or a derivative of primary
                    >
                      {feature.emoji || <IconComponent className="w-8 h-8 text-white" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
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
                            className="text-xs font-medium"
                            style={{ backgroundColor: `${feature.color || primaryColor}20`, color: feature.color || primaryColor }}
                          >
                            {feature.stats}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed">
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
                          className="mt-4 pt-4 border-t border-white/20 dark:border-white/10"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="group"
                            style={{ borderColor: feature.color || primaryColor, color: feature.color || primaryColor }}
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

          {/* Feature Image/Video */}
          {featuresToDisplay[activeFeature] && (
            <motion.div
              variants={itemVariants}
              className="relative aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-float-lg group" // Added group for edit button
            >
              {/* Edit Button for Image/Video */}
              {/* Edit Buttons for Image/Video */}
              {!isPublishedView && featuresToDisplay[activeFeature] && (
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(featuresToDisplay[activeFeature]?.videoUrl || currentPexelsVideoUrl) ? (
                    <Button
                      variant="outline"
                      size="sm" // Keep size consistent or adjust as needed
                      className="bg-background/70 hover:bg-background/90 text-foreground rounded-md p-2"
                      onClick={handleOpenReplaceModal}
                      title="Replace Feature Video"
                    >
                      <Edit2Icon className="h-4 w-4 mr-1" /> Replace Video
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-background/70 hover:bg-background/90 text-foreground rounded-md p-2"
                        onClick={() => handleOpenChangeFeatureImageModal(activeFeature)}
                        title="Change Feature Image"
                      >
                        <Edit2Icon className="h-4 w-4 mr-1" /> Change Image
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-background/70 hover:bg-background/90 text-foreground rounded-md p-2"
                        onClick={() => {
                           setCurrentEditingFeatureIndex(activeFeature);
                           setIsEditFeatureImageModalOpen(true);
                        }}
                        title="Edit Feature Image with AI"
                      >
                        <WandIcon className="h-4 w-4 mr-1" /> Edit with AI
                      </Button>
                    </>
                  )}
                </div>
              )}

              {featuresToDisplay[activeFeature]?.videoUrl ? (
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
                  alt={featuresToDisplay[activeFeature].title || "Modern feature image"}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
              ) : (
                <motion.img
                  key={`fallback-img-${activeFeature}`}
                  src={'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt="Default modern feature background"
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
              )}
              
              {/* Overlay - ensure it's applied if not a video or if video needs it */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {/* Feature Info Overlay */}
              <motion.div
                key={`overlay-${activeFeature}`} // Ensure this also re-triggers if content depends on activeFeature
                className="absolute bottom-6 left-6 right-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" // Emoji size
                      style={{ backgroundColor: featuresToDisplay[activeFeature].color || primaryColor + '30' }}
                    >
                      {featuresToDisplay[activeFeature].emoji || React.createElement(featuresToDisplay[activeFeature].icon || Package, {
                        className: "w-6 h-6 text-white"
                      })}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        {featuresToDisplay[activeFeature].title}
                      </h4>
                      {featuresToDisplay[activeFeature].stats && (
                        <p className="text-sm text-gray-200">
                          {featuresToDisplay[activeFeature].stats}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {featuresToDisplay[activeFeature].description}
                  </p>
                </div>
              </motion.div>

              {/* Decorative elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20 z-10" // Added z-10
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
                className="text-center p-6 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-3xl border border-white/20 dark:border-white/10 hover:bg-white/15 dark:hover:bg-black/15 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  <InlineTextEdit
                    initialText={feature.title}
                    onSave={(newText) => handleSaveText(`secondaryItemTitle.${index}`, newText)}
                    isAdmin={isAdmin}
                    placeholder="Feature Title"
                  />
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
          className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-3xl border border-white/20 dark:border-white/10"
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
                  className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <IconComponent className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  <InlineTextEdit
                    initialText={stat.number}
                    onSave={(newText) => handleSaveText('statsItemNumber', newText, index)}
                    isAdmin={isAdmin}
                    placeholder="Stat Number"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
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

      {/* Modal for Changing Feature Image */}
      {!isPublishedView && storeId && currentEditingFeatureIndex !== null && featuresToDisplay[currentEditingFeatureIndex] && (
        <ChangeImageModal
          isOpen={isChangeFeatureImageModalOpen}
          onOpenChange={setIsChangeFeatureImageModalOpen}
          currentImageUrl={featuresToDisplay[currentEditingFeatureIndex]?.image}
          onImageSelected={(newImageUrl) => handleFeatureImageChanged(newImageUrl)}
          imageSearchContext={`feature image for ${featuresToDisplay[currentEditingFeatureIndex]?.title || 'section'}`}
          modalTitle="Change Feature Image"
          storeName={store.name}
        />
      )}

      {/* Modal for Editing Feature Image */}
      {!isPublishedView && storeId && currentEditingFeatureIndex !== null && featuresToDisplay[currentEditingFeatureIndex] && (
        <EditImageModal
          isOpen={isEditFeatureImageModalOpen}
          onOpenChange={setIsEditFeatureImageModalOpen}
          currentImageUrl={featuresToDisplay[currentEditingFeatureIndex]?.image}
          onImageEdited={(newImageUrl) => handleFeatureImageChanged(newImageUrl)} // Can use the same handler
          imageContext={`feature image for "${featuresToDisplay[currentEditingFeatureIndex]?.title || 'section'}"`}
          modalTitle="Edit Feature Image with AI"
        />
      )}
    </section>
  );
};

export default StoreFeatures;
