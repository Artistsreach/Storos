import React from 'react';
import { Collection } from '@/lib/types';
import { motion } from 'framer-motion';

interface CollectionHeroProps {
  collection: Collection | null; // Can be null if collection data is loading or not found
}

const CollectionHero: React.FC<CollectionHeroProps> = ({ collection }) => {
  if (!collection) {
    // Optionally render a loading state or a default hero if collection is null
    return (
      <div className="py-16 text-center bg-muted dark:bg-muted/30">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Loading Collection...</h1>
      </div>
    );
  }

  const { title, description, image } = collection;
  const imageUrl = image?.src || `https://images.unsplash.com/photo-1512436991641-6745cdb1723f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGZhc2hpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1920&q=80`; // Generic placeholder
  const imageAlt = image?.alt || `Image for ${title} collection`;

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-slate-100 to-gray-200 dark:from-slate-800 dark:to-gray-900">
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-cover opacity-30 dark:opacity-20"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container mx-auto px-4 py-20 md:py-28 lg:py-32 relative z-10 text-center"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-foreground mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </motion.div>
    </section>
  );
};

export default CollectionHero;
