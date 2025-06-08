import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea'; // Assuming Textarea component exists
import { ScrollArea } from '../../components/ui/scroll-area';

const ShopifyProductEditModal = ({ isOpen, onClose, product, onSave }) => {
  const [editedProduct, setEditedProduct] = useState(null);

  useEffect(() => {
    if (product) {
      // Initialize with the first variant's price if available
      const firstVariant = product.variants?.edges[0]?.node;
      setEditedProduct({
        ...product,
        name: product.title || '', // Use name for editing, map back to title on save
        price: firstVariant?.price?.amount || 0,
        currencyCode: firstVariant?.price?.currencyCode || 'USD',
        // For simplicity, image editing will be direct URL change
        imageUrl: product.images?.edges[0]?.node?.url || '',
      });
    } else {
      setEditedProduct(null);
    }
  }, [product]);

  if (!isOpen || !editedProduct) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e) => {
    const { value } = e.target;
    setEditedProduct(prev => ({ ...prev, price: parseFloat(value) || 0 }));
  };
  
  const handleImageUrlChange = (e) => {
    const { value } = e.target;
    setEditedProduct(prev => ({ ...prev, imageUrl: value }));
  };

  const handleSave = () => {
    // Map edited fields back to the expected product structure for saving
    const productToSave = {
      ...editedProduct,
      title: editedProduct.name, // Map name back to title
      images: {
        edges: [
          {
            node: {
              url: editedProduct.imageUrl,
              altText: editedProduct.name, // Use product name as alt text
            },
          },
        ],
      },
      variants: {
        ...editedProduct.variants, // Preserve other variant data if any
        edges: [
          {
            node: {
              ...(editedProduct.variants?.edges[0]?.node || {}), // Preserve other first variant fields
              price: {
                amount: editedProduct.price,
                currencyCode: editedProduct.currencyCode,
              },
            },
          },
          // Include other variants if they were part of editedProduct.variants.edges
          ...(editedProduct.variants?.edges?.slice(1) || [])
        ],
      },
    };
    onSave(productToSave);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Product: {product.title}</DialogTitle>
          <DialogDescription>
            Make changes to the product details below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="grid gap-4 py-4 pr-3">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" name="name" value={editedProduct.name} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" name="description" value={editedProduct.description} onChange={handleChange} className="col-span-3" rows={4} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input id="price" name="price" type="number" value={editedProduct.price} onChange={handlePriceChange} className="col-span-3" />
            </div>
            {/* Basic Image URL editing */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
              <Input id="imageUrl" name="imageUrl" value={editedProduct.imageUrl} onChange={handleImageUrlChange} className="col-span-3" />
            </div>
            {/* TODO: Add Tags and Variant editing if needed */}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShopifyProductEditModal;
