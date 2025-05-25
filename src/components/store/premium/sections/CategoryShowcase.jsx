import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import CollectionProductsDialog from '@/components/store/CollectionProductsDialog'; // Assuming this is the correct path
import InlineTextEdit from '../../../ui/InlineTextEdit';
import { useStore } from '../../../../contexts/StoreContext';

const CategoryShowcase = ({ store, isPublishedView = false }) => {
  const { updateStoreTextContent, viewMode } = useStore();
  const collections = store?.collections || [];
  const displayedCollections = collections.slice(0, 4); // Display up to 4 collections

  // Content definitions
  const sectionTitle = store?.content?.categoryShowcaseTitle || "Shop by Collection";
  const getCollectionTitle = (collection, index) => store?.content?.[`categoryShowcaseCollection_${index}_Title`] || collection.title;
  const viewProductsButtonText = store?.content?.categoryShowcaseViewProductsButtonText || "View Products";


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
                      alt={getCollectionTitle(collection, index)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Collection Image</span>
                  )}
                </div>
                <InlineTextEdit
                  initialText={getCollectionTitle(collection, index)}
                  onSave={(newText) => updateStoreTextContent(`categoryShowcaseCollection_${index}_Title`, newText)}
                  isAdmin={!isPublishedView && viewMode === 'edit'}
                  as="h3"
                  textClassName="text-xl font-semibold text-gray-700 dark:text-white text-center premium-font-body mb-4"
                  inputClassName="text-xl font-semibold text-gray-700 dark:text-white text-center premium-font-body mb-4 bg-transparent"
                  className="text-xl font-semibold text-gray-700 dark:text-white text-center premium-font-body mb-4"
                />
                <Button
                  onClick={() => handleViewProducts(collection)}
                  className="mt-auto w-full bg-purple-600 hover:bg-purple-700 text-white premium-font-body"
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
