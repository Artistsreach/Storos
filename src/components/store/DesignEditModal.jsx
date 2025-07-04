import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Sparkles, Loader2, Edit, Replace, Copy, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { editImageWithGemini, generateImageFromPromptForPod } from '../../lib/geminiImageGeneration';
import { imageSrcToBasics } from '../../lib/imageUtils';
import { podProductsList } from '../../lib/constants';
import { generateId } from '../../lib/utils.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';


const DesignEditModal = ({ isOpen, onClose, designs: initialDesigns, onContinue }) => {
  const [designs, setDesigns] = useState([]);
  const [isProcessing, setIsProcessing] = useState({});
  const [editPrompt, setEditPrompt] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialDesigns) {
      setDesigns(initialDesigns);
    }
  }, [initialDesigns]);

  const handleProductTypeChange = (index, newProductName) => {
    const newProductInfo = podProductsList.find(p => p.name === newProductName);
    if (newProductInfo) {
      setDesigns(prevDesigns => {
        const newDesigns = [...prevDesigns];
        newDesigns[index].podProductInfo = newProductInfo;
        newDesigns[index].name = newProductInfo.name; // Update the name to match
        return newDesigns;
      });
    }
  };

  const handleDuplicateDesign = (index) => {
    const designToDuplicate = designs[index];
    const newDesign = {
      ...designToDuplicate,
      id: generateId(),
    };
    setDesigns(prevDesigns => [...prevDesigns, newDesign]);
    toast({ title: "Design Duplicated", description: `A copy of ${designToDuplicate.name} has been added.` });
  };

  const handleDeleteDesign = (index) => {
    const designToDelete = designs[index];
    setDesigns(prevDesigns => prevDesigns.filter((_, i) => i !== index));
    toast({ title: "Design Removed", description: `${designToDelete.name} has been removed.`, variant: "destructive" });
  };

  const handleEdit = async (index) => {
    if (!editPrompt) {
      toast({ title: "Prompt Required", description: "Please enter a prompt to edit the image.", variant: "destructive" });
      return;
    }

    setIsProcessing({ [index]: { edit: true } });
    const design = designs[index];

    try {
      const { base64ImageData, mimeType } = await imageSrcToBasics(design.images[0]);
      const result = await editImageWithGemini(base64ImageData, mimeType, editPrompt);
      
      if (result && result.editedImageData) {
        const newDesigns = [...designs];
        const newImageUrl = `data:${result.newMimeType};base64,${result.editedImageData}`;
        newDesigns[index].images[0] = newImageUrl;
        // If there's a mockup, it should be updated too, but for now, we just update the core design.
        // The visualization will happen again later.
        setDesigns(newDesigns);
        toast({ title: "Design Edited", description: "The design has been updated.", variant: "success" });
      } else {
        throw new Error("Failed to get edited image data.");
      }
    } catch (error) {
      console.error("Error editing design:", error);
      toast({ title: "Edit Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing({});
      setEditingIndex(null);
      setEditPrompt('');
    }
  };

  const handleReplace = async (index) => {
    if (!editPrompt) {
      toast({ title: "Prompt Required", description: "Please enter a prompt to replace the image.", variant: "destructive" });
      return;
    }

    setIsProcessing({ [index]: { replace: true } });

    try {
      const result = await generateImageFromPromptForPod({ prompt: editPrompt });
      if (result && result.imageData) {
        const newDesigns = [...designs];
        const newImageUrl = `data:${result.imageMimeType};base64,${result.imageData}`;
        newDesigns[index].images[0] = newImageUrl;
        setDesigns(newDesigns);
        toast({ title: "Design Replaced", description: "A new design has been generated.", variant: "success" });
      } else {
        throw new Error("Failed to get new image data.");
      }
    } catch (error) {
      console.error("Error replacing design:", error);
      toast({ title: "Replace Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing({});
      setEditingIndex(null);
      setEditPrompt('');
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Review and Edit Your Designs</DialogTitle>
          <DialogDescription>
            Modify the generated designs before we create your logo and products.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
            {designs.map((design, index) => (
              <Card key={design.id || index} className="p-4 space-y-3 flex flex-col">
                <div className="relative">
                  <img src={design.images[0]} alt={`Design for ${design.name}`} className="w-full h-48 object-contain rounded-md border" />
                  <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => handleDeleteDesign(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-grow space-y-2">
                  <h4 className="font-semibold">{design.name}</h4>
                  <div>
                    <label htmlFor={`product-type-${index}`} className="text-sm font-medium">Product Type</label>
                    <Select value={design.podProductInfo.name} onValueChange={(value) => handleProductTypeChange(index, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        {podProductsList.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {editingIndex === index ? (
                  <div className="space-y-2 mt-auto">
                    <Textarea 
                      placeholder="Enter prompt to edit or replace..."
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleEdit(index)} disabled={isProcessing[index]?.edit}>
                        {isProcessing[index]?.edit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
                        Apply Edit
                      </Button>
                      <Button onClick={() => handleReplace(index)} disabled={isProcessing[index]?.replace}>
                        {isProcessing[index]?.replace ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Replace className="mr-2 h-4 w-4" />}
                        Replace
                      </Button>
                      <Button variant="ghost" onClick={() => setEditingIndex(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => { setEditingIndex(index); setEditPrompt(''); }} className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" /> Edit or Replace
                  </Button>
                )}
                 <Button onClick={() => handleDuplicateDesign(index)} variant="outline" className="w-full mt-2">
                  <Copy className="mr-2 h-4 w-4" /> Duplicate
                </Button>
              </Card>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel Generation
          </Button>
          <Button type="button" onClick={() => onContinue(designs)}>
            Continue with These Designs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DesignEditModal;
