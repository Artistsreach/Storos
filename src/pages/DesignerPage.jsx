import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft, Shirt } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { generateImage, editImage, visualizeImageOnProductWithGemini } from '@/lib/geminiImageGeneration';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredits, canDeductCredits } from '@/lib/credits';

const sampleReferences = [
  {
    id: 'ref1',
    name: 'Retro Futurism',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_6520.webp?alt=media&token=0fc64381-9c10-4e96-a5d0-ca928b473471',
    designStyle: 'Retro Futurism (from Looka)',
    aiPrompt: 'A design inspired by retro-futurism and classic arcade games. The layout features bold, white, pixelated typography as the centerpiece, set against a dark, heavily textured and scratched background. The composition is framed by colorful, geometric, pixel-block patterns at the top and bottom, creating a strong contrast and a vintage, high-tech vibe.'
  },
  {
    id: 'ref2',
    name: 'Neominimalism',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_6521.webp?alt=media&token=72ee42cf-fc45-4c8b-866a-0a1422537cdf',
    designStyle: 'Neominimalism (from Looka)',
    aiPrompt: 'A neominimalist poster design with a vibrant, monochromatic background in a shocking pink or other saturated hue. The central visual element is a duotone photograph contained within a large, simple, organic shape like a flower. The typography is a clean, elegant serif font, creating a bold yet airy composition that balances minimalism with unapologetic color.'
  },
  {
    id: 'ref3',
    name: '70s Retro',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_6522.webp?alt=media&token=8ee998bf-417e-4865-acd2-e4a97068b2fe',
    designStyle: '70s Retro (from Looka)',
    aiPrompt: 'A retro-themed design with a 70s aesthetic. It features a very bold, chunky serif font as the main headline. The background has a warm, off-white, speckled texture. The composition is decorated with simple, stylized starburst graphics, and the color palette is limited to a classic pairing like bold blue on a neutral cream, evoking a friendly and nostalgic feeling.'
  },
  {
    id: 'ref4',
    name: '90s Nostalgia',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_6523.webp?alt=media&token=62597e4a-c899-4f47-b474-aecbf714c927',
    designStyle: '90s Nostalgia (from Looka)',
    aiPrompt: 'A retro graphic inspired by 90s design. The style features extremely bold, heavy, geometric block lettering that fills the frame. The background has a subtly distressed or crumpled paper texture. The color palette is simple but strong, using high-contrast colors like black on yellow. Thin, clean lines and secondary sans-serif fonts frame the central text, adding to the vintage, edgy feel.'
  },
  {
    id: 'ref5',
    name: 'Art Deco',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_6524.webp?alt=media&token=1531edd1-31c6-4b0b-9974-dba3a1cdbbd9',
    designStyle: 'Art Deco (from Looka)',
    aiPrompt: 'A minimalist and elegant logo design in the Art Deco style. The central feature is a sophisticated, classic script font, encircled by arched, sans-serif text. This typography is enclosed within a delicate, symmetrical frame made of clean, intersecting geometric lines with notched corners. The design uses a simple, high-contrast color scheme like black on an off-white background to convey timeless luxury.'
  },
  {
    id: 'ref6',
    name: 'Mixed Media',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_6525.webp?alt=media&token=20587a39-4572-407a-b1ae-0f0266f70579',
    designStyle: 'Mixed Media (from Looka)',
    aiPrompt: 'A mixed media poster design combining classical and modern elements. It features a photographic cutout of a Greco-Roman bust, which is creatively interrupted by hand-drawn, cartoonish line art. The background is a flat, solid color with a subtle, large floral silhouette. The typography is a loose, handwritten script, enhancing the design\'s artistic, scrapbook-like feel.'
  },
  {
    id: 'ref7',
    name: 'Doodles and Scribbles',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_6526.webp?alt=media&token=4e1a31ec-c1ab-4ca3-94e9-6367d3ff9548',
    designStyle: 'Doodles and Scribbles (from Looka)',
    aiPrompt: 'A design that mimics a page from a notebook, with a pale yellow, lined-paper background. The main visual is a continuous-line illustration, creating a sophisticated yet simple doodle. The typography is a casual, handwritten script, giving the overall composition an informal, brainstorming-session aesthetic.'
  },
  {
    id: 'ref8',
    name: 'Mixed Media',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_6527.jpeg?alt=media&token=9a9a6dad-765f-4a62-b221-7407f831a5a0',
    designStyle: 'Mixed Media (from Looka)',
    aiPrompt: 'A surrealist and maximalist collage. The design features a central grayscale photographic cutout of a face, layered over a vibrant, dreamlike background with abstract shapes and textures. The composition is adorned with disparate and colorful elements like floating objects, botanical illustrations, and snippets of nature photography, creating a psychedelic and visually dense aesthetic.'
  },
  {
    id: 'ref9',
    name: 'Expressive and Experimental Lettering',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_6528.jpeg?alt=media&token=6fd526c3-ff3f-4e9a-bc82-8dffaf3fa80a',
    designStyle: 'Expressive and Experimental Lettering (from Looka)',
    aiPrompt: 'A diptych poster design with a bold, experimental typographic treatment. The layout features dramatic, oversized, and vertically oriented text that dominates the composition. This text is layered over gritty, high-contrast, duotone photographs. The intense color palette and the way the images are seen through the text create a powerful, modern, and edgy aesthetic.'
  },
  {
    id: 'ref10',
    name: 'Collage Craze',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_6533.webp?alt=media&token=d5d771be-2a63-4c63-9bdb-da8172bff7c6',
    designStyle: 'Collage Craze (from Shopify)',
    aiPrompt: 'A maximalist and chaotic collage. The design should be built around a central photographic figure, which is then densely surrounded by a variety of layered elements, including smaller photos, vibrant and colorful stickers, pop-art graphics, and bold, playful text. The composition is tight and energetic, set against a bright, solid-colored background to make the layered elements pop.'
  },
  {
    id: 'ref11',
    name: 'Acid Graphics',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_6537.png?alt=media&token=244611c1-f7ad-4b2c-8ed2-eacf8bba0501',
    designStyle: 'Acid Graphics (from Shopify)',
    aiPrompt: 'A graphic design asset pack with a psychedelic, "acid graphics" theme. The style features bold, cartoonish illustrations with a futuristic or sci-fi edge. The color palette is intensely vibrant and limited, relying on high-contrast pairings like neon green and electric purple against a black background. The overall aesthetic is energetic, edgy, and slightly surreal.'
  },
  {
    id: 'ref12',
    name: 'Pixel-peeping',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_6538.webp?alt=media&token=88344b6f-f5ed-4aae-aa66-2b68dfcdb237',
    designStyle: 'Pixel-peeping (from Shopify)',
    aiPrompt: 'A design that heavily features pixel art aesthetics. The composition should be clean and structured, dominated by a large headline rendered in a bold, black-letter, pixelated font. Include smaller, secondary pixel art graphics. The color scheme is minimalist, using a light, neutral background with high-contrast black for the pixel elements to create a striking, retro digital effect.'
  }
];

