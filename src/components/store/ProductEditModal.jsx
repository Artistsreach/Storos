import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2, UploadCloud, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

// Helper function to convert file to data URL
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const ProductEditModal = ({ isOpen, onClose, product: initialProduct, onSave, storeId, theme }) => {
  const [productData, setProductData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false);
  const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);
  const [isEnlargedViewOpen, setIsEnlargedViewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialProduct) {
      // Deep copy and ensure variants and images are arrays
      setProductData({
        ...initialProduct,
        images: Array.isArray(initialProduct.images) ? [...initialProduct.images] : (initialProduct.image?.src?.medium ? [initialProduct.image.src.medium] : []),
        variants: Array.isArray(initialProduct.variants) ? initialProduct.variants.map(v => ({...v, values: Array.isArray(v.values) ? [...v.values] : []})) : [],
      });
    }
  }, [initialProduct]);

  const handleChange = (field, value) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file) => {
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setProductData(prev => {
          const currentImages = Array.isArray(prev.images) ? prev.images : [];
          return { ...prev, images: [...currentImages, base64] };
        });
      } catch (error) {
        console.error("Error converting file to base64:", error);
        toast({ title: "Image Upload Error", description: "Could not process image.", variant: "destructive" });
      }
    }
  };

  const removeImage = (imageIndex) => {
    setProductData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== imageIndex)
    }));
  };
  
  const handleGenerateProductImage = async () => {
    // Placeholder for AI image generation
    toast({ title: "Image Generation", description: "AI Image generation for this product is not yet implemented here."});
    console.log("Attempting to generate image for product:", productData.name);
  };

  const handleGenerateMoreVisuals = async () => {
    // Placeholder for generating more visuals
    toast({ title: "Visual Generation", description: "Generating more visuals is not yet implemented here." });
  };

  // Variant Handlers
  const handleVariantOptionNameChange = (optionIndex, newName) => {
    setProductData(prev => {
      const newVariants = [...(prev.variants || [])];
      newVariants[optionIndex] = { ...newVariants[optionIndex], name: newName };
      return { ...prev, variants: newVariants };
    });
  };

  const handleVariantValueChange = (optionIndex, valueIndex, newValue) => {
    setProductData(prev => {
      const newVariants = [...(prev.variants || [])];
      const optionToUpdate = { ...newVariants[optionIndex] };
      optionToUpdate.values = [...(optionToUpdate.values || [])];
      optionToUpdate.values[valueIndex] = newValue;
      newVariants[optionIndex] = optionToUpdate;
      return { ...prev, variants: newVariants };
    });
  };

  const addVariantOptionValue = (optionIndex) => {
    setProductData(prev => {
      const newVariants = [...(prev.variants || [])];
      const optionToUpdate = { ...newVariants[optionIndex] };
      optionToUpdate.values = [...(optionToUpdate.values || []), ''];
      newVariants[optionIndex] = optionToUpdate;
      return { ...prev, variants: newVariants };
    });
  };

  const removeVariantOptionValue = (optionIndex, valueIndex) => {
    setProductData(prev => {
      const newVariants = [...(prev.variants || [])];
      const optionToUpdate = { ...newVariants[optionIndex] };
      optionToUpdate.values = (optionToUpdate.values || []).filter((_, i) => i !== valueIndex);
      newVariants[optionIndex] = optionToUpdate;
      return { ...prev, variants: newVariants };
    });
  };
  
  const addVariantOption = () => {
    setProductData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), { name: '', values: [''] }]
    }));
  };

  const removeVariantOption = (optionIndex) => {
    setProductData(prev => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== optionIndex)
    }));
  };

  const handleSave = async () => {
    setIsProcessing(true);
    if (!productData.name || productData.name.trim() === "" || (productData.price === undefined || String(productData.price).trim() === "")) {
        toast({
            title: "Missing Information",
            description: "Please ensure the product has a name and a valid price.",
            variant: "destructive",
        });
        setIsProcessing(false);
        return;
    }
    try {
      await onSave(productData); // Pass the edited product data
      // onClose(); // Parent component (ProductCard) handles closing on successful save
    } catch (error) {
      toast({ title: "Save Error", description: "Could not save product changes.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleImageEnlarge = (imageUrl) => {
    setEnlargedImageUrl(imageUrl);
    setIsEnlargedViewOpen(true);
  };

  if (!isOpen || !productData) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product: {initialProduct.name}</DialogTitle>
            <DialogDescription>
              Make changes to the product details below.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-1">
            <div className="space-y-4 pr-4">
              <Card className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="productName-edit">Product Name</Label>
                    <Input id="productName-edit" value={productData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Product Name" />
                  </div>
                  <div>
                    <Label htmlFor="productPrice-edit">Price ({productData.currencyCode || 'USD'})</Label>
                    <Input id="productPrice-edit" type="number" value={productData.price} onChange={(e) => handleChange('price', parseFloat(e.target.value))} placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="productDescription-edit">Description</Label>
                  <Textarea id="productDescription-edit" value={productData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Product Description" rows={3} />
                </div>
                
                {/* Image Management */}
                <div className="space-y-2">
                  <Label>Product Images</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(productData.images || []).map((imgSrc, imgIdx) => (
                      <div key={imgIdx} className="relative group w-24 h-24 cursor-pointer" onClick={() => handleImageEnlarge(imgSrc)}>
                        <img src={imgSrc} alt={`Product image ${imgIdx + 1}`} className="w-full h-full object-contain rounded-md border" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); removeImage(imgIdx);}}
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
                      onClick={() => document.getElementById(`productImageUpload-edit`).click()}
                    >
                      <UploadCloud className="mr-2 h-4 w-4" /> Upload
                    </Button>
                    <Input 
                      id={`productImageUpload-edit`} 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e.target.files[0])}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateProductImage}
                        disabled={isProcessing || !productData.name}
                    >
                        {isProcessing ? ( 
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generate Image (AI)
                    </Button>
                    {/* <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateMoreVisuals}
                        disabled={isProcessing || isGeneratingVisuals || !productData.name || !productData.images || productData.images.length === 0}
                    >
                        {isGeneratingVisuals ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        More Angles/Context (AI)
                    </Button> */}
                  </div>
                </div>

                {/* Variant Management */}
                <div className="space-y-3 pt-3 border-t mt-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">Product Variants</h4>
                  {(productData.variants || []).map((variant, optionIdx) => (
                    <Card key={optionIdx} className="p-2 space-y-2 bg-muted/10">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`variantName-edit-${optionIdx}`} className="text-xs">Option Name</Label>
                        <Button variant="ghost" size="icon" onClick={() => removeVariantOption(optionIdx)} className="h-6 w-6">
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <Input
                        id={`variantName-edit-${optionIdx}`}
                        value={variant.name || ''}
                        onChange={(e) => handleVariantOptionNameChange(optionIdx, e.target.value)}
                        placeholder="e.g., Color, Size"
                        className="text-sm h-8"
                      />
                      <Label className="text-xs">Option Values</Label>
                      {(variant.values || []).map((value, valueIdx) => (
                        <div key={valueIdx} className="flex items-center gap-1">
                          <Input
                            value={value || ''}
                            onChange={(e) => handleVariantValueChange(optionIdx, valueIdx, e.target.value)}
                            placeholder="e.g., Red"
                            className="text-sm h-8"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeVariantOptionValue(optionIdx, valueIdx)} className="h-6 w-6">
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addVariantOptionValue(optionIdx)} className="text-xs h-7">
                        <PlusCircle className="mr-1 h-3 w-3" /> Add Value
                      </Button>
                    </Card>
                  ))}
                  <Button variant="outline" onClick={addVariantOption} className="w-full text-sm h-8">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Variant Option
                  </Button>
                </div>
                {/* Add other fields as needed: inventory, SKU, categories, tags etc. */}
                {/* Example for inventory (simple number input) */}
                <div className="pt-3 border-t mt-3">
                    <Label htmlFor="productInventory-edit">Inventory Count</Label>
                    <Input id="productInventory-edit" type="number" value={productData.inventory_count || ''} onChange={(e) => handleChange('inventory_count', parseInt(e.target.value) || 0)} placeholder="0" />
                </div>

              </Card>
            </div>
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSave} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
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
                  <PlusCircle className="h-4 w-4 rotate-45" />
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

export default ProductEditModal;
