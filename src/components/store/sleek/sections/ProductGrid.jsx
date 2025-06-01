import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../product/ProductCard"; // Adjusted path
import {
  Search,
  Grid,
  List,
  Filter,
  Sparkles,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateStoreUrl } from "../../../../lib/utils.js"; // Added import

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
        className="py-24 container mx-auto px-6 text-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-950"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="w-32 h-32 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center mx-auto mb-8 shadow-glass">
            <Sparkles className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-5xl font-bold mb-6 font-inter tracking-tight text-foreground">
            Premium Collection
          </h2>
          <p className="text-muted-foreground text-xl font-inter leading-relaxed">
            Our curated selection is being prepared. Discover extraordinary
            products coming soon!
          </p>
        </motion.div>
      </section>
    );
  }

  // Enhanced skeleton loader for products
  const ProductSkeleton = () => (
    <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md overflow-hidden shadow-glass hover:shadow-float transition-all duration-700 border border-white/20 dark:border-white/10">
      <div className="aspect-square bg-white/5 dark:bg-black/5 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-black/10 to-transparent animate-shimmer" />
      </div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-white/10 dark:bg-black/10 animate-pulse w-3/4" />
        <div className="h-4 bg-white/10 dark:bg-black/10 animate-pulse w-1/2" />
        <div className="h-8 bg-primary/20 animate-pulse w-1/3 mt-4" />
      </div>
    </div>
  );

  return (
    <section
      id={`products-${storeId}`}
      className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-950 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-primary/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-secondary/5 blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 text-sm font-medium text-primary mb-8 shadow-glass"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ color: theme.primaryColor }}
          >
            <Zap className="w-5 h-5" />
            <span className="font-inter tracking-wide">
              Featured Collection
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight font-inter">
            <span
              className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, currentColor 0%, ${theme.primaryColor} 50%, currentColor 100%)`,
                backgroundSize: "200% auto",
              }}
            >
              Premium Products
            </span>
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-xl md:text-2xl leading-relaxed font-inter">
            Discover our carefully curated selection of premium products,
            designed for those who appreciate quality and innovation.
          </p>
        </motion.div>

        {/* Enhanced search and filter controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col lg:flex-row justify-between items-center mb-16 gap-8"
        >
          <div className="relative w-full lg:w-1/2 max-w-lg">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
            <input
              type="text"
              placeholder="Search premium products..."
              className="w-full pl-16 pr-6 py-4 border border-white/20 dark:border-white/10 focus:outline-none focus:border-primary/50 bg-white/10 dark:bg-black/10 backdrop-blur-md transition-all duration-300 text-foreground placeholder-muted-foreground font-inter text-lg"
              style={{
                borderColor: `${theme.primaryColor}30`,
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 dark:bg-black/10 backdrop-blur-md p-1 border border-white/20 dark:border-white/10">
              <Button
                variant="ghost"
                size="icon"
                className={`transition-all duration-300 ${
                  displayMode === "grid"
                    ? "bg-white/20 dark:bg-black/20 text-primary shadow-glass"
                    : "text-muted-foreground hover:text-primary"
                }`}
                onClick={() => setDisplayMode("grid")}
                style={{
                  color:
                    displayMode === "grid" ? theme.primaryColor : undefined,
                }}
              >
                <Grid className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`transition-all duration-300 ${
                  displayMode === "list"
                    ? "bg-white/20 dark:bg-black/20 text-primary shadow-glass"
                    : "text-muted-foreground hover:text-primary"
                }`}
                onClick={() => setDisplayMode("list")}
                style={{
                  color:
                    displayMode === "list" ? theme.primaryColor : undefined,
                }}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>

            <Button
              variant="outline"
              className="gap-3 border border-white/20 dark:border-white/10 hover:border-primary/50 transition-all duration-300 text-muted-foreground hover:text-primary bg-white/10 dark:bg-black/10 backdrop-blur-md font-inter tracking-wide"
              style={{
                borderColor: `${theme.primaryColor}30`,
              }}
            >
              <Filter className="h-5 w-5" />
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
                  : "space-y-8"
              }
            >
              {Array(8)
                .fill(0)
                .map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 30 }}
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
                  : "space-y-8"
              }
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id || `product-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
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
            className="text-center py-24"
          >
            <div className="w-32 h-32 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center mx-auto mb-8 shadow-glass">
              <Search className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-6 font-inter">
              No products found
            </h3>
            <p className="text-xl text-muted-foreground mb-10 font-inter">
              We couldn't find any products matching your search criteria.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-foreground border border-white/20 dark:border-white/10 backdrop-blur-md px-10 py-4 text-lg font-medium font-inter tracking-wide shadow-glass hover:shadow-float transition-all duration-300"
              style={{
                borderColor: `${theme.primaryColor}40`,
                color: theme.primaryColor,
              }}
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
