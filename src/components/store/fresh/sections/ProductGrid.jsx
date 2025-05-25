import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../product/ProductCard"; // Adjusted path
import { Search, Grid, List, Filter, Sparkles, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InlineTextEdit from "@/components/ui/InlineTextEdit";
import { useStore } from "@/contexts/StoreContext";

const ProductGrid = ({ store, isPublishedView = false }) => {
  const { products, theme, id: storeId, content } = store;
  const { updateStoreTextContent, viewMode } = useStore();
  const [displayMode, setDisplayMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products || []);
  const [isLoading, setIsLoading] = useState(true);

  const sectionTitle = content?.productGridSectionTitle || "Our Latest Collection";
  const sectionSubtitle = content?.productGridSectionSubtitle || "Discover fresh arrivals and top picks, curated just for you.";
  const badgeText = content?.productGridBadgeText || "Handpicked For You";
  const searchPlaceholder = content?.productGridSearchPlaceholder || "Search products...";
  const noProductsTitle = content?.productGridNoProductsTitle || "No Products Found";
  const noProductsSubtitle = content?.productGridNoProductsSubtitle || "Your search for \"{searchTerm}\" did not match any products.";
  const clearSearchButtonText = content?.productGridClearSearchButtonText || "Clear Search";
  const emptyStateTitle = content?.productGridEmptyStateTitle || sectionTitle;
  const emptyStateSubtitle = content?.productGridEmptyStateSubtitle || "Our product lineup is currently being updated. Please check back soon!";


  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setFilteredProducts(products || []);
      setIsLoading(false);
    }, 300); // Quicker loading simulation
    return () => clearTimeout(timer);
  }, [products]);

  useEffect(() => {
    if (!products) {
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
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60 animate-pulse">
      <div className="aspect-square bg-slate-200 dark:bg-slate-700" />
      <div className="p-5 space-y-2.5">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-4/5" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/5" />
        <div className="h-5 bg-primary/20 rounded-lg w-1/3 mt-3" />
      </div>
    </div>
  );
  
  const primaryColor = theme?.primaryColor || "#3B82F6";

  if (!products && !isLoading) {
    return (
      <section id={`products-${storeId}`} className="py-16 md:py-24 bg-slate-50 dark:bg-slate-800/90">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4" style={{color: primaryColor}} />
          <InlineTextEdit
            initialText={emptyStateTitle}
            onSave={(newText) => updateStoreTextContent('productGridEmptyStateTitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="h2"
            textClassName="text-3xl font-bold mb-3 text-slate-800 dark:text-white"
            inputClassName="text-3xl font-bold mb-3 text-slate-800 dark:text-white bg-transparent"
            className="text-3xl font-bold mb-3 text-slate-800 dark:text-white"
          />
          <InlineTextEdit
            initialText={emptyStateSubtitle}
            onSave={(newText) => updateStoreTextContent('productGridEmptyStateSubtitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="p"
            textClassName="text-slate-600 dark:text-slate-400 text-lg"
            inputClassName="text-slate-600 dark:text-slate-400 text-lg bg-transparent"
            className="text-slate-600 dark:text-slate-400 text-lg"
            useTextarea={true}
          />
        </div>
      </section>
    );
  }

  return (
    <section id={`products-${storeId}`} className="py-16 md:py-24 bg-slate-50 dark:bg-slate-800/90 relative overflow-hidden">
       <div className="absolute top-1/4 left-0 w-1/2 h-1/2 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-x-1/2 blur-3xl opacity-50 dark:opacity-30" />
       <div className="absolute bottom-1/4 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-primary/5 to-transparent rounded-full translate-x-1/2 blur-3xl opacity-50 dark:opacity-30" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
             style={{ 
              backgroundColor: `${primaryColor}1A`, 
              color: primaryColor,
              border: `1px solid ${primaryColor}40`
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Sparkles className="w-4 h-4" />
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
            textClassName="text-3xl md:text-5xl font-bold tracking-tight mb-3 text-slate-800 dark:text-white"
            inputClassName="text-3xl md:text-5xl font-bold tracking-tight mb-3 text-slate-800 dark:text-white bg-transparent"
            className="text-3xl md:text-5xl font-bold tracking-tight mb-3 text-slate-800 dark:text-white"
          />
          <InlineTextEdit
            initialText={sectionSubtitle}
            onSave={(newText) => updateStoreTextContent('productGridSectionSubtitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="p"
            textClassName="text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-md md:text-lg leading-relaxed"
            inputClassName="text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-md md:text-lg leading-relaxed bg-transparent"
            className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-md md:text-lg leading-relaxed"
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
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-300/70 dark:border-slate-700/70 rounded-xl focus:ring-primary/30 focus:border-primary/60 transition-colors text-slate-700 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-1 border border-slate-300/70 dark:border-slate-700/70">
              <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-lg transition-all duration-200 ${displayMode === "grid" ? "bg-primary text-white" : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100 dark:hover:bg-slate-700/50"}`} onClick={() => setDisplayMode("grid")} title="Grid View"><Grid className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-lg transition-all duration-200 ${displayMode === "list" ? "bg-primary text-white" : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-slate-100 dark:hover:bg-slate-700/50"}`} onClick={() => setDisplayMode("list")} title="List View"><List className="h-4 w-4" /></Button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading-grid-fresh"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={displayMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8" : "space-y-6"}
            >
              {Array(displayMode === "grid" ? 8 : 3).fill(0).map((_, index) => <ProductSkeleton key={`skeleton-fresh-${index}`} />)}
            </motion.div>
          ) : filteredProducts.length > 0 ? (
            <motion.div
              key="product-list-fresh"
              variants={containerVariants} initial="hidden" animate="visible"
              className={displayMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8" : "space-y-6"}
            >
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id || `product-fresh-${index}`}
                  product={product}
                  theme={theme}
                  index={index}
                  storeId={storeId}
                  isPublishedView={isPublishedView}
                  displayMode={displayMode}
                />
              ))}
            </motion.div>
          ) : (
             <motion.div key="no-products-fresh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Search className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
              <InlineTextEdit
                initialText={noProductsTitle}
                onSave={(newText) => updateStoreTextContent('productGridNoProductsTitle', newText)}
                isAdmin={!isPublishedView && viewMode === 'edit'}
                as="h3"
                textClassName="text-xl font-semibold text-slate-700 dark:text-white mb-2"
                inputClassName="text-xl font-semibold text-slate-700 dark:text-white mb-2 bg-transparent"
                className="text-xl font-semibold text-slate-700 dark:text-white mb-2"
              />
              <InlineTextEdit
                initialText={noProductsSubtitle.replace('{searchTerm}', searchTerm)}
                onSave={(newText) => updateStoreTextContent('productGridNoProductsSubtitle', newText)}
                isAdmin={!isPublishedView && viewMode === 'edit'}
                as="p"
                textClassName="text-slate-500 dark:text-slate-400 text-sm"
                inputClassName="text-slate-500 dark:text-slate-400 text-sm bg-transparent"
                className="text-slate-500 dark:text-slate-400 text-sm"
                useTextarea={true}
              />
               <Button variant="link" onClick={() => setSearchTerm("")} className="text-primary hover:text-primary/80 mt-3 text-sm">
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
    transition: { staggerChildren: 0.06 },
  },
};

export default ProductGrid;
