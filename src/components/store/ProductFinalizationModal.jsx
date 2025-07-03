import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { generateDifferentAnglesFromImage, editImageWithGemini } from '../../lib/geminiImageGeneration';
import { generateProductDescription } from '../../lib/gemini';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { PlusCircle, Trash2, UploadCloud, Sparkles, Loader2, Layers3 } from 'lucide-react'; // Added Layers3
import { useToast } from "@/components/ui/use-toast";
import { useStore } from '../../contexts/StoreContext'; // For POD collection generation
import { imageSrcToBasics } from '../../lib/imageUtils'; // Import from shared util

// Helper function to convert file to data URL (copied from wizardStepComponents.jsx)
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// imageSrcToBasics is now imported from '../../lib/imageUtils'

const ProductFinalizationModal = ({ isOpen, onClose, products: initialProducts, onFinalize, storeDataForFinalization }) => {
  const [products, setProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState({}); // To track loading state per product
  const [isGeneratingDescription, setIsGeneratingDescription] = useState({});
  const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);
  const [isEnlargedViewOpen, setIsEnlargedViewOpen] = useState(false);
  const { toast } = useToast();
  const { generatePodCollectionFromDesign, addPendingPodCollectionData, isGeneratingPodCollection, currentStore, isGenerating } = useStore(); // Get context functions

  useEffect(() => {
    if (initialProducts) {
      // Deep copy and ensure variants and images are arrays
      setProducts(initialProducts.map(p => {
        let imagesArray = [];
        if (Array.isArray(p.images)) {
          imagesArray = [...p.images];
        } else if (p.image?.src?.medium) {
          imagesArray = [p.image.src.medium];
        }

        // For POD products, ensure the mockup is the first image, not the design source.
        if (p.isPrintOnDemand && p.podDetails?.originalDesignImageUrl) {
          const mockupIndex = imagesArray.findIndex(img => img !== p.podDetails.originalDesignImageUrl);
          // If a mockup is found and it's not already the first image, move it to the front.
          if (mockupIndex > 0) {
            const mockupImage = imagesArray.splice(mockupIndex, 1)[0];
            imagesArray.unshift(mockupImage);
          }
        }

        return {
          ...p,
          isFunded: storeDataForFinalization?.type === 'fund',
          images: imagesArray, // Ensures images is always an array
          variants: Array.isArray(p.variants) ? p.variants.map(v => ({...v, values: Array.isArray(v.values) ? [...v.values] : []})) : [],
        };
      }));
    }
  }, [initialProducts, storeDataForFinalization?.type]);

  const handleProductChange = (index, field, value) => {
    setProducts(prev => {
      const newProducts = [...prev];
      newProducts[index] = { ...newProducts[index], [field]: value };
      return newProducts;
    });
  };

  const handleImageUpload = async (productIndex, file) => {
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setProducts(prev => {
          const newProducts = [...prev];
          const currentImages = Array.isArray(newProducts[productIndex].images) ? newProducts[productIndex].images : [];
          newProducts[productIndex].images = [...currentImages, base64];
          return newProducts;
        });
      } catch (error) {
        console.error("Error converting file to base64:", error);
        toast({ title: "Image Upload Error", description: "Could not process image.", variant: "destructive" });
      }
    }
  };

  const removeImage = (productIndex, imageIndex) => {
    setProducts(prev => {
      const newProducts = [...prev];
      newProducts[productIndex].images = newProducts[productIndex].images.filter((_, i) => i !== imageIndex);
      return newProducts;
    });
  };
  
  // Placeholder for AI image generation for a specific product
  const handleGenerateProductImage = async (productIndex) => {
    // This would call a Gemini function similar to the wizard
    // For now, it's a placeholder
    toast({ title: "Image Generation", description: "AI Image generation for this product is not yet implemented in this modal."});
    console.log("Attempting to generate image for product at index:", productIndex, products[productIndex].name);
  };

  const handleGenerateMoreVisuals = async (productIndex) => {
    const product = products[productIndex];
    if (!product || !product.name) {
      toast({ title: "Missing Product Info", description: "Product name is required to generate visuals.", variant: "destructive" });
      return;
    }

    const baseImageSrc = product.images && product.images.length > 0 ? product.images[0] : null;
    if (!baseImageSrc) {
      toast({ title: "Missing Base Image", description: "At least one image is required to generate more visuals.", variant: "destructive" });
      return;
    }

    setIsGeneratingVisuals(prev => ({ ...prev, [productIndex]: true }));

    try {
      const { base64ImageData, mimeType } = await imageSrcToBasics(baseImageSrc);
      const productName = product.name;
      let generatedImageUrls = [];

      // 1. Generate 2 different camera angles
      try {
        const angleImages = await generateDifferentAnglesFromImage(base64ImageData, mimeType, productName);
        if (angleImages && angleImages.length > 0) {
          generatedImageUrls.push(...angleImages.slice(0, 2)); // Take the first 2 angles
        }
        toast({ title: "Angles Generated", description: `${Math.min(2, angleImages?.length || 0)} angle images generated.`, variant: "success" });
      } catch (angleError) {
        console.error("Error generating angles:", angleError);
        toast({ title: "Angle Generation Failed", description: angleError.message, variant: "destructive" });
      }
      
      // 2. Generate 2 "in context" images
      const contextPrompts = [
        `Place this product, "${productName}", in a realistic home setting where it might be used or displayed. Focus on a natural context.`,
        `Show this product, "${productName}", in an outdoor lifestyle setting, highlighting its use case or appeal.`,
      ];

      for (const prompt of contextPrompts) {
        try {
          const contextImageResult = await editImageWithGemini(base64ImageData, mimeType, prompt);
          if (contextImageResult && contextImageResult.editedImageData) {
            generatedImageUrls.push(`data:${contextImageResult.newMimeType};base64,${contextImageResult.editedImageData}`);
          }
        } catch (contextError) {
          console.error(`Error generating context image with prompt "${prompt}":`, contextError);
          toast({ title: "Context Image Failed", description: `Failed for: ${prompt.substring(0,30)}...`, variant: "destructive" });
        }
      }
      toast({ title: "Context Images Attempted", description: `Attempted to generate ${contextPrompts.length} context images.`, variant: "success" });


      if (generatedImageUrls.length > 0) {
        setProducts(prev => {
          const newProducts = [...prev];
          const productToUpdate = newProducts[productIndex];
          const currentImages = Array.isArray(productToUpdate.images) ? productToUpdate.images : [];
          const existingImageSet = new Set(currentImages);
          const uniqueNewImages = generatedImageUrls.filter(url => !existingImageSet.has(url));

          if (uniqueNewImages.length > 0) {
            productToUpdate.images = [...currentImages, ...uniqueNewImages];
            toast({ title: "Visuals Added", description: `${uniqueNewImages.length} new images added.`, variant: "success" });
          } else {
            toast({ title: "Visuals Generated", description: "Generated images were already present.", variant: "default" });
          }
          
          return newProducts;
        });
      } else {
        toast({ title: "No New Visuals", description: "Could not generate additional visuals.", variant: "default" });
      }

    } catch (error) {
      console.error("Error in handleGenerateMoreVisuals:", error);
      toast({ title: "Visual Generation Error", description: error.message, variant: "destructive" });
    } finally {
      setIsGeneratingVisuals(prev => ({ ...prev, [productIndex]: false }));
    }
  };


  // Variant Handlers (copied and adapted from wizardStepComponents.jsx)
  const handleVariantOptionNameChange = (productIndex, optionIndex, newName) => {
    setProducts(prev => {
      const newProducts = [...prev];
      const productToUpdate = { ...newProducts[productIndex] };
      productToUpdate.variants = [...(productToUpdate.variants || [])];
      productToUpdate.variants[optionIndex] = { ...productToUpdate.variants[optionIndex], name: newName };
      newProducts[productIndex] = productToUpdate;
      return newProducts;
    });
  };

  const handleVariantValueChange = (productIndex, optionIndex, valueIndex, newValue) => {
    setProducts(prev => {
      const newProducts = [...prev];
      const productToUpdate = { ...newProducts[productIndex] };
      productToUpdate.variants = [...(productToUpdate.variants || [])];
      const optionToUpdate = { ...productToUpdate.variants[optionIndex] };
      optionToUpdate.values = [...(optionToUpdate.values || [])];
      optionToUpdate.values[valueIndex] = newValue;
      productToUpdate.variants[optionIndex] = optionToUpdate;
      newProducts[productIndex] = productToUpdate;
      return newProducts;
    });
  };

  const addVariantOptionValue = (productIndex, optionIndex) => {
    setProducts(prev => {
      const newProducts = [...prev];
      const productToUpdate = { ...newProducts[productIndex] };
      productToUpdate.variants = [...(productToUpdate.variants || [])];
      const optionToUpdate = { ...productToUpdate.variants[optionIndex] };
      optionToUpdate.values = [...(optionToUpdate.values || []), ''];
      productToUpdate.variants[optionIndex] = optionToUpdate;
      newProducts[productIndex] = productToUpdate;
      return newProducts;
    });
  };

  const removeVariantOptionValue = (productIndex, optionIndex, valueIndex) => {
    setProducts(prev => {
      const newProducts = [...prev];
      const productToUpdate = { ...newProducts[productIndex] };
      productToUpdate.variants = [...(productToUpdate.variants || [])];
      const optionToUpdate = { ...productToUpdate.variants[optionIndex] };
      optionToUpdate.values = (optionToUpdate.values || []).filter((_, i) => i !== valueIndex);
      productToUpdate.variants[optionIndex] = optionToUpdate;
      newProducts[productIndex] = productToUpdate;
      return newProducts;
    });
  };
  
  const addVariantOption = (productIndex) => {
    setProducts(prev => {
      const newProducts = [...prev];
      const productToUpdate = { ...newProducts[productIndex] };
      productToUpdate.variants = [...(productToUpdate.variants || []), { name: '', values: [''] }];
      newProducts[productIndex] = productToUpdate;
      return newProducts;
    });
  };

  const removeVariantOption = (productIndex, optionIndex) => {
    setProducts(prev => {
      const newProducts = [...prev];
      const productToUpdate = { ...newProducts[productIndex] };
      productToUpdate.variants = (productToUpdate.variants || []).filter((_, i) => i !== optionIndex);
      newProducts[productIndex] = productToUpdate;
      return newProducts;
    });
  };

  const handleFinalize = () => {
    // Basic validation: ensure all products have a name and price
    const isValid = products.every(p => p.name && p.name.trim() !== "" && (p.price || p.price === 0) && String(p.price).trim() !== "");
    if (!isValid) {
        toast({
            title: "Missing Information",
            description: "Please ensure all products have a name and a valid price.",
            variant: "destructive",
        });
        return;
    }
    onFinalize(products); // Pass the edited products back
    // The parent component (context) will handle closing after onFinalize completes
    // and will manage the isGenerating state.
  };

  const handleImageEnlarge = (imageUrl) => {
    setEnlargedImageUrl(imageUrl);
    setIsEnlargedViewOpen(true);
  };

  const handleCreatePodCollection = async (productIndex) => {
    const product = products[productIndex];
    if (!product || !product.podDetails?.originalDesignImageUrl) {
      toast({ title: "Error", description: "Product details or original design image missing for POD collection.", variant: "destructive" });
      return;
    }

    const originalDesignImageUrl = product.podDetails.originalDesignImageUrl;
    const designPrompt = product.podDetails.designPrompt || `Design based on ${product.name}`;
    const baseProductName = product.podDetails.baseProductName || product.name;

    // Call generatePodCollectionFromDesign without storeId for pre-finalization
    const result = await generatePodCollectionFromDesign(
      originalDesignImageUrl,
      designPrompt,
      baseProductName 
      // storeId is omitted, so the function knows it's for pre-finalization
    );

    if (result && result.newProducts && result.newCollection) {
      // Add the generated products and collection to the modal's state via context
      addPendingPodCollectionData({ 
        newProducts: result.newProducts, 
        newCollection: result.newCollection 
      });
      // Toast messages for success are handled within addPendingPodCollectionData or generatePodCollectionFromDesign
    } else {
      // Error toasts are handled within generatePodCollectionFromDesign
      console.error("POD Collection generation in modal failed or returned no data.");
    }
    // Loading state (isGeneratingPodCollection) is handled by context
  };

  const handleGenerateDescription = async (productIndex) => {
    const product = products[productIndex];
    if (!product || !product.name) {
      toast({ title: "Missing Product Name", description: "Product name is required to generate a description.", variant: "destructive" });
      return;
    }
  
    setIsGeneratingDescription(prev => ({ ...prev, [productIndex]: true }));
  
    try {
      const storeInfo = {
        name: currentStore?.name,
        niche: currentStore?.niche,
        targetAudience: currentStore?.targetAudience,
        style: currentStore?.style,
      };
  
      const result = await generateProductDescription(product, storeInfo);
  
      if (result.description) {
        handleProductChange(productIndex, 'description', result.description);
        toast({ title: "Description Generated", description: "The product description has been updated.", variant: "success" });
      } else {
        throw new Error(result.error || "Failed to generate description.");
      }
    } catch (error) {
      console.error("Error generating product description:", error);
      toast({ title: "Description Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGeneratingDescription(prev => ({ ...prev, [productIndex]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Finalize Your Products</DialogTitle>
          <DialogDescription>
            Review and edit the AI-generated products before creating your store.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="space-y-6 pr-4">
            {products.map((product, index) => (
              <Card key={product.id || index} className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`productName-${index}`}>Product Name</Label>
                    <Input id={`productName-${index}`} value={product.name} onChange={(e) => handleProductChange(index, 'name', e.target.value)} placeholder="Product Name" />
                  </div>
                  <div>
                    <Label htmlFor={`productPrice-${index}`}>Price (USD)</Label>
                    <Input id={`productPrice-${index}`} type="number" value={product.price} onChange={(e) => handleProductChange(index, 'price', e.target.value)} placeholder="0.00" />
                  </div>
                </div>
                {storeDataForFinalization?.type !== 'fund' && (
                  <div className="flex items-center space-x-2 mt-4">
                    <input
                      type="checkbox"
                      id={`fundProductCheckbox-${index}`}
                      className="h-4 w-4"
                      checked={!!product.isFunded}
                      onChange={(e) => handleProductChange(index, 'isFunded', e.target.checked)}
                    />
                    <Label htmlFor={`fundProductCheckbox-${index}`} className="font-semibold">
                      Fund this product
                    </Label>
                  </div>
                )}
                {product.isFunded && (
                  <div className="space-y-3 pt-3 mt-3 border-t">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`productInventory-${index}`}>Funding Goal (Units)</Label>
                        <Input id={`productInventory-${index}`} type="number" value={product.inventory} onChange={(e) => handleProductChange(index, 'inventory', e.target.value)} placeholder="e.g., 100" />
                      </div>
                      <div>
                        <Label htmlFor={`productPreorderPrice-${index}`}>Pre-order Price (USD)</Label>
                        <Input id={`productPreorderPrice-${index}`} type="number" value={product.preorder_price} onChange={(e) => handleProductChange(index, 'preorder_price', e.target.value)} placeholder="e.g., 25.00" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`productDuration-${index}`}>Funding Duration (days)</Label>
                        <Input id={`productDuration-${index}`} type="number" value={product.duration} onChange={(e) => handleProductChange(index, 'duration', e.target.value)} placeholder="e.g., 30" max="180" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="relative">
                  <Label htmlFor={`productDescription-${index}`}>Description</Label>
                  <Textarea id={`productDescription-${index}`} value={product.description} onChange={(e) => handleProductChange(index, 'description', e.target.value)} placeholder="Product Description" rows={3} />
                  {product.isDropshipping && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute bottom-2 right-2 text-xs h-7"
                    onClick={() => handleGenerateDescription(index)}
                    disabled={isGeneratingDescription[index] || !product.name}
                  >
                    {isGeneratingDescription[index] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate
                  </Button>
                  )}
                </div>
                
                {/* Image Management */}
                <div className="space-y-2 mb-[3px]">
                  <Label>Product Images</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(product.images || []).map((imgSrc, imgIdx) => (
                      <div key={imgIdx} className="relative group w-24 h-24 cursor-pointer" onClick={() => handleImageEnlarge(imgSrc)}>
                        <img src={imgSrc} alt={`Product ${index + 1} image ${imgIdx + 1}`} className="w-full h-full object-contain rounded-md border" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index, imgIdx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById(`productImageUpload-${index}`).click()}
                    >
                      <UploadCloud className="mr-2 h-4 w-4" /> Upload
                    </Button>
                    <Input 
                      id={`productImageUpload-${index}`} 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(index, e.target.files[0])}
                    />
                     {/* Placeholder for AI Generate Image Button */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateProductImage(index)}
                        disabled={isSubmitting || !product.name} // Example disabled condition
                    >
                        {isSubmitting ? ( 
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generate Image
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateMoreVisuals(index)}
                        disabled={isGeneratingVisuals[index] || !product.name || !product.images || product.images.length === 0}
                    >
                        {isGeneratingVisuals[index] ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" /> /* Consider a different icon like Layers or Camera */
                        )}
                        More Angles/Context
                    </Button>
                  </div>
                  {product.isPrintOnDemand && product.podDetails?.originalDesignImageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => handleCreatePodCollection(index)}
                      disabled={isGeneratingVisuals[index] || isGeneratingPodCollection} 
                    >
                      {isGeneratingPodCollection && isGeneratingVisuals[index] !== true ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers3 className="mr-2 h-4 w-4" />}
                      Create Full POD Collection
                    </Button>
                  )}
                </div>

                {/* Variant Management */}
                <div className="space-y-3 pt-3 border-t mt-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">Product Variants</h4>
                  {(product.variants || []).map((variant, optionIdx) => (
                    <Card key={optionIdx} className="p-2 space-y-2 bg-muted/10">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`variantName-${index}-${optionIdx}`} className="text-xs">Option Name</Label>
                        <Button variant="ghost" size="icon" onClick={() => removeVariantOption(index, optionIdx)} className="h-6 w-6">
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <Input
                        id={`variantName-${index}-${optionIdx}`}
                        value={variant.name || ''}
                        onChange={(e) => handleVariantOptionNameChange(index, optionIdx, e.target.value)}
                        placeholder="e.g., Color, Size"
                        className="text-sm h-8"
                      />
                      <Label className="text-xs">Option Values (comma-separated or add one by one)</Label>
                      {(variant.values || []).map((value, valueIdx) => (
                        <div key={valueIdx} className="flex items-center gap-1">
                          <Input
                            value={value || ''}
                            onChange={(e) => handleVariantValueChange(index, optionIdx, valueIdx, e.target.value)}
                            placeholder="e.g., Red"
                            className="text-sm h-8"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeVariantOptionValue(index, optionIdx, valueIdx)} className="h-6 w-6">
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addVariantOptionValue(index, optionIdx)} className="text-xs h-7">
                        <PlusCircle className="mr-1 h-3 w-3" /> Add Value
                      </Button>
                    </Card>
                  ))}
                  <Button variant="outline" onClick={() => addVariantOption(index)} className="w-full text-sm h-8">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Variant Option
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleFinalize} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Finalize and Create Store
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {isEnlargedViewOpen && enlargedImageUrl && (
      <Dialog open={isEnlargedViewOpen} onOpenChange={setIsEnlargedViewOpen}>
        <DialogContent className="max-w-xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Enlarged Image</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-4 max-h-[70vh]">
            <img src={enlargedImageUrl} alt="Enlarged product" className="max-w-full max-h-full object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
};

export default ProductFinalizationModal;
