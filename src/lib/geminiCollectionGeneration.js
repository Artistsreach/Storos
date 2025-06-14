import { GoogleGenAI, Modality } from "@google/genai";
// Pexels is no longer used for collection images.
// We'll use a Gemini image generation capability, similar to products/logos.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set. Please add it to your .env file.");
}

const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
 
/**
 * Generates collection data (name, description) and fetches a Pexels image.
 * @param {string} productType - The type of products in the store (e.g., "handmade jewelry").
 * @param {string} storeName - The name of the store.
 * @param {Array<object>} products - An array of existing products in the store.
 * @param {Array<string>} existingCollectionNames - An array of names of already generated collections.
 * @param {function} updateProgressCallback - Callback to update progress.
 * @param {number} baseCollectionProgress - Base progress for this specific collection generation.
 * @param {number} collectionStepProgressIncrement - Total progress allocated for this collection's steps.
 * @returns {Promise<object>} - A promise that resolves to an object containing collection data and image URL.
 */
export async function generateCollectionWithGemini(
  productType, 
  storeName, 
  products, 
  existingCollectionNames = [],
  updateProgressCallback = (progress, message) => console.log(`CollectionGen Progress: ${progress}%, Message: ${message || ''}`),
  baseCollectionProgress = 0,
  collectionStepProgressIncrement = 5 
) {
  if (!GEMINI_API_KEY) {
    // This is a critical configuration error, okay to return an error object.
    console.error("Gemini API Key not configured. Cannot generate collection.");
    updateProgressCallback(baseCollectionProgress + collectionStepProgressIncrement, "Collection generation failed (API Key).");
    return { error: "Gemini API Key not configured." };
  }

  const getFallbackCollection = () => {
    // Return null instead of a generic collection
    return null;
  };
 
  const productList = products && products.length > 0 ? products.map(p => `- ${p.name}: ${p.description || 'No description.'}`).filter(Boolean).join('\n') : 'various items';
  const existingNamesString = existingCollectionNames.length > 0 ? `Do NOT use any of the following names: ${existingCollectionNames.join(', ')}.` : '';

  const prompt = `
    You are an AI assistant for an e-commerce store named "${storeName}" that sells "${productType}".
    Based on the following products (name and description): 
${productList}
Suggest a compelling and UNIQUE collection name and a short, engaging description (max 2 sentences) for a new collection.
    The collection should group related products or highlight a specific theme.
    ${existingNamesString}
    Provide the output in a JSON format like this:
    {
      "name": "Collection Name",
      "description": "Collection Description",
      "product_names": ["Product Name 1", "Product Name 2"]
    }
    Ensure the collection name is concise, unique from the provided list (if any), and the description is appealing.
    The "product_names" array should contain a selection of 2 to 4 relevant product names from the provided product list that fit well within this new collection.
  `;
  updateProgressCallback(baseCollectionProgress + (collectionStepProgressIncrement * 0.1), `Generating collection details...`);

  try {
    const textGenerationResult = await genAI.models.generateContent({
        model: "gemini-2.0-flash", 
        contents: [{text: prompt}],
        config: {
             responseModalities: [Modality.TEXT],
        }
    });

    let text = "";
    if (textGenerationResult && textGenerationResult.candidates && textGenerationResult.candidates.length > 0 &&
        textGenerationResult.candidates[0].content && textGenerationResult.candidates[0].content.parts && textGenerationResult.candidates[0].content.parts.length > 0) {
      for (const part of textGenerationResult.candidates[0].content.parts) {
        if (part.text) {
          text += part.text; 
        }
      }
    }
    
    if (!text) { 
        console.error("Gemini text generation did not return any text content. Full response:", textGenerationResult);
        console.warn("Returning fallback collection due to no text from AI.");
        return getFallbackCollection();
    }

    let collectionData;
    try {
      // Attempt to parse the JSON. Gemini sometimes includes markdown.
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        collectionData = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback for cases where Gemini might not use markdown ```json
        try {
            collectionData = JSON.parse(text);
        } catch (e) {
            console.warn("Failed to parse Gemini response as JSON directly, trying to extract from text:", text);
            // Attempt to extract JSON if it's embedded or has surrounding text
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                const potentialJson = text.substring(firstBrace, lastBrace + 1);
                try {
                    collectionData = JSON.parse(potentialJson);
                } catch (finalParseError) {
                    console.error("Final attempt to parse extracted JSON failed:", potentialJson, finalParseError);
                    throw finalParseError; // Re-throw to be caught by outer try-catch, then return fallback
                }
            } else {
                 throw new Error("No valid JSON structure found in response."); // Caught by outer, then return fallback
            }
        }
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", text, parseError);
      console.warn("Returning fallback collection due to JSON parsing error.");
      return getFallbackCollection();
    }

    if (!collectionData || !collectionData.name || !collectionData.description || !Array.isArray(collectionData.product_names) || collectionData.product_names.length === 0) {
      console.error("AI did not return valid collection data (name, description, or non-empty product_names array):", collectionData);
      console.warn("Returning fallback collection due to invalid/incomplete AI data.");
      updateProgressCallback(baseCollectionProgress + (collectionStepProgressIncrement * 0.5), `Failed to get valid collection details.`);
      return getFallbackCollection();
    }
    updateProgressCallback(baseCollectionProgress + (collectionStepProgressIncrement * 0.5), `Collection details "${collectionData.name}" received.`);

    // Helper function to normalize product names for more robust matching
    const normalizeProductName = (name) => {
      if (typeof name !== 'string') return '';
      let normalized = name.toLowerCase();
      // Remove common articles
      normalized = normalized.replace(/\b(a|an|the)\b/g, '');
      // Basic pluralization removal (e.g., "mugs" -> "mug")
      if (normalized.endsWith('s') && normalized.length > 3) {
        // More sophisticated pluralization could be added if needed
        // For now, simple 's' removal for words longer than 3 chars
        const singularAttempt = normalized.slice(0, -1);
        // A very basic check to avoid turning "series" into "serie" if "serie" isn't a word.
        // This is imperfect. A dictionary or more advanced NLP would be better for production.
        // For now, we'll accept the simple 's' removal.
        normalized = singularAttempt;
      }
      // Remove non-alphanumeric characters (except spaces) and collapse multiple spaces
      normalized = normalized.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
      return normalized;
    };

    // Map product names from AI response back to product IDs using normalized names
    const productIdsForCollection = [];
    if (collectionData.product_names && products) {
      collectionData.product_names.forEach(aiProductName => {
        const normalizedAiProductName = normalizeProductName(aiProductName);
        if (!normalizedAiProductName) {
          console.warn(`AI product name "${aiProductName}" normalized to an empty string. Skipping.`);
          return;
        }

        let foundProduct = null;
        // Try to find an exact match on normalized names first
        foundProduct = products.find(p => normalizeProductName(p.name) === normalizedAiProductName);

        // If no exact normalized match, try a 'contains' match as a fallback
        // This is more lenient and might catch cases where AI adds/removes minor words
        if (!foundProduct) {
          foundProduct = products.find(p => {
            const normalizedExistingProductName = normalizeProductName(p.name);
            return normalizedExistingProductName.includes(normalizedAiProductName) || normalizedAiProductName.includes(normalizedExistingProductName);
          });
        }

        if (foundProduct && foundProduct.name) { // Check for foundProduct.name as products in StoreWizard might not have an ID yet
          productIdsForCollection.push(foundProduct.name); // Push the name, as this is the identifier available at this stage
          console.log(`Matched AI product "${aiProductName}" (normalized: "${normalizedAiProductName}") to existing product "${foundProduct.name}" (using name as ID)`);
        } else {
          console.warn(`Product name "${aiProductName}" (normalized: "${normalizedAiProductName}") from AI response not found in provided product list or missing name after normalization and fallback search.`);
        }
      });
    }
    
    // Now, generate an image using Gemini based on the collection name and description
    const imagePrompt = `A vibrant and appealing e-commerce collection image for "${collectionData.name}", described as "${collectionData.description}", suitable for a store selling ${productType}.`;
    let imageData = null;
    updateProgressCallback(baseCollectionProgress + (collectionStepProgressIncrement * 0.6), `Generating image for collection "${collectionData.name}"...`);
    try {
      const imageContents = [{ text: imagePrompt }];
      const imageResponse = await genAI.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: imageContents,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE], 
        },
      });

      if (imageResponse && imageResponse.candidates && imageResponse.candidates.length > 0 && 
          imageResponse.candidates[0].content && imageResponse.candidates[0].content.parts && imageResponse.candidates[0].content.parts.length > 0) {
        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data; 
            break; 
          }
        }
      }
      if (!imageData) {
         console.warn(`Gemini image generation did not return image data for collection: "${collectionData.name}". Full Response:`, imageResponse);
         updateProgressCallback(undefined, `Image generation failed for collection "${collectionData.name}".`);
      } else {
         updateProgressCallback(undefined, `Image generated for collection "${collectionData.name}".`);
      }
    } // Closing brace for the try block related to image generation
    catch (imgError) {
      console.error(`Error generating image for collection "${collectionData.name}" with Gemini:`, imgError);
      updateProgressCallback(undefined, `Error generating image for collection "${collectionData.name}".`);
    }
    
    updateProgressCallback(baseCollectionProgress + collectionStepProgressIncrement, `Collection "${collectionData.name}" processing complete.`);
    return {
      name: collectionData.name,
      description: collectionData.description,
      imageData: imageData, // Return base64 image data
      product_ids: productIdsForCollection,
    };

  } catch (error) {
    console.error("Error generating collection with Gemini:", error);
    console.warn("Returning fallback collection due to an unexpected error in generation process.");
    updateProgressCallback(baseCollectionProgress + collectionStepProgressIncrement, "Collection generation failed (unexpected error).");
    return getFallbackCollection();
  }
}
