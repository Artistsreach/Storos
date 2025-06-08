import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Tag, Layers3 } from "lucide-react"; // Using Layers3 for collections icon

const StoreCollections = ({ store }) => {
  const { collections, theme, id: storeId } = store;
  const primaryColor = theme?.primaryColor || "#3B82F6";

  if (!collections || collections.length === 0) {
    return (
      <section id={`collections-${storeId}`} className="py-16 bg-slate-50 dark:bg-slate-900 text-center">
        <p className="text-muted-foreground font-inter">No collections to display yet.</p>
      </section>
    );
  }

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 12 },
    },
  };

  return (
    <section
      id={`collections-${storeId}`}
      className="py-20 md:py-28 bg-gradient-to-b from-white via-slate-50 to-white dark:from-gray-900 dark:via-slate-800 dark:to-gray-900"
    >
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="inline-flex items-center justify-center p-3 bg-primary/10 border border-primary/20 mb-4"
            style={{ backgroundColor: `${primaryColor}1A`, borderColor: `${primaryColor}33` }}
          >
            <Layers3 className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-inter tracking-tight text-foreground">
            Explore Our Collections
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-inter">
            Discover curated collections to match your unique style and preferences.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {collections.map((collection) => (
            <motion.div
              key={collection.id}
              variants={itemVariants}
              className="group relative overflow-hidden bg-white/30 dark:bg-black/30 backdrop-blur-lg shadow-glass hover:shadow-float-lg transition-all duration-500 border border-white/20 dark:border-white/10 hover:border-primary/40"
              style={{ '--hover-border-color': primaryColor }}
            >
              <Link to={`/store/${storeId}/collection/${collection.handle || collection.id}`} className="block">
                <div className="aspect-[4/3] relative overflow-hidden">
                  {(collection.imageUrl || collection.image_url) ? (
                    <img
                      src={collection.imageUrl || collection.image_url}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700">
                      <Layers3 className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2 font-inter group-hover:text-primary transition-colors duration-300" style={{ color: primaryColor }}>
                    {collection.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 font-inter mb-3">
                    {collection.description || `Explore the ${collection.name} collection.`}
                  </p>
                  <div className="flex items-center text-xs text-primary font-medium font-inter group-hover:underline" style={{ color: primaryColor }}>
                    View Collection
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Adding ArrowRight as it's used in the component
const ArrowRight = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
  </svg>
);


export default StoreCollections;
