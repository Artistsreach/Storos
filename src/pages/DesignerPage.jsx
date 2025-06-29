import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { generateImage, editImage } from '@/lib/geminiImageGeneration';

const sampleReferences = [
  { id: 'ref1', name: 'Modern Minimalist', imageUrl: 'https://via.placeholder.com/150/f8f9fa/000000?text=Modern' },
  { id: 'ref2', name: 'Vintage Charm', imageUrl: 'https://via.placeholder.com/150/e9ecef/000000?text=Vintage' },
  { id: 'ref3', name: 'Abstract Art', imageUrl: 'https://via.placeholder.com/150/dee2e6/000000?text=Abstract' },
  { id: 'ref4', name: 'Nature Inspired', imageUrl: 'https://via.placeholder.com/150/ced4da/000000?text=Nature' },
];

const DesignerPage = () => {
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedReference, setSelectedReference] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useOwnImage, setUseOwnImage] = useState(false);
  const [ingredientImages, setIngredientImages] = useState([]);
  const [editPrompt, setEditPrompt] = useState('');
  const navigate = useNavigate();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setGeneratedImage(reader.result); // Also set as the preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIngredientImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + ingredientImages.length > 3) {
      setError("You can upload a maximum of 3 ingredient images.");
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIngredientImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      let result;
      const base64Data = uploadedImage ? uploadedImage.split(',')[1] : null;
      const ingredients = ingredientImages.map(img => ({
        mimeType: 'image/png',
        data: img.split(',')[1]
      }));

      if (useOwnImage && base64Data) {
        result = await editImage(prompt, base64Data, 'image/png', ingredients);
      } else {
        const fullPrompt = selectedReference
          ? `${prompt} in the style of ${selectedReference.name}`
          : prompt;
        result = await generateImage(fullPrompt, ingredients);
      }
      
      if (result.imageData) {
        setGeneratedImage(`data:image/png;base64,${result.imageData}`);
      } else {
        setError(result.text || 'Failed to generate image. No image data returned.');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black md:bg-gradient-to-b from-black to-white">
      <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-10 md:hidden" onClick={() => window.history.back()}>
        <ArrowLeft className="text-white" />
      </Button>
      {/* Right Preview Area (Top on Mobile) */}
      <main className="flex-1 flex items-center justify-center p-0 md:p-6 relative bg-black md:order-2" style={{ paddingTop: '60px' }}>
        {generatedImage && (
          <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white p-2 text-center md:hidden">
            <Button className="bg-transparent hover:bg-blue-700">
              <Sparkles className="mr-2 h-4 w-4" />
              Create Store with Design
            </Button>
          </div>
        )}
        <div className="w-full md:max-w-2xl aspect-square flex items-center justify-center relative">
          {isLoading && <p className="text-white">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {generatedImage && (
            <img src={generatedImage} alt="Generated result" className="max-w-full max-h-full object-contain" />
          )}
          {!isLoading && !error && !generatedImage && (
            <div className="text-center text-gray-400">
              <p>Your design will appear here.</p>
            </div>
          )}
          {generatedImage && (
            <div className="absolute top-4 right-4 hidden md:block">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/', { state: { generatedImage } })}>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Store with Design
              </Button>
            </div>
          )}
           {generatedImage && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
              <Input
                type="text"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Describe your edit..."
                    className="bg-white/80 backdrop-blur-sm"
                  />
                  <Button 
                    onClick={async () => {
                      if (!editPrompt) return;
                      setIsLoading(true);
                      setError(null);
                try {
                  const base64Data = generatedImage.split(',')[1];
                  const result = await editImage(editPrompt, base64Data, 'image/png');
                  if (result.imageData) {
                    setGeneratedImage(`data:image/png;base64,${result.imageData}`);
                  } else {
                    setError(result.text || 'Failed to edit image.');
                  }
                } catch (err) {
                  setError(err.message);
                } finally {
                      setIsLoading(false);
                      setEditPrompt('');
                    }
                  }} 
                  disabled={isLoading}
                  className="bg-gray-200 hover:bg-gray-300 text-black"
                  >
                    Edit
                  </Button>
                </div>
              )}
        </div>
      </main>

      {/* Left Sidebar (Bottom on Mobile) */}
      <aside className="w-full md:w-1/3 md:max-w-sm p-6 bg-white shadow-md relative md:order-1">
        <ScrollArea className="h-full">
          <div className="space-y-6 pb-20">
            <div className="hidden md:flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                <ArrowLeft />
              </Button>
              <h1 className="text-2xl font-bold">Designer</h1>
              <img src="https://static.wixstatic.com/media/bd2e29_695f70787cc24db4891e63da7e7529b3~mv2.png" alt="Logo" className="h-8" />
            </div>
            <div className="md:hidden text-center">
              
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="use-own-image" checked={useOwnImage} onCheckedChange={setUseOwnImage} />
              <Label htmlFor="use-own-image">Use your own image</Label>
            </div>

            {useOwnImage && (
              <div>
                <h3 className="text-lg font-semibold">Upload Your Image</h3>
                <p className="text-sm text-gray-500 mb-2">Upload an image to edit.</p>
                <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="mt-2" />
                {uploadedImage && (
                  <div className="mt-4">
                    <img src={uploadedImage} alt="Uploaded preview" className="w-full rounded-lg shadow-sm" />
                    <Button variant="link" size="sm" onClick={() => setUploadedImage(null)} className="mt-1 px-0">Remove</Button>
                  </div>
                )}
              </div>
            )}

            <Separator />

            <div>
              <Label htmlFor="prompt" className="text-lg font-semibold">Prompt</Label>
              <Input
                id="prompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., a futuristic cityscape"
                className="mt-2"
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold">Ingredients</h3>
              <p className="text-sm text-gray-500 mb-2">Add up to 3 images to include in the generation.</p>
              <Input id="ingredient-upload" type="file" accept="image/*" multiple onChange={handleIngredientImageUpload} className="mt-2" />
              <div className="grid grid-cols-3 gap-2 mt-4">
                {ingredientImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} alt={`Ingredient ${index + 1}`} className="w-full rounded-lg shadow-sm" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => setIngredientImages(prev => prev.filter((_, i) => i !== index))}
                    >
                      X
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold">Reference Styles</h3>
              <p className="text-sm text-gray-500 mb-2">Optionally select a style to influence the generation.</p>
              <div className="grid grid-cols-2 gap-4">
                {sampleReferences.map((ref) => (
                  <div 
                    key={ref.id} 
                    className={`cursor-pointer border-2 rounded-lg overflow-hidden ${selectedReference?.id === ref.id ? 'border-blue-500' : 'border-transparent'}`}
                    onClick={() => setSelectedReference(selectedReference?.id === ref.id ? null : ref)}
                  >
                    <img src={ref.imageUrl} alt={ref.name} className="w-full h-24 object-cover" />
                    <p className="text-center text-sm p-1 bg-gray-100">{ref.name}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
          </div>
        </ScrollArea>
        <div className="absolute bottom-6 left-6 right-6">
          <Button onClick={handleGenerate} disabled={isLoading || !prompt} className="w-full">
            {isLoading ? 'Generating...' : 'Generate Image'}
          </Button>
        </div>
      </aside>

    </div>
  );
};

export default DesignerPage;
