import React from 'react';
import { 
    fetchPexelsImages as utilFetchPexelsImages, 
    generateId as utilGenerateId, 
    generateAIProductDescriptions, 
    generateAIStoreContent,
    fetchPexelsVideos // Import the new video fetching utility
} from '../lib/utils';
// import { overlayLogoOnProductImage } from '@/lib/imageUtils'; // Will be replaced by generateProductWithGemini
import { generateLogoWithGemini } from '../lib/geminiImageGeneration';
import { generateProductWithGemini } from '../lib/geminiProductGeneration';
import { generateCollectionWithGemini } from '../lib/geminiCollectionGeneration'; // Import for AI collection generation
import { 
    generateStoreNameSuggestions, 
    extractExplicitStoreNameFromPrompt, 
    generateHeroContent, 
    generateStoreWayContent, 
    generateStoreFeaturesContent,
    generateImageRightSectionContent, // Added
    generateVideoLeftSectionContent,  // Added
    generatePexelsVideoQuery,
    generateThemeColors
} from '../lib/gemini';
import { generateStoreDetailsFromPhotos } from '../lib/geminiImageUnderstanding';
import { analyzeMultipleUrls } from '../lib/geminiUrlAnalysis';
import { 
    fetchShopifyStorefrontAPI, 
    GET_SHOP_METADATA_QUERY, 
    GET_PRODUCTS_QUERY,
    GET_COLLECTIONS_QUERY, // Added
    GET_LOCALIZATION_INFO_QUERY // Added
} from '../lib/shopify';

const getRandomColor = () => ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#F97316'][Math.floor(Math.random() * 9)];
const getRandomFont = () => ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans'][Math.floor(Math.random() * 5)];
const getRandomLayout = () => ['grid', 'list'][Math.floor(Math.random() * 2)];

// Helper function to read File object into a data URL
const fileToBasics = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve({
        base64: reader.result, // Full data URL
        mimeType: file.type,
        name: file.name
      });
    };
    reader.onerror = (error) => reject(error);
  });
};


export const generateAIProductsData = async (type, count, storeName, storeLogoDataUrl, { fetchPexelsImages = utilFetchPexelsImages, generateId = utilGenerateId } = {}) => {
    const products = [];
    const priceRanges = { fashion: {min:20,max:200}, electronics: {min:50,max:1300}, food: {min:5,max:50}, jewelry: {min:100,max:1000}, general: {min:10,max:300} };
    const range = priceRanges[type] || priceRanges.general;
    const productNamesPool = {
      fashion: ['Classic Tee', 'Urban Jeans', 'Silk Scarf', 'Leather Boots', 'Summer Dress', 'Knit Sweater'],
      electronics: ['HD Webcam', 'Noise-Cancelling Buds', 'Smart Display', 'Gaming Pad', 'Portable Drive', 'VR Headset'],
      food: ['Artisan Bread', 'Gourmet Cheese', 'Organic Berries', 'Craft Coffee', 'Spiced Nuts', 'Dark Chocolate Bar'],
      jewelry: ['Pearl Necklace', 'Sapphire Ring', 'Gold Hoops', 'Charm Bracelet', 'Silver Cufflinks', 'Diamond Studs'],
      general: ['Utility Tool', 'Desk Organizer', 'Travel Mug', 'Yoga Mat', 'Scented Candle', 'Board Game']
    };
    const names = productNamesPool[type] || productNamesPool.general;
    const selectedNames = [...names].sort(() => 0.5 - Math.random()).slice(0, count);

    const imageQueries = selectedNames.map(name => `${type} ${name} product shot`);
    const productImages = await fetchPexelsImages(imageQueries.join(';'), count, 'square');

    for (let i = 0; i < count; i++) {
      const name = selectedNames[i];
      const pexelsImageObject = productImages[i];
      let finalProductImageUrl;

      if (pexelsImageObject && pexelsImageObject.src && pexelsImageObject.src.medium && storeLogoDataUrl) {
        try {
          console.log(`[generateAIProductsData] Overlaying logo on Pexels image: ${pexelsImageObject.src.medium}`);
          finalProductImageUrl = await overlayLogoOnProductImage(pexelsImageObject.src.medium, storeLogoDataUrl);
        } catch (e) {
          console.error(`[generateAIProductsData] Failed to overlay logo on ${pexelsImageObject.src.medium}, using original.`, e);
          finalProductImageUrl = pexelsImageObject.src.medium;
        }
      } else if (pexelsImageObject && pexelsImageObject.src && pexelsImageObject.src.medium) {
        finalProductImageUrl = pexelsImageObject.src.medium;
      } else {
        finalProductImageUrl = `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(name)}`;
      }
      
      products.push({
        id: `product-ai-${generateId()}`,
        name,
        price: parseFloat((Math.random() * (range.max - range.min) + range.min).toFixed(2)),
        description: generateAIProductDescriptions(type, name),
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        stock: Math.floor(Math.random() * 80) + 20,
        image: { 
          id: (pexelsImageObject && pexelsImageObject.id) || generateId(), 
          src: { medium: finalProductImageUrl }, 
          alt: (pexelsImageObject && pexelsImageObject.alt) || `Product image for ${name}` 
        },
        storeName: storeName,
      });
    }
    return products;
};


