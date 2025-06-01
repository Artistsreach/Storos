import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { storage } from '@/lib/firebaseClient'; // Firebase storage instance
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { generateId } from '@/lib/utils'; // For unique IDs

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Helper to convert data URL to Blob
const dataURLtoBlob = (dataurl) => {
  if (!dataurl) return null;
  const parts = dataurl.split(',');
  if (parts.length < 2) return null;
  const mimeMatch = parts[0].match(/:(.*?);/);
  if (!mimeMatch || mimeMatch.length < 2) return null;
  const mime = mimeMatch[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export async function generateProductWithGemini(
  productType,
  storeName,
  logoImageBase64 = null,
  logoMimeType = 'image/png',
  existingProductTitles = [],
  updateProgressCallback = (progress, message) => console.log(`ProductGen Progress: ${progress}%, Message: ${message || ''}`),
  baseProductProgress = 0, // Base progress for this specific product generation call
  productStepProgressIncrement = 5, // Total progress allocated for this one product's generation steps
  fullUserPrompt = '' // New parameter for the full user prompt
) {
  if (!API_KEY) {
    console.error("[geminiProductGeneration Function] VITE_GEMINI_API_KEY is not available.");
    throw new Error("Gemini API key is not configured.");
  }

  if (!productType || !storeName) {
    throw new Error("Product type and store name are required to generate a product.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  let basePrompt = `You are an expert product creator for e-commerce stores.
Generate a product for a store named "${storeName}" that sells ${productType}.
The overall theme and request for the store is: "${fullUserPrompt}". Use this full prompt to ensure the product aligns well with the user's vision.

The product should include:
1. A catchy title.
2. A brief description (15-25 words).
3. A realistic price (e.g., 29.99, 45.00).
4. Relevant product options/variants (e.g., for a shirt: Size [S, M, L, XL], Color [White, Black, Blue]; for a shoe: Size [8, 9, 10], Color [Red, Grey]). Generate 1 to 2 variant types, each with 2 to 5 option values. If no variants are typically applicable for the product type, return an empty array for "variants".
5. A visually appealing product image.

Return the text details (title, description, price, variants) as a single JSON object in the text part of your response.
Your entire text response MUST be ONLY longed JSON object. Do not include any other words, phrases, or conversational text before or after the JSON object.
The JSON object should strictly follow this format:
{
  "title": "Example Product Title",
  "description": "This is a fantastic example product, perfect for your needs and desires.",
  "price": "19.99",
  "variants": [
    { "name": "Size", "values": ["S", "M", "L", "XL"] },
    { "name": "Color", "values": ["White", "Black", "Blue"] }
  ]
}
Or, if no variants apply:
{
  "title": "Example Product Title",
  "description": "This is a fantastic example product, perfect for your needs and desires.",
  "price": "19.99",
  "variants": []
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
  const maxAttempts = 3; // Try up to 3 times for uniqueness
  let generatedTitlesInThisCall = []; // Store titles generated in this call's attempts

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[geminiProductGeneration Function] Attempt ${attempts} to generate content...`);
    // Update progress at the start of each attempt, maybe a small increment within the product's allocated progress
    const attemptProgress = baseProductProgress + ( (attempts -1) / maxAttempts) * (productStepProgressIncrement * 0.2); // Use 20% of step for attempts
    updateProgressCallback(attemptProgress, `Generating product (attempt ${attempts}/${maxAttempts})...`);

    // Dynamically build prompt and contents for each attempt to incorporate feedback on duplicates
    let currentAttemptPrompt = basePrompt;
    if (existingProductTitles && existingProductTitles.length > 0) {
      currentAttemptPrompt += `\n\nIMPORTANT: The new product MUST be distinct and different from the following products already generated for this store: "${existingProductTitles.join('", "')}". Focus on creating variety.`;
    }
    if (generatedTitlesInThisCall.length > 0) {
      currentAttemptPrompt += `\n\nADDITIONALLY IMPORTANT: Avoid re-generating the following titles which were duplicates in previous attempts of THIS request: "${generatedTitlesInThisCall.join('", "')}". Ensure the new title is truly novel and not similar to these.`;
    }

    if (logoImageBase64) {
      currentAttemptPrompt += `\n\nA logo image is also provided. Subtly incorporate this logo onto the product, its packaging, or in the scene if appropriate. For example, it could be a small brand mark on the item or a logo in the background if it's a lifestyle shot. Ensure the product remains the main focus.`;
    }
    
    const currentGeminiContents = [{ text: currentAttemptPrompt }];
    if (logoImageBase64) {
      currentGeminiContents.push({ inlineData: { data: logoImageBase64, mimeType: logoMimeType } });
    }
    
    if (attempts === 1) { // Log the initial full list of exclusions only on the first attempt for brevity
        const allExclusions = [...existingProductTitles, ...generatedTitlesInThisCall];
        console.log(`[geminiProductGeneration Function] Generating product for type: ${productType}, store: ${storeName}. Initial exclusions (if any): ${allExclusions.join(', ') || 'None'}. Logo: ${logoImageBase64 ? 'Yes' : 'No'}`);
    }


    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: currentGeminiContents, // Use dynamically built contents
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
              // This catch is specifically for JSON.parse errors.
              // jsonStringToParse might be null if the extraction logic itself failed before JSON.parse was called,
              // or if the error is from somewhere else within the try block before jsonStringToParse is used by JSON.parse.
              // However, the preceding log indicates jsonStringToParse was likely assigned.
              // Let's make the logging more robust.
              const stringToLog = typeof jsonStringToParse === 'string' ? jsonStringToParse : "[jsonStringToParse was not a string or was null]";
              console.warn(`[geminiProductGeneration Function] Attempt ${attempts}: Error parsing JSON. Attempted to parse: "${stringToLog}". Original text from part:`, part.text, "Error:", e.message);
              productTextDetails = null; // Ensure it's null if parsing fails
            }
          } else if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data;
            console.log(`[geminiProductGeneration Function] Attempt ${attempts}: Image data found.`);
          }
        }
      }
      rawTextResponseAccumulator += (rawTextResponseAccumulator ? "\n---\nAttempt " + attempts + ":\n" : "Attempt " + attempts + ":\n") + currentAttemptRawText;

      if (productTextDetails && productTextDetails.title) {
        const newTitleLower = productTextDetails.title.toLowerCase();
        // Before checking for duplicates, update progress to show parsing was successful
        updateProgressCallback(baseProductProgress + (productStepProgressIncrement * 0.8), `Validating product details for "${productTextDetails.title}"...`);

        const isDuplicateExisting = existingProductTitles.some(et => et.toLowerCase() === newTitleLower);
        const isDuplicateThisCall = generatedTitlesInThisCall.some(gt => gt.toLowerCase() === newTitleLower);

        if (isDuplicateExisting || isDuplicateThisCall) {
          console.warn(`[geminiProductGeneration Function] Attempt ${attempts}: Generated title "${productTextDetails.title}" is a duplicate. Adding to exclusion list for next attempt.`);
          generatedTitlesInThisCall.push(productTextDetails.title); 
          productTextDetails = null; 
        } else if (!productTextDetails.price || (typeof productTextDetails.price !== 'string' && typeof productTextDetails.price !== 'number') || String(productTextDetails.price).trim() === "") {
          // Also check if price is missing or empty after ensuring title is unique
          console.warn(`[geminiProductGeneration Function] Attempt ${attempts}: Product title "${productTextDetails.title}" is unique, but price is missing or invalid. Price:`, productTextDetails.price);
          productTextDetails = null; // Invalidate if price is missing
        } else if (!productTextDetails.variants || !Array.isArray(productTextDetails.variants)) {
          // Check if variants are missing or not an array
          console.warn(`[geminiProductGeneration Function] Attempt ${attempts}: Product title "${productTextDetails.title}" is unique and price is valid, but variants are missing or not an array. Variants:`, productTextDetails.variants);
          productTextDetails = null; // Invalidate if variants are malformed
        } else {
          // Validate structure of each variant if variants array exists
          for (const variant of productTextDetails.variants) {
            if (!variant.name || typeof variant.name !== 'string' || !Array.isArray(variant.values) || !variant.values.every(v => typeof v === 'string')) {
              console.warn(`[geminiProductGeneration Function] Attempt ${attempts}: Product title "${productTextDetails.title}" has malformed variant entry. Variant:`, variant);
              productTextDetails = null; // Invalidate if any variant is malformed
              break; // Stop checking other variants
            }
          }
        }
        // Description is optional, so no explicit check here to nullify productTextDetails based on it.
      }

      // Check for successful generation of all required parts for this attempt
      if (productTextDetails && productTextDetails.title && (productTextDetails.price || productTextDetails.price === 0) && productTextDetails.variants && imageData) {
        console.log(`[geminiProductGeneration Function] Successfully generated complete and unique product data (including variants) on attempt ${attempts}.`);
        break; // Exit retry loop
      } else {
        if (!imageData) console.warn(`[geminiProductGeneration Function] Attempt ${attempts} missing image data.`);
        if (!productTextDetails) {
            console.warn(`[geminiProductGeneration Function] Attempt ${attempts} missing text details (or title was duplicate/price missing/variants malformed).`);
        } else {
            if (!productTextDetails.title) console.warn(`[geminiProductGeneration Function] Attempt ${attempts} text details missing title.`);
            if (!productTextDetails.price && productTextDetails.price !== 0) console.warn(`[geminiProductGeneration Function] Attempt ${attempts} text details missing price.`);
            if (!productTextDetails.variants) console.warn(`[geminiProductGeneration Function] Attempt ${attempts} text details missing variants or variants malformed.`);
        }
        // Loop continues if attempts < maxAttempts
      }

    } catch (error) {
      console.error(`[geminiProductGeneration Function] Error during attempt ${attempts}:`, error.message, error.stack);
      rawTextResponseAccumulator += (rawTextResponseAccumulator ? "\n---\n" : "") + `Attempt ${attempts} Error: ${error.message}`;
      // No rethrow here, let the loop finish or the final check handle it.
    }
     if (attempts >= maxAttempts && (!productTextDetails || !imageData)) {
        console.error(`[geminiProductGeneration Function] Exhausted ${maxAttempts} attempts. Product generation failed.`);
        // The error will be thrown by the check after the loop.
    }
  } // End of while loop

  if (!productTextDetails || !imageData) {
    let errorMsg = `Failed to generate complete and unique product data after ${maxAttempts} attempts. `;
    if (!productTextDetails) errorMsg += "Text details (or unique title) missing. ";
    if (!imageData) errorMsg += "Image data missing. ";
    console.error(errorMsg, "Accumulated raw text responses:", rawTextResponseAccumulator);
    throw new Error(errorMsg + `Last raw text (if any): ${rawTextResponseAccumulator}`);
  }

  // Validate parsed details (basic check) - title uniqueness is handled above
  if (typeof productTextDetails.title !== 'string' ||
      typeof productTextDetails.description !== 'string' ||
      (typeof productTextDetails.price !== 'string' && typeof productTextDetails.price !== 'number') ||
      !Array.isArray(productTextDetails.variants) ||
      !productTextDetails.variants.every(variant =>
          typeof variant.name === 'string' &&
          Array.isArray(variant.values) &&
          variant.values.every(v => typeof v === 'string')
      )
  ) {
    console.error("[geminiProductGeneration Function] Parsed product details are not in the expected format:", productTextDetails);
    throw new Error("AI response for product details was not in the expected format (title, description, price, variants).");
  }
  
  productTextDetails.price = String(productTextDetails.price); // Ensure price is a string

  console.log("[geminiProductGeneration Function] Successfully generated product details (including variants) and image data.");

  if (imageData) {
    const dataUrl = `data:image/png;base64,${imageData}`;
    const imageBlob = dataURLtoBlob(dataUrl);
    if (imageBlob) {
      const uniqueImageId = generateId();
      const imageName = `${storeName.replace(/\s+/g, '_').toLowerCase()}_${productTextDetails.title.replace(/\s+/g, '_').toLowerCase().substring(0,20)}_${uniqueImageId}.png`;
      const storagePath = `product_images_generated/${imageName}`;
      const imageRef = ref(storage, storagePath);

      try {
        updateProgressCallback(baseProductProgress + (productStepProgressIncrement * 0.9), `Uploading image for "${productTextDetails.title}"...`);
        await uploadBytes(imageRef, imageBlob);
        const downloadURL = await getDownloadURL(imageRef);
        console.log(`[geminiProductGeneration Function] Image uploaded to Firebase Storage: ${downloadURL}`);
        updateProgressCallback(baseProductProgress + productStepProgressIncrement, `Product "${productTextDetails.title}" generated successfully.`);
        return { ...productTextDetails, images: [downloadURL] };
      } catch (uploadError) {
        console.error("[geminiProductGeneration Function] Error uploading image to Firebase Storage:", uploadError);
        // Fallback to base64 if upload fails, or throw error
        // For now, let's throw to indicate the process didn't fully complete as intended.
        throw new Error(`Failed to upload generated image to Firebase Storage: ${uploadError.message}`);
      }
    } else {
      console.error("[geminiProductGeneration Function] Failed to convert base64 image data to Blob.");
      throw new Error("Failed to process generated image data for upload.");
    }
  } else {
    // No image data generated, return with empty images array
    updateProgressCallback(baseProductProgress + productStepProgressIncrement, `Product "${productTextDetails.title}" generated (no image).`);
    return { ...productTextDetails, images: [] };
  }
}
