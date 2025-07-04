import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Loader2,
  Camera,
  Eye,
  Download,
} from "lucide-react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

interface SampleProduct {
  name: string;
  image: string;
}

const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    name: "Adidas Shoes (pod)",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Adidas.webp",
  },
  {
    name: "Blanket (pod)",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Blanket.webp",
  },
  {
    name: "Green Jacket",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Jacket.webp",
  },
  {
    name: "Canvas (pod)",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Canvas.jpeg",
  },
  {
    name: "Hat (pod)",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Hat.jpeg",
  },
  {
    name: "Hoodie (pod)",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Hoodie.jpeg",
  },
  {
    name: "Notebook (pod)",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Notebook.jpeg",
  },
  {
    name: "Orange Couch",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Orange%20couch.jpeg",
  },
  {
    name: "Pillow (pod)",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Pillow.webp",
  },
  {
    name: "Red Shoe",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Rednike.jpeg",
  },
  {
    name: "Shirt (pod)",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Shirt.webp",
  },
  {
    name: "Tote Bag (pod)",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Totebag.jpeg",
  },
  {
    name: "Travel Mug (pod)",
    image: "https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//TravelMug.jpeg",
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
    name: "Tiffany",
    image: "https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/Tiffany.jpeg?alt=media&token=75cb2ccd-4b70-48dc-a7bd-17e406a411be",
  },
  {
    name: "Gucci bag",
    image: "https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/Guccibag.jpeg?alt=media&token=30004678-84aa-4ba7-aa3e-38b1138da66b",
  },
  {
    name: "Fireplace mantle",
    image: "https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/Fireplace.jpeg?alt=media&token=3bf2a162-ac90-488f-b520-e11f78317128",
  },
];

interface GeneratedImage {
  url: string;
  type: "angle" | "context";
  description: string;
}

