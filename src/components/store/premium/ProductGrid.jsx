import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";
import { Search, Grid, List, Filter, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "../../ui/button";

const ProductGrid = ({ store, isPublishedView = false }) => {
  const { products, theme, id: storeId } = store;
  const [displayMode, setDisplayMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products || []);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

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
          <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-4xl font-bold mb-4 premium-font-display bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Our Premium Collection
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg premium-font-body">
            Our exquisite products are being curated. Check back soon for an
            extraordinary shopping experience!
          </p>
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
        <div className="h-6 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-full animate-pulse w-1/3 mt-3" />
      </div>
    </div>
  );

  return (
    <section
      id={`products-${storeId}`}
      className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950"
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full text-sm font-semibold text-purple-700 dark:text-purple-300 mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="premium-font-body">Trending Now</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight premium-font-display">
            <span className="bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 dark:from-white dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
              Featured Products
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg md:text-xl premium-font-body leading-relaxed">
            Discover our handpicked selection of premium items, each one
            carefully chosen for its exceptional quality and timeless appeal.
          </p>
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
              placeholder="Search premium products..."
              className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-900 transition-all duration-300 premium-font-body text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
                onClick={() => setDisplayMode("grid")}
              >
                <Grid className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-xl transition-all duration-300 ${
                  displayMode === "list"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
                onClick={() => setDisplayMode("list")}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>

            <Button
              variant="outline"
              className="gap-2 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 premium-font-body"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 premium-font-display">
              No products found
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 premium-font-body">
              We couldn't find any products matching your search criteria.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-full px-8 py-3 text-lg font-medium premium-font-body shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
