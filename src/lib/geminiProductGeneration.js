import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function generateProductWithGemini(productType, storeName, logoImageBase64 = null, logoMimeType = 'image/png', existingProductTitles = []) {
  if (!API_KEY) {
    console.error("[geminiProductGeneration Function] VITE_GEMINI_API_KEY is not available.");
    throw new Error("Gemini API key is not configured.");
  }

  if (!productType || !storeName) {
    throw new Error("Product type and store name are required to generate a product.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  let basePrompt = `Generate a product for a store named "${storeName}" that sells ${productType}.
The product should include:
1. A catchy title.
2. A brief description (15-25 words).
3. A realistic price (e.g., 29.99, 45.00).
4. A visually appealing product image.

Return the text details (title, description, price) as a single JSON object in the text part of your response.
Your entire text response MUST be ONLY the JSON object. Do not include any other words, phrases, or conversational text before or after the JSON object.
The JSON object should strictly follow this format:
{
  "title": "Example Product Title",
  "description": "This is a fantastic example product, perfect for your needs and desires.",
  "price": "19.99"
}

Generate an image for this product in the image part of your response.`;
  
  let currentPrompt = basePrompt; // Start with the base prompt

  if (existingProductTitles && existingProductTitles.length > 0) {
    currentPrompt += `\n\nIMPORTANT: The new product MUST be distinct and different from the following products already generated for this store: "${existingProductTitles.join('", "')}". Focus on creating variety.`;
  }

  const geminiContents = [];
  // Add the (potentially modified) prompt text part first
  geminiContents.push({ text: currentPrompt });

  if (logoImageBase64) {
    // Append logo instruction to the prompt text that's already in geminiContents[0]
    // This ensures all text instructions are part of the same text block if possible,
    // or at least that the logo instruction is present.
    // A cleaner way might be to build the full text prompt before pushing any parts.
    // Let's rebuild currentPrompt fully before pushing.

    // Rebuild currentPrompt to include logo instructions if applicable
    let finalPromptText = basePrompt; // Start fresh with base
    if (existingProductTitles && existingProductTitles.length > 0) {
      finalPromptText += `\n\nIMPORTANT: The new product MUST be distinct and different from the following products already generated for this store: "${existingProductTitles.join('", "')}". Focus on creating variety.`;
    }
    if (logoImageBase64) {
      finalPromptText += `\n\nA logo image is also provided. Subtly incorporate this logo onto the product, its packaging, or in the scene if appropriate. For example, it could be a small brand mark on the item or a logo in the background if it's a lifestyle shot. Ensure the product remains the main focus.`;
    }
    
    geminiContents.length = 0; // Clear and re-push
    geminiContents.push({ text: finalPromptText });

    if (logoImageBase64) {
      geminiContents.push({ inlineData: { data: logoImageBase64, mimeType: logoMimeType } });
      console.log(`[geminiProductGeneration Function] Generating product with logo for type: ${productType}, store: ${storeName}. Excluding: ${existingProductTitles.join(', ')}`);
    } else {
      // This case should not be hit if currentPrompt was already pushed, but for safety:
      // geminiContents.push({ text: finalPromptText }); // Already done if logoImageBase64 is false
      console.log(`[geminiProductGeneration Function] Generating product without logo for type: ${productType}, store: ${storeName}. Excluding: ${existingProductTitles.join(', ')}`);
    }
  } else { // No logo, but existingProductTitles might still be relevant
    let finalPromptText = basePrompt;
    if (existingProductTitles && existingProductTitles.length > 0) {
      finalPromptText += `\n\nIMPORTANT: The new product MUST be distinct and different from the following products already generated for this store: "${existingProductTitles.join('", "')}". Focus on creating variety.`;
    }
    geminiContents.length = 0; // Clear and re-push
    geminiContents.push({ text: finalPromptText });
    console.log(`[geminiProductGeneration Function] Generating product without logo for type: ${productType}, store: ${storeName}. Excluding: ${existingProductTitles.join(', ')}`);
  }


  let productTextDetails = null;
  let imageData = null;
  let rawTextResponseAccumulator = ""; // To accumulate text across attempts for final error if needed
  let attempts = 0;
  const maxAttempts = 2; // Try up to 2 times

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[geminiProductGeneration Function] Attempt ${attempts} to generate content...`);
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation", // Reverted to gemini-2.0-flash-preview-image-generation
        contents: geminiContents, // Contents are prepared once before the loop
        safetySettings,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      // Reset for each attempt before parsing parts
      productTextDetails = null; 
      imageData = null;
      let currentAttemptRawText = "";

      if (response.candidates && response.candidates.length > 0 && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.text) {
            currentAttemptRawText += part.text;
            try {
              const trimmedText = part.text.trim();
              let jsonStringToParse = null;

              // 1. Try to find JSON within markdown code block ```json ... ```
              const markdownJsonMatch = trimmedText.match(/```json\s*([\s\S]*?)\s*```/);
              if (markdownJsonMatch && markdownJsonMatch[1]) {
                jsonStringToParse = markdownJsonMatch[1];
                console.log(`[geminiProductGeneration Function] Attempt ${attempts}: Found JSON in markdown block.`);
              } else {
                // 2. If no markdown block, find the first '{' and last '}'
                const firstBrace = trimmedText.indexOf('{');
                const lastBrace = trimmedText.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace > firstBrace) {
                  jsonStringToParse = trimmedText.substring(firstBrace, lastBrace + 1);
                  console.log(`[geminiProductGeneration Function] Attempt ${attempts}: Extracted potential JSON between first '{' and last '}'.`);
                }
              }

              if (jsonStringToParse) {
                productTextDetails = JSON.parse(jsonStringToParse);
                console.log(`[geminiProductGeneration Function] Attempt ${attempts}: Successfully parsed JSON.`);
              } else {
                // This condition means no markdown JSON and no simple {.*} substring was found,
                // or the substring logic itself failed to produce a candidate string.
                if (part.text && (part.text.includes('{') || part.text.includes('}'))) {
                     console.warn(`[geminiProductGeneration Function] Attempt ${attempts}: Text part contained braces but simple extraction failed. Text:`, part.text);
                } else if (part.text) {
                     console.warn(`[geminiProductGeneration Function] Attempt ${attempts}: No JSON structure (markdown or simple braces) found in text part:`, part.text);
                }
                // productTextDetails remains null if no jsonStringToParse
              }
            } catch (e) {
              // This catch is specifically for JSON.parse errors on a non-null jsonStringToParse
              console.warn(`[geminiProductGeneration Function] Attempt ${attempts}: Error parsing extracted JSON string. String was: "${jsonStringToParse}". Original text:`, part.text, "Error:", e.message);
              productTextDetails = null; // Ensure it's null if parsing fails
            }
          } else if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data;
            console.log(`[geminiProductGeneration Function] Attempt ${attempts}: Image data found.`);
          }
        }
      }
      rawTextResponseAccumulator += (rawTextResponseAccumulator ? "\n---\nAttempt " + attempts + ":\n" : "Attempt " + attempts + ":\n") + currentAttemptRawText;

      if (productTextDetails && imageData) {
        console.log(`[geminiProductGeneration Function] Successfully generated product on attempt ${attempts}.`);
        break; // Exit retry loop if successful
      } else {
        console.warn(`[geminiProductGeneration Function] Attempt ${attempts} failed to get both text details and image.`);
      }

    } catch (error) {
      console.error(`[geminiProductGeneration Function] Error during attempt ${attempts}:`, error.message, error.stack);
      rawTextResponseAccumulator += (rawTextResponseAccumulator ? "\n---\n" : "") + `Attempt ${attempts} Error: ${error.message}`;
      if (attempts >= maxAttempts) { // If this was the last attempt, rethrow
        throw new Error(`Product generation failed after ${maxAttempts} attempts: ${error.message}`);
      }
      // Optionally, add a small delay before retrying
      // await new Promise(resolve => setTimeout(resolve, 500)); 
    }
  } // End of while loop

  if (!productTextDetails || !imageData) {
    let errorMsg = "Failed to generate complete product data after all attempts. ";
    if (!productTextDetails) errorMsg += "Text details missing. ";
    if (!imageData) errorMsg += "Image data missing. ";
    console.error(errorMsg, "Accumulated raw text responses:", rawTextResponseAccumulator);
    throw new Error(errorMsg + `Raw text (if any): ${rawTextResponseAccumulator}`);
  }

  // Validate parsed details (basic check)
  if (typeof productTextDetails.title !== 'string' || 
      typeof productTextDetails.description !== 'string' ||
      (typeof productTextDetails.price !== 'string' && typeof productTextDetails.price !== 'number')) {
    console.error("[geminiProductGeneration Function] Parsed product details are not in the expected format:", productTextDetails);
    throw new Error("AI response for product details was not in the expected format (title, description, price).");
  }
  
  productTextDetails.price = String(productTextDetails.price); // Ensure price is a string

  console.log("[geminiProductGeneration Function] Successfully generated product details and image data.");
  return { ...productTextDetails, imageData };
}
