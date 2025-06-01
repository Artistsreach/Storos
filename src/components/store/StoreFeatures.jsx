import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  ShieldCheck,
  MessageSquare,
  Repeat,
  Clock,
  Gift,
  CreditCard,
  Award,
  Edit2Icon, // Added
} from "lucide-react";
import { useStore } from "../../contexts/StoreContext.jsx";
import InlineTextEdit from "../ui/InlineTextEdit.jsx";
import { searchPexelsPhotos } from "../../lib/pexels.js";
import { Button } from "../ui/button.jsx"; // Added
import ReplaceVideoModal from "./ReplaceVideoModal.jsx"; // Added - path might need adjustment

const defaultFeatures = [
  {
    icon: Truck,
    title: "Fast Worldwide Shipping",
    description:
      "Get your orders delivered quickly and reliably, no matter where you are.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Online Payments",
    description:
      "Shop with confidence using our encrypted and secure payment gateways.",
  },
  {
    icon: MessageSquare,
    title: "24/7 Customer Support",
    description:
      "Our dedicated team is here to help you around the clock with any queries.",
  },
  {
    icon: Repeat,
    title: "Easy Returns & Exchanges",
    description:
      "Not satisfied? We offer a hassle-free return and exchange policy.",
  },
  {
    icon: Clock,
    title: "Same-Day Dispatch",
    description:
      "Order before 2pm for same-day dispatch on all in-stock items.",
  },
  {
    icon: Gift,
    title: "Gift Wrapping",
    description:
      "Make your gift special with our premium gift wrapping service.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment Options",
    description: "Choose from multiple payment methods for your convenience.",
  },
  {
    icon: Award,
    title: "Quality Guarantee",
    description: "All our products are backed by our satisfaction guarantee.",
  },
];

