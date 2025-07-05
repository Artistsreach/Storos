import React from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import RealtimeProductCard from './store/RealtimeProductCard';
import AliExpressProductCard from './store/AliExpressProductCard';
import AmazonProductCard from './store/AmazonProductCard';
import WalmartProductCard from './store/WalmartProductCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

const WishlistModal = ({ isOpen, onClose }) => {
  const { wishlist } = useWishlist();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>My Wishlist</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto p-4">
          {wishlist.length === 0 ? (
            <p>Your wishlist is empty.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlist.map((product) => {
                if (product.type === 'realtime-product') {
                  return <RealtimeProductCard key={product.product_id} product={product} />;
                }
                if (product.type === 'ali-product') {
                  return <AliExpressProductCard key={product.item.itemId} product={product} />;
                }
                if (product.type === 'amazon-product') {
                  return <AmazonProductCard key={product.asin} product={product} />;
                }
                if (product.type === 'walmart-product') {
                  return <WalmartProductCard key={product.usItemId} product={product} />;
                }
                return null;
              })}
            </div>
          )}
        </div>
        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WishlistModal;
