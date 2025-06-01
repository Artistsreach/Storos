import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Star } from 'lucide-react';
import { Button } from '../../../ui/button'; // Adjusted path
import { useStore } from '../../../../contexts/StoreContext'; // Import useStore

const QuickView = ({ product, isOpen, onClose, store: storeProp }) => { // Added storeProp
  const { store: contextStore } = useStore(); // Get store from context for theme
  // const { addToCart } = useStore(); // Example if needed
  const store = contextStore || storeProp; // Prioritize contextStore

  const primaryColor = store?.theme?.primaryColor || "#6366F1"; // Default if no theme

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

  if (!product) return null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    // addToCart(product, product.storeId || store?.id); // Example
    console.log("Add to cart from QuickView:", product.name);
    onClose(); // Close modal after action
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Image Placeholder */}
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                {product.image?.src?.medium ? (
                  <img src={product.image.src.medium} alt={product.name} className="max-h-full max-w-full object-contain rounded-lg" />
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">Product Image</span>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col justify-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white premium-font-display">
                  {product.name || "Product Name"}
                </h2>
                
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({product.reviewCount || 0} reviews)</span>
                </div>

                <p className="text-3xl font-semibold premium-font-body" style={{ color: primaryColor }}>
                  ${(product.price || 0).toFixed(2)}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-4 premium-font-body">
                  {product.description || "Detailed product description goes here..."}
                </p>
                
                {/* Variant selection placeholder */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</p>
                    <div className="flex gap-2">
                        {['S', 'M', 'L', 'XL'].map(size => (
                            <Button key={size} variant="outline" size="sm">{size}</Button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-3">
                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    className="text-white flex-grow"
                    style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                    onMouseEnter={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${getDarkerShade(primaryColor, -10)}, ${getDarkerShade(secondaryColor, -10)})`}
                    onMouseLeave={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                  </Button>
                  <Button variant="outline" size="lg" className="flex-grow">
                    <Heart className="mr-2 h-5 w-5" /> Wishlist
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickView;
