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
 * @returns {Promise<object>} - A promise that resolves to an object containing collection data and image URL.
 */
export async function generateCollectionWithGemini(productType, storeName, products, existingCollectionNames = []) {
  if (!GEMINI_API_KEY) {
    return { error: "Gemini API Key not configured." };
  }
 
  const productList = products.map(p => p.name).join(', ');
  const existingNamesString = existingCollectionNames.length > 0 ? `Do NOT use any of the following names: ${existingCollectionNames.join(', ')}.` : '';

  const prompt = `
    You are an AI assistant for an e-commerce store named "${storeName}" that sells "${productType}".
    Based on the following products: ${productList}, suggest a compelling and UNIQUE collection name and a short, engaging description (max 2 sentences) for a new collection.
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
        return { error: "Failed to parse AI response for collection data (no text found)." };
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
            console.error("Failed to parse Gemini response as JSON directly, trying to extract from text:", text);
            // Attempt to extract JSON if it's embedded or has surrounding text
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                const potentialJson = text.substring(firstBrace, lastBrace + 1);
                try {
                    collectionData = JSON.parse(potentialJson);
                } catch (finalParseError) {
                    console.error("Final attempt to parse extracted JSON failed:", potentialJson, finalParseError);
                    throw finalParseError; // Re-throw to be caught by outer try-catch
                }
            } else {
                 throw new Error("No valid JSON structure found in response.");
            }
        }
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", text, parseError);
      return { error: "Failed to parse AI response for collection data." };
    }

    if (!collectionData || !collectionData.name || !collectionData.description || !Array.isArray(collectionData.product_names)) {
      console.error("AI did not return valid collection data including product_names array:", collectionData);
      return { error: "AI did not return valid collection name, description, or product names." };
    }

    // Map product names from AI response back to product IDs
    const productIdsForCollection = [];
    if (collectionData.product_names && products) {
      collectionData.product_names.forEach(aiProductName => {
        const foundProduct = products.find(p => p.name.toLowerCase() === aiProductName.toLowerCase());
        if (foundProduct && foundProduct.id) {
          productIdsForCollection.push(foundProduct.id);
        } else {
          console.warn(`Product name "${aiProductName}" from AI response not found in provided product list or missing ID.`);
        }
      });
    }
    
    // Now, generate an image using Gemini based on the collection name and description
    const imagePrompt = `A vibrant and appealing e-commerce collection image for "${collectionData.name}", described as "${collectionData.description}", suitable for a store selling ${productType}.`;
    let imageData = null;
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
      }
    } // Closing brace for the try block related to image generation
    catch (imgError) {
      console.error(`Error generating image for collection "${collectionData.name}" with Gemini:`, imgError);
    }

    return {
      name: collectionData.name,
      description: collectionData.description,
      imageData: imageData, // Return base64 image data
      product_ids: productIdsForCollection,
    };

  } catch (error) {
    console.error("Error generating collection with Gemini:", error);
    return { error: `Failed to generate collection data: ${error.message}` };
  }
}
