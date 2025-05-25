import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence
import { ShoppingCart, Heart, Eye, Star, Shield, Target, Plus, Zap } from "lucide-react"; // Added Zap
import { Button } from "../../../ui/button"; // Corrected path
import { Badge } from "../../../ui/badge";   // Corrected path
import { useStore } from "../../../../contexts/StoreContext"; // Corrected path
import { Link } from "react-router-dom";

const ProductCard = ({
  product,
  theme, // theme might not be directly used if styling is self-contained or via CSS vars
  index,
  storeId,
  isPublishedView = false,
  displayMode = "grid",
}) => {
  const { addToCart } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Encode Shopify GIDs for URL safety
  const isShopifyGid = (id) => typeof id === 'string' && id.startsWith('gid://shopify/');
  const rawProductId = product.id; // Assuming product.id is always present
  const productId = isShopifyGid(rawProductId) ? btoa(rawProductId) : rawProductId;

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click if button is clicked
    addToCart(product, storeId);
  };
  
  const primaryColor = theme?.primaryColor || "#DC2626"; // Default red-600

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: index * 0.05, type: "spring", stiffness: 120, damping: 14 } },
  };

  const imageHoverVariants = {
    hover: { scale: 1.08, transition: { duration: 0.4, ease: "easeInOut" } },
    initial: { scale: 1 },
  };
  
  const quickActionsVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  };

  if (displayMode === "list") {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-slate-800/70 rounded-md overflow-hidden shadow-lg hover:shadow-red-900/40 transition-all duration-300 border border-slate-700 hover:border-red-600/70 group flex"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/store/${storeId}/product/${productId}`} className="w-1/3 block relative overflow-hidden bg-slate-700 aspect-[3/4]">
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
            <div className="w-full h-full flex items-center justify-center bg-slate-700 text-slate-500 text-3xl font-bold font-mono">
              {product.name?.charAt(0) || "X"}
            </div>
          )}
        </Link>

        <div className="w-2/3 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <Badge variant="outline" className="mb-2 border-red-600/50 text-red-400 bg-red-900/30 text-xs font-mono uppercase px-2 py-0.5">
              <Star className="w-3 h-3 mr-1.5" /> Featured
            </Badge>
            <Link to={`/store/${storeId}/product/${productId}`}>
              <h3 className="text-base sm:text-lg font-semibold text-slate-100 hover:text-red-400 transition-colors mb-1 font-mono uppercase tracking-wide line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 line-clamp-2 leading-snug">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="text-lg sm:text-xl font-bold text-red-400 font-mono">
              ${product.price?.toFixed(2) || "N/A"}
            </div>
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white border-0 rounded-md px-3 py-1.5 sm:px-4 text-xs sm:text-sm font-mono uppercase tracking-wider"
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
      className="bg-slate-800/70 rounded-lg overflow-hidden shadow-lg hover:shadow-red-900/40 transition-all duration-300 border border-slate-700 hover:border-red-600/70 group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
    >
      <Link to={`/store/${storeId}/product/${productId}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-slate-700">
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
            <div className="w-full h-full flex items-center justify-center bg-slate-700 text-slate-500 text-5xl font-bold font-mono">
              {product.name?.charAt(0) || "X"}
            </div>
          )}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                variants={quickActionsVariants} initial="hidden" animate="visible" exit="hidden"
                className="absolute top-2 right-2 flex flex-col gap-1.5 z-10"
              >
                <Button variant="outline" size="icon" className="h-7 w-7 bg-slate-800/70 border-slate-600 text-slate-300 hover:text-red-400 hover:border-red-500/70 backdrop-blur-sm rounded-md">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7 bg-slate-800/70 border-slate-600 text-slate-300 hover:text-red-400 hover:border-red-500/70 backdrop-blur-sm rounded-md">
                  <Heart className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="border-red-600/50 text-red-400 bg-red-900/30 text-[10px] font-mono uppercase px-1.5 py-0.5">
              <Zap className="w-2.5 h-2.5 mr-1" /> {/* Using Zap for "New" or "Hot" */}
              New
            </Badge>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/store/${storeId}/product/${productId}`}>
          <h3 className="text-md font-semibold text-slate-100 hover:text-red-400 transition-colors mb-1 font-mono uppercase tracking-wide line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-600 text-slate-600'}`} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-red-400 font-mono">
            ${product.price?.toFixed(2) || "N/A"}
          </p>
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white border-0 rounded-md px-3 py-1.5 text-xs font-mono uppercase tracking-wider"
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
