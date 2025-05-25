
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
  console.log('[StorePreview] Component mounted.');

  const { storeId: identifier, productHandle: productHandleFromParams } = useParams(); // Renamed storeId to identifier
  console.log('[StorePreview] identifier from params:', identifier);
  const { getStoreById, getStoreBySlug, setCurrentStore, viewMode, isLoadingStores, user } = useStore(); // Added getStoreBySlug
  const { toast } = useToast();
  
  const [store, setStore] = useState(null);
  // Premium Template Components
  const [PHeader, setPHeader] = useState(null);
  const [PHero, setPHero] = useState(null);
  const [PFeaturedProducts, setPFeaturedProducts] = useState(null);
  const [PCategoryShowcase, setPCategoryShowcase] = useState(null);
  const [PSocialProof, setPSocialProof] = useState(null);
  const [PNewsletter, setPNewsletter] = useState(null);
  const [PFooter, setPFooter] = useState(null);

  // Sharp Template Components
  const [SharpHeader, setSharpHeader] = useState(null);
  const [SharpHero, setSharpHero] = useState(null);
  const [SharpFeatures, setSharpFeatures] = useState(null);
  const [SharpProductGrid, setSharpProductGrid] = useState(null);
  const [SharpTestimonials, setSharpTestimonials] = useState(null);
  const [SharpImageRightSection, setSharpImageRightSection] = useState(null);
  const [SharpVideoLeftSection, setSharpVideoLeftSection] = useState(null);
  const [SharpHeroFollowUpVideo, setSharpHeroFollowUpVideo] = useState(null);
  const [SharpNewsletter, setSharpNewsletter] = useState(null);
  const [SharpFooter, setSharpFooter] = useState(null);

  // Fresh Template (V6) Components
  const [FreshHeader, setFreshHeader] = useState(null);
  const [FreshHero, setFreshHero] = useState(null);
  const [FreshFeatures, setFreshFeatures] = useState(null);
  const [FreshProductGrid, setFreshProductGrid] = useState(null);
  const [FreshNewsletter, setFreshNewsletter] = useState(null);
  const [FreshFooter, setFreshFooter] = useState(null);
  // Add other Fresh components here as they are created

  // Sleek Template Components
  const [SleekHeader, setSleekHeader] = useState(null);
  const [SleekHero, setSleekHero] = useState(null);
  const [SleekProductGrid, setSleekProductGrid] = useState(null);
  const [SleekFeatures, setSleekFeatures] = useState(null);
  const [SleekTestimonials, setSleekTestimonials] = useState(null);
  const [SleekNewsletter, setSleekNewsletter] = useState(null);
  const [SleekFooter, setSleekFooter] = useState(null);
  const [SleekCollections, setSleekCollections] = useState(null); // Added

  // Component states for V1/V2 templates
  const [StoreHeader, setStoreHeader] = useState(null); 
  const [StoreHero, setStoreHero] = useState(null);
  const [StoreCollections, setStoreCollections] = useState(null);
  const [ProductGrid, setProductGrid] = useState(null);
  const [StoreFeatures, setStoreFeatures] = useState(null);
  const [StoreTestimonials, setStoreTestimonials] = useState(null);
  const [StoreNewsletter, setStoreNewsletter] = useState(null);
  const [StoreFooter, setStoreFooter] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [enteredPassKey, setEnteredPassKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingPassKey, setIsCheckingPassKey] = useState(false); // To show loading during check

  // Effect for loading store data and setting current store, and handling passkey auth
  useEffect(() => {
    console.log('[StorePreview] Main useEffect triggered. isLoadingStores:', isLoadingStores, 'identifier:', identifier);
    if (isLoadingStores && !store) { // Allow effect to run if store is already set (e.g. from previous fetch) but isLoadingStores flips
      console.log('[StorePreview] Still loading stores initial data, returning.');
      return;
    }

    const fetchStoreData = async () => {
      let storeData = null;
      // Try fetching by slug first, assuming it's a public published URL
      if (identifier) {
        console.log(`[StorePreview] Attempting to fetch store by slug: ${identifier}`);
        storeData = await getStoreBySlug(identifier);
      }

      // If not found by slug (or if identifier might be an ID), try by ID
      // This also handles the case where `identifier` is indeed an ID for preview purposes
      if (!storeData && identifier) {
        console.log(`[StorePreview] Not found by slug or identifier might be an ID. Attempting to fetch store by ID: ${identifier}`);
        // getStoreById is synchronous if stores are already loaded in context
        // However, if it needs to be async in future, this structure would need adjustment
        const storeById = getStoreById(identifier); 
        if (storeById) {
            // If fetching by ID, it could be an unpublished store.
            // The passkey logic below will apply.
            // If user is owner, they can see it. Otherwise, passkey applies if set.
            storeData = storeById;
        }
      }
      
      console.log('[StorePreview] storeData after attempting fetch by slug/ID:', storeData);

      if (storeData) {
        setStore(storeData); 
        setCurrentStore(storeData); 

        if (storeData.template_version === 'premium' && storeData.theme) {
          document.documentElement.style.setProperty('--premium-gradient-start-color', storeData.theme.primaryColor || '#667eea');
          document.documentElement.style.setProperty('--premium-gradient-end-color', storeData.theme.secondaryColor || '#764ba2');
        }

        if (!storeData.pass_key || (user && storeData.merchant_id === user.id) || storeData.status === 'published') {
          // Allow access if no passkey, or user is owner, or if store is published (slug access implies published)
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false); 
        }
      } else {
        if (!isLoadingStores) { // Only show toast if initial store loading is complete
          toast({
            title: 'Store Not Found',
            description: `Could not find store with identifier: ${identifier}`,
            variant: 'destructive',
          });
        }
      }
    };

    if (identifier) {
      fetchStoreData();
    } else {
       // Handle case where identifier is missing, though routes should prevent this
        toast({
            title: 'Error',
            description: 'No store identifier provided in URL.',
            variant: 'destructive',
        });
        setIsLoadingStores(false); // Ensure loading state is cleared
    }

  }, [identifier, getStoreById, getStoreBySlug, setCurrentStore, toast, isLoadingStores, user, store]); // Added store to dep array to re-evaluate auth if store data changes


  // Effect to update CSS variables when store theme changes (e.g., after edit)
  useEffect(() => {
    if (store && store.template_version === 'premium' && store.theme) {
      document.documentElement.style.setProperty('--premium-gradient-start-color', store.theme.primaryColor || '#667eea');
      document.documentElement.style.setProperty('--premium-gradient-end-color', store.theme.secondaryColor || '#764ba2');
    }
  }, [store?.theme?.primaryColor, store?.theme?.secondaryColor, store?.template_version]);


  // Effect for dynamically loading template components based on template_version
  useEffect(() => {
    if (store) { // Only run if store data is available
      const templateVersion = store.template_version || 'v1';

      // Reset all template component states initially
      setStoreHeader(null); setStoreHero(null); setStoreCollections(null); setProductGrid(null); setStoreFeatures(null); setStoreTestimonials(null); setStoreNewsletter(null); setStoreFooter(null);
      setPHeader(null); setPHero(null); setPFeaturedProducts(null); setPCategoryShowcase(null); setPSocialProof(null); setPNewsletter(null); setPFooter(null);
      setSharpHeader(null); setSharpHero(null); setSharpFeatures(null); setSharpProductGrid(null); setSharpTestimonials(null); setSharpImageRightSection(null); setSharpVideoLeftSection(null); setSharpHeroFollowUpVideo(null); setSharpNewsletter(null); setSharpFooter(null);
      setFreshHeader(null); setFreshHero(null); setFreshFeatures(null); setFreshProductGrid(null); setFreshNewsletter(null); setFreshFooter(null); // Reset Fresh components
      setSleekHeader(null); setSleekHero(null); setSleekProductGrid(null); setSleekFeatures(null); setSleekTestimonials(null); setSleekNewsletter(null); setSleekFooter(null); setSleekCollections(null); // Reset Sleek components

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
      } else if (templateVersion === 'premium') {
        // Import from the new structure
        setPHeader(() => lazy(() => import('@/components/store/premium/layout/Header.jsx')));
        setPHero(() => lazy(() => import('@/components/store/premium/sections/Hero.jsx')));
        setPFeaturedProducts(() => lazy(() => import('@/components/store/premium/sections/FeaturedProducts.jsx')));
        setPCategoryShowcase(() => lazy(() => import('@/components/store/premium/sections/CategoryShowcase.jsx')));
        setPSocialProof(() => lazy(() => import('@/components/store/premium/sections/SocialProof.jsx')));
        setPNewsletter(() => lazy(() => import('@/components/store/premium/sections/Newsletter.jsx')));
        setPFooter(() => lazy(() => import('@/components/store/premium/layout/Footer.jsx')));
      } else if (templateVersion === 'sharp') {
        setSharpHeader(() => lazy(() => import('@/components/store/sharp/layout/StoreHeader.jsx')));
        setSharpHero(() => lazy(() => import('@/components/store/sharp/sections/StoreHero.jsx')));
        setSharpFeatures(() => lazy(() => import('@/components/store/sharp/sections/StoreFeatures.jsx')));
        setSharpProductGrid(() => lazy(() => import('@/components/store/sharp/sections/ProductGrid.jsx')));
        setSharpTestimonials(() => lazy(() => import('@/components/store/sharp/sections/Testimonials.jsx')));
        setSharpImageRightSection(() => lazy(() => import('@/components/store/sharp/sections/ImageRightSection.jsx')));
        setSharpVideoLeftSection(() => lazy(() => import('@/components/store/sharp/sections/VideoLeftSection.jsx')));
        setSharpHeroFollowUpVideo(() => lazy(() => import('@/components/store/sharp/sections/HeroFollowUpVideo.jsx')));
        setSharpNewsletter(() => lazy(() => import('@/components/store/sharp/sections/Newsletter.jsx')));
        setSharpFooter(() => lazy(() => import('@/components/store/sharp/layout/Footer.jsx')));
      } else if (templateVersion === 'fresh') {
        setFreshHeader(() => lazy(() => import('@/components/store/fresh/layout/StoreHeader.jsx')));
        setFreshHero(() => lazy(() => import('@/components/store/fresh/sections/StoreHero.jsx')));
        setFreshFeatures(() => lazy(() => import('@/components/store/fresh/sections/StoreFeatures.jsx')));
        setFreshProductGrid(() => lazy(() => import('@/components/store/fresh/sections/ProductGrid.jsx')));
        setFreshNewsletter(() => lazy(() => import('@/components/store/fresh/sections/Newsletter.jsx')));
        setFreshFooter(() => lazy(() => import('@/components/store/fresh/layout/Footer.jsx')));
      } else if (templateVersion === 'sleek') {
        setSleekHeader(() => lazy(() => import('@/components/store/sleek/layout/StoreHeader.jsx')));
        setSleekHero(() => lazy(() => import('@/components/store/sleek/sections/StoreHero.jsx')));
        setSleekProductGrid(() => lazy(() => import('@/components/store/sleek/sections/ProductGrid.jsx')));
        setSleekFeatures(() => lazy(() => import('@/components/store/sleek/sections/StoreFeatures.jsx')));
        setSleekTestimonials(() => lazy(() => import('@/components/store/sleek/sections/Testimonials.jsx')));
        setSleekNewsletter(() => lazy(() => import('@/components/store/sleek/sections/Newsletter.jsx')));
        setSleekFooter(() => lazy(() => import('@/components/store/sleek/layout/Footer.jsx')));
        setSleekCollections(() => lazy(() => import('@/components/store/sleek/sections/StoreCollections.jsx')));
      }
    }
  }, [store?.template_version, identifier, store]); // Changed storeId to identifier

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
  // Loading check for template components
  if (templateVersion === 'v1' || templateVersion === 'v2') {
    if (!StoreHeader || !StoreHero || !StoreCollections || !ProductGrid || !StoreFeatures || !StoreTestimonials || !StoreNewsletter || !StoreFooter) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Template Components...</p>
          </div>
        </div>
      );
    }
  } else if (templateVersion === 'premium') {
    if (!PHeader || !PHero || !PFeaturedProducts || !PCategoryShowcase || !PSocialProof || !PNewsletter || !PFooter) {
       return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Premium Template Components...</p>
          </div>
        </div>
      );
    }
  } else if (templateVersion === 'sharp') {
    if (!SharpHeader || !SharpHero || !SharpHeroFollowUpVideo || !SharpFeatures || !SharpProductGrid || !SharpTestimonials || !SharpImageRightSection || !SharpVideoLeftSection || !SharpNewsletter || !SharpFooter) { 
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Sharp Template Components...</p>
          </div>
        </div>
      );
    }
  } else if (templateVersion === 'sleek') {
    if (!SleekHeader || !SleekHero || !SleekProductGrid || !SleekCollections || !SleekFeatures || !SleekTestimonials || !SleekNewsletter || !SleekFooter) { // Added SleekCollections
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Sleek Template Components...</p>
          </div>
        </div>
      );
    }
  }


  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Store Content...</div>}>
        {templateVersion === 'premium' ? (
          <>
            {PHeader && <PHeader store={store} isPublishedView={isPublished} />}
            {PHero && <PHero store={store} isPublishedView={isPublished} />}
            {PFeaturedProducts && <PFeaturedProducts store={store} isPublishedView={isPublished} />}
            {PCategoryShowcase && <PCategoryShowcase store={store} isPublishedView={isPublished} />}
            {PSocialProof && <PSocialProof store={store} isPublishedView={isPublished} />}
            {PNewsletter && <PNewsletter store={store} isPublishedView={isPublished} />}
            {PFooter && <PFooter store={store} isPublishedView={isPublished} />}
          </>
        ) : templateVersion === 'sharp' ? (
          <>
            {SharpHeader && <SharpHeader store={store} isPublishedView={isPublished} />}
            {SharpHero && <SharpHero store={store} isPublishedView={isPublished} />}
            {SharpHeroFollowUpVideo && <SharpHeroFollowUpVideo store={store} />} {/* Added new section */}
            {SharpFeatures && <SharpFeatures store={store} isPublishedView={isPublished} />}
            {SharpProductGrid && <SharpProductGrid store={store} isPublishedView={isPublished} />}
            {SharpImageRightSection && <SharpImageRightSection store={store} isPublishedView={isPublished} />}
            {SharpVideoLeftSection && <SharpVideoLeftSection store={store} isPublishedView={isPublished} />}
            {SharpTestimonials && <SharpTestimonials store={store} isPublishedView={isPublished} />}
            {SharpNewsletter && <SharpNewsletter store={store} />}
            {SharpFooter && <SharpFooter store={store} />}
          </>
        ) : templateVersion === 'fresh' ? (
          <>
            {FreshHeader && <FreshHeader store={store} isPublishedView={isPublished} />}
            {FreshHero && <FreshHero store={store} isPublishedView={isPublished} />}
            {FreshFeatures && <FreshFeatures store={store} isPublishedView={isPublished} />}
            {FreshProductGrid && <FreshProductGrid store={store} isPublishedView={isPublished} />}
            {FreshNewsletter && <FreshNewsletter store={store} />}
            {FreshFooter && <FreshFooter store={store} />}
          </>
        ) : templateVersion === 'sleek' ? (
          <>
            {SleekHeader && <SleekHeader store={store} isPublishedView={isPublished} />}
            {SleekHero && <SleekHero store={store} isPublishedView={isPublished} />}
            {SleekProductGrid && <SleekProductGrid store={store} isPublishedView={isPublished} />}
            {SleekCollections && <SleekCollections store={store} isPublishedView={isPublished} />}
            {SleekFeatures && <SleekFeatures store={store} isPublishedView={isPublished} />}
            {SleekTestimonials && <SleekTestimonials store={store} isPublishedView={isPublished} />}
            {SleekNewsletter && <SleekNewsletter store={store} isPublishedView={isPublished} />}
            {SleekFooter && <SleekFooter store={store} isPublishedView={isPublished} />}
          </>
        ) : (
          <>
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
            
            {/* Common sections for v1 and v2 (if not overridden by premium) */}
            {StoreTestimonials && <StoreTestimonials store={store} isPublishedView={isPublished} />}
            {StoreNewsletter && <StoreNewsletter store={store} isPublishedView={isPublished} />}
            {StoreFooter && <StoreFooter store={store} isPublishedView={isPublished} />}
          </>
        )}
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
