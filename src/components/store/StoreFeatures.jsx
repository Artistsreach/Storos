import React from "react";
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
} from "lucide-react";
import { useStore } from "../../contexts/StoreContext.jsx";
import InlineTextEdit from "../ui/InlineTextEdit.jsx";

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
  const { theme, content, id: storeId, card_background_url } = store;
  const { updateStoreTextContent } = useStore();

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

  const sectionStyle = card_background_url
    ? { backgroundImage: `url(${card_background_url})` }
    : {};

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      id={`features-${storeId}`}
      className="py-20 bg-cover bg-center relative overflow-hidden"
      style={sectionStyle}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

      {/* Overlay for text legibility if background image is present */}
      {card_background_url && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      )}

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
            textClassName={`text-4xl md:text-5xl font-bold tracking-tight font-poppins ${card_background_url ? "text-white drop-shadow-md" : "bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"}`}
            className="w-full"
          >
            {sectionTitle}
          </InlineTextEdit>
          <InlineTextEdit
            initialText={sectionSubtitle}
            onSave={updateStoreTextContent}
            identifier="content.featuresSectionSubtitle"
            as="p"
            textClassName={`${card_background_url ? "text-gray-200 drop-shadow-sm" : "text-muted-foreground"} max-w-xl mx-auto mt-3 text-xl`}
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
              className={`${card_background_url ? "bg-white/10 backdrop-blur-md text-white border border-white/10" : "bg-card text-foreground border border-border"} 
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
                    backgroundColor: card_background_url
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
                className={`text-lg font-semibold mb-2 relative font-poppins ${card_background_url ? "text-white" : "text-foreground"}`}
              >
                {feature.title}
              </InlineTextEdit>
              <InlineTextEdit
                initialText={feature.description}
                onSave={updateStoreTextContent}
                identifier={`content.featureDescriptions.${index}`}
                as="p"
                className={`text-sm relative ${card_background_url ? "text-gray-300" : "text-muted-foreground"}`}
              >
                {feature.description}
              </InlineTextEdit>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StoreFeatures;
