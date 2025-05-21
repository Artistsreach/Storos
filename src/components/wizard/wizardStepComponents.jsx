
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2, Wand2, Sparkles, PlusCircle, Trash2 } from 'lucide-react';
import ManageCollectionProductsModal from '@/components/store/ManageCollectionProductsModal'; // Import the modal

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
    isProcessing, productTypeOptions: pto, 
    storeNameSuggestions, handleSuggestionClick, suggestionError,
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditingCollection, setCurrentEditingCollection] = useState(null);

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
    case 1: // Product Type
      return (
        <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-4 w-full">
          <Label htmlFor="productType" className="text-lg font-semibold">What kind of products will your store sell?</Label>
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
        </motion.div>
      );
    case 2: // Store Name
      return (
        <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-4 w-full">
          <Label htmlFor="storeName" className="text-lg font-semibold">What's your store name?</Label>
          <div className="flex gap-2">
            <Input id="storeName" name="storeName" value={formData.storeName} onChange={handleInputChange} placeholder="e.g., 'The Cozy Corner Bookstore'" />
            <Button type="button" variant="outline" onClick={suggestStoreName} disabled={isProcessing || !formData.productType}>
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">Suggest</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Choose a catchy name or let us suggest one based on your product type!</p>
          
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
                    className="bg-primary-foreground hover:bg-primary/10"
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
        <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-4 w-full">
          <Label className="text-lg font-semibold">Design a logo for your store</Label>
          <div className="flex flex-col items-center gap-4 p-4 border rounded-md">
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Generated logo" className="w-32 h-32 object-contain rounded-md border" />
            ) : (
              <div className="w-32 h-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                Logo Preview
              </div>
            )}
            <Button type="button" onClick={generateLogo} disabled={isProcessing || !formData.storeName}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate Logo with AI
            </Button>
            <p className="text-xs text-muted-foreground text-center">AI will generate a logo based on your store name and product type. (Uses Gemini API - Placeholder)</p>
          </div>
           <Label htmlFor="logoUrl" className="text-sm">Or paste an image URL:</Label>
           <Input id="logoUrl" name="logoUrl" value={formData.logoUrl} onChange={handleInputChange} placeholder="https://example.com/logo.png" />
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
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2 mt-4">
                  <p className="text-sm font-medium text-muted-foreground">Generated Products:</p>
                  {formData.products.items.map((item, index) => (
                    <Card key={index} className="p-4 flex gap-4 items-start">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-md border" />
                      ) : (
                        <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                      )}
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-md">{item.name || "Untitled Product"}</h4>
                        <p className="text-sm text-muted-foreground">${item.price || "0.00"}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{item.description || "No description."}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {formData.products.source === 'manual' && (
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
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
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={addManualProduct} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Product
              </Button>
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
              {/* <SelectItem value="manual">Add Manually</SelectItem> */}
            </SelectContent>
          </Select>

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
              {suggestionError && formData.collections.source === 'ai' && (
                <p className="text-sm text-red-500 mt-2">{suggestionError}</p>
              )}
              {formData.collections.items.length > 0 && (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2 mt-4">
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
                      {/* Placeholder for image change/edit options */}
                      <div className="flex flex-col gap-1">
                        {/* <Button variant="outline" size="sm" className="text-xs h-auto py-1">Change Image</Button>
                        <Button variant="outline" size="sm" className="text-xs h-auto py-1">Edit Image</Button> */}
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
          <p className="text-sm text-muted-foreground">This will influence the theme, layout, and imagery. Your store name, logo, and products are already included.</p>
        </motion.div>
      );
    default:
      return null;
  }
};

export const isWizardNextDisabled = (step, formData) => {
  if (step === 1 && !formData.productType) return true;
  if (step === 2 && !formData.storeName) return true;
  // Step 3 (Logo) can be skipped or have an empty URL
  if (step === 4) { // Products step
    if (formData.products.source === 'manual' && formData.products.items.some(p => !p.name || !p.price)) return true;
    if (formData.products.source === 'ai' && formData.products.items.length === 0 && formData.products.count > 0) return true;
  }
  if (step === 5) { // Collections step
    if (formData.collections.source === 'ai' && formData.collections.items.length === 0 && formData.collections.count > 0) return true;
  }
  if (step === 6 && !formData.prompt) return true; // Final Prompt step
  return false;
};
