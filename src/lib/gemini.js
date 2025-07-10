import { GoogleGenAI, Type } from "@google/genai"; // Changed SDK

// IMPORTANT: In a real application, use environment variables for API keys.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is not set. Please add it to your .env file. Store name suggestions will fail.");
  // No early return here, let the function handle the apiKey check
}

// Instantiate with the new SDK
// const genAI = new GoogleGenAI({ apiKey }); // Instantiated inside the function for clarity or if options change

export async function generateStoreNameSuggestions(promptContent) {
  if (!apiKey) {
    console.error("API Key not configured inside generateStoreNameSuggestions. Cannot generate suggestions.");
    return { error: "API Key not configured. Cannot generate suggestions." };
  }

  const genAI = new GoogleGenAI({ apiKey }); // Instantiate here

  const storeNameResponseSchema = {
    type: Type.ARRAY,
    items: { type: Type.STRING },
    description: "An array of 3 creative and catchy store name suggestions."
    // Consider adding minItems: 3, maxItems: 3 if strictness is needed and supported.
  };

  try {
    const fullPrompt = `Suggest 3 creative and catchy store name options based on the following store name: "${promptContent}". The suggestions should be relevant and similar. Return exactly 3 suggestions.`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [{ role: "user", parts: [{text: fullPrompt}]}],
      config: {
        responseMimeType: "application/json",
        responseSchema: storeNameResponseSchema,
      }
    });

    const responseText = response.text; // Assuming response.text or response.text() gives the JSON string
    if (typeof responseText !== 'string' || responseText.trim() === '') {
        console.error("Model did not return a text response for store name suggestions. Response:", JSON.stringify(response));
        throw new Error("Model response for store name suggestions was empty or not a string.");
    }

    try {
      const parsedSuggestions = JSON.parse(responseText);
      if (Array.isArray(parsedSuggestions) && parsedSuggestions.every(s => typeof s === 'string')) {
        return { suggestions: parsedSuggestions.slice(0, 3).map(s => s.trim()).filter(s => s.length > 0) };
      } else {
        console.error("Parsed store name suggestions are not an array of strings:", parsedSuggestions);
        return { error: "AI response was not in the expected format (array of strings)." , rawResponse: responseText};
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response for store names:", responseText, "ParseError:", parseError);
      return { error: "Failed to parse store name suggestions from AI.", rawResponse: responseText };
    }
  } catch (error) {
    console.error("Error generating store name suggestions:", error);
    return { error: `Error generating suggestions: ${error.message}` };
  }
}

export async function generateHeroContent(storeInfo) {
  if (!apiKey) {
    console.error("API Key not configured. Cannot generate hero content.");
    return { error: "API Key not configured." };
  }

  const genAI = new GoogleGenAI({ apiKey });

  const heroContentResponseSchema = {
    type: Type.OBJECT,
    properties: {
      heroTitle: { type: Type.STRING, description: 'The catchy hero title for the store.' },
      heroDescription: { type: Type.STRING, description: 'A short (1-2 sentences) engaging hero description.' },
    },
    required: ['heroTitle', 'heroDescription'],
  };

  const { name, niche, description, targetAudience, style } = storeInfo;

  let promptContent = `Generate a compelling hero title and a short, engaging hero description for an online store.
Store Name: ${name || 'N/A'}
Niche: ${niche || 'General E-commerce'}
Description/Keywords: ${description || 'A variety of products.'}
Target Audience: ${targetAudience || 'General consumers'}
Style/Vibe: ${style || 'Modern and friendly'}

Return the hero title and description as a JSON object matching the schema.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{text: promptContent}]}],
      config: {
        responseMimeType: "application/json",
        responseSchema: heroContentResponseSchema,
      }
    });

    const responseText = response.text;
    if (typeof responseText !== 'string' || responseText.trim() === '') {
        console.error("Model did not return a text response for hero content. Response:", JSON.stringify(response));
        throw new Error("Model response for hero content was empty or not a string.");
    }

    try {
      const parsedHeroContent = JSON.parse(responseText);
      if (parsedHeroContent && typeof parsedHeroContent.heroTitle === 'string' && typeof parsedHeroContent.heroDescription === 'string') {
        return { heroTitle: parsedHeroContent.heroTitle, heroDescription: parsedHeroContent.heroDescription };
      } else {
        console.error("Parsed hero content is not in the expected format:", parsedHeroContent);
        return { error: "AI response was not in the expected format for hero content." , rawResponse: responseText};
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response for hero content:", responseText, "ParseError:", parseError);
      return { error: "Failed to parse hero content from AI.", rawResponse: responseText };
    }
  } catch (error) {
    console.error("Error generating hero content:", error);
    return { error: `Error generating hero content: ${error.message}` };
  }
}

export async function generateImagePromptSuggestions(productInfo) {
  if (!apiKey) {
    console.error("API Key not configured. Cannot generate image prompt suggestions.");
    return { error: "API Key not configured." };
  }
  if (!productInfo || !productInfo.name) {
    console.error("Product information (at least name) is required for image prompt suggestions.");
    return { error: "Product information required." };
  }

  const genAI = new GoogleGenAI({ apiKey });

  const { name, description, niche, storeName } = productInfo;

  const imagePromptsResponseSchema = {
    type: Type.ARRAY,
    items: { type: Type.STRING },
    description: "An array of 6 diverse and creative text prompts for AI image generation related to a product."
    // Consider minItems: 6, maxItems: 6
  };
  
  let contextString = `product named "${name}"`;
  if (description) contextString += ` with description "${description}"`;
  if (storeName) contextString += ` from a store called "${storeName}"`;
  if (niche) contextString += ` in the "${niche}" niche`;

  const fullPrompt = `Based on a ${contextString}, generate 6 diverse and creative text prompts suitable for AI image generation. These prompts should aim to create visually appealing images for marketing this product. Examples: "A dynamic shot of [product name] on a clean, modern background with soft lighting", "Lifestyle image of [product name] being used by a happy customer in a [relevant setting]", "Close-up detail of [product name]'s unique feature with artistic blur". Return exactly 6 prompt suggestions.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{text: fullPrompt}]}],
      config: {
        responseMimeType: "application/json",
        responseSchema: imagePromptsResponseSchema,
      }
    });

    const responseText = response.text;
    if (typeof responseText !== 'string' || responseText.trim() === '') {
        console.error("Model did not return a text response for image prompt suggestions. Response:", JSON.stringify(response));
        throw new Error("Model response for image prompt suggestions was empty or not a string.");
    }

    try {
      const parsedPrompts = JSON.parse(responseText);
      if (Array.isArray(parsedPrompts) && parsedPrompts.every(s => typeof s === 'string')) {
        return { suggestions: parsedPrompts.slice(0, 6).map(s => s.trim()).filter(s => s.length > 0) };
      } else {
        console.error("Parsed image prompt suggestions are not an array of strings:", parsedPrompts);
        return { error: "AI response was not in the expected format for image prompts (array of strings)." , rawResponse: responseText};
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response for image prompt suggestions:", responseText, "ParseError:", parseError);
      return { error: "Failed to parse image prompt suggestions from AI.", rawResponse: responseText };
    }
  } catch (error) {
    console.error("Error generating image prompt suggestions:", error);
    return { error: `Error generating image prompt suggestions: ${error.message}` };
  }
}

