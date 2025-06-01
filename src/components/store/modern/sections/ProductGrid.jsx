import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

import {
  Grid,
  List,
  Filter,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "../product/ProductCard";
import { generateStoreUrl } from "@/lib/utils.js"; // Added import
// import { Canvas, useFrame } from "@react-three/fiber"; // R3F Removed
// import { Float, MeshDistortMaterial, Environment } from "@react-three/drei"; // R3F Removed
// import { EffectComposer, Bloom } from "@react-three/postprocessing"; // R3F Removed

// Three.js background component - R3F REMOVED
// const FloatingGeometry = ({ position, color, scale = 1 }) => {
//   const meshRef = useRef();
//   useFrame((state) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
//       meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.3;
//       meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.5;
//     }
//   });
//   return (
//     <Float speed={1} rotationIntensity={0.5} floatIntensity={2}>
//       <mesh ref={meshRef} position={position} scale={scale}>
//         <octahedronGeometry args={[1, 0]} />
//         <MeshDistortMaterial
//           color={color}
//           attach="material"
//           distort={0.3}
//           speed={1.5}
//           roughness={0.1}
//           metalness={0.9}
//           transparent
//           opacity={0.6}
//         />
//       </mesh>
//     </Float>
//   );
// };

// const Scene3D = ({ primaryColor }) => { // R3F REMOVED
//   return (
//     <>
//       <ambientLight intensity={0.2} />
//       <pointLight position={[10, 10, 10]} intensity={0.3} />
//       <pointLight position={[-10, -10, -10]} intensity={0.2} color={primaryColor} />
      
//       <FloatingGeometry position={[-8, 2, -5]} color={primaryColor} scale={0.8} />
//       <FloatingGeometry position={[8, -1, -3]} color="#ffffff" scale={0.6} />
//       <FloatingGeometry position={[0, 4, -4]} color={primaryColor} scale={0.4} />
//       <FloatingGeometry position={[-5, -3, -6]} color="#FFD700" scale={0.5} />
//       <FloatingGeometry position={[6, 3, -2]} color="#FF6B6B" scale={0.7} />
      
//       <Environment preset="city" />
      
//       <EffectComposer>
//         <Bloom intensity={0.2} luminanceThreshold={0.9} />
//       </EffectComposer>
//     </>
//   );
// };

const ProductGrid = ({
  products = [],
  store,
  isPublishedView = false,
  title = "Featured Products",
  subtitle = "Discover our curated collection of premium products",
}) => {
  const [displayMode, setDisplayMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [filterBy, setFilterBy] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const gridRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"]
  });

  // Parallax effects
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  const primaryColor = store?.theme?.primaryColor || "#6366F1";
  const rawStoreName = store?.name || "Modern Store"; // Keep original for display if needed elsewhere
  const storeId = store?.id || "modern-store";
  const urlFriendlyStoreName = generateStoreUrl(rawStoreName); // Generate URL-friendly name

  // Sample products if none provided
  const sampleProducts = [
    {
      id: "modern-1",
      name: "Premium Wireless Headphones",
      description: "High-quality audio with noise cancellation and premium comfort for the modern lifestyle",
      price: 299.99,
      originalPrice: 399.99,
      discount: 25,
      image: {
        src: {
          large: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
          medium: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
        },
      },
      rating: 4.8,
      reviewCount: 324,
      isNew: true,
      isBestseller: false,
      category: "electronics",
    },
    {
      id: "modern-2",
      name: "Smart Fitness Watch",
      description: "Advanced fitness tracking with heart rate monitoring and GPS capabilities",
      price: 249.99,
      image: {
        src: {
          large: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
          medium: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
        },
      },
      rating: 4.9,
      reviewCount: 567,
      isNew: false,
      isBestseller: true,
      category: "wearables",
    },
    {
      id: "modern-3",
      name: "Minimalist Desk Lamp",
      description: "Sleek design with adjustable brightness and wireless charging base",
      price: 89.99,
      originalPrice: 119.99,
      discount: 15,
      image: {
        src: {
          large: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
          medium: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        },
      },
      rating: 4.7,
      reviewCount: 189,
      isNew: false,
      isBestseller: false,
      category: "home",
    },
    {
      id: "modern-4",
      name: "Premium Coffee Maker",
      description: "Professional-grade brewing system with temperature control and timer",
      price: 199.99,
      image: {
        src: {
          large: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
          medium: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
        },
      },
      rating: 4.6,
      reviewCount: 234,
      isNew: true,
      isBestseller: false,
      category: "kitchen",
    },
    {
      id: "modern-5",
      name: "Ergonomic Office Chair",
      description: "Premium comfort with lumbar support and adjustable height for productivity",
      price: 399.99,
      originalPrice: 499.99,
      discount: 20,
      image: {
        src: {
          large: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
          medium: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
        },
      },
      rating: 4.8,
      reviewCount: 445,
      isNew: false,
      isBestseller: true,
      category: "furniture",
    },
    {
      id: "modern-6",
      name: "Wireless Charging Pad",
      description: "Fast wireless charging with LED indicators and non-slip surface",
      price: 39.99,
      image: {
        src: {
          large: "https://images.unsplash.com/photo-1609592806596-b43dafe50b4d?w=800&q=80",
          medium: "https://images.unsplash.com/photo-1609592806596-b43dafe50b4d?w=400&q=80",
        },
      },
      rating: 4.5,
      reviewCount: 156,
      isNew: true,
      isBestseller: false,
      category: "electronics",
    },
  ];

  const displayProducts = products.length > 0 ? products : sampleProducts;

  // Filter and sort products
  const filteredProducts = displayProducts
    .filter((product) => {
      if (filterBy === "all") return true;
      if (filterBy === "new") return product.isNew;
      if (filterBy === "bestseller") return product.isBestseller;
      if (filterBy === "sale") return product.discount > 0;
      return product.category === filterBy;
    })
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return b.isNew - a.isNew;
        default:
          return 0;
      }
    });

  // Load more products
  const loadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleProducts(prev => Math.min(prev + 8, filteredProducts.length));
      setIsLoading(false);
    }, 500);
  };

  // Filter options
  const filterOptions = [
    { value: "all", label: "All Products", icon: Grid },
    { value: "new", label: "New Arrivals", icon: Sparkles },
    { value: "bestseller", label: "Bestsellers", icon: Star },
    { value: "sale", label: "On Sale", icon: Zap },
    { value: "electronics", label: "Electronics", icon: TrendingUp },
  ];

  // Sort options
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
  ];

  // Animation variants
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section
      ref={gridRef}
      className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 overflow-hidden"
      id={`products-${storeId}`}
    >
      {/* Three.js Background - R3F REMOVED */}
      {/*
      <div className="absolute inset-0 opacity-20">
        <Canvas>
          <Suspense fallback={null}>
            <Scene3D primaryColor={primaryColor} />
          </Suspense>
        </Canvas>
      </div>
      */}

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-primary/5 blur-3xl rounded-full"
          style={{ backgroundColor: `${primaryColor}10`, y }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/5 blur-3xl rounded-full"
          style={{ y: y }}
        />
      </div>

      <motion.div
        className="container mx-auto px-6 relative z-10"
        style={{ opacity, scale }}
      >
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full text-sm font-medium mb-6"
            style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Premium Collection</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            <motion.span
              className="bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary dark:to-white bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, currentColor, ${primaryColor}, currentColor)`,
              }}
            >
              {title}
            </motion.span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row gap-6 mb-12 p-6 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-3xl border border-white/20 dark:border-white/10"
        >
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {filterOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <motion.button
                  key={option.value}
                  onClick={() => setFilterBy(option.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-medium transition-all duration-300 ${
                    filterBy === option.value
                      ? "text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70"
                  }`}
                  style={{
                    backgroundColor: filterBy === option.value ? primaryColor : undefined,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{option.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Sort and View Mode */}
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 p-1 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
              <Button
                variant={displayMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDisplayMode("grid")}
                className="rounded-xl"
                style={{
                  backgroundColor: displayMode === "grid" ? primaryColor : "transparent",
                  color: displayMode === "grid" ? "white" : undefined,
                }}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={displayMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDisplayMode("list")}
                className="rounded-xl"
                style={{
                  backgroundColor: displayMode === "list" ? primaryColor : "transparent",
                  color: displayMode === "list" ? "white" : undefined,
                }}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className={`grid gap-8 mb-12 ${
            displayMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          <AnimatePresence>
            {filteredProducts.slice(0, visibleProducts).map((product, index) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  layout: { duration: 0.3 },
                }}
              >
                <ProductCard
                  product={product}
                  theme={{ primaryColor }}
                  index={index}
                  storeName={urlFriendlyStoreName}
                  storeId={storeId}
                  isPublishedView={isPublishedView}
                  displayMode={displayMode}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Load More */}
        {visibleProducts < filteredProducts.length && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Button
              onClick={loadMore}
              disabled={isLoading}
              size="lg"
              className="px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                color: "white",
              }}
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  <span>Load More Products</span>
                  <TrendingUp className="w-5 h-5 ml-2 group-hover:translate-y-[-2px] transition-transform duration-300" />
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Results Info */}
        <motion.div
          className="text-center mt-8 text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p>
            Showing {Math.min(visibleProducts, filteredProducts.length)} of{" "}
            {filteredProducts.length} products
            {searchQuery && (
              <span> for "{searchQuery}"</span>
            )}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ProductGrid;
