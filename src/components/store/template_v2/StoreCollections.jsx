import React, { useState } from 'react'; // Added useState
// Link is no longer needed here as navigation happens from the dialog
import { motion } from 'framer-motion';
import { ArrowRight, Layers } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import InlineTextEdit from '@/components/ui/InlineTextEdit'; // Added for inline editing
import { Button } from '@/components/ui/button';
import CollectionProductsDialog from '../CollectionProductsDialog'; // Import the dialog

const CollectionCard = ({ collection, onCollectionClick, isPublishedView, updateStoreTextContent, collectionIndex }) => { // Added props
  const placeholderImage = `https://images.unsplash.com/photo-1588099768531-a72d4a198538?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNsb3RoaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60`;

  const collectionTitle = collection?.name || "Unnamed Collection";
  const collectionDescription = collection?.description || `Explore our ${collectionTitle} collection.`;
  const collectionImageSrc = collection?.image_url || collection?.imageUrl || placeholderImage;
  const collectionImageAlt = `Image for ${collectionTitle}`;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative block overflow-hidden rounded-md shadow-lg bg-card text-card-foreground cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => onCollectionClick(collection)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onCollectionClick(collection)}
    >
      <img
        src={collectionImageSrc}
        alt={collectionImageAlt}
        className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-80 lg:h-96"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
        <InlineTextEdit
          initialText={collectionTitle}
          onSave={updateStoreTextContent}
          identifier={`collections.${collectionIndex}.name`}
          isPublishedView={isPublishedView}
          as="h3"
          className="text-xl md:text-2xl font-semibold group-hover:underline group-hover:decoration-primary"
          style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.6)' }}
        />
        <InlineTextEdit
          initialText={collectionDescription}
          onSave={updateStoreTextContent}
          identifier={`collections.${collectionIndex}.description`}
          isPublishedView={isPublishedView}
          as="p"
          className="mt-1 text-xs md:text-sm opacity-90 line-clamp-2"
          style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
        />
        <div className="mt-3 md:mt-4 inline-flex items-center text-sm font-medium text-primary group-hover:text-yellow-400 transition-colors">
          View Products <ArrowRight className="ml-1.5 h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
};

const StoreCollectionsV2 = ({ store }) => {
  const { currentStore: contextStore, viewMode, updateStoreTextContent } = useStore(); // Added updateStoreTextContent
  const currentDisplayStore = store || contextStore;
  const collections = currentDisplayStore?.collections;
  const storeId = currentDisplayStore?.id;
  const isPublishedView = viewMode === 'published';
  const sectionTitle = currentDisplayStore?.content?.collectionsSectionTitle || "Featured Collections";

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  const handleCollectionClick = (collection) => {
    console.log("Clicked collection (v2):", collection);
    if (collection && storeId) {
      setSelectedCollection(collection);
      setIsDialogOpen(true);
    } else {
      console.warn("Collection data or store ID is missing for dialog (v2).", { collection, storeId });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCollection(null);
  };

  return (
    <>
      <section id={`collections-${currentDisplayStore?.id || 'featured'}`} className="py-12 bg-background sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <InlineTextEdit
            initialText={sectionTitle}
            onSave={updateStoreTextContent}
            identifier="content.collectionsSectionTitle"
            isPublishedView={isPublishedView}
            as="h2"
            className="text-3xl font-bold tracking-tight text-center mb-10 md:mb-12 text-foreground"
          />
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {collections.map((collection, index) => (
                <CollectionCard 
                  key={collection.id || collection.name} 
                  collection={collection} 
                  onCollectionClick={handleCollectionClick}
                  isPublishedView={isPublishedView}
                  updateStoreTextContent={updateStoreTextContent}
                  collectionIndex={index} // Pass index for identifier
                />
              ))}
            </div>
          )}
        </div>
      </section>
      {selectedCollection && storeId && (
        <CollectionProductsDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          collection={selectedCollection}
          storeId={storeId}
        />
      )}
    </>
  );
};

export default StoreCollectionsV2;