export async function extractExplicitStoreNameFromPrompt(promptContent) {
  if (!apiKey) {
    console.error("API Key not configured. Cannot extract store name.");
    return null; // Return null or an object like { name: null, error: "API Key missing." }
  }

  const genAI = new GoogleGenAI({ apiKey });

  const extractStoreNameFunctionDeclaration = {
    name: 'extract_store_name',
    description: 'Extracts the desired store name if explicitly mentioned in the prompt using phrases like "store called \'My Store\'", "named \'My Store\'", or "store \'My Store\'". The name should be the direct object of such phrases.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        storeName: {
          type: Type.STRING,
          description: 'The explicitly mentioned name of the store.',
        },
      },
      required: ['storeName'],
    },
  };

  try {
    const result = await genAI
      .getGenerativeModel({ model: "gemini-pro" }) // Using gemini-pro as it's good for function calling
      .generateContent({
        contents: [{ role: "user", parts: [{text: promptContent}]}],
        tools: [{ functionDeclarations: [extractStoreNameFunctionDeclaration] }],
        // toolConfig: { functionCallingConfig: { mode: "ANY" } } // Optional: force a function call if appropriate
      });
    
    const response = result.response;
    const fc = response.functionCalls();

    if (fc && fc.length > 0 && fc[0].name === 'extract_store_name' && fc[0].args && fc[0].args.storeName) {
      console.log(`[extractExplicitStoreName] Gemini identified store name: ${fc[0].args.storeName}`);
      return fc[0].args.storeName;
    } else {
      console.log("[extractExplicitStoreName] Gemini did not identify an explicit store name via function call.");
      // console.log("Full response for debugging:", JSON.stringify(response, null, 2));
      return null;
    }
  } catch (error) {
    console.error("Error during Gemini store name extraction:", error);
    return null; // Indicate failure to extract
  }
}

