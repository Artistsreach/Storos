import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Assuming React Router
import { ShoppingBag, Heart, Star, Eye } from 'lucide-react';
import { Button } from '../ui/button'; // Changed to relative
import { Badge } from '../ui/badge';   // Changed to relative
import { Product } from '../../lib/types'; // Changed to relative
import { cn, formatCurrency } from '../../lib/utils'; // Changed to relative

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const {
    id,
    handle,
    name,
    category,
    price,
    originalPrice,
    images,
    rating,
    reviewCount,
    isNew,
    // tags, // tags is declared but not used in the provided example, can be added if needed
  } = product;

  // Adapt to potential image structure from main app: images: [{ src: { large, medium }, alt }]
  // vs template's expected: images: [{ src: string, alt }]
  const getImageUrl = (image: any): string => {
    if (!image) return '/assets/placeholder-product.svg'; // Handle null/undefined image object
    if (typeof image.src === 'string') return image.src;
    if (typeof image.src?.large === 'string') return image.src.large;
    if (typeof image.src?.medium === 'string') return image.src.medium;
    return '/assets/placeholder-product.svg'; // Fallback
  };
  
  // Safely access images array and its elements
  const safeImages = Array.isArray(images) ? images : [];
  const primaryImageObj = safeImages.find(img => img.isPrimary) || safeImages[0] || null;
  const primaryImageSrc = getImageUrl(primaryImageObj); // getImageUrl handles null primaryImageObj
  const primaryImageAlt = primaryImageObj?.alt || name;

  const hoverImageObjCandidate = safeImages.length > 1 ? safeImages.find(img => !img.isPrimary) : null;
  const hoverImageObj = hoverImageObjCandidate || primaryImageObj; // Fallback to primary if no distinct hover image
  const hoverImageSrc = getImageUrl(hoverImageObj);
  const hoverImageAlt = hoverImageObj?.alt || `Alternative view of ${name}`;
  
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount && originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  // Placeholder actions - in a real app, these would interact with Zustand store / API
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Added ${name} to cart`);
    // Example: cartStore.addItem(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Toggled favorite for ${name}`);
    // Example: favoriteStore.toggleFavorite(product.id);
  };

  return (
    <motion.div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg",
        className
      )}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="article"
      aria-labelledby={`product-name-${id}`}
    >
      <Link to={`/products/${handle}`} className="block" aria-label={`View details for ${name}`}>
        {/* Image Section */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <picture>
            {/* Provide different sources for different resolutions if available */}
            {/* <source media="(min-width: 768px)" srcSet={primaryImageSrc.replace('.jpg', '-md.jpg')} /> */}
            <img
              src={primaryImageSrc}
              alt={primaryImageAlt}
              className="h-full w-full object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0"
              loading="lazy"
              width={300} // Add appropriate default dimensions
              height={400}
            />
          </picture>
          {hoverImageObj && hoverImageSrc !== primaryImageSrc && (
            <picture>
              <img
                src={hoverImageSrc}
                alt={hoverImageAlt}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
                loading="lazy"
                aria-hidden="true" // Hidden by default, revealed on hover
                width={300}
                height={400}
              />
            </picture>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && <Badge variant="default" className="bg-primary text-primary-foreground">NEW</Badge>}
            {hasDiscount && (
              <Badge variant="destructive" className="bg-red-500 text-white">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Action Buttons on Hover */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 transform gap-2 opacity-0 transition-all duration-300 group-hover:bottom-4 group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-white/80 text-gray-700 shadow-md backdrop-blur-sm hover:bg-white"
              onClick={handleAddToCart}
              aria-label={`Add ${name} to cart`}
            >
              <ShoppingBag className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-white/80 text-gray-700 shadow-md backdrop-blur-sm hover:bg-white"
              // onClick={handleQuickView} // Placeholder for a quick view modal
              aria-label={`Quick view ${name}`}
            >
              <Eye className="h-5 w-5" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/50 text-gray-700 opacity-70 backdrop-blur-sm transition-opacity hover:opacity-100 group-hover:bg-white/80"
            onClick={handleToggleFavorite}
            aria-label={`Add ${name} to favorites`}
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-4 md:p-5 space-y-2">
          {category && (
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {category}
            </p>
          )}
          <h3 id={`product-name-${id}`} className="text-base font-semibold leading-tight text-foreground truncate">
            {name}
          </h3>

          {/* Rating */}
          {rating && reviewCount && reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-1">
            <p className="text-lg font-bold text-primary">{formatCurrency(price)}</p>
            {hasDiscount && originalPrice && (
              <p className="text-sm text-muted-foreground line-through">
                {formatCurrency(originalPrice)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
