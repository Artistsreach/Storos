import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Layers } from 'lucide-react'; // Added Layers for placeholder
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button'; // Added Button for placeholder

const CollectionCard = ({ collection }) => {
  const placeholderImage = `https://images.unsplash.com/photo-1588099768531-a72d4a198538?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNsb3RoaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60`;

  const collectionTitle = collection?.name || "Unnamed Collection";
  const collectionHandle = collection?.id || collectionTitle.toLowerCase().replace(/\s+/g, '-');
  const collectionDescription = collection?.description || `Explore our ${collectionTitle} collection.`;
  // Ensure this matches the field name from Supabase: image_url
  const collectionImageSrc = collection?.image_url || placeholderImage; 
  const collectionImageAlt = `Image for ${collectionTitle}`;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative block overflow-hidden rounded-md shadow-lg bg-card text-card-foreground" // Changed rounded-xl to rounded-md
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white"> {/* Adjusted padding for responsiveness */}
          <h3 
            className="text-xl md:text-2xl font-semibold group-hover:underline group-hover:decoration-primary" // Adjusted font-semibold
            style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.6)' }}
          >
            {collectionTitle}
          </h3>
          <p 
            className="mt-1 text-xs md:text-sm opacity-90 line-clamp-2" // Adjusted text size
            style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
          >
            {collectionDescription}
          </p>
          <div className="mt-3 md:mt-4 inline-flex items-center text-sm font-medium text-primary group-hover:text-yellow-400 transition-colors"> {/* Adjusted hover color */}
            Shop Now <ArrowRight className="ml-1.5 h-4 w-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const StoreCollectionsV2 = ({ store }) => { // Renamed to avoid conflict if imported elsewhere
  // If 'store' prop is not passed, useStore to get currentStore
  const { currentStore: contextStore, viewMode } = useStore(); // Added viewMode
  const currentDisplayStore = store || contextStore;
  const collections = currentDisplayStore?.collections;
  const isPublishedView = viewMode === 'published';


  return (
    <section id={`collections-${currentDisplayStore?.id || 'featured'}`} className="py-12 bg-background sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-10 md:mb-12 text-foreground">
          Featured Collections
        </h2>
        {!collections || collections.length === 0 ? (
          <div className="text-center py-10">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No collections to display yet.</p>
            <p className="text-sm text-muted-foreground">New collections will appear here once they are added to the store.</p>
            {!isPublishedView && (
              <Button variant="outline" className="mt-6" onClick={() => console.log('Manage Collections v2 clicked - implement action')}>
                Add or Manage Collections
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"> {/* Adjusted to 3 cols for potentially wider cards */}
            {collections.map((collection) => (
              <CollectionCard key={collection.id || collection.name} collection={collection} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default StoreCollectionsV2;
