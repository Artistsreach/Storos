import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '@/lib/firebaseClient'; // Import db and storage from firebaseClient
import { collection, doc, getDoc, getDocs, query, where, addDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
import { generateStoreUrl } from '@/lib/utils.js'; // Specifically from .js
import { fetchPexelsImages, generateId } from '@/lib/utils.jsx'; // Specifically from .jsx
import { generateLogoWithGemini } from '@/lib/geminiImageGeneration';
// Import BigCommerce API functions
import { fetchStoreSettings as fetchBCStoreSettings, fetchAllProducts as fetchBCAllProducts } from '@/lib/bigcommerce';
import ProductFinalizationModal from '@/components/store/ProductFinalizationModal'; // Added import

const DEFAULT_PLACEHOLDER_IMAGE_URL = "/placeholder-image.png"; // Define a default placeholder


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
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoadingStores, setIsLoadingStores] = useState(false);
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

  // Product Finalization Modal State
  const [isProductFinalizationModalOpen, setIsProductFinalizationModalOpen] = useState(false);
  const [productsToFinalize, setProductsToFinalize] = useState([]);
  const [storeDataForFinalization, setStoreDataForFinalization] = useState(null);

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
// Helper function to upload base64 image to Firebase Storage
const uploadBase64ToFirebaseStorage = async (base64String, path) => {
  if (!base64String || !path) {
    console.error("Missing base64 string or path for Firebase Storage upload.");
    return null;
  }

  // Remove data:image/png;base64, prefix
  const base64Data = base64String.split(',')[1];
  if (!base64Data) {
    console.error("Invalid base64 string provided for upload.");
    return null;
  }

  const imageRef = ref(storage, path);
  const metadata = { contentType: 'image/png' }; // Assuming PNG, adjust if other types are possible

  try {
    // Convert base64 to Uint8Array for browser compatibility
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const snapshot = await uploadBytes(imageRef, byteArray, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`Uploaded ${path} to Firebase Storage. URL: ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading ${path} to Firebase Storage:`, error);
    throw error;
  }
};

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
    setIsLoadingStores(true);
    console.log(`[StoreContext] loadStores called for userId: ${userId || 'Guest'}`);
    let localStores = [];
    let cloudStores = [];

    // 1. Always attempt to load from localStorage first
    const savedStores = localStorage.getItem('ecommerce-stores');
    if (savedStores) {
      try {
        localStores = JSON.parse(savedStores);
        console.log(`[StoreContext] Loaded ${localStores.length} stores from localStorage.`);
      } catch (e) {
        console.error('[StoreContext] Failed to parse localStorage stores:', e);
        toast({ title: 'Local Cache Error', description: 'Failed to load stores from local cache.', variant: 'warning' });
        localStores = [];
      }
    }

    // Set initial stores to local ones for immediate display
    setStores(localStores);

    // 2. If user is logged in, asynchronously fetch from Firestore
    if (userId) {
      console.log(`[StoreContext] Fetching cloud stores for userId: ${userId}`);
      try {
        const storesRef = collection(db, 'stores');
        const q = query(storesRef, where('merchant_id', '==', userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log('[StoreContext] No cloud stores found for this user.');
        } else {
          console.log(`[StoreContext] Fetched ${querySnapshot.size} stores from Firestore. Processing details...`);
          const storesFromDb = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const storesWithDetails = await Promise.all(
            storesFromDb.map(async (store) => {
              try {
                const productsRef = collection(db, 'stores', store.id, 'products');
                const productsSnapshot = await getDocs(productsRef);
                const productsFromDb = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const mappedProducts = productsFromDb.map(dbProduct => {
                  let imageStructure = { src: { large: '', medium: '' } };
                  if (dbProduct.images && Array.isArray(dbProduct.images) && dbProduct.images.length > 0) {
                    imageStructure.src.large = dbProduct.images[0];
                    imageStructure.src.medium = dbProduct.images[0];
                  }
                  return {
                    ...dbProduct,
                    price: dbProduct.priceAmount,
                    image: imageStructure,
                    variants: dbProduct.variants || [],
                  };
                });

                const storeWithMappedDate = { ...store, createdAt: store.created_at?.toDate()?.toISOString() || new Date().toISOString() };

                let mappedCollections = [];
                const collectionsRef = collection(db, 'stores', store.id, 'collections');
                const collectionsSnapshot = await getDocs(collectionsRef);
                const rawCollectionsFromDb = collectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                if (rawCollectionsFromDb && rawCollectionsFromDb.length > 0) {
                  mappedCollections = await Promise.all(rawCollectionsFromDb.map(async (collectionDoc) => {
                    let collectionProducts = [];
                    if (collectionDoc.product_ids && collectionDoc.product_ids.length > 0) {
                      collectionProducts = mappedProducts.filter(p => collectionDoc.product_ids.includes(p.id));
                    }
                    return {
                      ...collectionDoc,
                      image: { src: collectionDoc.image_url || '' },
                      products: collectionProducts
                    };
                  }));
                }
                return { ...storeWithMappedDate, products: mappedProducts, collections: mappedCollections };
              } catch (storeDetailError) {
                console.error(`[StoreContext] Critical error processing details for store ${store.id}:`, storeDetailError);
                return { ...store, products: [], collections: [] };
              }
            })
          );
          cloudStores = storesWithDetails;
          console.log(`[StoreContext] Finished processing details for ${cloudStores.length} cloud stores.`);
        }
      } catch (overallError) {
        console.error('[StoreContext] Overall critical error in fetching cloud stores:', overallError);
        toast({ title: 'Cloud Loading Error', description: 'A critical error occurred while fetching cloud store data.', variant: 'destructive' });
      }

      // 3. Merge/Reconcile local and cloud stores
      const mergedStores = [...localStores];
      cloudStores.forEach(cloudStore => {
        const existingLocalIndex = mergedStores.findIndex(ls => ls.id === cloudStore.id);
        if (existingLocalIndex > -1) {
          mergedStores[existingLocalIndex] = cloudStore;
        } else {
          mergedStores.push(cloudStore);
        }
      });
      
      mergedStores.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));

      setStores(mergedStores);
      try {
        localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(mergedStores)));
        console.log('[StoreContext] Updated localStorage with merged stores.');
      } catch (e) {
        console.error('[StoreContext] Failed to save merged stores to localStorage:', e);
        toast({
          title: 'Local Cache Update Failed',
          description: 'Could not update the local cache after cloud sync.',
          variant: 'warning',
          duration: 7000,
        });
      }
    } else {
      console.log('[StoreContext] No user logged in. Displaying local stores only.');
    }

    setIsLoadingStores(false);
    console.log(`[StoreContext] loadStores finished. isLoadingStores: false. Final stores count: ${stores.length}`);
  }, [toast, db, prepareStoresForLocalStorage]);

  const updateStore = useCallback(async (storeId, updates) => {
    // Local state will still update with settings for immediate UI feedback
    // Find the current full store object from state to ensure all existing data (products, collections) is preserved
    const existingStore = stores.find(s => s.id === storeId);
    if (!existingStore) {
      console.warn(`[StoreContext] updateStore: Store with ID ${storeId} not found in current state.`);
      // If the store isn't found, we can't update it. Maybe load stores again or throw an error.
      // For now, we'll proceed with a toast and return.
      toast({ title: 'Update Failed', description: 'Store not found for update.', variant: 'destructive' });
      return;
    }

    // Create the updated local store object by merging existing data with new updates
    // This ensures products, collections, etc., are carried over if not explicitly in 'updates'
    const updatedLocalStore = { ...existingStore, ...updates };
    console.log(`[StoreContext] updateStore: updatedLocalStore for store ${storeId} - Products: ${updatedLocalStore.products?.length || 0}, Collections: ${updatedLocalStore.collections?.length || 0}`);

    // Always update local state first for immediate UI feedback
    setStores(prevStores => {
      const newStores = prevStores.map(store => {
        if (store.id === storeId) {
          return updatedLocalStore;
        }
        return store;
      });
      try {
        localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(newStores)));
        console.log(`[StoreContext] updateStore: Saved ${newStores.length} stores to localStorage.`);
      } catch (e) {
        console.error('Failed to save stores to localStorage during update:', e);
        toast({
          title: 'Local Cache Update Failed',
          description: 'Could not update the local cache for the store.',
          variant: 'warning',
          duration: 7000,
        });
      }
      return newStores;
    });
    
    // Update currentStore if it's the one being modified
    if (currentStore && currentStore.id === storeId) {
       setCurrentStore(updatedLocalStore);
       console.log(`[StoreContext] updateStore: currentStore updated for store ${storeId}.`);
    }
    toast({ title: 'Store Updated (Locally)', description: 'Changes saved locally.' });

    // If user exists, proceed with asynchronous Firestore update
    if (user) {
      setIsLoadingStores(true); // Indicate loading state during Firestore operation
      try {
        // Exclude 'settings', 'products', 'collections' from data sent to Firestore directly
        // These should be handled by separate sync logic or not directly updated via this generic update.
        const { settings, products, collections, user_id, ...updatesForFirestore } = updates;

        const storeRef = doc(db, 'stores', storeId);
        await updateDoc(storeRef, updatesForFirestore);

        console.log(`Store ${storeId} synced to Firestore asynchronously.`);
      } catch (e) {
          console.error('Unexpected error during async Firestore updateStore:', e);
          toast({ title: 'Cloud Sync Error', description: 'An unexpected error occurred during cloud sync.', variant: 'destructive' });
      } finally {
          setIsLoadingStores(false);
      }
    }
  }, [stores, user, toast, currentStore, setCurrentStore, setStores, setIsLoadingStores, prepareStoresForLocalStorage]);

  const updateStoreTextContent = useCallback(async (identifier, newText) => {
    if (!currentStore || !currentStore.id) {
      toast({ title: 'Error', description: 'No current store selected to update.', variant: 'destructive' });
      return;
    }
    if (typeof identifier !== 'string' || identifier.trim() === '') {
      toast({ title: 'Error', description: 'Invalid identifier for text content.', variant: 'destructive' });
      return;
    }

    const storeId = currentStore.id;
    
    // Create a deep copy of the current store's content to avoid direct mutation
    // Ensure currentStore.content exists and is an object, default to {} if not
    const currentContent = (typeof currentStore.content === 'object' && currentStore.content !== null) 
                           ? currentStore.content 
                           : {};
    let newContent = JSON.parse(JSON.stringify(currentContent));

    // Use a helper to set nested properties
    const keys = identifier.split('.');
    let currentLevel = newContent;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!currentLevel[key] || typeof currentLevel[key] !== 'object') {
        currentLevel[key] = {}; // Create parent objects if they don't exist
      }
      currentLevel = currentLevel[key];
    }
    currentLevel[keys[keys.length - 1]] = newText;

    // Call updateStore with the modified content
    // updateStore expects the top-level field to update, e.g., { content: newContent }
    await updateStore(storeId, { content: newContent });
    
    // Toast for successful update is handled within updateStore
  }, [currentStore, updateStore, toast]);

  // Automatic store loading useEffect removed.
  // Stores should be loaded via a manual trigger (e.g., a button calling loadStores(user.id)).
  // The isLoadingStores state is initialized to false.
  // The loadStores function is now exposed via the context value.

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
    let storeToCreate = { ...storeData };

    // --- BEGIN NAME UNIQUENESS CHECK ---
    const storeNameForCheck = storeToCreate.name || `Store-${generateId().substring(0,6)}`;
    if (!storeToCreate.name) storeToCreate.name = storeNameForCheck; // Ensure name is set if generated

    const nameCheckResult = await checkStoreNameAvailability(storeNameForCheck);
    if (!nameCheckResult.available) {
      const errorMessage = nameCheckResult.error === true // checkStoreNameAvailability returns error: true on network/db error
        ? `Failed to verify store name "${storeNameForCheck}". Please try again.`
        : `The store name "${storeNameForCheck}" or a similar URL is already in use. Please choose a different name.`;
      toast({ title: 'Store Name Unavailable', description: errorMessage, variant: 'destructive' });
      throw new Error(errorMessage);
    }
    // Use the validated/generated slug from checkStoreNameAvailability
    storeToCreate.urlSlug = nameCheckResult.slug;
    // --- END NAME UNIQUENESS CHECK ---
    
    if (!storeToCreate.template_version) {
      storeToCreate.template_version = 'v1';
    }
    // urlSlug is now set from nameCheckResult

    const clientGeneratedStoreId = storeToCreate.id || generateId();
    const newStoreLocal = { 
      ...storeToCreate, 
      id: clientGeneratedStoreId, 
      createdAt: new Date().toISOString(),
      // urlSlug is already part of storeToCreate from the check
    }; 

    let finalProductsForStoreObject = newStoreLocal.products || [];
    const productDbIdMap = new Map(); 
    let insertedDbCollections = []; 

    finalProductsForStoreObject = finalProductsForStoreObject.map(p => ({
      ...p,
      id: p.id || generateId() 
    }));
    finalProductsForStoreObject.forEach(p => {
      productDbIdMap.set(p.name, p.id); 
    });

    if (user && user.uid) { 
      try {
        const { id: localId, settings, products, collections, user_id, ...restOfStoreData } = newStoreLocal;
        const storeDocRef = doc(db, 'stores', localId); 

        let logoUrl = restOfStoreData.logo_url;
        if (logoUrl && logoUrl.startsWith('data:image/')) {
          try {
            const logoPath = `store_logos/${localId}/logo_${generateId()}.png`;
            logoUrl = await uploadBase64ToFirebaseStorage(logoUrl, logoPath);
          } catch (uploadError) {
            console.error('Error uploading store logo to Firebase Storage:', uploadError);
            toast({ title: 'Logo Upload Failed', description: 'Could not upload store logo.', variant: 'warning' });
            logoUrl = DEFAULT_PLACEHOLDER_IMAGE_URL; 
          }
        } else if (!logoUrl) {
          logoUrl = DEFAULT_PLACEHOLDER_IMAGE_URL; 
        }

        const dataToInsert = {
          ...restOfStoreData, 
          merchant_id: user.uid, 
          created_at: new Date(), 
          logo_url: logoUrl || DEFAULT_PLACEHOLDER_IMAGE_URL,
          urlSlug: newStoreLocal.urlSlug // Ensure urlSlug is saved to Firestore
        };
        
        await setDoc(storeDocRef, dataToInsert);
        console.log(`Store ${localId} saved to Firestore asynchronously.`);

        if (newStoreLocal.products && newStoreLocal.products.length > 0) {
          const productsBatch = [];
          for (const localProduct of newStoreLocal.products) {
            // ... (product image upload and data prep logic remains the same) ...
            let productImages = [];
            if (localProduct.images && Array.isArray(localProduct.images)) {
              for (const img of localProduct.images) {
                if (img.startsWith('data:image/')) {
                  try {
                    const imagePath = `store_products/${localId}/${localProduct.id || generateId()}/${generateId()}.png`;
                    const uploadedUrl = await uploadBase64ToFirebaseStorage(img, imagePath);
                    if (uploadedUrl) {
                      productImages.push(uploadedUrl);
                    } else {
                      productImages.push(DEFAULT_PLACEHOLDER_IMAGE_URL); 
                    }
                  } catch (imgUploadError) {
                    console.error(`Error uploading product image for ${localProduct.name}:`, imgUploadError);
                    toast({ title: 'Product Image Upload Failed', description: `Could not upload image for ${localProduct.name}.`, variant: 'warning' });
                    productImages.push(DEFAULT_PLACEHOLDER_IMAGE_URL); 
                  }
                } else if (img) { 
                  productImages.push(img);
                } else { 
                  productImages.push(DEFAULT_PLACEHOLDER_IMAGE_URL);
                }
              }
            }
            if (productImages.length === 0) { 
              productImages.push(DEFAULT_PLACEHOLDER_IMAGE_URL);
            }

            const productData = {
              store_id: localId,
              name: localProduct.name || `Product ${generateId().substring(0, 8)}`,
              description: localProduct.description || "No description available.",
              images: productImages, 
              priceAmount: Number(localProduct.price) >= 0 ? Number(localProduct.price) : 0,
              currency: 'usd',
              variants: localProduct.variants || [],
              created_at: new Date(),
            };
            const productDocRef = doc(db, 'stores', localId, 'products', localProduct.id || generateId());
            productsBatch.push(setDoc(productDocRef, productData));
            productDbIdMap.set(localProduct.name, productDocRef.id); 
          }
          await Promise.all(productsBatch);
        }

        if (newStoreLocal.collections && newStoreLocal.collections.length > 0) {
          const collectionsBatch = [];
          for (const localCollection of newStoreLocal.collections) {
            // ... (collection image upload and data prep logic remains the same) ...
            let collectionImageUrl = localCollection.imageUrl;
            if (collectionImageUrl && collectionImageUrl.startsWith('data:image/')) {
              try {
                const imagePath = `store_collections/${localId}/${localCollection.id || generateId()}/${generateId()}.png`;
                collectionImageUrl = await uploadBase64ToFirebaseStorage(collectionImageUrl, imagePath);
              } catch (uploadError) {
                console.error('Error uploading collection image to Firebase Storage:', uploadError);
                toast({ title: 'Collection Image Upload Failed', description: 'Could not upload collection image.', variant: 'warning' });
                collectionImageUrl = DEFAULT_PLACEHOLDER_IMAGE_URL; 
              }
            } else if (!collectionImageUrl) {
              collectionImageUrl = DEFAULT_PLACEHOLDER_IMAGE_URL; 
            }

            const productIdsForCollection = (localCollection.product_ids || []).map(originalProductId => productDbIdMap.get(originalProductId)).filter(Boolean);

            const collectionData = {
              store_id: localId,
              name: localCollection.name,
              description: localCollection.description,
              image_url: collectionImageUrl || DEFAULT_PLACEHOLDER_IMAGE_URL,
              product_ids: productIdsForCollection, 
              created_at: new Date(),
            };
            const collectionDocRef = doc(db, 'stores', localId, 'collections', localCollection.id || generateId());
            collectionsBatch.push(setDoc(collectionDocRef, collectionData));
            insertedDbCollections.push({ id: collectionDocRef.id, ...collectionData }); 
          }
          await Promise.all(collectionsBatch);
        }
      } catch (overallFirestoreError) {
        console.error('Overall async Firestore store creation error. Code:', overallFirestoreError.code, 'Message:', overallFirestoreError.message, 'Full Error:', overallFirestoreError);
        setTimeout(() => {
          toast({ title: 'Cloud Sync Error', description: `Firestore error (${overallFirestoreError.code || 'Unknown Code'}): ${overallFirestoreError.message}`, variant: 'destructive' });
        }, 0);
      }
    } else if (user && !user.uid) { 
      console.error('Firestore save skipped: User object is present but user.uid is undefined.');
      setTimeout(() => {
        toast({ title: 'User UID Missing', description: 'Cannot save to cloud: User UID is missing. Please try logging out and back in.', variant: 'destructive' });
      }, 0);
    } 
    
    let hydratedCollections = [];
    const sourceCollections = newStoreLocal.collections || [];
    const sourceProducts = finalProductsForStoreObject; 

    if (sourceCollections.length > 0) {
      hydratedCollections = sourceCollections.map((wizardOrAiCollection) => {
        let dbEquivalentCollectionData = {}; 
        if (user && insertedDbCollections && insertedDbCollections.length > 0) {
            const foundDbColl = insertedDbCollections.find(dbc => dbc.name === wizardOrAiCollection.name);
            if (foundDbColl) {
                dbEquivalentCollectionData = foundDbColl;
            }
        }
        
        let populatedProductsForThisCollection = [];
        if (wizardOrAiCollection.product_ids && wizardOrAiCollection.product_ids.length > 0) {
          wizardOrAiCollection.product_ids.forEach(originalProductId => {
            const dbId = productDbIdMap.get(originalProductId); 
            let productToLink = null;

            if (dbId) { 
              productToLink = sourceProducts.find(p => p.id === dbId);
              if (!productToLink) {
                if (originalProductId !== dbId) {
                    productToLink = sourceProducts.find(p => p.id === originalProductId);
                }
              }
            } else { 
              productToLink = sourceProducts.find(p => p.id === originalProductId);
            }

            if (productToLink) {
              populatedProductsForThisCollection.push(productToLink);
            }
          });
        }
        
        const finalCollectionImageSrc = dbEquivalentCollectionData?.image_url || wizardOrAiCollection.imageUrl || '';

        return { 
          ...wizardOrAiCollection, 
          ...dbEquivalentCollectionData, 
          image: { src: finalCollectionImageSrc }, 
          products: populatedProductsForThisCollection, 
        };
      });
    }
    
    const displayStore = { 
      ...newStoreLocal, 
      products: sourceProducts, 
      collections: hydratedCollections, 
    };

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
    
    // Navigation is now handled after finalization or directly if no modal
    // toast({ title: 'Store Created!', description: `Store "${displayStore.name}" has been created.` });
    // navigate(`/${displayStore.urlSlug || generateStoreUrl(displayStore.name)}`); 
    return displayStore; 
  };

  const checkStoreNameAvailability = async (name) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return { available: true, slug: '', error: 'Name cannot be empty.' }; 
    }
    const slug = generateStoreUrl(name.trim());
    if (!slug) {
      return { available: true, slug: '', error: 'Invalid name for URL generation.' };
    }
    try {
      const storesRef = collection(db, 'stores');
      const q = query(storesRef, where('urlSlug', '==', slug));
      const querySnapshot = await getDocs(q);
      return { available: querySnapshot.empty, slug: slug };
    } catch (error) {
      console.error('Error checking store name availability:', error);
      toast({ title: 'Name Check Failed', description: 'Could not verify store name uniqueness.', variant: 'destructive' });
      return { available: false, slug: slug, error: true }; 
    }
  };
  
  const generateStoreFromWizard = async (wizardData) => {
    setIsGenerating(true);
    setProgress(0); 
    setStatusMessage('Initializing wizard-based store generation...');
    try {
      // Name check is now handled by commonStoreCreation.
      // urlSlug will also be handled by commonStoreCreation based on the name.
      const newStoreData = await generateStoreFromWizardData(
        wizardData, // Pass wizardData without pre-setting urlSlug
        { fetchPexelsImages, generateId }
      );
      // commonStoreCreation will perform the name check using newStoreData.name
      const result = await commonStoreCreation(newStoreData); 
      setProgress(100);
      setStatusMessage('Store generation complete!');
      return result;
    } catch (error) {
      console.error('Error generating store from wizard:', error);
      // Toast for name unavailability is handled by commonStoreCreation if it throws that specific error.
      // Otherwise, a generic failure toast.
      if (!error.message?.includes("already in use") && !error.message?.includes("Failed to verify store name")) {
        toast({ title: 'Wizard Generation Failed', description: error.message || 'Failed to generate store.', variant: 'destructive' });
      }
      setProgress(0);
      setStatusMessage('Generation failed.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStore = async (prompt, storeNameOverride = null, productTypeOverride = null) => {
    setIsGenerating(true);
    setProgress(0);
    setStatusMessage('Initializing generation...');
    try {
      // Name check is now handled by commonStoreCreation.
      // urlSlug will also be handled by commonStoreCreation.
      const updateProgressCallback = (newProgress, newMessage) => {
        setProgress(newProgress);
        if (newMessage) setStatusMessage(newMessage);
      };
      
      const newStoreData = await generateStoreFromPromptData(
        prompt, 
        // Pass storeNameOverride, productTypeOverride. commonStoreCreation will use storeNameOverride or derive from prompt for the check.
        { storeNameOverride, productTypeOverride, fetchPexelsImages, generateId }, 
        updateProgressCallback 
      );
      
      // Instead of direct creation, open modal
      setProductsToFinalize(newStoreData.products || []);
      setStoreDataForFinalization(newStoreData); // Store the rest of the data
      setIsProductFinalizationModalOpen(true);
      
      // commonStoreCreation will be called from handleFinalizeProducts
      // For now, return null or a marker indicating modal will open
      // The UI should react to isGenerating being false and modal opening.
      // No navigation or final toast here.
      setStatusMessage('Products generated. Please review and finalize.');
      // Progress can be set to a point indicating data is ready for review
      setProgress(90); // Example: 90% done, awaiting finalization
      return null; // Or newStoreData if the calling component needs it before modal
    } catch (error) {
      console.error('Error generating store from prompt:', error);
      if (error.message && error.message.toLowerCase().includes("name taken") ) {
         toast({ title: 'Store Name Taken', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Generation Failed', description: error.message || 'Failed to generate store.', variant: 'destructive' });
      }
      setProgress(0); 
      setStatusMessage('Generation failed.');
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
    setShopifyDomain(domain); // Store domain in context
    setShopifyToken(token);   // Store token in context
    setIsFetchingShopifyPreviewData(true); // Use specific loading state for preview
    setShopifyImportError(null);
    setShopifyPreviewMetadata(null); // Clear previous metadata

    try {
      toast({ title: "Connecting to Shopify...", description: "Fetching store information." });
      const metadata = await fetchShopifyStoreMetadata(domain, token); // from storeActions
      if (!metadata) {
        throw new Error("Failed to fetch Shopify store metadata. The store might not exist or the token might be invalid.");
      }
      setShopifyPreviewMetadata(metadata);
      setShopifyWizardStep(2); // Advance to metadata preview step
      // Optionally fetch initial products/collections here if Step 2 should show them immediately
      // For now, products/collections are fetched when moving from Step 2 to Step 3 in ImportWizard.jsx
      return true; // Indicate success
    } catch (error) {
      console.error('Error starting Shopify import wizard (fetching metadata):', error);
      setShopifyImportError(error.message || 'Failed to connect to Shopify and fetch store information.');
      toast({ title: 'Connection Failed', description: error.message || 'Could not fetch store information.', variant: 'destructive' });
      // Do not reset domain/token here, user might want to retry or see the error with current inputs
      // setShopifyWizardStep(1); // Stay on connect step or let user cancel
      return false; // Indicate failure
    } finally {
      setIsFetchingShopifyPreviewData(false);
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
  setIsFetchingShopifyPreviewData(true);
  setBigCommerceImportError(null);
  try {
    const settings = await fetchBCStoreSettings(currentDomain, currentToken);
    setBigCommercePreviewSettings(settings);
  } catch (error) {
    console.error('Error fetching BigCommerce settings for wizard:', error);
    setBigCommerceImportError(error.message || 'Failed to fetch store settings.');
    toast({ title: 'BigCommerce Settings Fetch Failed', description: error.message, variant: 'destructive' });
  } finally {
    setIsFetchingShopifyPreviewData(false);
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
  const getStoreByName = (name) => stores.find(store => generateStoreUrl(store.name) === name) || null;
  
  const getProductById = (storeId, productId) => {
    const store = getStoreById(storeId);
    return store?.products.find(p => p.id === productId) || null;
  };

  // The old updateStore location is now removed.
  // The correct updateStore is defined earlier and wrapped in useCallback.

  const updateStorePassKey = async (storeId, passKey) => {
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please log in to set a pass key.', variant: 'destructive' });
      return;
    }
    // Optimistically update local state for responsiveness (optional, but good for UX)
    // This assumes 'pass_key' is a field on your store object.
    // If not, you might not need local optimistic update for this specific field if it's only for access control.
    
    // Update Firestore
    setIsLoadingStores(true); // Consider a more specific loading state if needed
    try {
      const storeRef = doc(db, 'stores', storeId);
      await updateDoc(storeRef, { pass_key: passKey });

      // Update local state with the new pass_key
      setStores(prevStores => {
        const newStores = prevStores.map(store =>
          store.id === storeId ? { ...store, pass_key: passKey } : store
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
        setCurrentStore(prevCurrent => prevCurrent ? { ...prevCurrent, pass_key: passKey } : null);
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
      // TODO: Replace with a Firebase Cloud Function invocation or direct Firestore update
      // For now, commenting out the Supabase function call.
      // Example: const response = await fetch('/api/assignStoreManager', { method: 'POST', body: JSON.stringify({ store_id: storeId, manager_email: managerEmail }) });
      // const data = await response.json();
      // if (data.error) throw new Error(data.error);

      console.warn('Assign Store Manager functionality needs to be migrated to a Firebase Cloud Function or direct Firestore logic.');
      toast({ title: 'Manager Assignment (Placeholder)', description: 'Functionality needs Firebase Cloud Function implementation.', variant: 'info' });
      
      // Simulate success for now
      // const data = { success: true }; 

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
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please log in to update product images.', variant: 'destructive' });
      return;
    }

    const storeToUpdate = stores.find(s => s.id === storeId);
    if (!storeToUpdate) {
        console.warn(`[StoreContext] updateProductImage: Store with ID ${storeId} not found.`);
        toast({ title: "Update Failed", description: "Store not found for updating product image.", variant: "destructive" });
        return;
    }

    let updatedImageUrl = newImage.src.large; // Assuming newImage.src.large holds the base64 or URL
    if (updatedImageUrl && updatedImageUrl.startsWith('data:image/')) {
      try {
        const imagePath = `store_products/${storeId}/${productId}/image_${generateId()}.png`;
        const uploadedUrl = await uploadBase64ToFirebaseStorage(updatedImageUrl, imagePath);
        if (!uploadedUrl) {
          // Keep original URL if upload fails but it wasn't a base64 string initially
          // If it was base64 and failed, use placeholder
          updatedImageUrl = updatedImageUrl.startsWith('data:image/') ? DEFAULT_PLACEHOLDER_IMAGE_URL : updatedImageUrl;
          toast({ title: 'Image Upload Failed', description: 'Could not upload new product image. Using placeholder or existing.', variant: 'warning' });
        } else {
          updatedImageUrl = uploadedUrl;
        }
      } catch (uploadError) {
        console.error(`Error uploading new product image for ${productId}:`, uploadError);
        toast({ title: 'Image Upload Failed', description: 'Could not upload new product image.', variant: 'destructive' });
        updatedImageUrl = DEFAULT_PLACEHOLDER_IMAGE_URL; // Fallback to placeholder on error
      }
    } else if (!updatedImageUrl) {
      updatedImageUrl = DEFAULT_PLACEHOLDER_IMAGE_URL;
    }

    const updatedProducts = storeToUpdate.products.map(p =>
      p.id === productId ? { 
        ...p, 
        image: { ...p.image, src: { large: updatedImageUrl, medium: updatedImageUrl } },
        images: p.images ? [...p.images.filter(img => img !== p.image.src.large), updatedImageUrl] : [updatedImageUrl] // Update images array
      } : p
    );

    // Update Firestore product document
    try {
      const productDocRef = doc(db, 'stores', storeId, 'products', productId);
      await updateDoc(productDocRef, { 
        images: updatedProducts.find(p => p.id === productId).images,
        image: { src: { large: updatedImageUrl, medium: updatedImageUrl } } // Update primary image structure
      });
      toast({ title: 'Product Image Updated', description: 'The product image has been changed.' });
    } catch (error) {
      console.error('Error updating product image in Firestore:', error);
      toast({ title: 'Cloud Sync Failed', description: `Failed to save product image to cloud: ${error.message}`, variant: 'destructive' });
      return;
    }

    // Update local state after successful cloud update
    setStores(prevStores => {
      const newStores = prevStores.map(store => {
        if (store.id === storeId) {
          return { ...store, products: updatedProducts };
        }
        return store;
      });
      try {
        localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(newStores)));
      } catch (e) {
        console.error('Failed to save stores to localStorage during product image update:', e);
        toast({
          title: 'Local Cache Update Failed',
          description: 'Could not update the local cache for product image.',
          variant: 'warning',
          duration: 7000,
        });
      }
      return newStores;
    });

    if (currentStore && currentStore.id === storeId) {
      setCurrentStore(prevCurrent => prevCurrent ? { ...prevCurrent, products: updatedProducts } : null);
    }
  };

  const deleteStore = async (storeId) => {
     if (!user) {
      toast({ title: 'Authentication Required', description: 'Please log in to delete a store.', variant: 'destructive'});
      return;
    }
    // Optimistically update UI first
    const storesBeforeDelete = [...stores];
    setStores(prevStores => {
        const newStores = prevStores.filter(store => store.id !== storeId);
        try {
          localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(newStores)));
        } catch (e) {
          console.error('Failed to save stores to localStorage during optimistic delete:', e);
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

    try {
      // 1. Delete products subcollection
      const productsRef = collection(db, 'stores', storeId, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const productDeletePromises = [];
      for (const productDoc of productsSnapshot.docs) {
        productDeletePromises.push(deleteDoc(doc(db, 'stores', storeId, 'products', productDoc.id)));
      }
      await Promise.all(productDeletePromises);
      console.log(`Deleted ${productsSnapshot.size} products for store ${storeId}.`);

      // 2. Delete collections subcollection
      const collectionsRef = collection(db, 'stores', storeId, 'collections');
      const collectionsSnapshot = await getDocs(collectionsRef);
      const collectionDeletePromises = [];
      for (const collectionDoc of collectionsSnapshot.docs) {
        collectionDeletePromises.push(deleteDoc(doc(db, 'stores', storeId, 'collections', collectionDoc.id)));
      }
      await Promise.all(collectionDeletePromises);
      console.log(`Deleted ${collectionsSnapshot.size} collections for store ${storeId}.`);

      // 3. Delete the main store document
      const storeDocRef = doc(db, 'stores', storeId);
      await deleteDoc(storeDocRef);
      console.log(`Store ${storeId} deleted from Firestore.`);

      toast({ title: 'Store Deleted', description: 'Your store has been deleted.' });
    } catch (error) {
      console.error('Error deleting store from Firestore:', error);
      toast({ title: 'Deletion Failed', description: error.message, variant: 'destructive' });
      // Revert optimistic update if Firestore fails
      setStores(storesBeforeDelete);
      try {
        localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(storesBeforeDelete)));
      } catch (e) {
        console.error('Failed to save stores to localStorage during delete rollback:', e);
        toast({
          title: 'Local Cache Revert Failed',
          description: 'Could not revert local cache changes after a failed deletion.',
          variant: 'error', 
          duration: 8000,
        });
      }
      if (storesBeforeDelete.find(s => s.id === storeId)) {
          setCurrentStore(storesBeforeDelete.find(s => s.id === storeId) || null);
      }
      return;
    }
  };

  const updateProductImagesArray = async (storeId, productId, newImagesArray) => {
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please log in to update product images.', variant: 'destructive' });
      return;
    }

    const storeToUpdate = stores.find(s => s.id === storeId);
    if (!storeToUpdate) {
      console.warn(`[StoreContext] updateProductImagesArray: Store with ID ${storeId} not found.`);
      toast({ title: "Update Failed", description: "Store not found for updating product images.", variant: "destructive" });
      return;
    }

    let productFound = false;
    let uploadedImageUrls = [];

    // Upload new images and collect all URLs
    for (const img of newImagesArray) {
      if (typeof img === 'string' && img.startsWith('data:image/')) { // Check if it's a base64 string
        try {
          const imagePath = `store_products/${storeId}/${productId}/gallery_${generateId()}.png`;
          const uploadedUrl = await uploadBase64ToFirebaseStorage(img, imagePath);
          if (uploadedUrl) {
            uploadedImageUrls.push(uploadedUrl);
          } else { // If uploadBase64ToFirebaseStorage returns null (e.g. invalid base64)
            uploadedImageUrls.push(DEFAULT_PLACEHOLDER_IMAGE_URL);
          }
        } catch (uploadError) {
          console.error(`Error uploading gallery image for product ${productId}:`, uploadError);
          toast({ title: 'Image Upload Failed', description: 'Could not upload one or more product gallery images.', variant: 'destructive' });
          uploadedImageUrls.push(DEFAULT_PLACEHOLDER_IMAGE_URL); // Use placeholder on error
        }
      } else if (typeof img === 'string' && img) { // Assume it's an existing URL and not empty
        uploadedImageUrls.push(img);
      } else { // If img is null, undefined, or empty string
        console.warn(`[StoreContext] updateProductImagesArray: Invalid or empty image in newImagesArray for product ${productId}`, img);
        uploadedImageUrls.push(DEFAULT_PLACEHOLDER_IMAGE_URL);
      }
    }
    // If after processing, uploadedImageUrls is empty AND there were images to process, add a placeholder.
    // This ensures that if all uploads fail or all inputs were invalid, we still have a placeholder.
    if (uploadedImageUrls.length === 0 && newImagesArray.length > 0) {
        uploadedImageUrls.push(DEFAULT_PLACEHOLDER_IMAGE_URL);
    }


    const updatedProducts = storeToUpdate.products.map(p => {
      if (p.id === productId) {
        productFound = true;
        // Ensure primaryImageSrc is set, even if uploadedImageUrls is empty (e.g., all uploads failed or newImagesArray was empty)
        const primaryImageSrc = uploadedImageUrls.length > 0 
          ? uploadedImageUrls[0] 
          : (p.image?.src?.medium || DEFAULT_PLACEHOLDER_IMAGE_URL);
        
        return { 
          ...p, 
          images: uploadedImageUrls.length > 0 ? uploadedImageUrls : [DEFAULT_PLACEHOLDER_IMAGE_URL], // Ensure 'images' is not empty if it's supposed to have images
          image: { 
            ...(p.image || { id: generateId(), alt: p.name || "Product Image" }), 
            src: { medium: primaryImageSrc, large: primaryImageSrc } 
          }
        };
      }
      return p;
    });

    if (!productFound) {
      console.warn(`[StoreContext] updateProductImagesArray: Product with ID ${productId} not found in store ${storeId}.`);
      toast({ title: "Update Failed", description: "Product not found for updating images.", variant: "destructive" });
      return;
    }

    // Update Firestore product document
    try {
      const productDocRef = doc(db, 'stores', storeId, 'products', productId);
      const productToUpdateInDb = updatedProducts.find(p => p.id === productId);
      if (productToUpdateInDb) {
        await updateDoc(productDocRef, { 
          images: productToUpdateInDb.images, 
          image: productToUpdateInDb.image 
        });
        toast({ title: "Product Images Updated", description: "The product's image gallery has been updated." });
      } else {
        throw new Error("Updated product data not found for Firestore update.");
      }
    } catch (error) {
      console.error('Error updating product images array in Firestore:', error);
      toast({ title: 'Cloud Sync Failed', description: `Failed to save product images to cloud: ${error.message}`, variant: 'destructive' });
      return; // Stop if cloud sync fails
    }

    // Update local state after successful cloud update
    setStores(prevStores => {
      const newStores = prevStores.map(store => {
        if (store.id === storeId) {
          return { ...store, products: updatedProducts };
        }
        return store;
      });
      try {
        localStorage.setItem('ecommerce-stores', JSON.stringify(prepareStoresForLocalStorage(newStores)));
      } catch (e) {
        console.error('Failed to save stores to localStorage during product images array update:', e);
        toast({
          title: 'Local Cache Update Failed',
          description: 'Could not update the local cache for product images array.',
          variant: 'warning',
          duration: 7000,
        });
      }
      return newStores;
    });

    if (currentStore && currentStore.id === storeId) {
      setCurrentStore(prevCurrent => prevCurrent ? { ...prevCurrent, products: updatedProducts } : null);
    }
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
      return { template_version: targetVersion }; // targetVersion here is already 'v1' if 'modern' was chosen
    }

    let updates = { template_version: targetVersion }; // targetVersion is 'v1', 'premium', etc.
    const themeFromCurrent = currentStoreState.theme || {};
    const currentActualVersion = currentStoreState.template_version;

    // 'v2' case is removed. 'modern' is handled as 'v1'.
    if (targetVersion === 'v1') { // This is for 'modern' template (internally 'v1')
      // If coming from a template that used a different main font, switch to Inter for 'modern' (v1)
      const nonModernFonts = ['Montserrat', 'PremiumMain', 'SharpFont', 'FreshFont', 'SleekFont']; // Example font names for other themes
      if (nonModernFonts.includes(themeFromCurrent.fontFamily) || !themeFromCurrent.fontFamily) {
        updates.theme = { ...themeFromCurrent, fontFamily: 'Inter' };
      } else {
        updates.theme = { ...themeFromCurrent }; // Keep existing if not conflicting or already Inter
      }
    } else if (targetVersion === 'premium') {
      updates.theme = { ...themeFromCurrent, fontFamily: 'PremiumMain' }; // Example font for premium
    }
    // Add other specific theme adjustments for 'sharp', 'fresh', 'sleek' if needed
    // e.g., else if (targetVersion === 'sharp') { updates.theme = { ...themeFromCurrent, fontFamily: 'SharpFont' }; }
    return updates;
  }, [stores]);


  const updateStoreTemplateVersion = async (storeId, newVersionInternal) => { // newVersionInternal is 'v1', 'premium', etc.
    if (!storeId || !newVersionInternal) { 
      toast({ title: 'Error', description: 'Store ID and new template version are required.', variant: 'destructive' });
      return;
    }

    const updatesForNewVersion = getUpdatesForVersion(storeId, newVersionInternal);
    
    await updateStore(storeId, updatesForNewVersion);
    
    let templateDisplayName = newVersionInternal;
    if (newVersionInternal === 'v1') templateDisplayName = 'Modern'; // Display 'Modern' for internal 'v1'
    // Removed 'v2' case
    else if (newVersionInternal === 'premium') templateDisplayName = 'Premium';
    else if (newVersionInternal === 'sharp') templateDisplayName = 'Sharp';
    else if (newVersionInternal === 'fresh') templateDisplayName = 'Fresh';
    else if (newVersionInternal === 'sleek') templateDisplayName = 'Sleek';
    // Capitalize first letter for others if not explicitly mapped
    else { templateDisplayName = newVersionInternal.charAt(0).toUpperCase() + newVersionInternal.slice(1); }

    toast({ title: 'Template Updated', description: `Store template is now ${templateDisplayName}.` });
  };

  const value = {
    stores, currentStore, isGenerating, isLoadingStores, cart, user,
    progress, statusMessage, // Expose new state
    loadStores, // Expose loadStores for manual triggering
    generateStore, updateStoreTextContent, // Added updateStoreTextContent
    checkStoreNameAvailability, // Expose the new function
    // importShopifyStore, // Replaced by wizard functions
    getStoreById, getStoreByName, updateStore, deleteStore, setCurrentStore, updateStorePassKey, assignStoreManager, updateStoreTemplateVersion,
    getProductById, updateProductImage, generateStoreFromWizard,
    addToCart, removeFromCart, updateQuantity, clearCart,
    generateAIProducts: generateAIProductsData,
    updateProductImagesArray, // Expose the new function
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
    updateShopifyPreviewProduct: (updatedProduct) => { // Added this function
      setShopifyPreviewProducts(prev => {
        const newEdges = prev.edges.map(edge => 
          edge.node.id === updatedProduct.id ? { ...edge, node: updatedProduct } : edge
        );
        return { ...prev, edges: newEdges };
      });
    },
    updateShopifyPreviewCollection: (updatedCollection) => { // Added this function
      setShopifyPreviewCollections(prev => {
        const newEdges = prev.edges.map(edge =>
          edge.node.id === updatedCollection.id ? { ...edge, node: updatedCollection } : edge
        );
        return { ...prev, edges: newEdges };
      });
    },

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

    // Product Finalization Modal related
    openProductFinalizationModal: (products, storeData) => {
      setProductsToFinalize(products);
      setStoreDataForFinalization(storeData);
      setIsProductFinalizationModalOpen(true);
    },
    closeProductFinalizationModal: () => {
      setIsProductFinalizationModalOpen(false);
      setProductsToFinalize([]);
      setStoreDataForFinalization(null);
      // Reset generation state if modal is closed without finalizing
      setIsGenerating(false); 
      setProgress(0);
      setStatusMessage('');
    },
    handleFinalizeProducts: async (finalizedProducts) => {
      if (!storeDataForFinalization) {
        toast({ title: 'Error', description: 'Store data for finalization is missing.', variant: 'destructive' });
        setIsProductFinalizationModalOpen(false);
        setIsGenerating(false);
        return;
      }
      setIsGenerating(true); // Set generating true for the final creation step
      setStatusMessage('Finalizing store creation...');
      setProgress(95); // Update progress

      const updatedStoreData = { ...storeDataForFinalization, products: finalizedProducts };
      try {
        const result = await commonStoreCreation(updatedStoreData);
        if (result) {
          setProgress(100);
          setStatusMessage('Store generation complete!');
          toast({ title: 'Store Created!', description: `Store "${result.name}" has been created.` });
          navigate(`/${result.urlSlug || generateStoreUrl(result.name)}`);
        } else {
          throw new Error("Store creation returned no result after finalization.");
        }
      } catch (error) {
        console.error('Error during final store creation after product finalization:', error);
        toast({ title: 'Finalization Failed', description: error.message || 'Failed to create store after finalization.', variant: 'destructive' });
        setProgress(0);
        setStatusMessage('Finalization failed.');
      } finally {
        setIsProductFinalizationModalOpen(false);
        setProductsToFinalize([]);
        setStoreDataForFinalization(null);
        setIsGenerating(false); // Ensure this is reset
      }
    },
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
      <ProductFinalizationModal
        isOpen={isProductFinalizationModalOpen}
        onClose={value.closeProductFinalizationModal}
        products={productsToFinalize}
        onFinalize={value.handleFinalizeProducts}
      />
    </StoreContext.Provider>
  );
};
