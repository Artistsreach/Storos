import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import {
  ArrowRight,
  Sparkles,
  Play,
  Loader2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { GoogleGenAI, Modality } from "@google/genai";

interface HeroSectionProps {
  onGetStarted?: () => void;
}

interface StorePreview {
  name: string;
  image: string;
}

interface SampleProduct {
  name: string;
  image: string;
}

const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    name: "Green Jacket",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Jacket.webp",
  },
  {
    name: "Orange Couch",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Orange%20couch.jpeg",
  },
  {
    name: "Red Shoe",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Rednike.jpeg",
  },
  {
    name: "Vase",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Vase.webp",
  },
  {
    name: "Wood Desk",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Woodendesk.jpeg",
  },
  {
    name: "Glasses",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Glasses.jpeg",
  },
  {
    name: "Tiffany Necklace",
    image: "https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/Tiffany.jpeg?alt=media&token=d76b942c-5c48-4896-b50a-54a6d9536e4e",
  },
  {
    name: "Gucci Bag",
    image: "https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/Guccibag.jpeg?alt=media&token=9fa836c0-5dd5-4e23-a666-d247a9deb36e",
  },
  {
    name: "Fireplace Mantle",
    image: "https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/Fireplace.jpeg?alt=media&token=e29850cd-133e-41bd-b845-12e96be815e6",
  },
];

