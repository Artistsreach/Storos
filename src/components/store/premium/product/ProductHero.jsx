import React from 'react';
import { Button } from '../../../ui/button'; // Adjusted path
import { Star, ShoppingCart, Heart, Share2 } from 'lucide-react';

const ProductHero = ({ product, store }) => {
  // Placeholder for Product Hero section (typically on a product detail page)
  // This would display detailed information about a single product.

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
            <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 premium-font-body">
              ${currentProduct.price.toFixed(2)}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed premium-font-body">
              {currentProduct.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg flex-grow">
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button variant="outline" size="lg" className="text-lg flex-grow">
                <Heart className="mr-2 h-5 w-5" /> Add to Wishlist
              </Button>
            </div>
             <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mt-4">
                <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductHero;
