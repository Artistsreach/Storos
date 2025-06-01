
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import StoreCard from '@/components/StoreCard';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth to get the correct user object

const StoreList = () => {
  const { stores, loadStores, isLoadingStores } = useStore();
  const { user } = useAuth(); // Get user from AuthContext

  const handleRefreshStores = () => {
    console.log("[StoreList] handleRefreshStores called. User:", user);
    if (user && user.uid) {
      console.log(`[StoreList] Calling loadStores for user UID: ${user.uid}`);
      loadStores(user.uid);
    } else {
      console.warn("[StoreList] handleRefreshStores: No user or user.uid found, cannot refresh stores.");
    }
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Stores</h2>
        <Button onClick={handleRefreshStores} variant="outline" disabled={!user || isLoadingStores}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingStores ? 'animate-spin' : ''}`} />
          {isLoadingStores ? 'Loading...' : 'Load Stores'}
        </Button>
      </div>
      {isLoadingStores && stores.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Loading your stores...</p>
        </div>
      )}
      {!isLoadingStores && stores.length === 0 && (
         <div className="text-center py-10">
            <p className="text-muted-foreground">You haven't created any stores yet. Get started by generating a new store!</p>
            {/* Optionally, add a button here to navigate to store creation */}
        </div>
      )}
      {stores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default StoreList;
