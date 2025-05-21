import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchPexelsPhotos } from './pexels'; // Import the new photo search function

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set. Please add it to your .env file.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
 
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
 
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
      "product_ids": ["id_of_product_1", "id_of_product_2"]
    }
    Ensure the collection name is concise, unique from the provided list (if any), and the description is appealing.
    From the provided product list, select 2 to 5 products that best fit this new collection and include their original IDs in the "product_ids" array.
    The available products with their IDs are:
    ${products.map(p => `ID: ${p.id}, Name: ${p.name}`).join('\n    ')}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let collectionData;
    try {
      // Attempt to parse the JSON. Gemini sometimes includes markdown.
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        collectionData = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback for cases where Gemini might not use markdown ```json
        // This is a bit risky if the text isn't perfect JSON.
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonString = text.substring(firstBrace, lastBrace + 1);
          collectionData = JSON.parse(jsonString);
        } else {
          throw new Error("No clear JSON structure found in response.");
        }
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", text, parseError);
      return { error: "Failed to parse AI response for collection data." };
    }

    if (!collectionData || !collectionData.name || !collectionData.description || !Array.isArray(collectionData.product_ids)) {
      console.error("AI did not return valid collection name, description, or product_ids array. Response:", collectionData);
      return { error: "AI did not return all required collection data (name, description, product_ids)." };
    }

    // Validate that the returned product_ids actually exist in the input products
    const validProductIds = products.map(p => p.id);
    const selectedProductIds = collectionData.product_ids.filter(id => validProductIds.includes(id));

    if (selectedProductIds.length === 0 && collectionData.product_ids.length > 0) {
        console.warn("AI returned product_ids, but none match existing product IDs. Collection will be created without products initially.", collectionData.product_ids);
    }


    // Now, search for a Pexels image based on the collection name
    const pexelsQuery = `${collectionData.name} ${productType}`;
    const pexelsResult = await searchPexelsPhotos(pexelsQuery, 1); // Get 1 photo

    let imageUrl = '';
    if (pexelsResult.photos && pexelsResult.photos.length > 0) {
      // Pexels API returns an object with different sizes, e.g., original, large, medium, small, portrait, landscape, tiny
      // Let's try to use 'large' or 'medium' if available, otherwise fallback.
      imageUrl = pexelsResult.photos[0].src.large || pexelsResult.photos[0].src.medium || pexelsResult.photos[0].src.original;
    } else {
      console.warn(`No Pexels image found for query: "${pexelsQuery}". Using placeholder.`);
      imageUrl = 'https://via.placeholder.com/400x200?text=Collection+Image'; // Placeholder
    }

    return {
      name: collectionData.name,
      description: collectionData.description,
      imageUrl: imageUrl, // This will be the URL string
      product_ids: selectedProductIds, // Return the validated list of product IDs
    };

  } catch (error) {
    console.error("Error generating collection with Gemini:", error);
    return { error: `Failed to generate collection data: ${error.message}` };
  }
}
