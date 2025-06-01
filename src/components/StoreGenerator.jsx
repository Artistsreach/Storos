
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react'; // Added CheckCircle, Sparkles
import { useStore } from '@/contexts/StoreContext';
import { cn } from "@/lib/utils"; // For conditional class names
import { isStoreNameTaken } from '@/lib/firebaseClient'; // Import the Firestore check function
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

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
  const { generateStore, isGenerating } = useStore();
  
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [storeNameAvailability, setStoreNameAvailability] = useState(null); // { status: 'available'|'claimed'|'error', message: '...' }

  const handleStoreNameChange = (e) => {
    setStoreName(e.target.value);
    setStoreNameAvailability(null); // Reset availability status on change
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
      // Using alert for prompt validation as before, or could use a new state for promptError
      alert("Please provide a description for your store.");
      return;
    }

    if (isGenerating || isCheckingName) return; // Prevent submission if already processing

    const nicheDetails = getStoreNicheDetails(prompt);
    await generateStore(prompt, storeName, nicheDetails);
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
      <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased spacing a bit */}
        <div>
          <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  // onBlur={() => handleManualStoreNameCheck()} // Optional: trigger check on blur
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
              <div className="h-5 mt-1"> {/* Reserve space for messages */}
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
            </div>
            <div className="-mt-[15px]">
              <label htmlFor="storePrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <Textarea
                id="storePrompt"
                placeholder="e.g., 'A modern furniture store specializing in sustainable and innovative designs for the contemporary home. Focus on minimalist aesthetics and smart functionality.'"
                className="min-h-[120px] text-base resize-none"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />
            </div> {/* Closing div for the AI Prompt section */}
            
            <Button
              type="submit" // Changed from onClick to type="submit" for form
              disabled={
                !storeName.trim() ||
                !prompt.trim() ||
                isGenerating ||
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

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Or try one of these examples for inspiration:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {promptExamples.map((example, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant={selectedExample === index ? "default" : "outline"}
                    className="h-auto py-2 px-3 justify-start text-left text-sm font-normal"
                    onClick={() => handleExampleClick(index)}
                    disabled={isGenerating}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </form>
    </motion.div>
  );
};

export default StoreGenerator;