const ProductImageGeneration = () => {
  const [selectedProduct, setSelectedProduct] = useState<SampleProduct | null>(
    null,
  );
  const [customProductImage, setCustomProductImage] = useState<string | null>(
    null,
  );
  const [customProductName, setCustomProductName] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle custom product image upload
  const handleCustomProductUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setCustomProductImage(base64);
        setCustomProductName(file.name.split(".")[0] || "Custom Product");
        setSelectedProduct(null); // Clear selected product when uploading custom
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  };

  // Handle product selection
  const handleProductSelection = (product: SampleProduct) => {
    setSelectedProduct(product);
    setCustomProductImage(null); // Clear custom image when selecting sample
    setCustomProductName("");
  };

  // Generate different perspectives using Gemini API
  const generatePerspectives = async () => {
    const currentProduct = selectedProduct || {
      name: customProductName,
      image: customProductImage!,
    };

    if (!currentProduct.image) return;

    setIsGenerating(true);
    setGeneratedImages([]);
    const startTime = performance.now();

    try {
      const apiKey = process.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === "YOUR_API_KEY") {
        throw new Error(
          "Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.",
        );
      }

      const ai = new GoogleGenerativeAI(apiKey);

      // Prepare the product image for API
      let productImageData, productImageMimeType;

      if (currentProduct.image.startsWith("data:")) {
        // Custom uploaded image
        productImageData = currentProduct.image.split(",")[1];
        productImageMimeType = currentProduct.image.split(";")[0].split(":")[1];
      } else {
        // Sample product - fetch and convert to base64
        const response = await fetch(currentProduct.image);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        productImageData = base64.split(",")[1];
        productImageMimeType = blob.type;
      }

      const results: GeneratedImage[] = [];

      // Generate different camera angles
      const anglePrompts = [
        `Show this ${currentProduct.name} from a top-down view with professional studio lighting`,
        `Show this ${currentProduct.name} from a side profile view with dramatic lighting`,
        `Show this ${currentProduct.name} from a 45-degree angle with soft natural lighting`,
      ];

      // Generate contextual environment images
      const contextPrompts = [
        `Show this ${currentProduct.name} in its ideal use environment with realistic lighting and setting`,
        `Show this ${currentProduct.name} in a luxury lifestyle setting that matches its style and purpose`,
        `Show this ${currentProduct.name} in a modern, minimalist environment that highlights its design`,
      ];

      const imageParts = [
        {
          inlineData: {
            data: productImageData,
            mimeType: productImageMimeType,
          },
        },
      ];

      const model = ai.getGenerativeModel({ model: "gemini-pro-vision" });

      // Generate angle variations
      for (let i = 0; i < anglePrompts.length; i++) {
        try {
          const result = await model.generateContent([
            anglePrompts[i],
            ...imageParts,
          ]);
          const response = await result.response;
          const text = response.text();
          // Assuming the response text is a URL to the generated image
          results.push({
            url: text,
            type: "angle",
            description: `${currentProduct.name} - Angle View ${i + 1}`,
          });
        } catch (error) {
          console.error(`Error generating angle ${i + 1}:`, error);
        }
      }

      // Generate contextual variations
      for (let i = 0; i < contextPrompts.length; i++) {
        try {
          const result = await model.generateContent([
            contextPrompts[i],
            ...imageParts,
          ]);
          const response = await result.response;
          const text = response.text();
          // Assuming the response text is a URL to the generated image
          results.push({
            url: text,
            type: "context",
            description: `${currentProduct.name} - Context ${i + 1}`,
          });
        } catch (error) {
          console.error(`Error generating context ${i + 1}:`, error);
        }
      }

      setGeneratedImages(results);
      const endTime = performance.now();
      setGenerationTime((endTime - startTime) / 1000);

      console.log("Successfully generated product perspectives");
    } catch (error: any) {
      console.error("Error generating perspectives:", error);
      alert(
        `Error generating perspectives: ${error.message || "Unknown error"}. Please check your API key and try again.`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const currentProduct =
    selectedProduct ||
    (customProductImage
      ? {
          name: customProductName,
          image: customProductImage,
        }
      : null);

  return (
    <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-slate-800 dark:to-rose-900/50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-6 py-3 rounded-full mb-6 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50">
            <Camera className="h-4 w-4 text-purple-600 dark:text-purple-300" />
            <span className="text-sm font-semibold text-purple-800 dark:text-purple-200">
              AI Image Generation
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-800 to-pink-700 dark:from-white dark:via-purple-300 dark:to-pink-400 bg-clip-text text-transparent">
            Product Image Generation
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Generate multiple perspectives and contextual images of your
            products using AI. Perfect for creating comprehensive product
            galleries.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Selection */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Select Product
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Custom Upload */}
                <div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-purple-300 dark:border-purple-500 hover:border-purple-400 dark:hover:border-purple-400 p-6 h-auto text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      <span>Upload Custom Product</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        JPG, PNG, WebP
                      </span>
                    </div>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCustomProductUpload}
                    className="hidden"
                  />
                </div>

                {/* Sample Products */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Or choose from sample products:
                  </p>
                  <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                    {SAMPLE_PRODUCTS.map((product, index) => {
                      const isSelected = selectedProduct?.name === product.name;
                      return (
                        <div
                          key={index}
                          className={`cursor-pointer rounded-lg border-2 p-2 transition-all relative ${
                            isSelected
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/50"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                          onClick={() => handleProductSelection(product)}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-purple-500 text-white rounded-full text-xs flex items-center justify-center">
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

                {/* Selected Product Display */}
                {currentProduct && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/40 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={currentProduct.image}
                        alt={currentProduct.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {currentProduct.name}
                        </p>
                        <Badge variant="secondary" className="mt-1 dark:bg-gray-700 dark:text-gray-300">
                          {customProductImage
                            ? "Custom Upload"
                            : "Sample Product"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Generation Controls */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Generate Perspectives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-400 text-sm">
                        Different Camera Angles
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Top-down, side profile, 45-degree views
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-400 text-sm">
                        Contextual Environments
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Ideal use settings, luxury lifestyle, modern spaces
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={generatePerspectives}
                  disabled={!currentProduct || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-6 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Generating Perspectives...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate More Perspectives
                    </>
                  )}
                </Button>

                {generationTime && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Generated in {generationTime.toFixed(1)} seconds
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Generated Images Display */}
        {(generatedImages.length > 0 || isGenerating) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="p-6 bg-gray-100/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Generated Perspectives
              </h3>
              {currentProduct && (
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {currentProduct.name} - {generatedImages.length} images
                  generated
                </p>
              )}
            </div>

            <div className="p-6">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    AI is generating multiple perspectives...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    This may take a few moments
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Camera Angles */}
                  {generatedImages.filter((img) => img.type === "angle")
                    .length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Different Camera Angles
                        </h4>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        {generatedImages
                          .filter((img) => img.type === "angle")
                          .map((image, index) => (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.02 }}
                              className="group relative"
                            >
                              <img
                                src={image.url}
                                alt={image.description}
                                className="w-full h-64 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white"
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = image.url;
                                    link.download = `${image.description}.png`;
                                    link.click();
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                                {image.description}
                              </p>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Contextual Environments */}
                  {generatedImages.filter((img) => img.type === "context")
                    .length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Contextual Environments
                        </h4>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        {generatedImages
                          .filter((img) => img.type === "context")
                          .map((image, index) => (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.02 }}
                              className="group relative"
                            >
                              <img
                                src={image.url}
                                alt={image.description}
                                className="w-full h-64 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white"
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = image.url;
                                    link.download = `${image.description}.png`;
                                    link.click();
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                                {image.description}
                              </p>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProductImageGeneration;
