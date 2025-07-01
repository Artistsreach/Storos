
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import StoreCard from '../components/StoreCard';
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

  useEffect(() => {
    if (user && user.uid) {
      loadStores(user.uid);
    }
  }, [user]);

  const filteredStores = useMemo(() => {
    const sortedStores = [...stores].sort((a, b) => {
      const isAUserStore = a.merchant_id === user?.uid;
      const isBUserStore = b.merchant_id === user?.uid;
      if (isAUserStore && !isBUserStore) return -1;
      if (!isAUserStore && isBUserStore) return 1;
      return 0;
    });

    let filtered = sortedStores;

    if (selectedTags.length > 0) {
      filtered = filtered.filter(store =>
        selectedTags.includes(store.niche)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [stores, searchTerm, user, selectedTags]);

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
        <h2 className="text-3xl font-bold tracking-tight">Browse</h2>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by store name..."
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

      {isLoadingStores && filteredStores.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Loading your stores...</p>
        </div>
      )}

      {!isLoadingStores && stores.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold">No stores found</h3>
          <p className="text-muted-foreground mt-2">Get started by generating a new one!</p>
          {/* Consider adding a <Button> here to navigate to the store creation page */}
        </div>
      )}

      {!isLoadingStores && stores.length > 0 && filteredStores.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold">No stores match your search</h3>
          <p className="text-muted-foreground mt-2">Try a different search term or clear the search to see all your stores.</p>
        </div>
      )}

      {filteredStores.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default StoreList;
