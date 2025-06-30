import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2, UploadCloud, Sparkles, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/components/ui/use-toast";
import { generateDifferentAnglesFromImage, editImageWithGemini } from '../../lib/geminiImageGeneration';
import { imageSrcToBasics } from '../../lib/imageUtils';

// Helper function to convert file to data URL
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

import { useStore } from '../../contexts/StoreContext';

const ProductEditModalStore = ({ isOpen, onClose, product: initialProduct, onSave, storeId, theme }) => {
  const { updateStore, currentStore } = useStore();
  const [productData, setProductData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false);
  const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);
  const [isEnlargedViewOpen, setIsEnlargedViewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialProduct) {
      const isNewApi = initialProduct.item && initialProduct.item.itemId;
      if (isNewApi) {
        setProductData({
          ...initialProduct,
          id: initialProduct.item.itemId,
          name: initialProduct.item.title,
          description: initialProduct.item.title,
          price: initialProduct.item.sku.def.promotionPrice * 1.5,
          cost: initialProduct.item.sku.def.promotionPrice,
          shipping: 0, // Not available in new API
          images: [initialProduct.item.image],
          variants: [], // Not available in new API
          inventory_count: 0, // Not available in new API
        });
      } else {
        setProductData({
          ...initialProduct,
          name: initialProduct.name || initialProduct.product_title,
          description: initialProduct.description || initialProduct.product_description || '',
          price: initialProduct.price || initialProduct.target_sale_price * 1.5,
          cost: initialProduct.cost || initialProduct.target_sale_price,
          shipping: initialProduct.shipping || initialProduct.shipping_cost || 0,
          images: initialProduct.images || [initialProduct.product_main_image_url],
          variants: initialProduct.variants || [],
          inventory_count: initialProduct.inventory_count || 0,
        });
      }
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
    if (!productData || !productData.name) {
      toast({ title: "Missing Product Info", description: "Product name is required to generate visuals.", variant: "destructive" });
      return;
    }

    const baseImageSrc = productData.images && productData.images.length > 0 ? productData.images[0] : null;
    if (!baseImageSrc) {
      toast({ title: "Missing Base Image", description: "At least one image is required to generate more visuals.", variant: "destructive" });
      return;
    }

    setIsGeneratingVisuals(true);

    try {
      const { base64ImageData, mimeType } = await imageSrcToBasics(baseImageSrc);
      const productName = productData.name;
      let generatedImageUrls = [];

      try {
        const angleImages = await generateDifferentAnglesFromImage(base64ImageData, mimeType, productName);
        if (angleImages && angleImages.length > 0) {
          generatedImageUrls.push(...angleImages.slice(0, 2));
        }
        toast({ title: "Angles Generated", description: `${Math.min(2, angleImages?.length || 0)} angle images generated.`, variant: "success" });
      } catch (angleError) {
        console.error("Error generating angles:", angleError);
        toast({ title: "Angle Generation Failed", description: angleError.message, variant: "destructive" });
      }
      
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
        setProductData(prev => {
          const currentImages = Array.isArray(prev.images) ? prev.images : [];
          const existingImageSet = new Set(currentImages);
          const uniqueNewImages = generatedImageUrls.filter(url => !existingImageSet.has(url));

          if (uniqueNewImages.length > 0) {
            return { ...prev, images: [...currentImages, ...uniqueNewImages] };
            toast({ title: "Visuals Added", description: `${uniqueNewImages.length} new images added.`, variant: "success" });
          } else {
            toast({ title: "Visuals Generated", description: "Generated images were already present.", variant: "default" });
            return prev;
          }
        });
      } else {
        toast({ title: "No New Visuals", description: "Could not generate additional visuals.", variant: "default" });
      }

    } catch (error) {
      console.error("Error in handleGenerateMoreVisuals:", error);
      toast({ title: "Visual Generation Error", description: error.message, variant: "destructive" });
    } finally {
      setIsGeneratingVisuals(false);
    }
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
      const updatedProduct = {
        ...productData,
        product_title: productData.name,
        product_description: productData.description,
        sale_price: productData.price,
        target_sale_price: productData.cost,
        shipping_cost: productData.shipping,
        product_main_image_url: productData.images[0],
      };
      if (currentStore && currentStore.products) {
        const updatedProducts = currentStore.products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        await updateStore(storeId, { products: updatedProducts });
      }
      onSave(updatedProduct, initialProduct.id);
      onClose();
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

  const profit = productData.price - productData.cost - productData.shipping;
  const profitMargin = productData.price > 0 ? (profit / productData.price) * 100 : 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product: {initialProduct.item ? initialProduct.item.title : initialProduct.product_title}</DialogTitle>
            <DialogDescription>
              Make changes to the product details below.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-1">
            <div className="space-y-4 pr-4">
              <Card className="p-4 space-y-3">
                <div>
                  <Label htmlFor="productName-edit">Product Name</Label>
                  <Input id="productName-edit" value={productData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Product Name" />
                </div>
                <div>
                  <Label htmlFor="productDescription-edit">Description</Label>
                  <Textarea id="productDescription-edit" value={productData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Product Description" rows={3} />
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="productPrice-edit">Price ({productData.currencyCode || 'USD'})</Label>
                      <Input id="productPrice-edit" type="number" value={productData.price} onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)} placeholder="0.00" className="w-24 text-right" />
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="productCost-edit">Cost</Label>
                      <Input id="productCost-edit" type="number" value={productData.cost} onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)} placeholder="0.00" className="w-24 text-right" />
                    </div>
                    <Progress value={productData.price > 0 ? (productData.cost / productData.price) * 100 : 0} className="h-2 [&>div]:bg-red-500" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="productShipping-edit">Shipping</Label>
                      <Input id="productShipping-edit" type="number" value={productData.shipping} onChange={(e) => handleChange('shipping', parseFloat(e.target.value) || 0)} placeholder="0.00" className="w-24 text-right" />
                    </div>
                    <Progress value={productData.price > 0 ? (productData.shipping / productData.price) * 100 : 0} className="h-2 [&>div]:bg-orange-500" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label>Profit</Label>
                      <Input value={profit.toFixed(2)} disabled className="w-24 text-right" />
                    </div>
                    <Progress value={profitMargin} className="h-2 [&>div]:bg-green-500" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label>Profit Margin</Label>
                      <Input value={`${profitMargin.toFixed(2)}%`} disabled className="w-24 text-right" />
                    </div>
                    <Progress value={profitMargin} className="h-2 [&>div]:bg-green-500" />
                  </div>
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
                        onClick={handleGenerateMoreVisuals}
                        disabled={isProcessing || isGeneratingVisuals || !productData.name || !productData.images || productData.images.length === 0}
                    >
                        {isGeneratingVisuals ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        More Angles/Context (AI)
                    </Button>
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

export default ProductEditModalStore;
