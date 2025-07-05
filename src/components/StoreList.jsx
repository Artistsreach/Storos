import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import StoreCard from '../components/StoreCard';
import ProductCard from './store/fresh/product/ProductCard';
import AliExpressProductCard from './store/AliExpressProductCard';
import AmazonProductCard from './store/AmazonProductCard';
import RealtimeProductCard from './store/RealtimeProductCard';
import ProductActions from './ProductActions';
import ProductVisualizationModal from './ProductVisualizationModal';
import SearchPageChatbot from './store/SearchPageChatbot';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ScrollArea, ScrollBar } from '../components/ui/scroll-area';
import { tags } from '../lib/constants';
import { generateSearchQuery } from '../lib/gemini';

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
  const [aliExpressProducts, setAliExpressProducts] = useState([]);
  const [isLoadingAliExpress, setIsLoadingAliExpress] = useState(false);
  const [aliExpressError, setAliExpressError] = useState(null);
  const [amazonProducts, setAmazonProducts] = useState([]);
  const [isLoadingAmazon, setIsLoadingAmazon] = useState(false);
  const [amazonError, setAmazonError] = useState(null);
  const [realtimeProducts, setRealtimeProducts] = useState([]);
  const [isLoadingRealtime, setIsLoadingRealtime] = useState(false);
  const [realtimeError, setRealtimeError] = useState(null);
  const [isVisualizeModalOpen, setIsVisualizeModalOpen] = useState(false);
  const [selectedProductForVisualization, setSelectedProductForVisualization] = useState(null);
  const [selectedProductForAnalysis, setSelectedProductForAnalysis] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleAnalyze = (product) => {
    setSelectedProductForAnalysis({ type: 'analyze', product });
    setIsChatbotOpen(true);
  };

  const handleCompare = (product) => {
    setSelectedProductForAnalysis({
      type: 'compare',
      product,
      allProducts: searchResults.slice(0, 5),
    });
    setIsChatbotOpen(true);
  };

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

  const searchAliExpress = async (query) => {
    if (!query.trim()) return;

    setIsLoadingAliExpress(true);
    setAliExpressError(null);

    try {
      const response = await fetch(`https://us-central1-fresh-dfe30.cloudfunctions.net/aliexpressProxy?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.result && data.result.resultList) {
        setAliExpressProducts(data.result.resultList.map(p => ({ ...p, type: 'ali-product' })));
      } else {
        console.warn("Unexpected API response structure:", data);
        setAliExpressProducts([]);
      }
    } catch (error) {
      console.error('Error fetching from AliExpress API:', error);
      setAliExpressProducts([]);
    } finally {
      setIsLoadingAliExpress(false);
    }
  };

  const searchAmazon = async (query) => {
    if (!query.trim()) return;

    setIsLoadingAmazon(true);
    setAmazonError(null);

    try {
      const response = await fetch(
        `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&country=US&sort_by=RELEVANCE&product_condition=ALL`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': 'cba626806bmsh2ac060cad0d9f5fp1d645fjsn6f1e546dee8d',
            'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data && data.data.products) {
        setAmazonProducts(data.data.products.map(p => ({ ...p, type: 'amazon-product' })));
      } else {
        setAmazonProducts([]);
        setAmazonError('No products found on Amazon');
      }
    } catch (err) {
      console.error('Error fetching Amazon products:', err);
      setAmazonError('Failed to fetch Amazon products. Please try again later.');
      setAmazonProducts([]);
    } finally {
      setIsLoadingAmazon(false);
    }
  };

  const searchRealtime = async (query) => {
    if (!query.trim()) return;

    setIsLoadingRealtime(true);
    setRealtimeError(null);

    try {
      const response = await fetch(
        `https://real-time-product-search.p.rapidapi.com/search-v2?q=${encodeURIComponent(query)}&country=us&language=en&page=1&limit=10&sort_by=BEST_MATCH&product_condition=ANY&return_filters=true`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '6d580d7e23mshd6f01210dbbe038p1a9b7fjsn0989bffbf1ad',
            'x-rapidapi-host': 'real-time-product-search.p.rapidapi.com',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data && data.data.products) {
        setRealtimeProducts(data.data.products.map(p => ({ ...p, type: 'realtime-product' })));
      } else {
        setRealtimeProducts([]);
        setRealtimeError('No products found');
      }
    } catch (err) {
      console.error('Error fetching real-time products:', err);
      setRealtimeError('Failed to fetch real-time products. Please try again later.');
      setRealtimeProducts([]);
    } finally {
      setIsLoadingRealtime(false);
    }
  };

  const handleSearch = async () => {
    let query = searchTerm;
    const result = await generateSearchQuery(searchTerm);
    if (result.query) {
      query = result.query;
    }
    searchAliExpress(query);
    searchAmazon(query);
    searchRealtime(query);
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      handleSearch();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setAliExpressProducts([]);
      setAmazonProducts([]);
      setRealtimeProducts([]);
    }
  }, [searchTerm]);

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
            results.push({ ...product, type: 'product', storeName: store.name, storeSlug: store.urlSlug || generateStoreUrl(store.name) });
          }
        });
      }
    });
    
    // Remove duplicate stores that might have been added if a product also matched
    const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());

    const combinedResults = [...uniqueResults, ...aliExpressProducts, ...amazonProducts, ...realtimeProducts];

    return combinedResults.sort((a, b) => {
      const aIsUserStore = a.type === 'store' && a.merchant_id === user?.uid;
      const bIsUserStore = b.type === 'store' && b.merchant_id === user?.uid;
      if (aIsUserStore && !bIsUserStore) return -1;
      if (!aIsUserStore && bIsUserStore) return 1;
      return 0;
    });
  }, [stores, searchTerm, selectedTags, user, aliExpressProducts, amazonProducts, realtimeProducts]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleVisualize = (product, imageUrl) => {
    const productWithImage = { 
      ...product, 
      imageUrl: imageUrl || product.product_photo || product.imageUrl || product.image || product.product_main_image_url 
    };
    setSelectedProductForVisualization(productWithImage);
    setIsVisualizeModalOpen(true);
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
      className="w-full max-w-6xl mx-auto mt-8 px-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-light tracking-tighter text-gray-800 dark:text-gray-200">
          What are you looking for?
        </h2>
      </div>

      <div className="mb-6">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Something to restore my old pots & pans"
            className="w-full pl-10 py-2 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

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

      {aliExpressError && (
        <div className="text-center py-4 text-red-500">
          <p>{aliExpressError}</p>
        </div>
      )}

      {amazonError && (
        <div className="text-center py-4 text-red-500">
          <p>{amazonError}</p>
        </div>
      )}

      {realtimeError && (
        <div className="text-center py-4 text-red-500">
          <p>{realtimeError}</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchResults.map((item) => {
            if (item.type === 'store') {
              return <StoreCard key={`store-${item.id}`} store={item} />;
            }
            if (item.type === 'product') {
              const store = stores.find(s => s.name === item.storeName);
              return <ProductCard key={`product-${item.id}`} product={item} storeName={item.storeName} storeSlug={item.storeSlug} storeId={store?.id} />;
            }
            if (item.type === 'ali-product') {
              return (
                <div>
                  <AliExpressProductCard key={`ali-product-${item.item.itemId}`} product={item} />
                  <ProductActions product={item} onVisualize={handleVisualize} onAnalyze={handleAnalyze} onCompare={handleCompare} imageUrl={item.item?.image} />
                </div>
              );
            }
            if (item.type === 'amazon-product') {
              return (
                <div>
                  <AmazonProductCard key={`amazon-product-${item.asin}`} product={item} />
                  <ProductActions product={item} onVisualize={handleVisualize} onAnalyze={handleAnalyze} onCompare={handleCompare} imageUrl={item.product_photo} />
                </div>
              );
            }
            if (item.type === 'walmart-product') {
              return (
                <div>
                  <WalmartProductCard key={`walmart-product-${item.usItemId}`} product={item} />
                  <ProductActions product={item} onVisualize={handleVisualize} onAnalyze={handleAnalyze} onCompare={handleCompare} />
                </div>
              );
            }
            if (item.type === 'realtime-product') {
              return (
                <div>
                  <RealtimeProductCard key={`realtime-product-${item.product_id}`} product={item} />
                  <ProductActions product={item} onVisualize={handleVisualize} onAnalyze={handleAnalyze} onCompare={handleCompare} imageUrl={item.product_main_image_url} />
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
      {selectedProductForVisualization && (
        <ProductVisualizationModal
          isOpen={isVisualizeModalOpen}
          onClose={() => setIsVisualizeModalOpen(false)}
          product={selectedProductForVisualization}
        />
      )}
      {isChatbotOpen && (
        <SearchPageChatbot
          isOpen={isChatbotOpen}
          setIsOpen={setIsChatbotOpen}
          productToAnalyze={selectedProductForAnalysis}
        />
      )}
    </motion.div>
  );
};

export default StoreList;
