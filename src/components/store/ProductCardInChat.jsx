import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 
import { Sparkles } from 'lucide-react'; // For Visualize button icon

const ProductCardInChat = ({ productData, onViewDetails, onAddToCart, onBuyNow, onVisualize }) => {
  if (!productData) {
    return null;
  }

  const { name, description, price, imageUrl, id } = productData;

  return (
    <Card className="mb-2 w-full max-w-xs sm:max-w-sm overflow-hidden shadow-md border border-border">
      {imageUrl && (
        <div className="w-full h-32 sm:h-40 overflow-hidden bg-muted">
          <img 
            src={imageUrl} 
            alt={name || 'Product image'} 
            className="w-full h-full object-contain" // Changed to object-contain for better visibility
          />
        </div>
      )}
      <CardHeader className="p-3">
        {name && <CardTitle className="text-sm sm:text-base font-semibold leading-tight line-clamp-2">{name}</CardTitle>}
      </CardHeader>
      <CardContent className="p-3 pt-0 text-xs sm:text-sm">
        {description && <CardDescription className="mb-2 line-clamp-2 sm:line-clamp-3 text-muted-foreground">{description}</CardDescription>}
        {price && <p className="font-semibold text-sm sm:text-base">{typeof price === 'number' ? `$${price.toFixed(2)}` : price}</p>}
        <div className="mt-3 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
          {onViewDetails && (
            <Button size="sm" variant="outline" className="flex-1 text-xs sm:text-sm" onClick={() => onViewDetails(id, name)}>
              View
            </Button>
          )}
          {onAddToCart && (
            <Button size="sm" variant="secondary" className="flex-1 text-xs sm:text-sm" onClick={() => onAddToCart(id, name)}>
              Add to Cart
            </Button>
          )}
          {/* The "Buy Now" button might be too complex for this stage without Stripe integration.
              Let's make it a secondary "Add to Cart" or a placeholder for now.
              Or, it could also trigger an "add to cart and go to checkout" sequence.
              For now, let's make it similar to Add to Cart or a placeholder.
          */}
          {onBuyNow && (
             <Button size="sm" variant="default" className="flex-1 text-xs sm:text-sm" onClick={() => onBuyNow(id, name)}>
              Buy Now
            </Button>
          )}
        </div>
        {onVisualize && (
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full mt-2 text-xs sm:text-sm" 
            onClick={() => onVisualize(id, name)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Visualize with Image
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCardInChat;
