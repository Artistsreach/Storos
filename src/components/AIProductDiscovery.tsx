import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Search,
  Sparkles,
  TrendingUp,
  Users,
  BarChart,
  Hash,
  Loader2,
  ArrowRight,
  Printer,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
} from "lucide-react";
import { GoogleGenAI, Modality } from "@google/genai";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface ProductIdea {
  id: string;
  name: string;
  description: string;
  image: string;
  priceRange: string;
  isPrintOnDemand: boolean;
  demographics: {
    ageRange: string;
    gender: string;
    income: string;
    education: string;
    location: string;
  };
  seoKeywords: string[];
  conversionRate: number;
  customerPersona: {
    name: string;
    age: number;
    occupation: string;
    interests: string[];
    painPoints: string[];
    goals: string[];
  };
  socialMedia: {
    hashtags: string[];
    accounts: {
      platform: "instagram" | "tiktok" | "facebook" | "youtube" | "twitter";
      handle: string;
    }[];
  };
}

interface NicheCategory {
  name: string;
  subcategories: string[];
}

const NICHE_CATEGORIES: NicheCategory[] = [
  {
    name: "Health & Wellness",
    subcategories: [
      "Dietary Supplements",
      "Mental Health Products",
      "Medical Devices",
      "Alternative Medicine",
      "Sleep Products",
      "Personal Care for Specific Conditions",
    ],
  },
  {
    name: "Fashion & Apparel",
    subcategories: [
      "Sustainable Fashion",
      "Plus-Size Clothing",
      "Maternity & Nursing Wear",
      "Workwear & Uniforms",
      "Cosplay & Costume",
      "Adaptive Clothing",
      "Luxury Designer Resale",
      "Modest Fashion",
      "Activewear & Athleisure",
    ],
  },
  {
    name: "Technology & Electronics",
    subcategories: [
      "Gaming Equipment",
      "Smart Home Automation",
      "Vintage Electronics",
      "Drone Technology",
      "Virtual Reality & AR",
      "Cryptocurrency Hardware",
      "3D Printing",
      "Repair & Refurbishment",
    ],
  },
  {
    name: "Jewelry & Accessories",
    subcategories: [
      "Custom Engagement Rings",
      "Vintage & Antique Jewelry",
      "Men's Jewelry",
      "Religious & Spiritual Jewelry",
      "Body Jewelry",
      "Luxury Watch Collecting",
      "Handmade Artisan Jewelry",
    ],
  },
  {
    name: "Fitness & Sports",
    subcategories: [
      "Martial Arts Equipment",
      "Outdoor Adventure Gear",
      "Water Sports",
      "Team Sports Equipment",
      "Recovery & Rehabilitation",
      "Specialized Training",
      "Youth Sports",
    ],
  },
  {
    name: "Plants & Gardening",
    subcategories: [
      "Indoor Air-Purifying Plants",
      "Rare & Exotic Plants",
      "Hydroponic Systems",
      "Organic Gardening",
      "Urban Gardening",
      "Succulent & Cactus Specialty",
      "Herb Gardens",
    ],
  },
  {
    name: "Automotive",
    subcategories: [
      "Electric Vehicle Accessories",
      "Classic Car Restoration",
      "Motorcycle Gear",
      "Car Detailing Products",
      "Performance Modifications",
      "RV & Camping Accessories",
      "Car Safety & Security",
    ],
  },
  {
    name: "Food & Beverage",
    subcategories: [
      "Specialty Coffee",
      "Craft Beer & Brewing",
      "International Foods",
      "Dietary Restriction Foods",
      "Gourmet & Artisan Foods",
      "Wine & Spirits",
      "Meal Kit Services",
      "Baby & Toddler Food",
    ],
  },
  {
    name: "Media & Entertainment",
    subcategories: [
      "Vinyl Records",
      "Movie Memorabilia",
      "Board Games",
      "Streaming Equipment",
      "Podcast Production",
      "Photography Equipment",
      "Art Supplies",
    ],
  },
  {
    name: "Pet Care & Accessories",
    subcategories: [
      "Exotic Pet Supplies",
      "Pet Training & Behavior",
      "Pet Health & Veterinary",
      "Luxury Pet Products",
      "Pet Photography",
      "Pet Insurance & Services",
    ],
  },
  {
    name: "Home & Garden",
    subcategories: [
      "Smart Home Integration",
      "Tiny House Living",
      "Home Security",
      "Interior Design Services",
      "Cleaning & Organization",
      "Home Improvement Tools",
      "Feng Shui & Home Energy",
    ],
  },
];

