import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { UploadCloud, Image as ImageIcon, Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';

// TODO: Move this to a VITE_MESHY_API_KEY environment variable
const MESHY_API_KEY = 'msy_4wQeZBKbKsyGKmfCOGWk0Ux9F7zGIByWSgwC';
const MESHY_API_BASE_URL = 'https://api.meshy.ai/openapi/v1';

const Generate3DModelModal = ({ open, onOpenChange, product, storeId, onModelGenerated }) => {
  const { toast } = useToast();
  const [selectedImages, setSelectedImages] = useState([]); // Array of { name: string, url: string (dataURL or public URL), file?: File }
  const [meshyTaskId, setMeshyTaskId] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState(''); // PENDING, IN_PROGRESS, SUCCEEDED, FAILED
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pollingIntervalId, setPollingIntervalId] = useState(null);

  const getProductImageUrls = useCallback(() => {
    if (!product) return [];
    // For standard products
    if (product.image?.src?.large || product.image?.src?.medium) {
      return [{ name: 'Main Product Image', url: product.image.src.large || product.image.src.medium }];
    }
    // For Shopify products
    if (product.images?.edges?.length > 0 && product.images.edges[0].node?.url) {
      return product.images.edges.map((edge, index) => ({
        name: `Product Image ${index + 1}`,
        url: edge.node.url
      })).slice(0, 4); // Max 4 images for multi-image
    }
    return [];
  }, [product]);

  useEffect(() => {
    if (open && product) {
      // Reset state when modal opens
      setSelectedImages(getProductImageUrls().slice(0,1)); // Default to first product image
      setMeshyTaskId(null);
      setGenerationProgress(0);
      setGenerationStatus('');
      setErrorMessage('');
      setIsLoading(false);
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
      }
    } else if (!open && pollingIntervalId) {
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }
  }, [open, product, getProductImageUrls, pollingIntervalId]);


  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const newImages = [];
    let currentImageCount = selectedImages.length;

    files.forEach(file => {
      if (currentImageCount >= 4) {
        toast({ title: "Limit Reached", description: "You can select up to 4 images.", variant: "warning" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({ name: file.name, url: e.target.result, file });
        if (newImages.length === Math.min(files.length, 4 - selectedImages.length)) { // Check if all selected valid files are processed
            setSelectedImages(prev => [...prev, ...newImages].slice(0,4));
        }
      };
      reader.readAsDataURL(file);
      currentImageCount++;
    });
  };
  
  const removeImage = (indexToRemove) => {
    setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const startGeneration = async () => {
    if (selectedImages.length === 0) {
      toast({ title: 'No Image Selected', description: 'Please select at least one image.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    setGenerationStatus('PENDING');
    setGenerationProgress(5); // Initial progress

    const endpoint = selectedImages.length > 1 ? '/multi-image-to-3d' : '/image-to-3d';
    const payload = selectedImages.length > 1 
      ? { image_urls: selectedImages.map(img => img.url) }
      : { image_url: selectedImages[0].url };
    
    // Common optional parameters (can be exposed in UI later)
    payload.enable_pbr = true; 
    payload.should_texture = true;
    if (selectedImages.length === 1 && product?.name) { // texture_prompt only for single image with meshy-4
        // payload.texture_prompt = `High quality texture for ${product.name}`; // Example
        // payload.ai_model = 'meshy-4'; // texture_prompt might require meshy-4
    }


    try {
      const response = await fetch(`${MESHY_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MESHY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || `API Error: ${response.status}`);
      }

      if (data.result) {
        setMeshyTaskId(data.result);
        setGenerationStatus('IN_PROGRESS');
        setGenerationProgress(10);
        // Start polling
        const intervalId = setInterval(() => pollTaskStatus(data.result, endpoint), 5000); // Poll every 5 seconds
        setPollingIntervalId(intervalId);
      } else {
        throw new Error('Task ID not found in response.');
      }
    } catch (error) {
      console.error('Error creating Meshy task:', error);
      setErrorMessage(`Error creating task: ${error.message}`);
      setGenerationStatus('FAILED');
      setIsLoading(false);
    }
  };

  const pollTaskStatus = async (taskId, baseEndpoint) => {
    try {
      const response = await fetch(`${MESHY_API_BASE_URL}${baseEndpoint}/${taskId}`, {
        headers: { 'Authorization': `Bearer ${MESHY_API_KEY}` },
      });
      const data = await response.json();

      if (!response.ok) {
        // If task not found yet (404), it might still be processing, keep polling for a bit
        if (response.status === 404 && generationProgress < 30) {
            setGenerationProgress(prev => Math.min(prev + 5, 30)); // Increment progress slowly
            return; 
        }
        throw new Error(data.detail || data.message || `API Error: ${response.status}`);
      }

      setGenerationProgress(data.progress || generationProgress);
      setGenerationStatus(data.status);

      if (data.status === 'SUCCEEDED') {
        if (pollingIntervalId) clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
        setIsLoading(false);
        if (data.model_urls?.glb) {
          onModelGenerated(data.model_urls.glb);
          toast({ title: '3D Model Generated!', description: 'The model has been successfully created.' });
          onOpenChange(false); // Close modal on success
        } else {
          throw new Error('GLB model URL not found in successful response.');
        }
      } else if (data.status === 'FAILED') {
        if (pollingIntervalId) clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
        setErrorMessage(data.task_error?.message || 'Generation failed for an unknown reason.');
        setIsLoading(false);
      } else if (data.status === 'PENDING' || data.status === 'IN_PROGRESS') {
        // Continue polling
        if (data.progress === 100 && data.status === 'IN_PROGRESS') {
          // Sometimes progress hits 100 before status flips to SUCCEEDED
          setGenerationProgress(99); 
        }
      }
    } catch (error) {
      console.error('Error polling Meshy task status:', error);
      setErrorMessage(`Error polling status: ${error.message}`);
      if (pollingIntervalId) clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
      setGenerationStatus('FAILED');
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate 3D Model for {product?.name || product?.title || 'Product'}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="image-upload">Product Images (select 1-4)</Label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group aspect-square border rounded-md overflow-hidden">
                  <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6 opacity-50 group-hover:opacity-100"
                    onClick={() => removeImage(index)}
                    disabled={isLoading || generationStatus === 'IN_PROGRESS'}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              {selectedImages.length < 4 && (
                <Label 
                  htmlFor="image-upload-input" 
                  className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors text-muted-foreground"
                >
                  <UploadCloud size={24} className="mb-1"/>
                  <span className="text-xs">Add Image</span>
                </Label>
              )}
            </div>
            <Input
              id="image-upload-input"
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading || generationStatus === 'IN_PROGRESS' || selectedImages.length >=4}
            />
             <p className="text-xs text-muted-foreground">
                Default is main product image. You can add up to 4 images (PNG, JPG). More images can improve quality.
            </p>
          </div>

          {generationStatus && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Status: {generationStatus}</Label>
                {generationStatus === 'SUCCEEDED' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {generationStatus === 'FAILED' && <XCircle className="h-5 w-5 text-red-500" />}
                {(generationStatus === 'PENDING' || generationStatus === 'IN_PROGRESS') && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
              <Progress value={generationProgress} className="w-full" />
              {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading && generationStatus === 'IN_PROGRESS'}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={startGeneration} 
            disabled={isLoading || selectedImages.length === 0 || generationStatus === 'IN_PROGRESS' || generationStatus === 'SUCCEEDED'}
          >
            {isLoading && (generationStatus === 'PENDING' || generationStatus === 'IN_PROGRESS') ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {generationStatus === 'IN_PROGRESS' ? 'Generating...' : 'Generate 3D Model'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Generate3DModelModal;