export const generateStoreFromWizardData = async (wizardData, { fetchPexelsImages = utilFetchPexelsImages, generateId = utilGenerateId } = {}) => {
    const storeId = `store-wizard-${generateId()}`;
    const { productType, storeName, logoUrl, products: wizardProducts, prompt } = wizardData;

    let finalProducts = [];
    // Handle 'ai', 'printOnDemand', and 'manual' sources similarly as they populate wizardProducts.items
    if (wizardProducts.source === 'ai' || wizardProducts.source === 'printOnDemand' || wizardProducts.source === 'manual') {
      finalProducts = wizardProducts.items.map(item => ({
        id: item.id || `product-wizard-${generateId()}`, // Use existing item.id if available (e.g., from Shopify import)
        name: item.name,
        price: parseFloat(item.price) || 0,
        description: item.description || '',
        // Use the new 'images' array. For the 'image' field, use the first image or a placeholder.
        // The full 'images' array should be stored with the product for the detail page.
        images: item.images && item.images.length > 0 ? item.images : [`https://via.placeholder.com/400x400.png?text=${encodeURIComponent(item.name || "Product")}`],
        image: { // Still provide a primary image structure for compatibility with components expecting it
          id: generateId(), 
          src: { medium: (item.images && item.images.length > 0) ? item.images[0] : `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(item.name || "Product")}` }, 
          alt: item.name || "Product Image",
        },
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        stock: Math.floor(Math.random() * 80) + 20,
        isPrintOnDemand: item.isPrintOnDemand || false, 
        podDetails: item.podDetails || null,
        variants: item.variants || [], 
      }));
    }
    // Note: The original 'manual' source specific mapping is now covered by the combined condition.
    // If 'manual' had truly unique fields not covered by 'item.name, item.price, item.description, item.images',
    // then a separate block or more complex conditional logic inside the map would be needed.
    // For now, assuming the structure from wizardStepComponents for manual products aligns.
    // END OF THE if (wizardProducts.source === 'ai' || wizardProducts.source === 'printOnDemand' || wizardProducts.source === 'manual') BLOCK
    
    const heroSlideShowImagesCount = 3;
    const heroSlideShowImages = await fetchPexelsImages(`${productType} ${storeName} hero slideshow ${prompt}`, heroSlideShowImagesCount, 'landscape');
    const heroMainImage = heroSlideShowImages.length > 0 ? heroSlideShowImages[0] : { src: { large: 'https://via.placeholder.com/1200x800.png?text=Hero+Image' }, alt: 'Placeholder Hero Image' };

  const heroVideos = await fetchPexelsVideos(`${productType} ${storeName} store ambiance ${prompt}`, 1, 'landscape');
  const baseAiContent = await generateAIStoreContent(productType, storeName, prompt);
  const featuresVideo = await fetchPexelsVideos(baseAiContent.featuresVideoQuery, 1, 'landscape');
  baseAiContent.featuresVideoUrl = featuresVideo[0]?.url || null;
  const cardBgImages = await fetchPexelsImages(`${storeName} ${productType} abstract background`, 1, 'landscape');
  const cardBackgroundUrl = cardBgImages[0]?.src?.large || cardBgImages[0]?.src?.original || '';
    const templateVersion = 'v1';

    // Merge AI-generated content with content from wizard (hero, storeWay)
    let finalContent = { // Changed to let
      ...baseAiContent, 
      heroSlideshowImages: heroSlideShowImages.map(img => ({ src: img.src.large, alt: img.alt || storeName + " hero image" })),
      ...(wizardData.content?.hero && { 
          heroTitle: wizardData.content.hero.heroTitle || baseAiContent.heroTitle, 
          heroDescription: wizardData.content.hero.heroDescription || baseAiContent.heroDescription 
      }),
      ...(wizardData.content?.storeWay && { storeWay: wizardData.content.storeWay }),
      // Initialize sharp-specific sections
      imageRightSection: null,
      videoLeftSection: null,
    };

    // Generate content for Sharp template sections if applicable
    // Use wizardData.template_version to determine if it's 'sharp'
    if (wizardData.template_version === 'sharp') {
      const productExamples = finalProducts.slice(0, 3).map(p => p.name).join(', ');
      const storeInfoForSharp = { name: storeName, niche: productType, description: prompt || `A ${productType} store called ${storeName}` };
      
      const irsContent = await generateImageRightSectionContent(storeInfoForSharp, productExamples);
      if (irsContent && !irsContent.error) {
        const pexelsImageQueryIRS = irsContent.title || `${storeName} craftsmanship`;
        const pexelsImagesIRS = await fetchPexelsImages(pexelsImageQueryIRS, 1, 'landscape');
        finalContent.imageRightSection = {
          ...irsContent,
          imageUrl: pexelsImagesIRS[0]?.src?.large || `https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1` // Default
        };
      }

      const vlsContent = await generateVideoLeftSectionContent(storeInfoForSharp, productExamples);
      if (vlsContent && !vlsContent.error) {
        const pexelsVideoQueryVLS = vlsContent.title || `${storeName} product action`;
        const pexelsVideosVLS = await fetchPexelsVideos(pexelsVideoQueryVLS, 1, 'landscape');
        finalContent.videoLeftSection = {
          ...vlsContent,
          videoUrl: pexelsVideosVLS[0]?.url || null, // Default to null if no video
          videoPosterUrl: pexelsVideosVLS[0]?.image || null
        };
      }
    }


    return {
      id: storeId,
      name: storeName,
      template_version: templateVersion, 
      type: productType,
      // Use heroDescription from finalContent if available, otherwise from baseAiContent
      description: finalContent.heroDescription || baseAiContent.heroDescription, 
      prompt: prompt || `A ${productType} store called ${storeName}`,
      products: finalProducts,
      collections: wizardData.collections.items.map(collection => ({ 
      id: collection.id || `collection-wizard-${generateId()}`, // Use existing item.id if available
      name: collection.name,
      description: collection.description,
      imageUrl: collection.imageUrl,
      product_ids: collection.product_ids || [], // These should be product IDs that match IDs in finalProducts
    })),
    hero_image: heroMainImage, 
    content: finalContent, // Use the merged finalContent
      hero_video_url: heroVideos[0]?.url || null,
      hero_video_poster_url: heroVideos[0]?.image || null,
      logo_url: wizardData.logoUrlDark || wizardData.logoUrlLight || `https://via.placeholder.com/100x100.png?text=${storeName.substring(0,1)}`, // Use dark for light bg by default
      logo_url_light: wizardData.logoUrlLight || null, // Explicitly pass through
      logo_url_dark: wizardData.logoUrlDark || null,   // Explicitly pass through
      theme: {
        primaryColor: getRandomColor(),
        secondaryColor: getRandomColor(),
        fontFamily: getRandomFont(),
        layout: getRandomLayout(),
      },
      data_source: 'wizard',
      card_background_url: cardBackgroundUrl,
    };
};


