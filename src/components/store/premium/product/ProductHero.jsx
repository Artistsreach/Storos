import React from 'react';
import { Button } from '../../../ui/button'; // Adjusted path
import { Star, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { useStore } from '../../../../contexts/StoreContext'; // Import useStore

const ProductHero = ({ product, store: storeProp }) => { // Rename store to storeProp
  const { store: contextStore } = useStore(); // Get store from context for theme
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

  const currentProduct = product || {
    name: "Premium Product Name",
    description: "This is a detailed description of the premium product, highlighting its key features, benefits, and unique selling points. Crafted with the finest materials and exceptional attention to detail.",
    price: 299.99,
    images: [
      { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", alt: "Product Image 1" },
      { src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", alt: "Product Image 2" },
    ],
    rating: 4.7,
    reviewCount: 150,
  };

  return (
    <section id={`product-hero-${currentProduct.id}`} className="py-12 md:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image Gallery Placeholder */}
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            {currentProduct.images && currentProduct.images.length > 0 ? (
              <img src={currentProduct.images[0].src} alt={currentProduct.images[0].alt} className="max-h-[500px] object-contain rounded-lg" />
            ) : (
              <span className="text-gray-500 dark:text-gray-400">Product Image</span>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white premium-font-display">
              {currentProduct.name}
            </h1>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(currentProduct.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400">({currentProduct.reviewCount} reviews)</span>
            </div>
            <p className="text-2xl font-semibold premium-font-body" style={{ color: primaryColor }}>
              ${currentProduct.price.toFixed(2)}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed premium-font-body">
              {currentProduct.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="text-white text-lg flex-grow"
                style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                onMouseEnter={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${getDarkerShade(primaryColor, -10)}, ${getDarkerShade(secondaryColor, -10)})`}
                onMouseLeave={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button variant="outline" size="lg" className="text-lg flex-grow">
                <Heart className="mr-2 h-5 w-5" /> Add to Wishlist
              </Button>
            </div>
             <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 dark:text-gray-400 mt-4"
              style={{ '--hover-text-color': primaryColor, '--dark-hover-text-color': secondaryColor }}
              onMouseEnter={(e) => e.currentTarget.style.color = document.documentElement.classList.contains('dark') ? secondaryColor : primaryColor}
              onMouseLeave={(e) => e.currentTarget.style.color = ''}
            >
                <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductHero;
