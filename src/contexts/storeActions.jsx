import React from 'react';
import { 
    fetchPexelsImages as utilFetchPexelsImages, 
    generateId as utilGenerateId, 
    generateAIProductDescriptions, 
    generateAIStoreContent,
    fetchPexelsVideos // Import the new video fetching utility
} from '@/lib/utils';
// import { overlayLogoOnProductImage } from '@/lib/imageUtils'; // Will be replaced by generateProductWithGemini
import { generateLogoWithGemini } from '@/lib/geminiImageGeneration';
import { generateProductWithGemini } from '@/lib/geminiProductGeneration';
import { generateCollectionWithGemini } from '@/lib/geminiCollectionGeneration'; // Import for AI collection generation
import { generateStoreNameSuggestions, extractExplicitStoreNameFromPrompt } from '@/lib/gemini'; // Import for AI store name generation & extraction
import { 
    fetchShopifyStorefrontAPI, 
    GET_SHOP_METADATA_QUERY, 
    GET_PRODUCTS_QUERY,
    GET_COLLECTIONS_QUERY, // Added
    GET_LOCALIZATION_INFO_QUERY // Added
} from '@/lib/shopify';

const getRandomColor = () => ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#F97316'][Math.floor(Math.random() * 9)];
const getRandomFont = () => ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans'][Math.floor(Math.random() * 5)];
const getRandomLayout = () => ['grid', 'list'][Math.floor(Math.random() * 2)];


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
    if (wizardProducts.source === 'ai') {
      finalProducts = wizardProducts.items.map(item => ({
        id: `product-ai-${generateId()}`,
        name: item.name,
        price: parseFloat(item.price), 
        description: item.description,
        image: { 
          id: generateId(), 
          src: { medium: item.imageUrl }, 
          alt: item.name,
        },
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        stock: Math.floor(Math.random() * 80) + 20,
      }));
    } else if (wizardProducts.source === 'manual') {
      finalProducts = wizardProducts.items.map(p => ({
        id: `product-manual-${generateId()}`,
        name: p.name,
        price: parseFloat(p.price),
        description: p.description || generateAIProductDescriptions(productType, p.name),
        image: {
          id: generateId(),
          src: { medium: p.imageUrl || `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(p.name)}` },
          alt: p.name,
        },
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        stock: Math.floor(Math.random() * 50) + 20,
      }));
    }
    
    const heroSlideShowImagesCount = 3;
    const heroSlideShowImages = await fetchPexelsImages(`${productType} ${storeName} hero slideshow ${prompt}`, heroSlideShowImagesCount, 'landscape');
    const heroMainImage = heroSlideShowImages.length > 0 ? heroSlideShowImages[0] : { src: { large: 'https://via.placeholder.com/1200x800.png?text=Hero+Image' }, alt: 'Placeholder Hero Image' };

  const heroVideos = await fetchPexelsVideos(`${productType} ${storeName} store ambiance ${prompt}`, 1, 'landscape'); 
  const aiContent = generateAIStoreContent(productType, storeName);
    const cardBgImages = await fetchPexelsImages(`${storeName} ${productType} abstract background`, 1, 'landscape'); 
    const cardBackgroundUrl = cardBgImages[0]?.src?.large || cardBgImages[0]?.src?.original || '';
    const templateVersion = 'v1';


    return {
      id: storeId,
      name: storeName,
      template_version: templateVersion, 
      type: productType,
      description: aiContent.heroDescription,
      prompt: prompt || `A ${productType} store called ${storeName}`,
      products: finalProducts,
      collections: wizardData.collections.items.map(collection => ({ 
        id: `collection-wizard-${generateId()}`, 
        name: collection.name,
        description: collection.description,
        imageUrl: collection.imageUrl,
        product_ids: collection.product_ids || [], 
      })),
      hero_image: heroMainImage, 
      content: { 
        ...aiContent,
        heroSlideshowImages: heroSlideShowImages.map(img => ({ src: img.src.large, alt: img.alt || storeName + " hero image" })) 
      },
      hero_video_url: heroVideos[0]?.url || null,
      hero_video_poster_url: heroVideos[0]?.image || null,
      logo_url: logoUrl || `https://via.placeholder.com/100x100.png?text=${storeName.substring(0,1)}`,
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
    productTypeOverride = null,
    fetchPexelsImages = utilFetchPexelsImages, 
    generateId = utilGenerateId, 
  } = {}
) => {
  const storeId = `store-ai-${generateId()}`;
  const keywords = prompt.toLowerCase().split(' ');

  let storeType = productTypeOverride || 'general';
  if (!productTypeOverride) {
    if (keywords.some(word => ['clothing', 'fashion', 'apparel', 'wear'].includes(word))) storeType = 'fashion';
    else if (keywords.some(word => ['tech', 'electronics', 'gadget', 'digital'].includes(word))) storeType = 'electronics';
    else if (keywords.some(word => ['food', 'grocery', 'meal', 'organic'].includes(word))) storeType = 'food';
    else if (keywords.some(word => ['jewelry', 'accessory', 'watch', 'luxury'].includes(word))) storeType = 'jewelry';
  }

  let brandName = storeNameOverride;
  let extractedNameResponse = null;

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

  let logoImageBase64 = null;
  let actualLogoUrl = `https://via.placeholder.com/100x100.png?text=${brandName.substring(0, 1)}`;
  try {
    console.log(`[generateStoreFromPromptData] Generating logo for: ${brandName}`);
    const logoGenResult = await generateLogoWithGemini(brandName);
    if (logoGenResult && logoGenResult.imageData) {
      logoImageBase64 = logoGenResult.imageData;
      actualLogoUrl = `data:image/png;base64,${logoImageBase64}`;
      console.log(`[generateStoreFromPromptData] Logo generated successfully for ${brandName}.`);
    } else {
      console.warn(`[generateStoreFromPromptData] Logo generation did not return image data for ${brandName}. Text response: ${logoGenResult?.textResponse}`);
    }
  } catch (error) {
    console.error(`[generateStoreFromPromptData] Error generating logo for ${brandName}:`, error);
  }

  const generatedProducts = [];
  const generatedProductTitles = []; 
  const numProductsToGenerate = 6;
  const maxTotalAttempts = numProductsToGenerate * 2; 
  let currentAttempts = 0;

  console.log(`[generateStoreFromPromptData] Attempting to generate ${numProductsToGenerate} unique products for ${brandName} (type: ${storeType}).`);

  while (generatedProducts.length < numProductsToGenerate && currentAttempts < maxTotalAttempts) {
    currentAttempts++;
    try {
      console.log(`[generateStoreFromPromptData] Generating product attempt ${currentAttempts} (aiming for ${generatedProducts.length + 1}/${numProductsToGenerate} unique products)... Excluding titles: ${generatedProductTitles.join(', ')}`);
      
      const singleProductData = await generateProductWithGemini(
        storeType, 
        brandName, 
        logoImageBase64, 
        'image/png',
        generatedProductTitles 
      );
      
      if (singleProductData && singleProductData.imageData && singleProductData.title && singleProductData.price && singleProductData.description) {
        const normalizedTitle = singleProductData.title.toLowerCase().trim();
        if (!generatedProductTitles.includes(normalizedTitle)) {
          generatedProducts.push({
            id: `product-gemini-${generateId()}`,
            name: singleProductData.title,
            price: parseFloat(singleProductData.price) || 0,
            description: singleProductData.description,
            image: {
              id: generateId(),
              src: { medium: `data:image/png;base64,${singleProductData.imageData}` }, 
              alt: singleProductData.title,
            },
            rating: (Math.random() * 1.5 + 3.5).toFixed(1),
            stock: Math.floor(Math.random() * 80) + 20,
          });
          generatedProductTitles.push(normalizedTitle);
          console.log(`[generateStoreFromPromptData] Product "${singleProductData.title}" generated successfully and is unique. (${generatedProducts.length}/${numProductsToGenerate})`);
        } else {
          console.warn(`[generateStoreFromPromptData] Duplicate product title generated and skipped: "${singleProductData.title}". Attempt ${currentAttempts}/${maxTotalAttempts}.`);
        }
      } else {
        console.warn(`[generateStoreFromPromptData] Failed to generate complete data for product attempt ${currentAttempts}. Data:`, singleProductData);
      }
    } catch (error) {
      console.error(`[generateStoreFromPromptData] Error during product generation attempt ${currentAttempts}:`, error);
    }
  }

  if (generatedProducts.length < numProductsToGenerate) {
    console.warn(`[generateStoreFromPromptData] Could only generate ${generatedProducts.length} unique products after ${maxTotalAttempts} total attempts.`);
  }
  if (generatedProducts.length === 0 && numProductsToGenerate > 0) {
    console.warn(`[generateStoreFromPromptData] No products were generated successfully. The store will be created with an empty product list.`);
  }

  const heroSlideShowImagesCountPrompt = 3;
  const heroSlideShowImagesPrompt = await fetchPexelsImages(`${storeType} ${brandName} hero slideshow ${prompt}`, heroSlideShowImagesCountPrompt, 'landscape');
  const heroMainImagePrompt = heroSlideShowImagesPrompt.length > 0 ? heroSlideShowImagesPrompt[0] : { src: { large: 'https://via.placeholder.com/1200x800.png?text=Hero+Image' }, alt: 'Placeholder Hero Image' };
  
  const heroVideos = await fetchPexelsVideos(`${storeType} ${brandName} store ambiance ${prompt}`, 1, 'landscape'); 
  const aiContent = generateAIStoreContent(storeType, brandName);
  const cardBgImagesPrompt = await fetchPexelsImages(`${brandName} ${storeType} store background`, 1, 'landscape'); 
  const cardBackgroundUrlPrompt = cardBgImagesPrompt[0]?.src?.large || cardBgImagesPrompt[0]?.src?.original || '';
  const templateVersion = 'v1'; 

  const generatedCollections = [];
  const numCollectionsToGenerate = 3; 
  const existingCollectionNamesForPrompt = [];

  if (generatedProducts.length > 0) { 
    console.log(`[generateStoreFromPromptData] Attempting to generate ${numCollectionsToGenerate} collections for ${brandName}.`);
    for (let i = 0; i < numCollectionsToGenerate; i++) {
      try {
        console.log(`[generateStoreFromPromptData] Generating collection ${i + 1}/${numCollectionsToGenerate}...`);
        const collectionData = await generateCollectionWithGemini(
          storeType,
          brandName,
          generatedProducts, 
          existingCollectionNamesForPrompt
        );

        if (collectionData && !collectionData.error && collectionData.name) {
          let finalCollectionImageUrl = `https://via.placeholder.com/400x200.png?text=${encodeURIComponent(collectionData.name || "Collection")}`;
          if (collectionData.imageData) {
            finalCollectionImageUrl = `data:image/png;base64,${collectionData.imageData}`;
          }
          generatedCollections.push({
            id: `collection-gemini-${generateId()}`, 
            name: collectionData.name,
            description: collectionData.description,
            imageUrl: finalCollectionImageUrl, 
            product_ids: collectionData.product_ids || [], 
          });
          existingCollectionNamesForPrompt.push(collectionData.name);
          console.log(`[generateStoreFromPromptData] Collection "${collectionData.name}" generated with ${collectionData.product_ids?.length || 0} products.`);
        } else {
          console.warn(`[generateStoreFromPromptData] Failed to generate complete data for collection ${i + 1}. Error: ${collectionData?.error}`);
        }
      } catch (error) {
        console.error(`[generateStoreFromPromptData] Error during collection generation attempt ${i + 1}:`, error);
      }
    }
  } else {
    console.warn(`[generateStoreFromPromptData] Skipping collection generation as no products were generated for ${brandName}.`);
  }

  return {
    id: storeId,
    name: brandName,
    template_version: templateVersion, 
    type: storeType,
    description: aiContent.heroDescription,
    prompt,
    products: generatedProducts,
    collections: generatedCollections, 
    hero_image: heroMainImagePrompt,
    hero_video_url: heroVideos[0]?.url || null,
    hero_video_poster_url: heroVideos[0]?.image || null,
    logo_url: actualLogoUrl, 
    theme: {
      primaryColor: getRandomColor(),
      secondaryColor: getRandomColor(),
        fontFamily: getRandomFont(),
        layout: getRandomLayout(),
      },
      content: {
        ...aiContent,
        heroSlideshowImages: heroSlideShowImagesPrompt.map(img => ({ src: img.src.large, alt: img.alt || brandName + " hero image" }))
      },
      data_source: 'ai',
      card_background_url: cardBackgroundUrlPrompt,
    };
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
    const mappedProducts = shopifyProducts.map(p => ({
      id: p.id, 
      name: p.title,
      description: p.description ? p.description.substring(0,250) + (p.description.length > 250 ? "..." : "") : 'No description available.',
      price: parseFloat(p.variants?.edges[0]?.node.price?.amount || 0),
      currencyCode: p.variants?.edges[0]?.node.price?.currencyCode || 'USD',
      image: {
        id: p.images?.edges[0]?.node.id || generateId(),
        src: { medium: p.images?.edges[0]?.node.url || p.variants?.edges[0]?.node.image?.url || `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(p.title)}` },
        alt: p.images?.edges[0]?.node.altText || p.variants?.edges[0]?.node.image?.altText || p.title,
      },
      tags: p.tags, 
      availableForSale: p.variants?.edges[0]?.node.availableForSale,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1), 
      stock: Math.floor(Math.random() * 100) + 10, 
    }));

    const mappedCollections = shopifyCollections.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        handle: c.handle,
        productCount: c.products?.edges?.length || 0, 
    }));
    
    const primaryColor = shopifyStore.brand?.colors?.primary?.[0]?.background || getRandomColor();
    const heroImage = {
        id: generateId(),
        src: { large: shopifyStore.brand?.coverImage?.image?.url || `https://via.placeholder.com/1200x800.png?text=${encodeURIComponent(shopifyStore.name)}` },
        alt: shopifyStore.brand?.coverImage?.image?.altText || shopifyStore.name,
    };
    const shopifyProvidedLogo = shopifyStore.brand?.logo?.image?.url || shopifyStore.brand?.squareLogo?.image?.url;
    const logoUrl = generatedLogoDataUrl || shopifyProvidedLogo || `https://via.placeholder.com/100x100.png?text=${shopifyStore.name.substring(0,1)}`;
    const aiContent = generateAIStoreContent('general', shopifyStore.name); 
    const cardBgImagesShopify = await utilFetchPexelsImages(`${shopifyStore.name} background`, 1, 'landscape');
    const cardBackgroundUrlShopify = cardBgImagesShopify[0]?.src?.large || cardBgImagesShopify[0]?.src?.original || '';

    return {
      id: `store-shopify-${shopifyStore.primaryDomain.host.replace(/\./g, '-')}-${generateId()}`,
      name: shopifyStore.name,
      type: 'shopify-imported',
      description: shopifyStore.description || shopifyStore.brand?.shortDescription || shopifyStore.brand?.slogan || aiContent.heroDescription,
      products: mappedProducts, 
      hero_image: heroImage,
      logo_url: logoUrl,
      theme: {
        primaryColor: primaryColor,
        secondaryColor: shopifyStore.brand?.colors?.secondary?.[0]?.background || getRandomColor(),
        fontFamily: getRandomFont(), 
        layout: getRandomLayout(),
      },
      content: {
          ...aiContent, 
          heroTitle: `Welcome to ${shopifyStore.name}`,
          heroDescription: shopifyStore.description || shopifyStore.brand?.shortDescription || shopifyStore.brand?.slogan || aiContent.heroDescription,
          brandSlogan: shopifyStore.brand?.slogan,
          brandShortDescription: shopifyStore.brand?.shortDescription,
      },
      data_source: 'shopify',
      card_background_url: cardBackgroundUrlShopify
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
  const aiContent = generateAIStoreContent('general', bcStoreSettings.storeName || "My BigCommerce Store");
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
