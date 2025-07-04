import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold, Type } from "@google/genai";

// Log the API key value as soon as the module is loaded for diagnostics
const GEMINI_API_KEY_FROM_ENV = import.meta.env.VITE_GEMINI_API_KEY;
console.log("[geminiImageGeneration Module] VITE_GEMINI_API_KEY loaded from import.meta.env:", GEMINI_API_KEY_FROM_ENV ? `"${GEMINI_API_KEY_FROM_ENV.substring(0, 5)}..." (length: ${GEMINI_API_KEY_FROM_ENV.length})` : GEMINI_API_KEY_FROM_ENV);

const REMOVE_BG_API_KEY_FROM_ENV = import.meta.env.VITE_REMOVE_BG_API_KEY;
console.log("[geminiImageGeneration Module] VITE_REMOVE_BG_API_KEY loaded from import.meta.env:", REMOVE_BG_API_KEY_FROM_ENV ? `"${REMOVE_BG_API_KEY_FROM_ENV.substring(0, 5)}..." (length: ${REMOVE_BG_API_KEY_FROM_ENV.length})` : REMOVE_BG_API_KEY_FROM_ENV);


const GEMINI_API_KEY = GEMINI_API_KEY_FROM_ENV; // Use the logged value
const REMOVE_BG_API_KEY = REMOVE_BG_API_KEY_FROM_ENV;

// Safety settings from the previous version, assuming compatibility with @google/genai
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function generateLogoWithGemini(storeName) {
  if (!storeName) {
    throw new Error("Store name is required to generate a logo.");
  }

  if (!GEMINI_API_KEY) {
    console.error("[geminiImageGeneration Function] VITE_GEMINI_API_KEY is not available. Ensure it's set in .env and dev server was restarted.");
    throw new Error("Gemini API key is not configured. Please ensure VITE_GEMINI_API_KEY is in your .env file and the server was restarted.");
  }

  // Instantiate the AI client using GoogleGenAI from @google/genai
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const prompt = `Create a modern, clean, and professional logo for an e-commerce store named "${storeName}". The logo should be suitable for a website header. Avoid text in the logo itself, or if text is present, ensure it is "${storeName}" and highly legible. Focus on an iconic and memorable design. Generate a square image. The main subject of the logo should be prominent and take up most of the frame.`;

  try {
    console.log("[geminiImageGeneration Function] Attempting to generate logo using @google/genai SDK with ai.models.generateContent method.");

    // Use ai.models.generateContent() as per the user's example
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation", // Reverted to gemini-2.0-flash-preview-image-generation
      contents: prompt, // Pass the prompt string directly as per the example
      safetySettings,   // Pass safetySettings; @google/genai should support this
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE], // Reverted to TEXT and IMAGE as required by the model
      },
    });

    let fullResponseText = ""; 
    let imageData = null;
    let imageMimeType = null;

    // Parse the response based on the example's structure
    // The response object from @google/genai's ai.models.generateContent is expected to directly contain candidates
    if (response.candidates && response.candidates.length > 0 && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          fullResponseText += part.text;
        } else if (part.inlineData && part.inlineData.data) {
          imageData = part.inlineData.data;
          imageMimeType = part.inlineData.mimeType;
          console.log("[geminiImageGeneration Function] Image data found in response part (mimeType: " + imageMimeType + ").");
          break; // Assuming one logo image is sufficient
        }
      }
    } else {
      // Handle cases where the response structure is not as expected or parts are missing
      console.warn("[geminiImageGeneration Function] Response structure unexpected, no parts found, or no candidates. Full response:", JSON.stringify(response));
      // If there's a direct text response or error message in a different part of the response, try to capture it.
      // This part might need refinement based on actual error responses from @google/genai.
      if (response && typeof response.text === 'function') { // Check if response has a text method (common in some SDKs for full text)
         fullResponseText = await response.text();
      } else if (response && response.error && response.error.message) {
         fullResponseText = `Error from API: ${response.error.message}`;
      }
    }

    if (!imageData) {
      console.error("[geminiImageGeneration Function] No image data found in Gemini response. Text response (if any):", fullResponseText);
      throw new Error("Failed to generate image. Model did not return image data. " + (fullResponseText || "No text explanation from model."));
    }

    console.log("[geminiImageGeneration Function] Successfully generated image data. Text response (if any):", fullResponseText);
    
    // Remove background from the generated logo
    if (imageData && imageMimeType) {
      try {
        console.log("[geminiImageGeneration Function] Attempting to remove background from logo.");
        const transparentImageData = await removeBackgroundFromLogo(imageData, imageMimeType);
        console.log("[geminiImageGeneration Function] Successfully removed background from logo.");
        return { imageData: transparentImageData, textResponse: fullResponseText };
      } catch (bgRemoveError) {
        console.error("[geminiImageGeneration Function] Error removing background:", bgRemoveError.message);
        // Fallback to returning the original image if background removal fails
        console.warn("[geminiImageGeneration Function] Background removal failed. Returning original image.");
        return { imageData, textResponse: fullResponseText };
      }
    }
    // Should not reach here if imageData was null, as it's handled above.
    // But as a safeguard:
    return { imageData, textResponse: fullResponseText };


  } catch (error) {
    console.error("[geminiImageGeneration Function] Error during logo generation:", error.message, error.stack, error);
    // Preserve existing detailed error handling, adapt if @google/genai throws different error types
    if (error.message && error.message.toLowerCase().includes("api key not valid")) {
      throw new Error("Invalid Gemini API Key. Please check your VITE_GEMINI_API_KEY in the .env file.");
    }
    if (error.message && error.message.toLowerCase().includes("billing")) {
      throw new Error("Gemini API request failed. Please check your Google Cloud project billing status and ensure the API is enabled.");
    }
    if (error.message && error.message.toLowerCase().includes("quota")) {
      throw new Error("Gemini API quota exceeded. Please check your API usage limits.");
    }
    if (error.message && error.message.toLowerCase().includes("model not found")) {
        throw new Error("The specified Gemini model ('gemini-2.0-flash-preview-image-generation') was not found or is not accessible. Please check model availability and SDK compatibility.");
    }
    if (error.message && (error.message.toLowerCase().includes("network error") || error.message.toLowerCase().includes("failed to fetch"))) {
        throw new Error("A network error occurred while trying to reach the Gemini API. Please check your internet connection and firewall settings.");
    }
    // Check for permission-denied errors which can also relate to API key or enablement
    if (error.message && error.message.toLowerCase().includes("permission denied")) {
        throw new Error("Gemini API request failed due to a permission issue. Ensure the API key is correct, the Generative Language API is enabled in your Google Cloud project, and the project is correctly configured.");
    }
    // Fallback for other errors
    throw new Error(`Image generation failed: ${error.message || "An unknown error occurred"}`);
  }
}

