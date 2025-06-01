import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../product/ProductCard"; // Adjusted path
import {
  Search,
  Grid,
  List,
  Filter,
  Target,
  Shield,
  Crosshair,
  Loader2, // For loading spinner
} from "lucide-react";
import { Button } from "../../../ui/button"; // Corrected path
import InlineTextEdit from "../../../ui/InlineTextEdit";
import { useStore } from "../../../../contexts/StoreContext";
import { generateStoreUrl } from "../../../../lib/utils.js"; // Added import

const ProductGrid = ({ store, isPublishedView = false }) => {
  // Defensive destructuring with default fallbacks
  const { 
    products = [], 
    theme = {}, 
    id: storeId, 
    content = {} 
  } = store || {}; // Add fallback for store itself if it could be null/undefined initially

  const { updateStoreTextContent, viewMode } = useStore();
  const [displayMode, setDisplayMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  // Initialize filteredProducts with an empty array if products is initially undefined or null
  const [filteredProducts, setFilteredProducts] = useState(Array.isArray(products) ? products : []);
  const [isLoading, setIsLoading] = useState(true);
  // const [selectedCategory, setSelectedCategory] = useState("all"); // Category filtering can be added later

  // Access content properties safely, defaulting if content or specific properties are missing
  const sectionTitle = content.productGridSectionTitle || "Our Products";
  const sectionSubtitle = content.productGridSectionSubtitle || "Explore our curated selection of high-quality items.";
  const badgeText = content.productGridBadgeText || "Featured Products";
  const searchPlaceholder = content.productGridSearchPlaceholder || "Search Arsenal...";
  const noProductsTitle = content.productGridNoProductsTitle || "No Gear Found";
  const noProductsSubtitle = content.productGridNoProductsSubtitle || "Your search for \"{searchTerm}\" yielded no results. Try a different term or clear search.";
  const clearSearchButtonText = content.productGridClearSearchButtonText || "Clear Search";
  const emptyStateTitle = content.productGridEmptyStateTitle || sectionTitle; 
  const emptyStateSubtitle = content.productGridEmptyStateSubtitle || "No equipment listed at this time. Stand by for inventory updates.";


  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setFilteredProducts(Array.isArray(products) ? products : []);
      setIsLoading(false);
    }, 500); // Shorter delay
    return () => clearTimeout(timer);
  }, [products]);

  useEffect(() => {
    if (!Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }
    let tempFiltered = products;
    if (searchTerm.trim() !== "") {
      tempFiltered = tempFiltered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(tempFiltered);
  }, [searchTerm, products]);

  const ProductSkeleton = () => (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-md border border-slate-700/50 animate-pulse">
      <div className="aspect-square bg-slate-700" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-700 rounded w-1/2" />
        <div className="h-5 bg-blue-700/50 rounded w-1/3 mt-2" />
      </div>
    </div>
  );

  if (!products && !isLoading) { // Handle case where products is undefined after loading
    return (
      <section id={`products-${storeId}`} className="py-16 md:py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
           <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <InlineTextEdit
            initialText={emptyStateTitle}
            onSave={(newText) => updateStoreTextContent('productGridEmptyStateTitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="h2"
            textClassName="text-3xl font-bold mb-3 font-mono uppercase"
            inputClassName="text-3xl font-bold mb-3 font-mono uppercase bg-transparent"
            className="text-3xl font-bold mb-3 font-mono uppercase"
          />
          <InlineTextEdit
            initialText={emptyStateSubtitle}
            onSave={(newText) => updateStoreTextContent('productGridEmptyStateSubtitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="p"
            textClassName="text-slate-400 text-lg"
            inputClassName="text-slate-400 text-lg bg-transparent"
            className="text-slate-400 text-lg"
            useTextarea={true}
          />
        </div>
      </section>
    );
  }


  return (
    <section id={`products-${storeId}`} className="py-16 md:py-24 bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-800/30 rounded-md text-xs font-semibold text-blue-300 mb-4 border border-blue-700/50 font-mono uppercase tracking-widest"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Grid className="w-3.5 h-3.5" /> {/* More generic icon */}
            <InlineTextEdit
              initialText={badgeText}
              onSave={(newText) => updateStoreTextContent('productGridBadgeText', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="span"
              textClassName=""
              inputClassName="bg-transparent"
            />
          </motion.div>
          <InlineTextEdit
            initialText={sectionTitle}
            onSave={(newText) => updateStoreTextContent('productGridSectionTitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="h2"
            textClassName="text-3xl md:text-5xl font-extrabold tracking-tight font-mono uppercase mb-3"
            inputClassName="text-3xl md:text-5xl font-extrabold tracking-tight font-mono uppercase mb-3 bg-transparent"
            className="text-3xl md:text-5xl font-extrabold tracking-tight font-mono uppercase mb-3"
          >
            <span className="bg-gradient-to-r from-slate-100 via-blue-400 to-sky-400 bg-clip-text text-transparent">
              {sectionTitle}
            </span>
          </InlineTextEdit>
          <InlineTextEdit
            initialText={sectionSubtitle}
            onSave={(newText) => updateStoreTextContent('productGridSectionSubtitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="p"
            textClassName="text-slate-400 max-w-xl mx-auto text-md md:text-lg leading-relaxed"
            inputClassName="text-slate-400 max-w-xl mx-auto text-md md:text-lg leading-relaxed bg-transparent"
            className="text-slate-400 max-w-xl mx-auto text-md md:text-lg leading-relaxed"
            useTextarea={true}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-10 gap-4"
        >
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-slate-700 rounded-md focus:outline-none focus:border-blue-500/70 bg-slate-800 transition-colors text-slate-100 placeholder-slate-500 font-mono"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-800 rounded-md p-0.5 border border-slate-700">
              <Button
                variant="ghost" size="icon"
                className={`h-8 w-8 rounded-sm transition-all duration-200 ${displayMode === "grid" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-blue-400 hover:bg-slate-700/50"}`}
                onClick={() => setDisplayMode("grid")}  title="Grid View"
              ><Grid className="h-4 w-4" /></Button>
              <Button
                variant="ghost" size="icon"
                className={`h-8 w-8 rounded-sm transition-all duration-200 ${displayMode === "list" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-blue-400 hover:bg-slate-700/50"}`}
                onClick={() => setDisplayMode("list")} title="List View"
              ><List className="h-4 w-4" /></Button>
            </div>
            {/* <Button variant="outline" className="h-9 gap-1.5 rounded-md border-slate-700 hover:border-blue-500/70 text-slate-300 hover:text-blue-400 text-xs font-mono uppercase tracking-wider">
              <Filter className="h-3.5 w-3.5" /> Filters
            </Button> */}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading-grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={displayMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8" : "space-y-6"}
            >
              {Array(displayMode === "grid" ? 8 : 3).fill(0).map((_, index) => <ProductSkeleton key={`skeleton-${index}`} />)}
            </motion.div>
          ) : filteredProducts.length > 0 ? (
            <motion.div
              key="product-list"
              variants={containerVariants} initial="hidden" animate="visible"
              className={displayMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8" : "space-y-6"}
            >
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id || `product-${index}`}
                  product={product}
                  theme={theme} // Pass theme if ProductCard uses it
                  index={index}
                  storeName={generateStoreUrl(store.name)} // Pass generated URL
                  storeId={storeId}      // Keep storeId (which is store.id)
                  isPublishedView={isPublishedView}
                  displayMode={displayMode}
                />
              ))}
            </motion.div>
          ) : (
             <motion.div key="no-products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <InlineTextEdit
                initialText={noProductsTitle}
                onSave={(newText) => updateStoreTextContent('productGridNoProductsTitle', newText)}
                isAdmin={!isPublishedView && viewMode === 'edit'}
                as="h3"
                textClassName="text-xl font-semibold text-white mb-2 font-mono"
                inputClassName="text-xl font-semibold text-white mb-2 font-mono bg-transparent"
                className="text-xl font-semibold text-white mb-2 font-mono"
              />
              <InlineTextEdit
                initialText={noProductsSubtitle.replace('{searchTerm}', searchTerm)}
                onSave={(newText) => updateStoreTextContent('productGridNoProductsSubtitle', newText)}
                isAdmin={!isPublishedView && viewMode === 'edit'}
                as="p"
                textClassName="text-slate-400 font-mono text-sm"
                inputClassName="text-slate-400 font-mono text-sm bg-transparent"
                className="text-slate-400 font-mono text-sm"
                useTextarea={true}
              />
               <Button
                variant="link"
                onClick={() => setSearchTerm("")}
                className="text-blue-400 hover:text-blue-300 font-mono mt-3 text-sm"
              >
                <InlineTextEdit
                  initialText={clearSearchButtonText}
                  onSave={(newText) => updateStoreTextContent('productGridClearSearchButtonText', newText)}
                  isAdmin={!isPublishedView && viewMode === 'edit'}
                  as="span"
                  textClassName=""
                  inputClassName="bg-transparent"
                />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07, // Faster stagger for product cards
    },
  },
};

export default ProductGrid;
