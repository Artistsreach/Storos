import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard.jsx";
import { Search, Grid, List, Filter } from "lucide-react";
import { Button } from "../ui/button.jsx";
import InlineTextEdit from '@/components/ui/InlineTextEdit'; // Added import
import { useStore } from '@/contexts/StoreContext'; // Added import

const ProductGrid = ({ store, isPublishedView = false }) => {
  const { products, theme, id: storeId, content } = store; // Added content
  const { updateStore } = useStore(); // Added useStore
  const isAdmin = !isPublishedView; // Added isAdmin
  const [displayMode, setDisplayMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products || []);
  const [isLoading, setIsLoading] = useState(true);

  const handleSaveText = async (field, value) => {
    if (storeId) {
      try {
        // Ensure content is not null, provide a default empty object if it is
        const currentContent = content || {};
        await updateStore(storeId, { content: { ...currentContent, [field]: value } });
      } catch (error) {
        console.error(`Failed to update product grid text for ${field}:`, error);
      }
    }
  };

  // Simulate loading state for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (!products) return;

    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  if (!products || products.length === 0) {
    return (
      <section
        id={`products-${storeId}`}
        className="py-12 container mx-auto px-4 text-center"
      >
        <h2 className="text-3xl font-bold mb-4 font-poppins">Our Products</h2>
        <p className="text-muted-foreground">
          No products available at the moment. Check back soon!
        </p>
      </section>
    );
  }

  // Skeleton loader for products
  const ProductSkeleton = () => (
    <div className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      <div className="aspect-square bg-muted animate-pulse"></div>
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
        <div className="h-6 bg-muted rounded animate-pulse w-1/3 mt-2"></div>
      </div>
    </div>
  );

  return (
    <section id={`products-${storeId}`} className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {(store.logo_url || store.theme?.logo) && (
            <img
              src={store.logo_url || store.theme?.logo}
              alt={`${store.name || 'Store'} Logo`}
              className="h-[83px] md:h-[104px] mx-auto mb-4 object-contain"
            />
          )}
          <InlineTextEdit
            initialText={content?.productGridTitle || "Featured Products"}
            onSave={(newText) => handleSaveText('productGridTitle', newText)}
            isAdmin={isAdmin}
            placeholder="Section Title"
            as="h2"
            textClassName="text-3xl md:text-5xl font-bold mb-3 tracking-tight font-poppins bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
            className="w-full" 
          />
          <InlineTextEdit
            initialText={content?.productGridSubtitle || "Explore our curated selection of high-quality items, handpicked for you."}
            onSave={(newText) => handleSaveText('productGridSubtitle', newText)}
            isAdmin={isAdmin}
            placeholder="Section Subtitle"
            as="p"
            textClassName="text-muted-foreground max-w-xl mx-auto text-md md:text-lg"
            className="w-full mt-2" 
            useTextarea={true}
          />
        </motion.div>

        {/* Search and filter controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className={displayMode === "grid" ? "bg-primary/10" : ""}
              onClick={() => setDisplayMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={displayMode === "list" ? "bg-primary/10" : ""}
              onClick={() => setDisplayMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                displayMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
                  : "space-y-4"
              }
            >
              {Array(8)
                .fill(0)
                .map((_, index) => (
                  <ProductSkeleton key={`skeleton-${index}`} />
                ))}
            </motion.div>
          ) : (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ staggerChildren: 0.05 }}
              className={
                displayMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
                  : "space-y-4"
              }
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id || `product-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={displayMode === "list" ? "w-full" : ""}
                >
                  <ProductCard
                    product={product}
                    theme={theme}
                    index={index}
                    storeId={storeId}
                    isPublishedView={isPublishedView}
                    displayMode={displayMode}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No products found matching your search.
            </p>
            <Button
              onClick={() => setSearchTerm("")}
              className="mt-4"
              style={{ backgroundColor: theme.primaryColor }}
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

// Moved handleSaveText inside the component or ensure it's correctly scoped if passed as prop.
// For this direct modification, defining it inside ProductGrid:
// const ProductGrid = ({ store, isPublishedView = false }) => {
//   ...
//   const handleSaveText = async (field, value) => {
//     if (storeId) {
//       try {
//         await updateStore(storeId, { content: { ...content, [field]: value } });
//       } catch (error) {
//         console.error(`Failed to update product grid text for ${field}:`, error);
//       }
//     }
//   };
//   ...
// };
// Correcting the previous diff by defining handleSaveText within the component scope properly.
// The previous diff had a conceptual note, this will make it functional.
// No, the diff should actually modify the component to include the function.

export default ProductGrid;
// The handleSaveText function should be part of the component, not outside.
// Let's re-insert it correctly. The previous diff was a bit messy.

// Correct structure:
// const ProductGrid = (...) => {
//   ...
//   const handleSaveText = async (field, value) => { ... };
//   ...
//   return (...);
// }
// The diff below will place it correctly.
