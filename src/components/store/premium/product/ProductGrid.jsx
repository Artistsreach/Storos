import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard"; // Path to ProductCard within the same directory
import { Search, Grid, List, Filter } from "lucide-react";
import { Button } from "../../../ui/button"; // Adjusted path

const ProductGrid = ({ products = [], storeId, theme, isPublishedView = false }) => {
  const [displayMode, setDisplayMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isLoading, setIsLoading] = useState(true); // Keep loading for initial effect

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500); // Shorter delay for generic grid
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let currentProducts = products || [];
    if (searchTerm.trim() !== "") {
      currentProducts = currentProducts.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    setFilteredProducts(currentProducts);
  }, [searchTerm, products]);

  if (!products || products.length === 0 && !isLoading) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-600 dark:text-gray-400 premium-font-body">No products to display in this grid.</p>
      </div>
    );
  }

  const ProductSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 animate-pulse"></div>
      <div className="p-6 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-1/2" />
        <div className="h-6 bg-purple-200 dark:bg-purple-800 rounded-full animate-pulse w-1/3 mt-3" />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Optional: Add search/filter controls here if needed for generic grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={
              displayMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                : "space-y-6"
            }
          >
            {Array(products.length > 0 ? products.length : 4) // Show skeletons based on product count or default
              .fill(0)
              .map((_, index) => (
                <motion.div
                  key={`skeleton-grid-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductSkeleton />
                </motion.div>
              ))}
          </motion.div>
        ) : (
          <motion.div
            key="products-grid"
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
                key={product.id || `product-grid-${index}`}
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
      {filteredProducts.length === 0 && !isLoading && searchTerm && (
         <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400 premium-font-body">No products found matching "{searchTerm}".</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