export const generateStoreFromPromptData = async (
  prompt,
  {
    storeNameOverride = null,
    nicheDetails = null, // Added nicheDetails
    isPrintOnDemand = false, // Added for collection generation logic
    isDropshipping = false, // Added for collection generation logic
    contextFiles = [],
    contextURLs = [],
    generateProducts = true,
    fetchPexelsImages = utilFetchPexelsImages,
    generateId = utilGenerateId,
  } = {},
  updateProgressCallback = (progress, message) => { console.log(`Progress: ${progress}%, Message: ${message || '(no message)'}`); } // Default no-op callback
) => {
  // Modified updateProgressCallback to handle undefined progress
  const internalUpdateProgressCallback = (newProgress, newMessage) => {
    if (typeof newProgress === 'number' && !isNaN(newProgress)) {
      updateProgressCallback(newProgress, newMessage); // Call original if progress is valid
    } else if (newMessage) {
      updateProgressCallback(undefined, newMessage); // Call original with undefined progress if only message
    }
  };

  internalUpdateProgressCallback(0, 'Initializing store generation...');
  const storeId = `store-ai-${generateId()}`;

  let finalPrompt = prompt;
  let imageAnalysisResult = null;
  let storeTypeFromAnalysis = null;

  // Start with URL analysis if provided
  if (contextURLs && contextURLs.length > 0 && contextURLs.some(u => u.trim() !== '')) {
    internalUpdateProgressCallback(2, 'Analyzing context URLs...');
    try {
      const urlAnalysis = await analyzeMultipleUrls(contextURLs.filter(u => u.trim() !== ''));
      if (urlAnalysis) {
        finalPrompt = `${prompt}\n\n--- AI URL Analysis Context ---\n${urlAnalysis}`;
        internalUpdateProgressCallback(5, 'URL analysis complete.');
      } else {
        internalUpdateProgressCallback(5, 'URL analysis did not return content.');
      }
    } catch (error) {
      console.error("[generateStoreFromPromptData] Error during URL analysis:", error);
      internalUpdateProgressCallback(5, 'URL analysis failed, continuing with prompt.');
    }
  }

  const imageFiles = contextFiles.filter(f => f.type.startsWith('image/'));

  if (imageFiles.length > 0) {
    internalUpdateProgressCallback(5, 'Analyzing context images...');
    try {
      const imagePromises = imageFiles.map(fileToBasics);
      const imageDatas = await Promise.all(imagePromises);
      
      imageAnalysisResult = await generateStoreDetailsFromPhotos(imageDatas);

      if (imageAnalysisResult && !imageAnalysisResult.error) {
        console.log("[generateStoreFromPromptData] Image analysis successful:", imageAnalysisResult);
        internalUpdateProgressCallback(10, 'Image analysis complete.');
        // Augment the prompt with the analysis result
        finalPrompt += `\n\n--- AI Image Analysis Context ---\n${imageAnalysisResult.storePrompt}`;
        storeTypeFromAnalysis = imageAnalysisResult.productType;
      } else {
        console.warn("[generateStoreFromPromptData] Image analysis failed or returned an error:", imageAnalysisResult?.error);
        internalUpdateProgressCallback(10, 'Image analysis failed, continuing with prompt.');
      }
    } catch (error) {
      console.error("[generateStoreFromPromptData] Error during image analysis preparation:", error);
      internalUpdateProgressCallback(10, 'Image analysis failed, continuing with prompt.');
    }
  }
  
  // Append non-image file names for context, if any
  const nonImageFiles = contextFiles.filter(f => !f.type.startsWith('image/'));
  if (nonImageFiles.length > 0) {
    finalPrompt += "\n\n--- Additional Context Files ---\n" + nonImageFiles.map(f => f.name).join("\n");
  }

  const keywords = finalPrompt.toLowerCase().split(' ');

  // Determine storeType from nicheDetails if available, otherwise from prompt
  let storeType = 'general'; // Default
  if (storeTypeFromAnalysis) {
    storeType = storeTypeFromAnalysis;
  } else if (nicheDetails && nicheDetails.name) {
    // Map nicheDetails.name to a simplified storeType if needed, or use directly
    // For now, let's assume nicheDetails.name can be used or mapped to a 'type'
    // Example: if (nicheDetails.name === "Healthy Food") storeType = "food";
    // For simplicity, we'll use a generic approach or assume nicheDetails.name is suitable
    storeType = nicheDetails.name.toLowerCase().replace(/ /g, '-') || 'general';
  } else {
    // Fallback to keyword detection if nicheDetails not provided
    if (keywords.some(word => ['clothing', 'fashion', 'apparel', 'wear'].includes(word))) storeType = 'fashion';
    else if (keywords.some(word => ['tech', 'electronics', 'gadget', 'digital'].includes(word))) storeType = 'electronics';
    else if (keywords.some(word => ['food', 'grocery', 'meal', 'organic'].includes(word))) storeType = 'food';
    else if (keywords.some(word => ['jewelry', 'accessory', 'watch', 'luxury'].includes(word))) storeType = 'jewelry';
  }

  let brandName = storeNameOverride;
  let extractedNameResponse = null;

  if (!brandName && imageAnalysisResult && imageAnalysisResult.storeNameSuggestions && imageAnalysisResult.storeNameSuggestions.length > 0) {
    brandName = imageAnalysisResult.storeNameSuggestions[0];
    console.log(`[generateStoreFromPromptData] Using store name from image analysis: "${brandName}"`);
  }

  if (!brandName) {
    // Step 1: Try to extract name using Gemini Function Calling via extractExplicitStoreNameFromPrompt
    try {
      extractedNameResponse = await extractExplicitStoreNameFromPrompt(prompt);
      if (extractedNameResponse) {
        brandName = extractedNameResponse;
        console.log(`[generateStoreFromPromptData] Extracted store name via Gemini Function Calling: "${brandName}" (Raw response: "${extractedNameResponse}")`);
      }
    } catch (error) {
      console.error("[generateStoreFromPromptData] Error during Gemini function call for name extraction:", error);
      // Proceed to other methods if function calling fails
    }
  }

  // If brandName is still not set after override and function call, then proceed to AI suggestions and heuristics
  if (!brandName) { 
    try {
      console.log(`[generateStoreFromPromptData] No name from override or function call. Attempting AI name suggestion using prompt: "${prompt}"`);
      // Use internalUpdateProgressCallback for calls within this function
      internalUpdateProgressCallback(undefined, 'Suggesting store names...'); 
      const nameSuggestionsResult = await generateStoreNameSuggestions(prompt);
      if (nameSuggestionsResult && nameSuggestionsResult.suggestions && nameSuggestionsResult.suggestions.length > 0) {
        brandName = nameSuggestionsResult.suggestions[0];
        console.log(`[generateStoreFromPromptData] AI generated store name: ${brandName}`);
      } else {
        console.warn("[generateStoreFromPromptData] AI name generation yielded no suggestions. Falling back to heuristic.");
        const brandWordsHeuristic = prompt.split(' ').filter(word => word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 2);
        if (brandWordsHeuristic.length > 0) brandName = brandWordsHeuristic[0];
      }
    } catch (error) {
      console.error("[generateStoreFromPromptData] Error during AI store name generation:", error);
      const brandWordsHeuristic = prompt.split(' ').filter(word => word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 2);
      if (brandWordsHeuristic.length > 0) brandName = brandWordsHeuristic[0];
    }
  }
  
  // Final fallback if brandName is still not set after all attempts
  if (!brandName) {
    brandName = `${storeType.charAt(0).toUpperCase() + storeType.slice(1)} Emporium ${generateId().substring(0,4)}`;
    console.log(`[generateStoreFromPromptData] Using final fallback store name: ${brandName}`);
  }
  
  // Ensure brandName is not too long (this check should be after all assignments)
  if (brandName && brandName.length > 50) brandName = brandName.substring(0, 50);

  let logoImageBase64ForProductGen = null; // For passing to product generation
  let finalLogoUrlLight = null;
  let finalLogoUrlDark = null;
  let defaultDisplayLogoUrl = `https://via.placeholder.com/100x100.png?text=${brandName.substring(0, 1)}`;

  try {
    console.log(`[generateStoreFromPromptData] Generating logo for: ${brandName}`);
    internalUpdateProgressCallback(10, `Generating logo for ${brandName}...`);
    const logoPrompt = imageAnalysisResult?.logoDescription || finalPrompt;
    // Pass internalUpdateProgressCallback to sub-functions that might only update message
    const logoResults = await generateLogoWithGemini(logoPrompt, internalUpdateProgressCallback); 
    if (logoResults) {
      finalLogoUrlLight = logoResults.logoUrlLight;
      finalLogoUrlDark = logoResults.logoUrlDark;
      if (finalLogoUrlDark) defaultDisplayLogoUrl = finalLogoUrlDark; // Prefer dark logo for light backgrounds as default
      else if (finalLogoUrlLight) defaultDisplayLogoUrl = finalLogoUrlLight;
      
      // For product generation, pick one of the logos to pass as base64.
      // Prioritize the one for dark backgrounds (logoUrlLight) if available, as products might have varied backgrounds.
      const logoToUseForProducts = finalLogoUrlLight || finalLogoUrlDark;
      if (logoToUseForProducts && logoToUseForProducts.startsWith('data:image/')) {
        const parts = logoToUseForProducts.split(',');
        if (parts.length === 2) logoImageBase64ForProductGen = parts[1];
      }
      console.log(`[generateStoreFromPromptData] Logos generated for ${brandName}. Light: ${!!finalLogoUrlLight}, Dark: ${!!finalLogoUrlDark}`);
      updateProgressCallback(20, `${brandName} logo generated.`);
    } else {
      console.warn(`[generateStoreFromPromptData] Logo generation did not return expected result for ${brandName}.`);
      internalUpdateProgressCallback(20, `Logo generation issue for ${brandName}.`); // Still advance progress
    }
  } catch (error) {
    console.error(`[generateStoreFromPromptData] Error generating logo for ${brandName}:`, error);
    internalUpdateProgressCallback(20, `Error generating logo for ${brandName}.`); // Still advance
  }

  internalUpdateProgressCallback(25, `Generating ${storeType} products...`);
  const generatedProducts = [];
  const generatedProductTitles = []; 
  const productGenerationStartProgress = 25;
  const productGenerationTotalProgress = 45; // Allocate 45% for product generation (25% to 70%)

  if (generateProducts) {
    if (imageAnalysisResult && imageAnalysisResult.products && imageAnalysisResult.products.length > 0) {
      console.log("[generateStoreFromPromptData] Using products from image analysis.");
      internalUpdateProgressCallback(25, 'Populating products from image analysis...');
      
      imageAnalysisResult.products.forEach(p => {
          generatedProducts.push({
              id: `product-img-analysis-${generateId()}`,
              name: p.name,
              price: parseFloat(p.price) || 0,
              description: p.description,
              images: p.images, // This is an array with one base64 image
              image: {
                  id: generateId(),
                  src: { medium: p.images[0] },
                  alt: p.name,
              },
              rating: (Math.random() * 1.5 + 3.5).toFixed(1),
              stock: Math.floor(Math.random() * 80) + 20,
              variants: [], // Image analysis doesn't provide variants yet
          });
          generatedProductTitles.push(p.name.toLowerCase().trim());
      });
      internalUpdateProgressCallback(productGenerationStartProgress + productGenerationTotalProgress, `${generatedProducts.length} products populated from analysis.`);

    } else {
      const numProductsToGenerate = 6;
      const maxTotalAttempts = numProductsToGenerate * 2; 
      let currentAttempts = 0;

      console.log(`[generateStoreFromPromptData] Attempting to generate ${numProductsToGenerate} unique products for ${brandName} (type: ${storeType}).`);

      while (generatedProducts.length < numProductsToGenerate && currentAttempts < maxTotalAttempts) {
        currentAttempts++;
        const productProgress = productGenerationStartProgress + Math.floor((generatedProducts.length / numProductsToGenerate) * productGenerationTotalProgress);
        internalUpdateProgressCallback(productProgress, `Generating product ${generatedProducts.length + 1}/${numProductsToGenerate}...`);
        
        try {
          console.log(`[generateStoreFromPromptData] Generating product attempt ${currentAttempts} (aiming for ${generatedProducts.length + 1}/${numProductsToGenerate} unique products)... Excluding titles: ${generatedProductTitles.join(', ')}`);
          
          const singleProductData = await generateProductWithGemini(
            storeType, 
            brandName, 
            logoImageBase64ForProductGen, // Use the potentially available logo base64
            'image/png', // Assuming PNG if logo is passed
            generatedProductTitles,
            internalUpdateProgressCallback, // Pass internal callback
            productProgress, // Current base progress for this product
            productGenerationTotalProgress / numProductsToGenerate, // Progress increment per product step
            finalPrompt // Pass the full user prompt
          );
          
          // generateProductWithGemini now returns productData.images (array)
          if (singleProductData && 
              singleProductData.images && singleProductData.images.length > 0 &&
              singleProductData.title && singleProductData.title.trim() !== "" && 
              typeof singleProductData.price === 'string' && 
              typeof singleProductData.description === 'string') {
            const normalizedTitle = singleProductData.title.toLowerCase().trim();
            if (!generatedProductTitles.includes(normalizedTitle)) {
              let finalProductVariants = singleProductData.variants || [];

              if (storeType === 'fashion') {
                const hasSizeVariant = finalProductVariants.some(v => v.name.toLowerCase() === 'size');
                const hasColorVariant = finalProductVariants.some(v => v.name.toLowerCase() === 'color');
                if (!hasSizeVariant) {
                  finalProductVariants.push({ name: "Size", values: ["S", "M", "L", "XL"] });
                }
                if (!hasColorVariant) {
                  finalProductVariants.push({ name: "Color", values: ["White", "Black", "Blue", "Red"] });
                }
              }

              generatedProducts.push({
                id: `product-gemini-${generateId()}`,
                name: singleProductData.title,
                price: parseFloat(singleProductData.price) || 0,
                description: singleProductData.description,
                images: singleProductData.images, // Store the full images array
                image: { // For compatibility: primary image object
                  id: generateId(),
                  src: { medium: singleProductData.images[0] }, 
                  alt: singleProductData.title,
                },
                rating: (Math.random() * 1.5 + 3.5).toFixed(1),
                stock: Math.floor(Math.random() * 80) + 20,
                variants: finalProductVariants,
              });
              generatedProductTitles.push(normalizedTitle);
              console.log(`[generateStoreFromPromptData] Product "${singleProductData.title}" generated successfully and is unique. (${generatedProducts.length}/${numProductsToGenerate})`);
              internalUpdateProgressCallback(productGenerationStartProgress + Math.floor((generatedProducts.length / numProductsToGenerate) * productGenerationTotalProgress), `Product "${singleProductData.title}" generated.`);
            } else {
              console.warn(`[generateStoreFromPromptData] Duplicate product title generated and skipped: "${singleProductData.title}". Attempt ${currentAttempts}/${maxTotalAttempts}.`);
            }
          } else {
            console.warn(`[generateStoreFromPromptData] Failed to generate complete data (or image) for product attempt ${currentAttempts}. Data:`, singleProductData);
          }
        } catch (error) {
          console.error(`[generateStoreFromPromptData] Error during product generation attempt ${currentAttempts}:`, error);
        }
      }
      internalUpdateProgressCallback(productGenerationStartProgress + productGenerationTotalProgress, `${generatedProducts.length} products generated.`);

      if (generatedProducts.length < numProductsToGenerate) {
        console.warn(`[generateStoreFromPromptData] Could only generate ${generatedProducts.length} unique products after ${maxTotalAttempts} total attempts.`);
      }
      if (generatedProducts.length === 0 && numProductsToGenerate > 0) {
        console.warn(`[generateStoreFromPromptData] No products were generated successfully. The store will be created with an empty product list.`);
      }
    }
  }
  
  const collectionGenerationStartProgress = 70; // Progress after products
  const collectionGenerationTotalProgress = 20; // Allocate 20% for collections (70% to 90%)

  const heroSlideShowImagesCountPrompt = 3;
  const heroSlideShowImagesPrompt = await fetchPexelsImages(`${storeType} ${brandName} hero slideshow ${prompt}`, heroSlideShowImagesCountPrompt, 'landscape');
  const heroMainImagePrompt = heroSlideShowImagesPrompt.length > 0 ? heroSlideShowImagesPrompt[0] : { src: { large: 'https://via.placeholder.com/1200x800.png?text=Hero+Image' }, alt: 'Placeholder Hero Image' };
  
  const pexelsQueryResponse = await generatePexelsVideoQuery({ name: brandName, niche: storeType, description: finalPrompt });
  const pexelsQuery = pexelsQueryResponse.query || `${storeType} ${brandName} store ambiance ${prompt}`;

  const heroVideos = await fetchPexelsVideos(pexelsQuery, 1, 'landscape');
  const heroFollowUpVideos = await fetchPexelsVideos(`${brandName} ${storeType} product showcase`, 1, 'landscape');
  const videoLeftSectionVideos = await fetchPexelsVideos(`${brandName} ${storeType} craftsmanship process`, 1, 'landscape');
  
  const storeInfoForContent = {
    name: brandName,
    niche: storeType,
    description: finalPrompt, // Use the augmented prompt
    // targetAudience and style could be derived or set to defaults if needed by content functions
  };

  const generatedHeroContent = await generateHeroContent(storeInfoForContent);
  const generatedStoreWayContent = await generateStoreWayContent(storeInfoForContent);
  const generatedStoreFeaturesContent = await generateStoreFeaturesContent(storeInfoForContent);
  
  const baseAiContent = await generateAIStoreContent(storeType, brandName, finalPrompt);
  const cardBgImagesPrompt = await fetchPexelsImages(`${brandName} ${storeType} store background`, 1, 'landscape');
  const cardBackgroundUrlPrompt = cardBgImagesPrompt[0]?.src?.large || cardBgImagesPrompt[0]?.src?.original || '';

  let templateVersion = 'fresh'; // New Default: 'fresh'
  if (nicheDetails && nicheDetails.templates && nicheDetails.templates.length > 0) {
    const hasSharpTemplate = nicheDetails.templates.some(t => t.toLowerCase() === 'sharp');
    if (storeType === 'technology' && hasSharpTemplate) {
      templateVersion = 'sharp';
    } else {
      const firstTemplate = nicheDetails.templates[0].toLowerCase();
      if (['classic', 'modern', 'v1'].includes(firstTemplate)) {
        templateVersion = 'v1';
      } else if (firstTemplate === 'premium') {
        templateVersion = 'premium';
      } else if (firstTemplate === 'sharp') {
        // This case might be redundant if technology/sharp is handled above,
        // but good for explicitness if 'sharp' is first for a non-tech niche.
        templateVersion = 'sharp';
      } else if (firstTemplate === 'sleek') {
        templateVersion = 'sleek';
      }
      // If firstTemplate is 'fresh', it remains 'fresh' (the default).
      // If firstTemplate is unrecognized, it also remains 'fresh' (the default/fallback).
    }
  } else {
    // Fallback to prompt-based detection if nicheDetails are insufficient.
    // 'fresh' is the base default here.
    if (prompt.toLowerCase().includes('modern')) templateVersion = 'v1'; // modern still maps to v1
    else if (prompt.toLowerCase().includes('premium')) templateVersion = 'premium';
    else if (prompt.toLowerCase().includes('sharp')) templateVersion = 'sharp';
    else if (prompt.toLowerCase().includes('sleek')) templateVersion = 'sleek';
    // If no keywords match, it remains 'fresh'.
  }
  
  // Normalization for 'modern' to 'v1' (Classic) should still happen if 'modern' was set by prompt.
  // 'fresh' is a distinct template.
  if (templateVersion === 'modern') templateVersion = 'v1';


  let featuresVideoData = { url: null, poster: null };
  // Note: The logic for 'v1' and 'v2' for video URLs needs to be mapped to actual template names like 'sharp', 'fresh'
  // Assuming 'sharp' (which is often 'v1' internally) uses heroFollowUp and videoLeftSection
  // Assuming 'fresh' (which is often 'v2' internally) uses featuresVideo
  if (templateVersion === 'v2') { // Assuming 'v2' is 'fresh'
    const freshFeaturesVideos = await fetchPexelsVideos(`${brandName} ${storeType} customer experience why choose us`, 1, 'landscape');
    featuresVideoData.url = freshFeaturesVideos[0]?.url || null;
    featuresVideoData.poster = freshFeaturesVideos[0]?.image || null;
  }

  const generatedCollections = [];
  
  internalUpdateProgressCallback(95, "Loading storefront...");

  // Define storeToReturn in the main scope
  let storeToReturn = {
    id: storeId,
    name: brandName,
    template_version: templateVersion, 
    type: storeType,
    description: (generatedHeroContent && !generatedHeroContent.error ? generatedHeroContent.heroDescription : baseAiContent.heroDescription),
    prompt: finalPrompt,
    products: generatedProducts,
    collections: generatedCollections, 
    hero_image: heroMainImagePrompt,
    hero_video_url: heroVideos[0]?.url || null,
    hero_video_poster_url: heroVideos[0]?.image || null,
    logo_url: defaultDisplayLogoUrl, // Default display logo
    logo_url_light: finalLogoUrlLight, // Logo for dark backgrounds
    logo_url_dark: finalLogoUrlDark,   // Logo for light backgrounds
    theme: {
      primaryColor: nicheDetails?.primaryColor || (await generateThemeColors(storeInfoForContent)).primaryColor || getRandomColor(),
      secondaryColor: nicheDetails?.secondaryColor || (await generateThemeColors(storeInfoForContent)).secondaryColor || getRandomColor(),
      fontFamily: getRandomFont(), // Font could also be part of nicheDetails if desired
      layout: getRandomLayout(),   // Layout could also be part of nicheDetails
    },
    content: {
      ...baseAiContent, // Start with base content
      // Overwrite with more specific hero content if generated successfully
      ...(generatedHeroContent && !generatedHeroContent.error && { 
          heroTitle: generatedHeroContent.heroTitle || baseAiContent.heroTitle, 
          heroDescription: generatedHeroContent.heroDescription || baseAiContent.heroDescription 
      }),
      // Add storeWay content if generated successfully
      ...(generatedStoreWayContent && !generatedStoreWayContent.error && { storeWay: generatedStoreWayContent }),
      // Add storeFeatures content if generated successfully
      ...(generatedStoreFeaturesContent && !generatedStoreFeaturesContent.error && { storeFeatures: generatedStoreFeaturesContent }),
      heroSlideshowImages: heroSlideShowImagesPrompt.map(img => ({ src: img.src.large, alt: img.alt || brandName + " hero image" })),
      // Initialize sharp-specific sections, will be populated below if template is 'sharp'
      imageRightSection: null,
      videoLeftSection: null,
      // heroFollowUpVideoUrl and videoLeftSectionVideoUrl are now set conditionally based on templateVersion
    },
    data_source: 'ai',
    card_background_url: cardBackgroundUrlPrompt,
  };

  // Add Sharp-specific content if template is 'sharp'
  if (templateVersion === 'sharp') {
    const productExamplesForSharp = generatedProducts.slice(0, 3).map(p => p.name).join(', ');
    const irsContent = await generateImageRightSectionContent(storeInfoForContent, productExamplesForSharp);
    if (irsContent && !irsContent.error) {
      const pexelsImageQueryIRS = irsContent.title || `${brandName} craftsmanship`;
      const pexelsImagesIRS = await fetchPexelsImages(pexelsImageQueryIRS, 1, 'landscape');
      storeToReturn.content.imageRightSection = {
        ...irsContent,
        imageUrl: pexelsImagesIRS[0]?.src?.large || "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      };
    }

    const vlsContent = await generateVideoLeftSectionContent(storeInfoForContent, productExamplesForSharp);
    if (vlsContent && !vlsContent.error) {
      const pexelsVideoQueryVLS = vlsContent.title || `${brandName} product action`;
      const pexelsVideosVLS = await fetchPexelsVideos(pexelsVideoQueryVLS, 1, 'landscape');
      storeToReturn.content.videoLeftSection = {
        ...vlsContent,
        videoUrl: pexelsVideosVLS[0]?.url || null,
        videoPosterUrl: pexelsVideosVLS[0]?.image || null
      };
    }
    // Add heroFollowUpVideo and videoLeftSectionVideoUrl for sharp template (these were previously templateVersion === 'v1')
    storeToReturn.content.heroFollowUpVideoUrl = heroFollowUpVideos[0]?.url || null;
    storeToReturn.content.heroFollowUpVideoPosterUrl = heroFollowUpVideos[0]?.image || null;
    // Note: videoLeftSectionVideos was already fetched, its URL is in storeToReturn.content.videoLeftSection.videoUrl
    // If videoLeftSectionVideoUrl was meant to be a *different* video for sharp, it needs a separate Pexels fetch.
    // Assuming it's the same as the one in the videoLeftSection content object.
    
  } else if (templateVersion === 'fresh') { // Example for 'fresh' (mapped from 'v2')
     storeToReturn.content.featuresVideoUrl = featuresVideoData.url; // featuresVideoData was populated if templateVersion was 'v2'
     storeToReturn.content.featuresVideoPosterUrl = featuresVideoData.poster;
  }
  // Clear out unused video URLs based on final templateVersion
  if (templateVersion !== 'sharp') {
    storeToReturn.content.heroFollowUpVideoUrl = null;
    storeToReturn.content.heroFollowUpVideoPosterUrl = null;
    // videoLeftSection is part of content object, so it will be null if not sharp
  }
  if (templateVersion !== 'fresh') {
    storeToReturn.content.featuresVideoUrl = null;
    storeToReturn.content.featuresVideoPosterUrl = null;
  }

  return storeToReturn;
};

export const generateCollectionsForProducts = async (
  storeType,
  brandName,
  products,
  isPrintOnDemand,
  isDropshipping,
  updateProgressCallback,
  collectionGenerationStartProgress,
  collectionGenerationTotalProgress,
  generateId
) => {
  const generatedCollections = [];
  if (products.length > 0) {
    const numCollectionsToGenerate = isPrintOnDemand || isDropshipping ? 3 : 2;
    const existingCollectionNamesForPrompt = [];
    const maxAttempts = numCollectionsToGenerate * 2;
    let currentAttempt = 0;
    updateProgressCallback(collectionGenerationStartProgress, `Generating collections for products...`);
    console.log(`[generateCollectionsForProducts] Attempting to generate ${numCollectionsToGenerate} collections for ${brandName}.`);

    while (generatedCollections.length < numCollectionsToGenerate && currentAttempt < maxAttempts) {
      currentAttempt++;
      const collectionProgress = collectionGenerationStartProgress + Math.floor(((generatedCollections.length + 1) / numCollectionsToGenerate) * collectionGenerationTotalProgress);
      updateProgressCallback(collectionProgress, `Generating collection ${generatedCollections.length + 1}/${numCollectionsToGenerate} (Attempt ${currentAttempt})...`);

      try {
        const collectionData = await generateCollectionWithGemini(
          storeType,
          brandName,
          products,
          existingCollectionNamesForPrompt,
          updateProgressCallback,
          collectionProgress,
          collectionGenerationTotalProgress / numCollectionsToGenerate
        );

        if (collectionData && !collectionData.error && collectionData.name) {
          let finalCollectionImageUrl = '';
          if (collectionData.imageData) {
            finalCollectionImageUrl = `data:image/png;base64,${collectionData.imageData}`;
          } else {
            const pexelsQuery = `${collectionData.name} ${storeType} collection banner`;
            const pexelsImages = await utilFetchPexelsImages(pexelsQuery, 1, 'landscape');
            finalCollectionImageUrl = pexelsImages[0]?.src?.large || `https://via.placeholder.com/400x200.png?text=${encodeURIComponent(collectionData.name || "Collection")}`;
          }

          generatedCollections.push({
            id: `collection-gemini-${generateId()}`,
            name: collectionData.name,
            description: collectionData.description,
            imageUrl: finalCollectionImageUrl,
            product_ids: collectionData.product_ids || [],
          });
          existingCollectionNamesForPrompt.push(collectionData.name);
          updateProgressCallback(collectionProgress, `Collection "${collectionData.name}" generated.`);
        } else if (collectionData === null) {
          console.warn(`[generateCollectionsForProducts] Collection generation returned null (fallback prevented), attempt ${currentAttempt}.`);
        } else {
          console.warn(`[generateCollectionsForProducts] Failed to generate complete data for collection attempt ${currentAttempt}. Error: ${collectionData?.error}`);
        }
      } catch (error) {
        console.error(`[generateCollectionsForProducts] Error during collection generation attempt ${currentAttempt}:`, error);
      }
    }
    updateProgressCallback(collectionGenerationStartProgress + collectionGenerationTotalProgress, `${generatedCollections.length} collections generated.`);
  } else {
    console.warn(`[generateCollectionsForProducts] Skipping collection generation as no products were provided for ${brandName}.`);
    updateProgressCallback(collectionGenerationStartProgress + collectionGenerationTotalProgress, "Skipped collection generation (no products).");
  }
  return generatedCollections;
};

export const fetchShopifyStoreMetadata = async (domain, token) => {
    const shopData = await fetchShopifyStorefrontAPI(domain, token, GET_SHOP_METADATA_QUERY);
    return shopData.shop; 
};

export const fetchShopifyCollectionsList = async (domain, token, first = 10, cursor = null) => {
    const collectionsData = await fetchShopifyStorefrontAPI(domain, token, GET_COLLECTIONS_QUERY, { first, cursor });
    return collectionsData.collections; 
};

export const fetchShopifyProductsList = async (domain, token, first = 10, cursor = null) => {
    const productsData = await fetchShopifyStorefrontAPI(domain, token, GET_PRODUCTS_QUERY, { first, cursor });
    return productsData.products; 
};

export const fetchShopifyLocalizationInfo = async (domain, token, countryCode = "US", languageCode = "EN") => {
    const localizationData = await fetchShopifyStorefrontAPI(domain, token, GET_LOCALIZATION_INFO_QUERY, {});
    return localizationData.localization;
};

export const mapShopifyDataToInternalStore = async (shopifyStore, shopifyProducts, shopifyCollections, domain, { generateId = utilGenerateId } = {}, generatedLogoDataUrl = null) => {
    const mappedProducts = shopifyProducts.map(p => {
      // Get first variant for price and availability, or default
      const firstVariant = p.variants?.edges[0]?.node;
      // Get first image, or fallback to variant image, or placeholder
      const mainImageNode = p.images?.edges[0]?.node;
      const variantImageNode = firstVariant?.image;
      const imageUrl = mainImageNode?.url || variantImageNode?.url || `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(p.title || 'Product')}`;
      const imageAlt = mainImageNode?.altText || variantImageNode?.altText || p.title || 'Product image';

      return {
        id: p.id, 
        name: p.title || "Untitled Product",
        description: p.description ? p.description.substring(0, 500) + (p.description.length > 500 ? "..." : "") : 'No description available.', // Increased substring length
        price: parseFloat(firstVariant?.price?.amount || 0),
        currencyCode: firstVariant?.price?.currencyCode || 'USD',
        image: {
          id: mainImageNode?.id || variantImageNode?.id || generateId(),
          src: { medium: imageUrl },
          alt: imageAlt,
        },
        tags: p.tags || [], 
        availableForSale: firstVariant?.availableForSale || false,
        // Retain existing random data for rating and stock as Shopify API doesn't provide these directly
        rating: (Math.random() * 1.5 + 3.5).toFixed(1), 
        stock: Math.floor(Math.random() * 100) + 10, 
        // Store all variants if needed by internal model, or simplify as done
        // For now, keeping it simple based on current usage. If full variant data is needed:
        // variants: p.variants?.edges.map(vEdge => vEdge.node) || [], 
      };
    });

    const mappedCollections = shopifyCollections.map(c => ({
        id: c.id,
        name: c.title || "Untitled Collection", // Changed from title to name for consistency
        description: c.description || "",
        handle: c.handle,
        imageUrl: c.image?.url || `https://via.placeholder.com/400x200.png?text=${encodeURIComponent(c.title || "Collection")}`,
        // productCount: c.products?.edges?.length || 0, // This is from collection query, not always present on product's collection list
        // If products are directly linked in the collection node from Shopify:
        product_ids: c.products?.edges?.map(pEdge => pEdge.node.id) || [],
    }));
    
    // Corrected color access
    const primaryBgColor = shopifyStore.brand?.colors?.primary?.background || getRandomColor();
    const primaryFgColor = shopifyStore.brand?.colors?.primary?.foreground; // May not be used directly in theme if theme only takes BG
    const secondaryBgColor = shopifyStore.brand?.colors?.secondary?.background || getRandomColor();
    const secondaryFgColor = shopifyStore.brand?.colors?.secondary?.foreground;

    const heroImage = {
        id: generateId(),
        src: { large: shopifyStore.brand?.coverImage?.image?.url || `https://via.placeholder.com/1200x800.png?text=${encodeURIComponent(shopifyStore.name || 'Store')}` },
        alt: shopifyStore.brand?.coverImage?.image?.altText || shopifyStore.name || 'Store Cover Image',
    };
    
    // Use image.url as per updated GET_SHOP_METADATA_QUERY if it was changed, or keep existing if image.url is correct path
    const shopifyProvidedLogo = shopifyStore.brand?.logo?.image?.url || shopifyStore.brand?.squareLogo?.image?.url;
    const logoUrl = generatedLogoDataUrl || shopifyProvidedLogo || `https://via.placeholder.com/100x100.png?text=${(shopifyStore.name || "S").substring(0,1)}`;
    
    const aiContent = await generateAIStoreContent('general', shopifyStore.name || "Imported Store", shopifyStore.description);
    const featuresVideoShopify = await fetchPexelsVideos(aiContent.featuresVideoQuery, 1, 'landscape');
    aiContent.featuresVideoUrl = featuresVideoShopify[0]?.url || null;
    const cardBgImagesShopify = await utilFetchPexelsImages(`${shopifyStore.name || "store"} background`, 1, 'landscape');
    const cardBackgroundUrlShopify = cardBgImagesShopify[0]?.src?.large || cardBgImagesShopify[0]?.src?.original || '';

    return {
      id: `store-shopify-${(shopifyStore.primaryDomain?.host || domain || generateId()).replace(/\./g, '-')}-${generateId()}`,
      name: shopifyStore.name || "Imported Shopify Store",
      type: 'shopify-imported',
      description: shopifyStore.description || shopifyStore.brand?.shortDescription || shopifyStore.brand?.slogan || aiContent.heroDescription,
      products: mappedProducts, 
      collections: mappedCollections, // Added mapped collections
      hero_image: heroImage,
      logo_url: logoUrl,
      theme: {
        primaryColor: primaryBgColor,
        secondaryColor: secondaryBgColor,
        // Store foreground colors if your theme system uses them
        // primaryForegroundColor: primaryFgColor, 
        // secondaryForegroundColor: secondaryFgColor,
        fontFamily: getRandomFont(), 
        layout: getRandomLayout(),
      },
      content: {
          ...aiContent, 
          heroTitle: `Welcome to ${shopifyStore.name || "Our Store"}`,
          heroDescription: shopifyStore.description || shopifyStore.brand?.shortDescription || shopifyStore.brand?.slogan || aiContent.heroDescription,
          brandSlogan: shopifyStore.brand?.slogan,
          brandShortDescription: shopifyStore.brand?.shortDescription,
      },
      data_source: 'shopify',
      card_background_url: cardBackgroundUrlShopify,
      // Store raw Shopify brand colors if needed for more advanced theming later
      // shopifyBrandColors: shopifyStore.brand?.colors || null,
    };
};

export const importShopifyStoreData = async (domain, token, shopifyStoreRaw, shopifyProductsRaw, shopifyCollectionsRaw, { generateId = utilGenerateId } = {}) => {
    if (!shopifyStoreRaw || !shopifyProductsRaw || !shopifyCollectionsRaw) {
        console.warn("importShopifyStoreData called without pre-fetched data. Consider updating flow.");
        const tempShopData = await fetchShopifyStoreMetadata(domain, token);
        const tempProductsData = await fetchShopifyProductsList(domain, token, 250); 
        const tempCollectionsData = await fetchShopifyCollectionsList(domain, token, 50); 

        return await mapShopifyDataToInternalStore( 
            tempShopData, 
            tempProductsData.edges.map(e => e.node), 
            tempCollectionsData.edges.map(e => e.node), 
            domain, 
            { generateId }
        );
    }

    return await mapShopifyDataToInternalStore( 
        shopifyStoreRaw, 
        shopifyProductsRaw, 
        shopifyCollectionsRaw, 
        domain, 
        { generateId }
    );
};

export const mapBigCommerceDataToInternalStore = async (bcStoreSettings, bcProducts, domain, { generateId = utilGenerateId } = {}, generatedLogoDataUrl = null) => {
  console.log("Mapping BigCommerce Data:", { bcStoreSettings, bcProducts, domain, generatedLogoDataUrl });

  const mappedProducts = bcProducts.map(p => ({
    id: p.entityId?.toString() || `bc-product-${generateId()}`, 
    name: p.name || "Unnamed Product",
    description: p.description || `Product: ${p.name || "Unnamed Product"}`, 
    price: parseFloat(p.prices?.price?.value || 0),
    currencyCode: p.prices?.price?.currencyCode || 'USD',
    image: {
      id: `bc-img-${generateId()}`,
      src: { medium: p.defaultImage?.url || `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(p.name || "Product")}` },
      alt: p.defaultImage?.altText || p.name || "Product Image",
    },
    sku: p.sku || '',
    rating: (Math.random() * 1.5 + 3.5).toFixed(1), 
    stock: Math.floor(Math.random() * 100) + 10, 
  }));

  const aiCollectionsForBC = []; 

  const logoUrl = generatedLogoDataUrl || bcStoreSettings.logo?.image?.url || `https://via.placeholder.com/100x100.png?text=${(bcStoreSettings.storeName || "S").substring(0,1)}`;
  const aiContent = await generateAIStoreContent('general', bcStoreSettings.storeName || "My BigCommerce Store", bcStoreSettings.description);
  const featuresVideoBC = await fetchPexelsVideos(aiContent.featuresVideoQuery, 1, 'landscape');
  aiContent.featuresVideoUrl = featuresVideoBC[0]?.url || null;
  const cardBgImagesBC = await utilFetchPexelsImages(`${bcStoreSettings.storeName || "store"} background`, 1, 'landscape');
  const cardBackgroundUrlBC = cardBgImagesBC[0]?.src?.large || cardBgImagesBC[0]?.src?.original || '';

  return {
    id: `store-bc-${(bcStoreSettings.storeHash || domain).replace(/[\.\/\:]/g, '-')}-${generateId()}`,
    name: bcStoreSettings.storeName || "My BigCommerce Store",
    type: 'bigcommerce-imported',
    description: bcStoreSettings.description || `Store imported from ${domain}` || aiContent.heroDescription,
    products: mappedProducts,
    hero_image: { 
        id: generateId(),
        src: { large: bcStoreSettings.logo?.image?.url || `https://via.placeholder.com/1200x800.png?text=${encodeURIComponent(bcStoreSettings.storeName || "Store")}` }, 
        alt: bcStoreSettings.logo?.image?.altText || bcStoreSettings.storeName || "Store Hero"
    },
    logo_url: logoUrl,
    theme: {
      primaryColor: getRandomColor(),
      secondaryColor: getRandomColor(),
      fontFamily: getRandomFont(),
      layout: getRandomLayout(),
    },
    content: {
        ...aiContent,
        heroTitle: `Welcome to ${bcStoreSettings.storeName || "Our Store"}`,
        heroDescription: bcStoreSettings.description || aiContent.heroDescription,
    },
    data_source: 'bigcommerce',
    card_background_url: cardBackgroundUrlBC,
  };
};
<environment_details>
# VSCode Visible Files
src/contexts/storeActions.jsx

# VSCode Open Tabs
src/lib/ai/gemini-service.ts
src/lib/gemini-thinking.ts
src/app/api/generation-updates/route.ts
src/lib/geminiImageGeneration.js
src/lib/geminiLiveApi.js
src/components/store/template_v2/RealtimeChatbot.jsx
firebase.json
src/lib/firebase.js
.env.local
src/contexts/AuthContext.jsx
src/lib/shopify.jsx
src/app/api/import-shopify-store/route.ts
next.config.mjs
src/pages/AuthPage.jsx
src/components/store/premium/StoreHeader.jsx
src/components/store/premium/StoreHero.jsx
src/components/store/premium/ProductGrid.jsx
src/components/store/premium/ProductCard.jsx
src/components/store/premium/product/ProductCard.jsx
src/components/store/premium/Header.jsx
src/components/store/premium/Footer.jsx
src/components/store/premium/product/ProductHero.jsx
src/components/store/premium/layout/Navigation.jsx
src/components/store/premium/layout/Header.jsx
src/components/store/premium/product/ProductGrid.jsx
src/components/store/premium/product/QuickView.jsx
src/templates/premium/styles/animations.css
src/templates/premium/index.js
src/templates/premium/styles/premium.css
src/components/store/premium/ReplaceVideoModal.jsx
src/components/store/sharp/layout/StoreHeader.jsx
src/components/store/sharp/product/ProductCard.jsx
src/components/store/sharp/sections/HeroFollowUpVideo.jsx
src/components/store/fresh/layout/StoreHeader.jsx
src/components/store/fresh/product/ProductCard.jsx
src/pages/StorePreview.jsx
src/components/PreviewControls.jsx
src/components/store/premium/layout/Footer.jsx
src/components/store/sharp/layout/Footer.jsx
src/components/store/fresh/layout/Footer.jsx
src/components/store/premium/sections/Hero.jsx
src/components/store/premium/sections/CategoryShowcase.jsx
src/components/store/premium/sections/FeaturedProducts.jsx
src/components/store/premium/sections/Newsletter.jsx
src/components/store/sharp/sections/StoreHero.jsx
src/components/store/sharp/sections/ImageRightSection.jsx
src/components/store/sharp/sections/VideoLeftSection.jsx
src/components/store/sharp/sections/StoreFeatures.jsx
src/components/store/sharp/sections/Testimonials.jsx
src/components/store/sharp/sections/Newsletter.jsx
src/components/store/sharp/sections/ProductGrid.jsx
src/components/store/fresh/sections/StoreHero.jsx
src/components/store/fresh/sections/StoreFeatures.jsx
src/components/store/fresh/sections/ProductGrid.jsx
src/components/store/fresh/sections/Newsletter.jsx
src/contexts/StoreContext.jsx
src/components/store/premium/sections/SocialProof.jsx
src/lib/gemini.js
src/contexts/storeActions.jsx
vite.config.js
src/components/store/ChangeLogoModal.jsx
src/components/store/template_v2/StoreHero.jsx
src/components/product/GenerateProductVideoModal.jsx

# Current Time
5/25/2025, 4:33:50 PM (UTC, UTC+0:00)

# Context Window Usage
838,711 / 1,048.576K tokens used (80%)

# Current Mode
ACT MODE
</environment_details>
