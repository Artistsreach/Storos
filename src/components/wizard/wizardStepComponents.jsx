
import React, { useState, useEffect } from 'react'; // Added useEffect
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Added Badge
import { Loader2, Wand2, Sparkles, PlusCircle, Trash2, UploadCloud, AlertTriangle, CheckCircle, X, Edit3 } from 'lucide-react'; // Added Edit3, CheckCircle, X
import ManageCollectionProductsModal from '@/components/store/ManageCollectionProductsModal'; // Import the modal
import EditAiProductModal from './EditAiProductModal'; // Import the new modal
import { generateImageFromPromptForPod, visualizeImageOnProductWithGemini } from '@/lib/geminiImageGeneration'; // Import the new functions
import { useToast } from "@/components/ui/use-toast"; // For showing errors

// Helper function to convert file to data URL
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export const productTypeOptions = [
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "electronics", label: "Electronics & Gadgets" },
  { value: "food", label: "Food & Beverage" },
  { value: "jewelry", label: "Jewelry & Accessories" },
  { value: "homedecor", label: "Home Decor & Furnishings" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "books", label: "Books & Media" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "toys", label: "Toys & Games" },
  { value: "general", label: "General Merchandise" },
];

export const renderWizardStepContent = (step, props) => {
  const {
    formData, setFormData, handleInputChange, handleProductTypeChange, handleProductSourceChange, // Added setFormData
    handleProductCountChange, handleManualProductChange, addManualProduct, removeManualProduct,
    suggestStoreName, generateLogo, generateAiProducts, generateAiCollections,
    handleGenerateManualProductImage, 
    handleGenerateMoreAngles, // Added for angle generation
    isProcessing, 
    isGeneratingProductImageForIndex, 
    productImageGenerationError, 
    isGeneratingAnglesForIndex, // Added for angle generation
    angleGenerationError, // Added for angle generation
    productTypeOptions: pto, 
    storeNameSuggestions, handleSuggestionClick, suggestionError,
    // Props for "Start from Product Photos"
    handleInitialImportMethodChange, // New handler for import method
    handleProductPhotoUpload,      // New handler for photo uploads
    uploadedProductPhotos,         // Array of uploaded photo (base64 or file objects)
    removeUploadedProductPhoto,    // Function to remove an uploaded photo
    isProcessingPhotos,            // State for when photos are being processed by AI
    // Props for Collection Image Generation
    handleGenerateCollectionImage,
    isGeneratingCollectionImageForIndex,
    collectionImageGenerationError,
    // Props for Store Name Availability
    isCheckingStoreName,
    storeNameAvailability,
    handleManualStoreNameCheck, // Added prop
  } = props;

  // State for Print on Demand
  const [podImagePrompt, setPodImagePrompt] = useState('');
  const [podImagePreviewUrl, setPodImagePreviewUrl] = useState(''); // This will hold either generated or uploaded image URL
  const [uploadedPodImageFile, setUploadedPodImageFile] = useState(null); // For the file object for direct upload
  const [podReferenceImageFile, setPodReferenceImageFile] = useState(null); // For the reference image file for generation
  const [podReferenceImageUrl, setPodReferenceImageUrl] = useState(''); // For the reference image data URL
  const [podSearchTerm, setPodSearchTerm] = useState('');
  const [filteredPodProducts, setFilteredPodProducts] = useState([]);
  // selectedPodProduct is now an array to hold multiple selections
  const [selectedPodProducts, setSelectedPodProducts] = useState([]); 
  const [visualizedPodProductDetails, setVisualizedPodProductDetails] = useState(null); // Kept for single display if needed, or can be removed if batch always used
  const [batchVisualizedProducts, setBatchVisualizedProducts] = useState([]); // For storing multiple visualized products
  const [isGeneratingPodImagePreview, setIsGeneratingPodImagePreview] = useState(false);
  const [isVisualizingOnProduct, setIsVisualizingOnProduct] = useState(false);
  const [podError, setPodError] = useState(''); // For displaying errors in the POD section
  const { toast } = useToast();

  // State for AI Product Edit Modal
  const [isEditAiProductModalOpen, setIsEditAiProductModalOpen] = useState(false);
  const [currentEditingAiProduct, setCurrentEditingAiProduct] = useState(null);
  const [currentEditingAiProductIndex, setCurrentEditingAiProductIndex] = useState(null);

  // --- Handlers for Manual Product Variants ---
  const handleManualProductVariantOptionNameChange = (productIndex, optionIndex, newName) => {
    setFormData(prev => {
      const newItems = [...prev.products.items];
      const productToUpdate = { ...newItems[productIndex] };
      productToUpdate.variants = [...(productToUpdate.variants || [])];
      productToUpdate.variants[optionIndex] = { ...productToUpdate.variants[optionIndex], name: newName };
      newItems[productIndex] = productToUpdate;
      return { ...prev, products: { ...prev.products, items: newItems } };
    });
  };

  const handleManualProductVariantValueChange = (productIndex, optionIndex, valueIndex, newValue) => {
    setFormData(prev => {
      const newItems = [...prev.products.items];
      const productToUpdate = { ...newItems[productIndex] };
      productToUpdate.variants = [...(productToUpdate.variants || [])];
      const optionToUpdate = { ...productToUpdate.variants[optionIndex] };
      optionToUpdate.values = [...(optionToUpdate.values || [])];
      optionToUpdate.values[valueIndex] = newValue;
      productToUpdate.variants[optionIndex] = optionToUpdate;
      newItems[productIndex] = productToUpdate;
      return { ...prev, products: { ...prev.products, items: newItems } };
    });
  };

  const addManualProductVariantOptionValue = (productIndex, optionIndex) => {
    setFormData(prev => {
      const newItems = [...prev.products.items];
      const productToUpdate = { ...newItems[productIndex] };
      productToUpdate.variants = [...(productToUpdate.variants || [])];
      const optionToUpdate = { ...productToUpdate.variants[optionIndex] };
      optionToUpdate.values = [...(optionToUpdate.values || []), '']; // Add empty string for new value
      productToUpdate.variants[optionIndex] = optionToUpdate;
      newItems[productIndex] = productToUpdate;
      return { ...prev, products: { ...prev.products, items: newItems } };
    });
  };

  const removeManualProductVariantOptionValue = (productIndex, optionIndex, valueIndex) => {
    setFormData(prev => {
      const newItems = [...prev.products.items];
      const productToUpdate = { ...newItems[productIndex] };
      productToUpdate.variants = [...(productToUpdate.variants || [])];
      const optionToUpdate = { ...productToUpdate.variants[optionIndex] };
      optionToUpdate.values = (optionToUpdate.values || []).filter((_, i) => i !== valueIndex);
      productToUpdate.variants[optionIndex] = optionToUpdate;
      if (optionToUpdate.values.length === 0) {
        toast({ title: "Info", description: `Variant option "${optionToUpdate.name}" has no values. Consider removing the option or adding values.`, variant: "default" });
      }
      newItems[productIndex] = productToUpdate;
      return { ...prev, products: { ...prev.products, items: newItems } };
    });
  };
  
  const addManualProductVariantOption = (productIndex) => {
    setFormData(prev => {
      const newItems = [...prev.products.items];
      const productToUpdate = { ...newItems[productIndex] };
      productToUpdate.variants = [...(productToUpdate.variants || []), { name: '', values: [''] }];
      newItems[productIndex] = productToUpdate;
      return { ...prev, products: { ...prev.products, items: newItems } };
    });
  };

  const removeManualProductVariantOption = (productIndex, optionIndex) => {
    setFormData(prev => {
      const newItems = [...prev.products.items];
      const productToUpdate = { ...newItems[productIndex] };
      productToUpdate.variants = (productToUpdate.variants || []).filter((_, i) => i !== optionIndex);
      newItems[productIndex] = productToUpdate;
      return { ...prev, products: { ...prev.products, items: newItems } };
    });
  };
  // --- End Handlers for Manual Product Variants ---


  const handlePodImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setPodError('');
      setUploadedPodImageFile(file);
      try {
        const base64 = await fileToBase64(file);
        setPodImagePreviewUrl(base64); // Use this for preview and visualization
        setPodImagePrompt(''); // Clear prompt if image is uploaded
        toast({ title: "Image Uploaded", description: "Your image is ready for visualization." });
      } catch (error) {
        console.error("Error converting uploaded file to base64:", error);
        setPodError("Failed to load uploaded image. Please try again.");
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not process the uploaded image." });
        setPodImagePreviewUrl('');
        setUploadedPodImageFile(null);
      }
    }
  };

  const clearPodImage = () => {
    setPodImagePreviewUrl('');
    setUploadedPodImageFile(null);
    setPodImagePrompt(''); // Also clear prompt
    setPodError('');
    // Clear the file input visually (this is a common trick)
    const fileInput = document.getElementById('podImageUpload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handlePodReferenceImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setPodError(''); // Clear previous errors
      setPodReferenceImageFile(file);
      try {
        const base64 = await fileToBase64(file);
        setPodReferenceImageUrl(base64);
        toast({ title: "Reference Image Added", description: "This image will be used with your prompt for generation." });
      } catch (error) {
        console.error("Error converting reference file to base64:", error);
        setPodError("Failed to load reference image. Please try again.");
        toast({ variant: "destructive", title: "Reference Image Load Failed", description: "Could not process the reference image." });
        setPodReferenceImageUrl('');
        setPodReferenceImageFile(null);
      }
    }
  };

  const clearPodReferenceImage = () => {
    setPodReferenceImageUrl('');
    setPodReferenceImageFile(null);
    setPodError('');
    const fileInput = document.getElementById('podReferenceImageUpload');
    if (fileInput) {
      fileInput.value = '';
    }
  };


  const podProductsList = [
    { name: "T-shirt", imageUrl: "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//Shirt.webp" },
    { name: "Hoodie", imageUrl: "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//Hoodie.jpeg" },
    { name: "Baseball Cap", imageUrl: "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//Hat.jpeg" },
    { name: "Mug", imageUrl: "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//Mug.png" },
    { name: "Pillow", imageUrl: "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//Pillow.webp" },
    { name: "Blanket", imageUrl: "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//Bl.webp" },
    { name: "Canvas", imageUrl: "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//IMG_5933.jpeg" },
  ];

  const handleGeneratePodImagePreview = async () => {
    if (!podImagePrompt) {
      toast({ title: "Missing Prompt", description: "Please enter a prompt for image generation.", variant: "destructive" });
      return;
    }
    // If an image was directly uploaded for POD, we shouldn't be generating.
    if (uploadedPodImageFile) {
        toast({ title: "Image Already Uploaded", description: "An image has already been uploaded. Clear it if you want to generate a new one.", variant: "warning" });
        return;
    }

    setIsGeneratingPodImagePreview(true);
    setPodError('');
    setPodImagePreviewUrl(''); // Clear previous main preview

    let generationArgs = { prompt: podImagePrompt };
    if (podReferenceImageFile && podReferenceImageUrl) {
      const [header, base64Data] = podReferenceImageUrl.split(',');
      const mimeType = header.match(/:(.*?);/)[1];
      generationArgs.referenceImage = {
        base64Data,
        mimeType,
        fileName: podReferenceImageFile.name
      };
      console.log("Attempting to generate POD image preview with prompt and reference image:", podImagePrompt, podReferenceImageFile.name);
    } else {
      console.log("Attempting to generate POD image preview for prompt:", podImagePrompt);
    }

    try {
      const result = await generateImageFromPromptForPod(generationArgs);
      if (result.imageData && result.imageMimeType) {
        const imageUrl = `data:${result.imageMimeType};base64,${result.imageData}`;
        setPodImagePreviewUrl(imageUrl);
        console.log("POD Image preview generated successfully.");
      } else {
        throw new Error(result.textResponse || "Image data not returned from API.");
      }
    } catch (error) {
      console.error("Error generating POD image preview:", error);
      const errorMessage = error.message || "Failed to generate image preview.";
      setPodError(errorMessage);
      toast({
        variant: "destructive",
        title: "Image Generation Failed",
        description: errorMessage,
      });
    } finally {
      setIsGeneratingPodImagePreview(false);
    }
  };

  const handlePodSearchChange = (e) => {
    const term = e.target.value;
    setPodSearchTerm(term);
    if (term) {
      setFilteredPodProducts(
        podProductsList.filter(p => p.name.toLowerCase().includes(term.toLowerCase()))
      );
    } else {
      setFilteredPodProducts([]);
    }
    // Don't clear selectedPodProducts when search term changes, so user can build a list
  };

  const handleSelectPodProduct = (product) => {
    setSelectedPodProducts(prevSelected => {
      const isAlreadySelected = prevSelected.some(p => p.name === product.name);
      if (isAlreadySelected) {
        return prevSelected.filter(p => p.name !== product.name); // Deselect
      } else {
        return [...prevSelected, product]; // Select
      }
    });
    // Keep search term and filtered products visible for further selections.
    // Do not call setPodSearchTerm('') or setFilteredPodProducts([]) here.
  };
  
  const handleVisualizeOnProduct = async () => {
    if (!podImagePreviewUrl || selectedPodProducts.length === 0) {
      toast({ title: "Missing Selections", description: "Please provide an image (generate or upload) and select at least one product type to visualize.", variant: "destructive" });
      return;
    }

    // Determine the prompt to use for API and for storing
    let imagePromptForApi;
    if (uploadedPodImageFile && uploadedPodImageFile.name) {
      imagePromptForApi = `Uploaded: ${uploadedPodImageFile.name}`;
    } else if (podImagePrompt) {
      imagePromptForApi = podImagePrompt;
    } else {
      // Fallback if somehow both are missing but we have a preview URL (should be rare)
      imagePromptForApi = "Custom design"; 
    }
    
    // Additional check: if using prompt generation, ensure prompt is not empty
    if (!uploadedPodImageFile && !podImagePrompt) {
        toast({ title: "Missing Prompt", description: "If not uploading an image, please enter a prompt to generate an image first.", variant: "destructive" });
        return;
    }


    setIsVisualizingOnProduct(true);
    setPodError('');
    setBatchVisualizedProducts([]); // Clear previous batch results

    const [header, base64Data] = podImagePreviewUrl.split(',');
    const mimeType = header.match(/:(.*?);/)[1];
    let allVisualizationsSuccessful = true;
    const newBatchVisualized = [];

    for (const productToVisualize of selectedPodProducts) {
      try {
        console.log("Attempting to visualize POD product:", productToVisualize.name);
        const result = await visualizeImageOnProductWithGemini(
          base64Data,
          mimeType,
          productToVisualize.imageUrl,
          imagePromptForApi, // Use the determined prompt
          productToVisualize.name
        );

        if (result.visualizedImageData && result.productDetails) {
          const finalImageUrl = `data:${result.visualizedImageMimeType};base64,${result.visualizedImageData}`;
          newBatchVisualized.push({
            title: result.productDetails.title,
            price: parseFloat(result.productDetails.price).toFixed(2),
            description: result.productDetails.description,
            finalImageUrl: finalImageUrl,
            baseProductName: productToVisualize.name,
            generatedImagePrompt: imagePromptForApi, // Store the used prompt
            baseProductImageUrl: productToVisualize.imageUrl,
            sourceImageUsedForVisualization: podImagePreviewUrl,
            // Add a temporary ID for UI key and removal purposes before adding to main list
            tempId: `${productToVisualize.name}-${Date.now()}` 
          });
          console.log("POD Product visualized successfully:", productToVisualize.name);
        } else {
          allVisualizationsSuccessful = false;
          console.error("Visualization failed for product:", productToVisualize.name, result);
          setPodError(prev => prev + `Visualization failed for ${productToVisualize.name}. `);
        }
      } catch (error) {
        allVisualizationsSuccessful = false;
        console.error("Error visualizing POD product:", productToVisualize.name, error);
        const errorMessage = error.message || `Failed to visualize ${productToVisualize.name}.`;
        setPodError(prev => prev + errorMessage + " ");
      }
    }
    
    setBatchVisualizedProducts(newBatchVisualized);

    if (!allVisualizationsSuccessful) {
      toast({
        variant: "destructive",
        title: "Some Visualizations Failed",
        description: "Check errors below. Some products may not have visualized correctly.",
      });
    } else if (newBatchVisualized.length > 0) {
       toast({
        title: "Visualization Complete",
        description: `${newBatchVisualized.length} product(s) visualized. You can now add them to your store.`,
      });
    }
    // Do not clear selectedPodProducts here, user might want to re-try or add them
    setIsVisualizingOnProduct(false);
  };

  const handleAddVisualizedProductToStore = (productToAdd) => {
    if (!productToAdd) return;
    
    const newProduct = {
      name: productToAdd.title,
      price: productToAdd.price,
      description: productToAdd.description,
      imageUrl: productToAdd.finalImageUrl,
      isPrintOnDemand: true,
      podDetails: { ...productToAdd } // Save all details including base product info
    };
    delete newProduct.podDetails.tempId; // Remove temporary ID

    setFormData(prev => ({
      ...prev,
      products: {
        ...prev.products,
        items: [...prev.products.items, newProduct],
      },
    }));

    // Remove the added product from the batch display
    setBatchVisualizedProducts(prevBatch => prevBatch.filter(p => p.tempId !== productToAdd.tempId));
    
    // If all batch visualized products are added, then clear selections
    if (batchVisualizedProducts.length === 1 && batchVisualizedProducts[0].tempId === productToAdd.tempId) {
        setSelectedPodProducts([]);
        setPodSearchTerm('');
        // Keep podImagePrompt and podImagePreviewUrl for further use
    }


    toast({
      title: "Product Added",
      description: `"${newProduct.name}" added to your store's products.`,
    });
  };

  const removePodProductFromList = (productIndexInFormData) => {
    setFormData(prev => ({
      ...prev,
      products: {
        ...prev.products,
        items: prev.products.items.filter((_, index) => index !== productIndexInFormData),
      },
    }));
     toast({
      title: "Product Removed",
      description: "The Print on Demand product has been removed from your list.",
      variant: "destructive"
    });
  };


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditingCollection, setCurrentEditingCollection] = useState(null);

  const handleManualCollectionChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.collections.items];
      newItems[index][field] = value;
      return { ...prev, collections: { ...prev.collections, items: newItems } };
    });
  };

  const addManualCollection = () => {
    setFormData(prev => ({
      ...prev,
      collections: {
        ...prev.collections,
        items: [...prev.collections.items, { name: '', description: '', imageUrl: '' }],
      },
    }));
  };

  const removeManualCollection = (index) => {
    setFormData(prev => {
      const newItems = prev.collections.items.filter((_, i) => i !== index);
      return { ...prev, collections: { ...prev.collections, items: newItems } };
    });
  };

  const openManageProductsModal = (collection) => {
    setCurrentEditingCollection(collection);
    setIsModalOpen(true);
  };

  const handleSaveCollectionProducts = (collectionIdOrName, productIds) => {
    setFormData(prevFormData => {
      const updatedCollections = prevFormData.collections.items.map(coll => {
        if ((coll.id && coll.id === collectionIdOrName) || coll.name === collectionIdOrName) {
          return { ...coll, product_ids: productIds };
        }
        return coll;
      });
      return { ...prevFormData, collections: { ...prevFormData.collections, items: updatedCollections } };
    });
    setIsModalOpen(false);
    setCurrentEditingCollection(null);
  };


  switch (step) {
    case 1: // Product Type or Start from Photos
      return (
        <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6 w-full">
          <div>
            <Label htmlFor="initialImportMethod" className="text-lg font-semibold">How would you like to start?</Label>
            <Select onValueChange={handleInitialImportMethodChange} value={formData.initialImportMethod || 'productType'}>
              <SelectTrigger id="initialImportMethod" className="mt-2">
                <SelectValue placeholder="Choose starting method..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="productType">Describe Product Type</SelectItem>
                <SelectItem value="photos">Start from Product Photos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.initialImportMethod === 'productType' && (
            <div className="space-y-4">
              <Label htmlFor="productType" className="text-md font-medium">What kind of products will your store sell?</Label>
              <Input
                id="productType"
                name="productType"
                value={formData.productType}
                onChange={(e) => handleProductTypeChange(e.target.value)}
                placeholder="e.g., Fashion, Electronics, Home Decor"
                list="productTypeSuggestions"
              />
              <datalist id="productTypeSuggestions">
                {pto.map(option => (
                  <option key={option.value} value={option.label} />
                ))}
              </datalist>
              <p className="text-sm text-muted-foreground">This helps us tailor product suggestions and store design. Type to see suggestions.</p>
            </div>
          )}

          {formData.initialImportMethod === 'photos' && (
            <div className="space-y-4">
              <Label htmlFor="productPhotosUpload" className="text-md font-medium">Upload Product Photos</Label>
              <p className="text-sm text-muted-foreground">
                Upload multiple photos of your products. We'll use AI to understand them and pre-fill store details.
              </p>
              <Input
                id="productPhotosUpload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleProductPhotoUpload}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary/10 file:text-primary
                  hover:file:bg-primary/20"
                disabled={isProcessingPhotos}
              />
              {isProcessingPhotos && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing uploaded photos...
                </div>
              )}
              {uploadedProductPhotos && uploadedProductPhotos.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Uploaded Photos ({uploadedProductPhotos.length}):</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {uploadedProductPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={photo.previewUrl || photo} // Assuming photo objects might have a previewUrl or are base64 strings
                          alt={`Uploaded product ${index + 1}`} 
                          className="w-full aspect-square object-cover rounded-md border" 
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onClick={() => removeUploadedProductPhoto(index)}
                          disabled={isProcessingPhotos}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      );
    case 2: // Store Name
      return (
        <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-4 w-full">
          <Label htmlFor="storeName" className="text-lg font-semibold">What's your store name?</Label>
          <div className="relative flex items-center gap-2">
            <Input 
              id="storeName" 
              name="storeName" 
              value={formData.storeName} 
              onChange={handleInputChange} 
              placeholder="e.g., 'The Cozy Corner Bookstore'" 
              className="flex-grow pr-20" // Add padding to the right for the button
            />
            <Button 
              type="button" 
              variant="ghost" // Ghost or outline for subtle appearance
              size="sm" // Smaller size
              onClick={handleManualStoreNameCheck} 
              disabled={!formData.storeName || isCheckingStoreName}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 z-10" // Positioning
            >
              {isCheckingStoreName ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              <span className="ml-1 hidden sm:inline">Check</span>
            </Button>
            {/* Suggest button can be outside the relative container or styled differently */}
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={suggestStoreName} 
            disabled={isProcessing || isCheckingStoreName || !formData.productType}
            className="w-full mt-2 sm:w-auto sm:mt-0" // Adjust width and margin for layout
          >
            {isProcessing && !isCheckingStoreName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span className="ml-2">Suggest Names</span>
          </Button>
          
          {/* Store Name Availability Feedback */}
          <div className="h-5 mt-1"> {/* Reserve space for the message to prevent layout shifts */}
            {isCheckingStoreName && formData.storeName && (
              <p className="text-sm text-muted-foreground flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Checking...
              </p>
            )}
            {storeNameAvailability && formData.storeName && !isCheckingStoreName && (
              <p className={`text-sm font-medium ${
                storeNameAvailability.status === 'available' ? 'text-green-600' : 
                storeNameAvailability.status === 'claimed' ? 'text-red-600' : 
                storeNameAvailability.status === 'error' ? 'text-yellow-600' : 'text-muted-foreground'
              }`}>
                {storeNameAvailability.message === 'Available' ? <CheckCircle className="inline h-4 w-4 mr-1" /> : ''}
                {storeNameAvailability.message}
              </p>
            )}
          </div>
          
          {!formData.storeName && !isCheckingStoreName && (
            <p className="text-sm text-muted-foreground mt-1">
              Choose a catchy name or let us suggest one. Click "Check" to verify availability.
            </p>
          )}
          
          {/* General Suggestion Error (e.g., for AI suggestion failures from suggestStoreName) */}
          {suggestionError && (
            <p className="text-sm text-red-500 mt-2">{suggestionError}</p>
          )}

          {storeNameSuggestions && storeNameSuggestions.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {storeNameSuggestions.map((name, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(name)}
                    className="bg-primary-foreground dark:bg-neutral-800 hover:bg-primary/10 dark:hover:bg-neutral-700"
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      );
    case 3: // Logo
      return (
        <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6 w-full">
          <Label className="text-lg font-semibold">Design a logo for your store</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 border rounded-md">
            {/* Light Mode Logo Preview */}
            <div className="flex flex-col items-center">
              <Label className="text-sm mb-2">For Light Backgrounds</Label>
              {formData.logoUrlDark ? (
                <img src={formData.logoUrlDark} alt="Logo for light backgrounds" className="w-48 h-48 object-contain rounded-md border bg-white" />
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-md flex items-center justify-center text-muted-foreground">
                  Light Bg Preview
                </div>
              )}
            </div>

            {/* Dark Mode Logo Preview */}
            <div className="flex flex-col items-center">
              <Label className="text-sm mb-2">For Dark Backgrounds</Label>
              {formData.logoUrlLight ? (
                <img src={formData.logoUrlLight} alt="Logo for dark backgrounds" className="w-48 h-48 object-contain rounded-md border bg-gray-800" />
              ) : (
                <div className="w-48 h-48 bg-gray-700 rounded-md flex items-center justify-center text-gray-400">
                  Dark Bg Preview
                </div>
              )}
            </div>
          </div>

          <Button type="button" onClick={generateLogo} disabled={isProcessing || !formData.storeName} className="w-full">
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate Logo with AI (Light & Dark Versions)
          </Button>
          <p className="text-xs text-muted-foreground text-center">AI will generate a logo, remove its background, and attempt to create light/dark mode versions.</p>
          
          <div className="space-y-3">
            <Label className="text-sm">Manually set logos (optional):</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="logoUrlDarkUpload" className="text-xs">Logo for Light Background (e.g., black logo)</Label>
                <Input 
                  id="logoUrlDarkUpload" 
                  type="file" 
                  accept="image/*" 
                  className="mt-1 text-xs" 
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      try {
                        const base64 = await fileToBase64(file);
                        setFormData(prev => ({ ...prev, logoUrlDark: base64 }));
                      } catch (error) { console.error("Error converting file for logoUrlDark:", error); }
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="logoUrlLightUpload" className="text-xs">Logo for Dark Background (e.g., white logo)</Label>
                <Input 
                  id="logoUrlLightUpload" 
                  type="file" 
                  accept="image/*" 
                  className="mt-1 text-xs" 
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      try {
                        const base64 = await fileToBase64(file);
                        setFormData(prev => ({ ...prev, logoUrlLight: base64 }));
                      } catch (error) { console.error("Error converting file for logoUrlLight:", error); }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {(formData.logoUrlLight || formData.logoUrlDark) && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setFormData(prev => ({ ...prev, logoUrlLight: '', logoUrlDark: '' }))}
              className="mt-4 w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Remove All Logos
            </Button>
          )}
        </motion.div>
      );
    case 4: // Products
      return (
        <motion.div key="step4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6 w-full">
          <Label className="text-lg font-semibold">How do you want to add products?</Label>
          <Select onValueChange={handleProductSourceChange} value={formData.products.source}>
            <SelectTrigger>
              <SelectValue placeholder="Choose product source..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ai">Generate with AI</SelectItem>
              <SelectItem value="manual">Add Manually</SelectItem>
              <SelectItem value="printOnDemand">Print on Demand</SelectItem>
              <SelectItem value="csv" disabled>Upload CSV (Coming Soon)</SelectItem>
            </SelectContent>
          </Select>

          {formData.products.source === 'ai' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="productCount">Number of AI Products to Generate</Label>
                <Input id="productCount" type="number" min="1" max="5" value={formData.products.count} onChange={handleProductCountChange} /> 
                                {/* Max 5 for now to avoid too many API calls / long waits */}
              </div>
              <Button type="button" onClick={generateAiProducts} disabled={isProcessing || !formData.productType || !formData.storeName} className="w-full">
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Products with AI
              </Button>
              {suggestionError && formData.products.source === 'ai' && ( // Show error if relevant to AI products
                <p className="text-sm text-red-500 mt-2">{suggestionError}</p>
              )}
              {formData.products.items.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 mt-4"> {/* Increased max-h */}
                  <p className="text-sm font-medium text-muted-foreground">Generated Products:</p>
                  {formData.products.items.map((item, index) => (
                    <Card key={index} className="p-4 flex gap-4 items-start relative">
                      {/* Use the first image from the 'images' array for AI products */}
                      {(item.images && item.images.length > 0) ? (
                        <img src={item.images[0]} alt={item.name} className="w-24 h-24 object-cover rounded-md border" />
                      ) : (
                        <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                      )}
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-md">{item.name || "Untitled Product"}</h4>
                        <p className="text-sm text-muted-foreground">${item.price || "0.00"}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{item.description || "No description."}</p>
                        {item.variants && item.variants.length > 0 && (
                          <div className="mt-1.5">
                            {item.variants.map((variant, vIndex) => (
                              <div key={vIndex} className="text-xs">
                                <span className="font-medium text-muted-foreground">{variant.name}: </span>
                                <span className="text-gray-700 dark:text-gray-300">
                                  {Array.isArray(variant.values) ? variant.values.join(', ') : variant.values}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => {
                          setCurrentEditingAiProduct({ ...item }); // Create a copy for editing
                          setCurrentEditingAiProductIndex(index);
                          setIsEditAiProductModalOpen(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {isEditAiProductModalOpen && currentEditingAiProductIndex !== null && formData.products.items[currentEditingAiProductIndex] && (
            <EditAiProductModal
              isOpen={isEditAiProductModalOpen}
              onClose={() => {
                setIsEditAiProductModalOpen(false);
                // setCurrentEditingAiProduct(null); // No longer needed as we directly use formData
                setCurrentEditingAiProductIndex(null);
              }}
              // Pass the product directly from formData, ensuring it's always the latest version
              product={formData.products.items[currentEditingAiProductIndex]} 
              onSave={(updatedProduct) => {
                setFormData(prev => {
                  const newItems = [...prev.products.items];
                  if (currentEditingAiProductIndex !== null && newItems[currentEditingAiProductIndex]) {
                    newItems[currentEditingAiProductIndex] = updatedProduct;
                  }
                  return {
                    ...prev,
                    products: {
                      ...prev.products,
                      items: newItems,
                    },
                  };
                });
                setIsEditAiProductModalOpen(false);
                setCurrentEditingAiProduct(null);
                setCurrentEditingAiProductIndex(null);
                toast({ title: "Product Updated", description: `"${updatedProduct.name}" has been updated.` });
              }}
              // Pass the necessary handlers and state for image generation
              onGenerateMainImage={handleGenerateManualProductImage} // Renamed in modal to onGenerateMainImage
              onGenerateMoreAngles={handleGenerateMoreAngles} // Renamed in modal to onGenerateMoreAngles
              productIndexInWizard={currentEditingAiProductIndex}
              isGeneratingProductImage={isGeneratingProductImageForIndex === currentEditingAiProductIndex}
              isGeneratingAngles={isGeneratingAnglesForIndex === currentEditingAiProductIndex}
            />
          )}


          {formData.products.source === 'manual' && (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2"> {/* Increased max-h */}
              {formData.products.items.map((item, index) => (
                <Card key={index} className="p-4 space-y-3 relative">
                   <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => removeManualProduct(index)} disabled={formData.products.items.length <= 1}>
                      <Trash2 className="h-4 w-4 text-destructive"/>
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                      <div>
                          <Label htmlFor={`productName-${index}`}>Product Name</Label>
                          <Input id={`productName-${index}`} value={item.name} onChange={(e) => handleManualProductChange(index, 'name', e.target.value)} placeholder="e.g., 'Handmade Coffee Mug'" />
                      </div>
                      <div>
                          <Label htmlFor={`productPrice-${index}`}>Price (USD)</Label>
                          <Input id={`productPrice-${index}`} type="number" value={item.price} onChange={(e) => handleManualProductChange(index, 'price', e.target.value)} placeholder="e.g., '24.99'" />
                      </div>
                  </div>
                  <div>
                      <Label htmlFor={`productDescription-${index}`}>Short Description (Optional)</Label>
                      <Textarea id={`productDescription-${index}`} value={item.description} onChange={(e) => handleManualProductChange(index, 'description', e.target.value)} placeholder="e.g., 'Beautifully crafted ceramic mug, perfect for your morning coffee.'" rows={2}/>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-2 border rounded-md">
                    {/* Display existing images */}
                    {item.images && item.images.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.images.map((imgSrc, imgIdx) => (
                          <div key={imgIdx} className="relative group">
                            <img src={imgSrc} alt={`${item.name || 'Product'} image ${imgIdx + 1}`} className="w-20 h-20 object-contain rounded-md border" />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                const newImages = item.images.filter((_, i) => i !== imgIdx);
                                handleManualProductChange(index, 'images', newImages);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground mb-2">No Images</div>
                    )}
                    <Label htmlFor={`productImageUpload-${index}`} className="text-sm sr-only">Upload Product Images</Label>
                    <Input 
                      id={`productImageUpload-${index}`} 
                      type="file" 
                      accept="image/*" 
                      multiple // Allow multiple file selection
                      className="hidden" 
                      onChange={async (e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const files = Array.from(e.target.files);
                          const base64Promises = files.map(file => fileToBase64(file));
                          try {
                            const base64Results = await Promise.all(base64Promises);
                            const newImages = [...(item.images || []), ...base64Results];
                            handleManualProductChange(index, 'images', newImages);
                          } catch (error) {
                            console.error("Error converting files to base64:", error);
                            toast({ title: "Image Upload Error", description: "Could not process some images.", variant: "destructive" });
                          }
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById(`productImageUpload-${index}`).click()}
                      >
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload Images
                      </Button>
                      {item.images && item.images.length > 0 && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleManualProductChange(index, 'images', [])} // Clear all images
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Remove All
                        </Button>
                      )}
                       <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateManualProductImage(index)} // This now sets/replaces item.images[0]
                        disabled={isGeneratingProductImageForIndex === index || !item.name}
                      >
                        {isGeneratingProductImageForIndex === index ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generate Main Image
                      </Button>
                      {item.images && item.images.length > 0 && ( // Only show if there's a base image
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateMoreAngles(index)} // Operates on item.images[0], appends to item.images
                          disabled={isGeneratingAnglesForIndex === index}
                        >
                          {isGeneratingAnglesForIndex === index ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-4 w-4" /> 
                          )}
                          Generate More Angles
                        </Button>
                      )}
                    </div>
                    {productImageGenerationError && isGeneratingProductImageForIndex === index && ( 
                        <p className="text-xs text-destructive mt-1">{productImageGenerationError}</p>
                    )}
                    {angleGenerationError && isGeneratingAnglesForIndex === index && (
                        <p className="text-xs text-destructive mt-1">{angleGenerationError}</p>
                    )}
                  </div>

                  {/* Variant Editing UI for Manual Products */}
                  <div className="space-y-3 pt-3 border-t mt-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">Product Variants</h4>
                    {(item.variants || []).map((variant, optionIdx) => (
                      <Card key={optionIdx} className="p-2 space-y-2 bg-muted/50">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`manualVariantName-${index}-${optionIdx}`} className="text-xs">Option Name</Label>
                          <Button variant="ghost" size="icon" onClick={() => removeManualProductVariantOption(index, optionIdx)} className="h-6 w-6">
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                        <Input
                          id={`manualVariantName-${index}-${optionIdx}`}
                          value={variant.name || ''}
                          onChange={(e) => handleManualProductVariantOptionNameChange(index, optionIdx, e.target.value)}
                          placeholder="e.g., Color, Size"
                          className="text-sm h-8"
                        />
                        <Label className="text-xs">Option Values</Label>
                        {(variant.values || []).map((value, valueIdx) => (
                          <div key={valueIdx} className="flex items-center gap-1">
                            <Input
                              value={value || ''}
                              onChange={(e) => handleManualProductVariantValueChange(index, optionIdx, valueIdx, e.target.value)}
                              placeholder="e.g., Red, Large"
                              className="text-sm h-8"
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeManualProductVariantOptionValue(index, optionIdx, valueIdx)} className="h-6 w-6">
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => addManualProductVariantOptionValue(index, optionIdx)} className="text-xs h-7">
                          <PlusCircle className="mr-1 h-3 w-3" /> Add Value
                        </Button>
                      </Card>
                    ))}
                    <Button variant="outline" onClick={() => addManualProductVariantOption(index)} className="w-full text-sm h-8">
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Variant Option
                    </Button>
                  </div>
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={() => {
                // Ensure addManualProduct (from props) initializes variants: []
                // This is an assumption; if addManualProduct doesn't, this won't auto-add variants to new items.
                // The handlers above will create variants array if it's undefined on first variant add.
                addManualProduct(); 
              }} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Product
              </Button>
            </div>
          )}

          {formData.products.source === 'printOnDemand' && (
            <div className="space-y-4">
              <p className="text-md font-semibold">Configure Print on Demand Product</p>
              {/* Image Generation Prompt */}
              <div>
                <Label htmlFor="podImagePrompt">Image Generation Prompt</Label>
                <Textarea 
                  id="podImagePrompt" 
                  placeholder="e.g., A majestic wolf howling at a vibrant aurora borealis" 
                  value={podImagePrompt} 
                  onChange={(e) => setPodImagePrompt(e.target.value)}
                  rows={2}
                />
                <Button 
                  type="button" 
                  onClick={handleGeneratePodImagePreview} 
                  disabled={isProcessing || isGeneratingPodImagePreview || !podImagePrompt || !!uploadedPodImageFile}
                  className="mt-2"
                  variant="outline"
                >
                  {isGeneratingPodImagePreview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Image
                </Button>
                {/* Button to add reference image */}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 ml-2"
                  onClick={() => document.getElementById('podReferenceImageUpload').click()}
                  disabled={isProcessing || isGeneratingPodImagePreview || !!uploadedPodImageFile}
                >
                  <UploadCloud className="mr-2 h-4 w-4" /> Add Ref. Image
                </Button>
                <Input 
                  id="podReferenceImageUpload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePodReferenceImageUpload}
                />
              </div>
              {podReferenceImageUrl && (
                <div className="mt-2 flex flex-col items-start text-sm">
                  <Label className="mb-1">Reference Image:</Label>
                  <div className="flex items-center gap-2">
                    <img 
                      src={podReferenceImageUrl} 
                      alt="Reference preview" 
                      className="w-16 h-16 object-contain rounded-md border bg-muted" 
                    />
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{podReferenceImageFile?.name}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={clearPodReferenceImage}
                      className="h-7 w-7"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )}


              {/* Image Upload Section for direct POD image */}
              <div className="mt-4 pt-4 border-t">
                <Label htmlFor="podImageUpload">Or Upload Final Image for Product</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    id="podImageUpload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePodImageUpload}
                    className="flex-grow"
                    disabled={isGeneratingPodImagePreview}
                  />
                  {podImagePreviewUrl && uploadedPodImageFile && (
                     <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={clearPodImage}
                      className="h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">If you upload an image, it will be used instead of the generated one.</p>
              </div>

              {podError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/50 rounded-md text-destructive text-sm flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <p>{podError}</p>
                </div>
              )}
              {podImagePreviewUrl && (
                <div className="mt-2 flex flex-col items-center">
                  <Label className="mb-1">Image Preview:</Label>
                  <img 
                    src={podImagePreviewUrl} 
                    alt="Generated preview" 
                    className="w-40 h-40 object-contain rounded-md border bg-muted" 
                  />
                </div>
              )}

              {/* Product Search */}
              <div className="relative">
                <Label htmlFor="podProductSearch">Search Print on Demand Products</Label>
                <Input 
                  id="podProductSearch" 
                  placeholder="e.g., T-shirt, Mug" 
                  value={podSearchTerm}
                  onChange={handlePodSearchChange}
                  disabled={!podImagePreviewUrl} // Enable search only after image is generated/previewed
                />
                {filteredPodProducts.length > 0 && (
                  <Card className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto border bg-background shadow-lg">
                    {filteredPodProducts.map(p => {
                      const isSelected = selectedPodProducts.some(sp => sp.name === p.name);
                      return (
                        <div 
                          key={p.name} 
                          className={`p-2 hover:bg-muted cursor-pointer flex items-center gap-2 ${isSelected ? 'bg-primary/10' : ''}`}
                          onClick={() => handleSelectPodProduct(p)}
                        >
                          <img src={p.imageUrl} alt={p.name} className="w-8 h-8 object-contain rounded-sm"/>
                          <span>{p.name}</span>
                          {isSelected && <CheckCircle className="h-4 w-4 text-primary ml-auto"/>}
                        </div>
                      );
                    })}
                  </Card>
                )}
              </div>

              {/* Display selected POD product types as tags */}
              {selectedPodProducts.length > 0 && (
                <div className="mt-3">
                  <Label className="text-sm mb-1 block">Selected Product Types:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPodProducts.map(sp => (
                      <Badge key={sp.name} variant="secondary" className="flex items-center gap-1.5 pr-1">
                        {sp.name}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 hover:bg-destructive/20"
                          onClick={() => handleSelectPodProduct(sp)} // Toggles (removes)
                        >
                          <X className="h-3 w-3 text-destructive"/>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* The "Visualize" button will now act on the first of the selectedPodProducts if multiple are selected,
                  or the only one if just one is selected. The UI for displaying visualized product remains singular for now. */}
              <Button 
                type="button" 
                onClick={handleVisualizeOnProduct} 
                disabled={isProcessing || isVisualizingOnProduct || !podImagePreviewUrl || selectedPodProducts.length === 0}
                className="w-full mt-2"
              >
                {isVisualizingOnProduct ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                {`Visualize Design on ${selectedPodProducts.length} Product(s)`}
              </Button>

              {/* Display BATCH Visualized Product Details */}
              {batchVisualizedProducts.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-semibold text-md">Visualized Products:</h4>
                  {batchVisualizedProducts.map((productDetail) => (
                    <Card key={productDetail.tempId} className="p-4 space-y-3">
                      <div className="flex gap-4 items-start">
                        <img 
                          src={productDetail.finalImageUrl} 
                          alt={productDetail.title} 
                          className="w-24 h-24 object-cover rounded-md border" 
                        />
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold">{productDetail.title}</p>
                          <p className="text-sm text-muted-foreground">Base: {productDetail.baseProductName}</p>
                          <p className="text-sm text-muted-foreground">Price: ${productDetail.price}</p>
                          <p className="text-xs text-gray-600 line-clamp-3">{productDetail.description}</p>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        onClick={() => handleAddVisualizedProductToStore(productDetail)} 
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isProcessing}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add This Product to Store
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Display already added POD products (from formData) */}
              {formData.products.items.filter(p => p.isPrintOnDemand).length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-md font-semibold">Added Print on Demand Products:</p>
                  <div className="max-h-96 overflow-y-auto pr-2 space-y-3"> {/* Increased max-h */}
                    {formData.products.items.map((item, index) => {
                      if (item.isPrintOnDemand) {
                        return (
                          <Card key={`pod-item-${index}`} className="p-3 flex gap-3 items-start relative">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="w-20 h-20 object-cover rounded-md border" 
                            />
                            <div className="flex-1 space-y-1">
                              <h4 className="font-semibold text-sm">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">${item.price}</p>
                              <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => removePodProductFromList(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                          </Card>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      );
    case 5: // Collections
      return (
        <motion.div key="step5" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6 w-full">
          <Label className="text-lg font-semibold">How do you want to add collections?</Label>
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, collections: { ...prev.collections, source: value } }))} value={formData.collections.source}>
            <SelectTrigger>
              <SelectValue placeholder="Choose collection source..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ai">Generate with AI</SelectItem>
              <SelectItem value="manual">Add Manually</SelectItem>
            </SelectContent>
          </Select>

          {/* Display general errors for this step */}
          {suggestionError && formData.collections.source === 'ai' && (
            <p className="text-sm text-red-500 mt-2">{suggestionError}</p>
          )}
          {/* Display general collection image generation error if not tied to a specific loading item */}
          {collectionImageGenerationError && formData.collections.source === 'manual' && isGeneratingCollectionImageForIndex === null && (
            <p className="text-sm text-red-500 mt-2">{collectionImageGenerationError}</p>
          )}

          {formData.collections.source === 'ai' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="collectionCount">Number of AI Collections to Generate</Label>
                <Input id="collectionCount" type="number" min="1" max="5" value={formData.collections.count} onChange={(e) => setFormData(prev => ({ ...prev, collections: { ...prev.collections, count: parseInt(e.target.value) || 1 } }))} />
              </div>
              <Button type="button" onClick={generateAiCollections} disabled={isProcessing || !formData.productType || !formData.storeName || formData.products.items.length === 0} className="w-full">
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Collections with AI
              </Button>
              
              {formData.collections.items.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 mt-4">
                  <p className="text-sm font-medium text-muted-foreground">Generated Collections:</p>
                  {formData.collections.items.map((item, index) => (
                    <Card key={index} className="p-4 flex gap-4 items-start">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-md border" />
                      ) : (
                        <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                      )}
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-md">{item.name || "Untitled Collection"}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{item.description || "No description."}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1 mt-2"
                          onClick={() => openManageProductsModal(item)}
                        >
                          Manage Products
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              {currentEditingCollection && (
                <ManageCollectionProductsModal
                  isOpen={isModalOpen}
                  onClose={() => {
                    setIsModalOpen(false);
                    setCurrentEditingCollection(null);
                  }}
                  collection={currentEditingCollection}
                  allProducts={formData.products.items}
                  onSave={handleSaveCollectionProducts}
                />
              )}
            </div>
          )}

          {formData.collections.source === 'manual' && (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              <p className="text-sm font-medium text-muted-foreground">Your Collections:</p>
              {formData.collections.items.map((item, index) => (
                <Card key={index} className="p-4 space-y-3 relative">
                   <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => removeManualCollection(index)} disabled={formData.collections.items.length <= 1 && !item.name && !item.description && !item.imageUrl}>
                      <Trash2 className="h-4 w-4 text-destructive"/>
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                          <Label htmlFor={`collectionName-${index}`}>Collection Name</Label>
                          <Input id={`collectionName-${index}`} value={item.name} onChange={(e) => handleManualCollectionChange(index, 'name', e.target.value)} placeholder="e.g., 'Summer Collection'" />
                      </div>
                  </div>
                  <div>
                      <Label htmlFor={`collectionDescription-${index}`}>Short Description (Optional)</Label>
                      <Textarea id={`collectionDescription-${index}`} value={item.description} onChange={(e) => handleManualCollectionChange(index, 'description', e.target.value)} placeholder="e.g., 'A curated selection of products perfect for the summer season.'" rows={2}/>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-2 border rounded-md">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name || "Collection image"} className="w-24 h-24 object-contain rounded-md border" />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                    )}
                    <Label htmlFor={`collectionImageUpload-${index}`} className="text-sm sr-only">Upload Collection Image</Label>
                    <Input 
                      id={`collectionImageUpload-${index}`} 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          try {
                            const base64 = await fileToBase64(file);
                            handleManualCollectionChange(index, 'imageUrl', base64);
                          } catch (error) {
                            console.error("Error converting file to base64:", error);
                          }
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById(`collectionImageUpload-${index}`).click()}
                      >
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateCollectionImage(index)}
                        disabled={isGeneratingCollectionImageForIndex === index || !item.name}
                      >
                        {isGeneratingCollectionImageForIndex === index ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generate
                      </Button>
                      {item.imageUrl && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleManualCollectionChange(index, 'imageUrl', '')}
                        >
                          <Trash2 className="mr-1 h-3 w-3" /> Remove Img
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Display error specific to this item if it's currently being processed */}
                  {collectionImageGenerationError && isGeneratingCollectionImageForIndex === index && ( 
                      <p className="text-xs text-destructive mt-1">{collectionImageGenerationError}</p>
                  )}
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={addManualCollection} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Collection
              </Button>
            </div>
          )}
        </motion.div>
      );
    case 6: // Final Prompt (shifted from step 5)
      return (
        <motion.div key="step6" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-4 w-full">
          <Label htmlFor="prompt" className="text-lg font-semibold">Describe your store's overall style and feel</Label>
          <Textarea
            id="prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleInputChange}
            placeholder="e.g., 'A minimalist and modern design with a focus on high-quality product imagery. Use a cool color palette.' OR 'A vibrant and playful store with bold colors and fun animations.'"
            className="min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground">This will influence the theme, layout, and imagery. Your store name, logo, and products are already included. You can also pick from the examples below.</p>
          
          <div className="mt-4 space-y-2">
            <Label className="text-md font-semibold">AI Prompt Examples:</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "elegance", displayName: "Elegance", storeName: "Elegant Finds", promptText: "A sophisticated and elegant store experience, focusing on timeless design and high-quality craftsmanship. The aesthetic is refined, with a clean layout and luxurious feel, using a palette of soft neutrals, gold accents, and rich textures." },
                { key: "futuretech", displayName: "FutureTech", storeName: "Nexus Innovations", promptText: "A cutting-edge, futuristic store specializing in the latest technology and gadgets. The design is sleek, minimalist, and dark-themed with neon blue or cyan accents, interactive elements, and a high-tech vibe." },
                { key: "greenharvest", displayName: "GreenHarvest", storeName: "Evergreen Market", promptText: "An eco-friendly and organic store focusing on sustainable and natural products. The design should feel earthy, warm, and inviting, using natural materials, green and brown tones, and imagery of nature." },
                { key: "urbanthreads", displayName: "UrbanThreads", storeName: "Metro Threads Co.", promptText: "A trendy, urban streetwear store with a gritty yet stylish aesthetic. Think industrial-chic, graffiti art influences, bold typography, and a dynamic, energetic feel. Muted colors with pops of vibrant color." }
              ].map((example) => (
                <Button
                  key={example.key}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    props.setFormData(prev => ({
                      ...prev,
                      storeName: example.storeName, // Ensure storeName is set
                      prompt: example.promptText   // Ensure prompt is set
                    }));
                  }}
                  className="bg-primary-foreground dark:bg-neutral-800 hover:bg-primary/10 dark:hover:bg-neutral-700"
                >
                  {example.displayName}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      );
    default:
      return null;
  }
};

export const isWizardNextDisabled = (step, formData, uploadedProductPhotos) => { // Added uploadedProductPhotos
  if (step === 1) {
    if (formData.initialImportMethod === 'productType' && !formData.productType) return true;
    if (formData.initialImportMethod === 'photos' && (!uploadedProductPhotos || uploadedProductPhotos.length === 0)) return true;
  }
  if (step === 2 && !formData.storeName) return true;
  // Step 3 (Logo) can be skipped or have an empty URL
  if (step === 4) { // Products step
    if (formData.products.source === 'manual' && formData.products.items.some(p => !p.name || !p.price)) return true;
    if (formData.products.source === 'ai' && formData.products.items.length === 0 && formData.products.count > 0) return true;
  }
  if (step === 5) { // Collections step
    if (formData.collections.source === 'ai' && formData.collections.items.length === 0 && formData.collections.count > 0) return true;
    if (formData.collections.source === 'manual' && formData.collections.items.some(c => !c.name)) return true;
  }
  if (step === 6 && !formData.prompt) return true; // Final Prompt step
  return false;
};
