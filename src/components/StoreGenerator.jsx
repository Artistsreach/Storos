import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Wand2, Loader2, AlertCircle, CheckCircle, Sparkles, Upload, X, Paperclip, FileText } from 'lucide-react'; // Added Upload, X, Paperclip, FileText
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { cn, useDebounce } from "@/lib/utils"; // For conditional class names
import { isStoreNameTaken } from '../lib/firebaseClient'; // Import the Firestore check function
import { generateStoreNameSuggestions } from '../lib/gemini';
import { generateImageFromPromptForPod, visualizeImageOnProductWithGemini } from '../lib/geminiImageGeneration';
import { podProductsList as allPodProductOptions } from '../lib/constants';
import { generateId } from '../lib/utils.jsx';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import DropshippingModal from './DropshippingModal';
import ProductEditModal from './store/ProductEditModal';

const promptExamples = [
  "Create a luxury jewelry store called 'Elegance' with diamond rings and gold necklaces, featuring a dark, sophisticated theme.",
  "Build a tech gadget store named 'FutureTech' with the latest smartphones and accessories, using a futuristic blue and silver color scheme.",
  "Design an organic food market 'GreenHarvest' with fresh produce and healthy snacks, emphasizing natural textures and earthy tones.",
  "Make a trendy fashion boutique 'Urban Threads' with summer dresses and casual wear, aiming for a bright, minimalist aesthetic."
];

const storeNicheConfig = {
  "Healthy Food": {
    keywords: ["healthy food", "organic food", "greenharvest", "fresh produce", "natural food", "health store"],
    primaryColor: "green",
    secondaryColor: "orange",
    templates: ["Classic", "Fresh", "Sleek"],
  },
  "Fast Food": {
    keywords: ["fast food", "burgers", "fries", "pizza", "takeaway", "quick serve"],
    primaryColor: "red",
    secondaryColor: "orange",
    templates: ["Premium", "Modern", "Classic", "Fresh", "Sleek"],
  },
  "Technology": {
    keywords: ["tech", "gadget", "electronics", "software", "computer", "phone", "futuretech"],
    primaryColor: "blue",
    secondaryColor: "purple",
    templates: ["Classic", "Fresh", "Sleek", "Sharp", "Premium", "Modern"],
  },
  "General Store": {
    keywords: ["general store", "variety store", "convenience store", "department store"],
    primaryColor: "navy",
    secondaryColor: "grey",
    templates: ["Classic", "Fresh", "Sleek", "Premium", "Modern"],
  },
  "Female Fashion/Beauty": {
    keywords: ["female fashion", "beauty", "cosmetics", "makeup", "women's clothing", "boutique", "urban threads"],
    primaryColor: "peach",
    secondaryColor: "purple",
    templates: ["Classic", "Fresh", "Sleek"],
  },
  "Jewelry": {
    keywords: ["jewelry", "rings", "necklaces", "earrings", "diamonds", "gold", "elegance"],
    primaryColor: "grey",
    secondaryColor: "darkpurple", // Assuming darkpurple is a defined color or will be
    templates: ["Classic", "Fresh", "Sleek", "Premium", "Modern"],
  },
  "Fashion": { // General fashion, can be refined by other keywords
    keywords: ["fashion", "clothing", "apparel", "style", "wear"],
    primaryColor: "navyblue", // Assuming navyblue
    secondaryColor: "mediumred", // Assuming mediumred
    templates: ["Classic", "Fresh", "Sleek", "Premium", "Modern"],
  },
  "Furniture": {
    keywords: ["furniture", "home decor", "sofa", "table", "chair", "furnishings"],
    primaryColor: "brown",
    secondaryColor: "darkgrey", // Assuming darkgrey
    templates: ["Classic", "Fresh", "Sleek"],
  },
  // Default/fallback
  "Default": {
    keywords: [], // No specific keywords, will be used as a fallback
    primaryColor: "blue", // A sensible default (can be adjusted if Fresh has a preferred default color scheme)
    secondaryColor: "gray",
    templates: ["Fresh", "Classic", "Sleek", "Modern"], // "Fresh" is now the first option
  }
};

const getStoreNicheDetails = (promptText) => {
  const lowerPrompt = promptText.toLowerCase();
  for (const nicheName in storeNicheConfig) {
    if (nicheName === "Default") continue; // Skip default for keyword matching
    const niche = storeNicheConfig[nicheName];
    if (niche.keywords.some(keyword => lowerPrompt.includes(keyword.toLowerCase()))) {
      return { ...niche, name: nicheName };
    }
  }
  return { ...storeNicheConfig["Default"], name: "General Store" }; // Fallback to default
};

