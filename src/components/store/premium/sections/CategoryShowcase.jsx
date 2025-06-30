import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import CollectionProductsDialog from '../../../../components/store/CollectionProductsDialog'; // Assuming this is the correct path
import InlineTextEdit from '../../../ui/InlineTextEdit';
import { useStore } from '../../../../contexts/StoreContext';

const CategoryShowcase = ({ store: storeProp, isPublishedView = false }) => { // Renamed store to storeProp
  const { updateStoreTextContent, viewMode, store: contextStore, updateStore } = useStore(); // Get store from context for theme, Added updateStore
  const store = contextStore || storeProp; // Prioritize contextStore
  const collections = store?.collections || [];
  const displayedCollections = collections.slice(0, 4); // Display up to 4 collections

  const primaryColor = store?.theme?.primaryColor || "#6366F1"; // Default if no theme

  // Helper function to generate a slightly darker shade
  const getDarkerShade = (color, percent = 20) => {
    if (!color.startsWith("#")) return color;
    let num = parseInt(color.slice(1), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
    R = Math.max(0, R); G = Math.max(0, G); B = Math.max(0, B);
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };
  const secondaryColor = getDarkerShade(primaryColor, 20);

  // Content definitions
  const sectionTitle = store?.content?.categoryShowcaseTitle || "Shop by Collection";
  const viewProductsButtonText = store?.content?.categoryShowcaseViewProductsButtonText || "View Products";

  const handleCollectionTitleSave = async (collectionId, newTitle) => {
    if (!store?.id || (!isPublishedView && viewMode !== 'edit')) return;

    const collectionIndex = store.collections.findIndex(c => c.id === collectionId);
    if (collectionIndex === -1) {
      console.error("Collection not found for saving title:", collectionId);
      return;
    }

    const updatedCollections = JSON.parse(JSON.stringify(store.collections));
    updatedCollections[collectionIndex].title = newTitle;

    try {
      // Assuming updateStore can handle updating the top-level 'collections' array
      // This might need to be updateStore(store.id, { collections: updatedCollections });
      // or if a more specific context function exists, use that.
      // For now, assuming updateStoreTextContent can be (mis)used or a similar function exists.
      // This part needs to align with how StoreContext's updateStore or a similar function works.
      // For a robust solution, updateStore(store.id, { collections: updatedCollections }) is preferred.
      if (updateStore) { // updateStore is now directly from useStore()
        await updateStore(store.id, { collections: updatedCollections });
      } else {
        // Fallback or error if updateStore is not available
        console.warn("updateStore function from useStore() is not available. Cannot save collection title directly.");
      }
    } catch (error) {
      console.error(`Failed to update collection ${collectionId} title:`, error);
    }
  };

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewProducts = (collection) => {
    setSelectedCollection(collection);
    setIsDialogOpen(true);
  };

  if (!displayedCollections.length) {
    // Optionally, render a message or nothing if there are no collections
    return null;
  }

  return (
    <>
      <section id={`category-showcase-${store?.id || 'premium'}`} className="py-12 md:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <InlineTextEdit
            initialText={sectionTitle}
            onSave={(newText) => updateStoreTextContent('categoryShowcaseTitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="h2"
            textClassName="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-white premium-font-display"
            inputClassName="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-white premium-font-display bg-transparent"
            className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-white premium-font-display"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedCollections.map((collection, index) => (
              <div key={collection.id || collection.title} className="flex flex-col bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-full h-40 bg-gray-200 dark:bg-gray-600 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                  {collection.image?.src ? (
                    <img
                      src={collection.image.src}
                      alt={collection.title || 'Collection Image'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Collection Image</span>
                  )}
                </div>
                <InlineTextEdit
                  initialText={collection.name || ""}
                  placeholder="Collection Title"
                  onSave={(newText) => handleCollectionTitleSave(collection.id, newText)}
                  isAdmin={!isPublishedView && viewMode === 'edit'}
                  as="h3"
                  textClassName="text-xl font-semibold text-gray-700 dark:text-white text-center premium-font-body mb-4"
                  inputClassName="text-xl font-semibold text-gray-700 dark:text-white text-center premium-font-body mb-4 bg-transparent"
                  className="text-xl font-semibold text-gray-700 dark:text-white text-center premium-font-body mb-4"
                />
                <Button
                  onClick={() => handleViewProducts(collection)}
                  className="mt-auto w-full text-white premium-font-body"
                  style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                  onMouseEnter={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${getDarkerShade(primaryColor, -10)}, ${getDarkerShade(secondaryColor, -10)})`}
                  onMouseLeave={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`}
                >
                  <InlineTextEdit
                    initialText={viewProductsButtonText}
                    onSave={(newText) => updateStoreTextContent('categoryShowcaseViewProductsButtonText', newText)}
                    isAdmin={!isPublishedView && viewMode === 'edit'}
                    as="span"
                    textClassName="" // Inherits from button
                    inputClassName="bg-transparent"
                  />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      {selectedCollection && (
        <CollectionProductsDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          collection={selectedCollection}
          storeId={store?.id}
        />
      )}
    </>
  );
};

export default CategoryShowcase;