const DesignerPage = () => {
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedReference, setSelectedReference] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [useOwnImage, setUseOwnImage] = useState(false);
  const [ingredientImages, setIngredientImages] = useState([]);
  const [editPrompt, setEditPrompt] = useState('');
  const [mockupImages, setMockupImages] = useState([]);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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
      const hasEnoughCredits = await canDeductCredits(user.uid, 5);
      if (!hasEnoughCredits) {
        setError("You don't have enough credits to generate an image.");
        setIsLoading(false);
        return;
      }

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
          ? `${prompt} - ${selectedReference.aiPrompt}`
          : prompt;
        result = await generateImage(fullPrompt, ingredients);
      }
      
      if (result.imageData) {
        setGeneratedImage(`data:image/png;base64,${result.imageData}`);
        setMockupImages([]);
        await deductCredits(user.uid, 5);
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

  const handleVisualize = async () => {
    if (!generatedImage) return;

    setIsVisualizing(true);
    setMockupImages([]);
    setError(null);

    const mockups = [
      { name: 'Black hoodie', url: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/Hoodie.jpeg?alt=media&token=733ac963-11ab-4a9d-8fac-445bf2cfb5f0' },
      { name: 'Baseball cap', url: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/Hat.jpeg?alt=media&token=d23f6d45-3bd5-456f-9a8d-31ed2c6e49eb' },
      { name: 'Canvas', url: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/Canvas.jpeg?alt=media&token=d2383e79-5362-4d18-8908-9e3b2741f724' },
      { name: 'Notebook', url: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/Notebook.jpeg?alt=media&token=4126231f-3c59-4398-9498-1db23d63193c' },
      { name: 'T-shirt', url: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/Shirt.webp?alt=media&token=212d112c-4ada-4264-81ab-7f1ee365ab36' },
      { name: 'Totebag', url: 'https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/Totebag.jpeg?alt=media&token=1e446c52-b273-4f01-86d1-3d33624859ea' },
    ];

    const [mimeType, base64Data] = generatedImage.split(';base64,');

    for (const mockup of mockups) {
      try {
        const result = await visualizeImageOnProductWithGemini(base64Data, mimeType.replace('data:', ''), mockup.url, prompt, mockup.name);
        if (result.visualizedImageData) {
          setMockupImages(prev => [...prev, `data:${result.visualizedImageMimeType};base64,${result.visualizedImageData}`]);
        }
      } catch (err) {
        console.error(`Error visualizing on ${mockup.name}:`, err);
        // Optionally set an error state for individual mockups
      }
    }

    setIsVisualizing(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-foreground">
      <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-10 md:hidden" onClick={() => window.history.back()}>
        <ArrowLeft />
      </Button>
      {/* Right Preview Area (Top on Mobile) */}
      <main className="flex-1 flex items-center justify-center p-0 md:p-6 relative bg-background md:order-2" style={{ paddingTop: '60px' }}>
        {generatedImage && (
          <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground p-2 text-center md:hidden">
            <Button className="bg-transparent hover:bg-primary/90">
              <Sparkles className="mr-2 h-4 w-4" />
              Create Store with Design
            </Button>
          </div>
        )}
        <div className="w-full md:max-w-2xl aspect-square flex items-center justify-center relative">
          {isLoading && !isEditing && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {generatedImage && !isVisualizing && mockupImages.length === 0 && (
            <img src={generatedImage} alt="Generated result" className="max-w-full max-h-full object-contain" />
          )}
          {isVisualizing && mockupImages.length === 0 && <p>Generating Mockups...</p>}
          {mockupImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 overflow-y-auto h-full">
              {mockupImages.map((src, index) => (
                <img key={index} src={src} alt={`Mockup ${index + 1}`} className="w-full h-full object-contain rounded-lg" />
              ))}
            </div>
          )}
          {!isLoading && !error && !generatedImage && (
            <div className="text-center text-muted-foreground">
              <p>Your design will appear here.</p>
            </div>
          )}
          {generatedImage && (
            <div className="absolute top-4 right-4 hidden md:flex flex-col space-y-2 z-10">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => navigate('/', { state: { generatedImage } })}>
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
                    className="bg-background/80 backdrop-blur-sm"
                  />
                  <Button 
                    onClick={async () => {
                      if (!editPrompt) return;
                      setIsEditing(true);
                      setError(null);
                try {
                  const hasEnoughCredits = await canDeductCredits(user.uid, 2);
                  if (!hasEnoughCredits) {
                    setError("You don't have enough credits to edit an image.");
                    setIsEditing(false);
                    return;
                  }
                  const base64Data = generatedImage.split(',')[1];
                  const result = await editImage(editPrompt, base64Data, 'image/png');
                  if (result.imageData) {
                    setGeneratedImage(`data:image/png;base64,${result.imageData}`);
                    await deductCredits(user.uid, 2);
                  } else {
                    setError(result.text || 'Failed to edit image.');
                  }
                } catch (err) {
                  setError(err.message);
                } finally {
                      setIsEditing(false);
                      setEditPrompt('');
                    }
                  }} 
                  disabled={isLoading || isEditing}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    {isEditing ? 'Editing...' : 'Edit'}
                  </Button>
                </div>
              )}
        </div>
      </main>

      {/* Left Sidebar (Bottom on Mobile) */}
      <aside className="w-full md:w-1/3 md:max-w-sm p-6 bg-card shadow-md relative md:order-1">
        <ScrollArea className="h-full">
          <div className="space-y-6 pb-20">
            <div className="hidden md:flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                <ArrowLeft />
              </Button>
              <h1 className="text-2xl font-bold">Designer</h1>
              <img src="https://static.wixstatic.com/media/bd2e29_695f70787cc24db4891e63da7e7529b3~mv2.png" alt="Logo" className="h-8 dark:hidden" />
              <img src="https://static.wixstatic.com/media/bd2e29_20f2a8a94b7e492a9d76e0b8b14e623b~mv2.png" alt="Logo Dark" className="h-8 hidden dark:block" />
            </div>
            <div className="md:hidden text-center">
              
            </div>

            {generatedImage && (
              <Button onClick={handleVisualize} disabled={isVisualizing} className="w-full">
                <Shirt className="mr-2 h-4 w-4" />
                {isVisualizing ? 'Visualizing...' : 'View on Mockups'}
              </Button>
            )}

            <div className="flex items-center space-x-2">
              <Switch id="use-own-image" checked={useOwnImage} onCheckedChange={setUseOwnImage} />
              <Label htmlFor="use-own-image">Use your own image</Label>
            </div>

            {useOwnImage && (
              <div>
                <h3 className="text-lg font-semibold">Upload Your Image</h3>
                <p className="text-sm text-muted-foreground mb-2">Upload an image to edit.</p>
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
              <p className="text-sm text-muted-foreground mb-2">Add up to 3 images to include in the generation.</p>
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
              <p className="text-sm text-muted-foreground mb-2">Optionally select a style to influence the generation.</p>
              <div className="grid grid-cols-2 gap-4">
                {sampleReferences.map((ref) => (
                  <div 
                    key={ref.id} 
                    className={`cursor-pointer border-2 rounded-lg overflow-hidden ${selectedReference?.id === ref.id ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => setSelectedReference(selectedReference?.id === ref.id ? null : ref)}
                  >
                    <img src={ref.imageUrl} alt={ref.name} className="w-full h-24 object-cover" />
                    <p className="text-center text-sm p-1 bg-muted">{ref.name}</p>
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
