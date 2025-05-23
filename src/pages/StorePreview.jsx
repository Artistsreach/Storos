
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom'; // useSearchParams no longer needed for 'edit'
import { useStore } from '@/contexts/StoreContext';
// import StoreHeader from '@/components/store/StoreHeader';
// import StoreHero from '@/components/store/StoreHero';
// import ProductGrid from '@/components/store/ProductGrid';
// import StoreFeatures from '@/components/store/StoreFeatures';
// import StoreNewsletter from '@/components/store/StoreNewsletter';
// import StoreFooter from '@/components/store/StoreFooter';
import PreviewControls from '@/components/PreviewControls';
import EditStoreForm from '@/components/EditStoreForm';
import { useToast } from '@/components/ui/use-toast';
import RealtimeChatbot from '@/components/store/RealtimeChatbot';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';

const StorePreview = () => {
  const { storeId, productHandle: productHandleFromParams } = useParams(); // Get productHandle
  const { getStoreById, setCurrentStore, viewMode, isLoadingStores, user } = useStore();
  const { toast } = useToast();
  
  const [store, setStore] = useState(null);
  const [StoreHeader, setStoreHeader] = useState(null);
  const [StoreHero, setStoreHero] = useState(null);
  const [StoreCollections, setStoreCollections] = useState(null); // Added for new component
  const [ProductGrid, setProductGrid] = useState(null);
  const [StoreFeatures, setStoreFeatures] = useState(null);
  const [StoreTestimonials, setStoreTestimonials] = useState(null); // Added for new component
  const [StoreNewsletter, setStoreNewsletter] = useState(null);
  const [StoreFooter, setStoreFooter] = useState(null);
  // const [AdvancedTemplateApp, setAdvancedTemplateApp] = useState(null); // REMOVED for V3
  // const [ProductDetailPageV3, setProductDetailPageV3] = useState(null); // REMOVED for V3
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [enteredPassKey, setEnteredPassKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingPassKey, setIsCheckingPassKey] = useState(false); // To show loading during check

  // Effect for loading store data and setting current store, and handling passkey auth
  useEffect(() => {
    if (isLoadingStores) return;

    const storeData = getStoreById(storeId);
    if (storeData) {
      setStore(storeData); // Local state for this page
      setCurrentStore(storeData); // Update global currentStore

      // Pass key authentication logic
      if (!storeData.pass_key || (user && storeData.merchant_id === user.id)) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false); // Requires pass key entry if pass_key exists and user is not owner
      }
    } else {
      // Only toast if not loading. If still loading, wait. If done loading and no store, then toast.
      if (!isLoadingStores) { 
        toast({
          title: 'Store Not Found',
          description: `Could not find store with ID: ${storeId}`,
          variant: 'destructive',
        });
      }
    }
  }, [storeId, getStoreById, setCurrentStore, toast, isLoadingStores, user]);

  // Effect for dynamically loading template components based on template_version
  useEffect(() => {
    if (store) { // Only run if store data is available
      const templateVersion = store.template_version || 'v1';

      // Reset all template component states initially before loading new ones
      // This ensures that if templateVersion changes, old components are cleared.
      setStoreHeader(null);
      setStoreHero(null);
      setStoreCollections(null);
      setProductGrid(null);
      setStoreFeatures(null);
      setStoreTestimonials(null);
      setStoreNewsletter(null);
      setStoreFooter(null);

      if (templateVersion === 'v1') {
        setStoreHeader(() => lazy(() => import('@/components/store/StoreHeader.jsx')));
        setStoreHero(() => lazy(() => import('@/components/store/StoreHero.jsx')));
        setStoreCollections(() => lazy(() => import('@/components/store/StoreCollections.jsx')));
        setProductGrid(() => lazy(() => import('@/components/store/ProductGrid.jsx')));
        setStoreFeatures(() => lazy(() => import('@/components/store/StoreFeatures.jsx')));
        setStoreTestimonials(() => lazy(() => import('@/components/store/StoreTestimonials.jsx')));
        setStoreNewsletter(() => lazy(() => import('@/components/store/StoreNewsletter.jsx')));
        setStoreFooter(() => lazy(() => import('@/components/store/StoreFooter.jsx')));
      } else if (templateVersion === 'v2') {
        setStoreHeader(() => lazy(() => import('@/components/store/template_v2/StoreHeader.jsx')));
        setStoreHero(() => lazy(() => import('@/components/store/template_v2/StoreHero.jsx')));
        setStoreCollections(() => lazy(() => import('@/components/store/template_v2/StoreCollections.jsx')));
        setProductGrid(() => lazy(() => import('@/components/store/template_v2/ProductGrid.jsx')));
        setStoreFeatures(() => lazy(() => import('@/components/store/template_v2/StoreFeatures.jsx')));
        setStoreTestimonials(() => lazy(() => import('@/components/store/StoreTestimonials.jsx')));
        setStoreNewsletter(() => lazy(() => import('@/components/store/template_v2/StoreNewsletter.jsx')));
        setStoreFooter(() => lazy(() => import('@/components/store/template_v2/StoreFooter.jsx')));
      }
      // productHandleFromParams is not directly used for template loading, so removed from this specific effect's deps
    }
  }, [store?.template_version, storeId, store]); // Depend on store object itself to get template_version, and storeId

  const handlePassKeySubmit = () => {
    if (!store || !store.pass_key) {
      setIsAuthenticated(true); // Should not happen if pass_key is required
      return;
    }
    setIsCheckingPassKey(true);
    // Simulate a check; in a real app, this might involve an API call if keys were hashed server-side
    // For now, direct comparison.
    setTimeout(() => { // Adding a small delay to simulate async check
      if (enteredPassKey === store.pass_key) {
        setIsAuthenticated(true);
        toast({ title: 'Access Granted', description: 'Welcome to the store!' });
      } else {
        toast({ title: 'Access Denied', description: 'Incorrect pass key.', variant: 'destructive' });
        setEnteredPassKey(''); // Clear the input
      }
      setIsCheckingPassKey(false);
    }, 500);
  };
  
  if (isLoadingStores) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    // This case is handled by the toast in useEffect, but good to have a fallback UI
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-destructive">Store not found.</p>
      </div>
    );
  }

  if (!isAuthenticated && store.pass_key) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="bg-card p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
          <Lock className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-card-foreground mb-3">Protected Store</h2>
          <p className="text-muted-foreground mb-8">
            This store requires a pass key to view its content.
          </p>
          <div className="flex flex-col gap-4">
            <Input
              type="password"
              placeholder="Enter Pass Key"
              value={enteredPassKey}
              onChange={(e) => setEnteredPassKey(e.target.value)}
              className="h-12 text-lg text-center bg-input border-border focus:ring-primary focus:border-primary"
              onKeyPress={(e) => e.key === 'Enter' && handlePassKeySubmit()}
            />
            <Button 
              onClick={handlePassKeySubmit} 
              disabled={isCheckingPassKey || !enteredPassKey.trim()}
              className="h-12 text-lg w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isCheckingPassKey ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              ) : (
                <>
                  <Unlock className="mr-2 h-5 w-5" /> Access Store
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // If authenticated or no pass_key was set for the store
  if (isLoadingStores || !store) { 
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading store...</p>
        </div>
      </div>
    );
  }
  
  // No separate "Store Not Found" return here, as it's covered by the loading state
  // or the toast + potential navigation in useEffect.
  
  const isPublished = viewMode === 'published';
  const templateVersion = store?.template_version || 'v1';

  // Loading state for template components
  // REMOVED V3 loading check
  // For v1 and v2
  if (!StoreHeader || !StoreHero || !StoreCollections || !ProductGrid || !StoreFeatures || !StoreTestimonials || !StoreNewsletter || !StoreFooter) { // Check new component
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Template Components...</p>
          </div>
        </div>
      );
    }
  // REMOVED V3 render logic

  // Fallback to v1/v2 rendering (now default rendering)
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Store Content...</div>}>
        {StoreHeader && <StoreHeader store={store} isPublishedView={isPublished} />}
        {StoreHero && <StoreHero store={store} isPublishedView={isPublished} />}
        
        {templateVersion === 'v1' && (
          <>
            {ProductGrid && <ProductGrid store={store} isPublishedView={isPublished} />}
            {StoreCollections && <StoreCollections store={store} isPublishedView={isPublished} />}
            {StoreFeatures && <StoreFeatures store={store} isPublishedView={isPublished} />}
          </>
        )}

        {templateVersion === 'v2' && (
          <>
            {StoreFeatures && <StoreFeatures store={store} isPublishedView={isPublished} />}
            {ProductGrid && <ProductGrid store={store} isPublishedView={isPublished} />}
            {StoreCollections && <StoreCollections store={store} isPublishedView={isPublished} />}
          </>
        )}
        
        {/* Common sections for both v1 and v2 */}
        {StoreTestimonials && <StoreTestimonials store={store} isPublishedView={isPublished} />}
        {StoreNewsletter && <StoreNewsletter store={store} isPublishedView={isPublished} />}
        {StoreFooter && <StoreFooter store={store} isPublishedView={isPublished} />}
      </Suspense>
      
      <PreviewControls 
        store={store} 
        onEdit={() => setIsEditOpen(true)} 
      />
      
      {!isPublished && ( 
        <EditStoreForm 
          store={store} 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen} 
        />
      )}
      <RealtimeChatbot /> {/* Added RealtimeChatbot component */}
    </div>
  );
  // The duplicated block that started with "// Fallback to v1/v2 rendering" has been removed.
};

export default StorePreview; // Consider renaming file to StorePage.jsx later