export async function generateCaptionForImageData(base64ImageData, mimeType, captionUserPrompt) {
  if (!GEMINI_API_KEY) {
    console.error("[generateCaptionForImageData] VITE_GEMINI_API_KEY is not available.");
    throw new Error("Gemini API key is not configured.");
  }
  if (!base64ImageData || !mimeType) {
    throw new Error("Base64 image data and MIME type are required to generate a caption.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const captionResponseSchema = {
    type: Type.ARRAY,
    items: { type: Type.STRING },
    description: "An array of 3 distinct caption options for the image."
  };

  try {
    console.log(`[generateCaptionForImageData] Using provided image data. MimeType: ${mimeType}, Base64 length: ${base64ImageData.length}`);

    const defaultCaptionPrompt = "Generate 3 distinct caption options for this product image, in the style of a social media reel. Captions should be short, punchy, and engaging. Do NOT include emojis or hashtags. Ensure each caption is a clean string without markdown. For example: 'Fresh drop! Cop yours now.' or 'Obsessed with this vibe!'.";
    
    let effectivePrompt = captionUserPrompt || defaultCaptionPrompt;
    // Ensure the prompt asks for 3 options, social media reel style, and NO emojis/hashtags if a custom prompt is given.
    if (captionUserPrompt) {
        let baseRequest = `"${captionUserPrompt}"`;
        if (!captionUserPrompt.toLowerCase().includes("social media reel")) {
            baseRequest += " (style: social media reel)";
        }
        if (!captionUserPrompt.toLowerCase().includes("no emojis") && !captionUserPrompt.toLowerCase().includes("no hashtags")) {
            baseRequest += " (important: do not include emojis or hashtags)";
        }
        
        if (!captionUserPrompt.toLowerCase().includes("3 options") && !captionUserPrompt.toLowerCase().includes("three options") && !captionUserPrompt.toLowerCase().includes("array of captions")) {
            effectivePrompt = `Generate an array of 3 distinct caption options based on this request: ${baseRequest}. Each caption should be a clean string without emojis or hashtags.`;
        } else {
            effectivePrompt = `Generate captions based on this request: ${baseRequest}. Each caption should be a clean string without emojis or hashtags.`;
        }
    }


    const contents = [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64ImageData,
        },
      },
      { text: effectivePrompt }, 
    ];

    console.log(`[generateCaptionForImageData] Calling Gemini to generate caption options for image using responseSchema. Prompt: "${effectivePrompt}"`);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", 
      contents: contents,
      safetySettings,
      config: {
        responseMimeType: "application/json",
        responseSchema: captionResponseSchema,
      },
    });
    
    // The response.text() should directly be the JSON string if responseSchema is used
    const responseText = response.text; // Or response.text() if it's a function
    if (typeof responseText !== 'string' || responseText.trim() === '') {
        console.error("[generateCaptionForImageData] Model did not return a text response for JSON schema. Response:", JSON.stringify(response));
        throw new Error("Model response for JSON schema was empty or not a string.");
    }

    try {
      const parsedCaptions = JSON.parse(responseText);
      if (Array.isArray(parsedCaptions) && parsedCaptions.every(c => typeof c === 'string')) {
        const cleanedCaptions = parsedCaptions.map(c => c.trim().replace(/\*/g, '')).filter(c => c.length > 0); // Remove asterisks and trim
        if (cleanedCaptions.length > 0) {
          console.log(`[generateCaptionForImageData] Captions generated via responseSchema:`, cleanedCaptions);
          return cleanedCaptions;
        } else {
           console.warn("[generateCaptionForImageData] Parsed captions array is empty or contains only empty strings after cleaning.");
           return ["Generated image description."]; // Fallback
        }
      } else {
        console.error("[generateCaptionForImageData] Parsed response is not an array of strings:", parsedCaptions);
        throw new Error("Parsed JSON from model is not in the expected format (array of strings).");
      }
    } catch (parseError) {
      console.error("[generateCaptionForImageData] Failed to parse JSON response from model:", responseText, "ParseError:", parseError);
      // Provide a fallback if JSON parsing fails but we got some text
      return [responseText.trim().replace(/\*/g, '') || "Could not generate caption."];
    }

  } catch (error) {
    console.error("[generateCaptionForImageData] Error generating caption:", error.message, error.stack, error);
    throw new Error(`Image caption generation failed: ${error.message || "An unknown error occurred"}`);
  }
}

