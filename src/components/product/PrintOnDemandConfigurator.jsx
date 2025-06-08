import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'; // For future multi-select
import { ImageIcon, Upload, Settings, Layers, Eye, PlusCircle, RefreshCw, Sparkles, Loader2, Trash2, UploadCloud, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { generateImageFromPromptForPod, visualizeImageOnProductWithGemini } from '../../lib/geminiImageGeneration'; // Assuming these exist

// Helper function to convert file to data URL (copied from wizardStepComponents)
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Hardcoded list of POD products (copied from wizardStepComponents)
const podProductsList = [
  { name: "T-shirt", imageUrl: "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//Shirt.webp" },
  { name: "Hoodie", imageUrl: "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//Hoodie.jpeg" },
  { name: "Baseball Cap", imageUrl: "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//Hat.jpeg" },
  { name: "Mug", imageUrl: "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//Mug.png" },
  { name: "Pillow", imageUrl: "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//Pillow.webp" },
  { name: "Blanket", imageUrl: "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//Bl.webp" },
  { name: "Canvas", imageUrl: "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//IMG_5933.jpeg" },
];


const PrintOnDemandConfigurator = ({ onAddProductToStore }) => { // Added onAddProductToStore prop
  const { toast } = useToast();

  // State from wizardStepComponents.jsx related to POD
  const [podImagePrompt, setPodImagePrompt] = useState('');
  const [podImagePreviewUrl, setPodImagePreviewUrl] = useState('');
  const [uploadedPodImageFile, setUploadedPodImageFile] = useState(null);
  const [podReferenceImageFile, setPodReferenceImageFile] = useState(null);
  const [podReferenceImageUrl, setPodReferenceImageUrl] = useState('');
  const [podSearchTerm, setPodSearchTerm] = useState('');
  const [filteredPodProducts, setFilteredPodProducts] = useState([]);
  const [selectedPodProducts, setSelectedPodProducts] = useState([]);
  const [batchVisualizedProducts, setBatchVisualizedProducts] = useState([]);
  const [isGeneratingPodImagePreview, setIsGeneratingPodImagePreview] = useState(false);
  const [isVisualizingOnProduct, setIsVisualizingOnProduct] = useState(false);
  const [podError, setPodError] = useState('');
  
  // State for inline finalization form
  const [productToFinalize, setProductToFinalize] = useState(null);
  const [isGeneratingAngles, setIsGeneratingAngles] = useState(false); // For "Generate More Angles" in finalization


  const handlePodImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setPodError('');
      setUploadedPodImageFile(file);
      try {
        const base64 = await fileToBase64(file);
        setPodImagePreviewUrl(base64);
        setPodImagePrompt('');
        toast({ title: "Image Uploaded", description: "Your image is ready for visualization." });
      } catch (error) {
        setPodError("Failed to load uploaded image.");
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not process the uploaded image." });
        setPodImagePreviewUrl('');
        setUploadedPodImageFile(null);
      }
    }
  };

  const clearPodImage = () => {
    setPodImagePreviewUrl('');
    setUploadedPodImageFile(null);
    setPodImagePrompt('');
    setPodError('');
    const fileInput = document.getElementById('configuratorPodImageUpload');
    if (fileInput) fileInput.value = '';
  };

  const handlePodReferenceImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setPodError('');
      setPodReferenceImageFile(file);
      try {
        const base64 = await fileToBase64(file);
        setPodReferenceImageUrl(base64);
        toast({ title: "Reference Image Added" });
      } catch (error) {
        setPodError("Failed to load reference image.");
        toast({ variant: "destructive", title: "Reference Image Load Failed" });
        setPodReferenceImageUrl('');
        setPodReferenceImageFile(null);
      }
    }
  };

  const clearPodReferenceImage = () => {
    setPodReferenceImageUrl('');
    setPodReferenceImageFile(null);
    setPodError('');
    const fileInput = document.getElementById('configuratorPodRefImageUpload');
    if (fileInput) fileInput.value = '';
  };

  const handleGeneratePodImagePreview = async () => {
    if (!podImagePrompt) {
      toast({ title: "Missing Prompt", variant: "destructive" });
      return;
    }
    if (uploadedPodImageFile) {
      toast({ title: "Image Already Uploaded", variant: "warning" });
      return;
    }
    setIsGeneratingPodImagePreview(true);
    setPodError('');
    setPodImagePreviewUrl('');
    let generationArgs = { prompt: podImagePrompt };
    if (podReferenceImageFile && podReferenceImageUrl) {
      const [header, base64Data] = podReferenceImageUrl.split(',');
      const mimeType = header.match(/:(.*?);/)[1];
      generationArgs.referenceImage = { base64Data, mimeType, fileName: podReferenceImageFile.name };
    }
    try {
      const result = await generateImageFromPromptForPod(generationArgs);
      if (result.imageData && result.imageMimeType) {
        setPodImagePreviewUrl(`data:${result.imageMimeType};base64,${result.imageData}`);
      } else {
        throw new Error(result.textResponse || "Image data not returned.");
      }
    } catch (error) {
      setPodError(error.message || "Failed to generate image preview.");
      toast({ variant: "destructive", title: "Image Generation Failed", description: error.message });
    } finally {
      setIsGeneratingPodImagePreview(false);
    }
  };

  const handlePodSearchChange = (e) => {
    const term = e.target.value;
    setPodSearchTerm(term);
    if (term) {
      setFilteredPodProducts(podProductsList.filter(p => p.name.toLowerCase().includes(term.toLowerCase())));
    } else {
      setFilteredPodProducts([]);
    }
  };

  const handleSelectPodProduct = (product) => {
    setSelectedPodProducts(prev => {
      const isSelected = prev.some(p => p.name === product.name);
      return isSelected ? prev.filter(p => p.name !== product.name) : [...prev, product];
    });
  };

  const handleVisualizeOnProduct = async () => {
    if (!podImagePreviewUrl || selectedPodProducts.length === 0) {
      toast({ title: "Missing Selections", variant: "destructive" });
      return;
    }
    let imagePromptForApi = uploadedPodImageFile?.name ? `Uploaded: ${uploadedPodImageFile.name}` : podImagePrompt || "Custom design";
    if (!uploadedPodImageFile && !podImagePrompt) {
      toast({ title: "Missing Prompt or Upload", variant: "destructive" });
      return;
    }
    setIsVisualizingOnProduct(true);
    setPodError('');
    setBatchVisualizedProducts([]);
    
    const [header, base64Data] = podImagePreviewUrl.split(',');
    const mimeType = header.match(/:(.*?);/)[1];
    
    // Declare these variables once here
    const newBatchVisualized = []; 
    let overallSuccess = true; 
    let imagePromptForApi = uploadedPodImageFile?.name ? `Uploaded: ${uploadedPodImageFile.name}` : podImagePrompt || "Custom design";

    try { // Outer try for the whole operation including the loop
      for (const productToVisualize of selectedPodProducts) {
        try {
          console.log(`[POD Configurator] Attempting visualization for: ${productToVisualize.name} with design image (first 50 chars): ${podImagePreviewUrl.substring(0,50)}...`);
          // Ensure imagePromptForApi is defined if it wasn't set globally due to some condition
          if (!imagePromptForApi) { // Fallback, though it should be set by now
            imagePromptForApi = podImagePrompt || "Custom design";
          }
          const result = await visualizeImageOnProductWithGemini(base64Data, mimeType, productToVisualize.imageUrl, imagePromptForApi, productToVisualize.name);
          if (result.visualizedImageData && result.productDetails) {
            // newBatchVisualized is already declared, just push to it
            newBatchVisualized.push({
              ...result.productDetails,
              finalImageUrl: `data:${result.visualizedImageMimeType};base64,${result.visualizedImageData}`,
              baseProductName: productToVisualize.name,
              generatedImagePrompt: imagePromptForApi,
              baseProductImageUrl: productToVisualize.imageUrl,
              sourceImageUsedForVisualization: podImagePreviewUrl,
              tempId: `${productToVisualize.name}-${Date.now()}`
            });
            console.log(`[POD Configurator] Visualization success for: ${productToVisualize.name}`);
          } else {
            overallSuccess = false;
            const message = `Visualization failed for ${productToVisualize.name} (no image data returned from service).`;
            console.error(message);
            setPodError(prev => prev + message + " ");
          }
        } catch (error) { // Catch errors for individual product visualization
          overallSuccess = false;
          const message = `Error visualizing ${productToVisualize.name}: ${error.message || "Unknown error"}. `;
          console.error(message, error);
          setPodError(prev => prev + message);
        }
      }
    } catch (outerError) { // Catch unexpected errors outside the loop (e.g., in base64 processing of podImagePreviewUrl)
      overallSuccess = false;
      const message = `An unexpected error occurred during visualization setup: ${outerError.message}. `;
      console.error(message, outerError);
      setPodError(prev => prev + message);
    } finally { // Ensure loading state is always turned off
      setIsVisualizingOnProduct(false);
      console.log("[POD Configurator] Visualization process finished. Loading state off.");
    }

    setBatchVisualizedProducts(newBatchVisualized);

    // Refined toast logic based on overallSuccess and results
    if (newBatchVisualized.length === selectedPodProducts.length && newBatchVisualized.length > 0 && overallSuccess) {
      toast({ title: "Visualization Complete", description: `${newBatchVisualized.length} product(s) visualized.` });
    } else if (newBatchVisualized.length > 0) {
      toast({ title: "Partial Visualization", description: `${newBatchVisualized.length} of ${selectedPodProducts.length} products visualized. Some failed. Check errors in UI or console.`, variant: "warning" });
    } else if (selectedPodProducts.length > 0) { // No successes but items were selected
      toast({ title: "Visualization Failed", description: "Could not visualize any selected products. Check errors in UI or console.", variant: "destructive" });
    }
    // podError state will accumulate specific errors for display
  };
  
  const handleInitiateFinalization = (productDetail) => {
    setProductToFinalize({
        name: productDetail.title || '',
        description: productDetail.description || '',
        price: parseFloat(productDetail.price).toFixed(2) || '',
        images: [productDetail.finalImageUrl], // Start with the visualized image
        // Store all POD details for reference or if needed by onAddProductToStore
        podDetails: { ...productDetail, isPrintOnDemand: true } 
    });
    // Remove from batch display as it's now in finalization form
    setBatchVisualizedProducts(prev => prev.filter(p => p.tempId !== productDetail.tempId));
  };

  const handleFinalizedProductChange = (field, value) => {
    setProductToFinalize(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveFinalizedProduct = () => {
    if (productToFinalize && onAddProductToStore) {
        // The onAddProductToStore prop would be responsible for adding this to the main product list
        // in StoreGenerator.jsx or wherever that list is managed.
        onAddProductToStore({
            ...productToFinalize,
            isPrintOnDemand: true, // Ensure this flag is set
        });
        toast({ title: "Product Ready", description: `"${productToFinalize.name}" details captured.` });
        setProductToFinalize(null); // Clear form
        // Optionally clear selectedPodProducts if all visualized items are processed
        if (batchVisualizedProducts.length === 0) {
            setSelectedPodProducts([]);
            setPodSearchTerm('');
        }
    }
  };
  
  
  const handleGenerateMoreAnglesFinalized = async () => {
    if (!productToFinalize || !productToFinalize.images || productToFinalize.images.length === 0) {
      toast({ title: "No Base Image", description: "Please ensure there's a primary image to generate angles from.", variant: "warning" });
      return;
    }
    setIsGeneratingAngles(true);
    setPodError(''); // Clear general POD errors

    try {
      const baseImageUrl = productToFinalize.images[0];
      const parts = baseImageUrl.split(',');
      if (parts.length !== 2) throw new Error("Invalid base image URL format.");
      
      const metaPart = parts[0];
      const base64Data = parts[1];
      const mimeTypeMatch = metaPart.match(/:(.*?);/);
      if (!mimeTypeMatch || !mimeTypeMatch[1]) throw new Error("Could not determine mime type.");
      const mimeType = mimeTypeMatch[1];

      // Dynamically import as done in wizard
      const { generateDifferentAnglesFromImage } = await import('@/lib/geminiImageGeneration');
      const newAngleImages = await generateDifferentAnglesFromImage(base64Data, mimeType, productToFinalize.name || "Product");

      setProductToFinalize(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newAngleImages.filter(img => !(prev.images || []).includes(img))]
      }));
      toast({ title: "Angles Generated", description: `${newAngleImages.length} new angles added.` });

    } catch (error) {
      console.error("Error generating more angles for finalized product:", error);
      toast({ title: "Angle Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGeneratingAngles(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" /> Print on Demand Configurator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Design Image */}
        <div className="space-y-3 p-4 border rounded-md">
          <Label className="text-base font-semibold block">1. Design Image</Label>
          
          <div className="space-y-1">
            <Label htmlFor="configuratorPodImagePrompt">AI Generation Prompt</Label>
            <Textarea id="configuratorPodImagePrompt" placeholder="e.g., A majestic wolf howling..." value={podImagePrompt} onChange={(e) => setPodImagePrompt(e.target.value)} rows={2} disabled={!!uploadedPodImageFile}/>
          </div>

          <div className="flex flex-wrap gap-2 items-end">
            <Button onClick={handleGeneratePodImagePreview} disabled={isGeneratingPodImagePreview || !podImagePrompt || !!uploadedPodImageFile} variant="outline">
              {isGeneratingPodImagePreview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Generate
            </Button>
            <div>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('configuratorPodRefImageUpload').click()} disabled={!!uploadedPodImageFile}>
                <UploadCloud className="mr-2 h-4 w-4" /> Add Ref.
              </Button>
              <Input id="configuratorPodRefImageUpload" type="file" accept="image/*" className="hidden" onChange={handlePodReferenceImageUpload} />
            </div>
          </div>
          {podReferenceImageUrl && (
            <div className="flex items-center gap-2 text-sm">
              <img src={podReferenceImageUrl} alt="Ref preview" className="w-12 h-12 object-contain rounded border" />
              <span className="truncate max-w-[150px]">{podReferenceImageFile?.name}</span>
              <Button variant="ghost" size="icon" onClick={clearPodReferenceImage} className="h-7 w-7"><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          )}

          <div className="text-center my-2 text-sm text-muted-foreground">OR</div>

          <div>
            <Label htmlFor="configuratorPodImageUpload">Upload Final Image</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input id="configuratorPodImageUpload" type="file" accept="image/*" onChange={handlePodImageUpload} className="flex-grow" disabled={isGeneratingPodImagePreview} />
              {podImagePreviewUrl && uploadedPodImageFile && (
                <Button variant="ghost" size="icon" onClick={clearPodImage} className="h-9 w-9"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              )}
            </div>
          </div>
          
          {podImagePreviewUrl && (
            <div className="mt-3 flex flex-col items-center">
              <Label className="mb-1 text-sm">Design Preview:</Label>
              <img src={podImagePreviewUrl} alt="Design preview" className="w-32 h-32 object-contain rounded-md border bg-muted" />
            </div>
          )}
        </div>

        {/* Step 2: Select Mockup Product */}
        <div className="space-y-3 p-4 border rounded-md">
          <Label className="text-base font-semibold block">2. Select Mockup Product(s)</Label>
          <div className="relative">
            <Input id="configuratorPodProductSearch" placeholder="Search products (e.g., T-shirt, Mug)" value={podSearchTerm} onChange={handlePodSearchChange} disabled={!podImagePreviewUrl} />
            {filteredPodProducts.length > 0 && (
              <Card className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto border bg-background shadow-lg">
                {filteredPodProducts.map(p => (
                  <div key={p.name} className={`p-2 hover:bg-muted cursor-pointer flex items-center gap-2 ${selectedPodProducts.some(sp => sp.name === p.name) ? 'bg-primary/10' : ''}`} onClick={() => handleSelectPodProduct(p)}>
                    <img src={p.imageUrl} alt={p.name} className="w-8 h-8 object-contain rounded-sm"/>
                    <span>{p.name}</span>
                    {selectedPodProducts.some(sp => sp.name === p.name) && <CheckCircle className="h-4 w-4 text-primary ml-auto"/>}
                  </div>
                ))}
              </Card>
            )}
          </div>
          {selectedPodProducts.length > 0 && (
            <div className="mt-2">
              <Label className="text-xs mb-1 block text-muted-foreground">Selected:</Label>
              <div className="flex flex-wrap gap-1.5">
                {selectedPodProducts.map(sp => (
                  <Badge key={sp.name} variant="secondary" className="flex items-center gap-1 pr-0.5">
                    {sp.name}
                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-destructive/20" onClick={() => handleSelectPodProduct(sp)}><X className="h-3 w-3 text-destructive"/></Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Visualize */}
        <div className="p-4 border rounded-md">
            <Label className="text-base font-semibold block mb-3">3. Visualize Design</Label>
            <Button onClick={handleVisualizeOnProduct} disabled={isVisualizingOnProduct || !podImagePreviewUrl || selectedPodProducts.length === 0} className="w-full">
                {isVisualizingOnProduct ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                Visualize on {selectedPodProducts.length} Product(s)
            </Button>

            {batchVisualizedProducts.length > 0 && (
                <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                    <h4 className="font-medium text-md">Visualized Previews:</h4>
                    {batchVisualizedProducts.map((item) => (
                        <Card key={item.tempId} className="p-3">
                            <div className="flex gap-3 items-start">
                                <img src={item.finalImageUrl} alt={item.title} className="w-20 h-20 object-cover rounded-md border" />
                                <div className="flex-1 space-y-0.5">
                                    <p className="font-semibold text-sm">{item.title}</p>
                                    <p className="text-xs text-muted-foreground">Base: {item.baseProductName}</p>
                                    <p className="text-xs text-muted-foreground">Price: ${item.price}</p>
                                </div>
                            </div>
                            <Button onClick={() => handleInitiateFinalization(item)} size="sm" className="w-full mt-2 bg-green-600 hover:bg-green-700">
                                <PlusCircle className="mr-2 h-4 w-4" /> Finalize & Add This Product
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
        
        {podError && (
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/50 rounded-md text-destructive text-sm flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" /> <p className="flex-grow">{podError}</p>
          </div>
        )}

        {/* Step 4: Inline Product Finalization (if a product is selected for finalization) */}
        {productToFinalize && (
          <Card className="mt-6 p-4 border-t">
            <h3 className="text-lg font-semibold mb-3">Finalize Product Details: {productToFinalize.podDetails?.baseProductName || 'Product'}</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="final-pod-name">Product Name</Label>
                <Input id="final-pod-name" value={productToFinalize.name} onChange={(e) => handleFinalizedProductChange('name', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="final-pod-description">Description</Label>
                <Textarea id="final-pod-description" value={productToFinalize.description} onChange={(e) => handleFinalizedProductChange('description', e.target.value)} rows={3}/>
              </div>
              <div>
                <Label htmlFor="final-pod-price">Price ($)</Label>
                <Input id="final-pod-price" type="number" value={productToFinalize.price} onChange={(e) => handleFinalizedProductChange('price', e.target.value)} />
              </div>
              
              {/* Image Gallery for Finalization */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Product Images ({productToFinalize.images?.length || 0})</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 border rounded-md bg-muted/50 max-h-48 overflow-y-auto">
                  {(productToFinalize.images || []).map((imgSrc, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img src={imgSrc} alt={`Product image ${index + 1}`} className="w-full h-full object-contain rounded border" />
                      {productToFinalize.images.length > 1 && ( // Show delete if more than one image
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const newImages = productToFinalize.images.filter((_, i) => i !== index);
                            setProductToFinalize(prev => ({ ...prev, images: newImages }));
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {(!productToFinalize.images || productToFinalize.images.length === 0) && (
                     <p className="col-span-full text-center text-xs text-muted-foreground py-4">No images yet.</p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerateMoreAnglesFinalized}
                  disabled={isGeneratingAngles || !productToFinalize.images || productToFinalize.images.length === 0}
                  className="mt-2"
                >
                  {isGeneratingAngles ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                  Generate More Angles
                </Button>
              </div>
              <Button onClick={handleSaveFinalizedProduct} className="w-full">Save Product to Store List</Button>
            </div>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default PrintOnDemandConfigurator;
