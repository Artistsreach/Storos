
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { 
  generateStoreFromWizardData,
  generateStoreFromPromptData,
  // importShopifyStoreData, // Will be called by a new wizard finalization function
  mapShopifyDataToInternalStore, // Use the mapping function
  fetchShopifyStoreMetadata,
  fetchShopifyProductsList,
  fetchShopifyCollectionsList,
  fetchShopifyLocalizationInfo,
  generateAIProductsData,
  mapBigCommerceDataToInternalStore, 
} from '@/contexts/storeActions';
import { fetchPexelsImages, generateId } from '@/lib/utils';
import { generateLogoWithGemini } from '@/lib/geminiImageGeneration';
// Import BigCommerce API functions
import { fetchStoreSettings as fetchBCStoreSettings, fetchAllProducts as fetchBCAllProducts } from '@/lib/bigcommerce';


const StoreContext = createContext(null);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

const CART_STORAGE_KEY = 'ecommerce-cart';

export const StoreProvider = ({ children }) => {
  const [stores, setStores] = useState([]);
  const [currentStore, setCurrentStore] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [cart, setCart] = useState([]);
  // const [user, setUser] = useState(null); // User will come from useAuth
  const [viewMode, setViewModeState] = useState('published'); // 'published' or 'edit'
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, session, profile } = useAuth(); // Get user, session, and profile from AuthContext

  // Function to set view mode, could be enhanced with localStorage later
  const setViewMode = (mode) => {
    if (mode === 'published' || mode === 'edit') {
      setViewModeState(mode);
    } else {
      console.warn(`Invalid view mode: ${mode}. Defaulting to 'published'.`);
      setViewModeState('published');
    }
  };

  // Shopify Import Wizard State
  const [shopifyWizardStep, setShopifyWizardStep] = useState(0); // 0: idle, 1: connect, 2: preview meta, 3: preview items, 4: confirm
  const [shopifyDomain, setShopifyDomain] = useState(''); // Added back
  const [shopifyToken, setShopifyToken] = useState('');
  const [shopifyPreviewMetadata, setShopifyPreviewMetadata] = useState(null);
  const [shopifyPreviewProducts, setShopifyPreviewProducts] = useState({ edges: [], pageInfo: { hasNextPage: false, endCursor: null } });
  const [shopifyPreviewCollections, setShopifyPreviewCollections] = useState({ edges: [], pageInfo: { hasNextPage: false, endCursor: null } });
  const [shopifyLocalization, setShopifyLocalization] = useState(null);
  const [isFetchingShopifyPreviewData, setIsFetchingShopifyPreviewData] = useState(false);
  const [shopifyImportError, setShopifyImportError] = useState(null);
  const [generatedLogoImage, setGeneratedLogoImage] = useState(null); // Store base64 image data
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [logoGenerationError, setLogoGenerationError] = useState(null);

  // BigCommerce Import Wizard State
  const [bigCommerceWizardStep, setBigCommerceWizardStep] = useState(0);
  const [bigCommerceStoreDomain, setBigCommerceStoreDomain] = useState('');
  const [bigCommerceApiToken, setBigCommerceApiToken] = useState('');
  const [bigCommercePreviewSettings, setBigCommercePreviewSettings] = useState(null);
  const [bigCommercePreviewProducts, setBigCommercePreviewProducts] = useState({ items: [], pageInfo: { hasNextPage: false, endCursor: null } }); // items for BC
  const [isFetchingBigCommercePreviewData, setIsFetchingBigCommercePreviewData] = useState(false);
  const [bigCommerceImportError, setBigCommerceImportError] = useState(null);
  // Note: BigCommerce logo generation might be handled differently or use existing Shopify logo functions if applicable.