export async function generateStoreWayContent(storeInfo) {
  if (!apiKey) {
    console.error("API Key not configured. Cannot generate store way content.");
    return { error: "API Key not configured." };
  }

  const genAI = new GoogleGenAI({ apiKey });

  const storeWayContentResponseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The main title for 'The [StoreName] Way' section (e.g., 'The AwesomeStore Way')." },
      subtitle: { type: Type.STRING, description: "A short, engaging subtitle for this section (1-2 sentences)." },
      items: {
        type: Type.ARRAY,
        description: "An array of 3 to 4 items representing the store's core values or unique selling points.",
        items: {
          type: Type.OBJECT,
          properties: {
            emoji: { type: Type.STRING, description: "A single relevant emoji for the item (e.g., '✨', '🌿')." },
            title: { type: Type.STRING, description: "A short title for the item (2-4 words)." },
            description: { type: Type.STRING, description: "A brief description of the item (10-20 words)." },
          },
          required: ['emoji', 'title', 'description'],
        },
        minItems: 3,
        maxItems: 4, // Keep it concise
      },
    },
    required: ['title', 'subtitle', 'items'],
  };

  const { name, niche, description, targetAudience, style } = storeInfo;
  const storeName = name || "Our Store"; // Fallback for prompt

  let promptContent = `Generate content for "The ${storeName} Way" section of an online store. This section highlights the store's core values and what makes it unique.
Store Name: ${storeName}
Niche: ${niche || 'General E-commerce'}
Description/Keywords: ${description || 'A variety of quality products.'}
Target Audience: ${targetAudience || 'General consumers'}
Style/Vibe: ${style || 'Modern and customer-focused'}

The content should include:
1.  A main title (e.g., "The ${storeName} Way"). This title should dynamically incorporate the actual store name.
2.  A short subtitle (1-2 sentences) that is specific and engaging for this store.
3.  3 to 4 items, each with:
    *   A unique and highly relevant emoji that visually represents the item's theme and is specific to this store's niche/style/keywords. This emoji is mandatory and must not be a generic placeholder. For example, if the store sells coffee, an emoji like ☕ or 🌿 (for organic beans) would be appropriate. If it's a tech store, 💡 or 🚀.
    *   A short, catchy title for the item (2-4 words, e.g., "Artisanal Roasts", "Cutting-Edge Tech"). This title must be specific to the store's theme.
    *   A brief description (10-20 words) elaborating on the item's title, specific to the store's values and offerings.

Return this content as a JSON object matching the schema. Ensure all text content and emojis are distinct, creative, and directly reflect the store's unique characteristics and offerings. Do not use generic examples in the output.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{text: promptContent}]}],
      config: {
        responseMimeType: "application/json",
        responseSchema: storeWayContentResponseSchema,
      }
    });

    const responseText = response.text;
    if (typeof responseText !== 'string' || responseText.trim() === '') {
        console.error("Model did not return a text response for store way content. Response:", JSON.stringify(response));
        throw new Error("Model response for store way content was empty or not a string.");
    }

    try {
      const parsedContent = JSON.parse(responseText);
      // Basic validation
      if (
        parsedContent &&
        typeof parsedContent.title === 'string' &&
        typeof parsedContent.subtitle === 'string' &&
        Array.isArray(parsedContent.items) &&
        parsedContent.items.length >= 3 && parsedContent.items.length <= 4 &&
        parsedContent.items.every(
          (item) =>
            typeof item.emoji === 'string' &&
            item.emoji.length > 0 && // Basic check for non-empty emoji
            typeof item.title === 'string' &&
            typeof item.description === 'string'
        )
      ) {
        // Ensure title is "The [StoreName] Way"
        parsedContent.title = `The ${storeName} Way`;
        return parsedContent;
      } else {
        console.error("Parsed store way content is not in the expected format:", parsedContent);
        return { error: "AI response was not in the expected format for store way content.", rawResponse: responseText };
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response for store way content:", responseText, "ParseError:", parseError);
      return { error: "Failed to parse store way content from AI.", rawResponse: responseText };
    }
  } catch (error) {
    console.error("Error generating store way content:", error);
    return { error: `Error generating store way content: ${error.message}` };
  }
}

export async function generateStoreFeaturesContent(storeInfo) {
  const defaultSecondaryFeatureItems = [
    { iconName: "Truck", title: "Fast Shipping", description: "Get your orders delivered quickly and reliably." },
    { iconName: "ShieldCheck", title: "Secure Payments", description: "Shop with confidence using our secure payment gateways." },
    { iconName: "MessageSquare", title: "24/7 Support", description: "Our dedicated team is here to help you around the clock." },
    { iconName: "Repeat", title: "Easy Returns", description: "Hassle-free return and exchange policy if you're not satisfied." },
    { iconName: "Award", title: "Quality Guaranteed", description: "We stand by the quality of our products." },
    { iconName: "Gift", title: "Gift Options", description: "Special gift wrapping and messaging available." }
  ];

  const defaultStatsItems = [
    { iconName: "Users", number: "10K+", label: "Active Users" },
    { iconName: "Star", number: "4.8", label: "Avg. Rating" },
    { iconName: "PackageCheck", number: "20K+", label: "Orders Shipped" },
    { iconName: "ShieldCheck", number: "100%", label: "Secure Checkout" },
    { iconName: "ThumbsUp", number: "95%", label: "Positive Feedback" },
    { iconName: "Globe", number: "Worldwide", label: "Shipping" }
  ];

  if (!apiKey) {
    console.error("API Key not configured. Cannot generate store features content.");
    return { error: "API Key not configured." };
  }

  const genAI = new GoogleGenAI({ apiKey });

  const storeFeaturesResponseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Main title for the features/experience section (e.g., 'An Exceptional Experience')." },
      subtitle: { type: Type.STRING, description: "Engaging subtitle for the features section (1-2 sentences)." },
      items: {
        type: Type.ARRAY,
        description: "An array of 3 to 4 feature items highlighting key store benefits.",
        items: {
          type: Type.OBJECT,
          properties: {
            emoji: { type: Type.STRING, description: "A single relevant emoji for the feature (e.g., '🛡️', '🌍', '💎')." },
            title: { type: Type.STRING, description: "Short title for the feature (2-4 words, e.g., 'Secure Payments', 'Global Reach')." },
            description: { type: Type.STRING, description: "Brief description of the feature (10-20 words)." },
          },
          required: ['emoji', 'title', 'description'],
        },
        minItems: 3,
        maxItems: 4,
      },
      secondaryItems: { // Added for the additional features grid
        type: Type.ARRAY,
        description: "An array of up to 4 secondary feature items highlighting broader store benefits or values. The function will ensure 4 items are present by adding defaults if needed.",
        items: {
          type: Type.OBJECT,
          properties: {
            iconName: { type: Type.STRING, description: "Name of a Lucide icon (e.g., 'GlobeIcon', 'AwardIcon', 'UsersIcon', 'HeartIcon') for the secondary feature." },
            title: { type: Type.STRING, description: "Short title for the secondary feature (2-4 words, e.g., 'Global Shipping', 'Quality Assured')." },
            description: { type: Type.STRING, description: "Brief description of the secondary feature (10-15 words)." },
          },
          required: ['iconName', 'title', 'description'],
        },
        minItems: 0, // Allow AI to return fewer, we will pad
        maxItems: 4,
      },
      statsItems: { // Added for the stats section
        type: Type.ARRAY,
        description: "An array of exactly 4 stat items highlighting key metrics or achievements.", // Updated description
        items: {
          type: Type.OBJECT,
          properties: {
            iconName: { type: Type.STRING, description: "Name of a Lucide icon for the stat (e.g., 'UsersIcon', 'StarIcon', 'ZapIcon')." },
            number: { type: Type.STRING, description: "The statistic value (e.g., '50K+', '99.9%', '4.9')." }, // Advised against symbols like ★
            label: { type: Type.STRING, description: "The label for the statistic (e.g., 'Happy Customers', 'Uptime', 'Average Rating')." },
          },
          required: ['iconName', 'number', 'label'],
        },
        minItems: 4, // Ensure 4 items
        maxItems: 4, // Ensure 4 items
      }
    },
    required: ['title', 'subtitle', 'items', 'secondaryItems', 'statsItems'],
  };

  const { name, niche, description, targetAudience, style } = storeInfo;
  const storeName = name || "Our Store";

  let promptContent = `Generate content for a store features section, often titled "An Exceptional Experience" or similar, for an online store named "${storeName}".
