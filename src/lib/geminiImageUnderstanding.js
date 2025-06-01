import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is not set in geminiImageUnderstanding.js. AI image analysis will fail.");
}

/**
 * Analyzes uploaded product photos using Gemini to extract store details.
 * 
 * @param {Array<Object>} images - Array of image objects, each with { base64, mimeType, name }.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *  - productType (string)
 *  - storeNameSuggestions (Array<string>)
 *  - logoDescription (string) - A description for a logo.
 *  - products (Array<Object>) - Each product with { originalImageName, name, price, description, images: [base64 of original image] }
 *  - collections (Array<Object>) - Each collection with { name, description }
 *  - storePrompt (string) - An overall store description for the final wizard step.
 *  - error (string|null) - Error message if something went wrong.
 */
export const generateStoreDetailsFromPhotos = async (images) => {
  if (!images || images.length === 0) {
    return { error: "No images provided for analysis." };
  }
  if (!apiKey) {
    console.error("API Key not configured for Gemini. Cannot analyze images.");
    return { error: "API Key not configured. Cannot analyze images." };
  }

  const genAI = new GoogleGenAI({ apiKey });

  const imageParts = images.map(image => {
    if (!image.base64 || !image.mimeType) {
      console.error("Image object is missing base64 or mimeType:", image.name);
      // Instead of throwing, let's filter out problematic images or return an error earlier.
      // For now, this function expects valid image objects.
      // Consider adding a pre-validation step or handling this more gracefully if partial success is desired.
      throw new Error(`Image ${image.name} is missing data for AI processing.`);
    }
    const base64Data = image.base64.startsWith('data:') ? image.base64.split(',')[1] : image.base64;
    return {
      inlineData: {
        data: base64Data,
        mimeType: image.mimeType,
      },
    };
  });

  const textPrompt = `
    Analyze the following product images (${images.map(img => img.name).join(', ')}). 
    Based on these images, provide the following details for setting up an e-commerce store.
    Please format your response as a single, valid JSON object with the exact keys specified below.

    1.  "productType": A concise category or niche for these products (e.g., "Handcrafted Leather Goods", "Vintage Streetwear", "Artisanal Coffee Beans").
    2.  "storeNameSuggestions": An array of 3-5 creative and relevant store name suggestions.
    3.  "logoDescription": A brief description of a suitable logo concept (e.g., "A minimalist line art of a coffee bean with earthy tones").
    4.  "products": An array of objects, one for each uploaded image. For each product, analyze its specific image content to generate the following:
        *   "originalImageName": The filename of the original image (use the names provided in this prompt, e.g., "${images[0]?.name || 'example_image.jpg'}").
        *   "name": A catchy and descriptive product name directly inspired by the visual details in THIS specific image.
        *   "price": A suggested retail price for THIS specific product, considering its appearance and likely category (e.g., "29.99"). Ensure this is a string representing a number.
        *   "description": A compelling product description (2-3 sentences) highlighting key visual features and benefits of THIS specific product shown in its image.
    5.  "collections": An array of 3 distinct collection suggestions, each with:
        *   "name": Collection name (e.g., "New Arrivals", "Essentials", "Gifts Under $50").
        *   "description": A brief description for the collection.
    6.  "storePrompt": A short paragraph describing the overall style, feel, and target audience for a store selling these products. This will be used as a base for further AI generation of store content.

    Example for a single product in the "products" array:
    {
      "originalImageName": "${images[0]?.name || 'example_image.jpg'}",
      "name": "Rustic Leather Wallet",
      "price": "45.00",
      "description": "Hand-stitched full-grain leather wallet with a timeless design. Perfect for everyday carry, offering both style and durability."
    }
  `;

  const storeDetailsResponseSchema = {
    type: Type.OBJECT,
    properties: {
      productType: { type: Type.STRING },
      storeNameSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      logoDescription: { type: Type.STRING },
      products: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            originalImageName: { type: Type.STRING },
            name: { type: Type.STRING },
            price: { type: Type.STRING }, // Price as string
            description: { type: Type.STRING },
          },
          required: ['originalImageName', 'name', 'price', 'description'],
        },
      },
      collections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ['name', 'description'],
        },
      },
      storePrompt: { type: Type.STRING },
    },
    required: ['productType', 'storeNameSuggestions', 'logoDescription', 'products', 'collections', 'storePrompt'],
  };

  try {
    console.log("[geminiImageUnderstanding] Sending prompt to Gemini with images:", images.map(i => i.name));
    
    const apiCallResponse = await genAI.models.generateContent({
      model: "gemini-2.0-flash", // Using model from user docs and project's gemini.js
      contents: [{ role: "user", parts: [{text: textPrompt}, ...imageParts] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: storeDetailsResponseSchema,
      }
    });

    console.log("[geminiImageUnderstanding] Full API call response object:", JSON.stringify(apiCallResponse, null, 2));

    // Check if apiCallResponse itself and its .text property are valid
    // This aligns with how gemini.js handles the response from generateContent
    if (!apiCallResponse || typeof apiCallResponse.text !== 'string') {
        let errorDetail = "Invalid or missing response from API.";
        if (apiCallResponse && apiCallResponse.promptFeedback && apiCallResponse.promptFeedback.blockReason) {
            errorDetail = `Request blocked: ${apiCallResponse.promptFeedback.blockReason}. ${apiCallResponse.promptFeedback.blockReasonMessage || ''}`;
             console.error(`[geminiImageUnderstanding] Request blocked. Reason: ${apiCallResponse.promptFeedback.blockReason}, Message: ${apiCallResponse.promptFeedback.blockReasonMessage}`);
        } else if (apiCallResponse && apiCallResponse.candidates && apiCallResponse.candidates.length > 0 && apiCallResponse.candidates[0].finishReason !== 'STOP' && apiCallResponse.candidates[0].finishReason !== 'MODEL_SPECIFIED_STOP') {
             errorDetail = `Generation stopped for reason: ${apiCallResponse.candidates[0].finishReason}.`;
             console.error(`[geminiImageUnderstanding] Generation stopped. Reason: ${apiCallResponse.candidates[0].finishReason}`);
        } else {
            console.error("[geminiImageUnderstanding] API response is invalid or text property is missing/not a string. Full response:", apiCallResponse);
        }
        return { error: `AI analysis failed: ${errorDetail}` };
    }
    
    const responseText = apiCallResponse.text; 

    if (responseText.trim() === '') {
      console.error("[geminiImageUnderstanding] Model did not return a text response (empty string). Full API Response:", JSON.stringify(apiCallResponse));
      return { error: "AI analysis failed: Model response was empty or not text." };
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      console.error("[geminiImageUnderstanding] Failed to parse Gemini JSON response:", responseText, "ParseError:", e);
      return { error: "AI analysis failed: Could not understand the response from Gemini (invalid JSON)." };
    }

    if (!parsedResponse.productType || !Array.isArray(parsedResponse.storeNameSuggestions) || !Array.isArray(parsedResponse.products) || !Array.isArray(parsedResponse.collections) || !parsedResponse.storePrompt) {
        console.error("[geminiImageUnderstanding] Gemini response missing required fields or incorrect types:", parsedResponse);
        return { error: "AI analysis failed: The response from Gemini was incomplete or malformed." };
    }
    
    const finalProducts = parsedResponse.products.map(p => {
        let productImages = [];
        let productName = "Untitled Product (AI)";
        let productPrice = "0.00";
        let productDescription = "No description provided by AI.";
        let originalName = null;

        if (p && typeof p === 'object') {
            productName = p.name || productName;
            productPrice = p.price || productPrice;
            productDescription = p.description || productDescription;
            originalName = p.originalImageName || null;

            if (typeof p.originalImageName === 'string') {
                const originalImage = images.find(img => img && img.name === p.originalImageName);
                if (originalImage && typeof originalImage.base64 === 'string') {
                    productImages = [originalImage.base64];
                } else {
                    console.warn(`[geminiImageUnderstanding] Original image or its base64 not found for product with AI-provided originalImageName: "${p.originalImageName}". AI Product Name: "${p.name}"`);
                }
            } else {
                console.warn(`[geminiImageUnderstanding] Product item from AI is missing 'originalImageName' string or is invalid:`, p);
            }
        } else {
            console.warn(`[geminiImageUnderstanding] Invalid product item received from AI (not an object):`, p);
        }

        return {
            ...(p && typeof p === 'object' ? p : {}), 
            name: productName,
            price: productPrice,
            description: productDescription,
            originalImageName: originalName, 
            images: productImages, 
        };
    });

    return {
      productType: parsedResponse.productType,
      storeNameSuggestions: parsedResponse.storeNameSuggestions,
      logoDescription: parsedResponse.logoDescription,
      products: finalProducts,
      collections: parsedResponse.collections,
      storePrompt: parsedResponse.storePrompt,
      error: null,
    };

  } catch (error) {
    console.error("[geminiImageUnderstanding] Error calling Gemini API or processing response:", error);
    return { error: `AI analysis API call failed: ${error.message}` };
  }
};
