import React from "react";
// import { motion } from "framer-motion";
// Fallback for motion components
const motion = {
  div: ({ children, ...props }) => <div {...props}>{children}</div>,
  span: ({ children, ...props }) => <span {...props}>{children}</span>,
};

import { Sparkles, Star, TrendingUp, Crown, ShoppingBag } from "lucide-react"; // Added ShoppingBag
import { useStore } from "@/contexts/StoreContext";
import InlineTextEdit from "@/components/ui/InlineTextEdit";

const StoreCollections = ({ store, isPublishedView = false }) => {
  const { updateStore, updateStoreCollection } = useStore(); // Added updateStoreCollection if available, otherwise will use updateStore
  const storeId = store?.id;
  const isAdmin = !isPublishedView;

  // Store data with defaults
  const primaryColor = store?.theme?.primaryColor || "#6366F1";
  
  const defaultSectionContent = {
    title: "Explore Our Collections",
    subtitle: "Curated selections to inspire your next discovery.",
  };

  const defaultCollections = [
    {
      id: "premium",
      name: "Premium Collection",
      description: "Luxury items crafted with precision.",
      imageUrl: "https://via.placeholder.com/400x300.png?text=Premium", // Placeholder image
      // icon: Crown, // Icons can be a fallback if imageUrl is missing, or removed
      // color: "#FFD700",
    },
    {
      id: "trending",
      name: "Trending Now",
      description: "Most popular items this season.",
      imageUrl: "https://via.placeholder.com/400x300.png?text=Trending", // Placeholder image
      // icon: TrendingUp,
      // color: "#FF6B6B",
    },
    {
      id: "featured",
      name: "Featured Products",
      description: "Handpicked by our experts.",
      imageUrl: "https://via.placeholder.com/400x300.png?text=Featured", // Placeholder image
      // icon: Star,
      // color: "#4ECDC4",
    },
  ];
  
  const sectionContent = store?.content?.storeCollectionsSection || defaultSectionContent;
  // Prioritize store.collections, then store.content.storeCollections (if AI generates them there), then default.
  let collectionsSource = defaultCollections;
  if (store?.collections && store.collections.length > 0) {
    collectionsSource = store.collections;
  } else if (store?.content?.storeCollections && store.content.storeCollections.length > 0) {
    // This branch might be relevant if AI populates collections into store.content.storeCollections
    collectionsSource = store.content.storeCollections;
  }
  const collectionsToDisplay = collectionsSource;


  const handleSaveText = async (field, value) => {
    if (!storeId || !isAdmin) return;
    const newSectionContent = { ...sectionContent, [field]: value };
    try {
      await updateStore(storeId, {
        content: {
          ...store.content,
          storeCollectionsSection: newSectionContent,
        },
      });
    } catch (error) {
      console.error(`Failed to update collections section ${field}:`, error);
    }
  };

  const handleCollectionFieldSave = async (collectionId, field, newValue) => {
    if (!storeId || !isAdmin) return;

    const collectionIndex = store.collections.findIndex(c => c.id === collectionId);
    if (collectionIndex === -1) {
      console.error("Collection not found for saving:", collectionId);
      return;
    }

    // Create a deep copy of the collections array to modify it
    const updatedCollections = JSON.parse(JSON.stringify(store.collections));
    
    if (field === "name") {
      updatedCollections[collectionIndex].name = newValue;
    } else if (field === "description") {
      updatedCollections[collectionIndex].description = newValue;
    }
    // Add more fields if they become editable, e.g., imageUrl

    try {
      // Assuming updateStore can handle updating the top-level 'collections' array
      await updateStore(storeId, { collections: updatedCollections });
      // If there's a more specific context function like updateStoreCollection(collectionId, { [field]: newValue }), prefer that.
      // For example: if (typeof updateStoreCollection === 'function') {
      //   await updateStoreCollection(collectionId, { [field]: newValue });
      // } else { ... }
    } catch (error) {
      console.error(`Failed to update collection ${collectionId} field ${field}:`, error);
    }
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="py-16 md:py-24 bg-background text-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center justify-center bg-[var(--theme-primary-10)] p-3 rounded-full mb-4">
            <ShoppingBag className="h-8 w-8 text-[var(--theme-primary)]" />
          </div>
          <InlineTextEdit
            initialText={sectionContent.title}
            onSave={(newText) => handleSaveText('title', newText)}
            isAdmin={isAdmin}
            placeholder="Section Title"
            as="h2"
            textClassName="text-4xl md:text-5xl font-bold tracking-tight"
          />
          <InlineTextEdit
            initialText={sectionContent.subtitle}
            onSave={(newText) => handleSaveText('subtitle', newText)}
            isAdmin={isAdmin}
            placeholder="Section Subtitle"
            as="p"
            textClassName="text-lg text-muted-foreground max-w-xl mx-auto mt-3"
          />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {collectionsToDisplay.slice(0, 3).map((collection, index) => (
            <motion.div
              key={collection.id || index}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl shadow-lg bg-card border border-border/50 transition-all duration-300 hover:shadow-2xl"
              whileHover={{ y: -5 }}
            >
              <a href={`#collection-${collection.id}`} className="block"> {/* Basic link, can be improved */}
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={collection.image?.src || `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(collection.name || 'Collection')}`}
                    alt={collection.name || 'Collection Image'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <InlineTextEdit
                    initialText={collection.name || ""}
                    placeholder="Collection Title"
                    onSave={(newText) => handleCollectionFieldSave(collection.id, 'name', newText)}
                    isAdmin={isAdmin}
                    as="h3"
                    textClassName="text-xl font-semibold text-foreground mb-2"
                    inputClassName="text-xl font-semibold text-foreground mb-2 bg-transparent"
                  />
                  <InlineTextEdit
                    initialText={collection.description || ""}
                    placeholder="Collection description..."
                    onSave={(newText) => handleCollectionFieldSave(collection.id, 'description', newText)}
                    isAdmin={isAdmin}
                    as="p"
                    useTextarea={true}
                    textClassName="text-sm text-muted-foreground mb-3 h-12 overflow-hidden" // Fixed height for consistency
                    inputClassName="text-sm text-muted-foreground mb-3 bg-transparent min-h-[3rem]"
                  />
                  <span
                    className="text-sm font-medium group-hover:underline"
                    style={{ color: primaryColor }}
                  >
                    View Collection &rarr;
                  </span>
                </div>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StoreCollections;
