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
import { UploadCloud, Image as ImageIcon, Palette } from 'lucide-react'; // Added ImageIcon, Palette

const ChangeLogoModal = ({ 
  open, 
  onOpenChange, 
  storeId, 
  storeName, 
  currentLogoUrlLight, // Logo for dark backgrounds (e.g., white logo)
  currentLogoUrlDark,  // Logo for light backgrounds (e.g., black logo)
  onLogoReplaced 
}) => {
  const [activeTab, setActiveTab] = useState('ai');
  
  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState(storeName || '');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  // Store both generated versions
  const [generatedAiLogos, setGeneratedAiLogos] = useState({ light: null, dark: null });


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
      setGeneratedAiLogos({ light: null, dark: null }); // Reset both
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
    setGeneratedAiLogos({ light: null, dark: null });
    try {
      console.log(`Generating light/dark logos for store ${storeName}`);
      // generateLogoWithGemini now returns { logoUrlLight, logoUrlDark, textResponse }
      const result = await generateLogoWithGemini(storeName); 
      if (result && (result.logoUrlLight || result.logoUrlDark)) {
        setGeneratedAiLogos({ light: result.logoUrlLight, dark: result.logoUrlDark });
        // Preview will show these. Confirmation will pass them to onLogoReplaced.
      } else {
        setAiError(result.textResponse || 'AI did not return sufficient image data for logos.');
      }
    } catch (err) {
      console.error('Error generating logos with AI:', err);
      setAiError(err.message || 'Failed to generate logos. Please try again.');
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
      // For Pexels/Upload, assume the selected image is versatile or user's choice for both
      onLogoReplaced({ logoUrlLight: imageUrl, logoUrlDark: imageUrl });
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
        const dataUrl = reader.result;
        // For uploaded image, assume it's versatile or user's choice for both
        onLogoReplaced({ logoUrlLight: dataUrl, logoUrlDark: dataUrl });
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
    if (generatedAiLogos.light || generatedAiLogos.dark) {
      onLogoReplaced({ 
        logoUrlLight: generatedAiLogos.light, 
        logoUrlDark: generatedAiLogos.dark 
      });
      onOpenChange(false);
    } else {
      setAiError("No AI generated logos available to confirm.");
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[728px]"> {/* Increased width slightly for two previews */}
        <DialogHeader className="text-left">
          <DialogTitle>Change Store Logo</DialogTitle>
          <DialogDescription className="text-left space-y-2">
            <p>Current Logos:</p>
            <div className="flex gap-4">
              <div className="flex-1 text-center">
                <Label className="text-xs text-muted-foreground">For Dark Backgrounds (Light Logo)</Label>
                {currentLogoUrlLight ? (
                  <img src={currentLogoUrlLight} alt="Current light logo" className="h-20 w-auto mx-auto max-w-full object-contain my-1 border rounded bg-gray-700 p-1"/>
                ) : (
                  <div className="h-20 flex items-center justify-center text-xs text-muted-foreground bg-gray-200 dark:bg-gray-700 rounded my-1">Not set</div>
                )}
              </div>
              <div className="flex-1 text-center">
                <Label className="text-xs text-muted-foreground">For Light Backgrounds (Dark Logo)</Label>
                {currentLogoUrlDark ? (
                  <img src={currentLogoUrlDark} alt="Current dark logo" className="h-20 w-auto mx-auto max-w-full object-contain my-1 border rounded bg-white p-1"/>
                ) : (
                  <div className="h-20 flex items-center justify-center text-xs text-muted-foreground bg-gray-200 dark:bg-gray-700 rounded my-1">Not set</div>
                )}
              </div>
            </div>
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
            {isAiLoading && <p className="text-sm text-muted-foreground text-center">Generating logos...</p>}
            
            {(generatedAiLogos.light || generatedAiLogos.dark) && !isAiLoading && (
              <div className="flex flex-col items-center gap-4 mt-3">
                <p className="text-sm font-medium">Generated Previews:</p>
                <div className="flex gap-4">
                  {generatedAiLogos.dark && (
                    <div className="text-center">
                      <Label className="text-xs text-muted-foreground">For Light BG</Label>
                      <img src={generatedAiLogos.dark} alt="AI Generated Dark Logo" className="h-24 w-24 object-contain border rounded-md bg-white p-1"/>
                    </div>
                  )}
                  {generatedAiLogos.light && (
                     <div className="text-center">
                       <Label className="text-xs text-muted-foreground">For Dark BG</Label>
                      <img src={generatedAiLogos.light} alt="AI Generated Light Logo" className="h-24 w-24 object-contain border rounded-md bg-gray-700 p-1"/>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter className="justify-start pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAiLoading}>
                Cancel
              </Button>
              <Button onClick={handleAiGenerateLogo} disabled={isAiLoading || !storeName}>
                <Palette className="mr-2 h-4 w-4" />
                {isAiLoading ? 'Generating...' : ((generatedAiLogos.light || generatedAiLogos.dark) ? 'Regenerate Logos' : 'Generate Logos')}
              </Button>
              {(generatedAiLogos.light || generatedAiLogos.dark) && (
                <Button onClick={handleConfirmAiImage} disabled={isAiLoading}>
                  Use These Logos
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
