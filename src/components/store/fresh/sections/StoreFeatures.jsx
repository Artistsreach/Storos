import React from "react";
import { motion } from "framer-motion";
import {
  Truck,
  ShieldCheck,
  MessageSquare,
  Repeat,
  Sparkles,
  Zap,
  Award,
  Heart,
  Gift, // Added Gift for "Exclusive Offers"
  Package, // Added Package for "Thoughtful Packaging"
} from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import InlineTextEdit from "@/components/ui/InlineTextEdit";

const defaultFeatures = [
  {
    icon: Truck,
    title: "Fast & Reliable Shipping",
    description:
      "Get your favorite products delivered to your doorstep quickly and securely.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    description:
      "Shop with confidence using our encrypted and secure payment gateway.",
  },
  {
    icon: MessageSquare,
    title: "Dedicated Support",
    description:
      "Our friendly customer support team is here to help you every step of the way.",
  },
  {
    icon: Repeat,
    title: "Easy Returns & Exchanges",
    description:
      "Not a perfect fit? No worries! We offer hassle-free returns and exchanges.",
  },
  {
    icon: Award,
    title: "Premium Quality Guaranteed",
    description:
      "We source only the best materials and products to ensure your satisfaction.",
  },
  {
    icon: Gift,
    title: "Exclusive Offers",
    description:
      "Unlock special discounts and promotions available only to our valued customers.",
  },
];

const StoreFeatures = ({ store, isPublishedView = false }) => {
  const { theme, content, id: storeId } = store;
  const { updateStoreTextContent, viewMode } = useStore();

  const sectionTitle = content?.featuresSectionTitle || "Why You'll Love Us";
  const sectionSubtitle =
    content?.featuresSectionSubtitle ||
    "We're committed to providing an exceptional shopping experience from start to finish.";

  const featureCount = content?.featureTitles?.length || 4; // Default to showing 4 features
  const features = defaultFeatures
    .slice(0, Math.max(4, featureCount))
    .map((feat, i) => ({
      ...feat,
      title: content?.featureTitles?.[i] || feat.title,
      description: content?.featureDescriptions?.[i] || feat.description,
    }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 12 } },
  };
  
  const primaryColor = theme?.primaryColor || "#3B82F6"; // Default to a fresh blue

  return (
    <section
      id={`features-${storeId}`}
      className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/90 relative"
    >
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ 
              backgroundColor: `${primaryColor}1A`, // primary color with low opacity
              color: primaryColor,
              border: `1px solid ${primaryColor}40`
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Sparkles className="w-4 h-4" />
            <InlineTextEdit
              initialText={content?.featuresBadgeText || "Our Promise"}
              onSave={(newText) => updateStoreTextContent('featuresBadgeText', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="span"
              textClassName=""
              inputClassName="bg-transparent"
            />
          </motion.div>

          <InlineTextEdit
            initialText={sectionTitle}
            onSave={(newText) => updateStoreTextContent('featuresSectionTitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="h2"
            textClassName="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-slate-800 dark:text-white"
            inputClassName="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-slate-800 dark:text-white bg-transparent"
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-slate-800 dark:text-white"
          />

          <InlineTextEdit
            initialText={sectionSubtitle}
            onSave={(newText) => updateStoreTextContent('featuresSectionSubtitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="p"
            textClassName="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed"
            inputClassName="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed bg-transparent"
            className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed"
            useTextarea={true}
          />
        </motion.div>

        {/* Video Section */}
        <motion.div 
          className="my-12 md:my-16 aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-700/60"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <video
            src={content?.featuresVideoUrl || "https://videos.pexels.com/video-files/3840440/3840440-hd_1280_720_25fps.mp4"}
            poster={content?.featuresVideoPosterUrl || ""}
            controls
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" // Adjusted for potentially 6 features
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group bg-white dark:bg-slate-800/60 p-6 rounded-2xl shadow-lg hover:shadow-primary/10 border border-slate-200/80 dark:border-slate-700/60 hover:border-primary/40 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl mb-5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}10)`,
                  borderColor: `${primaryColor}30`
                }}
              >
                <feature.icon className="w-7 h-7 transition-colors duration-300" style={{ color: primaryColor }} />
              </div>
              <InlineTextEdit
                initialText={feature.title}
                onSave={(newText) => updateStoreTextContent(`featureTitles.${index}`, newText)}
                isAdmin={!isPublishedView && viewMode === 'edit'}
                as="h3"
                textClassName="text-lg font-semibold mb-2 text-slate-800 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors"
                inputClassName="text-lg font-semibold mb-2 text-slate-800 dark:text-white bg-transparent group-hover:text-primary dark:group-hover:text-primary-light"
                className="text-lg font-semibold mb-2 text-slate-800 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors"
              />
              <InlineTextEdit
                initialText={feature.description}
                onSave={(newText) => updateStoreTextContent(`featureDescriptions.${index}`, newText)}
                isAdmin={!isPublishedView && viewMode === 'edit'}
                as="p"
                textClassName="text-sm leading-relaxed text-slate-600 dark:text-slate-400"
                inputClassName="text-sm leading-relaxed text-slate-600 dark:text-slate-400 bg-transparent"
                className="text-sm leading-relaxed text-slate-600 dark:text-slate-400"
                useTextarea={true}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StoreFeatures;
