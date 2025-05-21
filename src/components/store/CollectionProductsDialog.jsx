import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter, // Ensure DialogFooter is imported
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight } from 'lucide-react';

const CollectionProductsDialog = ({ isOpen, onClose, collection, storeId }) => {
  const navigate = useNavigate();

  if (!collection) {
    return null;
  }

  const handleProductClick = (productId) => {
    onClose(); // Close the dialog first
    navigate(`/store/${storeId}/product/${productId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{collection.name || 'Collection Products'}</DialogTitle>
          <DialogDescription>
            Browse products available in the "{collection.name || 'Unnamed'}" collection. Click a product to see more details.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="py-4 space-y-3">
            {collection.products && collection.products.length > 0 ? (
              collection.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleProductClick(product.id)}
                >
                  <div className="flex items-center gap-3">
                    {product.image && product.image.src && product.image.src.medium ? (
                      <img 
                        src={product.image.src.medium} 
                        alt={product.name || 'Product image'} 
                        className="w-16 h-16 object-cover rounded-md border" 
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{product.name || 'Untitled Product'}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.price ? `$${parseFloat(product.price).toFixed(2)}` : 'Price not available'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No products found in this collection.
              </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionProductsDialog;
