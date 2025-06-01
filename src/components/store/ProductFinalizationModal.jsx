import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateDifferentAnglesFromImage, editImageWithGemini } from '@/lib/geminiImageGeneration';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2, UploadCloud, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

// Helper function to convert file to data URL (copied from wizardStepComponents.jsx)
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Helper function to convert image src to base64 (if not already)
const imageSrcToBasics = (imageSrc) => {
  return new Promise((resolve, reject) => {
    if (!imageSrc) {
      return reject(new Error("Image source is undefined or null."));
    }
    if (imageSrc.startsWith('data:')) {
      try {
        const parts = imageSrc.split(',');
        if (parts.length < 2) throw new Error("Invalid data URL structure.");
        const metaPart = parts[0];
        const base64Data = parts[1];
        const mimeTypeMatch = metaPart.match(/:(.*?);/);
        if (!mimeTypeMatch || !mimeTypeMatch[1]) throw new Error("Could not parse MIME type from data URL.");
        const mimeType = mimeTypeMatch[1];
        resolve({ base64ImageData: base64Data, mimeType });
      } catch (error) {
        console.error("Error parsing data URL:", imageSrc, error);
        reject(new Error(`Invalid data URL format: ${error.message}`));
      }
    } else { // Assuming it's a URL that needs fetching and converting
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
          // Prefer PNG for consistency, but could use original type if needed
          const dataUrl = canvas.toDataURL('image/png'); 
          const parts = dataUrl.split(',');
          const base64Data = parts[1];
          resolve({ base64ImageData: base64Data, mimeType: 'image/png' });
        } catch (e) {
          console.error("Canvas toDataURL failed:", e);
          reject(new Error("Canvas toDataURL failed, possibly due to CORS or tainted canvas."));
        }
      };
      img.onerror = (e) => {
        console.error("Failed to load image from URL for conversion:", imageSrc, e);
        reject(new Error("Failed to load image from URL for conversion."));
      };
      img.src = imageSrc;
    }
  });
};


const ProductFinalizationModal = ({ isOpen, onClose, products: initialProducts, onFinalize }) => {
  const [products, setProducts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState({}); // To track loading state per product
  const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);
  const [isEnlargedViewOpen, setIsEnlargedViewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialProducts) {
      // Deep copy and ensure variants and images are arrays
      setProducts(initialProducts.map(p => ({
        ...p,
        images: Array.isArray(p.images) ? [...p.images] : (p.image?.src?.medium ? [p.image.src.medium] : []),
        variants: Array.isArray(p.variants) ? p.variants.map(v => ({...v, values: Array.isArray(v.values) ? [...v.values] : []})) : [],
      })));
    }
  }, [initialProducts]);

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
          const currentImages = Array.isArray(newProducts[productIndex].images) ? newProducts[productIndex].images : [];
          newProducts[productIndex].images = [...currentImages, ...generatedImageUrls];
          return newProducts;
        });
        toast({ title: "Visuals Added", description: `${generatedImageUrls.length} new images added to the product.`, variant: "success" });
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
    setIsProcessing(true);
    // Basic validation: ensure all products have a name and price
    const isValid = products.every(p => p.name && p.name.trim() !== "" && (p.price || p.price === 0) && String(p.price).trim() !== "");
    if (!isValid) {
        toast({
            title: "Missing Information",
            description: "Please ensure all products have a name and a valid price.",
            variant: "destructive",
        });
        setIsProcessing(false);
        return;
    }
    onFinalize(products); // Pass the edited products back
    setIsProcessing(false);
    // onClose(); // The parent component will handle closing after onFinalize completes
  };

  const handleImageEnlarge = (imageUrl) => {
    setEnlargedImageUrl(imageUrl);
    setIsEnlargedViewOpen(true);
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
                <div>
                  <Label htmlFor={`productDescription-${index}`}>Description</Label>
                  <Textarea id={`productDescription-${index}`} value={product.description} onChange={(e) => handleProductChange(index, 'description', e.target.value)} placeholder="Product Description" rows={3} />
                </div>
                
                {/* Image Management */}
                <div className="space-y-2">
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
                        disabled={isProcessing || !product.name} // Example disabled condition
                    >
                        {isProcessing ? ( 
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
                        disabled={isProcessing || isGeneratingVisuals[index] || !product.name || !product.images || product.images.length === 0}
                    >
                        {isGeneratingVisuals[index] ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" /> /* Consider a different icon like Layers or Camera */
                        )}
                        More Angles/Context
                    </Button>
                  </div>
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleFinalize} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setIsEnlargedViewOpen(false)}>
                <PlusCircle className="h-4 w-4 rotate-45" /> {/* Using PlusCircle rotated as a close icon */}
              </Button>
            </DialogClose>
          </DialogHeader>
          <div className="flex justify-center items-center p-4">
            <img src={enlargedImageUrl} alt="Enlarged product" className="max-w-full max-h-[70vh] object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
};

export default ProductFinalizationModal;
