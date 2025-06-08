import React, { useState, useEffect, useRef, Suspense } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// Fallback for motion components
const motion = {
  div: ({ children, ...props }) => <div {...props}>{children}</div>,
  button: ({ children, ...props }) => <button {...props}>{children}</button>,
  img: (props) => <img {...props} />,
  // Add other motion elements as needed
};
const AnimatePresence = ({ children }) => <>{children}</>;

import {
  Heart,
  ShoppingCart,
  Star,
  Eye,
  Zap,
  Crown,
  Sparkles,
  TrendingUp,
  Gift,
  ArrowRight,
  Plus,
  Minus,
  Maximize2,
  Share2,
  Edit, // Added Edit
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductEditModal from "@/components/store/ProductEditModal"; // Import Edit Modal
import { useStore } from "@/contexts/StoreContext";
import { Badge } from "@/components/ui/badge";
// import { Canvas, useFrame } from "@react-three/fiber"; // R3F Removed
// import { Float, MeshDistortMaterial, Environment } from "@react-three/drei"; // R3F Removed
// import { EffectComposer, Bloom } from "@react-three/postprocessing"; // R3F Removed

// Three.js floating icon component - R3F REMOVED
// const FloatingIcon = ({ icon: IconComponent, color, position }) => {
//   const meshRef = useRef();
//   useFrame((state) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.3;
//       meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
//     }
//   });
//   return (
//     <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
//       <mesh ref={meshRef} position={position} scale={0.3}>
//         <sphereGeometry args={[1, 16, 16]} />
//         <MeshDistortMaterial
//           color={color}
//           attach="material"
//           distort={0.2}
//           speed={1}
//           roughness={0.2}
//           metalness={0.8}
//           transparent
//           opacity={0.8}
//         />
//       </mesh>
//     </Float>
//   );
// };

// const Scene3D = ({ primaryColor, isHovered }) => { // R3F REMOVED
//   return (
//     <>
//       <ambientLight intensity={0.3} />
//       <pointLight position={[5, 5, 5]} intensity={0.5} />
//       <pointLight position={[-5, -5, -5]} intensity={0.3} color={primaryColor} />
      
//       {isHovered && (
//         <>
//           <FloatingIcon icon={Sparkles} color={primaryColor} position={[-1, 0, 0]} />
//           <FloatingIcon icon={Star} color="#FFD700" position={[1, 0, 0]} />
//           <FloatingIcon icon={Zap} color="#FF6B6B" position={[0, 1, 0]} />
//         </>
//       )}
      
//       <Environment preset="city" />
      
//       {isHovered && (
//         <EffectComposer>
//           <Bloom intensity={0.3} luminanceThreshold={0.9} />
//         </EffectComposer>
//       )}
//     </>
//   );
// };

const ProductCard = ({
  product = {
    id: "sample-1",
    name: "Modern Premium Product",
    description: "A cutting-edge item designed for the modern lifestyle with exceptional quality and innovative features",
    price: 299.99,
    image: {
      src: {
        large: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
        medium: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
      },
    },
    rating: 4.9,
    reviewCount: 247,
    isNew: true,
    isBestseller: false,
    discount: 20,
    originalPrice: 374.99,
  },
  theme = {},
  index = 0,
  storeName,
  storeId = "modern-store",
  isPublishedView = false,
  displayMode = "grid",
}) => {
  const { addToCart, updateStore: updateContextStore, currentStore } = useStore(); // Get updateStore and currentStore
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showQuickView, setShowQuickView] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const isAdmin = !isPublishedView;

  // Encode Shopify GIDs for URL safety
  const isShopifyGid = (id) => typeof id === 'string' && id.startsWith('gid://shopify/');
  
  // Initialize productData state
  const [internalProductData, setInternalProductData] = useState(() => {
    const rawId = product.id || `product-${index}`;
    return {
      id: rawId,
      name: product.name || "Modern Premium Product",
      description: product.description || "A cutting-edge item designed for the modern lifestyle with exceptional quality and innovative features",
      price: typeof product.price === "number" ? product.price : parseFloat(product.price) || 299.99,
      image: product.image || {
        src: {
          large: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
          medium: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
        },
      },
      rating: product.rating || 4.9,
      reviewCount: product.reviewCount || 247,
      isNew: product.isNew || false,
      isBestseller: product.isBestseller || false,
      discount: product.discount || 0,
      originalPrice: product.originalPrice || null,
      inventory_count: product.inventory_count === undefined ? 10 : product.inventory_count, // Default to 10 if undefined
      variants: product.variants || [],
    };
  });

  useEffect(() => {
    const rawId = product.id || `product-${index}`;
    setInternalProductData({
      id: rawId,
      name: product.name || "Modern Premium Product",
      description: product.description || "A cutting-edge item designed for the modern lifestyle with exceptional quality and innovative features",
      price: typeof product.price === "number" ? product.price : parseFloat(product.price) || 299.99,
      image: product.image || {
        src: {
          large: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
          medium: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
        },
      },
      rating: product.rating || 4.9,
      reviewCount: product.reviewCount || 247,
      isNew: product.isNew || false,
      isBestseller: product.isBestseller || false,
      discount: product.discount || 0,
      originalPrice: product.originalPrice || null,
      inventory_count: product.inventory_count === undefined ? 10 : product.inventory_count,
      variants: product.variants || [],
    });
  }, [product, index]);
  
  const productId = isShopifyGid(internalProductData.id) ? btoa(internalProductData.id) : internalProductData.id;


  const primaryColor = theme?.primaryColor || "#6366F1";

  // Calculate discounted price
  const discountedPrice = internalProductData.discount > 0
    ? internalProductData.price * (1 - internalProductData.discount / 100)
    : internalProductData.price;

  // Mouse move handler for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x: x * 10, y: y * 10 });
      }
    };

    if (isHovered) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isHovered]);

  // Generate smart badges based on product data
  const getBadges = () => {
    const badges = [];

    if (internalProductData.isNew) {
      badges.push({
        text: "New",
        icon: Sparkles,
        className: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
      });
    }

    if (internalProductData.isBestseller) {
      badges.push({
        text: "Bestseller",
        icon: Crown,
        className: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
      });
    }

    if (internalProductData.discount > 0) {
      badges.push({
        text: `-${internalProductData.discount}%`,
        icon: Zap,
        className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
      });
    }

    if (internalProductData.rating >= 4.5) {
      badges.push({
        text: "Top Rated",
        icon: Star,
        className: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white",
      });
    }

    return badges.slice(0, 2);
  };

  const badges = getBadges();

  // Enhanced animation variants
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
      rotateX: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: index * 0.1,
      },
    },
    hover: {
      y: -12,
      scale: 1.03,
      rotateX: 5,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { scale: 1.2, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 1, ease: "easeOut" },
    },
    hover: {
      scale: 1.15,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (addToCart && isPublishedView && (internalProductData.inventory_count === undefined || internalProductData.inventory_count > 0)) {
      for (let i = 0; i < quantity; i++) {
        addToCart(internalProductData, storeId);
      }
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: productData.name,
        text: productData.description,
        url: window.location.href,
      });
    }
  };

  const handleEditProductClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveProductChanges = async (updatedProductDataFromModal) => {
    if (storeId && internalProductData.id) {
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-product`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
          },
          body: JSON.stringify({ store_id: storeId, product_id: internalProductData.id, ...updatedProductDataFromModal })
        });
        setInternalProductData(prevData => ({ ...prevData, ...updatedProductDataFromModal }));

        // Update StoreContext
        if (currentStore && currentStore.id === storeId && currentStore.products) {
          const updatedProductsArray = currentStore.products.map(p =>
            p.id === internalProductData.id ? { ...p, ...updatedProductDataFromModal } : p
          );
          updateContextStore(storeId, { products: updatedProductsArray });
        } else if (currentStore && currentStore.id === storeId && !currentStore.products) {
           updateContextStore(storeId, { products: [{ ...internalProductData, ...updatedProductDataFromModal }] });
        }
        
        setIsEditModalOpen(false);
      } catch (error) {
        console.error('Failed to save product changes:', error);
      }
    }
  };

  // Grid view layout (enhanced modern design)
  return (
    <>
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        // transform: `perspective(1000px) rotateX(${mousePosition.y * 0.1}deg) rotateY(${mousePosition.x * 0.1}deg)`, // Parallax might rely on framer-motion or be too complex
      }}
    >
      {/* Three.js Background - R3F REMOVED */}
      {/*
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Canvas>
          <Suspense fallback={null}>
            <Scene3D primaryColor={primaryColor} isHovered={isHovered} />
          </Suspense>
        </Canvas>
      </div>
      */}

      <Link to={`/${storeName}/product/${productId}`} className="block relative z-10">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <motion.img
            src={internalProductData.image?.src?.medium || internalProductData.image?.src?.large || (Array.isArray(internalProductData.images) && internalProductData.images.length > 0 ? internalProductData.images[0] : `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(internalProductData.name)}`)}
            alt={internalProductData.name}
            className="w-full h-full object-cover"
            variants={imageVariants}
            initial="hidden"
            animate={imageLoaded ? "visible" : "hidden"}
            whileHover="hover"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <AnimatePresence>
              {badges.map((badge, badgeIndex) => {
                const IconComponent = badge.icon;
                return (
                  <motion.div
                    key={badge.text}
                    initial={{ opacity: 0, x: -20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.8 }}
                    transition={{ delay: badgeIndex * 0.1 + 0.5 }}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${badge.className} shadow-lg backdrop-blur-sm`}
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{badge.text}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {/* Wishlist Button */}
            <motion.button
              className="w-10 h-10 bg-white/10 dark:bg-gray-800/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20 dark:border-white/10"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlistToggle}
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-300 ${
                  isWishlisted
                    ? "text-red-500 fill-red-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              />
            </motion.button>

            {/* Share Button */}
            <motion.button
              className="w-10 h-10 bg-white/10 dark:bg-gray-800/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20 dark:border-white/10"
              whileHover={{ scale: 1.1, rotate: -10 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>

          {/* Hover Overlay with Actions */}
          <AnimatePresence>
            {isHovered && !isAdmin && ( // Hide if admin to avoid overlap with potential edit button here
              <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-20"
              >
                <div className="flex gap-3">
                  <motion.button
                    className="w-12 h-12 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleQuickView}
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </motion.button>

                  <motion.button
                    className="w-12 h-12 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                    }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddToCart}
                    disabled={internalProductData.inventory_count !== undefined && internalProductData.inventory_count <= 0}
                  >
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </motion.button>

                  <motion.button
                    className="w-12 h-12 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Maximize2 className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading shimmer */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 relative z-10">
        <Link to={`/${storeName}/product/${productId}`} className="block">
          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(internalProductData.rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({internalProductData.reviewCount})
            </span>
            <motion.div
              className="ml-auto px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${primaryColor}20`,
                color: primaryColor,
              }}
              whileHover={{ scale: 1.05 }}
            >
              {internalProductData.rating}
            </motion.div>
          </div>

          {/* Product Name */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {internalProductData.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2 line-clamp-2">
            {internalProductData.description}
          </p>
        </Link>

        {/* Price and Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${discountedPrice.toFixed(2)}
            </span>
            {internalProductData.originalPrice && internalProductData.discount > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                ${internalProductData.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {internalProductData.discount > 0 && (
            <motion.div
              className="px-2 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: "#EF4444" }}
              whileHover={{ scale: 1.05 }}
            >
              Save ${(internalProductData.originalPrice - discountedPrice).toFixed(2)}
            </motion.div>
          )}
        </div>

        {/* Quantity and Add to Cart */}
        {isPublishedView && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full border-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(Math.max(1, quantity - 1));
                }}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-6 text-center text-sm font-semibold">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full border-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(quantity + 1);
                }}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <Button
              onClick={handleAddToCart}
              className="flex-1 rounded-full py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 group border-0"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                color: "white",
              }}
              disabled={internalProductData.inventory_count !== undefined && internalProductData.inventory_count <= 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              {internalProductData.inventory_count !== undefined && internalProductData.inventory_count <= 0 ? 'Out of Stock' : 'Add to Cart'}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        )}

        {/* Edit Product Button for Admin */}
        {isAdmin && (
          <div className="mt-4">
            <Button
              onClick={handleEditProductClick}
              variant="outline"
              className="w-full rounded-full py-2 text-sm font-medium border-gray-300 dark:border-gray-700 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors duration-300"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Product
            </Button>
          </div>
        )}
      </div>

      {/* Floating particles effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: primaryColor,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, -40, -20],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    {isEditModalOpen && (
      <ProductEditModal
        product={internalProductData} // Pass the internal productData state
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveProductChanges}
        storeId={storeId}
        theme={theme}
      />
    )}
    </>
  );
};

export default ProductCard;
