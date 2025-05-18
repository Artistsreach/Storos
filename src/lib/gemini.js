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
    description: "An array of 5 creative and catchy store name suggestions."
    // Consider adding minItems: 5, maxItems: 5 if strictness is needed and supported.
  };

  try {
    const fullPrompt = `Suggest 5 creative and catchy store name options based on the following description or keywords: "${promptContent}". Return exactly 5 suggestions.`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
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
        return { suggestions: parsedSuggestions.slice(0, 5).map(s => s.trim()).filter(s => s.length > 0) };
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
