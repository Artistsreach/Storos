
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import StoreCard from '../components/StoreCard';
import ProductCard from './store/fresh/product/ProductCard';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ScrollArea, ScrollBar } from '../components/ui/scroll-area';
import { tags } from '../lib/constants';

const tagColors = [
  '255, 99, 132', '54, 162, 235', '255, 206, 86', '75, 192, 192', '153, 102, 255', '255, 159, 64',
  '255, 99, 132', '54, 162, 235', '255, 206, 86', '75, 192, 192', '153, 102, 255', '255, 159, 64',
  '255, 99, 132', '54, 162, 235', '255, 206, 86', '75, 192, 192', '153, 102, 255', '255, 159, 64',
  '255, 99, 132', '54, 162, 235', '255, 206, 86', '75, 192, 192', '153, 102, 255'
];

const StoreList = () => {
  const { stores, loadStores, isLoadingStores } = useStore();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isShimmering, setIsShimmering] = useState(false);

  useEffect(() => {
    let intervalId;
    let timeoutId;

    const triggerShimmer = () => {
      setIsShimmering(true);
      timeoutId = setTimeout(() => {
        setIsShimmering(false);
      }, 2500); // Duration of the shimmer animation
    };

    intervalId = setInterval(triggerShimmer, 5000); // Trigger every 5 seconds

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (user && user.uid) {
      loadStores(user.uid);
    }
  }, [user, loadStores]);

  const searchResults = useMemo(() => {
    if (!searchTerm && selectedTags.length === 0) {
      return stores.map(s => ({ ...s, type: 'store' }));
    }

    const lowercasedSearchTerm = searchTerm.toLowerCase();
    let results = [];

    stores.forEach(store => {
      const storeNameMatches = store.name.toLowerCase().includes(lowercasedSearchTerm);
      const tagsMatch = selectedTags.length === 0 || selectedTags.some(tag => store.tags?.includes(tag));

      if (storeNameMatches && tagsMatch) {
        results.push({ ...store, type: 'store' });
      }

      if (store.products) {
        store.products.forEach(product => {
          if (product.name.toLowerCase().includes(lowercasedSearchTerm) && tagsMatch) {
            // Avoid duplicating products if the store is already added
            // But we want to show products even if the store name doesn't match
            results.push({ ...product, type: 'product', storeName: store.name, storeSlug: store.urlSlug });
          }
        });
      }
    });
    
    // Remove duplicate stores that might have been added if a product also matched
    const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());

    return uniqueResults.sort((a, b) => {
      const aIsUserStore = a.type === 'store' && a.merchant_id === user?.uid;
      const bIsUserStore = b.type === 'store' && b.merchant_id === user?.uid;
      if (aIsUserStore && !bIsUserStore) return -1;
      if (!aIsUserStore && bIsUserStore) return 1;
      return 0;
    });
  }, [stores, searchTerm, selectedTags, user]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };


  // Conditional rendering for loading and empty states is handled below,
  // so no need to return null early if stores.length is 0 initially.
  // if (stores.length === 0 && !isLoadingStores) { 
  //   return null;
  // }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-6xl mx-auto mt-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-200 dark:from-gray-400 dark:to-gray-200 ${isShimmering ? 'animate-shimmer' : ''}`}>
          Browse Stores & Products
        </h2>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by store or product name..."
            className="w-full pl-10 py-2 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap rounded-md border mb-4">
        <div className="flex w-max space-x-2 p-2">
          {tags.map((tag, index) => {
            const isSelected = selectedTags.includes(tag);
            const glowStyle = isSelected ? { '--glow-color': tagColors[index % tagColors.length] } : {};
            return (
              <Button
                key={tag}
                variant={isSelected ? "solid" : "outline"}
                onClick={() => toggleTag(tag)}
                className={`capitalize ${isSelected ? 'pulse-glow-animation' : ''}`}
                style={glowStyle}
              >
                {tag}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {isLoadingStores && searchResults.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Loading your items...</p>
        </div>
      )}

      {!isLoadingStores && stores.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold">No stores or products found</h3>
          <p className="text-muted-foreground mt-2">Get started by generating a new store!</p>
        </div>
      )}

      {!isLoadingStores && searchResults.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold">No results match your search</h3>
          <p className="text-muted-foreground mt-2">Try a different search term or filter.</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchResults.map((item) => {
            if (item.type === 'store') {
              return <StoreCard key={`store-${item.id}`} store={item} />;
            }
            if (item.type === 'product') {
              return <ProductCard key={`product-${item.id}`} product={item} storeName={item.storeName} storeSlug={item.storeSlug} />;
            }
            return null;
          })}
        </div>
      )}
    </motion.div>
  );
};

export default StoreList;