const StoreGenerator = () => {
  const [storeName, setStoreName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedExample, setSelectedExample] = useState(null);
  const [isPrintOnDemand, setIsPrintOnDemand] = useState(false);
  const [isDropshipping, setIsDropshipping] = useState(false);
  const [isDropshippingModalOpen, setIsDropshippingModalOpen] = useState(false);
  const [dropshippingProducts, setDropshippingProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [contextFiles, setContextFiles] = useState([]); // Now stores { file: File, previewUrl: string | null }
  const fileInputRef = useRef(null);
  const { 
    generateStore, 
    isGenerating,
    importedStoreDataForGenerator,
    isImportDataReadyForGenerator,
    clearImportedStoreDataForGenerator,
    stores,
    openAuthModal
  } = useStore();
  const { isAuthenticated } = useAuth();
  
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [storeNameAvailability, setStoreNameAvailability] = useState(null); // { status: 'available'|'claimed'|'error', message: '...' }
  const [suggestedNames, setSuggestedNames] = useState([]);
  const [isSuggestingNames, setIsSuggestingNames] = useState(false);
  const [suggestionError, setSuggestionError] = useState(null);
  const debouncedStoreName = useDebounce(storeName, 500);


  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedStoreName.trim() || isSuggestingNames) {
        return;
      }
      setIsSuggestingNames(true);
      setSuggestionError(null);
      setSuggestedNames([]);

      const result = await generateStoreNameSuggestions(debouncedStoreName);
      if (result.suggestions) {
        setSuggestedNames(result.suggestions);
      } else {
        setSuggestionError(result.error || "Failed to get suggestions.");
      }
      setIsSuggestingNames(false);
    };

    fetchSuggestions();
  }, [debouncedStoreName]);

  useEffect(() => {
    // Cleanup previews on unmount
    return () => {
      contextFiles.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [contextFiles]);

  useEffect(() => {
    if (isImportDataReadyForGenerator && importedStoreDataForGenerator) {
      setStoreName(importedStoreDataForGenerator.name || '');
      setPrompt(importedStoreDataForGenerator.prompt || '');
      // Potentially set other states if StoreGenerator is expanded, e.g., for logo, colors
      // For now, just name and prompt.
      
      // Automatically check name availability for imported name
      if (importedStoreDataForGenerator.name) {
        handleManualStoreNameCheck(importedStoreDataForGenerator.name);
      }
      
      // Clear the data from context after consuming it
      clearImportedStoreDataForGenerator();
    }
  }, [isImportDataReadyForGenerator, importedStoreDataForGenerator, clearImportedStoreDataForGenerator]);

  const handleStoreNameChange = (e) => {
    setStoreName(e.target.value);
    setStoreNameAvailability(null); // Reset availability status on change
    setSuggestedNames([]); // Clear suggestions when name changes
    setSuggestionError(null);
  };

  const handleSuggestionClick = (name) => {
    setStoreName(name);
    setSuggestedNames([]);
    setStoreNameAvailability(null);
    setTimeout(() => handleManualStoreNameCheck(name), 0);
  };

  const handleManualStoreNameCheck = useCallback(async (nameToCheck) => {
    const currentName = nameToCheck || storeName; // Use passed name or state
    if (!currentName.trim()) {
      setStoreNameAvailability({ status: 'error', message: 'Store name cannot be empty.' });
      return false; // Indicate validation failed
    }
    setIsCheckingName(true);
    setStoreNameAvailability(null);
    try {
      const isTaken = await isStoreNameTaken(currentName.trim());
      if (isTaken) {
        setStoreNameAvailability({ status: 'claimed', message: 'Not available' });
        return false;
      } else {
        setStoreNameAvailability({ status: 'available', message: 'Available' });
        return true;
      }
    } catch (e) {
      console.error("Store name availability check failed in StoreGenerator:", e);
      setStoreNameAvailability({ status: 'error', message: e.message || 'Failed to check name. Please try again.' });
      return false;
    } finally {
      setIsCheckingName(false);
    }
  }, [storeName]); // Dependency on storeName for when nameToCheck is not provided

  const handleExampleClick = (index) => {
    setSelectedExample(index);
    const examplePrompt = promptExamples[index];
    const nameMatch = examplePrompt.match(/(?:store called|store named|market|boutique) '([^']+)'/i);
    
    const newName = (nameMatch && nameMatch[1]) ? nameMatch[1] : '';
    setStoreName(newName);
    setPrompt(examplePrompt);
    setStoreNameAvailability(null); // Reset on example click
    
    if (newName) {
      // Trigger validation for the new name from example
      // Use a timeout to allow state to update if handleManualStoreNameCheck relies on it,
      // or pass newName directly.
      setTimeout(() => handleManualStoreNameCheck(newName), 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated && stores.length >= 1) {
      openAuthModal();
      return;
    }
    
    let isNameValid = false;
    if (storeNameAvailability && storeNameAvailability.status === 'available') {
      isNameValid = true;
    } else if (storeName.trim()) { 
      // If name is entered but not checked, or check resulted in error/claimed, re-check before submit
      isNameValid = await handleManualStoreNameCheck(storeName);
    } else {
      // Name is empty
      setStoreNameAvailability({ status: 'error', message: 'Store name cannot be empty.' });
    }

    if (!isNameValid) return;

    if (!prompt.trim()) {
      alert("Please provide a description for your store.");
      return;
    }

    if (isGenerating || isCheckingName) return;

    const nicheDetails = getStoreNicheDetails(prompt);

    try {
      await generateStore(prompt, storeName, nicheDetails, [], isPrintOnDemand, isDropshipping, contextFiles.map(f => f.file), dropshippingProducts);
    } catch (error) {
      console.error("Error calling generateStore from StoreGenerator:", error);
      alert(`An error occurred during the store generation step: ${error.message}`);
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const newFilesWithPreviews = newFiles.map(file => ({
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setContextFiles(prev => [...prev, ...newFilesWithPreviews]);
  };

  const removeFile = (index) => {
    const fileToRemove = contextFiles[index];
    if (fileToRemove.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    setContextFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddDropshippingProducts = (products) => {
    setDropshippingProducts(products);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = (updatedProduct) => {
    setDropshippingProducts(dropshippingProducts.map(p => p.product_id === updatedProduct.product_id ? updatedProduct : p));
    setIsEditModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Card wrapper removed */}
      {/* CardHeader removed */}
      {/* CardContent removed, form is now a direct child */}
      <form onSubmit={handleSubmit}>
        <div className="mb-[13px]">
          <div>
            <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-[6px]">
                  Store Name
                </label>
              <div className="relative flex items-center">
                <Input
                  id="storeName"
                  type="text"
                  placeholder="ex. Future Furniture"
                  className={cn(
                    "text-base flex-grow",
                    storeNameAvailability?.status === 'claimed' && "border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500",
                    storeNameAvailability?.status === 'error' && "border-yellow-500 focus:border-yellow-500 dark:border-yellow-500 dark:focus:border-yellow-500",
                    storeNameAvailability?.status === 'available' && "border-green-500 focus:border-green-500 dark:border-green-500 dark:focus:border-green-500",
                    "pr-24" // Padding for the button
                  )}
                  value={storeName}
                  onChange={handleStoreNameChange}
                  disabled={isGenerating || isCheckingName}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleManualStoreNameCheck()}
                  disabled={!storeName.trim() || isCheckingName}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 z-10"
                >
                  {isCheckingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  <span className="ml-1 hidden sm:inline">Check</span>
                </Button>
              </div>
              <div className="mt-1"> {/* Reserve space for messages */}
                {isCheckingName && storeName.trim() && (
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Checking...
                  </p>
                )}
                {storeNameAvailability && storeName.trim() && !isCheckingName && (
                  <p className={`text-sm font-medium flex items-center ${
                    storeNameAvailability.status === 'available' ? 'text-green-600' : 
                    storeNameAvailability.status === 'claimed' ? 'text-red-600' : 
                    storeNameAvailability.status === 'error' ? 'text-yellow-600' : 'text-muted-foreground'
                  }`}>
                    {storeNameAvailability.status === 'available' && <CheckCircle className="h-4 w-4 mr-1" />}
                    {storeNameAvailability.status === 'claimed' && <AlertCircle className="h-4 w-4 mr-1" />}
                    {storeNameAvailability.status === 'error' && <AlertCircle className="h-4 w-4 mr-1" />}
                    {storeNameAvailability.message}
                  </p>
                )}
              </div>
              
              {/* AI Name Suggestions */}
              {(isSuggestingNames || suggestedNames.length > 0 || suggestionError) && (
                <div className="mt-[7px] mb-[13px]">
                  {isSuggestingNames && (
                    <div className="flex items-center space-x-2 animate-pulse h-8">
                      <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    </div>
                  )}
                  {!isSuggestingNames && suggestedNames.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-wrap gap-2"
                    >
                      <span className="text-sm text-muted-foreground mr-2 self-center">Suggestions:</span>
                      {suggestedNames.map((name, index) => (
                        <Button
                          key={index}
                          type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(name)}
                        className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:border-gray-600 saturate-0"
                      >
                        {name}
                        </Button>
                      ))}
                    </motion.div>
                  )}
                  {suggestionError && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" /> {suggestionError}
                    </p>
                  )}
                </div>
              )}
          </div>
          <div className="pt-0 mt-[14px] mb-[13px]">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="storePrompt" className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-[6px]">
                Prompt
              </label>
                <div className="flex items-center">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="printOnDemandCheckbox"
                      checked={isPrintOnDemand}
                      onChange={(e) => setIsPrintOnDemand(e.target.checked)}
                      className={cn(
                        "appearance-none h-4 w-4 border rounded-full checked:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-900 cursor-pointer",
                        "border-gray-400 dark:border-gray-500",
                        "focus:ring-orange-500",
                        isPrintOnDemand && "bg-orange-500 border-orange-500 animate-radiate-orange"
                      )}
                    />
                    <label htmlFor="printOnDemandCheckbox" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Print on Demand
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <input
                      type="checkbox"
                      id="dropshippingCheckbox"
                      checked={isDropshipping}
                      onChange={(e) => {
                        setIsDropshipping(e.target.checked);
                        if (e.target.checked) {
                          setIsDropshippingModalOpen(true);
                        }
                      }}
                      className={cn(
                        "appearance-none h-4 w-4 border rounded-full checked:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-900 cursor-pointer",
                        "border-gray-400 dark:border-gray-500",
                        "focus:ring-blue-500",
                        isDropshipping && "bg-blue-500 border-blue-500 animate-radiate-blue"
                      )}
                    />
                    <label htmlFor="dropshippingCheckbox" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dropshipping
                    </label>
                  </div>
                </div>
              </div>
              <div className="relative">
                <Textarea
                  id="storePrompt"
                  placeholder="ex. 'A modern furniture store specializing in sustainable and innovative designs for the contemporary home. Focus on minimalist aesthetics and smart functionality.'"
                  className="min-h-[120px] text-base resize-none w-full pr-12" // Add padding for the icon
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                />
                <div className="absolute bottom-2 right-2 flex items-center">
                  <div className="flex items-center gap-2 mr-2">
                    {contextFiles.map((item, index) => (
                      <div key={index} className="relative group">
                        {item.previewUrl ? (
                          <img src={item.previewUrl} alt="Preview" className="h-8 w-8 rounded-md object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => fileInputRef.current.click()}
                    disabled={isGenerating}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept="application/pdf,image/*"
                />
              </div>
            </div>
            {dropshippingProducts.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Selected Dropshipping Products</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {dropshippingProducts.map((product) => (
                    <div key={product.product_id} className="border rounded-lg p-2 cursor-pointer" onClick={() => handleEditProduct(product)}>
                      <img src={product.product_main_image_url} alt={product.product_title} className="w-full h-24 object-cover rounded-md mb-2" />
                      <p className="text-sm truncate">{product.product_title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

            <Button
              type="submit"
              disabled={
                !storeName.trim() ||
                !prompt.trim() ||
                isGenerating || // Global generating state from context
                isCheckingName ||
                (storeNameAvailability && storeNameAvailability.status !== 'available')
              }
              className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white mt-6"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Store...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Store
                </>
              )}
            </Button>
            
            {/* Removed old progress display from here */}

            <div className="space-y-2 mt-6">
              <p className="text-sm font-medium text-muted-foreground">Or try one of these examples for inspiration:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {promptExamples.map((example, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline" // Keep outline as base
                    className={cn(
                      "h-auto py-2 px-3 justify-start text-left text-sm font-normal",
                      selectedExample === index ? "bg-[#c9ccd1] text-black hover:bg-[#c9ccd1] dark:bg-[#242424] dark:text-gray-300 dark:hover:bg-[#242424]" : "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => handleExampleClick(index)}
                    disabled={isGenerating}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </form>
      <DropshippingModal
        isOpen={isDropshippingModalOpen}
        onClose={() => setIsDropshippingModalOpen(false)}
        onAddProducts={handleAddDropshippingProducts}
      />
      {selectedProduct && (
        <ProductEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={selectedProduct}
          onSave={handleSaveProduct}
        />
      )}
    </motion.div>
  );
};

export default StoreGenerator;
