import React, { useState, useEffect } from "react"; // Added useEffect
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence
import { ShoppingCart, Heart, Eye, Star, Shield, Target, Plus, Zap, Edit } from "lucide-react"; // Added Zap, Edit
import { Button } from "../../../ui/button"; // Corrected path
import { Badge } from "../../../ui/badge";   // Corrected path
import ProductEditModal from "@/components/store/ProductEditModal"; // Import Edit Modal
import { useStore } from "../../../../contexts/StoreContext"; // Corrected path
import { Link } from "react-router-dom";

const ProductCard = ({
  product,
  theme, // theme might not be directly used if styling is self-contained or via CSS vars
  index,
  storeName, // Added storeName
  storeId,   // Kept storeId for internal logic
  isPublishedView = false,
  displayMode = "grid",
}) => {
  const { addToCart, updateStore: updateContextStore, currentStore } = useStore(); // Get updateStore and currentStore
  const [displayProduct, setDisplayProduct] = useState(product);

  useEffect(() => {
    setDisplayProduct(product);
  }, [product]);

  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const isAdmin = !isPublishedView;

  // Encode Shopify GIDs for URL safety
  const isShopifyGid = (id) => typeof id === 'string' && id.startsWith('gid://shopify/');
  const rawProductId = displayProduct.id; // Assuming product.id is always present
  const productId = isShopifyGid(rawProductId) ? btoa(rawProductId) : rawProductId;
  const inventory_count = displayProduct.inventory_count;

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click if button is clicked
    if (displayProduct.inventory_count === undefined || displayProduct.inventory_count > 0) {
      addToCart(displayProduct, storeId);
    }
  };
  
  const primaryColor = theme?.primaryColor || "#2563EB"; // Default blue-600

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

  const handleEditProductClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveProductChanges = async (updatedProductData) => {
    if (storeId && rawProductId) {
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-product`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
          },
          body: JSON.stringify({ store_id: storeId, product_id: rawProductId, ...updatedProductData })
        });
        setDisplayProduct(prevData => ({ ...prevData, ...updatedProductData }));
        
        // Update StoreContext
        if (currentStore && currentStore.id === storeId && currentStore.products) {
          const updatedProductsArray = currentStore.products.map(p =>
            p.id === rawProductId ? { ...p, ...updatedProductData } : p
          );
          updateContextStore(storeId, { products: updatedProductsArray });
        } else if (currentStore && currentStore.id === storeId && !currentStore.products) {
           updateContextStore(storeId, { products: [{ ...displayProduct, ...updatedProductData }] });
        }
        
        setIsEditModalOpen(false);
      } catch (error) {
        console.error('Failed to save product changes:', error);
      }
    }
  };

  if (displayMode === "list") {
    return (
      <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-slate-800/70 rounded-md overflow-hidden shadow-lg hover:shadow-blue-900/40 transition-all duration-300 border border-slate-700 hover:border-blue-600/70 group flex"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/${storeName}/product/${productId}`} className="w-1/3 block relative overflow-hidden bg-slate-700 aspect-[3/4]"> {/* Use storeName */}
          {(displayProduct.image?.src?.medium || displayProduct.image?.src?.large || (Array.isArray(displayProduct.images) && displayProduct.images.length > 0 && displayProduct.images[0])) ? (
            <motion.img
              src={displayProduct.image?.src?.medium || displayProduct.image?.src?.large || displayProduct.images[0]}
              alt={displayProduct.name}
              className="w-full h-full object-cover"
              variants={imageHoverVariants}
              initial="initial"
              whileHover="hover"
              onLoad={() => setImageLoaded(true)}
              animate={imageLoaded ? "visible" : "hidden"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-700 text-slate-500 text-3xl font-bold font-mono">
              {displayProduct.name?.charAt(0) || "X"}
            </div>
          )}
        </Link>

        <div className="w-2/3 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <Badge variant="outline" className="mb-2 border-blue-600/50 text-blue-400 bg-blue-900/30 text-xs font-mono uppercase px-2 py-0.5">
              <Star className="w-3 h-3 mr-1.5" /> Featured
            </Badge>
            <Link to={`/${storeName}/product/${productId}`}> {/* Use storeName */}
              <h3 className="text-base sm:text-lg font-semibold text-slate-100 hover:text-blue-400 transition-colors mb-1 font-mono uppercase tracking-wide line-clamp-2">
                {displayProduct.name}
              </h3>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm mb-1 line-clamp-2 leading-snug">
              {displayProduct.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="text-lg sm:text-xl font-bold text-blue-400 font-mono">
              ${displayProduct.price?.toFixed(2) || "N/A"}
            </div>
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0 rounded-md px-3 py-1.5 sm:px-4 text-xs sm:text-sm font-mono uppercase tracking-wider"
              disabled={inventory_count !== undefined && inventory_count <= 0}
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
              {inventory_count !== undefined && inventory_count <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            {isAdmin && (
              <Button
                onClick={handleEditProductClick}
                size="sm"
                variant="outline"
                className="border-blue-600/70 text-blue-400 hover:bg-blue-700/30 rounded-md px-3 py-1.5 sm:px-4 text-xs sm:text-sm font-mono uppercase tracking-wider ml-2"
              >
                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </motion.div>
      {isEditModalOpen && (
        <ProductEditModal
          product={displayProduct}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveProductChanges}
          storeId={storeId}
          theme={theme}
        />
      )}
      </>
    );
  }

  // Grid display mode
  return (
    <>
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-slate-800/70 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-900/40 transition-all duration-300 border border-slate-700 hover:border-blue-600/70 group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      >
        <Link to={`/${storeName}/product/${productId}`} className="block"> {/* Use storeName */}
          <div className="aspect-square relative overflow-hidden bg-slate-700">
            {(displayProduct.image?.src?.medium || displayProduct.image?.src?.large || (Array.isArray(displayProduct.images) && displayProduct.images.length > 0 && displayProduct.images[0])) ? (
              <motion.img
                src={displayProduct.image?.src?.medium || displayProduct.image?.src?.large || displayProduct.images[0]}
                alt={displayProduct.name}
                className="w-full h-full object-cover"
                variants={imageHoverVariants}
              initial="initial"
              whileHover="hover"
              onLoad={() => setImageLoaded(true)}
              animate={imageLoaded ? "visible" : "hidden"}
            />
          ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-700 text-slate-500 text-5xl font-bold font-mono">
                {displayProduct.name?.charAt(0) || "X"}
              </div>
            )}
            <AnimatePresence>
              {isHovered && !isAdmin && (
              <motion.div
                variants={quickActionsVariants} initial="hidden" animate="visible" exit="hidden"
                className="absolute top-2 right-2 flex flex-col gap-1.5 z-10"
              >
                <Button variant="outline" size="icon" className="h-7 w-7 bg-slate-800/70 border-slate-600 text-slate-300 hover:text-blue-400 hover:border-blue-500/70 backdrop-blur-sm rounded-md">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7 bg-slate-800/70 border-slate-600 text-slate-300 hover:text-blue-400 hover:border-blue-500/70 backdrop-blur-sm rounded-md">
                  <Heart className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="border-blue-600/50 text-blue-400 bg-blue-900/30 text-[10px] font-mono uppercase px-1.5 py-0.5">
              <Zap className="w-2.5 h-2.5 mr-1" /> {/* Using Zap for "New" or "Hot" */}
              New
            </Badge>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/${storeName}/product/${productId}`}> {/* Use storeName */}
          <h3 className="text-md font-semibold text-slate-100 hover:text-blue-400 transition-colors mb-1 font-mono uppercase tracking-wide line-clamp-2">
            {displayProduct.name}
          </h3>
        </Link>
        <p className="text-slate-400 text-xs sm:text-sm mb-1 line-clamp-2 leading-snug">
          {displayProduct.description}
        </p>
        <div className="flex items-center gap-1 mb-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < (displayProduct.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-600 text-slate-600'}`} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-blue-400 font-mono">
            ${displayProduct.price?.toFixed(2) || "N/A"}
          </p>
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0 rounded-md px-3 py-1.5 text-xs font-mono uppercase tracking-wider"
            disabled={inventory_count !== undefined && inventory_count <= 0}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {inventory_count !== undefined && inventory_count <= 0 ? 'Out of Stock' : 'Add'}
          </Button>
        </div>
        {isAdmin && (
          <Button
            onClick={handleEditProductClick}
            variant="outline"
            size="sm"
            className="w-full mt-3 border-blue-600/70 text-blue-400 hover:bg-blue-700/30 rounded-md text-xs font-mono uppercase tracking-wider"
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            Edit Product
          </Button>
        )}
      </div>
    </motion.div>
    {isEditModalOpen && (
      <ProductEditModal
        product={displayProduct}
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