// Helper function to prepare store data for localStorage (strip/shorten large base64 images)
const prepareStoresForLocalStorage = (storesArray) => {
  if (!storesArray) return [];
  return storesArray.map(store => {
    const storeForLs = { ...store };

    // Simplify logo_url
    if (storeForLs.logo_url && storeForLs.logo_url.startsWith('data:image/') && storeForLs.logo_url.length > 2048) {
      storeForLs.logo_url = `${storeForLs.logo_url.substring(0, 30)}...[truncated]`;
    }

    // Simplify hero_image
    if (storeForLs.hero_image && storeForLs.hero_image.src) {
      const newHeroImageSrc = { ...storeForLs.hero_image.src };
      if (newHeroImageSrc.large && newHeroImageSrc.large.startsWith('data:image/') && newHeroImageSrc.large.length > 2048) {
        newHeroImageSrc.large = `${newHeroImageSrc.large.substring(0, 30)}...[truncated]`;
      }
      if (newHeroImageSrc.medium && newHeroImageSrc.medium.startsWith('data:image/') && newHeroImageSrc.medium.length > 2048) {
        newHeroImageSrc.medium = `${newHeroImageSrc.medium.substring(0, 30)}...[truncated]`;
      }
      storeForLs.hero_image = { ...storeForLs.hero_image, src: newHeroImageSrc };
    }

    // Simplify product images
    if (storeForLs.products && Array.isArray(storeForLs.products)) {
      storeForLs.products = storeForLs.products.map(product => {
        const productForLs = { ...product };
        if (productForLs.image && productForLs.image.src) {
          const newProductImageSrc = { ...productForLs.image.src };
          if (newProductImageSrc.medium && newProductImageSrc.medium.startsWith('data:image/') && newProductImageSrc.medium.length > 2048) {
            newProductImageSrc.medium = `${newProductImageSrc.medium.substring(0, 30)}...[truncated]`;
          }
          if (newProductImageSrc.large && newProductImageSrc.large.startsWith('data:image/') && newProductImageSrc.large.length > 2048) {
            newProductImageSrc.large = `${newProductImageSrc.large.substring(0, 30)}...[truncated]`;
          }
          productForLs.image = { ...productForLs.image, src: newProductImageSrc };
        }
        return productForLs;
      });
    }
    return storeForLs;
  });
};

  const loadStores = useCallback(async (userId) => {
    if (!userId) {
      setIsLoadingStores(false);
      setStores([]);
      return;
    }
    setIsLoadingStores(true);
    console.log(`[StoreContext] loadStores called for userId: ${userId}`);
    let fetchedStores = [];

    try {
      const { data: storesFromDb, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .eq('merchant_id', userId)
        .order('created_at', { ascending: false });

      if (storesError) {
        console.error('[StoreContext] Error loading stores from Supabase:', storesError);
        toast({ title: 'Cloud Sync Error', description: `Failed to load stores: ${storesError.message}. Checking local cache.`, variant: 'warning' });
        // Fallback to localStorage continues below
      }
      
      if (storesFromDb && !storesError) {
        console.log(`[StoreContext] Fetched ${storesFromDb.length} stores from DB. Processing details...`);
        const storesWithDetails = await Promise.all(
          storesFromDb.map(async (store) => {
            try {
              const { data: productsFromDb, error: productsError } = await supabase
                .from('platform_products')
                .select('*')
                .eq('store_id', store.id);

              if (productsError) {
                console.error(`[StoreContext] Error loading products for store ${store.id} (${store.name}):`, productsError.message);
                // Continue with empty products for this store or handle as critical error
              }
              const mappedProducts = productsFromDb ? productsFromDb.map(dbProduct => {
                let imageStructure = { src: { large: '', medium: '' } };
                if (dbProduct.images && Array.isArray(dbProduct.images) && dbProduct.images.length > 0) {
                  imageStructure.src.large = dbProduct.images[0];
                  imageStructure.src.medium = dbProduct.images[0];
                }
                return {
                  ...dbProduct,
                  price: dbProduct.priceAmount,
                  image: imageStructure,
                };
              }) : [];

              let mappedCollections = [];
              const { data: rawCollectionsFromDb, error: collectionsError } = await supabase
                .from('store_collections')
                .select('*')
                .eq('store_id', store.id);

              if (collectionsError) {
                console.error(`[StoreContext] Error loading collections for store ${store.id} (${store.name}):`, collectionsError.message);
              } else if (rawCollectionsFromDb && rawCollectionsFromDb.length > 0) {
                mappedCollections = await Promise.all(rawCollectionsFromDb.map(async (collection) => {
                  try {
                    const { data: productLinks, error: linksError } = await supabase
                      .from('collection_products')
                      .select('product_id')
                      .eq('collection_id', collection.id);

                    let collectionProducts = [];
                    if (linksError) {
                      console.error(`[StoreContext] Error loading product links for collection ${collection.id}:`, linksError.message);
                    } else if (productLinks && productLinks.length > 0) {
                      const productIdsForCollection = productLinks.map(link => link.product_id);
                      collectionProducts = mappedProducts.filter(p => productIdsForCollection.includes(p.id));
                    }
                    return { ...collection, products: collectionProducts };
                  } catch (collectionLinkError) {
                    console.error(`[StoreContext] Critical error processing product links for collection ${collection.id}:`, collectionLinkError);
                    return { ...collection, products: [] }; // Return collection with empty products on error
                  }
                }));
              }
              return { ...store, products: mappedProducts, collections: mappedCollections };
            } catch (storeDetailError) {
              console.error(`[StoreContext] Critical error processing details for store ${store.id}:`, storeDetailError);
              return { ...store, products: [], collections: [] }; // Return store with empty products/collections on error
            }
          })
        );
        fetchedStores = storesWithDetails;
        console.log(`[StoreContext] Finished processing details for ${fetchedStores.length} stores.`);
      } else if (storesError) { // If there was an error fetching initial stores list
        const savedStores = localStorage.getItem('ecommerce-stores');
        if (savedStores) {
          try {
            fetchedStores = JSON.parse(savedStores);
            console.log('[StoreContext] Loaded stores from localStorage as fallback due to DB error.');
          } catch (e) { 
            console.error('[StoreContext] Failed to parse localStorage stores after DB error:', e); 
            fetchedStores = [];
          }
        }
      } else { // No storesFromDb and no error (user has no stores)
        fetchedStores = [];
        console.log('[StoreContext] No stores found in DB for this user.');
      }
      
      // Save to localStorage regardless of source (DB or fallback) if fetchedStores has content
      if (fetchedStores.length > 0 || (storesFromDb && storesFromDb.length === 0)) { // Save even if DB returned empty (to clear old LS)
        try {
          localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(fetchedStores)));
          console.log('[StoreContext] Updated localStorage with fetched stores.');
        } catch (e) {
          console.error('[StoreContext] Failed to save stores to localStorage during cloud sync:', e);
          // Toasting here might be too noisy if it's a quota issue. Logged already.
        }
      }
    } catch (overallError) {
      console.error('[StoreContext] Overall critical error in loadStores:', overallError);
      toast({ title: 'Loading Error', description: 'A critical error occurred while loading store data.', variant: 'destructive' });
      // Attempt to load from localStorage as a last resort if everything else failed
      const savedStores = localStorage.getItem('ecommerce-stores');
      if (savedStores) {
        try {
          fetchedStores = JSON.parse(savedStores);
          console.log('[StoreContext] Loaded stores from localStorage as final fallback.');
        } catch (e) { 
          console.error('[StoreContext] Failed to parse localStorage stores during final fallback:', e); 
          fetchedStores = [];
        }
      } else {
        fetchedStores = []; // Ensure it's an array if no LS data either
      }
    } finally {
      setStores(fetchedStores);
      setIsLoadingStores(false);
      console.log(`[StoreContext] loadStores finished. isLoadingStores: false. Stores count: ${fetchedStores.length}`);
    }
  }, [toast, supabase]);

  useEffect(() => {
    // User state is now managed by AuthContext, so we listen to changes in `user` from `useAuth`
    if (user) {
      loadStores(user.id);
    } else {
      // For no user:
      const savedStores = localStorage.getItem('ecommerce-stores');
      if (savedStores) {
        try {
          const parsedStores = JSON.parse(savedStores);
          setStores(parsedStores);
        } catch (e) {
          console.error('Failed to parse localStorage stores:', e);
          setStores([]); // Ensure stores is an array even on error
        }
      } else {
        setStores([]); // No saved stores
      }
      setIsLoadingStores(false); // Set to false AFTER attempting to load/set from LS
    }
  }, [user, loadStores]); // Depend on user from useAuth and loadStores


  useEffect(() => {
    // Persist cart to localStorage
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    // Load cart from localStorage on initial mount
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse stored cart:', error);
      }
    }
  }, []);

  const commonStoreCreation = async (storeData) => {
    let storeToCreate = { ...storeData }; // storeData comes from generateStoreFromWizardData or similar
    
    // Ensure template_version defaults to 'v1' (Classic) if not already set
    if (!storeToCreate.template_version) {
      storeToCreate.template_version = 'v1';
    }

    let newStoreInDb;
    // Initialize variables that will be populated differently based on user login status
    let finalProductsForStoreObject = [];
    const productDbIdMap = new Map();
    let insertedDbCollections = []; // To store collections data, potentially with DB IDs

    if (user) {
      // Ensure merchant_id is set for DB insertion, using the user's ID from AuthContext
      const { id: clientGeneratedId, settings, products, collections, user_id, ...restOfStoreData } = storeToCreate; // Remove user_id, extract collections
      const dataToInsert = { ...restOfStoreData, merchant_id: user.id }; 
      
      const { data, error } = await supabase
        .from('stores')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating store in Supabase:', error);
        toast({ title: 'Store Creation Failed', description: error.message, variant: 'destructive' });
        return null;
      }
      newStoreInDb = data;

      // Handle products
      // finalProductsForStoreObject is already declared []
      // productDbIdMap is already declared new Map()

      if (newStoreInDb && products && products.length > 0) {
        console.log(`Store ${newStoreInDb.id} created. Processing ${products.length} products.`);
        const isStripeConnected = profile?.stripe_account_id && profile?.stripe_account_details_submitted;
        
        if (isStripeConnected) {
          toast({ title: "Creating Products on Stripe...", description: "This may take a moment.", duration: 5000 });
        }

        for (const wizardProduct of products) { // 'products' here is from storeToCreate (wizardData)
          const originalWizardProductId = wizardProduct.id || wizardProduct.name; // Use name as fallback original ID if .id is not set in wizard
          try {
            const productPayload = {
              store_id: newStoreInDb.id,
              name: wizardProduct.name || `Product ${generateId().substring(0, 8)}`,
              description: wizardProduct.description || "No description available.",
              images: wizardProduct.image?.src?.large ? [wizardProduct.image.src.large] : (wizardProduct.image?.src?.medium ? [wizardProduct.image.src.medium] : []),
              priceAmount: Number(wizardProduct.price) >= 0 ? Number(wizardProduct.price) : 0,
              currency: 'usd', // Assuming USD, this could be dynamic
            };
            const response = await supabase.functions.invoke('create-stripe-product', { body: productPayload });
            if (response.error) throw new Error(response.error.message);
            
            const dbProductData = response.data; // Assume response.data is the product object from DB or includes its ID
            if (dbProductData && dbProductData.id) { // CRUCIAL: Edge Function must return the product ID from platform_products
              productDbIdMap.set(originalWizardProductId, dbProductData.id);
              finalProductsForStoreObject.push({ ...wizardProduct, id: dbProductData.id }); // Update product with real DB ID
            } else {
              finalProductsForStoreObject.push(wizardProduct); // Keep original if DB ID not returned
              console.warn(`Product "${wizardProduct.name}" processed, but DB ID not retrieved/mapped from Edge Function response.`);
            }
          } catch (productError) {
            console.error(`Failed to process product "${wizardProduct.name}" for store ${newStoreInDb.id}:`, productError);
            toast({ title: `Product Processing Error`, description: `Failed to process product "${wizardProduct.name}": ${productError.message}`, variant: 'destructive', duration: 7000 });
            finalProductsForStoreObject.push(wizardProduct); // Add original product even on error to maintain structure if needed
          }
        }
        // Update the products array in storeToCreate to have the correct DB IDs for subsequent operations if needed
        storeToCreate.products = finalProductsForStoreObject; 
      }

      // Handle collections
      // insertedDbCollections is already declared []
      if (newStoreInDb && collections && collections.length > 0) { // 'collections' is from storeToCreate (wizardData)
        console.log(`Processing ${collections.length} collections for store ${newStoreInDb.id}.`);
        
        const collectionsToInsertInDb = collections.map(coll => ({
          store_id: newStoreInDb.id,
          name: coll.name,
          description: coll.description,
          image_url: coll.imageUrl,
        }));

        const { data: dbInsertedCollections, error: collectionsError } = await supabase
          .from('store_collections')
          .insert(collectionsToInsertInDb)
          .select(); // Important to get the IDs of inserted collections
        
        insertedDbCollections = dbInsertedCollections || []; // Assign to the higher-scoped variable

        if (collectionsError) {
          console.error('Error saving collections to Supabase:', collectionsError);
          toast({ title: 'Collections Save Failed', description: collectionsError.message, variant: 'warning' });
        } else if (insertedDbCollections && insertedDbCollections.length > 0) {
          console.log(`${insertedDbCollections.length} collections saved successfully for store ${newStoreInDb.id}.`);
          
          const productLinksToInsert = [];
          insertedDbCollections.forEach((dbCollection, index) => {
            // Assuming the order of insertedDbCollections matches the original 'collections' array from wizardData
            const originalWizardCollection = collections[index]; 
            if (originalWizardCollection && originalWizardCollection.product_ids && originalWizardCollection.product_ids.length > 0) {
              originalWizardCollection.product_ids.forEach(wizardProductId => {
                const actualDbProductId = productDbIdMap.get(wizardProductId); // Get DB UUID from our map
                if (actualDbProductId) {
                  productLinksToInsert.push({
                    collection_id: dbCollection.id, // Use the ID from the newly inserted collection
                    product_id: actualDbProductId 
                  });
                } else {
                  console.warn(`Could not find DB ID for wizard product ID: ${wizardProductId} in collection ${dbCollection.name}. Skipping link.`);
                }
              });
            }
          });

          if (productLinksToInsert.length > 0) {
            const { error: productLinksError } = await supabase
              .from('collection_products')
              .insert(productLinksToInsert);
            
            if (productLinksError) {
              console.error('Error saving product-collection links to Supabase:', productLinksError);
              toast({ title: 'Product Linking Failed', description: productLinksError.message, variant: 'warning' });
            } else {
              console.log(`${productLinksToInsert.length} product-collection links saved.`);
            }
          }
        }
      }
    } else {
      // No user, create store locally only
      newStoreInDb = { 
        ...storeToCreate, 
        id: storeToCreate.id || generateId(), 
        createdAt: new Date().toISOString() 
      }; 
      toast({ title: 'Store Created Locally', description: 'Store created locally. Log in to save to the cloud.' });
      // Populate finalProductsForStoreObject and productDbIdMap for local stores
      finalProductsForStoreObject = storeToCreate.products || [];
      (finalProductsForStoreObject).forEach(p => {
        const originalId = p.id || p.name; // Use name as fallback if id is not on wizard product
        productDbIdMap.set(originalId, p.id); // Map original ID to its ID in finalProductsForStoreObject
      });
      insertedDbCollections = storeToCreate.collections || []; // Use original collections for local
    } // Correct end of the else block
    
    // Hydration logic - now finalProductsForStoreObject, productDbIdMap, and insertedDbCollections are always defined.
    let hydratedCollections = [];
    const sourceCollections = storeToCreate.collections || [];
    // sourceProducts is now consistently finalProductsForStoreObject
    const sourceProducts = finalProductsForStoreObject; 

    if (sourceCollections.length > 0) {
      hydratedCollections = sourceCollections.map((wizardOrAiCollection) => {
        let dbEquivalentCollectionData = {}; // Holds data from DB if collection was saved (e.g., DB ID)
        if (user && insertedDbCollections && insertedDbCollections.length > 0) {
            // Find the DB version of this collection by name (assuming names are unique for this creation batch)
            const foundDbColl = insertedDbCollections.find(dbc => dbc.name === wizardOrAiCollection.name);
            if (foundDbColl) {
                dbEquivalentCollectionData = foundDbColl;
            }
        }
        
        let populatedProductsForThisCollection = [];
        if (wizardOrAiCollection.product_ids && wizardOrAiCollection.product_ids.length > 0) {
          wizardOrAiCollection.product_ids.forEach(originalProductId => {
            const dbId = productDbIdMap.get(originalProductId); // Attempt to get DB ID
            let productToLink = null;

            if (dbId) { // A DB ID was mapped for this original product ID
              productToLink = sourceProducts.find(p => p.id === dbId);
              if (!productToLink) {
                // This case implies the product was expected to have a DB ID but wasn't found in sourceProducts with that DB ID.
                // This could happen if finalProductsForStoreObject wasn't updated correctly after DB operations.
                // As a fallback, try finding by original ID if it's different from dbId.
                console.warn(`[commonStoreCreation] Hydration: Product with DB ID ${dbId} (original: ${originalProductId}) not found in sourceProducts. Attempting fallback to original ID.`);
                if (originalProductId !== dbId) {
                    productToLink = sourceProducts.find(p => p.id === originalProductId);
                }
              }
            } else { // No DB ID was mapped, so the product ID in sourceProducts should be the original ID.
              productToLink = sourceProducts.find(p => p.id === originalProductId);
            }

            if (productToLink) {
              populatedProductsForThisCollection.push(productToLink);
            } else {
              console.warn(`[commonStoreCreation] Hydration: Product with original ID ${originalProductId} (attempted DB ID: ${dbId || 'N/A'}) not found in sourceProducts for collection ${wizardOrAiCollection.name}. Skipping link.`);
            }
          });
        }
        return { 
          ...wizardOrAiCollection, // Start with original data (name, desc, image, original product_ids)
          ...dbEquivalentCollectionData, // Override with DB data if available (like DB collection ID)
          products: populatedProductsForThisCollection, // This is the hydrated array of product objects
        };
      });
    }
    
    const storeReadyForDisplay = {
      ...storeToCreate, 
      products: sourceProducts, 
      collections: hydratedCollections, // Use the newly hydrated collections
    };

    // Merge DB store data (like DB store ID, merchant_id) with the display-ready store data
    const displayStore = { ...newStoreInDb, ...storeReadyForDisplay };

    setStores(prevStores => {
        const newStoresList = [displayStore, ...prevStores.filter(s => s.id !== displayStore.id)];
        try {
          localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(newStoresList)));
        } catch (e) {
          console.error('Failed to save stores to localStorage during store creation:', e);
          toast({
            title: 'Local Cache Update Failed',
            description: 'Could not update the local cache after creating the store.',
            variant: 'warning',
            duration: 7000,
          });
        }
        return newStoresList;
    });
    setCurrentStore(displayStore);
    
    toast({ title: 'Store Created!', description: `Store "${displayStore.name}" has been created.` });
    navigate(`/store/${displayStore.id}`);
    return displayStore; // Return the store object that includes products for UI
  };
  
  const generateStoreFromWizard = async (wizardData) => {
    setIsGenerating(true);
    try {
      const newStoreData = await generateStoreFromWizardData(wizardData, { fetchPexelsImages, generateId });
      return await commonStoreCreation(newStoreData);
    } catch (error) {
      console.error('Error generating store from wizard:', error);
      toast({ title: 'Wizard Generation Failed', description: error.message || 'Failed to generate store.', variant: 'destructive' });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStore = async (prompt, storeNameOverride = null, productTypeOverride = null) => {
    setIsGenerating(true);
    try {
      const newStoreData = await generateStoreFromPromptData(prompt, { storeNameOverride, productTypeOverride, fetchPexelsImages, generateId });
      return await commonStoreCreation(newStoreData);
    } catch (error) {
      console.error('Error generating store from prompt:', error);
      toast({ title: 'Generation Failed', description: error.message || 'Failed to generate store.', variant: 'destructive' });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // const importShopifyStore = async (domain, token) => { // This will be replaced by wizard functions
  //   setIsGenerating(true);
  //   try {
  //     // Old direct import logic - to be removed or adapted for final step of wizard
  //     // const newStoreData = await importShopifyStoreData(domain, token, { fetchPexelsImages, generateId });
  //     // return await commonStoreCreation(newStoreData);
  //   } catch (error) {
  //     console.error('Error importing Shopify store:', error);
  //     toast({ title: 'Import Failed', description: error.message || 'Failed to import Shopify store.', variant: 'destructive' });
  //     return false;
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // };

  const resetShopifyWizardState = () => {
    setShopifyWizardStep(0);
    setShopifyDomain('');
    setShopifyToken('');
    setShopifyPreviewMetadata(null);
    setShopifyPreviewProducts({ edges: [], pageInfo: { hasNextPage: false, endCursor: null } });
    setShopifyPreviewCollections({ edges: [], pageInfo: { hasNextPage: false, endCursor: null } });
    setShopifyLocalization(null);
    setIsFetchingShopifyPreviewData(false);
    setShopifyImportError(null);
    setGeneratedLogoImage(null);
    setIsGeneratingLogo(false);
    setLogoGenerationError(null);
  };

  const startShopifyImportWizard = async (domain, token) => {
    setIsGenerating(true); // Use isGenerating for the whole direct import process
    setShopifyImportError(null);
    // We don't need to set shopifyDomain, shopifyToken in context state if bypassing wizard steps
    
    try {
      toast({ title: "Importing Shopify Store...", description: "Fetching data and creating your store. This may take a moment." });

      // 1. Fetch metadata
      const metadata = await fetchShopifyStoreMetadata(domain, token);
      if (!metadata) throw new Error("Failed to fetch Shopify store metadata.");

      // 2. Fetch products (e.g., first 50)
      const productsData = await fetchShopifyProductsList(domain, token, 50);
      const productNodes = productsData.edges.map(e => e.node);

      // 3. Fetch collections (e.g., first 20)
      const collectionsData = await fetchShopifyCollectionsList(domain, token, 20);
      const collectionNodes = collectionsData.edges.map(e => e.node);

      // 4. (Optional) Fetch localization - can be skipped for faster direct import
      // const localization = await fetchShopifyLocalizationInfo(domain, token);

      // 5. Map data (logo will be Shopify's or placeholder, no AI generation in direct flow)
      const newStoreData = mapShopifyDataToInternalStore(
        metadata,
        productNodes,
        collectionNodes,
        domain, // domain is the original domain string
        { generateId },
        null // No pre-generated AI logo in this direct flow
      );
      
      // 6. Create store and navigate (commonStoreCreation handles navigation)
      const finalStore = await commonStoreCreation(newStoreData);
      
      if (finalStore) {
    resetShopifyWizardState(); 
    setIsGenerating(false);
    return true; 
  } else {
    throw new Error("Store creation failed after fetching Shopify data.");
  }
} catch (error) {
  console.error('Error during direct Shopify import:', error);
  setShopifyImportError(error.message || 'Failed to import Shopify store directly.');
  toast({ title: 'Shopify Import Failed', description: error.message || 'Could not complete the import.', variant: 'destructive' });
  setIsGenerating(false);
  resetShopifyWizardState(); 
  return false; 
}
};

// BigCommerce Wizard Functions
const resetBigCommerceWizardState = () => {
  setBigCommerceWizardStep(0);
  setBigCommerceStoreDomain('');
  setBigCommerceApiToken('');
  setBigCommercePreviewSettings(null);
  setBigCommercePreviewProducts({ items: [], pageInfo: { hasNextPage: false, endCursor: null } });
  setIsFetchingBigCommercePreviewData(false);
  setBigCommerceImportError(null);
  // Reset any BigCommerce specific logo state if added
};

const startBigCommerceImportWizard = async (domain, token) => {
  // This function is called after BigCommerceConnectForm succeeds.
  // It should set credentials and move to the next step (metadata preview).
  setBigCommerceStoreDomain(domain);
  setBigCommerceApiToken(token);
  setBigCommerceWizardStep(2); // Move to metadata preview step
  // Optionally, immediately fetch settings for preview
  await fetchBigCommerceWizardSettings(domain, token);
};

const fetchBigCommerceWizardSettings = async (domain, token) => {
  const currentDomain = domain || bigCommerceStoreDomain;
  const currentToken = token || bigCommerceApiToken;
  if (!currentDomain || !currentToken) {
    setBigCommerceImportError('Domain or token missing for fetching BigCommerce settings.');
    return;
  }
  setIsFetchingBigCommercePreviewData(true);
  setBigCommerceImportError(null);
  try {
    const settings = await fetchBCStoreSettings(currentDomain, currentToken);
    setBigCommercePreviewSettings(settings);
  } catch (error) {
    console.error('Error fetching BigCommerce settings for wizard:', error);
    setBigCommerceImportError(error.message || 'Failed to fetch store settings.');
    toast({ title: 'BigCommerce Settings Fetch Failed', description: error.message, variant: 'destructive' });
  } finally {
    setIsFetchingBigCommercePreviewData(false);
  }
};

const fetchBigCommerceWizardProducts = async (count = 10) => { // BC API uses 'first' not cursor for initial, pagination is different
  if (!bigCommerceStoreDomain || !bigCommerceApiToken) {
    setBigCommerceImportError('Domain or token missing for fetching BigCommerce products.');
    return;
  }
  setIsFetchingBigCommercePreviewData(true);
  setBigCommerceImportError(null);
  try {
    // fetchBCAllProducts handles pagination internally. For preview, we might just want the first few.
    // For simplicity in preview, let's fetch all and then slice, or modify fetchBCAllProducts to take a limit for preview.
    // For now, let's assume we fetch a limited set or all and slice in component.
    // The guide's fetchAllProducts fetches ALL. We might need a separate preview function or adapt.
    // Let's simulate fetching a small batch for preview for now.
    // This is a simplified version for preview. The real fetchAllProducts gets everything.
    const query = `
      query ProductsPreview($first: Int!) {
        site {
          products(first: $first) {
            edges {
              node {
                entityId name sku defaultImage { url(width: 200) altText }
                prices { price { value currencyCode } }
              }
            }
          }
        }
      }
    `;
    const variables = { first: count };
    const res = await fetch(`https://${bigCommerceStoreDomain}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bigCommerceApiToken}` },
      body: JSON.stringify({ query, variables }),
    });
    const result = await res.json();
    if (result.errors) throw new Error(result.errors.map(e => e.message).join(', '));
    
    setBigCommercePreviewProducts({
      items: result.data.site.products.edges.map(e => e.node),
      // pageInfo might not be relevant if we only fetch a small batch for preview
      pageInfo: { hasNextPage: false, endCursor: null } 
    });

  } catch (error) {
    console.error('Error fetching BigCommerce products for wizard:', error);
    setBigCommerceImportError(error.message || 'Failed to fetch products.');
    toast({ title: 'BigCommerce Product Fetch Failed', description: error.message, variant: 'destructive' });
  } finally {
    setIsFetchingBigCommercePreviewData(false);
  }
};

const finalizeBigCommerceImportFromWizard = async () => {
  if (!bigCommercePreviewSettings || !bigCommerceStoreDomain || !bigCommerceApiToken) {
    toast({ title: 'Import Error', description: 'Missing BigCommerce data to finalize import.', variant: 'destructive' });
    return false;
  }
  setIsGenerating(true);
  setBigCommerceImportError(null);
  try {
    // Fetch all products for the final import
    const allProducts = await fetchBCAllProducts(bigCommerceStoreDomain, bigCommerceApiToken);

    const newStoreData = mapBigCommerceDataToInternalStore(
      bigCommercePreviewSettings,
      allProducts, // Use all fetched products
      bigCommerceStoreDomain,
      { generateId },
      null // No AI-generated logo for BigCommerce import for now, uses store's own.
    );
    
    const finalStore = await commonStoreCreation(newStoreData);
    if (finalStore) {
      resetBigCommerceWizardState();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error finalizing BigCommerce import from wizard:', error);
    setBigCommerceImportError(error.message || 'Failed to finalize BigCommerce import.');
    toast({ title: 'BigCommerce Import Failed', description: error.message, variant: 'destructive' });
    return false;
  } finally {
    setIsGenerating(false);
  }
};

  const fetchShopifyWizardProducts = async (first = 10, cursor = null) => {
    if (!shopifyDomain || !shopifyToken) {
      setShopifyImportError('Domain or token missing for fetching products.');
      return;
    }
    setIsFetchingShopifyPreviewData(true);
    setShopifyImportError(null);
    try {
      const productsData = await fetchShopifyProductsList(shopifyDomain, shopifyToken, first, cursor);
      setShopifyPreviewProducts(prev => ({
        edges: cursor ? [...prev.edges, ...productsData.edges] : productsData.edges,
        pageInfo: productsData.pageInfo,
      }));
    } catch (error) {
      console.error('Error fetching Shopify products for wizard:', error);
      setShopifyImportError(error.message || 'Failed to fetch products.');
      toast({ title: 'Product Fetch Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsFetchingShopifyPreviewData(false);
    }
  };
  
  const fetchShopifyWizardCollections = async (first = 10, cursor = null) => {
    if (!shopifyDomain || !shopifyToken) {
      setShopifyImportError('Domain or token missing for fetching collections.');
      return;
    }
    setIsFetchingShopifyPreviewData(true);
    setShopifyImportError(null);
    try {
      const collectionsData = await fetchShopifyCollectionsList(shopifyDomain, shopifyToken, first, cursor);
      setShopifyPreviewCollections(prev => ({
        edges: cursor ? [...prev.edges, ...collectionsData.edges] : collectionsData.edges,
        pageInfo: collectionsData.pageInfo,
      }));
    } catch (error) {
      console.error('Error fetching Shopify collections for wizard:', error);
      setShopifyImportError(error.message || 'Failed to fetch collections.');
      toast({ title: 'Collection Fetch Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsFetchingShopifyPreviewData(false);
    }
  };

  const fetchShopifyWizardLocalization = async (countryCode = "US", languageCode = "EN") => {
    if (!shopifyDomain || !shopifyToken) {
      setShopifyImportError('Domain or token missing for fetching localization.');
      return;
    }
    setIsFetchingShopifyPreviewData(true);
    setShopifyImportError(null);
    try {
      const localizationData = await fetchShopifyLocalizationInfo(shopifyDomain, shopifyToken, countryCode, languageCode);
      setShopifyLocalization(localizationData);
    } catch (error)
    {
      console.error('Error fetching Shopify localization for wizard:', error);
      setShopifyImportError(error.message || 'Failed to fetch localization info.');
      // Non-critical, so maybe a softer error or just log
      toast({ title: 'Localization Info Fetch Failed', description: error.message, variant: 'default' });
    } finally {
      setIsFetchingShopifyPreviewData(false);
    }
  };

  const generateShopifyStoreLogo = async () => {
    console.log("[StoreContext] Attempting to generate Shopify store logo...");
    if (!shopifyPreviewMetadata || !shopifyPreviewMetadata.name) {
      console.warn("[StoreContext] Cannot generate logo: Shopify preview metadata or store name is missing.", shopifyPreviewMetadata);
      setLogoGenerationError("Store name is not available to generate a logo.");
      toast({ title: 'Logo Generation Error', description: 'Store name missing. Ensure Shopify store details were fetched correctly.', variant: 'destructive' });
      return;
    }

    const storeNameForLogo = shopifyPreviewMetadata.name;
    console.log(`[StoreContext] Generating logo for store name: "${storeNameForLogo}"`);

    setIsGeneratingLogo(true);
    setLogoGenerationError(null);
    setGeneratedLogoImage(null);

    try {
      console.log("[StoreContext] Calling generateLogoWithGemini...");
      const { imageData, textResponse } = await generateLogoWithGemini(storeNameForLogo);
      console.log("[StoreContext] generateLogoWithGemini response:", { imageData: imageData ? 'imageData received (see next log)' : 'no imageData', textResponse });
      if (imageData) {
        console.log("[StoreContext] imageData (first 50 chars):", imageData.substring(0, 50));
        setGeneratedLogoImage(`data:image/png;base64,${imageData}`);
        toast({ title: 'Logo Generated!', description: 'A new logo has been generated successfully.' });
        console.log("[StoreContext] Logo generated and state updated.");
      } else {
        console.error("[StoreContext] generateLogoWithGemini returned no imageData. Text response:", textResponse);
        throw new Error(textResponse || "Gemini did not return image data.");
      }
    } catch (error) {
      console.error('[StoreContext] Error during Shopify store logo generation:', error.message, error.stack);
      setLogoGenerationError(error.message || 'Failed to generate logo.');
      toast({ title: 'Logo Generation Failed', description: `Error: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsGeneratingLogo(false);
      console.log("[StoreContext] Finished logo generation attempt.");
    }
  };

  const finalizeShopifyImportFromWizard = async () => {
    if (!shopifyPreviewMetadata || !shopifyDomain || !shopifyToken) {
      toast({ title: 'Import Error', description: 'Missing essential Shopify data to finalize import.', variant: 'destructive' });
      return false;
    }
    setIsGenerating(true); 
    setShopifyImportError(null);
    try {
      // Ensure products and collections are arrays of nodes
      const productNodes = shopifyPreviewProducts.edges.map(e => e.node);
      const collectionNodes = shopifyPreviewCollections.edges.map(e => e.node);

      const newStoreData = mapShopifyDataToInternalStore(
        shopifyPreviewMetadata,
        productNodes,
        collectionNodes,
        shopifyDomain,
        { generateId },
        generatedLogoImage // Pass the generated logo
      );
      
      const finalStore = await commonStoreCreation(newStoreData);
      if (finalStore) {
        resetShopifyWizardState(); // Clear wizard state on success
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error finalizing Shopify import from wizard:', error);
      setShopifyImportError(error.message || 'Failed to finalize Shopify import.');
      toast({ title: 'Import Failed', description: error.message || 'Could not complete Shopify store import.', variant: 'destructive' });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };


  const getStoreById = (id) => stores.find(store => store.id === id) || null;
  
  const getProductById = (storeId, productId) => {
    const store = getStoreById(storeId);
    return store?.products.find(p => p.id === productId) || null;
  };

  const updateStore = async (storeId, updates) => {
    // Local state will still update with settings for immediate UI feedback
    const storeWithFullUpdates = stores.find(s => s.id === storeId);
    let updatedLocalStore = null;
    if (storeWithFullUpdates) {
      updatedLocalStore = { ...storeWithFullUpdates, ...updates };
    }

    if (!user) {
      // Handle local-only updates if no user is logged in
      setStores(prevStores => {
        const newStores = prevStores.map(store => {
          if (store.id === storeId) {
            return updatedLocalStore || { ...store, ...updates }; // Use the fully updated local store
          }
          return store;
        });
        try {
          localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(newStores)));
        } catch (e) {
          console.error('Failed to save stores to localStorage during local-only update:', e);
          toast({
            title: 'Local Cache Update Failed',
            description: 'Could not update the local cache for the store (local-only).',
            variant: 'warning',
            duration: 7000,
          });
        }
        
        // Update currentStore if it's the one being modified
        if (currentStore && currentStore.id === storeId) {
           setCurrentStore(prevCurrent => prevCurrent ? { ...prevCurrent, ...updates } : null);
        }
        return newStores;
      });
      toast({ title: 'Store Updated (Locally)', description: 'Changes saved locally.' });
      return; // Exit if no user, as Supabase update won't happen
    }

    // If user exists, proceed with Supabase update
    setIsLoadingStores(true); // Indicate loading state during Supabase operation
    try {
      // Exclude 'settings' from data sent to Supabase to prevent schema error
      const { settings, ...updatesForSupabase } = updates;

      const { data: updatedStoreFromSupabase, error } = await supabase
        .from('stores')
        .update(updatesForSupabase) // 'settings' is not included here
        .eq('id', storeId)
        .eq('merchant_id', user.id) // Changed user_id to merchant_id
        .select()
        .single();

      if (error) {
        console.error('Error updating store in Supabase:', error);
        toast({ title: 'Update Failed (Cloud)', description: `${error.message}. Settings were not saved to the cloud.`, variant: 'destructive' });
        // Still update local state to reflect UI changes, even if cloud save failed for settings
        setStores(prevStores => {
          const newStores = prevStores.map(s => 
            s.id === storeId ? (updatedLocalStore || { ...s, ...updates }) : s
          );
          try {
            localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(newStores)));
          } catch (e) {
            console.error('Failed to save stores to localStorage after Supabase update error:', e);
            toast({
              title: 'Local Cache Update Failed',
              description: 'Could not update the local cache after a cloud update issue.',
              variant: 'warning',
              duration: 7000,
            });
          }
          return newStores;
        });
        if (currentStore && currentStore.id === storeId) {
          setCurrentStore(prevCurrent => updatedLocalStore || (prevCurrent ? {...prevCurrent, ...updates} : null) );
        }
        setIsLoadingStores(false);
        return;
      }

      // If Supabase update is successful for other fields, merge with local settings for UI consistency
      const finalUpdatedStore = { ...updatedStoreFromSupabase, settings: updatedLocalStore?.settings || storeWithFullUpdates?.settings || {} };

      setStores(prevStores => {
        const newStores = prevStores.map(store =>
          store.id === storeId ? finalUpdatedStore : store
        );
        try {
          localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(newStores)));
        } catch (e) {
          console.error('Failed to save stores to localStorage after successful Supabase update:', e);
          toast({
            title: 'Local Cache Update Failed',
            description: 'Could not fully update the local cache after saving to cloud.',
            variant: 'warning',
            duration: 7000,
          });
        }
        return newStores;
      });

      if (currentStore && currentStore.id === storeId) {
        setCurrentStore(finalUpdatedStore);
      }
      toast({ title: 'Store Updated', description: 'Store details updated successfully.' });
    } catch (e) {
        console.error('Unexpected error in updateStore:', e);
        toast({ title: 'Update Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
        setIsLoadingStores(false);
    }
  };

  const updateStorePassKey = async (storeId, passKey) => {
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please log in to set a pass key.', variant: 'destructive' });
      return;
    }
    // Optimistically update local state for responsiveness (optional, but good for UX)
    // This assumes 'pass_key' is a field on your store object.
    // If not, you might not need local optimistic update for this specific field if it's only for access control.
    
    // Update Supabase
    setIsLoadingStores(true); // Consider a more specific loading state if needed
    try {
      const { data, error } = await supabase
        .from('stores')
        .update({ pass_key: passKey }) // Make sure 'pass_key' is the correct column name in your DB
        .eq('id', storeId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating store pass key in Supabase:', error);
        toast({ title: 'Pass Key Update Failed', description: error.message, variant: 'destructive' });
        setIsLoadingStores(false);
        return;
      }

      // Update local state with the new pass_key from DB response
      setStores(prevStores => {
        const newStores = prevStores.map(store =>
          store.id === storeId ? { ...store, pass_key: data.pass_key } : store
        );
        try {
          localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(newStores)));
        } catch (e) {
          console.error('Failed to save stores to localStorage after pass key update:', e);
          toast({
            title: 'Local Cache Update Failed',
            description: 'Could not update the local cache after pass key update.',
            variant: 'warning',
            duration: 7000,
          });
        }
        return newStores;
      });

      if (currentStore && currentStore.id === storeId) {
        setCurrentStore(prevCurrent => prevCurrent ? { ...prevCurrent, pass_key: data.pass_key } : null);
      }
      toast({ title: 'Store Pass Key Set', description: 'The pass key for the store has been updated.' });
    } catch (e) {
      console.error('Unexpected error in updateStorePassKey:', e);
      toast({ title: 'Pass Key Update Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoadingStores(false);
    }
  };
  
  const assignStoreManager = async (storeId, managerEmail) => {
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please log in to assign a manager.', variant: 'destructive' });
      return;
    }
    if (!storeId || !managerEmail) {
      toast({ title: 'Missing Information', description: 'Store ID and Manager Email are required.', variant: 'destructive' });
      return;
    }

    setIsLoadingStores(true); // Or a more specific loading state
    try {
      const { data, error } = await supabase.functions.invoke('assign-store-manager', {
        body: { store_id: storeId, manager_email: managerEmail },
      });

      if (error) {
        console.error('Error assigning store manager:', error);
        toast({ title: 'Manager Assignment Failed', description: error.message, variant: 'destructive' });
        setIsLoadingStores(false);
        return;
      }
      
      if (data.error) { // Check for error within the response data from the function
        console.error('Error from assign-store-manager function:', data.error);
        toast({ title: 'Manager Assignment Failed', description: data.error, variant: 'destructive' });
        setIsLoadingStores(false);
        return;
      }

      // Optionally, update local store data if the manager_email or similar field is stored on the store object
      // For now, just a success toast. If you store manager_email on the store locally:
      // setStores(prevStores => {
      //   const newStores = prevStores.map(store =>
      //     store.id === storeId ? { ...store, manager_email: managerEmail /* or data.updatedField */ } : store
      //   );
      //   localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(newStores)));
      //   return newStores;
      // });
      // if (currentStore && currentStore.id === storeId) {
      //   setCurrentStore(prev => prev ? { ...prev, manager_email: managerEmail } : null);
      // }

      toast({ title: 'Store Manager Assigned', description: `Manager ${managerEmail} assigned to store.` });
    } catch (e) {
      console.error('Unexpected error in assignStoreManager:', e);
      toast({ title: 'Manager Assignment Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoadingStores(false);
    }
  };

  const updateProductImage = async (storeId, productId, newImage) => {
    const storeToUpdate = stores.find(s => s.id === storeId);
    if (!storeToUpdate) {
        console.warn(`[StoreContext] updateProductImage: Store with ID ${storeId} not found.`);
        return;
    }

    const updatedProducts = storeToUpdate.products.map(p =>
      p.id === productId ? { ...p, image: newImage } : p
    );
    // The updateStore function will handle saving to localStorage via setStores callback
    await updateStore(storeId, { products: updatedProducts }); 
    // Toast is now inside updateStore, so it's not needed here explicitly unless for specific message
    // toast({ title: 'Product Image Updated', description: 'The product image has been changed.' });
  };

  const deleteStore = async (storeId) => {
     if (!user) {
      toast({ title: 'Authentication Required', description: 'Please log in to delete a store.', variant: 'destructive'});
      return;
    }
    // Optimistically update UI first, then call Supabase
    const storesBeforeDelete = [...stores];
    setStores(prevStores => {
        const newStores = prevStores.filter(store => store.id !== storeId);
        try {
          localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(newStores)));
        } catch (e) {
          console.error('Failed to save stores to localStorage during optimistic delete:', e);
          // Toast might be redundant if Supabase call succeeds/fails and shows its own.
          // However, this indicates a local caching issue specifically.
          toast({
            title: 'Local Cache Update Issue',
            description: 'Could not update the local cache during store deletion. Cloud operation will proceed.',
            variant: 'warning',
            duration: 7000,
          });
        }
        return newStores;
    });
    if (currentStore && currentStore.id === storeId) setCurrentStore(null);

    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId)
      .eq('merchant_id', user.id); // Changed user_id to merchant_id

    if (error) {
      console.error('Error deleting store from Supabase:', error);
      toast({ title: 'Deletion Failed', description: error.message, variant: 'destructive' });
      // Revert optimistic update if Supabase fails
      setStores(storesBeforeDelete);
      try {
        localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(storesBeforeDelete)));
      } catch (e) {
        console.error('Failed to save stores to localStorage during delete rollback:', e);
        toast({
          title: 'Local Cache Revert Failed',
          description: 'Could not revert local cache changes after a failed deletion.',
          variant: 'error', // More severe as it indicates desync
          duration: 8000,
        });
      }
      // Potentially reset currentStore if it was the one being deleted
      if (storesBeforeDelete.find(s => s.id === storeId)) {
          setCurrentStore(storesBeforeDelete.find(s => s.id === storeId) || null);
      }
      return;
    }
    toast({ title: 'Store Deleted', description: 'Your store has been deleted.' });
  };

  const addToCart = (product, storeId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id && item.storeId === storeId);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id && item.storeId === storeId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, storeId }];
    });
    toast({ title: 'Added to Cart', description: `${product.name} has been added to your cart.` });
  };

  const removeFromCart = (productId, storeId) => {
    setCart(prevCart => prevCart.filter(item => !(item.id === productId && item.storeId === storeId)));
    toast({ title: 'Removed from Cart', description: `Item removed from your cart.`, variant: 'destructive' });
  };

  const updateQuantity = (productId, storeId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId, storeId);
      return;
    }
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId && item.storeId === storeId 
        ? { ...item, quantity } 
        : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    toast({ title: 'Cart Cleared', description: 'Your shopping cart is now empty.' });
  };

  // Helper function to get updates object for a specific template version
  const getUpdatesForVersion = useCallback((storeId, targetVersion) => {
    const currentStoreState = stores.find(s => s.id === storeId);
    if (!currentStoreState) {
      console.warn(`[getUpdatesForVersion] Store with ID ${storeId} not found.`);
      return { template_version: targetVersion }; 
    }

    let updates = { template_version: targetVersion };
    const themeFromCurrent = currentStoreState.theme || {};
    const currentActualVersion = currentStoreState.template_version;

    if (targetVersion === 'v2') {
      if (themeFromCurrent.fontFamily === 'Inter' || currentActualVersion !== 'v2') {
        updates.theme = { ...themeFromCurrent, fontFamily: 'Montserrat' };
      } else {
        updates.theme = { ...themeFromCurrent }; 
      }
    } else if (targetVersion === 'v1') {
      if (themeFromCurrent.fontFamily === 'Montserrat' && currentActualVersion === 'v2') {
        updates.theme = { ...themeFromCurrent, fontFamily: 'Inter' };
      } else {
        updates.theme = { ...themeFromCurrent };
      }
    }
    return updates;
  }, [stores]);


  const updateStoreTemplateVersion = async (storeId, newVersion) => {
    if (!storeId || !newVersion) { // Validate newVersion as well
      toast({ title: 'Error', description: 'Store ID and new template version are required.', variant: 'destructive' });
      return;
    }

    // Get the updates needed for the newVersion, including theme adjustments
    const updatesForNewVersion = getUpdatesForVersion(storeId, newVersion);
    
    // Apply the updates to switch to the newVersion directly
    await updateStore(storeId, updatesForNewVersion);
    
    // Toast the final state, reflecting the actual newVersion
    toast({ title: 'Template Updated', description: `Store template is now ${newVersion === 'v1' ? 'Classic' : (newVersion === 'v2' ? 'Modern' : newVersion)}.` });
  };

  const value = { 
    stores, currentStore, isGenerating, isLoadingStores, cart, user,
    generateStore,
    // importShopifyStore, // Replaced by wizard functions
    getStoreById, updateStore, deleteStore, setCurrentStore, updateStorePassKey, assignStoreManager, updateStoreTemplateVersion,
    getProductById, updateProductImage, generateStoreFromWizard,
    addToCart, removeFromCart, updateQuantity, clearCart,
    generateAIProducts: generateAIProductsData,
    viewMode, setViewMode, // Expose viewMode and setter

    // Shopify Wizard related state and functions
    shopifyWizardStep, setShopifyWizardStep,
    shopifyDomain, setShopifyDomain, // Expose shopifyDomain and its setter
    shopifyToken, setShopifyToken, // Expose shopifyToken and its setter
    shopifyPreviewMetadata, shopifyPreviewProducts, shopifyPreviewCollections, shopifyLocalization,
    isFetchingShopifyPreviewData, shopifyImportError,
    // setShopifyDomain, setShopifyToken, // Already exposed with domain/token
    generatedLogoImage, isGeneratingLogo, logoGenerationError,
    startShopifyImportWizard,
    fetchShopifyWizardProducts,
    fetchShopifyWizardCollections,
    fetchShopifyWizardLocalization,
    generateShopifyStoreLogo,
    finalizeShopifyImportFromWizard,
    resetShopifyWizardState,

    // BigCommerce Wizard related state and functions
    bigCommerceWizardStep, setBigCommerceWizardStep,
    bigCommerceStoreDomain, bigCommerceApiToken, // BC specific credentials
    bigCommercePreviewSettings, bigCommercePreviewProducts,
    isFetchingBigCommercePreviewData, bigCommerceImportError,
    startBigCommerceImportWizard,
    fetchBigCommerceWizardSettings,
    fetchBigCommerceWizardProducts,
    finalizeBigCommerceImportFromWizard,
    resetBigCommerceWizardState,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
