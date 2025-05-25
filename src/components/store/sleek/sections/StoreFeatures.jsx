import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Shield, Truck, Zap } from "lucide-react";

const features = [
  {
    icon: <Zap className="w-10 h-10 text-primary" />,
    title: "Innovative Design",
    description:
      "Experience cutting-edge aesthetics and user-friendly interfaces.",
  },
  {
    icon: <CheckCircle className="w-10 h-10 text-primary" />,
    title: "Premium Quality",
    description: "Crafted from the finest materials for lasting durability.",
  },
  {
    icon: <Truck className="w-10 h-10 text-primary" />,
    title: "Fast Shipping",
    description: "Get your orders delivered to your doorstep in no time.",
  },
  {
    icon: <Shield className="w-10 h-10 text-primary" />,
    title: "Secure Shopping",
    description: "Your data and transactions are always protected.",
  },
];

const StoreFeatures = ({ store }) => {
  const { theme, id: storeId } = store;
  const primaryColor = theme?.primaryColor || "#3B82F6";

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <section
      id={`features-${storeId}`}
      className="py-24 bg-gradient-to-br from-slate-100 via-white to-blue-100 dark:from-slate-800 dark:via-gray-800 dark:to-blue-900"
    >
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-inter tracking-tight text-foreground">
            Why Choose{" "}
            <span style={{ color: primaryColor }}>Us</span>?
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-inter">
            We are dedicated to providing an unparalleled shopping experience
            with features designed for your satisfaction.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/50 dark:bg-black/50 backdrop-blur-xl p-8 shadow-glass hover:shadow-float transition-all duration-500 border border-white/30 dark:border-white/20 hover:border-primary/40"
              variants={featureVariants}
              style={{ "--hover-border-color": primaryColor }}
            >
              <motion.div
                className="mb-6 inline-block p-4 bg-primary/10 border border-primary/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
                style={{
                  backgroundColor: `${primaryColor}1A`,
                  borderColor: `${primaryColor}33`,
                }}
              >
                {React.cloneElement(feature.icon, {
                  style: { color: primaryColor },
                })}
              </motion.div>
              <h3 className="text-2xl font-semibold mb-3 font-inter text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-inter leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StoreFeatures;