const HeroSection = ({ onGetStarted = () => {} }: HeroSectionProps) => {
  const [prompt, setPrompt] = useState(
    "Create a modern outdoor gear store called 'Alpine Adventures' with hiking and camping equipment...",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStores, setGeneratedStores] = useState<StorePreview[]>([]);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  // Product Visualizer State
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SampleProduct[]>([]);
  const [customProductImages, setCustomProductImages] = useState<string[]>([]);
  const [isVisualizingProduct, setIsVisualizingProduct] = useState(false);
  const [visualizedResult, setVisualizedResult] = useState<string | null>(null);
  const [visualizationTime, setVisualizationTime] = useState<number | null>(
    null,
  );

  const referenceFileInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  // Function to generate store UIs using Gemini API
  const generateStoreUIs = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedStores([]);
    const startTime = performance.now();

    try {
      // Check if API key is available
      const apiKey = process.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === "YOUR_API_KEY") {
        throw new Error(
          "Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.",
        );
      }

      // Initialize the Gemini API with new SDK
      const ai = new GoogleGenAI({
        apiKey: apiKey,
      });

      // Extract store name from prompt or generate a default one
      let storeName = "Store";
      const nameMatch = prompt.match(/called ['"](.*?)['"]/);
      if (nameMatch && nameMatch[1]) {
        storeName = nameMatch[1];
      }

      // Create enhanced prompt for e-commerce UI generation
      const enhancedPrompt = `Generate an image of a realistic e-commerce website UI preview for a store based on this description: ${prompt}. Make it look professional with products, navigation, and branding. Show a complete website homepage layout.`;

      console.log(
        "Starting image generation with enhanced prompt:",
        enhancedPrompt,
      );

      // Generate 3 different UI designs sequentially to avoid rate limits
      const results: string[] = [];

      try {
        const result1 = await generateSingleUI(
          ai,
          enhancedPrompt +
            " Style: Modern and minimal design with clean lines.",
        );
        results.push(result1);
      } catch (error) {
        console.error("Error generating first image:", error);
        results.push(
          "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
        );
      }

      try {
        const result2 = await generateSingleUI(
          ai,
          enhancedPrompt +
            " Style: Bold and colorful design with vibrant elements.",
        );
        results.push(result2);
      } catch (error) {
        console.error("Error generating second image:", error);
        results.push(
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
        );
      }

      try {
        const result3 = await generateSingleUI(
          ai,
          enhancedPrompt +
            " Style: Elegant and luxury design with premium aesthetics.",
        );
        results.push(result3);
      } catch (error) {
        console.error("Error generating third image:", error);
        results.push(
          "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
        );
      }

      // Update state with generated stores
      setGeneratedStores([
        { name: storeName, image: results[0] },
        { name: storeName, image: results[1] },
        { name: storeName, image: results[2] },
      ]);

      const endTime = performance.now();
      setGenerationTime((endTime - startTime) / 1000);

      console.log("Successfully generated store UIs");
    } catch (error) {
      console.error("Error generating store UIs:", error);

      // Show error message to user
      if (error instanceof Error) {
        alert(
          `Error generating store UIs: ${error.message || "Unknown error"}. Please check your API key and try again.`,
        );
      } else {
        alert(
          `An unknown error occurred while generating store UIs. Please check your API key and try again.`,
        );
      }

      // Set some placeholder images in case of error
      setGeneratedStores([
        {
          name: "Sample Store",
          image:
            "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
        },
        {
          name: "Sample Store",
          image:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
        },
        {
          name: "Sample Store",
          image:
            "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to generate a single UI image
  const generateSingleUI = async (
    ai: any,
    promptText: string,
  ): Promise<string> => {
    try {
      console.log("Generating image with prompt:", promptText);

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: promptText,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      console.log("Gemini response:", response);

      // Check if response exists and has candidates
      if (
        !response ||
        !response.candidates ||
        response.candidates.length === 0
      ) {
        console.error("No candidates in response");
        throw new Error("No candidates in response");
      }

      // Find the image part in the response
      const content = response.candidates[0].content;
      if (!content || !content.parts) {
        console.error("No content or parts in response");
        throw new Error("No content or parts in response");
      }
      for (const part of content.parts) {
        console.log("Processing part:", part);
        if (
          part.inlineData &&
          part.inlineData.mimeType &&
          part.inlineData.mimeType.startsWith("image/")
        ) {
          console.log("Found image data, creating data URL");
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }

      console.error("No image found in response parts");
      throw new Error("No image found in response");
    } catch (error) {
      console.error("Error generating single UI:", error);
      // Re-throw the error so we can handle it in the main function
      throw error;
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle reference image upload
  const handleReferenceImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setReferenceImage(base64);
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  };

  // Handle custom product image upload
  const handleCustomProductUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files) {
      try {
        const newCustomImages: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const base64 = await fileToBase64(files[i]);
          newCustomImages.push(base64);
        }
        setCustomProductImages((prev) => [...prev, ...newCustomImages]);
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  };

  // Handle product selection toggle
  const toggleProductSelection = (product: SampleProduct) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p.name === product.name);
      if (isSelected) {
        return prev.filter((p) => p.name !== product.name);
      } else {
        return [...prev, product];
      }
    });
  };

  // Remove custom product image
  const removeCustomProduct = (index: number) => {
    setCustomProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Function to visualize products in reference image
  const visualizeProduct = async () => {
    if (
      !referenceImage ||
      (selectedProducts.length === 0 && customProductImages.length === 0)
    )
      return;

    setIsVisualizingProduct(true);
    setVisualizedResult(null);
    const startTime = performance.now();

    try {
      const apiKey = process.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === "YOUR_API_KEY") {
        throw new Error(
          "Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.",
        );
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
      });

      // Prepare all products for visualization
      const allProducts = [
        ...selectedProducts,
        ...customProductImages.map((img, index) => ({
          name: `Custom Product ${index + 1}`,
          image: img,
        })),
      ];
      const productNames = allProducts.map((p) => p.name).join(", ");

      // Convert reference image to proper format for API
      const referenceImageData = referenceImage.split(",")[1]; // Remove data:image/...;base64, prefix
      const referenceImageMimeType = referenceImage.split(";")[0].split(":")[1];

      // Prepare content parts for API call
      const contentParts: any[] = [];

      const prompt = `Visualize these products: ${productNames} naturally placed in this reference image/space. Make them look realistic and well-integrated into the scene. The products should appear as if they naturally belong in this environment with proper lighting, shadows, and perspective. Arrange them in a visually appealing way that makes sense for the space.`;

      contentParts.push({ text: prompt });
      contentParts.push({
        inlineData: {
          mimeType: referenceImageMimeType,
          data: referenceImageData,
        },
      });

      // Add all product images
      for (const product of allProducts) {
        let productImageData, productImageMimeType;

        if (product.image.startsWith("data:")) {
          // Custom uploaded image
          productImageData = product.image.split(",")[1];
          productImageMimeType = product.image.split(";")[0].split(":")[1];
        } else {
          // Sample product - fetch and convert to base64
          const response = await fetch(product.image);
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          productImageData = base64.split(",")[1];
          productImageMimeType = blob.type;
        }

        contentParts.push({
          inlineData: {
            mimeType: productImageMimeType,
            data: productImageData,
          },
        });
      }

      console.log("Starting product visualization with prompt:", prompt);

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: contentParts,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      console.log("Gemini visualization response:", response);

      if (
        !response ||
        !response.candidates ||
        response.candidates.length === 0
      ) {
        throw new Error("No candidates in response");
      }

      // Find the image part in the response
      const content = response.candidates[0].content;
      if (!content || !content.parts) {
        throw new Error("No content or parts in response");
      }
      for (const part of content.parts) {
        if (
          part.inlineData &&
          part.inlineData.mimeType &&
          part.inlineData.mimeType.startsWith("image/")
        ) {
          const resultImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          setVisualizedResult(resultImage);
          break;
        }
      }

      const endTime = performance.now();
      setVisualizationTime((endTime - startTime) / 1000);

      console.log("Successfully visualized product");
    } catch (error) {
      console.error("Error visualizing product:", error);
      if (error instanceof Error) {
        alert(
          `Error visualizing product: ${error.message || "Unknown error"}. Please check your API key and try again.`,
        );
      } else {
        alert(
          `An unknown error occurred while visualizing the product. Please check your API key and try again.`,
        );
      }
    } finally {
      setIsVisualizingProduct(false);
    }
  };
  return (
    <div className="relative w-full min-h-[800px] bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 dark:from-gray-900 dark:via-slate-800 dark:to-blue-900 overflow-hidden">
      {/* Enhanced Background pattern with modern glassmorphism */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-sky-300 dark:from-blue-500 dark:to-sky-400 blur-3xl animate-pulse" />
        <div
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-gradient-to-r from-sky-300 to-blue-400 dark:from-sky-400 dark:to-blue-600 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-gradient-to-r from-blue-300 to-sky-400 dark:from-blue-600 dark:to-sky-500 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Modern geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-sky-300/20 rounded-3xl rotate-45 animate-float" />
        <div
          className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-sky-400/20 to-blue-300/20 rounded-2xl rotate-12 animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/3 left-10 w-16 h-16 bg-gradient-to-br from-blue-300/30 to-sky-400/30 rounded-xl rotate-45 animate-float"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-16 h-16 bg-white/30 dark:bg-white/20 rounded-2xl backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [20, -20, 20], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-16 w-12 h-12 bg-white/30 dark:bg-white/20 rounded-full backdrop-blur-sm"
        />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left side - Text content */}
          <div className="flex-1 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                The Easiest Way to Create a Store
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed font-medium">
                FreshFront uses AI to generate your logo, products, collections,
                site content & ads–in minutes–all from a single prompt.
              </p>
              <div className="flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onClick={() =>
                      window.open("https://freshfront.co", "_blank")
                    }
                    className="bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 hover:from-blue-700 hover:via-sky-600 hover:to-blue-800 text-white px-10 py-7 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 font-semibold group"
                  >
                    Get Started{" "}
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right side - AI Prompt Demo */}
          <div className="flex-1 w-full max-w-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              whileHover={{ scale: 1.02, rotateY: -2 }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="p-6 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="mx-auto text-sm text-gray-600 dark:text-gray-300 font-medium">
                    AI Prompt to Storefront
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Store Prompt
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full h-24 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      placeholder="Create a modern outdoor gear store called 'Alpine Adventures' with hiking and camping equipment..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        className="absolute bottom-3 right-3 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white rounded-lg flex items-center gap-1 px-3 py-1 shadow-lg group"
                        onClick={generateStoreUIs}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />{" "}
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />{" "}
                            Generate
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                      <p className="text-gray-600 dark:text-gray-300">
                        Generating store designs...
                      </p>
                    </div>
                  ) : generatedStores.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold mr-3">
                            {generatedStores[0].name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-200">
                            {generatedStores[0].name}
                          </span>
                        </div>
                        <span className="text-xs text-green-400 bg-green-900/60 px-2 py-1 rounded-full">
                          Generated
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {generatedStores.map((store, index) => (
                          <div
                            key={index}
                            className="bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 p-2"
                          >
                            <img
                              src={store.image}
                              alt={`${store.name} preview ${index + 1}`}
                              className="w-full h-16 object-cover rounded-sm mb-2"
                            />
                            <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded w-3/4 mb-1"></div>
                            <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold mr-3">
                            A
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-200">
                            Alpine Adventures
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-700/60 px-2 py-1 rounded-full">
                          Example
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 p-2">
                          <div className="bg-gray-300 dark:bg-gray-600 rounded-sm w-full h-16 mb-2"></div>
                          <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded w-3/4 mb-1"></div>
                          <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded w-1/2"></div>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 p-2">
                          <div className="bg-gray-300 dark:bg-gray-600 rounded-sm w-full h-16 mb-2"></div>
                          <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded w-3/4 mb-1"></div>
                          <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded w-1/2"></div>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 p-2">
                          <div className="bg-gray-300 dark:bg-gray-600 rounded-sm w-full h-16 mb-2"></div>
                          <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded w-3/4 mb-1"></div>
                          <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded w-1/2"></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {generationTime
                      ? `Store generated in ${generationTime.toFixed(1)} seconds`
                      : "Enter a prompt and click Generate"}
                  </div>
                  <Button
                    variant="ghost"
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/30"
                    disabled={generatedStores.length === 0}
                  >
                    View Preview
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Visualizer Section */}
        <div className="mt-24 product-visualizer-section">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 pt-20">
              Product Visualizer
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload a reference image and see how products look in that space
              using AI
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Reference Image Upload */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="p-6 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Reference Image (Model/Space)
                </h3>
              </div>
              <div className="p-6">
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => referenceFileInputRef.current?.click()}
                >
                  {referenceImage ? (
                    <div className="space-y-4">
                      <img
                        src={referenceImage}
                        alt="Reference"
                        className="max-w-full max-h-48 mx-auto rounded-lg object-cover"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to change reference image
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          Upload Reference Image
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Choose a model photo or room/space image
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={referenceFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleReferenceImageUpload}
                  className="hidden"
                />
              </div>
            </motion.div>

            {/* Product Selection */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="p-6 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Product
                </h3>
              </div>
              <div className="p-6">
                {/* Custom Product Upload */}
                <div className="mb-6">
                  <Button
                    variant="outline"
                    onClick={() => productFileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 p-4 h-auto"
                  >
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="h-5 w-5" />
                      <span>Upload Custom Products</span>
                    </div>
                  </Button>
                  <input
                    ref={productFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCustomProductUpload}
                    className="hidden"
                  />
                  {customProductImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {customProductImages.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img}
                            alt={`Custom Product ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeCustomProduct(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sample Products Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Choose from sample products:
                    </p>
                    {selectedProducts.length > 0 && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                        {selectedProducts.length} selected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {SAMPLE_PRODUCTS.map((product, index) => {
                      const isSelected = selectedProducts.some(
                        (p) => p.name === product.name,
                      );
                      return (
                        <div
                          key={index}
                          className={`cursor-pointer rounded-lg border-2 p-2 transition-all relative ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                          }`}
                          onClick={() => toggleProductSelection(product)}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                              ✓
                            </div>
                          )}
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-16 object-cover rounded mb-1"
                          />
                          <p className="text-xs text-center text-gray-600 dark:text-gray-400 truncate">
                            {product.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Products Summary */}
                {(selectedProducts.length > 0 ||
                  customProductImages.length > 0) && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selected for visualization:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProducts.map((product, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full"
                        >
                          {product.name}
                        </span>
                      ))}
                      {customProductImages.map((_, index) => (
                        <span
                          key={`custom-${index}`}
                          className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full"
                        >
                          Custom {index + 1}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visualize Button */}
                <div className="mt-6">
                  <Button
                    onClick={visualizeProduct}
                    disabled={
                      !referenceImage ||
                      (selectedProducts.length === 0 &&
                        customProductImages.length === 0) ||
                      isVisualizingProduct
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white"
                  >
                    {isVisualizingProduct ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Visualizing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Visualize Products (
                        {selectedProducts.length + customProductImages.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visualization Result */}
          {(visualizedResult || isVisualizingProduct) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="p-6 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Visualization Result
                </h3>
              </div>
              <div className="p-6">
                {isVisualizingProduct ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      AI is visualizing{" "}
                      {selectedProducts.length + customProductImages.length}{" "}
                      product
                      {selectedProducts.length + customProductImages.length > 1
                        ? "s"
                        : ""}{" "}
                      in your reference image...
                    </p>
                  </div>
                ) : visualizedResult ? (
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Original Images */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                          Reference Image
                        </h4>
                        <img
                          src={referenceImage!}
                          alt="Reference"
                          className="w-full rounded-lg shadow-md"
                        />
                      </div>

                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                          Selected Products
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedProducts.map((product, index) => (
                            <div key={index} className="space-y-2">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-24 object-cover rounded-lg shadow-sm"
                              />
                              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                {product.name}
                              </p>
                            </div>
                          ))}
                          {customProductImages.map((img, index) => (
                            <div key={`custom-${index}`} className="space-y-2">
                              <img
                                src={img}
                                alt={`Custom Product ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg shadow-sm"
                              />
                              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                Custom Product {index + 1}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Generated Result with Checkout Overlay */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        AI Generated Result
                      </h4>
                      <div className="relative">
                        <img
                          src={visualizedResult}
                          alt="Product Visualization"
                          className="w-full rounded-lg shadow-lg"
                        />

                        {/* Checkout Card Overlay */}
                        <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 max-w-xs">
                          <div className="space-y-3">
                            <div>
                              <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {selectedProducts.length > 0
                                  ? selectedProducts[0].name
                                  : "Custom Product"}
                                {selectedProducts.length +
                                  customProductImages.length >
                                  1 &&
                                  ` +${selectedProducts.length + customProductImages.length - 1} more`}
                              </h5>
                              <div className="flex items-center space-x-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className="text-yellow-400 text-xs"
                                  >
                                    ★
                                  </span>
                                ))}
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                  4.8 (124)
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              Premium quality products perfectly visualized in
                              your space using AI technology.
                            </p>

                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              $
                              {(selectedProducts.length +
                                customProductImages.length) *
                                99}
                              .99
                            </div>

                            <div className="space-y-2">
                              <Button
                                size="sm"
                                className="w-full bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-slate-700 text-white text-xs"
                              >
                                Add to Cart
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs border-gray-300 dark:border-gray-600"
                              >
                                Buy Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {visualizationTime && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          Visualization completed in{" "}
                          {visualizationTime.toFixed(1)} seconds
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