This section should highlight key benefits and unique selling propositions.
Store Name: ${storeName}
Niche: ${niche || 'General E-commerce'}
Description/Keywords: ${description || 'A variety of quality products.'}
Target Audience: ${targetAudience || 'General consumers'}
Style/Vibe: ${style || 'Modern and customer-focused'}

The content should include:
1.  A main title for the section (e.g., "Why Choose Us?", "Our Commitment to You", "An Exceptional Experience").
2.  A short, engaging subtitle (1-2 sentences).
3.  3 to 4 feature items, each with:
    *   A unique and highly relevant emoji that visually represents the feature (e.g., ✨ for innovation,  for eco-friendly,  for smart tech). This emoji is mandatory and must be specific to the feature's theme.
    *   A short, catchy, and descriptive title for the feature (2-5 words, e.g., "Innovative Designs", "Sustainable Materials", "Smart Home Solutions"). This title will be used to search for a relevant background video, so make it evocative. The features should be specific to the store's niche and not generic e-commerce benefits like "Fast Shipping" or "Secure Payments" unless they are a core, unique part of the brand.
    *   A brief description (10-20 words) explaining the benefit of the feature.
4.  Up to 4 secondary feature items (the system will ensure 4 by adding defaults if fewer are provided by AI), each with:
    *   An \`iconName\` string representing a Lucide icon (e.g., "GlobeIcon", "AwardIcon", "UsersIcon", "HeartIcon"). Choose an icon name that best fits the feature. Examples: GlobeIcon, AwardIcon, UsersIcon, HeartIcon, PackageIcon, ShieldIcon, ZapIcon.
    *   A short title for the secondary feature (2-4 words, e.g., "Global Shipping", "Quality Assured", "Community Love", "Eco-Friendly Focus").
    *   A brief description (10-15 words) for the secondary feature. These should highlight broader store values or benefits.
5.  Exactly 4 stat items, each with:
    *   An \`iconName\` string for a Lucide icon (e.g., "UsersIcon", "StarIcon", "ZapIcon", "PackageIcon").
    *   A \`number\` or key metric (e.g., "50K+", "99.9%", "4.9", "1M+"). Avoid including symbols like ★ in the number string itself.
    *   A descriptive \`label\` (e.g., "Happy Customers", "Uptime Guarantee", "Average Rating", "Units Sold").

Return this content as a JSON object matching the schema. Ensure all text content, emojis, and iconNames are distinct, creative, and directly reflect positive attributes of a store like "${storeName}". Do not use generic examples in the output. Examples of main features could be related to payment security, shipping, product quality, customer service. Secondary features could be about global reach, quality assurance, community, sustainability etc. Stats should reflect plausible achievements or service levels for a store selling "${niche || 'various items'}".`;


  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{text: promptContent}]}],
      config: {
        responseMimeType: "application/json",
        responseSchema: storeFeaturesResponseSchema,
      }
    });

    const responseText = response.text;
    if (typeof responseText !== 'string' || responseText.trim() === '') {
        console.error("Model did not return a text response for store features content. Response:", JSON.stringify(response));
        throw new Error("Model response for store features content was empty or not a string.");
    }

    try {
      const parsedContent = JSON.parse(responseText);
      if (
        parsedContent &&
        typeof parsedContent.title === 'string' &&
        typeof parsedContent.subtitle === 'string' &&
        Array.isArray(parsedContent.items) &&
        parsedContent.items.length >= 3 && parsedContent.items.length <= 4 &&
        parsedContent.items.every(
          (item) =>
            typeof item.emoji === 'string' && item.emoji.length > 0 &&
            typeof item.title === 'string' &&
            typeof item.description === 'string'
        )
      ) { 
        
        let currentSecondaryItems = [];
        if (parsedContent.secondaryItems && Array.isArray(parsedContent.secondaryItems)) {
          currentSecondaryItems = parsedContent.secondaryItems.filter(item => 
            item && typeof item.iconName === 'string' && item.iconName.length > 0 &&
            typeof item.title === 'string' && item.title.length > 0 &&
            typeof item.description === 'string' && item.description.length > 0
          ).slice(0, 4); 
        }
        
        const numSecondaryNeeded = 4 - currentSecondaryItems.length;
        if (numSecondaryNeeded > 0) {
          const secondaryTitlesFromAI = new Set(currentSecondaryItems.map(item => item.title));
          const secondaryFallbacksToAdd = defaultSecondaryFeatureItems
            .filter(fallback => !secondaryTitlesFromAI.has(fallback.title)) 
            .slice(0, numSecondaryNeeded);
          currentSecondaryItems.push(...secondaryFallbacksToAdd);
        }
        parsedContent.secondaryItems = currentSecondaryItems.slice(0, 4);

        let currentStatsItems = [];
        if (parsedContent.statsItems && Array.isArray(parsedContent.statsItems)) {
          currentStatsItems = parsedContent.statsItems.filter(item =>
            item && typeof item.iconName === 'string' && item.iconName.length > 0 &&
            typeof item.number === 'string' && item.number.length > 0 &&
            typeof item.label === 'string' && item.label.length > 0
          ).slice(0, 4);
        }

        const numStatsNeeded = 4 - currentStatsItems.length;
        if (numStatsNeeded > 0) {
          const statLabelsFromAI = new Set(currentStatsItems.map(item => item.label));
          const statsFallbacksToAdd = defaultStatsItems
            .filter(fallback => !statLabelsFromAI.has(fallback.label))
            .slice(0, numStatsNeeded);
          currentStatsItems.push(...statsFallbacksToAdd);
        }
        parsedContent.statsItems = currentStatsItems.slice(0, 4);


        // Final validation for all parts
        if (
          Array.isArray(parsedContent.secondaryItems) &&
          parsedContent.secondaryItems.every(
            (item) =>
              typeof item.iconName === 'string' && item.iconName.length > 0 &&
              typeof item.title === 'string' &&
              typeof item.description === 'string'
          ) &&
          Array.isArray(parsedContent.statsItems) && 
          parsedContent.statsItems.length === 4 && 
          parsedContent.statsItems.every(
            (item) =>
              typeof item.iconName === 'string' && item.iconName.length > 0 &&
              typeof item.number === 'string' && item.number.length > 0 &&
              typeof item.label === 'string' && item.label.length > 0
          )
        ) {
          return parsedContent;
        } else {
          console.error("Parsed store features content is not in the expected format after padding/validation:", parsedContent);
          // Attempt to return a minimally viable structure if specific parts failed but others are okay
          // This is a last resort to prevent total failure if some data is salvageable.
          if (!parsedContent.statsItems || parsedContent.statsItems.length !== 4) {
            console.warn("Stats items still not 4, forcing defaults for stats.");
            parsedContent.statsItems = defaultStatsItems.slice(0,4);
          }
          if (!parsedContent.secondaryItems || parsedContent.secondaryItems.length === 0) { // if empty, force some
             console.warn("Secondary items empty, forcing defaults for secondary.");
             parsedContent.secondaryItems = defaultSecondaryFeatureItems.slice(0,Math.min(4, defaultSecondaryFeatureItems.length));
          }
          // Only return if the core structure (title, subtitle, items) is still valid
          if (parsedContent.title && parsedContent.subtitle && parsedContent.items) {
            return parsedContent; 
          }
          return { error: "AI response format error after final processing.", rawResponse: responseText, processedContent: parsedContent };
        }
      } else {
         console.error("Initial parsed store features content structure is invalid:", parsedContent);
         return { error: "AI response (initial structure) was not in the expected format for store features content.", rawResponse: responseText };
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response for store features content:", responseText, "ParseError:", parseError);
      return { error: "Failed to parse store features content from AI.", rawResponse: responseText };
    }
  } catch (error) {
    console.error("Error generating store features content:", error);
    return { error: `Error generating store features content: ${error.message}` };
  }
}

