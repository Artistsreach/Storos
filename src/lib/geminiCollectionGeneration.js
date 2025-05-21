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
 * @returns {Promise<object>} - A promise that resolves to an object containing collection data and image URL.
 */
export async function generateCollectionWithGemini(productType, storeName, products) {
  if (!GEMINI_API_KEY) {
    return { error: "Gemini API Key not configured." };
  }
 
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const productList = products.map(p => p.name).join(', ');

  const prompt = `
    You are an AI assistant for an e-commerce store named "${storeName}" that sells "${productType}".
    Based on the following products: ${productList}, suggest a compelling collection name and a short, engaging description (max 2 sentences) for a new collection.
    The collection should group related products or highlight a specific theme.
    Provide the output in a JSON format like this:
    {
      "name": "Collection Name",
      "description": "Collection Description"
    }
    Ensure the collection name is concise and the description is appealing.
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
        collectionData = JSON.parse(text);
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", text, parseError);
      return { error: "Failed to parse AI response for collection data." };
    }

    if (!collectionData || !collectionData.name || !collectionData.description) {
      return { error: "AI did not return valid collection name or description." };
    }

    // Now, search for a Pexels image based on the collection name
    const pexelsQuery = `${collectionData.name} ${productType}`;
    const pexelsResult = await searchPexelsPhotos(pexelsQuery, 1); // Get 1 photo

    let imageUrl = '';
    if (pexelsResult.photos && pexelsResult.photos.length > 0) {
      imageUrl = pexelsResult.photos[0].src;
    } else {
      console.warn(`No Pexels image found for query: "${pexelsQuery}". Using placeholder.`);
      imageUrl = 'https://via.placeholder.com/400x200?text=Collection+Image'; // Placeholder
    }

    return {
      name: collectionData.name,
      description: collectionData.description,
      imageUrl: imageUrl,
    };

  } catch (error) {
    console.error("Error generating collection with Gemini:", error);
    return { error: `Failed to generate collection data: ${error.message}` };
  }
}