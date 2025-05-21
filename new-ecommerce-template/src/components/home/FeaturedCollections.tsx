import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Collection } from '@/lib/types'; // Assuming Collection type is defined
import { ArrowRight } from 'lucide-react';

interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  const placeholderImage = `https://images.unsplash.com/photo-1588099768531-a72d4a198538?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNsb3RoaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60`; // Generic placeholder

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative block overflow-hidden rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/collections/${collection.handle}`} className="block">
        <img
          src={collection.image?.src || placeholderImage}
          alt={collection.image?.alt || `Image for ${collection.title}`}
          className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-80 lg:h-96"
          loading="lazy"
        />
        {/* Strengthened overlay for better text contrast in light mode */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {/* Added a subtle text shadow for better readability on varied image backgrounds */}
          <h3 
            className="text-2xl font-bold group-hover:underline group-hover:decoration-primary"
            style={{ textShadow: '0px 1px 4px rgba(0,0,0,0.7)' }}
          >
            {collection.title}
          </h3>
          <p 
            className="mt-1 text-sm opacity-90 line-clamp-2" // Slightly increased opacity for description
            style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.6)' }}
          >
            {collection.description || `Explore our ${collection.title} collection.`}
          </p>
          {/* "Shop Now" text is already text-primary, which should adapt to themes. 
              If it needs more contrast, a shadow could be added here too, or its container given a subtle background.
              For now, focusing on title/description. */}
          <div className="mt-4 inline-flex items-center text-sm font-medium text-primary group-hover:text-yellow-300 transition-colors">
            Shop Now <ArrowRight className="ml-1.5 h-4 w-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

interface FeaturedCollectionsProps {
  collections: Collection[];
}

const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({ collections }) => {
  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    // Increased bottom padding of the section from pb-9 to pb-12 for more space below the cards
    <section id="featured-collections" className="container mx-auto px-4 pt-6 pb-12"> 
      <h2 className="text-3xl font-bold tracking-tight text-center mb-10 md:mb-12">
        Shop by Collection
      </h2>
      {/* Removed pb-9 from grid container, section's pb-9 will control overall bottom padding */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"> 
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCollections;
