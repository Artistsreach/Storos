import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, Search, Star } from 'lucide-react';

const StarRating = ({ rating }) => {
  const totalStars = 5;
  const filledStars = Math.round(rating);
  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < filledStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

const DropshippingModal = ({ isOpen, onClose, onAddProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [detailedProducts, setDetailedProducts] = useState({});

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setProducts([]);
    try {
      const response = await fetch(`https://us-central1-freshfront-c3181.cloudfunctions.net/aliexpressProxy?keywords=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      if (data.result && data.result.docs) {
        setProducts(data.result.docs);
      } else {
        console.warn("Unexpected API response structure:", data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching from AliExpress API:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    const isSelected = selectedProducts.some(p => p.product_id === product.product_id);
    if (isSelected) {
      setSelectedProducts(prev => prev.filter(p => p.product_id !== product.product_id));
    } else {
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const handleAddSelectedProducts = () => {
    onAddProducts(selectedProducts);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search AliExpress Products</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 p-4 border-b">
          <Input
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-grow"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
          </Button>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
          {isLoading && <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8" /></div>}
          {!isLoading && products.length === 0 && <div className="text-center text-gray-500">No products found.</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.product_id}
                className={`border rounded-lg p-2 cursor-pointer ${selectedProducts.some(p => p.product_id === product.product_id) ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
                onClick={() => handleProductSelect(product)}
              >
                <img src={product.product_main_image_url} alt={product.product_title} className="w-full h-40 object-cover rounded-md mb-2" />
                <h3 className="text-sm font-semibold truncate">{product.product_title}</h3>
                <p className="text-lg font-bold text-blue-600">${product.target_sale_price}</p>
                <p className="text-xs text-gray-500 truncate">by {product.shop_name}</p>
                <div className="flex items-center mt-1">
                  <StarRating rating={parseFloat(product.evaluate_rate) / 20} />
                  <span className="text-xs text-gray-500 ml-1">({product.evaluate_rate})</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(product.product_detail_url, '_blank');
                  }}
                >
                  Visit
                </Button>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAddSelectedProducts} disabled={selectedProducts.length === 0}>
            Add {selectedProducts.length} Products to Store
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DropshippingModal;
