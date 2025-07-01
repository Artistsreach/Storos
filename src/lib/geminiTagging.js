import { GoogleGenAI, Type } from "@google/genai";
import { tags } from './constants';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is not set. Please add it to your .env file. Tag generation will fail.");
}

export async function generateTagsForStore(storeData) {
  if (!apiKey) {
    console.error("API Key not configured. Cannot generate tags.");
    return { error: "API Key not configured." };
  }

  const genAI = new GoogleGenAI({ apiKey });

  const tagResponseSchema = {
    type: Type.ARRAY,
    items: { type: Type.STRING },
    description: "An array of relevant tags for the store."
  };

  const prompt = `
    Given the following store data, please select the most relevant tags from the provided list.
    You can select multiple tags if they are relevant. If no tags are relevant, return an empty array.

    Store Name: ${storeData.name}
    Store Description: ${storeData.description}
    Store Niche: ${storeData.niche}

    Products:
    ${storeData.products.map(p => `- ${p.name}: ${p.description}`).join('\n')}

    Available Tags:
    ${tags.join(', ')}

    Return a JSON array of the selected tags.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{text: prompt}]}],
      config: {
        responseMimeType: "application/json",
        responseSchema: tagResponseSchema,
      }
    });

    const responseText = response.text;
    if (typeof responseText !== 'string' || responseText.trim() === '') {
        console.error("Model did not return a text response for tags. Response:", JSON.stringify(response));
        throw new Error("Model response for tags was empty or not a string.");
    }

    try {
      const parsedTags = JSON.parse(responseText);
      if (Array.isArray(parsedTags) && parsedTags.every(s => typeof s === 'string')) {
        return { tags: parsedTags };
      } else {
        console.error("Parsed tags are not an array of strings:", parsedTags);
        return { error: "AI response was not in the expected format (array of strings)." , rawResponse: responseText};
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response for tags:", responseText, "ParseError:", parseError);
      return { error: "Failed to parse tags from AI.", rawResponse: responseText };
    }
  } catch (error) {
    console.error("Error generating tags:", error);
    return { error: `Error generating tags: ${error.message}` };
  }
}
