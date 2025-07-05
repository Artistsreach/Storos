import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { generateSearchQuery, generateFilterTags } from '../lib/gemini';
import { useNavigate } from 'react-router-dom';

const tagColors = [
  '255, 99, 132', '54, 162, 235', '255, 206, 86', '75, 192, 192', '153, 102, 255', '255, 159, 64',
  '255, 99, 132', '54, 162, 235', '255, 206, 86', '75, 192, 192', '153, 102, 255', '255, 159, 64',
  '255, 99, 132', '54, 162, 235', '255, 206, 86', '75, 192, 192', '153, 102, 255', '255, 159, 64',
  '255, 99, 132', '54, 162, 235', '255, 206, 86', '75, 192, 192', '153, 102, 255'
];

const StoreList = ({ hideStoresOnEmptySearch = false, isDarkMode }) => {
  const navigate = useNavigate();
  const { stores, loadStores, isLoadingStores } = useStore();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
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
  const [filterTags, setFilterTags] = useState([]);
  const [selectedFilterTags, setSelectedFilterTags] = useState([]);
  const [isSticky, setIsSticky] = useState(false);
  const filterRef = useRef(null);

  const handleProductClick = (product, index) => {
    navigate('/product-detail', { state: { products: searchResults, product, index } });
  };

  const handleAmazonProductClick = (product) => {
    const index = amazonProducts.findIndex(p => p.asin === product.asin);
    navigate('/product-detail', { state: { products: amazonProducts, product, index } });
  };

  const handleAnalyze = (product) => {
    const productsForComparison = searchResults.filter(p => p.type === product.type).slice(0, 5);
    setSelectedProductForAnalysis({
      type: 'analyze',
      product,
      allProducts: productsForComparison,
    });
    setIsChatbotOpen(true);
  };

  const handleCompare = (product) => {
    const productsForComparison = searchResults.filter(p => p.type === product.type).slice(0, 5);
    setSelectedProductForAnalysis({
      type: 'analyze',
      product,
      allProducts: productsForComparison,
    });
    setIsChatbotOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (filterRef.current) {
        const { top } = filterRef.current.getBoundingClientRect();
        setIsSticky(top <= 64); // 64px is the height of the sticky header (top-16)
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
            'x-rapidapi-key': 'a8cebf173fmshd1fb289844b9188p176c3djsn446affbcccc1',
            'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data && data.data.products) {
        const products = data.data.products;
        const result = await generateFilterTags(products);
        if (result.tags) {
          setFilterTags(result.tags);
          const productsWithTags = products.map(p => ({
            ...p,
            type: 'amazon-product',
            tags: result.tags.filter(tag => p.product_title.toLowerCase().includes(tag.toLowerCase()))
          }));
          setAmazonProducts(productsWithTags);
        } else {
            setAmazonProducts(products.map(p => ({ ...p, type: 'amazon-product' })));
        }
      } else {
        setAmazonProducts([]);
        setAmazonError('No products found on Amazon');
      }
    } catch (err) {
      console.error('Error fetching Amazon products:', err);
      setAmazonError(null);
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
            'x-rapidapi-key': 'a8cebf173fmshd1fb289844b9188p176c3djsn446affbcccc1',
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
      setRealtimeError(null);
      setRealtimeProducts([]);
    } finally {
      setIsLoadingRealtime(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setAliExpressProducts([]);
      setAmazonProducts([]);
      setRealtimeProducts([]);
      return;
    }

    const result = await generateSearchQuery(query);
    const searchQuery = result.query || query;
    
    searchAliExpress(searchQuery);
    searchAmazon(searchQuery);
    searchRealtime(searchQuery);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (selectedFilterTags.length === 0) {
        setActiveSearchQuery(searchTerm);
      }
    }, 100); // 100ms debounce delay

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchTerm, selectedFilterTags]);

  useEffect(() => {
    handleSearch(activeSearchQuery);
  }, [activeSearchQuery]);



  const searchResults = useMemo(() => {
    if (!activeSearchQuery && selectedTags.length === 0 && selectedFilterTags.length === 0) {
      if (hideStoresOnEmptySearch) {
        return [];
      }
      return stores.map(s => ({ ...s, type: 'store' }));
    }

    const lowercasedSearchTerm = activeSearchQuery.toLowerCase();
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

    let combinedResults = [...uniqueResults, ...aliExpressProducts, ...amazonProducts, ...realtimeProducts];

    if (selectedFilterTags.length > 0) {
      combinedResults = combinedResults.filter(item => {
        if (item.type === 'amazon-product') {
          return selectedFilterTags.every(tag => item.tags?.includes(tag));
        }
        return true;
      });
    }

    return combinedResults;
  }, [stores, activeSearchQuery, selectedTags, user, aliExpressProducts, amazonProducts, realtimeProducts, selectedFilterTags]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleVisualize = (product) => {
    const imageUrl = product.imageUrl || product.product_photo || (product.image && product.image.src && product.image.src.medium) || (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) || product.image || product.product_main_image_url;
    const productWithImage = {
      ...product,
      imageUrl: imageUrl
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
        <div>
          <h2 className="text-3xl font-light tracking-tighter text-gray-800 dark:text-gray-200">
            What are you looking for?
          </h2>
          <p className="text-muted-foreground">Describe it and we’ll find it</p>
        </div>
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

      {filterTags.length > 0 && (
        <div ref={filterRef} className="sticky top-16 z-40 mb-6 transition-all duration-300">
          <ScrollArea className="w-full whitespace-nowrap bg-transparent">
            <motion.div
              className={`p-4 gap-2 ${isSticky ? 'flex' : 'grid grid-rows-3 grid-flow-col'}`}
              animate={{ height: isSticky ? 'auto' : 'auto' }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              {filterTags.map(tag => (
                <motion.div key={tag} layout>
                  <Button
                    variant={selectedFilterTags.includes(tag) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedFilterTags(prev => {
                        const isAdding = !prev.includes(tag);
                        if (isAdding) {
                          setActiveSearchQuery(tag);
                        } else {
                          setActiveSearchQuery(searchTerm);
                        }
                        return isAdding ? [...prev, tag] : prev.filter(t => t !== tag);
                      });
                    }}
                  >
                    {tag}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
            <ScrollBar orientation="horizontal" className="transparent-scrollbar" />
          </ScrollArea>
        </div>
      )}

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

      {!isLoadingStores && searchResults.length === 0 && searchTerm.trim() !== '' && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold">No results match your search</h3>
          <p className="text-muted-foreground mt-2">Try a different search term or filter.</p>
        </div>
      )}

      {!isLoadingStores && searchResults.length === 0 && searchTerm.trim() === '' && (
        <div className="text-center py-12">
          {isDarkMode ? (
            <img src="https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_6571.png?alt=media&token=e2d858c6-a1f2-48d6-a460-3777faeb940d" alt="Empty search" className="mx-auto w-2/3" />
          ) : (
            <img src="https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/image%203.png?alt=media&token=606ec60c-94c0-4702-b9f6-eea45f89091f" alt="Empty search" className="mx-auto w-2/3" />
          )}
        </div>
      )}


      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchResults.map((item, index) => {
            if (item.type === 'store') {
              return <StoreCard key={`store-${item.id}`} store={item} />;
            }
            if (item.type === 'product') {
              const store = stores.find(s => s.name === item.storeName);
              return (
                <div>
                  <ProductCard key={`product-${item.id}`} product={item} storeName={item.storeName} storeSlug={item.storeSlug} storeId={store?.id} />
                  <ProductActions product={item} onVisualize={() => handleVisualize(item)} onAnalyze={handleAnalyze} onCompare={handleCompare} />
                </div>
              );
            }
            if (item.type === 'ali-product') {
              return (
                <div onClick={() => handleProductClick(item, index)}>
                  <AliExpressProductCard key={`ali-product-${item.item.itemId}`} product={item} />
                  <ProductActions product={item} onVisualize={() => handleVisualize(item)} onAnalyze={handleAnalyze} onCompare={handleCompare} />
                </div>
              );
            }
            if (item.type === 'amazon-product') {
              return (
                <div onClick={() => handleAmazonProductClick(item)}>
                  <AmazonProductCard key={`amazon-product-${item.asin}`} product={item} />
                  <ProductActions product={item} onVisualize={() => handleVisualize(item)} onAnalyze={handleAnalyze} onCompare={handleCompare} />
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
                <div onClick={() => handleProductClick(item, index)}>
                  <RealtimeProductCard key={`realtime-product-${item.product_id}`} product={item} />
                  <ProductActions product={item} onVisualize={() => handleVisualize(item)} onAnalyze={handleAnalyze} onCompare={handleCompare} />
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
