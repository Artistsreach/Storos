import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateLogoWithGemini } from '@/lib/geminiImageGeneration'; // Changed from video to image
import { searchPexelsPhotos } from '@/lib/pexels'; // Corrected function name
import { UploadCloud, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon

const ChangeLogoModal = ({ open, onOpenChange, storeId, storeName, currentLogoUrl, onLogoReplaced }) => {
  const [activeTab, setActiveTab] = useState('ai');
  
  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState(storeName || ''); // Default prompt to store name
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [generatedAiImageUrl, setGeneratedAiImageUrl] = useState(null);


  // Pexels Search State
  const [pexelsQuery, setPexelsQuery] = useState('');
  const [pexelsImages, setPexelsImages] = useState([]);
  const [isPexelsLoading, setIsPexelsLoading] = useState(false);
  const [pexelsError, setPexelsError] = useState(null);

  // Upload State
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState(null);


  // Reset states when modal opens or tab changes
  useEffect(() => {
    if (open) {
      setAiPrompt(storeName || ''); // Reset with storeName
      setIsAiLoading(false);
      setAiError(null);
      setGeneratedAiImageUrl(null);
      setPexelsQuery('');
      setPexelsImages([]);
      setIsPexelsLoading(false);
      setPexelsError(null);
      setUploadedImageFile(null);
      setUploadError(null);
      setIsUploading(false);
      setUploadPreviewUrl(null);
      // setActiveTab('ai'); // Optionally reset to default tab
    }
  }, [open, storeName]);

  const handleAiGenerateLogo = async () => {
    // AI prompt for logo is primarily the store name, which is passed to generateLogoWithGemini
    // An additional descriptive prompt might be added here if desired, but generateLogoWithGemini handles its own base prompt.
    // For now, we'll use the storeName prop directly.
    if (!storeName) {
        setAiError('Store name is required to generate a logo with AI.');
        return;
    }
    setIsAiLoading(true);
    setAiError(null);
    setGeneratedAiImageUrl(null);
    try {
      console.log(`Generating logo for store ${storeName}`);
      // generateLogoWithGemini expects storeName. The internal prompt is already optimized for logos.
      const result = await generateLogoWithGemini(storeName); 
      if (result && result.imageData) {
        const imageUrl = `data:image/png;base64,${result.imageData}`;
        setGeneratedAiImageUrl(imageUrl); // Show preview
        // onLogoReplaced(imageUrl); // Or call on confirm button
        // onOpenChange(false);
      } else {
        setAiError(result.textResponse || 'AI did not return image data.');
      }
    } catch (err) {
      console.error('Error generating logo with AI:', err);
      setAiError(err.message || 'Failed to generate logo. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePexelsSearch = async () => {
    if (!pexelsQuery.trim()) {
      setPexelsError('Please enter a search query for Pexels.');
      return;
    }
    setIsPexelsLoading(true);
    setPexelsError(null);
    setPexelsImages([]);
    try {
      // Assuming searchPexelsPhotos exists and returns a similar structure to searchPexelsVideos
      const result = await searchPexelsPhotos(pexelsQuery); 
      if (result.error) {
        setPexelsError(result.error);
        setPexelsImages([]);
      } else {
        setPexelsImages(result.photos || []); // Assuming result.photos for images
        if ((result.photos || []).length === 0) {
          setPexelsError('No images found for your query.');
        }
      }
    } catch (err) {
      console.error('Error searching Pexels images:', err);
      setPexelsError(err.message || 'Failed to search Pexels. Please try again.');
    } finally {
      setIsPexelsLoading(false);
    }
  };

  const handlePexelsImageSelect = (imageUrl) => {
    if (onLogoReplaced && imageUrl) {
      onLogoReplaced(imageUrl); // Pexels provides direct URLs
      onOpenChange(false);
    } else {
      setPexelsError("Invalid image URL selected or replacement handler missing.");
    }
  };

  const handleImageFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // Example: 10MB limit for images
        setUploadError("File is too large. Please select an image under 10MB.");
        setUploadedImageFile(null);
        setUploadPreviewUrl(null);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setUploadError("Invalid file type. Please select an image file (e.g., PNG, JPG, GIF).");
        setUploadedImageFile(null);
        setUploadPreviewUrl(null);
        return;
      }
      setUploadedImageFile(file);
      setUploadError(null);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmUpload = () => {
    if (uploadedImageFile && onLogoReplaced) {
      setIsUploading(true);
      setUploadError(null);
      // Convert to data URL to pass to onLogoReplaced
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoReplaced(reader.result); 
        onOpenChange(false);
        setUploadedImageFile(null);
        setUploadPreviewUrl(null);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setUploadError("Failed to read image file for upload.");
        setIsUploading(false);
      };
      reader.readAsDataURL(uploadedImageFile);

    } else {
      setUploadError("No image file selected or replacement handler missing.");
    }
  };
  
  const handleConfirmAiImage = () => {
    if (generatedAiImageUrl && onLogoReplaced) {
      onLogoReplaced(generatedAiImageUrl);
      onOpenChange(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[672px]">
        <DialogHeader className="text-left">
          <DialogTitle>Change Store Logo</DialogTitle>
          <DialogDescription className="text-left">
            Current logo: 
            {currentLogoUrl ? (
              <img src={currentLogoUrl} alt="Current logo" className="h-16 w-16 object-contain my-2 border rounded"/>
            ) : (
              <span className="ml-1">No logo set</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai">Generate with AI</TabsTrigger>
            <TabsTrigger value="pexels">Search Pexels</TabsTrigger>
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai" className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              AI will generate a logo based on your store name: <strong>{storeName}</strong>.
            </p>
            {/* Optional: Add a field for additional style prompts if desired in the future */}
            {/* <div>
              <Label htmlFor="aiStylePrompt" className="text-left block mb-1">Additional Style (Optional)</Label>
              <Input id="aiStylePrompt" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g., minimalist, vibrant, retro" disabled={isAiLoading} />
            </div> */}
            {aiError && <p className="text-sm text-red-500 text-center">{aiError}</p>}
            {isAiLoading && <p className="text-sm text-muted-foreground text-center">Generating logo...</p>}
            {generatedAiImageUrl && !isAiLoading && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium">Generated Preview:</p>
                <img src={generatedAiImageUrl} alt="AI Generated Logo Preview" className="h-32 w-32 object-contain border rounded-md"/>
              </div>
            )}
            <DialogFooter className="justify-start pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAiLoading}>
                Cancel
              </Button>
              <Button onClick={handleAiGenerateLogo} disabled={isAiLoading || !storeName}>
                {isAiLoading ? 'Generating...' : (generatedAiImageUrl ? 'Regenerate' : 'Generate Logo')}
              </Button>
              {generatedAiImageUrl && (
                <Button onClick={handleConfirmAiImage} disabled={isAiLoading}>
                  Use This Logo
                </Button>
              )}
            </DialogFooter>
          </TabsContent>

          <TabsContent value="pexels" className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                id="pexelsQuery"
                value={pexelsQuery}
                onChange={(e) => setPexelsQuery(e.target.value)}
                placeholder="e.g., Abstract, Minimal, Tech"
                disabled={isPexelsLoading}
                className="flex-grow"
              />
              <Button onClick={handlePexelsSearch} disabled={isPexelsLoading || !pexelsQuery.trim()}>
                {isPexelsLoading ? 'Searching...' : 'Search Images'}
              </Button>
            </div>
            {pexelsError && <p className="text-sm text-red-500 text-center">{pexelsError}</p>}
            {isPexelsLoading && <p className="text-sm text-muted-foreground text-center">Loading Pexels images...</p>}
            
            {!isPexelsLoading && pexelsImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2">
                {pexelsImages.map((image) => (
                  <div 
                    key={image.id} 
                    className="relative aspect-square rounded-md overflow-hidden cursor-pointer group border hover:border-primary"
                    onClick={() => handlePexelsImageSelect(image.src.large2x || image.src.large || image.src.original)} // Use a good quality Pexels image URL
                  >
                    <img src={image.src.medium} alt={image.alt || `Pexels image by ${image.photographer}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <p className="text-white text-xs text-center p-1 bg-black/50 rounded">Use Image</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
             <DialogFooter className="justify-start pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPexelsLoading}>
                    Cancel
                </Button>
             </DialogFooter>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 py-4">
            <div>
              <Label htmlFor="image-upload-input" className="text-left block mb-1">
                Select Image File
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="image-upload-input"
                  type="file"
                  accept="image/*" // Accept all image types
                  onChange={handleImageFileUpload}
                  className="flex-grow"
                  disabled={isUploading}
                />
              </div>
              {uploadPreviewUrl && (
                <div className="mt-3 flex flex-col items-center">
                  <p className="text-sm font-medium mb-1">Preview:</p>
                  <img src={uploadPreviewUrl} alt="Upload preview" className="h-32 w-32 object-contain border rounded-md"/>
                </div>
              )}
              {uploadedImageFile && !uploadPreviewUrl && ( // Fallback text if preview fails but file is selected
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {uploadedImageFile.name} ({(uploadedImageFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              {uploadError && <p className="text-sm text-red-500 text-center mt-2">{uploadError}</p>}
            </div>
            <DialogFooter className="justify-start pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleConfirmUpload} disabled={isUploading || !uploadedImageFile}>
                {isUploading ? 'Uploading...' : 'Confirm Upload'}
              </Button>
            </DialogFooter>
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeLogoModal;