export async function generateImageRightSectionContent(storeInfo) {
  if (!apiKey) {
    console.error("API Key not configured. Cannot generate ImageRightSection content.");
    return { error: "API Key not configured." };
  }
  const genAI = new GoogleGenAI({ apiKey });
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Catchy title for a section highlighting craftsmanship/quality (e.g., 'Our Commitment to Quality')." },
      subtitle: { type: Type.STRING, description: "Engaging subtitle (1-2 sentences) related to the title." },
      text: { type: Type.STRING, description: "Main descriptive text (2-3 sentences) about the store's dedication to quality, materials, or process." },
      listItems: {
        type: Type.ARRAY,
        description: "An array of 3-4 short bullet points (3-5 words each) highlighting key aspects (e.g., 'Premium Materials', 'Expert Craftsmanship').",
        items: { type: Type.STRING },
        minItems: 3,
        maxItems: 4,
      },
      ctaText: { type: Type.STRING, description: "Call to action button text (e.g., 'Explore Our Process', 'Learn More')." },
    },
    required: ['title', 'subtitle', 'text', 'listItems', 'ctaText'],
  };

  const { name, niche, description } = storeInfo; // productExamples is also passed but not destructured here.
  // The function signature in storeActions.jsx is generateImageRightSectionContent(storeInfoForSharp, productExamples)
  // So, I should accept productExamples as a second argument.
  // For now, I'll assume productExamples is part of storeInfo or implicitly used if description contains product info.
  // To make it more explicit, the caller (storeActions) should pass productExamples string to this function.
  // Let's assume storeInfo might contain productExamples or it's part of the description.
  // For better relevance, I'll adjust the prompt to use product examples if available.
  
  const productExamplesString = storeInfo.productExamples ? `Key products include: ${storeInfo.productExamples}.` : "The store offers a range of specialized gear.";

  const prompt = `Generate content for a website section for a store with a "sharp" and "tactical" aesthetic. This section has an image on the right and text on the left, emphasizing the store's precision, quality, craftsmanship, or unique process.
Store Name: "${name || 'Our Store'}"
Niche/Type: "${niche || 'high-performance gear'}"
Store Description: "${description || 'A store dedicated to excellence and precision.'}"
${productExamplesString}
Generate a title, subtitle, main text (2-3 sentences), 3-4 list items (3-5 words each), and a CTA button text.
The tone should be bold, confident, and precise, fitting a high-tech or tactical brand.
Focus on aspects like durability, advanced technology, expert design, or mission-readiness.
Return as a JSON object matching the schema.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{text: prompt}]}],
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    const responseText = response.text;
    if (!responseText?.trim()) throw new Error("Empty response from AI.");
    const parsed = JSON.parse(responseText);
    if (parsed.title && parsed.subtitle && parsed.text && Array.isArray(parsed.listItems) && parsed.listItems.length >= 3 && parsed.ctaText) {
      return parsed;
    }
    console.error("Invalid structure from AI for ImageRightSection:", parsed);
    return { error: "AI response format error for ImageRightSection.", rawResponse: responseText };
  } catch (error) {
    console.error("Error generating ImageRightSection content:", error);
    return { error: `Error generating ImageRightSection content: ${error.message}` };
  }
}

export async function generateVideoLeftSectionContent(storeInfo) {
  if (!apiKey) {
    console.error("API Key not configured. Cannot generate VideoLeftSection content.");
    return { error: "API Key not configured." };
  }
  const genAI = new GoogleGenAI({ apiKey });
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Catchy title for a section showcasing a product or brand story via video (e.g., 'Experience the Difference')." },
      subtitle: { type: Type.STRING, description: "Engaging subtitle (1-2 sentences) related to the video's theme." },
      text: { type: Type.STRING, description: "Main descriptive text (2-3 sentences) complementing the video." },
      listItems: {
        type: Type.ARRAY,
        description: "An array of 2-3 short bullet points (3-5 words each) highlighting key takeaways or features shown in a video.",
        items: { type: Type.STRING },
        minItems: 2,
        maxItems: 3,
      },
      ctaText: { type: Type.STRING, description: "Call to action button text (e.g., 'Watch Now', 'See It In Action')." },
    },
    required: ['title', 'subtitle', 'text', 'listItems', 'ctaText'],
  };

  const { name, niche, description } = storeInfo; // Similar to above, productExamples should be explicitly passed and used.
  const productExamplesStringVLS = storeInfo.productExamples ? `The video might showcase products like: ${storeInfo.productExamples}.` : "The video showcases our innovative products.";

  const prompt = `Generate content for a website section for a store with a "sharp" and "tactical" aesthetic. This section has a video on the left and text on the right, aiming to engage users with a dynamic visual story or product demonstration.
