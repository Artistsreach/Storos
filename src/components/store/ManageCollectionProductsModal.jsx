import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Added Input
import { Checkbox } from '@/components/ui/checkbox.tsx'; // Changed to .tsx extension
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

const ManageCollectionProductsModal = ({
  isOpen,
  onClose,
  collection,
  allProducts,
  onSave,
}) => {
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Added searchTerm state

  useEffect(() => {
    if (collection && collection.product_ids) {
      setSelectedProductIds(collection.product_ids);
    } else {
      setSelectedProductIds([]);
    }
  }, [collection]);

  if (!collection) return null;

  const handleProductToggle = (productId) => {
    setSelectedProductIds((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const handleSaveChanges = () => {
    onSave(collection.id || collection.name, selectedProductIds); // Use name as fallback ID if real ID not present
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Manage Products for "{collection.name || 'Unnamed Collection'}"</DialogTitle>
          <DialogDescription>
            Select or unselect products to include in this collection. Use the search bar to filter products.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {/* This paragraph is now part of DialogDescription, so it can be removed or kept if it adds different value */}
          {/* <p className="text-sm text-muted-foreground mb-2">
            Select the products that should be part of this collection.
          </p> */}
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {allProducts && allProducts.length > 0 ? (
            <ScrollArea className="h-[250px] pr-4"> {/* Adjusted height for search bar */}
              <div className="space-y-3">
                {allProducts
                  .filter((product) =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((product) => (
                    <div
                      key={product.id || product.name} // Use name as fallback ID
                      className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`product-${collection.id || collection.name}-${product.id || product.name}`}
                        checked={selectedProductIds.includes(product.id || product.name)}
                        onCheckedChange={() => handleProductToggle(product.id || product.name)}
                      />
                      <Label
                        htmlFor={`product-${collection.id || collection.name}-${product.id || product.name}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-sm" />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-sm flex items-center justify-center text-xs text-muted-foreground">
                              No Img
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.name || 'Untitled Product'}</p>
                            <p className="text-xs text-muted-foreground">${product.price || '0.00'}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No products available to add to this collection. Please add products to your store first.
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveChanges} disabled={!allProducts || allProducts.length === 0}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageCollectionProductsModal;
