
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom'; // useSearchParams no longer needed for 'edit'
import { useStore } from '../contexts/StoreContext';
// import StoreHeader from '../components/store/StoreHeader';
// import StoreHero from '../components/store/StoreHero';
// import ProductGrid from '../components/store/ProductGrid';
// import StoreFeatures from '../components/store/StoreFeatures';
// import StoreNewsletter from '../components/store/StoreNewsletter';
// import StoreFooter from '../components/store/StoreFooter';
import PreviewControls from '../components/PreviewControls';
import EditStoreForm from '../components/EditStoreForm';
import { useToast } from '../components/ui/use-toast';
import RealtimeChatbot from '../components/store/RealtimeChatbot';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Lock, Unlock } from 'lucide-react';
import StoreWaySection from '../components/store/StoreWaySection.jsx';
import ModernStoreFeatures from '../components/store/modern/sections/StoreFeatures.jsx'; // Using modern as the base for now

const StorePreview = () => {
  console.log('[StorePreview] Component mounted.');

  const { storeName, productHandle: productHandleFromParams } = useParams(); // Get productHandle
  console.log('[StorePreview] storeName from params:', storeName);
  // Use updateStore from context instead of a separate updateStoreInContext
  // Assuming getStoreByName will be available in StoreContext
  const { getStoreByName, getStoreById, currentStore: contextCurrentStore, setCurrentStore, updateStore, viewMode, isLoadingStores, user } = useStore(); 
  const { toast } = useToast();
  
  const [store, setStore] = useState(null); // Local state for the store being previewed
  const [previewTemplateVersion, setPreviewTemplateVersion] = useState(null); // For manual template switching

  // Classic Template (formerly V1) Components - these will use the existing StoreHeader, StoreHero etc. states
  
  // Modern Template Components
  const [ModernHeader, setModernHeader] = useState(null);
  const [ModernHero, setModernHero] = useState(null);
  const [ModernFeatures, setModernFeatures] = useState(null);
  const [ModernCollections, setModernCollections] = useState(null);
  const [ModernProductGrid, setModernProductGrid] = useState(null);
  const [ModernFooter, setModernFooter] = useState(null);

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
  const [FreshStoreCollectionsComponent, setFreshStoreCollectionsComponent] = useState(null); // Renamed and will hold the new Fresh-specific collections component
  const [FreshTestimonials, setFreshTestimonials] = useState(null);
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
  const [SleekStoreWay, setSleekStoreWay] = useState(null);

  // Furniture Template Components
  const [FurnitureHeader, setFurnitureHeader] = useState(null);
  const [FurnitureHero, setFurnitureHero] = useState(null);
  const [FurnitureFeatures, setFurnitureFeatures] = useState(null);
  const [FurnitureProductGrid, setFurnitureProductGrid] = useState(null);
  const [FurnitureCollections, setFurnitureCollections] = useState(null);
  const [FurnitureTestimonials, setFurnitureTestimonials] = useState(null);
  const [FurnitureNewsletter, setFurnitureNewsletter] = useState(null);
  const [FurnitureFooter, setFurnitureFooter] = useState(null);

  // Generic sections like StoreWaySection
  const [StoreWay, setStoreWay] = useState(null);
  const [StoreFeaturesComponent, setStoreFeaturesComponent] = useState(null);

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

  // Effect to initialize and update the local 'store' state for preview
  useEffect(() => {
    console.log('[StorePreview] Sync effect triggered. isLoadingStores:', isLoadingStores, 'storeName (slug from URL):', storeName, 'contextCurrentStore ID:', contextCurrentStore?.id, 'contextCurrentStore slug:', contextCurrentStore?.urlSlug);
    
    let sourceStoreData = null;

    // Priority 1: If contextCurrentStore matches the slug from URL, use it.
    // This is the most reliable way to get the store immediately after creation.
    if (contextCurrentStore && storeName && contextCurrentStore.urlSlug === storeName) {
      sourceStoreData = contextCurrentStore;
      console.log('[StorePreview] Using contextCurrentStore for local preview state (slug match). ID:', sourceStoreData.id);
    } 
    // Priority 2: If not, and storeName (slug) is provided, try to find it in the stores list.
    else if (storeName && !isLoadingStores) {
      const fetchedStore = getStoreByName(storeName); // storeName is the slug
      if (fetchedStore) {
        sourceStoreData = fetchedStore;
        console.log('[StorePreview] Fetched store by name (slug) for local preview state:', fetchedStore.name, 'ID:', fetchedStore.id);
        // If context is stale or for a different store, update it.
        // This ensures contextCurrentStore is also up-to-date if we found it via getStoreByName.
        if (!contextCurrentStore || contextCurrentStore.id !== fetchedStore.id) {
          setCurrentStore(fetchedStore); 
          console.log('[StorePreview] Updated global currentStore with fetched data (found by slug in stores list).');
        }
      } else {
        console.log('[StorePreview] Store not found by getStoreByName for slug:', storeName, "and contextCurrentStore didn't match.");
        if (!isLoadingStores) { // Avoid toast if initial load is still happening
          toast({ title: 'Store Not Found', description: `Could not find store with slug: ${storeName}`, variant: 'destructive' });
        }
        setStore(null); // Explicitly clear local store
        setPreviewTemplateVersion(null); // Clear template version
        setIsAuthenticated(false); // Reset auth state
        return; // Exit if no store data
      }
    } 
    // Priority 3: If storeName is not in URL, but contextCurrentStore exists (e.g. navigating back or direct link to a generic preview page)
    // This case might be less relevant if storeName (slug) is always expected in the URL for specific store previews.
    // else if (!storeName && contextCurrentStore) {
    //   sourceStoreData = contextCurrentStore;
    //   console.log('[StorePreview] No storeName in URL, using existing contextCurrentStore for preview.');
    // }
    else {
      console.log('[StorePreview] Waiting for stores to load, or no storeName in URL, or contextCurrentStore does not match.');
      if (!isLoadingStores && !storeName) { // Only clear if no storeName and not loading
        setStore(null);
        setPreviewTemplateVersion(null);
        setIsAuthenticated(false);
      }
      // If storeName is present but isLoadingStores is true, or other conditions not met, just return and wait.
      return;
    }

    if (sourceStoreData) {
      // Default to 'classic' if no template_version is set, or if it's 'v1'
      let uiTemplateVersion = sourceStoreData.template_version || 'v1'; 
      if (uiTemplateVersion === 'v1') {
        uiTemplateVersion = 'classic'; // Map 'v1' from DB to 'classic' for UI
      }
      // Any other value (e.g., 'modern', 'premium') remains as is.
      // If a new store is created and template_version is null, it will default to 'classic'.
      // If the task implies new stores should default to 'modern', this initial value for `uiTemplateVersion` might need adjustment.
      // For now, sticking to 'v1' (old default) -> 'classic'.
      
      console.log(`[StorePreview] Setting local store state for preview. DB Template: ${sourceStoreData.template_version}, UI Template: ${uiTemplateVersion}, Store ID: ${sourceStoreData.id}`);
      
      const actualStoreUITemplate = sourceStoreData.template_version === 'v1' || !sourceStoreData.template_version 
                                   ? 'classic' 
                                   : sourceStoreData.template_version;

      // Update local store state
      setStore(sourceStoreData);

      // Initialize previewTemplateVersion if it's null (first load) or if the store ID has changed.
      // This ensures that navigating to a new store resets the preview to that store's actual template.
      // It avoids resetting if only content changes for the same store, preserving user's temporary preview choice.
      if (previewTemplateVersion === null || (store && store.id !== sourceStoreData.id)) {
        console.log(`[StorePreview] Sync effect: Initializing/Resetting previewTemplateVersion to DB version: ${actualStoreUITemplate}`);
        setPreviewTemplateVersion(actualStoreUITemplate);
      }
      // If the actual store template_version in the database changed (e.g. saved via EditStoreForm),
      // then we should update previewTemplateVersion to reflect that saved change.
      // Also, ensure that if we just loaded sourceStoreData, and it's different from the local 'store' state's ID,
      // we reset previewTemplateVersion to the new store's actual template.
      if (previewTemplateVersion === null || (store && store.id !== sourceStoreData.id) || (store && store.id === sourceStoreData.id && store.template_version !== sourceStoreData.template_version)) {
        console.log(`[StorePreview] Sync effect: Initializing/Resetting previewTemplateVersion to DB version: ${actualStoreUITemplate} for store ${sourceStoreData.id}`);
        setPreviewTemplateVersion(actualStoreUITemplate);
      }
      // Otherwise, if previewTemplateVersion is already set and store ID is same, user's temporary choice is kept.

      // Pass key authentication logic
      if (!sourceStoreData.pass_key || (user && sourceStoreData.merchant_id === user.id)) {
        setIsAuthenticated(true);
        console.log('[StorePreview] Authenticated (no passkey or user is owner).');
      } else {
        setIsAuthenticated(false);
        console.log('[StorePreview] Not authenticated (passkey required).');
      }
    } else {
      console.log('[StorePreview] No sourceStoreData available after checks, clearing local store.');
      setStore(null);
      setPreviewTemplateVersion(null);
      setIsAuthenticated(false);
      if (!isLoadingStores && storeName) { // Check storeName here
        toast({ title: 'Store Not Found', description: `Could not find store with slug: ${storeName}`, variant: 'destructive' });
      }
    }
  }, [storeName, getStoreByName, setCurrentStore, toast, isLoadingStores, user, contextCurrentStore]);


  // Effect to update CSS variables when store theme changes and handle sharp dark mode
  useEffect(() => {
    const templateForTheme = previewTemplateVersion || store?.template_version;
    const root = document.documentElement;

    if (store && store.theme) {
      // Set general theme colors as CSS variables
      if (store.theme.primaryColor) {
        root.style.setProperty('--theme-primary-color', store.theme.primaryColor);
      } else {
        root.style.removeProperty('--theme-primary-color');
      }
      if (store.theme.secondaryColor) {
        root.style.setProperty('--theme-secondary-color', store.theme.secondaryColor);
      } else {
        root.style.removeProperty('--theme-secondary-color');
      }

      // Specific handling for premium template gradients
      if (templateForTheme === 'premium') {
        root.style.setProperty('--premium-gradient-start-color', store.theme.primaryColor || '#667eea');
        root.style.setProperty('--premium-gradient-end-color', store.theme.secondaryColor || '#764ba2');
      } else {
        root.style.removeProperty('--premium-gradient-start-color');
        root.style.removeProperty('--premium-gradient-end-color');
      }
    } else {
      // Clear all theme variables if no store or theme
      root.style.removeProperty('--theme-primary-color');
      root.style.removeProperty('--theme-secondary-color');
      root.style.removeProperty('--premium-gradient-start-color');
      root.style.removeProperty('--premium-gradient-end-color');
    }

    // Force dark mode for sharp template
    let sharpWasDark = false;
    if (templateForTheme === 'sharp') {
      if (!root.classList.contains('dark')) {
        root.classList.add('dark');
        sharpWasDark = true; // Flag that this effect instance added 'dark'
      }
    }
    
    // Cleanup function
    return () => {
      // Only remove 'dark' if this specific effect instance for 'sharp' added it,
      // and the template is no longer 'sharp'. This avoids conflicts if another
      // mechanism (or another template) wants dark mode.
      // This cleanup is still imperfect if multiple instances of StorePreview could exist or
      // if global theme toggles are present. A more robust solution uses a global theme context.
      if (sharpWasDark && templateForTheme !== 'sharp' && root.classList.contains('dark')) {
        // Check if another component/template might still want dark mode.
        // For now, if sharp added it, and it's not sharp anymore, remove it.
        // This might need refinement based on how other templates manage dark mode.
        // A simple approach: if template is no longer sharp, remove dark class.
        // The new template's own useEffect (if it has one for theme) would then apply its preference.
      }
      // General cleanup of theme variables is implicitly handled by the next run of the effect
      // or if the component unmounts and these styles are no longer applied by this instance.
      // To be absolutely clean on unmount, one might remove them:
      // root.style.removeProperty('--theme-primary-color');
      // root.style.removeProperty('--theme-secondary-color');
      // etc. But this is often not necessary if the component is simply unmounted.
    };
  }, [store?.theme, store?.template_version, previewTemplateVersion]);


  // Effect for dynamically loading template components based on previewTemplateVersion
  useEffect(() => {
    if (store && previewTemplateVersion) { // Only run if store data and a preview template are available
      const templateVersionToLoad = previewTemplateVersion;
      console.log(`[StorePreview] Loading components for template: ${templateVersionToLoad}`);

      // Reset all template component states initially
      setStoreHeader(null); setStoreHero(null); setStoreCollections(null); setProductGrid(null); setStoreFeatures(null); setStoreTestimonials(null); setStoreNewsletter(null); setStoreFooter(null);
      setModernHeader(null); setModernHero(null); setModernFeatures(null); setModernCollections(null); setModernProductGrid(null); setModernFooter(null);
      setPHeader(null); setPHero(null); setPFeaturedProducts(null); setPCategoryShowcase(null); setPSocialProof(null); setPNewsletter(null); setPFooter(null);
      setSharpHeader(null); setSharpHero(null); setSharpFeatures(null); setSharpProductGrid(null); setSharpTestimonials(null); setSharpImageRightSection(null); setSharpVideoLeftSection(null); setSharpHeroFollowUpVideo(null); setSharpNewsletter(null); setSharpFooter(null);
      setFreshHeader(null); setFreshHero(null); setFreshFeatures(null); setFreshProductGrid(null); setFreshStoreCollectionsComponent(null); setFreshTestimonials(null); setFreshNewsletter(null); setFreshFooter(null);
      setSleekHeader(null); setSleekHero(null); setSleekProductGrid(null); setSleekFeatures(null); setSleekTestimonials(null); setSleekNewsletter(null); setSleekFooter(null); setSleekCollections(null); setSleekStoreWay(null);
      setFurnitureHeader(null); setFurnitureHero(null); setFurnitureFeatures(null); setFurnitureProductGrid(null); setFurnitureCollections(null); setFurnitureTestimonials(null); setFurnitureNewsletter(null); setFurnitureFooter(null);
      setStoreWay(null); 
      setStoreFeaturesComponent(null); // Reset StoreFeaturesComponent

      // Load StoreWaySection and StoreFeaturesComponent for all templates
      setStoreWay(() => StoreWaySection); 
      setStoreFeaturesComponent(() => ModernStoreFeatures); // Use the modern one for now for all templates

      if (templateVersionToLoad === 'classic') { 
        setStoreHeader(() => lazy(() => import('@/components/store/StoreHeader.jsx'))); 
        setStoreHero(() => lazy(() => import('@/components/store/StoreHero.jsx')));
        setStoreCollections(() => lazy(() => import('@/components/store/StoreCollections.jsx')));
        setProductGrid(() => lazy(() => import('@/components/store/ProductGrid.jsx')));
        setStoreFeatures(() => lazy(() => import('@/components/store/StoreFeatures.jsx')));
        setStoreTestimonials(() => lazy(() => import('@/components/store/StoreTestimonials.jsx')));
        setStoreNewsletter(() => lazy(() => import('@/components/store/StoreNewsletter.jsx')));
        setStoreFooter(() => lazy(() => import('@/components/store/StoreFooter.jsx')));
      } else if (templateVersionToLoad === 'modern') {
        setModernHeader(() => lazy(() => import('@/components/store/modern/layout/StoreHeader.jsx')));
        setModernHero(() => lazy(() => import('@/components/store/modern/sections/StoreHero.jsx')));
        setModernFeatures(() => lazy(() => import('@/components/store/modern/sections/StoreFeatures.jsx')));
        setModernCollections(() => lazy(() => import('@/components/store/modern/sections/StoreCollections.jsx')));
        setModernProductGrid(() => lazy(() => import('@/components/store/modern/sections/ProductGrid.jsx')));
        setModernFooter(() => lazy(() => import('@/components/store/modern/layout/Footer.jsx')));
      } else if (templateVersionToLoad === 'premium') {
        setPHeader(() => lazy(() => import('@/components/store/premium/layout/Header.jsx')));
        setPHero(() => lazy(() => import('@/components/store/premium/sections/Hero.jsx')));
        setPFeaturedProducts(() => lazy(() => import('@/components/store/premium/sections/FeaturedProducts.jsx')));
        setPCategoryShowcase(() => lazy(() => import('@/components/store/premium/sections/CategoryShowcase.jsx')));
        setPSocialProof(() => lazy(() => import('@/components/store/premium/sections/SocialProof.jsx')));
        setPNewsletter(() => lazy(() => import('@/components/store/premium/sections/Newsletter.jsx')));
        setPFooter(() => lazy(() => import('@/components/store/premium/layout/Footer.jsx')));
      } else if (templateVersionToLoad === 'sharp') {
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
      } else if (templateVersionToLoad === 'fresh') {
        setFreshHeader(() => lazy(() => import('@/components/store/fresh/layout/StoreHeader.jsx')));
        setFreshHero(() => lazy(() => import('@/components/store/fresh/sections/StoreHero.jsx')));
        setFreshFeatures(() => lazy(() => import('@/components/store/fresh/sections/StoreFeatures.jsx')));
        setFreshProductGrid(() => lazy(() => import('@/components/store/fresh/sections/ProductGrid.jsx')));
        setFreshStoreCollectionsComponent(() => lazy(() => import('@/components/store/fresh/sections/StoreCollections.jsx'))); // Use new Fresh-specific collections
        setFreshTestimonials(() => lazy(() => import('@/components/store/fresh/sections/Testimonials.jsx')));
        setFreshNewsletter(() => lazy(() => import('@/components/store/fresh/sections/Newsletter.jsx')));
        setFreshFooter(() => lazy(() => import('@/components/store/fresh/layout/Footer.jsx')));
      } else if (templateVersion极ToLoad === 'sleek') {
        setSleekHeader(() => lazy(() => import('@/components/store/sleek/layout/StoreHeader.jsx')));
        setSleekHero(() => lazy(() => import('@/components/store/sleek/sections/StoreHero.jsx')));
        setSleekProductGrid(() => lazy(() => import('@/components/store/sleek/sections/ProductGrid.jsx')));
        setSleekFeatures(() => lazy(() => import('@/components/store/sleek/sections/StoreFeatures.jsx')));
        setSleekTestimonials(() => lazy(() => import('@/components/store/sleek/sections/Testimonials.jsx')));
        setSleekNewsletter(() => lazy(() => import('@/components/store/sleek/sections/Newsletter.jsx')));
        setSleekFooter(() => lazy(() => import('@/components/store/sleek/layout/Footer.jsx')));
        setSleekCollections(() => lazy(() => import('@/components/store/sleek/sections/StoreCollections.jsx')));
        setSleekStoreWay(() => lazy(() => import('@/components/store/sleek/sections/StoreWaySection.jsx')));
      } else if (templateVersionToLoad === 'furniture') {
        setFurnitureHeader(() => lazy(() => import('@/components/store/furniture/layout/StoreHeader.jsx')));
        setFurnitureHero(() => lazy(() => import('@/components/store/furniture/sections/StoreHero.jsx')));
        setFurnitureFeatures(() => lazy(() => import('@/components/store/furniture/sections/StoreFeatures.jsx')));
        setFurnitureProductGrid(() => lazy(() => import('@/components/store/furniture/sections/ProductGrid.jsx')));
        setFurnitureCollections(() => lazy(() => import('@/components/store/furniture/sections/StoreCollections.jsx')));
        setFurnitureTestimonials(() => lazy(() => import('@/components/store/furniture/sections/Testimonials.jsx')));
        setFurnitureNewsletter(() => lazy(() => import('@/components/store/furniture/sections/Newsletter.jsx')));
        setFurnitureFooter(() => lazy(() => import('@/components/store/furniture/layout/Footer.jsx')));
      }
    }
  }, [store?.id, previewTemplateVersion]); // Depends on store.id and previewTemplateVersion

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
  
  // No separate "Store Not Found" return here, as it's covered by the loading state
  // or the toast + potential navigation in useEffect.
  // The redundant 'if (isLoadingStores || !store)' block has been removed.
  
  const isPublished = viewMode === 'published';
  // Use previewTemplateVersion for rendering logic
  // Default to 'classic' if store.template_version is 'v1' or null/undefined
  let templateVersionToRender = previewTemplateVersion;
  if (!templateVersionToRender) {
    templateVersionToRender = store?.template_version === 'v1' || !store?.template_version ? 'classic' : store.template_version;
  }
  console.log(`[StorePreview] Determined templateVersionToRender: ${templateVersionToRender}. (previewTemplateVersion: ${previewTemplateVersion}, store.template_version: ${store?.template_version})`);


  console.log(`[StorePreview] Rendering template: ${templateVersionToRender}. Store products: ${store?.products?.length || 0}, collections: ${store?.collections?.length || 0}`);

  // Loading state for template components based on templateVersionToRender
  if (templateVersionToRender === 'classic') { 
    if (!StoreHeader || !StoreHero || !StoreCollections || !ProductGrid || !StoreFeatures || !StoreTestimonials || !StoreNewsletter || !StoreFooter) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Classic Template Components...</p>
          </div>
        </div>
      );
    }
  } else if (templateVersionToRender === 'modern') {
    if (!ModernHeader || !ModernHero || !ModernFeatures || !ModernCollections || !ModernProductGrid || !ModernFooter) { 
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Modern Template Components...</p>
          </div>
        </div>
      );
    }
  } else if (templateVersionToRender === 'premium') {
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
  } else if (templateVersionToRender === 'sharp') {
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
  } else if (templateVersionToRender === 'sleek') {
    if (!SleekHeader || !SleekHero || !SleekProductGrid || !SleekCollections || !SleekFeatures || !SleekTestimonials || !SleekNewsletter || !SleekFooter) {
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
  // Add similar checks for 'fresh' if its components are mandatory for initial render
  else if (templateVersionToRender === 'fresh') {
    if (!FreshHeader || !FreshHero || !FreshFeatures || !FreshProductGrid || !FreshStoreCollectionsComponent || !FreshNewsletter || !FreshFooter) {
       return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Fresh Template Components...</p>
          </div>
        </div>
      );
    }
  }


  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Store Content...</div>}>
        {templateVersionToRender === 'classic' ? (
          <React.Fragment key="classic">
            {StoreHeader && <StoreHeader store={store} isPublishedView={isPublished} />}
            {StoreHero && <StoreHero store={store} isPublishedView={isPublished} />}
            {ProductGrid && <ProductGrid store={store} isPublishedView={isPublished} />}
            {StoreCollections && <StoreCollections store={store} isPublishedView={isPublished} />}
            {StoreFeaturesComponent && <StoreFeaturesComponent store={store} isPublishedView={isPublished} />}
            {StoreWay && <StoreWay store={store} isPublishedView={isPublished} />}
            {StoreTestimonials && <StoreTestimonials store={store} isPublishedView={isPublished} />}
            {StoreNewsletter && <StoreNewsletter store={store} isPublishedView={isPublished} />}
            {StoreFooter && <StoreFooter store={store} isPublishedView={isPublished} />}
          </React.Fragment>
        ) : templateVersionToRender === 'modern' ? (
          <React.Fragment key="modern">
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">
                {ModernHeader && <ModernHeader store={store} isPublishedView={isPublished} />}
                {ModernHero && <ModernHero store={store} isPublishedView={isPublished} />}
                {/* ModernFeatures is already specific to modern, so we use it directly if loaded, otherwise the generic one */}
                {ModernFeatures ? <ModernFeatures store={store} isPublishedView={isPublished} /> : (StoreFeaturesComponent && <StoreFeaturesComponent store={store} isPublishedView={isPublished} />)}
                {ModernProductGrid && <ModernProductGrid store={store} products={store?.products || []} isPublishedView={isPublished} />}
                {ModernCollections && <ModernCollections store={store} isPublishedView={isPublished} />}
                {StoreWay && <StoreWay store={store} isPublishedView={isPublished} />}
              </main>
              <footer className="mt-auto">
                {ModernFooter && <ModernFooter store={store} isPublishedView={isPublished} />}
              </footer>
            </div>
          </React.Fragment>
        ) : templateVersionToRender === 'premium' ? (
          <React.Fragment key="premium">
            {PHeader && <PHeader store={store} isPublishedView={isPublished} />}
            {PHero && <PHero store={store} isPublishedView={isPublished} />}
            {PFeaturedProducts && <PFeaturedProducts store={store} isPublishedView={isPublished} />}
            {PCategoryShowcase && <PCategoryShowcase store={store} isPublishedView={isPublished} />}
            {StoreFeaturesComponent && <StoreFeaturesComponent store={store} isPublishedView={isPublished} />}
            {StoreWay && <StoreWay store={store} isPublishedView={isPublished} />}
            {PSocialProof && <PSocialProof store={store} isPublishedView={isPublished} />}
            {PNewsletter && <PNewsletter store={store} isPublishedView={isPublished} />}
            {PFooter && <PFooter store={store} isPublishedView={isPublished} />}
          </React.Fragment>
        ) : templateVersionToRender === 'sharp' ? (
          <React.Fragment key="sharp">
            {SharpHeader && <SharpHeader store={store} isPublishedView={isPublished} />}
            {SharpHero && <SharpHero store={store} isPublishedView={isPublished} />}
            {SharpHeroFollowUpVideo && <SharpHeroFollowUpVideo store={store} />}
            {SharpProductGrid && <SharpProductGrid store={store} isPublishedView={isPublished} />}
            {/* SharpFeatures is loaded specifically, if not, use generic */}
            {SharpFeatures ? <SharpFeatures store={store} isPublishedView={isPublished} /> : (StoreFeaturesComponent && <StoreFeaturesComponent store={store} isPublishedView={isPublished} />)}
            {StoreWay && <StoreWay store={store} isPublishedView={isPublished} />}
            {SharpImageRightSection && <SharpImageRightSection store={store} isPublishedView={isPublished} />}
            {SharpVideoLeftSection && <SharpVideoLeftSection store={store} isPublishedView={isPublished} />}
            {SharpTestimonials && <SharpTestimonials store={store} isPublishedView={isPublished} />}
            {SharpNewsletter && <SharpNewsletter store={store} />}
            {SharpFooter && <SharpFooter store={store} />}
          </React.Fragment>
        ) : templateVersionToRender === 'fresh' ? (
          <React.Fragment key="fresh">
            {FreshHeader && <FreshHeader store={store} isPublishedView={isPublished} />}
            {FreshHero && <FreshHero store={store} isPublishedView={isPublished} />}
            {FreshProductGrid && <FreshProductGrid store={store} isPublishedView={isPublished} />} {/* This is "Our Products" */}
            {FreshStoreCollectionsComponent && <FreshStoreCollectionsComponent store={store} isPublishedView={isPublished} />} {/* This is "Shop by Collection" */}
            {/* FreshFeatures is loaded specifically, if not, use generic */}
            {FreshFeatures ? <FreshFeatures store={store} isPublishedView={isPublished} /> : (StoreFeaturesComponent && <StoreFeaturesComponent store={store} isPublishedView={isPublished} />)}
            {FreshTestimonials && <FreshTestimonials store={store} isPublishedView={isPublished} />}
            {StoreWay && <StoreWay store={store} isPublishedView={isPublished} />}
            {FreshNewsletter && <FreshNewsletter store={store} />}
            {FreshFooter && <FreshFooter store={store} />}
          </React.Fragment>
        ) : templateVersionToRender === 'sleek' ? (
          <React.Fragment key="sleek">
            {SleekHeader && <SleekHeader store={store} isPublishedView={isPublished} />}
            {SleekHero && <SleekHero store={store} isPublishedView={isPublished} />}
            {SleekProductGrid && <SleekProductGrid store={store} isPublishedView={isPublished} />}
            {SleekCollections && <SleekCollections store={store} isPublishedView={isPublished} />}
            {/* SleekFeatures is loaded specifically, if not, use generic */}
            {SleekFeatures ? <SleekFeatures store={store} isPublishedView={isPublished} /> : (StoreFeaturesComponent && <StoreFeaturesComponent store={store} isPublishedView={isPublished} />)}
            {SleekStoreWay ? <SleekStoreWay store={store} isPublishedView={isPublished} /> : (StoreWay && <StoreWay store={store} isPublishedView={isPublished} />)}
            {SleekTestimonials && <SleekTestimonials store={store} isPublishedView={isPublished} />}
            {SleekNewsletter && <SleekNewsletter store={store} isPublishedView={isPublished} />}
            {SleekFooter && <SleekFooter store={store} isPublishedView={isPublished} />}
          </React.Fragment>
        ) : null /* Fallback or default rendering if needed, though covered by 'classic' default */ }
      </Suspense>
      
      <PreviewControls
        store={store}
        onEdit={() => setIsEditOpen(true)}
        currentTemplate={previewTemplateVersion}
        onTemplateChange={setPreviewTemplateVersion} // Pass the setter
        availableTemplates={['classic', 'modern', 'premium', 'sharp', 'fresh', 'sleek']} // Updated available templates
      />
      
      {!isPublished && store && ( // Ensure store is not null before rendering EditStoreForm
        <EditStoreForm 
          store={store} 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen}
          // Pass a callback to update the store in StorePreview if template is changed via EditStoreForm
          onStoreUpdate={(updatedStoreData) => {
            setStore(prevStore => ({ ...prevStore, ...updatedStoreData }));
            if (updatedStoreData.template_version && updatedStoreData.template_version !== previewTemplateVersion) {
              setPreviewTemplateVersion(updatedStoreData.template_version); // Sync preview with actual if changed
            }
            // Also update in global context using the main updateStore function
            // This will handle local state, localStorage, and Supabase sync.
            if (store && store.id === updatedStoreData.id) { // Ensure we are updating the correct store
                updateStore(updatedStoreData.id, updatedStoreData); 
            } else if (contextCurrentStore && contextCurrentStore.id === updatedStoreData.id) {
                // Fallback if local store state is somehow out of sync but context has the ID
                updateStore(updatedStoreData.id, updatedStoreData);
            }
          }}
        />
      )}
      <RealtimeChatbot storeId={store?.id} /> {/* Pass storeId to RealtimeChatbot */}
    </div>
  );
};

export default StorePreview;