// Flatten all niches for autocomplete
const ALL_NICHES = NICHE_CATEGORIES.flatMap((category) => [
  category.name,
  ...category.subcategories,
]);

const AIProductDiscovery = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredNiches, setFilteredNiches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [productIdeas, setProductIdeas] = useState<ProductIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductIdea | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<string>("overview");

  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter niches based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredNiches([]);
      return;
    }

    const filtered = ALL_NICHES.filter((niche) =>
      niche.toLowerCase().includes(searchQuery.toLowerCase()),
    ).slice(0, 5); // Limit to 5 suggestions

    setFilteredNiches(filtered);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate product ideas using Gemini API
  const generateProductIdeas = async () => {
    if (!searchQuery.trim()) return;

    setIsGenerating(true);
    setError(null);
    setProductIdeas([]);
    const startTime = performance.now();

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === "YOUR_API_KEY") {
        throw new Error(
          "Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.",
        );
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
      });

      // Check if niche is suitable for print-on-demand
      const podCheckPrompt = `Is the niche "${searchQuery}" suitable for print-on-demand products like custom t-shirts, mugs, posters, etc.? Answer only with YES or NO.`;

      const podCheckResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ text: podCheckPrompt }],
      });

      const podCheckResult =
        podCheckResponse.candidates[0].content.parts[0].text;
      const isPodSuitable = podCheckResult.includes("YES");

      // Generate product ideas
      const productIdeasPrompt = `Generate 4 product ideas for the niche: "${searchQuery}". ${isPodSuitable ? "Make sure 2 of them are print-on-demand products." : ""}
      
      For each product idea, provide:
      1. A creative product name
      2. A detailed description (50-70 words)
      3. A price range
      4. Demographics information (age range, gender distribution, income level, education level, location)
      5. 5-7 SEO keywords
      6. Average conversion rate (a realistic percentage)
      7. A detailed customer persona with name, age, occupation, interests, pain points, and goals
      8. Social media hashtags (5-7) and relevant accounts to follow (2-3 for each: TikTok, Instagram, Facebook, YouTube, and Twitter/X)
      
      Format the response as a JSON array with 4 objects, each representing a product idea with the following structure:
      {
        "name": "Product Name",
        "description": "Product description...",
        "priceRange": "$XX - $XXX",
        "isPrintOnDemand": boolean,
        "demographics": {
          "ageRange": "XX-XX",
          "gender": "distribution info",
          "income": "income level",
          "education": "education level",
          "location": "geographic info"
        },
        "seoKeywords": ["keyword1", "keyword2", ...],
        "conversionRate": X.X,
        "customerPersona": {
          "name": "Name",
          "age": XX,
          "occupation": "Job title",
          "interests": ["interest1", "interest2", ...],
          "painPoints": ["pain point1", "pain point2", ...],
          "goals": ["goal1", "goal2", ...]
        },
        "socialMedia": {
          "hashtags": ["#hashtag1", "#hashtag2", ...],
          "accounts": [
            {"platform": "instagram", "handle": "@account"},
            {"platform": "tiktok", "handle": "@account"},
            {"platform": "facebook", "handle": "@account"},
            {"platform": "youtube", "handle": "@account"},
            {"platform": "twitter", "handle": "@account"}
          ]
        }
      }
      
      Make sure the ideas are specialized, emerging, and trending in the market. Be creative and detailed.`;

      const textResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ text: productIdeasPrompt }],
      });

      const textResult = textResponse.candidates[0].content.parts[0].text;

      // Extract JSON from the response
      const jsonMatch = textResult.match(/\[\s*\{.*\}\s*\]/s);
      if (!jsonMatch) {
        throw new Error("Failed to parse product ideas from AI response");
      }

      const jsonText = jsonMatch[0];
      const parsedIdeas = JSON.parse(jsonText);

      // Generate images for each product idea
      const ideasWithImages = [];

      for (const idea of parsedIdeas) {
        try {
          const imagePrompt = `Create a professional product image for: ${idea.name}. ${idea.description}`;

          const imageResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash-preview-image-generation",
            contents: [{ text: imagePrompt }],
            config: {
              responseModalities: [Modality.TEXT, Modality.IMAGE],
            },
          });

          // Extract image from response
          let imageUrl =
            "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80";

          for (const part of imageResponse.candidates[0].content.parts) {
            if (
              part.inlineData &&
              part.inlineData.mimeType &&
              part.inlineData.mimeType.startsWith("image/")
            ) {
              imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }

          ideasWithImages.push({
            ...idea,
            id: `product-${ideasWithImages.length + 1}`,
            image: imageUrl,
          });
        } catch (error) {
          console.error("Error generating image for product idea:", error);

          // Add idea with placeholder image
          ideasWithImages.push({
            ...idea,
            id: `product-${ideasWithImages.length + 1}`,
            image:
              "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
          });
        }
      }

      setProductIdeas(ideasWithImages);
      if (ideasWithImages.length > 0) {
        setSelectedProduct(ideasWithImages[0]);
      }

      const endTime = performance.now();
      setGenerationTime((endTime - startTime) / 1000);
    } catch (error) {
      console.error("Error generating product ideas:", error);
      setError(error.message || "Failed to generate product ideas");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  // Prepare demographic data for charts
  const getGenderData = (genderText: string) => {
    // Parse gender distribution from text
    const maleMatch = genderText.match(/(\d+)%\s*male/i);
    const femaleMatch = genderText.match(/(\d+)%\s*female/i);

    const malePercentage = maleMatch ? parseInt(maleMatch[1]) : 50;
    const femalePercentage = femaleMatch ? parseInt(femaleMatch[1]) : 50;
    const otherPercentage = 100 - malePercentage - femalePercentage;

    return [
      { name: "Male", value: malePercentage, color: "#3b82f6" },
      { name: "Female", value: femalePercentage, color: "#ec4899" },
      {
        name: "Other",
        value: otherPercentage > 0 ? otherPercentage : 0,
        color: "#8b5cf6",
      },
    ];
  };

  const getAgeRangeData = (ageRange: string) => {
    // Parse age range and create distribution
    const match = ageRange.match(/(\d+)\s*-\s*(\d+)/);
    if (!match) return [];

    const minAge = parseInt(match[1]);
    const maxAge = parseInt(match[2]);

    // Create age brackets
    const brackets = [];
    const bracketSize = 10;

    for (
      let age = Math.floor(minAge / 10) * 10;
      age <= maxAge;
      age += bracketSize
    ) {
      const nextAge = age + bracketSize - 1;
      brackets.push({
        name: `${age}-${nextAge > maxAge ? maxAge : nextAge}`,
        value: 100 / Math.ceil((maxAge - minAge) / bracketSize),
      });
    }

    return brackets;
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-800 dark:to-blue-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 blur-3xl animate-pulse"
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 px-6 py-3 rounded-full mb-6 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50">
            <Search className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              AI-Powered Discovery
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-700 dark:from-white dark:via-blue-300 dark:to-indigo-400 bg-clip-text text-transparent">
            Product Niche Discovery
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Enter a niche to discover trending product ideas with detailed
            market insights, demographics, and marketing strategies powered by
            AI.
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
            <CardContent className="pt-6">
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Enter a niche (e.g., Sustainable Fashion, Smart Home Automation)"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full pl-10 pr-4 py-3 text-lg bg-white dark:bg-gray-700 border-slate-300 dark:border-gray-600 focus:ring-primary/50 dark:placeholder:text-gray-400"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <Button
                    onClick={generateProductIdeas}
                    disabled={isGenerating || !searchQuery.trim()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Discover Products
                      </>
                    )}
                  </Button>
                </div>

                {/* Autocomplete suggestions */}
                {showSuggestions && filteredNiches.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-md shadow-lg max-h-60 overflow-auto border dark:border-gray-600"
                  >
                    <ul className="py-1">
                      {filteredNiches.map((niche, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/40 cursor-pointer text-gray-700 dark:text-gray-200"
                          onClick={() => {
                            setSearchQuery(niche);
                            setShowSuggestions(false);
                          }}
                        >
                          {niche}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
                  {error}
                </div>
              )}

              {generationTime !== null && (
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Generated {productIdeas.length} product ideas in{" "}
                  {generationTime.toFixed(1)} seconds
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        {productIdeas.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Product List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl h-full ring-1 ring-black/5 dark:ring-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Product Ideas for {searchQuery}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {productIdeas.map((idea) => (
                      <div
                        key={idea.id}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedProduct?.id === idea.id
                            ? "bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700/40 border-l-4 border-transparent"
                        }`}
                        onClick={() => setSelectedProduct(idea)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={idea.image}
                              alt={idea.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {idea.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {idea.priceRange}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              {idea.isPrintOnDemand && (
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                  <Printer className="h-3 w-3 mr-1" />
                                  Print on Demand
                                </Badge>
                              )}
                              <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                                {idea.conversionRate}% Conv. Rate
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Product Details */}
            {selectedProduct && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-2xl text-gray-900 dark:text-white">
                        {selectedProduct.name}
                      </CardTitle>
                      {selectedProduct.isPrintOnDemand && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Printer className="h-3 w-3 mr-1" />
                          Print on Demand
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <div className="rounded-lg overflow-hidden mb-4 aspect-video bg-gray-100 dark:bg-gray-700">
                          <img
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {selectedProduct.description}
                        </p>
                        <div className="mt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {selectedProduct.priceRange}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-blue-600 border-blue-200 dark:text-blue-300 dark:border-blue-700"
                            >
                              {selectedProduct.conversionRate}% Conversion Rate
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Tabs
                          defaultValue="overview"
                          value={activeTab}
                          onValueChange={setActiveTab}
                          className="w-full"
                        >
                          <TabsList className="grid grid-cols-3 mb-4 bg-gray-100 dark:bg-gray-700/80">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="demographics">
                              Demographics
                            </TabsTrigger>
                            <TabsTrigger value="marketing">
                              Marketing
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview" className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                SEO Keywords
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedProduct.seoKeywords.map(
                                  (keyword, idx) => (
                                    <Badge key={idx} variant="secondary" className="dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                                      {keyword}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Customer Persona
                              </h4>
                              <Card className="bg-gray-50 dark:bg-gray-700/50">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                                      {selectedProduct.customerPersona.name.charAt(
                                        0,
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedProduct.customerPersona.name},{" "}
                                        {selectedProduct.customerPersona.age}
                                      </p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {
                                          selectedProduct.customerPersona
                                            .occupation
                                        }
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div>
                                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Interests
                                      </h5>
                                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                                        {selectedProduct.customerPersona.interests.map(
                                          (interest, idx) => (
                                            <li key={idx}>{interest}</li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Pain Points
                                      </h5>
                                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                                        {selectedProduct.customerPersona.painPoints.map(
                                          (point, idx) => (
                                            <li key={idx}>{point}</li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Goals
                                      </h5>
                                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                                        {selectedProduct.customerPersona.goals.map(
                                          (goal, idx) => (
                                            <li key={idx}>{goal}</li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>

                          <TabsContent
                            value="demographics"
                            className="space-y-6"
                          >
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Demographics Overview
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Age Range
                                  </p>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {selectedProduct.demographics.ageRange}
                                  </p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Education
                                  </p>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {selectedProduct.demographics.education}
                                  </p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Income Level
                                  </p>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {selectedProduct.demographics.income}
                                  </p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Location
                                  </p>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {selectedProduct.demographics.location}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Gender Distribution
                              </h4>
                              <div className="h-64 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={getGenderData(
                                        selectedProduct.demographics.gender,
                                      )}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={80}
                                      paddingAngle={5}
                                      dataKey="value"
                                      label={({ name, percent }) =>
                                        `${name}: ${(percent * 100).toFixed(0)}%`
                                      }
                                    >
                                      {getGenderData(
                                        selectedProduct.demographics.gender,
                                      ).map((entry, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={entry.color}
                                        />
                                      ))}
                                    </Pie>
                                    <Legend />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Age Distribution
                              </h4>
                              <div className="h-64 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RechartsBarChart
                                    data={getAgeRangeData(
                                      selectedProduct.demographics.ageRange,
                                    )}
                                    margin={{
                                      top: 20,
                                      right: 30,
                                      left: 20,
                                      bottom: 5,
                                    }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-600" />
                                    <XAxis dataKey="name" tick={{ fill: '#a0aec0' }} />
                                    <YAxis tick={{ fill: '#a0aec0' }} />
                                    <RechartsTooltip
                                      contentStyle={{
                                        backgroundColor: '#2d3748',
                                        borderColor: '#4a5568',
                                      }}
                                    />
                                    <Bar
                                      dataKey="value"
                                      name="Percentage"
                                      fill="#3b82f6"
                                    />
                                  </RechartsBarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="marketing" className="space-y-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Social Media Hashtags
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedProduct.socialMedia.hashtags.map(
                                  (hashtag, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-indigo-600 border-indigo-200 dark:text-indigo-300 dark:border-indigo-700"
                                    >
                                      {hashtag}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Accounts to Follow
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                {selectedProduct.socialMedia.accounts.map(
                                  (account, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                    >
                                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        {getPlatformIcon(account.platform)}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                          {account.handle}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                          {account.platform}
                                        </p>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Marketing Strategy
                              </h4>
                              <Card className="bg-gray-50 dark:bg-gray-700/50">
                                <CardContent className="p-4">
                                  <div className="space-y-4">
                                    <div>
                                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Target Audience
                                      </h5>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedProduct.demographics.gender},{" "}
                                        {selectedProduct.demographics.ageRange}{" "}
                                        years old,{" "}
                                        {selectedProduct.demographics.education}
                                        , {selectedProduct.demographics.income}{" "}
                                        income level, primarily in{" "}
                                        {selectedProduct.demographics.location}.
                                      </p>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Key Selling Points
                                      </h5>
                                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                                        {selectedProduct.customerPersona.painPoints.map(
                                          (point, idx) => (
                                            <li key={idx}>Solves: {point}</li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Recommended Platforms
                                      </h5>
                                      <div className="flex flex-wrap gap-2">
                                        {selectedProduct.socialMedia.accounts.map(
                                          (account, idx) => (
                                            <Badge
                                              key={idx}
                                              variant="secondary"
                                              className="dark:bg-gray-600 dark:text-gray-200"
                                            >
                                              {getPlatformIcon(
                                                account.platform,
                                              )}
                                              <span className="ml-1 capitalize">
                                                {account.platform}
                                              </span>
                                            </Badge>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/50"
                        onClick={() =>
                          window.open("https://freshfront.co", "_blank")
                        }
                      >
                        Create Store with This Product
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AIProductDiscovery;
