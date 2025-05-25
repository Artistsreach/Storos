import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Eye, Star, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/contexts/StoreContext";
import { Link } from "react-router-dom";

const ProductCard = ({
  product,
  theme,
  index,
  storeId,
  isPublishedView = false,
  displayMode = "grid",
}) => {
  const { addToCart } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Encode Shopify GIDs for URL safety
  const isShopifyGid = (id) => typeof id === 'string' && id.startsWith('gid://shopify/');
  const rawProductId = product.id; // Assuming product.id is always present
  const productId = isShopifyGid(rawProductId) ? btoa(rawProductId) : rawProductId;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, storeId);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };
  
  const primaryColor = theme?.primaryColor || "#3B82F6"; // Default fresh blue

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.07, type: "spring", stiffness: 100, damping: 15 } },
  };

  const imageHoverVariants = {
    hover: { scale: 1.05, transition: { duration: 0.35, ease: "circOut" } },
    initial: { scale: 1 },
  };
  
  const quickActionsVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  };

  if (displayMode === "list") {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl border border-slate-200/70 dark:border-slate-700/70 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/10 flex"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/store/${storeId}/product/${productId}`} className="w-1/3 sm:w-40 md:w-48 block relative overflow-hidden rounded-l-2xl bg-slate-100 dark:bg-slate-700">
          {product.image?.src?.medium ? (
            <motion.img
              src={product.image.src.medium}
              alt={product.name}
              className="w-full h-full object-cover"
              variants={imageHoverVariants}
              initial="initial"
              whileHover="hover"
              onLoad={() => setImageLoaded(true)}
              animate={imageLoaded ? "visible" : "hidden"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 text-3xl font-semibold">
              {product.name?.charAt(0) || "?"}
            </div>
          )}
        </Link>

        <div className="w-2/3 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <Link to={`/store/${storeId}/product/${productId}`}>
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors mb-1 line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-2 line-clamp-2 leading-snug">
              {product.description}
            </p>
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((star) => (
                <Star key={star} className={`w-3.5 h-3.5 ${star < (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-300 dark:fill-slate-600 text-slate-300 dark:text-slate-600'}`} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="text-lg sm:text-xl font-bold" style={{color: primaryColor}}>
              ${product.price?.toFixed(2) || "0.00"}
            </div>
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white border-0 rounded-lg px-3 py-1.5 text-xs sm:text-sm"
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid display mode
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="group relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-200/70 dark:border-slate-700/70 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -6 }}
    >
      <Link to={`/store/${storeId}/product/${productId}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-700">
          {product.image?.src?.medium ? (
            <motion.img
              src={product.image.src.medium}
              alt={product.name}
              className="w-full h-full object-cover"
              variants={imageHoverVariants}
              initial="initial"
              whileHover="hover"
              onLoad={() => setImageLoaded(true)}
              animate={imageLoaded ? "visible" : "hidden"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 text-5xl font-semibold">
              {product.name?.charAt(0) || "?"}
            </div>
          )}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                variants={quickActionsVariants} initial="hidden" animate="visible" exit="hidden"
                className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10"
              >
                <Button variant="outline" size="icon" className="h-8 w-8 bg-white/80 dark:bg-slate-800/80 border-slate-300/70 dark:border-slate-600/70 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light hover:border-primary/50 backdrop-blur-sm rounded-lg shadow-sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleLike} className={`h-8 w-8 bg-white/80 dark:bg-slate-800/80 border-slate-300/70 dark:border-slate-600/70 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:border-red-500/50 backdrop-blur-sm rounded-lg shadow-sm ${isLiked ? "text-red-500 dark:text-red-400 border-red-500/50" : ""}`}>
                  <Heart className={`h-4 w-4 transition-colors ${isLiked ? "fill-red-500" : ""}`} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          {product.tags?.includes("New") && (
            <Badge variant="default" className="absolute top-2.5 left-2.5 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
              <Sparkles className="w-2.5 h-2.5 mr-1" /> NEW
            </Badge>
          )}
        </div>
      </Link>

      <div className="p-4 sm:p-5">
        <Link to={`/store/${storeId}/product/${productId}`}>
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors mb-1 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-300 dark:fill-slate-600 text-slate-300 dark:text-slate-600'}`} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base sm:text-lg font-bold" style={{color: primaryColor}}>
            ${product.price?.toFixed(2) || "N/A"}
          </p>
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white border-0 rounded-lg px-3 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