Store Name: "${name || 'Our Store'}"
Niche/Type: "${niche || 'cutting-edge solutions'}"
Store Description: "${description || 'A store focused on performance and innovation.'}"
${productExamplesStringVLS}
Generate a title, subtitle, main text (2-3 sentences), 2-3 list items (3-5 words each highlighting video takeaways), and a CTA button text.
The tone should be energetic, impactful, and forward-thinking, suitable for a high-performance brand.
Focus on action, benefits, or the experience the video portrays.
Return as a JSON object matching the schema.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{text: prompt}]}],
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    const responseText = response.text;
    if (!responseText?.trim()) throw new Error("Empty response from AI.");
    const parsed = JSON.parse(responseText);
    if (parsed.title && parsed.subtitle && parsed.text && Array.isArray(parsed.listItems) && parsed.listItems.length >= 2 && parsed.ctaText) {
      return parsed;
    }
    console.error("Invalid structure from AI for VideoLeftSection:", parsed);
    return { error: "AI response format error for VideoLeftSection.", rawResponse: responseText };
  } catch (error) {
    console.error("Error generating VideoLeftSection content:", error);
    return { error: `Error generating VideoLeftSection content: ${error.message}` };
  }
}

export async function generateProductDescription(productInfo, storeInfo) {
  if (!apiKey) {
    console.error("API Key not configured. Cannot generate product description.");
    return { error: "API Key not configured." };
  }

  const genAI = new GoogleGenAI({ apiKey });

  const descriptionResponseSchema = {
    type: Type.OBJECT,
    properties: {
      description: { type: Type.STRING, description: 'A compelling and SEO-friendly product description.' },
    },
    required: ['description'],
  };

  const { name: productName, description: existingDescription } = productInfo;
  const { name: storeName, niche, targetAudience, style } = storeInfo;

  let promptContent = `Generate a compelling, engaging, and SEO-friendly product description.
Store Name: ${storeName || 'N/A'}
Store Niche: ${niche || 'General E-commerce'}
Store Style: ${style || 'Modern and friendly'}
Target Audience: ${targetAudience || 'General consumers'}

Product Name: "${productName}"
${existingDescription ? `Existing Description (for context, improve upon it): "${existingDescription}"` : ''}

The new description should be persuasive, highlight key benefits, and be written in a tone that matches the store's style. It should be between 50 and 150 words.
Return the description as a JSON object matching the schema.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{text: promptContent}]}],
      config: {
        responseMimeType: "application/json",
        responseSchema: descriptionResponseSchema,
      }
    });

    const responseText = response.text;
    if (typeof responseText !== 'string' || responseText.trim() === '') {
        console.error("Model did not return a text response for product description. Response:", JSON.stringify(response));
        throw new Error("Model response for product description was empty or not a string.");
    }

    try {
      const parsedContent = JSON.parse(responseText);
      if (parsedContent && typeof parsedContent.description === 'string') {
        return { description: parsedContent.description };
      } else {
        console.error("Parsed product description is not in the expected format:", parsedContent);
        return { error: "AI response was not in the expected format for product description.", rawResponse: responseText };
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response for product description:", responseText, "ParseError:", parseError);
      return { error: "Failed to parse product description from AI.", rawResponse: responseText };
    }
  } catch (error) {
    console.error("Error generating product description:", error);
    return { error: `Error generating product description: ${error.message}` };
  }
}

export async function generatePexelsVideoQuery(storeInfo) {
  if (!apiKey) {
    console.error("API Key not configured. Cannot generate Pexels video query.");
    return { error: "API Key not configured." };
  }

  const genAI = new GoogleGenAI({ apiKey });

  const pexelsQueryResponseSchema = {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'A concise and relevant search query for Pexels videos.' },
    },
    required: ['query'],
  };

  const { name, niche, description } = storeInfo;

  let promptContent = `Generate a concise and relevant search query for Pexels videos for an online store.
Store Name: ${name || 'N/A'}
Niche: ${niche || 'General E-commerce'}
Description/Keywords: ${description || 'A variety of products.'}

The query should be 2-3 words and capture the essence of the store's brand and products.
Return the query as a JSON object matching the schema.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{text: promptContent}]}],
      config: {
        responseMimeType: "application/json",
        responseSchema: pexelsQueryResponseSchema,
      }
    });

    const responseText = response.text;
    if (typeof responseText !== 'string' || responseText.trim() === '') {
        console.error("Model did not return a text response for Pexels query. Response:", JSON.stringify(response));
        throw new Error("Model response for Pexels query was empty or not a string.");
    }

    try {
      const parsedContent = JSON.parse(responseText);
      if (parsedContent && typeof parsedContent.query === 'string') {
        return { query: parsedContent.query };
      } else {
        console.error("Parsed Pexels query is not in the expected format:", parsedContent);
        return { error: "AI response was not in the expected format for Pexels query.", rawResponse: responseText };
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response for Pexels query:", responseText, "ParseError:", parseError);
      return { error: "Failed to parse Pexels query from AI.", rawResponse: responseText };
    }
  } catch (error) {
    console.error("Error generating Pexels video query:", error);
    return { error: `Error generating Pexels video query: ${error.message}` };
  }
}

