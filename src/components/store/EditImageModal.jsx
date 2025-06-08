import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Loader2, Wand2 as WandIcon } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { editImageWithGemini } from '../../lib/geminiImageGeneration'; // Assuming this is the correct path

// Helper function (can be moved to utils)
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
        resolve({ base64ImageData: base64Data, mimeType: mimeTypeMatch[1] });
      } catch (error) {
        reject(new Error(`Invalid data URL format: ${error.message}`));
      }
    } else { // Assume it's a URL that needs fetching
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
          // Attempt to get PNG, fallback to JPEG if PNG is not supported well (e.g. for some remote images)
          let dataUrl = canvas.toDataURL('image/png');
          let mimeType = 'image/png';
          if (!dataUrl || dataUrl.length < 100) { // Basic check if toDataURL failed or returned tiny string
             dataUrl = canvas.toDataURL('image/jpeg');
             mimeType = 'image/jpeg';
          }
          const parts = dataUrl.split(',');
          resolve({ base64ImageData: parts[1], mimeType });
        } catch (e) {
          reject(new Error("Canvas toDataURL failed: " + e.message));
        }
      };
      img.onerror = () => reject(new Error("Failed to load image from URL for conversion."));
      img.src = imageSrc;
    }
  });
};


const EditImageModal = ({
  isOpen,
  onOpenChange,
  currentImageUrl,
  onImageEdited, // Callback with the new image URL (string)
  imageContext = "image", // e.g., "store feature image", "product background"
  modalTitle = "Edit Image with AI"
}) => {
  const { toast } = useToast();
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  useEffect(() => {
    if (isOpen && currentImageUrl) {
      setPreviewImageUrl(currentImageUrl);
      setEditPrompt(''); // Reset prompt when modal opens
    }
  }, [isOpen, currentImageUrl]);

  const handleApplyEdit = async () => {
    if (!editPrompt.trim() || !previewImageUrl) {
      toast({ title: "Missing data", description: "Image or edit prompt is missing.", variant: "destructive" });
      return;
    }
    setIsEditing(true);
    try {
      const { base64ImageData, mimeType } = await imageSrcToBasics(previewImageUrl);
      const result = await editImageWithGemini(base64ImageData, mimeType, editPrompt);
      
      if (result && result.editedImageData && result.newMimeType) {
        const newImageDataUrl = `data:${result.newMimeType};base64,${result.editedImageData}`;
        onImageEdited(newImageDataUrl);
        toast({ title: "Image Edited", description: "Image updated with AI edit." });
        onOpenChange(false); // Close modal on success
      } else {
        throw new Error(result?.textResponse || "AI did not return an edited image.");
      }
    } catch (error) {
      console.error("Error editing image:", error);
      toast({ title: "Image Edit Failed", description: error.message, variant: "destructive" });
    }
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {previewImageUrl && (
            <div className="flex flex-col items-center space-y-2 mb-4">
              <img src={previewImageUrl} alt={`Current ${imageContext} to edit`} className="max-h-48 w-auto object-contain rounded border"/>
              <p className="text-xs text-muted-foreground">Editing: Current {imageContext}</p>
            </div>
          )}
          <Label htmlFor="editPrompt" className="text-left">Edit Instruction:</Label>
          <Textarea
            id="editPrompt"
            placeholder={`e.g., 'make the background blue', 'add sparkles to the ${imageContext}'`}
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isEditing}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleApplyEdit} disabled={isEditing || !editPrompt.trim()}>
            {isEditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandIcon className="mr-2 h-4 w-4" />}
            Apply Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditImageModal;
