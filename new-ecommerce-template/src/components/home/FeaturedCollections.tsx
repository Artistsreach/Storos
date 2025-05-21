import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
// Adjust path to be relative to the main project's src directory
import { useStore } from '../../../../src/contexts/StoreContext'; 

// Define a local Collection type as the original import is problematic
interface Collection {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  // Add any other fields that might come from currentStore.collections
}

interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  const placeholderImage = `https://images.unsplash.com/photo-1588099768531-a72d4a198538?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNsb3RoaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60`;

  const collectionTitle = collection?.name || "Unnamed Collection";
  const collectionHandle = collection?.id || collectionTitle.toLowerCase().replace(/\s+/g, '-');
  const collectionDescription = collection?.description || `Explore our ${collectionTitle} collection.`;
  const collectionImageSrc = collection?.image_url || placeholderImage; 
  const collectionImageAlt = `Image for ${collectionTitle}`;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative block overflow-hidden rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/collections/${collectionHandle}`} className="block">
        <img
          src={collectionImageSrc}
          alt={collectionImageAlt}
          className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-80 lg:h-96"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 
            className="text-2xl font-bold group-hover:underline group-hover:decoration-primary"
            style={{ textShadow: '0px 1px 4px rgba(0,0,0,0.7)' }}
          >
            {collectionTitle}
          </h3>
          <p 
            className="mt-1 text-sm opacity-90 line-clamp-2"
            style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.6)' }}
          >
            {collectionDescription}
          </p>
          <div className="mt-4 inline-flex items-center text-sm font-medium text-primary group-hover:text-yellow-300 transition-colors">
            Shop Now <ArrowRight className="ml-1.5 h-4 w-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

interface FeaturedCollectionsProps {
  // Props for this component, if any, e.g., max number of collections to show
  // For now, it will use all collections from the currentStore
}

const FeaturedCollections: React.FC<FeaturedCollectionsProps> = () => {
  const { currentStore } = useStore();
  const collections = currentStore?.collections;

  if (!collections || collections.length === 0) {
    return null; 
  }

  return (
    <section id={`featured-collections-${currentStore?.id || 'default'}`} className="py-12 bg-background sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-10 md:mb-12 text-foreground">
          Featured Collections
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> 
          {collections.map((collection) => (
            <CollectionCard key={collection.id || collection.name} collection={collection} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