export async function generateThemeColors(storeInfo) {
  if (!apiKey) {
    console.error("API Key not configured. Cannot generate theme colors.");
    return { error: "API Key not configured." };
  }

  const genAI = new GoogleGenAI({ apiKey });

  const themeColorsResponseSchema = {
    type: Type.OBJECT,
    properties: {
      primaryColor: { type: Type.STRING, description: 'The hex code for the primary color.' },
      secondaryColor: { type: Type.STRING, description: 'The hex code for the secondary color.' },
    },
    required: ['primaryColor', 'secondaryColor'],
  };

  const { name, niche, description } = storeInfo;

  let promptContent = `Generate a primary and secondary color for a store's theme.
Store Name: ${name || 'N/A'}
Niche: ${niche || 'General E-commerce'}
Description/Keywords: ${description || 'A variety of products.'}

The colors should be represented as hex codes.
Return the colors as a JSON object matching the schema.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{text: promptContent}]}],
      config: {
        responseMimeType: "application/json",
        responseSchema: themeColorsResponseSchema,
      }
    });

    const responseText = response.text;
    if (typeof responseText !== 'string' || responseText.trim() === '') {
        console.error("Model did not return a text response for theme colors. Response:", JSON.stringify(response));
        throw new Error("Model response for theme colors was empty or not a string.");
    }

    try {
      const parsedContent = JSON.parse(responseText);
      if (parsedContent && typeof parsedContent.primaryColor === 'string' && typeof parsedContent.secondaryColor === 'string') {
        return { primaryColor: parsedContent.primaryColor, secondaryColor: parsedContent.secondaryColor };
      } else {
        console.error("Parsed theme colors are not in the expected format:", parsedContent);
        return { error: "AI response was not in the expected format for theme colors.", rawResponse: responseText };
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response for theme colors:", responseText, "ParseError:", parseError);
      return { error: "Failed to parse theme colors from AI.", rawResponse: responseText };
    }
  } catch (error) {
    console.error("Error generating theme colors:", error);
    return { error: `Error generating theme colors: ${error.message}` };
  }
}

export async function generateSearchQuery(promptContent) {
  if (!apiKey) {
    console.error("API Key not configured. Cannot generate search query.");
    return { error: "API Key not configured." };
  }

  const genAI = new GoogleGenAI({ apiKey });

  const searchQueryResponseSchema = {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'A concise and relevant search query.' },
    },
    required: ['query'],
  };

  try {
    const fullPrompt = `Analyze the following search query and return a more accurate and concise search query. For example, if the user searches for "something to restore my pots", you should return "rust remover".\n\nOriginal query: "${promptContent}"`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [{ role: "user", parts: [{text: fullPrompt}]}],
      config: {
        responseMimeType: "application/json",
        responseSchema: searchQueryResponseSchema,
      }
    });

    const responseText = response.text;
    if (typeof responseText !== 'string' || responseText.trim() === '') {
        console.error("Model did not return a text response for search query. Response:", JSON.stringify(response));
        throw new Error("Model response for search query was empty or not a string.");
    }

    try {
      const parsedQuery = JSON.parse(responseText);
      if (parsedQuery && typeof parsedQuery.query === 'string') {
        return { query: parsedQuery.query };
      } else {
        console.error("Parsed search query is not in the expected format:", parsedQuery);
        return { error: "AI response was not in the expected format (string)." , rawResponse: responseText};
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response for search query:", responseText, "ParseError:", parseError);
      return { error: "Failed to parse search query from AI.", rawResponse: responseText };
    }
  } catch (error) {
    console.error("Error generating search query:", error);
    return { error: `Error generating search query: ${error.message}` };
  }
}

export async function generateFilterTags(products) {
  if (!apiKey) {
    console.error("API Key not configured. Cannot generate filter tags.");
    return { error: "API Key not configured." };
  }

  const genAI = new GoogleGenAI({ apiKey });

  const filterTagsResponseSchema = {
    type: Type.ARRAY,
    items: { type: Type.STRING },
    description: "An array of filter tags based on the products."
  };

  try {
    const fullPrompt = `Analyze the following products and generate a list of relevant filter tags. The tags should be concise and based on common themes or categories found in the products.\n\nProducts:\n${JSON.stringify(products, null, 2)}`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [{ role: "user", parts: [{text: fullPrompt}]}],
      config: {
        responseMimeType: "application/json",
        responseSchema: filterTagsResponseSchema,
      }
    });

    const responseText = response.text;
    if (typeof responseText !== 'string' || responseText.trim() === '') {
        console.error("Model did not return a text response for filter tags. Response:", JSON.stringify(response));
        throw new Error("Model response for filter tags was empty or not a string.");
    }

    try {
      const parsedTags = JSON.parse(responseText);
      if (Array.isArray(parsedTags) && parsedTags.every(s => typeof s === 'string')) {
        return { tags: parsedTags.map(s => s.trim()).filter(s => s.length > 0) };
      } else {
        console.error("Parsed filter tags are not an array of strings:", parsedTags);
        return { error: "AI response was not in the expected format (array of strings)." , rawResponse: responseText};
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response for filter tags:", responseText, "ParseError:", parseError);
      return { error: "Failed to parse filter tags from AI.", rawResponse: responseText };
    }
  } catch (error) {
    console.error("Error generating filter tags:", error);
    return { error: `Error generating filter tags: ${error.message}` };
  }
}

export async function generateText(promptContent) {
  if (!apiKey) {
    console.error("API Key not configured. Cannot generate text.");
    return { error: "API Key not configured." };
  }

  const genAI = new GoogleGenAI({ apiKey });

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [{ role: "user", parts: [{text: promptContent}]}],
    });

    const responseText = response.text;
    if (typeof responseText !== 'string' || responseText.trim() === '') {
        console.error("Model did not return a text response. Response:", JSON.stringify(response));
        throw new Error("Model response was empty or not a string.");
    }
    return { text: responseText };
    
  } catch (error) {
    console.error("Error generating text:", error);
    return { error: `Error generating text: ${error.message}` };
  }
}