const StoreFeatures = ({ store, isPublishedView = false }) => {
  const { theme, content, id: storeId, card_background_url } = store; // card_background_url might be deprecated for video
  const { updateStoreTextContent, updateStore } = useStore(); // Added updateStore
  const [defaultSectionBackgroundUrl, setDefaultSectionBackgroundUrl] = useState(null);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [featuresVideoUrl, setFeaturesVideoUrl] = useState(store?.content?.featuresVideoUrl || null);

  useEffect(() => {
    setFeaturesVideoUrl(store?.content?.featuresVideoUrl || null);
  }, [store?.content?.featuresVideoUrl]);

  useEffect(() => {
    const fetchDefaultBackground = async () => {
      // If there's a video, we don't need a Pexels image fallback for the main background
      if (featuresVideoUrl || card_background_url) return;

      const query = "versatile abstract texture";
      try {
        const result = await searchPexelsPhotos(query, 1);
        if (result && result.photos && result.photos.length > 0) {
          const photo = result.photos[0];
          setDefaultSectionBackgroundUrl(photo.src.large2x || photo.src.original || photo.src.large || photo.src.medium);
        } else {
          setDefaultSectionBackgroundUrl('https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
        }
      } catch (error) {
        console.error("Failed to fetch Pexels photo for generic section background:", error);
        setDefaultSectionBackgroundUrl('https://images.pexels.com/photos/540518/pexels-photo-540518.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
      }
    };

    fetchDefaultBackground();
  }, [card_background_url, featuresVideoUrl]);

  const handleOpenReplaceModal = () => setIsReplaceModalOpen(true);

  const handleVideoReplaced = async (newVideoUrl) => {
    if (storeId && newVideoUrl) {
      try {
        await updateStore(storeId, {
          content: {
            ...store.content,
            featuresVideoUrl: newVideoUrl,
            // Optionally clear card_background_url if it was used as a poster or fallback
            // card_background_url: null, 
          },
        });
        setFeaturesVideoUrl(newVideoUrl);
      } catch (error) {
        console.error("Failed to update store with new features video URL:", error);
      }
    }
  };

  // Use store.content for section title and subtitle if available
  const sectionTitle = content?.featuresSectionTitle || "Why Shop With Us?";
  const sectionSubtitle =
    content?.featuresSectionSubtitle ||
    "We are committed to providing you with the best shopping experience.";

  // Use only the first 4 features by default, or more if they're defined in content
  const featureCount = content?.featureTitles?.length || 4;
  const features = defaultFeatures
    .slice(0, Math.max(4, featureCount))
    .map((feat, i) => ({
      ...feat,
      title: content?.featureTitles?.[i] || feat.title,
      description: content?.featureDescriptions?.[i] || feat.description,
    }));

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: (index) => ({
      opacity: 0,
      y: index % 2 === 0 ? 50 : -50, // Alternate direction
      scale: 0.8, // Start slightly smaller
    }),
    visible: (index) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.1, // Stagger delay
        type: "spring", // Use spring for a smoother animation
        stiffness: 100, // Spring stiffness
      },
    }),
  };

  return (
    <section
      id={`features-${storeId}`}
      className="py-20 relative overflow-hidden gradient-bg" // Replaced bg-background with gradient-bg
    >
      {/* Background Video or Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        {featuresVideoUrl ? (
          <video
            key={featuresVideoUrl} // Ensures re-render if URL changes
            src={featuresVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : card_background_url ? (
          <img src={card_background_url} alt="Features background" className="w-full h-full object-cover" />
        ) : defaultSectionBackgroundUrl ? (
          <img src={defaultSectionBackgroundUrl} alt="Default features background" className="w-full h-full object-cover" />
        ) : null}
        {/* Overlay for text legibility if background video/image is present */}
        {(featuresVideoUrl || card_background_url || defaultSectionBackgroundUrl) && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        )}
      </div>
      
      {!isPublishedView && featuresVideoUrl && (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4 z-20 bg-background/70 hover:bg-background/90 text-foreground rounded-full p-2"
          onClick={handleOpenReplaceModal}
          title="Replace Features Video"
        >
          <Edit2Icon className="h-5 w-5" />
        </Button>
      )}

      {/* Decorative elements (adjust z-index if needed) */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl z-0"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-16"
        >
          <InlineTextEdit
            initialText={sectionTitle}
            onSave={updateStoreTextContent}
            identifier="content.featuresSectionTitle"
            as="h2"
            textClassName={`text-4xl md:text-5xl font-bold tracking-tight font-poppins ${(featuresVideoUrl || card_background_url || defaultSectionBackgroundUrl) ? "text-white drop-shadow-md" : "bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"}`}
            className="w-full"
          >
            {sectionTitle}
          </InlineTextEdit>
          <InlineTextEdit
            initialText={sectionSubtitle}
            onSave={updateStoreTextContent}
            identifier="content.featuresSectionSubtitle"
            as="p"
            textClassName={`${(featuresVideoUrl || card_background_url || defaultSectionBackgroundUrl) ? "text-gray-200 drop-shadow-sm" : "text-muted-foreground"} max-w-xl mx-auto mt-3 text-xl`}
            className="w-full"
          >
            {sectionSubtitle}
          </InlineTextEdit>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`${(featuresVideoUrl || card_background_url || defaultSectionBackgroundUrl) ? "bg-white/10 backdrop-blur-md text-white border border-white/10" : "bg-card text-foreground border border-border"} 
                p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden group`}
            >
              {/* Hover effect background */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at center, ${theme.primaryColor}15 0%, transparent 70%)`,
                }}
              ></div>

              {/* Icon with animated background */}
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: (featuresVideoUrl || card_background_url || defaultSectionBackgroundUrl)
                      ? `${theme.primaryColor}40`
                      : `${theme.primaryColor}15`,
                  }}
                >
                  <feature.icon
                    className="w-7 h-7"
                    style={{ color: theme.primaryColor }}
                  />
                </div>
              </div>

              <InlineTextEdit
                initialText={feature.title}
                onSave={updateStoreTextContent}
                identifier={`content.featureTitles.${index}`}
                as="h3"
                className={`text-lg font-semibold mb-2 relative font-poppins ${(featuresVideoUrl || card_background_url || defaultSectionBackgroundUrl) ? "text-white" : "text-foreground"}`}
              >
                {feature.title}
              </InlineTextEdit>
              <InlineTextEdit
                initialText={feature.description}
                onSave={updateStoreTextContent}
                identifier={`content.featureDescriptions.${index}`}
                as="p"
                className={`text-sm relative ${(featuresVideoUrl || card_background_url || defaultSectionBackgroundUrl) ? "text-gray-300" : "text-muted-foreground"}`}
              >
                {feature.description}
              </InlineTextEdit>
            </motion.div>
          ))}
        </motion.div>
      </div>
      {!isPublishedView && storeId && (
        <ReplaceVideoModal
          open={isReplaceModalOpen}
          onOpenChange={setIsReplaceModalOpen}
          storeId={storeId}
          currentVideoUrl={featuresVideoUrl}
          onVideoReplaced={handleVideoReplaced}
          // You might need a specific identifier or context for this modal if it's generic
        />
      )}
    </section>
  );
};

export default StoreFeatures;
