
import React, { useState, useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Wand2, UploadCloud, PlusCircle, Trash2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
// import { generateImageWithGemini } from '../lib/utils'; // Old import, to be replaced
import { 
  generateLogoWithGemini, 
  generateGenericProductImageWithGemini,
  generateCollectionImageWithGemini // Added for collection image generation
} from '../lib/geminiImageGeneration'; // New import for logo and product image generation
import { generateStoreNameSuggestions, generateStoreWayContent, generateHeroContent, generateStoreFeaturesContent } from '../lib/gemini'; // Import generateStoreFeaturesContent
import { generateProductWithGemini } from '../lib/geminiProductGeneration'; // This generates full product details
import { generateCollectionWithGemini } from '../lib/geminiCollectionGeneration'; // New import for collection generation
import { generateStoreDetailsFromPhotos } from '../lib/geminiImageUnderstanding'; // Import for photo analysis
import { analyzeStorePromptForStrategy } from '../lib/geminiPromptAnalysis'; // New: For prompt analysis
import { generateImageFromPromptForPod, visualizeImageOnProductWithGemini } from '../lib/geminiImageGeneration'; // New: For POD image generation
import { isStoreNameTaken } from '../lib/firebaseClient'; // Import the Firestore check function
import { renderWizardStepContent, isWizardNextDisabled } from '../components/wizard/wizardStepComponents'; // Removed productTypeOptions
import { podProductsList, productTypeOptions } from '../lib/constants'; // New: For POD product mockups and productTypeOptions
import { generateStoreUrl } from '../lib/utils.js';
 
const StoreWizard = ({ isEmbedded = false, onGenerationComplete, initialDataFromImport = null }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [storeNameSuggestions, setStoreNameSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    initialImportMethod: 'productType', // 'productType' or 'photos'
    productType: '',
    storeName: '',
    logoUrlLight: '', // For dark backgrounds
    logoUrlDark: '',  // For light backgrounds
    products: { source: 'ai', count: 3, items: [] }, 
    collections: { source: 'ai', count: 3, items: [] }, 
    prompt: '',
  });
  const [uploadedProductPhotos, setUploadedProductPhotos] = useState([]); // Stores { file, previewUrl, base64 }
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false); // For AI processing of uploaded photos
  const [isProcessing, setIsProcessing] = useState(false); // For AI suggestions/logo gen within wizard
  const [suggestionError, setSuggestionError] = useState(null);
  const [isGeneratingProductImageForIndex, setIsGeneratingProductImageForIndex] = useState(null); // For specific product image
  const [productImageGenerationError, setProductImageGenerationError] = useState(null); // Error for specific product image
  const [isGeneratingAnglesForIndex, setIsGeneratingAnglesForIndex] = useState(null); // For "Generate More Angles"
  const [angleGenerationError, setAngleGenerationError] = useState(null); // Error for "Generate More Angles"
  
  // State for collection image generation
  const [isGeneratingCollectionImageForIndex, setIsGeneratingCollectionImageForIndex] = useState(null);
  const [collectionImageGenerationError, setCollectionImageGenerationError] = useState(null);

  // State for store name availability check (placeholder, actual logic seems missing)
  const [isCheckingStoreName, setIsCheckingStoreName] = useState(false);
  const [storeNameAvailability, setStoreNameAvailability] = useState(null); // e.g., { status: 'available' | 'claimed' | 'error', message: '' }


  const { 
    generateStoreFromWizard, 
    isGenerating, 
    checkStoreNameAvailability,
    importedStoreDataForGenerator, // For embedded case
    isImportDataReadyForGenerator,  // For embedded case
    clearImportedStoreDataForGenerator // For embedded case
  } = useStore();

  useEffect(() => {
    if (isEmbedded && isImportDataReadyForGenerator && importedStoreDataForGenerator) {
      console.log("StoreWizard (Embedded) consuming imported data:", importedStoreDataForGenerator);
      setFormData(prev => ({
        ...prev,
        storeName: importedStoreDataForGenerator.name || prev.storeName,
        prompt: importedStoreDataForGenerator.prompt || prev.prompt,
        logoUrlLight: importedStoreDataForGenerator.logoUrl || prev.logoUrlLight,
        logoUrlDark: importedStoreDataForGenerator.logoUrl || prev.logoUrlDark,
        products: importedStoreDataForGenerator.products && importedStoreDataForGenerator.products.length > 0 ? {
          source: 'manual',
          count: importedStoreDataForGenerator.products.length,
          items: importedStoreDataForGenerator.products.map(p => ({
            name: p.name || '',
            price: p.price || '',
            description: p.description || '',
            images: p.images || [], // Assuming images is an array of URLs or base64 strings
            variants: p.variants || [],
          })),
        } : prev.products,
        collections: importedStoreDataForGenerator.collections && importedStoreDataForGenerator.collections.length > 0 ? {
          source: 'manual',
          count: importedStoreDataForGenerator.collections.length,
          items: importedStoreDataForGenerator.collections.map(c => ({
            name: c.name || '',
            description: c.description || '',
            imageUrl: c.imageUrl || '', 
            product_ids: c.product_ids || [],
          })),
        } : prev.collections,
      }));
      if (importedStoreDataForGenerator.name) {
        handleManualStoreNameCheck(importedStoreDataForGenerator.name); // Auto-check name
      }
      clearImportedStoreDataForGenerator();
    } else if (initialDataFromImport) { // Fallback for direct prop if context isn't ready/used
        setFormData(prev => ({
        ...prev,
        storeName: initialDataFromImport.name || prev.storeName,
        prompt: initialDataFromImport.prompt || prev.prompt,
        logoUrlLight: initialDataFromImport.logoUrl || prev.logoUrlLight,
        logoUrlDark: initialDataFromImport.logoUrl || prev.logoUrlDark,
        products: initialDataFromImport.products && initialDataFromImport.products.length > 0 ? {
          source: 'manual',
          count: initialDataFromImport.products.length,
          items: initialDataFromImport.products.map(p => ({
            name: p.name || '',
            price: p.price || '',
            description: p.description || '',
            images: p.images || [],
            variants: p.variants || [],
          })),
        } : prev.products,
        collections: initialDataFromImport.collections && initialDataFromImport.collections.length > 0 ? {
          source: 'manual',
          count: initialDataFromImport.collections.length,
          items: initialDataFromImport.collections.map(c => ({
            name: c.name || '',
            description: c.description || '',
            imageUrl: c.imageUrl || '',
            product_ids: c.product_ids || [],
          })),
        } : prev.collections,
      }));
      if (initialDataFromImport.name) {
        handleManualStoreNameCheck(initialDataFromImport.name);
      }
    }
  }, [isEmbedded, isImportDataReadyForGenerator, importedStoreDataForGenerator, clearImportedStoreDataForGenerator, initialDataFromImport]);


  // Manual Store Name Availability Check Handler
  const handleManualStoreNameCheck = async (nameToTest) => {
    const currentName = nameToTest || formData.storeName;
    if (!currentName) {
      setStoreNameAvailability({ status: 'error', message: 'Please enter a store name to check.' });
      return;
    }
    setIsCheckingStoreName(true);
    setStoreNameAvailability(null);
    setSuggestionError(null);

    try {
      const isTaken = await isStoreNameTaken(formData.storeName);
      if (isTaken) {
        setStoreNameAvailability({ status: 'claimed', message: 'Not available' });
      } else {
        setStoreNameAvailability({ status: 'available', message: 'Available' });
      }
    } catch (apiError) {
      console.error("Store name availability check failed:", apiError);
      // The error from isStoreNameTaken is "Failed to check store name availability due to a database error."
      // We can use that directly or a more user-friendly one.
      setStoreNameAvailability({ status: 'error', message: apiError.message || 'Could not check store name. Please try again.' });
    } finally {
      setIsCheckingStoreName(false);
    }
  };

  useEffect(() => {
    // Clear "store name empty" related errors from suggestionError if storeName becomes non-empty
    if (formData.storeName && suggestionError) {
      const lowerError = suggestionError.toLowerCase();
      if (lowerError.includes("store name") && (lowerError.includes("empty") || lowerError.includes("required"))) {
        setSuggestionError(null);
      }
    }

    // Placeholder for debounced store name availability check logic
    // This logic seems to be missing from the current StoreWizard.jsx context.
    // It would typically be a useEffect hook that watches formData.storeName.
    if (formData.storeName && step === 2) { // Assuming check is most relevant on Step 2
      const handler = setTimeout(async () => {
        setIsCheckingStoreName(true);
        setStoreNameAvailability(null); // Reset status
        setSuggestionError(null); // Clear previous name-related errors

        try {
          const isTaken = await isStoreNameTaken(formData.storeName);
          if (isTaken) {
            setStoreNameAvailability({ status: 'claimed', message: 'This store name is already taken.' });
          } else {
            setStoreNameAvailability({ status: 'available', message: 'Store name is available!' });
          }
        } catch (apiError) {
          console.error("Store name availability check failed:", apiError);
          setStoreNameAvailability({ status: 'error', message: apiError.message || 'Could not check store name. Please try again.' });
        } finally {
          setIsCheckingStoreName(false);
        }
      }, 750); // Debounce for 750ms

      return () => {
        clearTimeout(handler);
      };
    } else if (!formData.storeName && step === 2) {
      // If store name is cleared on step 2, reset availability status
      setStoreNameAvailability(null); 
      // Optionally set suggestionError here if name is required and empty on step 2,
      // but this might conflict with isWizardNextDisabled.
      // For now, isWizardNextDisabled handles gating.
    }
  }, [formData.storeName, step, suggestionError]); // Rerun effect if storeName, step, or suggestionError changes


  const handleInitialImportMethodChange = (value) => {
    setFormData(prev => ({ 
      ...prev, 
      initialImportMethod: value,
      // Optionally reset other fields if switching method
      productType: value === 'photos' ? '' : prev.productType, 
    }));
    if (value === 'productType') {
      setUploadedProductPhotos([]); // Clear photos if switching back to productType
    }
  };

  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProductPhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Basic validation (e.g., max number of files)
    const MAX_FILES = 10; // Example limit
    if (uploadedProductPhotos.length + files.length > MAX_FILES) {
      setSuggestionError(`You can upload a maximum of ${MAX_FILES} photos.`);
      return;
    }
    setSuggestionError(null);

    const newPhotosPromises = files.map(async (file) => {
      try {
        const base64 = await fileToDataURL(file);
        return {
          file,
          previewUrl: URL.createObjectURL(file), // For quick preview
          base64, // For sending to AI
          name: file.name,
          type: file.type,
        };
      } catch (error) {
        console.error("Error processing file:", file.name, error);
        // Optionally set an error for this specific file or skip it
        return null; 
      }
    });

    const newPhotos = (await Promise.all(newPhotosPromises)).filter(Boolean); // Filter out nulls from errors

    setUploadedProductPhotos(prevPhotos => {
      const combined = [...prevPhotos, ...newPhotos];
      // Clean up old object URLs to prevent memory leaks when component unmounts or photos are replaced
      // This is a simplified cleanup; more robust cleanup might be needed in useEffect's return
      prevPhotos.forEach(photo => {
        if (photo.previewUrl && photo.previewUrl.startsWith('blob:')) {
          // URL.revokeObjectURL(photo.previewUrl); // Be careful with revoking if still in use
        }
      });
      return combined;
    });

    // If initialImportMethod is 'photos', trigger AI processing
    if (formData.initialImportMethod === 'photos' && newPhotos.length > 0) {
      setIsProcessingPhotos(true);
      setSuggestionError(null);
      try {
        // Pass only the necessary info: base64, mimeType, name
        const photosForAI = uploadedProductPhotos.concat(newPhotos).map(p => ({ 
          base64: p.base64, 
          mimeType: p.type, 
          name: p.name 
        }));

        const aiResults = await generateStoreDetailsFromPhotos(photosForAI);

        if (aiResults.error) {
          setSuggestionError(aiResults.error);
        } else {
          setFormData(prev => ({
            ...prev,
            productType: aiResults.productType || prev.productType,
            storeName: aiResults.storeNameSuggestions && aiResults.storeNameSuggestions.length > 0 
                       ? aiResults.storeNameSuggestions[0] 
                       : prev.storeName,
            // Products: set source to 'manual' so they appear in the editable list
            products: {
              source: 'manual', // So user can edit them as if manually added
              count: aiResults.products.length, // Update count based on AI results
              items: aiResults.products.map(p => ({
                name: p.name || '',
                price: p.price || '',
                description: p.description || '',
                images: p.images || [], // p.images should be [original_base64_image]
                variants: [], // Start with no variants, user can add
                isFromPhotoAI: true, // Flag to identify these products
              })),
            },
            // Collections: set source to 'manual'
            collections: {
              source: 'manual',
              count: aiResults.collections.length,
              items: aiResults.collections.map(c => ({
                name: c.name || '',
                description: c.description || '',
                imageUrl: '', // User can add image later
                product_ids: [], // User can assign products later
                isFromPhotoAI: true, // Flag
              })),
            },
            prompt: aiResults.storePrompt || prev.prompt,
          }));
          if (aiResults.storeNameSuggestions && aiResults.storeNameSuggestions.length > 0) {
            setStoreNameSuggestions(aiResults.storeNameSuggestions);
          }
          // Optionally, display logoDescription or use it in Step 3
          if (aiResults.logoDescription) {
            console.log("AI Logo Description:", aiResults.logoDescription);
            // Could store this in a new state: setAiLogoDescription(aiResults.logoDescription);
          }
          // Potentially auto-navigate to the next step if all goes well, or let user click next.
          // For now, user clicks next.
        }
      } catch (error) {
        console.error("Error processing photos with AI:", error);
        setSuggestionError(`Failed to process images with AI: ${error.message}`);
      } finally {
        setIsProcessingPhotos(false);
      }
    }
  };

  const removeUploadedProductPhoto = (indexToRemove) => {
    setUploadedProductPhotos(prevPhotos => {
      const photoToRemove = prevPhotos[indexToRemove];
      if (photoToRemove && photoToRemove.previewUrl && photoToRemove.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photoToRemove.previewUrl);
      }
      return prevPhotos.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductTypeChange = (value) => {
    setFormData(prev => ({ ...prev, productType: value }));
  };

  const handleProductSourceChange = (value) => {
    setFormData(prev => ({ ...prev, products: { ...prev.products, source: value } }));
  };

  const handleProductCountChange = (e) => {
    setFormData(prev => ({ ...prev, products: { ...prev.products, count: parseInt(e.target.value) || 1 } }));
  };

  const handleManualProductChange = (index, field, value) => {
    const newItems = [...formData.products.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, products: { ...prev.products, items: newItems } }));
  };

  const addManualProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: {
        ...prev.products,
        // Manual products will now have an 'images' array
        items: [...prev.products.items, { name: '', price: '', description: '', images: [] }],
      },
    }));
  };

  const removeManualProduct = (index) => {
    const newItems = formData.products.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, products: { ...prev.products, items: newItems } }));
  };

  const suggestStoreNameHandler = async () => {
    if (!formData.productType) {
      setSuggestionError("Please select a product type first.");
      return;
    }
    setIsProcessing(true);
    setStoreNameSuggestions([]);
    setSuggestionError(null);
    try {
      const productDescription = productTypeOptions.find(p => p.value === formData.productType)?.label || formData.productType; // productTypeOptions is now from constants
      // Use the new function that returns multiple suggestions
      const result = await generateStoreNameSuggestions(productDescription);
      if (result.error) {
        console.error("Failed to suggest store names:", result.error);
        setSuggestionError(result.error);
        setStoreNameSuggestions([]);
      } else if (result.suggestions && result.suggestions.length > 0) {
        setStoreNameSuggestions(result.suggestions);
        // Optionally, set the first suggestion as the current store name
        // setFormData(prev => ({ ...prev, storeName: result.suggestions[0] }));
      } else {
        setSuggestionError("No suggestions received, or response was empty.");
        setStoreNameSuggestions([]);
      }
    } catch (error) {
      console.error("Error in suggestStoreNameHandler:", error);
      setSuggestionError(`An unexpected error occurred: ${error.message}`);
      setStoreNameSuggestions([]);
    }
    setIsProcessing(false);
  };

  const handleSuggestionClick = (name) => {
    setFormData(prev => ({ ...prev, storeName: name }));
    setStoreNameSuggestions([]); // Clear suggestions after one is picked
  };

  const generateLogoHandler = async () => {
    if (!formData.storeName) {
      // ProductType might not be strictly necessary if the new function only uses storeName
      // but it's good for context if the underlying prompt generation uses it.
      // The new `generateLogoWithGemini` only takes `storeName`.
      console.warn("Store name is required to generate a logo.");
      setSuggestionError("Please ensure a store name is set before generating a logo.");
      return;
    }
    setIsProcessing(true);
    setSuggestionError(null); // Clear previous errors
    try {
      // generateLogoWithGemini will now return an object with logoUrlLight and logoUrlDark
      const logoResults = await generateLogoWithGemini(formData.storeName);
      if (logoResults && (logoResults.logoUrlLight || logoResults.logoUrlDark)) {
        setFormData(prev => ({ 
          ...prev, 
          logoUrlLight: logoResults.logoUrlLight || '', 
          logoUrlDark: logoResults.logoUrlDark || '' 
        }));
        console.log("Logos generated and URLs set:", logoResults);
        if (logoResults.textResponse) {
          console.log("Gemini text response for logo generation:", logoResults.textResponse);
        }
      } else {
        console.error("Failed to generate logos: No image data received for either version.");
        setSuggestionError("Failed to generate logo. The AI did not return sufficient image data.");
      }
    } catch (error) {
      console.error("Failed to generate logos:", error);
      setSuggestionError(`Logo generation failed: ${error.message}`);
    }
    setIsProcessing(false);
  };

  const generateAiProductsHandler = async () => {
    if (!formData.productType || !formData.storeName) {
      setSuggestionError("Please provide a product type and store name before generating AI products.");
      return;
    }
    setIsProcessing(true);
    setSuggestionError(null);
    let generatedItems = [];
    try {
      // Analyze the prompt first
      const analysisResult = await analyzeStorePromptForStrategy(formData.prompt, formData.productType);
      console.log("Prompt Analysis Result:", analysisResult);

      if (analysisResult.error || analysisResult.strategy === 'error') {
        setSuggestionError(analysisResult.error || "Failed to analyze store prompt for product strategy.");
        setIsProcessing(false);
        return;
      }

      let logoImageBase64 = null;
      let logoMimeType = 'image/png';
      const primaryLogoUrl = formData.logoUrlLight || formData.logoUrlDark;
      if (primaryLogoUrl && primaryLogoUrl.startsWith('data:')) {
        const parts = primaryLogoUrl.split(',');
        if (parts.length === 2) {
          logoImageBase64 = parts[1];
          const mimeTypeMatch = parts[0].match(/:(.*?);/);
          if (mimeTypeMatch && mimeTypeMatch[1]) logoMimeType = mimeTypeMatch[1];
        }
      }

      if (analysisResult.strategy === 'standard') {
        console.log("Strategy: Standard Product Generation");
        for (let i = 0; i < formData.products.count; i++) {
          console.log(`Generating AI product ${i + 1} of ${formData.products.count}...`);
          const productData = await generateProductWithGemini(
            formData.productType,
            formData.storeName,
            logoImageBase64,
            logoMimeType,
            generatedItems.map(p => p.name),
            undefined, 
            undefined, 
            undefined, 
            formData.prompt
          );
          if (productData && productData.images && productData.images.length > 0) {
            generatedItems.push({
              name: productData.title,
              description: productData.description,
              price: productData.price,
              images: productData.images,
              variants: productData.variants || [],
            });
          } else {
            console.warn(`Failed to generate full data for standard product ${i + 1}. Skipping.`);
          }
        }
      } else if (analysisResult.strategy === 'pod_theme_visualization' || analysisResult.strategy === 'pod_specific_products') {
        console.log(`Strategy: Print on Demand - ${analysisResult.strategy}`);
        const baseDesignPrompt = analysisResult.theme && analysisResult.theme !== "General" ?
          `Design for print-on-demand products for a store themed '${analysisResult.theme}'. Store name: ${formData.storeName}. User prompt: ${formData.prompt}` :
          `Versatile design for print-on-demand products based on store prompt: "${formData.prompt}". Store name: ${formData.storeName}.`;

        const numberOfDesignsToGenerate = 6;
        let generatedDesigns = [];

        for (let i = 0; i < numberOfDesignsToGenerate; i++) {
          // Add a suffix to prompt for variety if desired, or rely on API's inherent randomness
          const designPromptWithVariety = `${baseDesignPrompt} (Design variation ${i + 1} of ${numberOfDesignsToGenerate}, ensure it's distinct from previous designs for this store if any were made).`;
          console.log(`Generating POD design ${i + 1}/${numberOfDesignsToGenerate}...`);
          const designImageResult = await generateImageFromPromptForPod({ prompt: designPromptWithVariety });
          if (designImageResult && designImageResult.imageData) {
            generatedDesigns.push({
              base64: designImageResult.imageData,
              mimeType: designImageResult.imageMimeType || 'image/png',
              prompt: designPromptWithVariety, // Store the specific prompt used for this design
            });
          } else {
            console.warn(`Failed to generate POD design ${i + 1}.`);
            // Optionally, try to generate fewer designs or break
          }
        }

        if (generatedDesigns.length === 0) {
          setSuggestionError("Failed to generate any base designs for POD products.");
          setIsProcessing(false);
          return;
        }
        
        // Select unique mockups, up to the number of designs generated
        let availableMockups = [...podProductsList];
        let selectedMockups = [];
        for(let i = 0; i < Math.min(generatedDesigns.length, availableMockups.length) ; i++){
            const randomIndex = Math.floor(Math.random() * availableMockups.length);
            selectedMockups.push(availableMockups.splice(randomIndex, 1)[0]);
        }
        
        if (selectedMockups.length === 0) {
            setSuggestionError("No POD mockup products available for visualization.");
            setIsProcessing(false);
            return;
        }

        for (let i = 0; i < Math.min(generatedDesigns.length, selectedMockups.length); i++) {
          const design = generatedDesigns[i];
          const podBaseProduct = selectedMockups[i];
          
          console.log(`Visualizing design ${i+1} on ${podBaseProduct.name}...`);
          
          const vizResult = await visualizeImageOnProductWithGemini(
            design.base64,
            design.mimeType,
            podBaseProduct.imageUrl,
            analysisResult.theme || formData.prompt, 
            podBaseProduct.name
          );

          if (vizResult && vizResult.visualizedImageData && vizResult.productDetails) {
            const originalDesignImageUrl = `data:${design.mimeType};base64,${design.base64}`;
            const visualizedProductImageUrl = `data:${vizResult.visualizedImageMimeType};base64,${vizResult.visualizedImageData}`;
            
            generatedItems.push({
              name: vizResult.productDetails.title,
              price: parseFloat(vizResult.productDetails.price).toFixed(2),
              description: vizResult.productDetails.description,
              images: [originalDesignImageUrl, visualizedProductImageUrl], // Gallery: original design + visualized product
              isPrintOnDemand: true,
              podDetails: {
                originalDesignImageUrl: originalDesignImageUrl,
                designPrompt: design.prompt, // Store the prompt used for this specific design
                baseProductName: podBaseProduct.name,
                baseProductImageUrl: podBaseProduct.imageUrl,
              },
              variants: vizResult.productDetails.variants || [],
            });
          } else {
            console.warn(`Failed to visualize design ${i+1} on ${podBaseProduct.name}. Skipping.`);
          }
        }
      }

      setFormData(prev => ({
        ...prev,
        products: { ...prev.products, items: generatedItems },
      }));

      if (generatedItems.length === 0 && formData.products.count > 0) {
        setSuggestionError("AI failed to generate any products with the selected strategy. Please try again or adjust settings.");
      }

    } catch (error) {
      console.error("Error generating AI products:", error);
      setSuggestionError(`Failed to generate AI products: ${error.message}`);
    }
    setIsProcessing(false);
  };

  const generateAiCollectionsHandler = async () => {
    if (!formData.productType || !formData.storeName || formData.products.items.length === 0) {
      setSuggestionError("Please ensure product type, store name, and at least one product are set before generating AI collections.");
      return;
    }
    setIsProcessing(true);
    setSuggestionError(null);
    const generatedItems = [];
    const existingCollectionNames = formData.collections.items.map(c => c.name); // Get names of already generated collections
    try {
      for (let i = 0; i < formData.collections.count; i++) {
        console.log(`Generating AI collection ${i + 1} of ${formData.collections.count}...`);
        const collectionData = await generateCollectionWithGemini(
          formData.productType,
          formData.storeName,
          formData.products.items, // Pass existing products for context
          existingCollectionNames // Pass existing names to avoid duplicates
        );
        if (collectionData && !collectionData.error && collectionData.name && collectionData.description && collectionData.product_ids) {
          let finalCollectionImageUrl = `https://via.placeholder.com/400x200.png?text=${encodeURIComponent(collectionData.name || "Collection")}`;
          if (collectionData.imageData) {
            finalCollectionImageUrl = `data:image/png;base64,${collectionData.imageData}`;
          }
          generatedItems.push({
            name: collectionData.name,
            description: collectionData.description,
            imageUrl: finalCollectionImageUrl, // Use the data URL or placeholder
            product_ids: collectionData.product_ids, 
          });
          // Add the newly generated name to the list for subsequent calls in this loop
          if (collectionData.name) {
            existingCollectionNames.push(collectionData.name);
          }
        } else {
          console.warn(`Failed to generate full data for collection ${i + 1}. Skipping.`);
        }
      }
      // Update with all newly generated items. If some failed, they won't be in generatedItems.
      // If you want to append to existing AI-generated collections instead of replacing:
      // const newCollectionItems = [...formData.collections.items, ...generatedItems];
      // For now, it replaces, which is fine if "Generate Collections" is a one-off action for the current count.
      setFormData(prev => ({
        ...prev,
        collections: { ...prev.collections, items: generatedItems }, // This replaces existing AI collections
      }));
      if (generatedItems.length === 0 && formData.collections.count > 0) {
        setSuggestionError("AI failed to generate any collections. Please try again or adjust settings.");
      }
    } catch (error) {
      console.error("Error generating AI collections:", error);
      setSuggestionError(`Failed to generate AI collections: ${error.message}`);
    }
    setIsProcessing(false);
  };

  const handleGenerateManualProductImage = async (productIndex) => {
    const product = formData.products.items[productIndex];
    if (!product || !product.name) {
      setProductImageGenerationError("Product name is required to generate an image.");
      return;
    }
    setIsGeneratingProductImageForIndex(productIndex);
    setProductImageGenerationError(null);
    try {
      const result = await generateGenericProductImageWithGemini(product.name, product.description);
      if (result && result.imageData) {
        const imageUrl = `data:image/png;base64,${result.imageData}`;
        const newItems = [...formData.products.items];
        // Replace all existing images or add as the first one if array is empty/to be overwritten by main generated image
        newItems[productIndex].images = [imageUrl]; 
        setFormData(prev => ({ ...prev, products: { ...prev.products, items: newItems } }));
      } else {
        throw new Error(result.textResponse || "Failed to generate product image data.");
      }
    } catch (error) {
      console.error(`Error generating image for product ${productIndex}:`, error);
      setProductImageGenerationError(error.message); // Keep existing error state for this specific action
    } finally {
      setIsGeneratingProductImageForIndex(null);
    }
  };

  const handleGenerateMoreAngles = async (productIndex) => {
    const product = formData.products.items[productIndex];
    // Use the first image in the 'images' array as the base for generating angles
    if (!product || !product.images || product.images.length === 0) {
      setAngleGenerationError("At least one image must be uploaded or generated first to create more angles.");
      return;
    }
    const baseImageUrl = product.images[0]; // Use the first image

    setIsGeneratingAnglesForIndex(productIndex);
    setAngleGenerationError(null);
    try {
      const { generateDifferentAnglesFromImage } = await import('@/lib/geminiImageGeneration');
      
      const parts = baseImageUrl.split(',');
      if (parts.length !== 2) {
        throw new Error("Invalid base image URL format for angle generation.");
      }
      const metaPart = parts[0]; 
      const base64Data = parts[1];
      const mimeTypeMatch = metaPart.match(/:(.*?);/);
      if (!mimeTypeMatch || !mimeTypeMatch[1]) {
        throw new Error("Could not determine mime type from base image URL.");
      }
      const mimeType = mimeTypeMatch[1];

      const newAngleImages = await generateDifferentAnglesFromImage(base64Data, mimeType, product.name || "Product");

      const newItems = [...formData.products.items];
      // Append new angles to existing images, ensuring no duplicates if re-run
      const existingImages = newItems[productIndex].images || [];
      newItems[productIndex].images = [...existingImages, ...newAngleImages.filter(img => !existingImages.includes(img))];
      setFormData(prev => ({ ...prev, products: { ...prev.products, items: newItems } }));

    } catch (error) {
      console.error(`Error generating more angles for product ${productIndex}:`, error);
      setAngleGenerationError(error.message || "Failed to generate additional angles.");
    } finally {
      setIsGeneratingAnglesForIndex(null);
    }
  };

  const handleGenerateCollectionImage = async (collectionIndex) => {
    const collection = formData.collections.items[collectionIndex];
    if (!collection || !collection.name) {
      setCollectionImageGenerationError("Collection name is required to generate an image.");
      // Potentially clear any existing image for this collection if generation is attempted without name
      // const newItems = [...formData.collections.items];
      // newItems[collectionIndex].imageUrl = ''; 
      // setFormData(prev => ({ ...prev, collections: { ...prev.collections, items: newItems } }));
      return;
    }

    setIsGeneratingCollectionImageForIndex(collectionIndex);
    setCollectionImageGenerationError(null);
    setSuggestionError(null); // Clear general suggestion error

    try {
      const result = await generateCollectionImageWithGemini(collection.name, collection.description);
      if (result && result.imageData && result.imageMimeType) {
        const imageUrl = `data:${result.imageMimeType};base64,${result.imageData}`;
        const newItems = [...formData.collections.items];
        newItems[collectionIndex].imageUrl = imageUrl;
        setFormData(prev => ({ ...prev, collections: { ...prev.collections, items: newItems } }));
      } else {
        throw new Error(result.textResponse || "Failed to generate collection image data.");
      }
    } catch (error) {
      console.error(`Error generating image for collection ${collectionIndex} ("${collection.name}"):`, error);
      setCollectionImageGenerationError(error.message || "Unknown error during collection image generation.");
      // Clear the image URL if generation failed
      const newItems = [...formData.collections.items];
      newItems[collectionIndex].imageUrl = ''; 
      setFormData(prev => ({ ...prev, collections: { ...prev.collections, items: newItems } }));

    } finally {
      setIsGeneratingCollectionImageForIndex(null);
    }
  };
 
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
 
  const handleSubmit = async () => {
    setIsProcessing(true); // Indicate processing for the final step
    setSuggestionError(null);
    try {
      // Prepare storeInfo for content generation
      const storeInfo = {
        name: formData.storeName,
        niche: formData.productType, // Or a more detailed niche if available
        description: formData.prompt, // User's initial prompt could serve as description
        // targetAudience and style could be added if collected, or use defaults in gemini.js
      };

      // Generate Hero Content
      const heroContent = await generateHeroContent(storeInfo);
      if (heroContent.error) {
        console.warn("Failed to generate hero content:", heroContent.error);
        // Decide if this is a critical failure or if we can proceed without it
      }

      // Generate Store Way Content
      const storeWayData = await generateStoreWayContent(storeInfo);
      if (storeWayData.error) {
        console.warn("Failed to generate store way content:", storeWayData.error);
      }

      // Generate Store Features Content
      const storeFeaturesData = await generateStoreFeaturesContent(storeInfo);
      if (storeFeaturesData.error) {
        console.warn("Failed to generate store features content:", storeFeaturesData.error);
      }

      // Combine all data
      const finalFormData = {
        ...formData,
        content: {
          ...(formData.content || {}), // Preserve any existing content
          hero: heroContent && !heroContent.error ? heroContent : undefined,
          storeWay: storeWayData && !storeWayData.error ? storeWayData : undefined,
          storeFeatures: storeFeaturesData && !storeFeaturesData.error ? storeFeaturesData : undefined, // Add store features content
        },
      };
      
      const newStore = await generateStoreFromWizard(finalFormData);

      if (newStore) {
        if (isEmbedded && onGenerationComplete) {
          onGenerationComplete(newStore); // Pass the new store data back
        } else if (!isEmbedded) {
          const storeUrlPath = `/${newStore.urlSlug || generateStoreUrl(newStore.name)}`;
          navigate(storeUrlPath);
        }
      }
      // If newStore is null, generateStoreFromWizard would have already shown an error toast.

    } catch (error) {
      // This catch block might be redundant if generateStoreFromWizard handles all its errors
      // and doesn't rethrow, or if it rethrows errors that aren't already toasted.
      // For now, keeping it for any unexpected errors from the content generation part.
      console.error("Error during final store generation steps or navigation:", error);
      setSuggestionError(`An error occurred during final store setup: ${error.message}`);
      // Potentially revert optimistic UI changes or notify user more specifically
    } finally {
      setIsProcessing(false); // Stop final processing indication
    }
  };

  const stepProps = {
    formData,
    setFormData, // Ensure setFormData is passed down
    handleInputChange,
    handleProductTypeChange,
    handleProductSourceChange,
    handleProductCountChange,
    handleManualProductChange,
    addManualProduct,
    removeManualProduct,
    suggestStoreName: suggestStoreNameHandler,
    generateLogo: generateLogoHandler,
    generateAiProducts: generateAiProductsHandler,
    generateAiCollections: generateAiCollectionsHandler, 
    handleGenerateManualProductImage, 
    handleGenerateMoreAngles, // Pass new handler for angles
    isProcessing,
    isGeneratingProductImageForIndex, 
    productImageGenerationError, 
    isGeneratingAnglesForIndex, // Pass new state for angles
    angleGenerationError, // Pass new error state for angles
    productTypeOptions,
    storeNameSuggestions,
    handleSuggestionClick,
    suggestionError,
    // Pass new props for Step 1 photo upload
    handleInitialImportMethodChange,
    handleProductPhotoUpload,
    uploadedProductPhotos,
    removeUploadedProductPhoto,
    isProcessingPhotos,
    // Pass props for collection image generation
    handleGenerateCollectionImage,
    isGeneratingCollectionImageForIndex,
    collectionImageGenerationError,
    // Pass props for store name availability (even if placeholders for now)
    isCheckingStoreName,
    storeNameAvailability, // Ensure this has a comma if not the last actual property before new ones
    handleManualStoreNameCheck // This is now the last property, so no trailing comma needed
  };

  // Conditional rendering for embedded mode (e.g., hide main card shell)
  if (isEmbedded) {
    // Render only the step content and a specific "Generate" button for the final step
    // The parent (ImportWizard) will handle the overall modal structure.
    return (
      <div className="w-full p-2"> {/* Padding for embedded content */}
        <AnimatePresence mode="wait">
          {renderWizardStepContent(step, stepProps)}
        </AnimatePresence>
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={prevStep} disabled={(step === 1 || isGenerating || isProcessingPhotos)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {step < 6 ? (
            <Button onClick={nextStep} disabled={(isWizardNextDisabled(step, formData, uploadedProductPhotos) || isGenerating || isProcessingPhotos)}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={(isProcessing || isGenerating || isProcessingPhotos || !formData.prompt)}
              className="bg-primary hover:bg-primary/90" // Ensure consistent styling
            >
              {(isProcessing || isGenerating) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate Store
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto"> {/* Replaced Card with div and removed shadow-xl */}
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Store Creation Wizard</CardTitle>
        <CardDescription>Step {step} of 6: Let's build your online store together!</CardDescription>
        <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2.5 mt-2">
            <motion.div
                className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full"
                initial={{ width: "0%"}}
                animate={{ width: `${(step / 6) * 100}%`}}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>
      </CardHeader>
      <CardContent className="min-h-[250px] flex items-center">
        <AnimatePresence mode="wait">
          {renderWizardStepContent(step, stepProps)}
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={(step === 1 || isGenerating || isProcessingPhotos)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        {step < 6 ? (
          <Button onClick={nextStep} disabled={(isWizardNextDisabled(step, formData, uploadedProductPhotos) || isGenerating || isProcessingPhotos)}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={(isProcessing || isGenerating || isProcessingPhotos || !formData.prompt)}
          >
            {(isProcessing || isGenerating) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate Store
          </Button>
        )}
      </CardFooter>
    </div> // Replaced Card with div
  );
};

export default StoreWizard;
