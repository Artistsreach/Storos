import React from 'react';
import { useParams } from 'react-router-dom';
import SharedLayout from '../layouts/SharedLayout'; // Assuming SharedLayout is used
import { Product } from '../lib/types'; // Assuming Product type

// This is a placeholder Product Detail Page.
// In a real app, you'd fetch product data based on the handle/id from the URL.

interface ProductDetailPageProps {
  // This component would receive all storeData, and find the specific product
  // or StorePreview would find the product and pass only that.
  // For simplicity, let's assume it gets the specific product or all products.
  storeData?: {
    products?: Product[];
    name?: string;
    logo_url?: string;
    // other store properties
  };
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ storeData }) => {
  const { productHandle } = useParams<{ productHandle: string }>();
  
  // Find the product from storeData.products based on productHandle
  // This is a simplified lookup. A real app might fetch by handle or ID.
  const product = storeData?.products?.find(p => p.handle === productHandle);

  // Helper to get image URL, similar to ProductCard
  const getImageUrl = (image: any): string => {
    if (typeof image?.src === 'string') return image.src;
    if (typeof image?.src?.large === 'string') return image.src.large;
    if (typeof image?.src?.medium === 'string') return image.src.medium;
    if (!image) return '/assets/placeholder-product.svg'; // Handle null/undefined image object
    if (typeof image.src === 'string') return image.src;
    if (typeof image.src?.large === 'string') return image.src.large;
    if (typeof image.src?.medium === 'string') return image.src.medium;
    return '/assets/placeholder-product.svg'; // Fallback
  };

  if (!product) {
    return (
      <SharedLayout storeName={storeData?.name} logoUrl={storeData?.logo_url}>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p>Sorry, we couldn't find a product with handle: {productHandle}</p>
        </div>
      </SharedLayout>
    );
  }

  // Safely access images array and its elements for PDP
  const safeImages = Array.isArray(product.images) ? product.images : [];
  const primaryImageObj = safeImages.find(img => img.isPrimary) || safeImages[0] || null;
  const primaryImageSrc = getImageUrl(primaryImageObj); // getImageUrl handles null primaryImageObj
  const primaryImageAlt = primaryImageObj?.alt || product.name;

  // Basic product detail display
  return (
    <SharedLayout storeName={storeData?.name} logoUrl={storeData?.logo_url}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            {product.images && product.images.length > 0 && (
              <img 
                src={primaryImageSrc} 
                alt={primaryImageAlt}
                className="w-full rounded-lg shadow-lg"
              />
            )}
            {/* TODO: Image gallery for multiple images */}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.category && <p className="text-sm text-muted-foreground mb-4">Category: {product.category}</p>}
            <p className="text-2xl font-semibold text-primary mb-4">${product.price.toFixed(2)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-muted-foreground line-through mb-4">
                Original: ${product.originalPrice.toFixed(2)}
              </p>
            )}
            <div className="prose dark:prose-invert mb-6">
              <p>{product.shortDescription || "No description available."}</p>
              {/* Render full description if available, potentially using dangerouslySetInnerHTML if HTML */}
            </div>
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90">
              Add to Cart
            </button>
            {/* TODO: Quantity selector, variant selectors, etc. */}
          </div>
        </div>
        {/* TODO: Reviews, related products, etc. */}
      </div>
    </SharedLayout>
  );
};

export default ProductDetailPage;
