
import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, MessageSquare, Repeat } from 'lucide-react';

const defaultFeatures = [
  { icon: Truck, title: "Fast Worldwide Shipping", description: "Get your orders delivered quickly and reliably, no matter where you are." },
  { icon: ShieldCheck, title: "Secure Online Payments", description: "Shop with confidence using our encrypted and secure payment gateways." },
  { icon: MessageSquare, title: "24/7 Customer Support", description: "Our dedicated team is here to help you around the clock with any queries." },
  { icon: Repeat, title: "Easy Returns & Exchanges", description: "Not satisfied? We offer a hassle-free return and exchange policy." }
];

const StoreFeatures = ({ store, isPublishedView = false }) => {
  const { theme, content, id: storeId } = store; // Removed card_background_url from destructuring as it's no longer used for section background
  const features = defaultFeatures.map((feat, i) => ({
    ...feat,
    title: content?.featureTitles?.[i] || feat.title,
    description: content?.featureDescriptions?.[i] || feat.description,
  }));

  // sectionStyle and card_background_url related logic is removed.
  // The section will now use standard bg-background.

  return (
    <section 
      id={`features-${storeId}`} 
      className="py-16 bg-background text-foreground" // Use standard theme background and foreground
    >
      {/* Overlay logic removed */}
      
      <div className="container mx-auto px-4"> {/* Removed relative z-10 as overlay is gone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-12"
        >
          {/* Text colors now use standard theme classes */}
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Why Shop With Us?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-2">
            We are committed to providing you with the best shopping experience.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1, ease: "easeOut" }}
              // Card background now uses standard bg-card
              className="bg-card text-foreground p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                // Icon background color adjusted for theme, using a subtle opacity from primaryColor
                style={{ backgroundColor: `${theme.primaryColor}20` }} // Example: 20% opacity (hex alpha)
              >
                <feature.icon className="w-8 h-8" style={{ color: theme.primaryColor }} />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoreFeatures;
