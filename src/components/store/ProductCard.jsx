
import React, { useState } from 'react'; // Keep this one as it includes useState
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Eye, Zap as BuyNowIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { Link } from 'react-router-dom';
import { stripePromise } from '@/lib/stripe';
import InlineTextEdit from '@/components/ui/InlineTextEdit'; // Added import

const ProductCard = ({ product, theme, index, storeId, isPublishedView = false }) => {
  const { name, price, rating, description, image, currencyCode = 'USD', id: rawProductId, stripe_price_id } = product;
  const { addToCart, updateStore } = useStore(); // Assuming updateStore can handle product updates or a specific updateProduct function exists
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const isAdmin = !isPublishedView;

  // Encode Shopify GIDs for URL safety
  const isShopifyGid = (id) => typeof id === 'string' && id.startsWith('gid://shopify/');
  const productId = isShopifyGid(rawProductId) ? btoa(rawProductId) : rawProductId;

  const imageUrl = image?.src?.medium || image?.url || `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(name)}`;
  const imageAlt = image?.alt || `${name} product image`;
  
  const handleSaveProductText = async (field, value) => {
    if (storeId && rawProductId) {
      try {
        // This assumes a way to update individual product fields.
        // The actual implementation might involve calling a specific function like `updateProductDetails(storeId, rawProductId, { [field]: value })`
        // or `updateStore` might be smart enough to handle nested product updates if product data is part of the main store object.
        // For now, we'll construct a payload that might be sent to a generic product update function.
        // This is a placeholder and might need adjustment based on how product data is managed.
        // Option 1: If products are part of the store object that updateStore handles:
        // await updateStore(storeId, { products: store.products.map(p => p.id === rawProductId ? {...p, [field]: value} : p) });
        // Option 2: If there's a specific function for product updates (more likely for individual product management):
        // await updateProductInStore(storeId, rawProductId, { [field]: value });
        // Option 3: Using a generic updateStore that might call a Supabase function for product management
        // This is a simplified example; a real implementation might need to call a specific Supabase function
        // that handles product updates, e.g., 'manage-product'.
        // For demonstration, let's assume updateStore can take a specific product update path.
        // This is highly dependent on the backend and StoreContext implementation.
        // A more robust solution would be to have a dedicated function in StoreContext like `updateProduct(productId, data)`
        
        // Let's assume a simple update to the product object directly if it's mutable client-side
        // and then a call to persist this. This is a common pattern but depends on context structure.
        // For now, we'll call updateStore with a specific structure that a backend function might expect.
        // This is a placeholder for the actual update logic.
        console.log(`Attempting to save product ${rawProductId}: ${field} = ${value}`);
        // Example: await updateStore(storeId, { products: { [rawProductId]: { [field]: value } } }); // This is speculative
        // A more direct approach if products are managed via a separate table/function:
        // This would typically be a call to a Supabase Edge Function like 'manage-product'
        // For now, we'll just log, as the actual update mechanism for individual product fields isn't fully clear from context.
        // If `updateStore` is generic enough, it might be:
        // await updateStore(storeId, { content: { products: { [rawProductId]: { [field]: value } } } }); // If products are in content
        // Or if products are top-level in the store object:
        // await updateStore(storeId, { products: store.products.map(p => p.id === rawProductId ? {...p, [field]: value} : p) });

        // Given the 'manage-product' function, it's likely we need to call that.
        // The `updateStore` in `StoreContext` might abstract this.
        // For now, let's assume `updateStore` can handle a partial update to a product by its ID.
        // This is a common pattern for a context function that wraps API calls.
        // The exact payload structure depends on how `updateStore` and the backend are designed.
        // A simple approach:
        const productUpdatePayload = { id: rawProductId, [field]: value };
        // This would then be handled by updateStore to call the appropriate backend endpoint.
        // For example, if updateStore calls a generic patch endpoint for the store,
        // or if it has logic to call a specific product update endpoint.
        // This is a placeholder for the actual update mechanism.
        // await updateStore(storeId, { productUpdates: [productUpdatePayload] });
         await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-product`, {
          method: 'PUT', // Or PATCH
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`, // Assuming auth is needed
          },
          body: JSON.stringify({ store_id: storeId, product_id: rawProductId, [field]: value })
        });


      } catch (error) {
        console.error(`Failed to update product ${field}:`, error);
      }
    }
  };

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
      <Card className="h-full overflow-hidden border hover:border-primary/50 transition-all duration-300 flex flex-col group bg-card shadow-sm hover:shadow-lg">
        {/* Removed isPublishedView from state, ProductDetail will get it from context */}
        <Link to={`/store/${storeId}/product/${productId}`} className="block">
          <div className="aspect-square relative overflow-hidden bg-muted">
            <img 
              alt={imageAlt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={imageUrl} />
            
            <div 
              className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold text-white rounded-full shadow-md"
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
          <Link to={`/store/${storeId}/product/${productId}`} className="block">
            <div className="flex justify-between items-start mb-1.5">
              <h3 className="font-semibold text-md lg:text-lg line-clamp-2 group-hover:text-primary transition-colors" style={{"--hover-color": theme.primaryColor}}>
                <InlineTextEdit
                  initialText={name}
                  onSave={(newText) => handleSaveProductText('name', newText)}
                  isAdmin={isAdmin}
                  placeholder="Product Name"
                />
              </h3>
              <span className="font-bold text-md lg:text-lg whitespace-nowrap" style={{ color: theme.primaryColor }}>
                {currencyCode} {typeof price === 'number' ? price.toFixed(2) : 'Price unavailable'}
              </span>
            </div>
          </Link>
          
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            <InlineTextEdit
              initialText={description}
              onSave={(newText) => handleSaveProductText('description', newText)}
              isAdmin={isAdmin}
              placeholder="Product Description"
            />
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
