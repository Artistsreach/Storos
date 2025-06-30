import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

const ManageCollectionProductsModal = ({ isOpen, onClose, collection, allProducts, onSave }) => {
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  useEffect(() => {
    if (collection && collection.product_ids) {
      setSelectedProductIds(collection.product_ids);
    } else {
      setSelectedProductIds([]);
    }
  }, [collection]);

  const handleProductSelect = (productId) => {
    setSelectedProductIds(prevSelectedIds => {
      if (prevSelectedIds.includes(productId)) {
        return prevSelectedIds.filter(id => id !== productId);
      } else {
        return [...prevSelectedIds, productId];
      }
    });
  };

  const handleSaveChanges = () => {
    onSave(collection.id || collection.name, selectedProductIds);
    onClose();
  };

  if (!collection) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Products in "{collection.name}"</DialogTitle>
          <DialogDescription>
            Select the products that should appear in this collection.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="py-4 space-y-3">
            {allProducts && allProducts.length > 0 ? (
              allProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    {(product.images && product.images.length > 0) ? (
                      <img src={product.images[0]} alt={product.name || 'Product image'} className="w-16 h-16 object-cover rounded-md border" />
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
                  <Checkbox
                    checked={selectedProductIds.includes(product.id)}
                    onCheckedChange={() => handleProductSelect(product.id)}
                    id={`product-${product.id}`}
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No products available to add to this collection.
              </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageCollectionProductsModal;
