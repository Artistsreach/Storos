import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Card } from '../../components/ui/card'; // Added Card import
import { PlusCircle, Trash2, UploadCloud, Sparkles, Loader2 } from 'lucide-react'; // Added UploadCloud, Sparkles, Loader2
import { useToast } from "@/components/ui/use-toast";

// Helper function to convert file to data URL (can be moved to utils if used elsewhere)
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const EditAiProductModal = ({ 
  isOpen, 
  onClose, 
  product: initialProduct, 
  onSave,
  // Props for image generation, to be passed from StoreWizard
  onGenerateMainImage, // (productIndexInWizard, currentProductData) => Promise<newImagesArray | null>
  onGenerateMoreAngles, // (productIndexInWizard, currentProductData) => Promise<newImagesArray | null>
  productIndexInWizard, // Index of this product in the main formData.products.items array
  isGeneratingProductImage, // boolean for main image loading
  isGeneratingAngles       // boolean for angles loading
}) => {
  const [editableProduct, setEditableProduct] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialProduct) {
      // Deep copy variants
      const variants = initialProduct.variants 
        ? initialProduct.variants.map(v => ({
            ...v,
            values: Array.isArray(v.values) ? [...v.values] : (typeof v.values === 'string' ? v.values.split(',').map(s => s.trim()).filter(s => s) : [])
          }))
        : [];

      // Prioritize initialProduct.images. If it's not an array, initialize as empty.
      // This ensures that if the parent updates initialProduct.images, this modal reflects it.
      const images = Array.isArray(initialProduct.images) ? [...initialProduct.images] : [];
      
      // Create a new object for setEditableProduct to ensure re-render if only images array content changes
      const newEditableProduct = { 
        ...initialProduct, // Spread all properties from initialProduct
        variants,         // Overwrite with deep-copied variants
        images            // Overwrite with the (potentially new) images array
      };
      
      // If initialProduct.imageUrl exists and images array is empty, populate from imageUrl (legacy/fallback)
      // This should ideally not be needed if all product items consistently use the `images` array.
      if (images.length === 0 && initialProduct.imageUrl) {
        newEditableProduct.images = [initialProduct.imageUrl];
      }
      
      setEditableProduct(newEditableProduct);
    } else {
      setEditableProduct(null);
    }
  }, [initialProduct, isOpen]); // Dependency array includes initialProduct and isOpen

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setEditableProduct(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleImageChange = (newImagesArray) => {
    setEditableProduct(prev => ({ ...prev, images: newImagesArray }));
  };

  const handleFileUpload = async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      const base64Promises = files.map(file => fileToBase64(file));
      try {
        const base64Results = await Promise.all(base64Promises);
        handleImageChange([...(editableProduct.images || []), ...base64Results]);
      } catch (error) {
        toast({ title: "Image Upload Error", description: "Could not process some images.", variant: "destructive" });
      }
    }
  };

  const removeImage = (indexToRemove) => {
    handleImageChange((editableProduct.images || []).filter((_, i) => i !== indexToRemove));
  };

  const callGenerateMainImage = async () => {
    if (onGenerateMainImage && productIndexInWizard !== null && editableProduct) {
      // Call the handler from StoreWizard. It updates formData.
      // The useEffect watching initialProduct will update editableProduct.
      await onGenerateMainImage(productIndexInWizard, editableProduct); 
    }
  };

  const callGenerateMoreAngles = async () => {
    if (onGenerateMoreAngles && productIndexInWizard !== null && editableProduct && editableProduct.images && editableProduct.images.length > 0) {
      // Call the handler from StoreWizard. It updates formData.
      // The useEffect watching initialProduct will update editableProduct.
      await onGenerateMoreAngles(productIndexInWizard, editableProduct);
    } else {
      toast({title: "Cannot Generate Angles", description: "A main image is required first.", variant: "warning"});
    }
  };


  const handleVariantChange = (optionIndex, field, value) => {
    setEditableProduct(prev => {
      const newVariants = [...(prev.variants || [])];
      newVariants[optionIndex] = { ...newVariants[optionIndex], [field]: value };
      return { ...prev, variants: newVariants };
    });
  };

  const handleVariantValueChange = (optionIndex, valueIndex, newValue) => {
    setEditableProduct(prev => {
      const newVariants = [...(prev.variants || [])];
      const newValues = [...newVariants[optionIndex].values];
      newValues[valueIndex] = newValue;
      newVariants[optionIndex] = { ...newVariants[optionIndex], values: newValues };
      return { ...prev, variants: newVariants };
    });
  };

  const addVariantValue = (optionIndex) => {
    setEditableProduct(prev => {
      const newVariants = [...(prev.variants || [])];
      const newValues = [...newVariants[optionIndex].values, ''];
      newVariants[optionIndex] = { ...newVariants[optionIndex], values: newValues };
      return { ...prev, variants: newVariants };
    });
  };

  const removeVariantValue = (optionIndex, valueIndex) => {
    setEditableProduct(prev => {
      const newVariants = [...(prev.variants || [])];
      const newValues = newVariants[optionIndex].values.filter((_, i) => i !== valueIndex);
      newVariants[optionIndex] = { ...newVariants[optionIndex], values: newValues };
      if (newValues.length === 0) {
        toast({ title: "Info", description: `Variant option "${newVariants[optionIndex].name}" has no values.`, variant: "default" });
      }
      return { ...prev, variants: newVariants };
    });
  };
  
  const addVariantOption = () => {
    setEditableProduct(prev => ({
      ...prev,
      variants: [...(prev.variants || []), { name: '', values: [''] }],
    }));
  };

  const removeVariantOption = (optionIndex) => {
    setEditableProduct(prev => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== optionIndex),
    }));
  };

  const handleSave = () => {
    if (!editableProduct.name || editableProduct.name.trim() === "") {
        toast({ title: "Validation Error", description: "Product name cannot be empty.", variant: "destructive"});
        return;
    }
    if (editableProduct.price === undefined || editableProduct.price === null || isNaN(parseFloat(editableProduct.price)) || parseFloat(editableProduct.price) < 0) {
        toast({ title: "Validation Error", description: "Product price must be a valid non-negative number.", variant: "destructive"});
        return;
    }
    const cleanedVariants = editableProduct.variants ? editableProduct.variants.map(v => ({
        ...v,
        name: v.name.trim(),
        values: v.values.map(val => val.trim()).filter(val => val !== '')
    })).filter(v => v.name !== '' && v.values.length > 0) : [];
    
    onSave({ ...editableProduct, variants: cleanedVariants }); // Pass the whole editableProduct
    onClose();
  };

  if (!isOpen || !editableProduct) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit AI Generated Product</DialogTitle>
          <DialogDescription>
            Modify the details of the generated product below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-3">
          <div className="space-y-4 py-4 pr-2">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" value={editableProduct.name || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" name="price" type="number" value={editableProduct.price || 0} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={editableProduct.description || ''} onChange={handleChange} rows={4} />
            </div>
            
            {/* Image Management Section */}
            <div className="space-y-2 border p-3 rounded-md">
              <Label className="text-md font-semibold">Product Images</Label>
              
              {/* Image List Display */}
              {(editableProduct.images && editableProduct.images.length > 0)
                ? (
                    <div className="overflow-x-auto py-2">
                  <div className="flex flex-row gap-2 mb-2 min-w-max">
                    {editableProduct.images.map((imgSrc, imgIdx) => (
                      // Using imgSrc as part of the key for better re-rendering if URLs change
                      <div key={`${imgSrc}-${imgIdx}`} className="relative group flex-shrink-0"> 
                        <img 
                          src={imgSrc} 
                          alt={`Product image ${imgIdx + 1}`} 
                          className="w-24 h-24 object-contain rounded-md border" 
                        />
                        <Button
                              variant="destructive" 
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(imgIdx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                : (
                    <p className="text-sm text-muted-foreground">No images yet.</p>
                  )
              }

              {/* Action Buttons for Images */}
              <div className="flex flex-wrap gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => document.getElementById('editAiProductImageUpload').click()}>
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload Images
                </Button>
                <Input id="editAiProductImageUpload" type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                
                <Button variant="outline" size="sm" onClick={callGenerateMainImage} disabled={isGeneratingProductImage || !editableProduct.name}>
                  {isGeneratingProductImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {editableProduct.images && editableProduct.images.length > 0 ? 'Regenerate Main' : 'Generate Main'}
                </Button>

                {editableProduct.images && editableProduct.images.length > 0 && (
                  <Button variant="outline" size="sm" onClick={callGenerateMoreAngles} disabled={isGeneratingAngles}>
                    {isGeneratingAngles ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    More Angles
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-md font-semibold">Variants</h3>
              {(editableProduct.variants || []).map((variant, optionIndex) => (
                <Card key={optionIndex} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`variantName-${optionIndex}`}>Option Name</Label>
                    <Button variant="ghost" size="icon" onClick={() => removeVariantOption(optionIndex)} className="h-7 w-7">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Input
                    id={`variantName-${optionIndex}`}
                    value={variant.name || ''}
                    onChange={(e) => handleVariantChange(optionIndex, 'name', e.target.value)}
                    placeholder="e.g., Color, Size"
                  />
                  <Label>Option Values</Label>
                  {variant.values.map((value, valueIndex) => (
                    <div key={valueIndex} className="flex items-center gap-2">
                      <Input
                        value={value || ''}
                        onChange={(e) => handleVariantValueChange(optionIndex, valueIndex, e.target.value)}
                        placeholder="e.g., Red, Large"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeVariantValue(optionIndex, valueIndex)} className="h-7 w-7">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addVariantValue(optionIndex)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Value
                  </Button>
                </Card>
              ))}
              <Button variant="outline" onClick={addVariantOption} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Variant Option
              </Button>
            </div>
            {/* End of Variants Section */}
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAiProductModal;
