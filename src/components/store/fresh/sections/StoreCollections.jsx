import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react'; // Added ShoppingBag, Sparkles
import CollectionProductsDialog from '@/components/store/CollectionProductsDialog';
import InlineTextEdit from '@/components/ui/InlineTextEdit';
import { useStore } from '@/contexts/StoreContext';

const FreshCollectionCard = ({ collection, onCollectionClick, isAdmin, onSaveCollectionText, collectionIndex, primaryColor }) => {
  const placeholderImage = `https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=600&q=80`; // Placeholder relevant to fashion/general

  const collectionTitle = collection?.name || "Unnamed Collection";
  const collectionDescription = collection?.description || `Explore our ${collectionTitle} collection.`;
  const collectionImageSrc = collection?.image?.src || placeholderImage;
  const collectionImageAlt = `Image for ${collectionTitle}`;

  return (
    <motion.div
      className="group relative block overflow-hidden rounded-2xl shadow-lg cursor-pointer border border-neutral-200/60 dark:border-neutral-700/60 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => onCollectionClick(collection)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onCollectionClick(collection)}
      whileHover={{ scale: 1.03, y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={collectionImageSrc}
          alt={collectionImageAlt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
        <h3 className="text-xl md:text-2xl font-bold mb-1 group-hover:underline" style={{ textDecorationColor: primaryColor }}>
          <InlineTextEdit
            initialText={collectionTitle}
            onSave={(newText) => onSaveCollectionText(collectionIndex, 'name', newText)}
            isAdmin={isAdmin}
            placeholder="Collection Title"
            textClassName="text-xl md:text-2xl font-bold"
            inputClassName="bg-transparent text-white placeholder-gray-300"
          />
        </h3>
        <p className="mt-1 text-xs md:text-sm opacity-90 line-clamp-2">
          <InlineTextEdit
            initialText={collectionDescription}
            onSave={(newText) => onSaveCollectionText(collectionIndex, 'description', newText)}
            isAdmin={isAdmin}
            placeholder="Collection Description"
            useTextarea={true}
            textClassName="text-xs md:text-sm opacity-90"
            inputClassName="bg-transparent text-gray-200 placeholder-gray-400 text-xs md:text-sm"
          />
        </p>
        <div className="mt-3 inline-flex items-center text-sm font-medium transition-colors" style={{ color: primaryColor }}>
          View Collection <ArrowRight className="ml-1.5 h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
};

const FreshStoreCollections = ({ store, isPublishedView = false }) => {
  const { updateStore, viewMode } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  const collections = store?.collections;
  const storeId = store?.id;
  const isAdmin = !isPublishedView && viewMode === 'edit';
  const content = store?.content || {};
  const primaryColor = store?.theme?.primaryColor || "#3B82F6";

  const handleCollectionClick = (collection) => {
    setSelectedCollection(collection);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCollection(null);
  };

  const handleSaveText = async (field, value) => {
    if (storeId && isAdmin) {
      try {
        if (field === 'freshCollectionsSectionTitle') {
          await updateStore(storeId, { content: { ...content, freshCollectionsSectionTitle: value } });
        } else if (field === 'freshCollectionsSectionSubtitle') {
            await updateStore(storeId, { content: { ...content, freshCollectionsSectionSubtitle: value } });
        } else if (field === 'freshCollectionsBadgeText') {
            await updateStore(storeId, { content: { ...content, freshCollectionsBadgeText: value } });
        }
      } catch (error) {
        console.error(`Failed to update store ${field}:`, error);
      }
    }
  };

  const handleSaveCollectionText = async (index, field, value) => {
    if (storeId && isAdmin && collections && collections[index]) {
      const updatedCollections = collections.map((col, i) => 
        i === index ? { ...col, [field]: value } : col
      );
      try {
        await updateStore(storeId, { collections: updatedCollections });
      } catch (error) {
        console.error(`Failed to update collection ${field} at index ${index}:`, error);
      }
    }
  };
  
  const sectionTitle = content?.freshCollectionsSectionTitle || "Shop by Collection";
  const sectionSubtitle = content?.freshCollectionsSectionSubtitle || "Explore our curated collections to find your perfect match.";
  const badgeText = content?.freshCollectionsBadgeText || "Curated For You";


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <>
      <section id={`fresh-collections-${store?.id || 'featured'}`} className="py-16 md:py-24 bg-neutral-100 dark:bg-neutral-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-r from-primary/5 to-transparent -translate-x-1/2 blur-3xl opacity-30 dark:opacity-20" style={{ backgroundColor: `${primaryColor}0A`}} />
        <div className="absolute bottom-0 right-1/4 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent translate-x-1/2 blur-3xl opacity-30 dark:opacity-20" style={{ backgroundColor: `${primaryColor}0A`}} />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 md:mb-14"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border"
              style={{ 
                backgroundColor: `${primaryColor}1A`, 
                color: primaryColor,
                borderColor: `${primaryColor}40`
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Sparkles className="w-4 h-4" />
              <InlineTextEdit
                initialText={badgeText}
                onSave={(newText) => handleSaveText('freshCollectionsBadgeText', newText)}
                isAdmin={isAdmin}
                as="span"
              />
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 text-neutral-800 dark:text-white">
              <InlineTextEdit
                initialText={sectionTitle}
                onSave={(newText) => handleSaveText('freshCollectionsSectionTitle', newText)}
                isAdmin={isAdmin}
                as="span"
                textClassName="text-3xl md:text-5xl font-bold tracking-tight text-neutral-800 dark:text-white"
                inputClassName="text-3xl md:text-5xl font-bold tracking-tight text-neutral-800 dark:text-white bg-transparent"
              />
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto text-md md:text-lg leading-relaxed">
              <InlineTextEdit
                initialText={sectionSubtitle}
                onSave={(newText) => handleSaveText('freshCollectionsSectionSubtitle', newText)}
                isAdmin={isAdmin}
                as="span"
                textClassName="text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto text-md md:text-lg leading-relaxed"
                inputClassName="text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto text-md md:text-lg leading-relaxed bg-transparent"
                useTextarea={true}
              />
            </p>
          </motion.div>

          {!collections || collections.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-neutral-400 dark:text-neutral-500" />
              <p className="text-neutral-600 dark:text-neutral-400">No collections to display yet.</p>
              {!isPublishedView && (
                <Button variant="outline" className="mt-4">Manage Collections</Button>
              )}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            > 
              {collections.map((collection, index) => (
                <motion.div key={collection.id || collection.name || `fresh-coll-${index}`} variants={itemVariants}>
                  <FreshCollectionCard 
                    collection={collection} 
                    onCollectionClick={handleCollectionClick}
                    isAdmin={isAdmin}
                    onSaveCollectionText={handleSaveCollectionText}
                    collectionIndex={index}
                    primaryColor={primaryColor}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
        {selectedCollection && storeId && (
          <CollectionProductsDialog
            isOpen={isDialogOpen}
            onClose={handleCloseDialog}
            collection={selectedCollection}
            storeId={storeId}
            // Pass theme or specific styles if dialog needs to adapt too
          />
        )}
      </section>
    </>
  );
};

export default FreshStoreCollections;
