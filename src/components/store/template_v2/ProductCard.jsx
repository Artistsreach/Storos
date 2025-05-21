
import React, { useState } from 'react'; // Keep this one as it includes useState
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Eye, Zap as BuyNowIcon } from 'lucide-react'; // Added BuyNowIcon
import { useStore } from '@/contexts/StoreContext';
import { Link } from 'react-router-dom';
import { stripePromise } from '@/lib/stripe'; // Added stripePromise

const ProductCard = ({ product, theme, index, storeId, isPublishedView = false }) => {
  const { name, price, rating, description, image, currencyCode = 'USD', id: rawProductId, stripe_price_id } = product; // Added stripe_price_id
  const { addToCart } = useStore();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // Encode Shopify GIDs for URL safety
  const isShopifyGid = (id) => typeof id === 'string' && id.startsWith('gid://shopify/');
  const productId = isShopifyGid(rawProductId) ? btoa(rawProductId) : rawProductId;

  const imageUrl = image?.src?.medium || image?.url || `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(name)}`;
  const imageAlt = image?.alt || `${name} product image`; // Simplified alt text logic
  
  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent link navigation if button inside Link
    e.stopPropagation();
    addToCart(product, storeId);
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // The stripe_price_id is fetched by the backend function now, 
    // but we can keep a client-side check if product object is expected to have it.
    // For now, let's rely on the backend to check if the product has a valid Stripe price ID.
    // if (!stripe_price_id) { 
    //   setCheckoutError('This product is not available for purchase at the moment (missing local Stripe Price ID).');
    //   console.error('Stripe Price ID is missing for product on client:', product);
    //   return;
    // }

    setIsCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // No Authorization header needed for public checkout usually
            // 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY // If function requires it
          },
          body: JSON.stringify({ 
            platform_product_id: rawProductId, // Use platform_product_id
            store_id: storeId,                 // Use store_id
            quantity: 1 
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session.');
      }

      // The function now returns checkoutUrl directly
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.sessionId) { // Fallback if only sessionId is returned (older Stripe.js integration)
        const stripe = await stripePromise;
        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (stripeError) {
          console.error('Stripe redirect error:', stripeError);
          setCheckoutError(stripeError.message);
        }
      } else {
        throw new Error('Checkout session created, but no URL or Session ID returned.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError(err.message);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Conditionally render Buy Now button only if product has a stripe_default_price_id
  // This implies it's available for purchase via Stripe.
  // The backend function `create-stripe-checkout-session` will also verify this.
  const canBuyNow = !!product.stripe_default_price_id || !!stripe_price_id;


  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -8, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      className="product-card h-full"
    >
      <Card className="h-full overflow-hidden border hover:border-primary/50 transition-all duration-300 flex flex-col group bg-card shadow-sm hover:shadow-lg rounded-md"> {/* Added rounded-md */}
        {/* Removed isPublishedView from state, ProductDetail will get it from context */}
        <Link to={`/store/${storeId}/product/${productId}`} className="block">
          <div className="aspect-square relative overflow-hidden bg-muted">
            <img 
              alt={imageAlt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={imageUrl} />
            
            <div 
              className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold text-white rounded shadow-md" /* Changed rounded-full to rounded */
              style={{ backgroundColor: theme.primaryColor }}
            >
              NEW
            </div>
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Eye className="h-10 w-10 text-white" />
            </div>
          </div>
        </Link>
        
        <CardContent className="p-4 flex-grow">
          {/* Removed isPublishedView from state */}
          <Link to={`/store/${storeId}/product/${productId}`} className="block">
            <div className="flex justify-between items-start mb-1.5">
              <h3 className="font-semibold text-md lg:text-lg line-clamp-2 group-hover:text-primary transition-colors" style={{"--hover-color": theme.primaryColor}}>{name}</h3>
              <span className="font-bold text-md lg:text-lg whitespace-nowrap" style={{ color: theme.primaryColor }}>
                {currencyCode} {price.toFixed(2)}
              </span>
            </div>
          </Link>
          
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {description}
          </p>
          
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/50'}`} 
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({rating} reviews)</span>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 mt-auto flex flex-col gap-2">
          <Button 
            className="w-full transition-transform duration-200 hover:scale-105"
            style={{ backgroundColor: theme.primaryColor, color: theme.primaryTextColor || 'white' }}
            onClick={handleAddToCart}
            disabled={isCheckoutLoading}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          {canBuyNow && ( 
            <Button 
              variant="outline"
              className="w-full transition-transform duration-200 hover:scale-105"
              onClick={handleBuyNow}
              disabled={isCheckoutLoading}
            >
              <BuyNowIcon className="mr-2 h-4 w-4" />
              {isCheckoutLoading ? 'Processing...' : 'Buy Now'}
            </Button>
          )}
          {checkoutError && <p className="text-xs text-red-500 mt-1">{checkoutError}</p>}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
