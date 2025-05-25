import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Target,
  Crosshair,
  Zap,
  Award,
  Users,
  Clock,
  Truck,
  Wrench, // Replaced Tool with Wrench
  Layers,
  Star, // Added Star import
} from "lucide-react";
import { useStore } from "../../../../contexts/StoreContext"; // Corrected path
import InlineTextEdit from "../../../ui/InlineTextEdit"; // Corrected path

const defaultFeatures = [
  {
    icon: Shield,
    title: "Premium Quality",
    description:
      "Crafted with the finest materials for lasting durability and exceptional performance.",
  },
  {
    icon: Target,
    title: "Innovative Design",
    description:
      "Thoughtfully designed products that combine aesthetics with practical functionality.",
  },
  {
    icon: Crosshair,
    title: "Customer Focused",
    description:
      "Dedicated support to ensure a seamless shopping experience from start to finish.",
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    description:
      "Efficient shipping and handling to get your products to you as quickly as possible.",
  },
  {
    icon: Award,
    title: "Top Rated",
    description:
      "Highly rated by customers for quality, service, and overall satisfaction.",
  },
  {
    icon: Users,
    title: "Community Favorite",
    description:
      "Join a growing community of satisfied customers who love our products.",
  },
  {
    icon: Wrench, 
    title: "Easy Returns",
    description:
      "Hassle-free return policy, ensuring you are happy with your purchase.",
  },
  {
    icon: Layers,
    title: "Wide Selection",
    description:
      "A diverse range of products to meet all your needs and preferences.",
  },
];

const StoreFeatures = ({ store, isPublishedView = false }) => {
  const { theme, content, id: storeId, card_background_url } = store;
  const { updateStoreTextContent, viewMode } = useStore();

  const sectionTitle = content?.featuresSectionTitle || "Why Choose Us?";
  const sectionSubtitle =
    content?.featuresSectionSubtitle ||
    "Discover the key benefits and features that make our products stand out from the rest.";

  const featureCount = content?.featureTitles?.length || 4;
  const features = defaultFeatures
    .slice(0, Math.max(4, featureCount))
    .map((feat, i) => ({
      ...feat,
      title: content?.featureTitles?.[i] || feat.title,
      description: content?.featureDescriptions?.[i] || feat.description,
    }));

  const sectionStyle = card_background_url
    ? { backgroundImage: `url(${card_background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }, // Slightly faster stagger
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10 } },
  };
  
  const primaryColor = theme?.primaryColor || "#DC2626"; // Default to red-600

  return (
    <section
      id={`features-${storeId}`}
      className="py-16 md:py-24 bg-slate-900 relative overflow-hidden"
      style={sectionStyle}
    >
      {card_background_url && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
      )}

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-800/30 rounded-md text-xs font-semibold text-red-300 mb-4 border border-red-700/50 font-mono uppercase tracking-widest"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Star className="w-3.5 h-3.5" />
             <InlineTextEdit
              initialText={content?.featuresBadgeText || "Our Commitment"}
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
            textClassName={`text-3xl md:text-5xl font-extrabold tracking-tight font-mono uppercase mb-4 ${
              card_background_url ? "text-white" : "bg-gradient-to-r from-slate-100 via-red-400 to-orange-400 bg-clip-text text-transparent"
            }`}
            inputClassName={`text-3xl md:text-5xl font-extrabold tracking-tight font-mono uppercase mb-4 bg-transparent ${
              card_background_url ? "text-white" : "bg-gradient-to-r from-slate-100 via-red-400 to-orange-400 bg-clip-text text-transparent"
            }`}
            className={`text-3xl md:text-5xl font-extrabold tracking-tight font-mono uppercase mb-4 ${
              card_background_url ? "text-white" : "bg-gradient-to-r from-slate-100 via-red-400 to-orange-400 bg-clip-text text-transparent"
            }`}
          />
          <InlineTextEdit
            initialText={sectionSubtitle}
            onSave={(newText) => updateStoreTextContent('featuresSectionSubtitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="p"
            textClassName={`max-w-2xl mx-auto text-md md:text-lg leading-relaxed ${
              card_background_url ? "text-slate-300" : "text-slate-400"
            }`}
            inputClassName={`max-w-2xl mx-auto text-md md:text-lg leading-relaxed bg-transparent ${
              card_background_url ? "text-slate-300" : "text-slate-400"
            }`}
            className={`max-w-2xl mx-auto text-md md:text-lg leading-relaxed ${
              card_background_url ? "text-slate-300" : "text-slate-400"
            }`}
            useTextarea={true}
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className={`
                ${card_background_url ? "bg-slate-950/40 backdrop-blur-md border-slate-700/50" : "bg-slate-800/70 border-slate-700"} 
                p-6 rounded-lg shadow-lg hover:shadow-red-900/30 transition-all duration-300 text-center group border hover:border-red-600/70
              `}
            >
              <div className="relative mb-5 inline-block">
                <motion.div
                  className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110 border-2"
                  style={{
                    backgroundColor: `${primaryColor}20`, // Use primaryColor with opacity
                    borderColor: `${primaryColor}50`,
                  }}
                >
                  <feature.icon
                    className="w-7 h-7 transition-colors duration-300"
                    style={{ color: primaryColor }}
                  />
                </motion.div>
              </div>

              <InlineTextEdit
                initialText={feature.title}
                onSave={(newText) => updateStoreTextContent(`featureTitles.${index}`, newText)}
                isAdmin={!isPublishedView && viewMode === 'edit'}
                as="h3"
                textClassName={`text-lg font-semibold mb-2 font-mono uppercase tracking-wide transition-colors duration-300 group-hover:text-red-400 ${
                  card_background_url ? "text-slate-100" : "text-white"
                }`}
                inputClassName={`text-lg font-semibold mb-2 font-mono uppercase tracking-wide bg-transparent ${
                  card_background_url ? "text-slate-100" : "text-white"
                }`}
                className={`text-lg font-semibold mb-2 font-mono uppercase tracking-wide transition-colors duration-300 group-hover:text-red-400 ${
                  card_background_url ? "text-slate-100" : "text-white"
                }`}
              />

              <InlineTextEdit
                initialText={feature.description}
                onSave={(newText) => updateStoreTextContent(`featureDescriptions.${index}`, newText)}
                isAdmin={!isPublishedView && viewMode === 'edit'}
                as="p"
                textClassName={`text-xs leading-relaxed transition-colors duration-300 ${
                  card_background_url ? "text-slate-300" : "text-slate-400"
                } group-hover:text-slate-200`}
                inputClassName={`text-xs leading-relaxed bg-transparent ${
                  card_background_url ? "text-slate-300" : "text-slate-400"
                } group-hover:text-slate-200`}
                className={`text-xs leading-relaxed transition-colors duration-300 ${
                  card_background_url ? "text-slate-300" : "text-slate-400"
                } group-hover:text-slate-200`}
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
