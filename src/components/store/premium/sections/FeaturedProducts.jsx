import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../product/ProductCard"; // Adjusted path
import { Search, Grid, List, Filter, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "../../../ui/button"; // Adjusted path
import InlineTextEdit from "../../../ui/InlineTextEdit";
import { useStore } from "../../../../contexts/StoreContext";
import { generateStoreUrl } from "../../../../lib/utils.js"; // Added import

const FeaturedProducts = ({ store, isPublishedView = false }) => {
  const { products, theme: storeTheme, id: storeId, content } = store; // Use storeTheme to avoid conflict
  const { updateStoreTextContent, viewMode, store: contextStore } = useStore(); // Get store from context for theme
  const [displayMode, setDisplayMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");

  const theme = contextStore?.theme || storeTheme; // Prioritize contextStore theme
  const primaryColor = theme?.primaryColor || "#6366F1";

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
  const [filteredProducts, setFilteredProducts] = useState(products || []);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Content definitions
  const trendingNowText = content?.featuredProductsTrendingText || "Trending Now";
  const sectionTitle = content?.featuredProductsTitle || "Featured Products";
  const sectionSubtitle = content?.featuredProductsSubtitle || "Discover our handpicked selection of premium items, each one carefully chosen for its exceptional quality and timeless appeal.";
  const searchPlaceholder = content?.featuredProductsSearchPlaceholder || "Search premium products...";
  const filterButtonText = content?.featuredProductsFilterButtonText || "Filter";
  const noProductsTitle = content?.featuredProductsNoProductsTitle || "No products found";
  const noProductsSubtitle = content?.featuredProductsNoProductsSubtitle || "We couldn't find any products matching your search criteria.";
  const clearFiltersButtonText = content?.featuredProductsClearFiltersButtonText || "Clear Filters";
  const emptyStateTitle = content?.featuredProductsEmptyStateTitle || "Our Premium Collection";
  const emptyStateSubtitle = content?.featuredProductsEmptyStateSubtitle || "Our exquisite products are being curated. Check back soon for an extraordinary shopping experience!";


  // Simulate loading state for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Filter products based on search term and category
  useEffect(() => {
    if (!products) return;

    let filtered = products;

    // Filter by search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by category (if implemented)
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  if (!products || products.length === 0) {
    return (
      <section
        id={`products-${storeId}`}
        className="py-20 container mx-auto px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: `linear-gradient(to right, ${primaryColor}33, ${secondaryColor}33)` }}
          >
            <Sparkles className="w-12 h-12" style={{ color: primaryColor }} />
          </div>
          <InlineTextEdit
            initialText={emptyStateTitle}
            onSave={(newText) => updateStoreTextContent('featuredProductsEmptyStateTitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="h2"
            textClassName="text-4xl font-bold mb-4 premium-font-display bg-clip-text text-transparent"
            inputClassName="text-4xl font-bold mb-4 premium-font-display bg-clip-text text-transparent bg-transparent"
            className="text-4xl font-bold mb-4 premium-font-display bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
          />
          <InlineTextEdit
            initialText={emptyStateSubtitle}
            onSave={(newText) => updateStoreTextContent('featuredProductsEmptyStateSubtitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="div"
            textClassName="text-gray-600 dark:text-gray-400 text-lg premium-font-body"
            inputClassName="text-gray-600 dark:text-gray-400 text-lg premium-font-body bg-transparent"
            className="text-gray-600 dark:text-gray-400 text-lg premium-font-body"
            useTextarea={true}
          />
        </motion.div>
      </section>
    );
  }

  // Enhanced skeleton loader for products
  const ProductSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
      <div className="p-6 space-y-3">
        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full animate-pulse w-3/4" />
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full animate-pulse w-1/2" />
        <div
          className="h-6 rounded-full animate-pulse w-1/3 mt-3"
          style={{ background: `linear-gradient(to right, ${primaryColor}4D, ${secondaryColor}4D)` }}
        />
      </div>
    </div>
  );

  return (
    <section
      id={`products-${storeId}`}
      className="pb-20 pt-[35px] bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950"
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{
              background: `linear-gradient(to right, ${primaryColor}1A, ${secondaryColor}1A)`,
              color: primaryColor,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TrendingUp className="w-4 h-4" />
            <InlineTextEdit
              initialText={trendingNowText}
              onSave={(newText) => updateStoreTextContent('featuredProductsTrendingText', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="span"
              textClassName="premium-font-body"
              inputClassName="premium-font-body bg-transparent"
            />
          </motion.div>

          <InlineTextEdit
            initialText={sectionTitle}
            onSave={(newText) => updateStoreTextContent('featuredProductsTitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="h2"
            textClassName="text-4xl md:text-6xl font-black mb-6 tracking-tight premium-font-display"
            inputClassName="text-4xl md:text-6xl font-black mb-6 tracking-tight premium-font-display bg-transparent"
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight premium-font-display"
          >
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
            >
              {sectionTitle}
            </span>
          </InlineTextEdit>
            <InlineTextEdit
              initialText={sectionSubtitle}
              onSave={(newText) => updateStoreTextContent('featuredProductsSubtitle', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="div"
              textClassName="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg md:text-xl premium-font-body leading-relaxed"
              inputClassName="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg md:text-xl premium-font-body leading-relaxed bg-transparent"
              className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg md:text-xl premium-font-body leading-relaxed"
              useTextarea={true}
            />
        </motion.div>

        {/* Enhanced search and filter controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6"
        >
          <div className="relative w-full lg:w-1/2 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none bg-white dark:bg-gray-900 transition-all duration-300 premium-font-body text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              style={{ '--focus-border-color': primaryColor, '--dark-focus-border-color': secondaryColor }}
              onFocus={(e) => e.target.style.borderColor = document.documentElement.classList.contains('dark') ? secondaryColor : primaryColor}
              onBlur={(e) => e.target.style.borderColor = ''}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-2xl p-1 border border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-xl transition-all duration-300 ${
                  displayMode === "grid"
                    ? "text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400"
                }`}
                style={displayMode === "grid" ? { background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` } : {':hover': {color: primaryColor}}}
                onClick={() => setDisplayMode("grid")}
              >
                <Grid className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-xl transition-all duration-300 ${
                  displayMode === "list"
                    ? "text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400"
                }`}
                style={displayMode === "list" ? { background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` } : {':hover': {color: primaryColor}}}
                onClick={() => setDisplayMode("list")}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>

            <Button
              variant="outline"
              className="gap-2 rounded-2xl border-2 border-gray-200 dark:border-gray-700 transition-all duration-300 premium-font-body"
              style={{ '--hover-border-color': primaryColor, '--dark-hover-border-color': secondaryColor }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? secondaryColor : primaryColor }
              onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
            >
              <Filter className="h-4 w-4" />
              <InlineTextEdit
                initialText={filterButtonText}
                onSave={(newText) => updateStoreTextContent('featuredProductsFilterButtonText', newText)}
                isAdmin={!isPublishedView && viewMode === 'edit'}
                as="span"
                textClassName=""
                inputClassName="bg-transparent"
              />
            </Button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                displayMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  : "space-y-6"
              }
            >
              {Array(8)
                .fill(0)
                .map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductSkeleton />
                  </motion.div>
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
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  : "space-y-6"
              }
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id || `product-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                  }}
                  className={displayMode === "list" ? "w-full" : ""}
                >
                  <ProductCard
                    product={product}
                    theme={theme}
                    index={index}
                    storeName={generateStoreUrl(store.name)} // Pass generated URL
                    storeId={storeId}      // Keep storeId (which is store.id)
                    isPublishedView={isPublishedView}
                    displayMode={displayMode}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredProducts.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <InlineTextEdit
              initialText={noProductsTitle}
              onSave={(newText) => updateStoreTextContent('featuredProductsNoProductsTitle', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="h3"
              textClassName="text-2xl font-bold text-gray-900 dark:text-white mb-4 premium-font-display"
              inputClassName="text-2xl font-bold text-gray-900 dark:text-white mb-4 premium-font-display bg-transparent"
              className="text-2xl font-bold text-gray-900 dark:text-white mb-4 premium-font-display"
            />
            <InlineTextEdit
              initialText={noProductsSubtitle}
              onSave={(newText) => updateStoreTextContent('featuredProductsNoProductsSubtitle', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="div" // Changed from "p" to "div" to fix DOM nesting warning
              textClassName="text-lg text-gray-600 dark:text-gray-400 mb-8 premium-font-body"
              inputClassName="text-lg text-gray-600 dark:text-gray-400 mb-8 premium-font-body bg-transparent"
              className="text-lg text-gray-600 dark:text-gray-400 mb-8 premium-font-body"
              useTextarea={true}
            />
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="text-white border-0 rounded-full px-8 py-3 text-lg font-medium premium-font-body shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                onMouseEnter={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${getDarkerShade(primaryColor, -10)}, ${getDarkerShade(secondaryColor, -10)})`}
                onMouseLeave={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`}
              >
                <InlineTextEdit
                  initialText={clearFiltersButtonText}
                onSave={(newText) => updateStoreTextContent('featuredProductsClearFiltersButtonText', newText)}
                isAdmin={!isPublishedView && viewMode === 'edit'}
                as="span"
                textClassName=""
                inputClassName="bg-transparent"
              />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts; // Renamed component