// Helper function to convert base64 to Blob
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

async function removeBackgroundFromLogo(base64ImageData, mimeType) {
  if (!REMOVE_BG_API_KEY) {
    console.error("[removeBackgroundFromLogo Function] VITE_REMOVE_BG_API_KEY is not available. Ensure it's set in .env and dev server was restarted.");
    throw new Error("Remove.bg API key is not configured. Please ensure VITE_REMOVE_BG_API_KEY is in your .env file and the server was restarted.");
  }

  const imageBlob = base64ToBlob(base64ImageData, mimeType);

  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_file", imageBlob, "logo_from_gemini" + (mimeType.startsWith("image/") ? "." + mimeType.substring(6) : ".bin")); // Use image_file with Blob
  formData.append("format", "png"); // Ensure PNG for transparency

  console.log("[removeBackgroundFromLogo Function] Calling remove.bg API with image_file (Blob).");
  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": REMOVE_BG_API_KEY },
    body: formData,
  });

  if (response.ok) {
    const arrayBuffer = await response.arrayBuffer();
    // Convert ArrayBuffer to base64 string to keep data format consistent
    const base64String = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    console.log("[removeBackgroundFromLogo Function] Successfully removed background. Returning base64 image data.");
    return base64String;
  } else {
    const errorText = await response.text();
    console.error("[removeBackgroundFromLogo Function] Error from remove.bg API:", response.status, response.statusText, errorText);
    throw new Error(`Remove.bg API Error ${response.status}: ${response.statusText}. Details: ${errorText}`);
  }
}

export async function editImageWithGemini(
  imageBase64, // Changed from referenceImageBase64 & productImageBase64
  imageMimeType, // Changed from referenceImageMimeType & productImageMimeType
  editPrompt
) {
  if (!GEMINI_API_KEY) {
    console.error("[editImageWithGemini] VITE_GEMINI_API_KEY is not available.");
    throw new Error("Gemini API key is not configured.");
  }
  // Updated check for single image editing
  if (!imageBase64 || !imageMimeType || !editPrompt) {
    throw new Error("Image data, image MIME type, and edit prompt are required for image editing.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // Contents for single image editing, matching user's example
  const contents = [
    { text: editPrompt },
    {
      inlineData: {
        mimeType: imageMimeType,
        data: imageBase64,
      },
    },
  ];

  // Safety settings (can be reused or customized)
  const editSafetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ];

  try {
    console.log(`[editImageWithGemini] Calling Gemini for image editing with prompt: "${editPrompt}"`);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation", // Reverted to match image generation model
      contents: contents,
      safetySettings: editSafetySettings,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE], // Expecting text (confirmation/description) and image
      },
    });

    let editedImageData = null;
    let editTextResponse = "";

    if (response.candidates && response.candidates.length > 0 && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          editTextResponse += part.text;
        } else if (part.inlineData && part.inlineData.data) {
          editedImageData = part.inlineData.data;
          // Assuming the edited image will also be PNG or same as input, Gemini might specify mimeType
          console.log(`[editImageWithGemini] Edited image data received. MimeType from Gemini: ${part.inlineData.mimeType}`);
          break; // Assuming one edited image part
        }
      }
    }

    if (!editedImageData) {
      console.error("[editImageWithGemini] No edited image data found in Gemini response. Text response (if any):", editTextResponse);
      throw new Error("Failed to edit image. Model did not return new image data. " + (editTextResponse || "No text explanation from model."));
    }

    console.log("[editImageWithGemini] Successfully edited image. Text response (if any):", editTextResponse);
    // Returns raw base64 data of the edited image. The caller should form the data URL.
    // Also returning the mime type provided by Gemini for the edited image.
    const newMimeType = response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData.mimeType || 'image/png';
    return { editedImageData, newMimeType, editTextResponse };

  } catch (error) {
    console.error("[editImageWithGemini] Error during image editing:", error.message, error.stack, error);
    throw new Error(`Image editing failed: ${error.message || "An unknown error occurred"}`);
  }
}
