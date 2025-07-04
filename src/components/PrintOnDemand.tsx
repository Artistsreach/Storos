import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Download,
  Check,
} from "lucide-react";
import { GoogleGenAI, Modality } from "@google/genai";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface PrintOnDemandProduct {
  name: string;
  image: string;
}

const PRINT_ON_DEMAND_PRODUCTS: PrintOnDemandProduct[] = [
  {
    name: "Black Hoodie",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Hoodie.jpeg",
  },
  {
    name: "White Baseball Cap",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Hat.jpeg",
  },
  {
    name: "Pillow",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Pillow.webp",
  },
  {
    name: "White T-Shirt",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Shirt.webp",
  },
  {
    name: "Notebook",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Notebook.jpeg",
  },
  {
    name: "Travel Mug",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//TravelMug.jpeg",
  },
  {
    name: "Tote Bag",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Totebag.jpeg",
  },
  {
    name: "Blanket",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Blanket.webp",
  },
  {
    name: "Canvas",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Canvas.jpeg",
  },
];

interface GeneratedProductImage {
  productName: string;
  image: string;
  isGenerating: boolean;
}

const PrintOnDemand = () => {
  const [usePrompt, setUsePrompt] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [promptReferenceImage, setPromptReferenceImage] = useState<
    string | null
  >(null);
  const [prompt, setPrompt] = useState(
    "A vibrant sunset over mountains with geometric patterns",
  );
  const [selectedProducts, setSelectedProducts] = useState<
    PrintOnDemandProduct[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<
    GeneratedProductImage[]
  >([]);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptImageInputRef = useRef<HTMLInputElement>(null);

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setUploadedImage(base64);
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  };

  // Handle prompt reference image upload
  const handlePromptImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setPromptReferenceImage(base64);
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  };

  // Handle product selection toggle
  const toggleProductSelection = (product: PrintOnDemandProduct) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p.name === product.name);
      if (isSelected) {
        return prev.filter((p) => p.name !== product.name);
      } else {
        return [...prev, product];
      }
    });
  };

  // Generate design image from prompt
  const generateDesignFromPrompt = async (): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_API_KEY") {
      throw new Error(
        "Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.",
      );
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const enhancedPrompt = `Create a high-quality design image suitable for print-on-demand products based on this description: ${prompt}. Make it visually appealing, with good contrast and clear details that would look great on merchandise like t-shirts, mugs, and other products.`;

    // Prepare content parts for API call
    const contentParts: any[] = [];
    contentParts.push({ text: enhancedPrompt });

    // Add reference image if provided
    if (promptReferenceImage) {
      const referenceImageData = promptReferenceImage.split(",")[1];
      const referenceImageMimeType = promptReferenceImage
        .split(";")[0]
        .split(":")[1];
      contentParts.push({
        inlineData: {
          mimeType: referenceImageMimeType,
          data: referenceImageData,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: promptReferenceImage
        ? [{ parts: contentParts }]
        : enhancedPrompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates in response");
    }

    // Find the image part in the response
    for (const part of response.candidates[0].content.parts) {
      if (
        part.inlineData &&
        part.inlineData.mimeType &&
        part.inlineData.mimeType.startsWith("image/")
      ) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image found in response");
  };

  // Generate product mockup
  const generateProductMockup = async (
    designImage: string,
    product: PrintOnDemandProduct,
  ): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    // Prepare content parts for API call
    const contentParts: any[] = [];

    const mockupPrompt = `Create a realistic product mockup showing this design printed on a ${product.name}. The design should be properly placed on the product with realistic lighting, shadows, and perspective. Make it look like a professional product photo that would be used in an e-commerce store. The design should appear naturally integrated onto the product surface.`;

    contentParts.push({ text: mockupPrompt });

    // Add design image
    const designImageData = designImage.split(",")[1];
    const designImageMimeType = designImage.split(";")[0].split(":")[1];
    contentParts.push({
      inlineData: {
        mimeType: designImageMimeType,
        data: designImageData,
      },
    });

    // Add product image
    const productResponse = await fetch(product.image);
    const productBlob = await productResponse.blob();
    const productBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(productBlob);
    });
    const productImageData = productBase64.split(",")[1];
    const productImageMimeType = productBlob.type;

    contentParts.push({
      inlineData: {
        mimeType: productImageMimeType,
        data: productImageData,
      },
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: [
        {
          parts: contentParts,
        },
      ],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates in response");
    }

    // Find the image part in the response
    for (const part of response.candidates[0].content.parts) {
      if (
        part.inlineData &&
        part.inlineData.mimeType &&
        part.inlineData.mimeType.startsWith("image/")
      ) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image found in response");
  };

  // Main generation function
  const generateProductMockups = async () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product");
      return;
    }

    if (!usePrompt && !uploadedImage) {
      alert("Please upload an image or enable prompt mode");
      return;
    }

    if (usePrompt && !prompt.trim()) {
      alert("Please enter a design prompt");
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    const startTime = performance.now();

    try {
      let designImage: string;

      // Get or generate the design image
      if (usePrompt) {
        designImage = await generateDesignFromPrompt();
      } else {
        designImage = uploadedImage!;
      }

      // Initialize generated images array with loading states
      const initialImages: GeneratedProductImage[] = selectedProducts.map(
        (product) => ({
          productName: product.name,
          image: "",
          isGenerating: true,
        }),
      );
      setGeneratedImages(initialImages);

      // Generate mockups for each product
      for (let i = 0; i < selectedProducts.length; i++) {
        const product = selectedProducts[i];
        try {
          const mockupImage = await generateProductMockup(designImage, product);

          // Update the specific product image
          setGeneratedImages((prev) =>
            prev.map((item, index) =>
              index === i
                ? { ...item, image: mockupImage, isGenerating: false }
                : item,
            ),
          );
        } catch (error) {
          console.error(`Error generating mockup for ${product.name}:`, error);
          // Update with error state
          setGeneratedImages((prev) =>
            prev.map((item, index) =>
              index === i
                ? {
                    ...item,
                    image: "error",
                    isGenerating: false,
                  }
                : item,
            ),
          );
        }
      }

      const endTime = performance.now();
      setGenerationTime((endTime - startTime) / 1000);
    } catch (error) {
      console.error("Error generating product mockups:", error);
      alert(
        `Error generating mockups: ${error.message || "Unknown error"}. Please check your API key and try again.`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Download image function
  const downloadImage = (imageUrl: string, productName: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${productName.replace(/\s+/g, "_")}_mockup.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-900/30 dark:to-pink-900/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
              Print-on-Demand Generator
            </span>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
            Create Custom Product Mockups
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Upload your design or generate one with AI, then see it come to life
            on various products with realistic mockups.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Design Input */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Design Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Toggle Switch */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Upload className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Upload Image
                    </span>
                  </div>
                  <Switch
                    checked={usePrompt}
                    onCheckedChange={setUsePrompt}
                    className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-300"
                  />
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Generate with AI
                    </span>
                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>

                {/* Image Upload or Prompt Input */}
                {!usePrompt ? (
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadedImage ? (
                      <div className="space-y-4">
                        <img
                          src={uploadedImage}
                          alt="Uploaded design"
                          className="max-w-full max-h-48 mx-auto rounded-lg object-cover"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            Upload Your Design
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Choose an image file to use for your products
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Design Prompt
                    </label>
                    <Textarea
                      placeholder="Describe the design you want to create..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />

                    {/* Reference Image Upload for AI Generation */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reference Image (Optional)
                      </label>
                      <div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 transition-colors"
                        onClick={() => promptImageInputRef.current?.click()}
                      >
                        {promptReferenceImage ? (
                          <div className="space-y-2">
                            <img
                              src={promptReferenceImage}
                              alt="Reference for AI generation"
                              className="max-w-full max-h-24 mx-auto rounded object-cover"
                            />
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Click to change reference image
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Upload Reference Image
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Help AI understand your vision
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        ref={promptImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePromptImageUpload}
                        className="hidden"
                      />
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      AI will generate a design based on your description and
                      optional reference image
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Product Selection */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Select Products
                  </CardTitle>
                  {selectedProducts.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                    >
                      {selectedProducts.length} selected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {PRINT_ON_DEMAND_PRODUCTS.map((product, index) => {
                    const isSelected = selectedProducts.some(
                      (p) => p.name === product.name,
                    );
                    return (
                      <div
                        key={index}
                        className={`cursor-pointer rounded-lg border-2 p-3 transition-all relative ${
                          isSelected
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                        onClick={() => toggleProductSelection(product)}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 text-white rounded-full text-xs flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <div className="aspect-square w-full mb-2">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <p className="text-sm text-center text-gray-600 dark:text-gray-400 font-medium">
                          {product.name}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <Button
                    onClick={generateProductMockups}
                    disabled={
                      isGenerating ||
                      selectedProducts.length === 0 ||
                      (!usePrompt && !uploadedImage) ||
                      (usePrompt && !prompt.trim())
                    }
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Generating Mockups...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Mockups ({selectedProducts.length})
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Generated Results */}
        {(generatedImages.length > 0 || isGenerating) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="p-6 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generated Product Mockups
                </h3>
                {generationTime && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Generated in {generationTime.toFixed(1)} seconds
                  </span>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedImages.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4"
                  >
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                      {item.isGenerating ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Generating...
                          </p>
                        </div>
                      ) : item.image === "error" ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="text-red-500 mb-2">⚠️</div>
                          <p className="text-sm text-red-600 dark:text-red-400 text-center">
                            Generation failed
                          </p>
                        </div>
                      ) : (
                        <>
                          <img
                            src={item.image}
                            alt={`${item.productName} mockup`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                            onClick={() =>
                              downloadImage(item.image, item.productName)
                            }
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="text-center">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.productName}
                      </h4>
                      {!item.isGenerating && item.image !== "error" && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Click download to save
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PrintOnDemand;
