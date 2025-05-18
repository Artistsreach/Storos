import OpenAI from 'openai';

// IMPORTANT: Store API keys securely, preferably in environment variables.
// For this example, using a placeholder. Replace with import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "YOUR_OPENAI_API_KEY_PLACEHOLDER";

if (!OPENAI_API_KEY || OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_PLACEHOLDER") {
  console.warn("OpenAI API Key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.");
}

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage, acknowledge security implications
});

/**
 * Generates an image from a text prompt using OpenAI's gpt-image-1 model.
 * @param {string} promptText - The text prompt for image generation.
 * @param {object} options - Optional parameters like size, quality, n.
 * @returns {Promise<object>} - An object containing the base64 JSON of the image and alt text.
 *                             Example: { b64_json: "...", alt: "Generated image for..." }
 */
export async function generateImageWithOpenAI(promptText, options = {}) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_PLACEHOLDER") {
    throw new Error("OpenAI API Key is not configured.");
  }
  if (!promptText || typeof promptText !== 'string' || promptText.trim() === '') {
    throw new Error("A valid prompt string is required for OpenAI image generation.");
  }

  console.log(`[OpenAI] Generating image with prompt: "${promptText}"`);

  try {
    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: promptText,
      n: options.n || 1,
      size: options.size || "1024x1024", // Default size
      quality: options.quality || "auto",
      response_format: "b64_json", // gpt-image-1 always returns b64_json
      // background: options.background || "auto", // If transparency is needed
      // output_format: options.output_format || "png", // If specific format needed
      // ... other gpt-image-1 specific params if needed
    });

    console.log("[OpenAI] Image generation response:", response);

    if (response.data && response.data.length > 0 && response.data[0].b64_json) {
      // For simplicity, returning the first image if n > 1
      return {
        b64_json: response.data[0].b64_json,
        alt: `OpenAI generated image for: ${promptText.substring(0, 50)}`,
        // Optionally include other response data like 'revised_prompt' if available and useful
        revised_prompt: response.data[0].revised_prompt 
      };
    } else {
      throw new Error("No image data found in OpenAI response.");
    }
  } catch (error) {
    console.error("[OpenAI] Error generating image:", error);
    if (error.response && error.response.data && error.response.data.error) {
        throw new Error(`OpenAI API Error: ${error.response.data.error.message}`);
    }
    throw error;
  }
}

/**
 * Edits an image using OpenAI's gpt-image-1 model with a text prompt and optional mask.
 * @param {string} promptText - The text prompt describing the desired edits.
 * @param {File | Array<File>} imageFileOrFiles - The image(s) to edit. Must be valid image File objects.
 * @param {File} [maskFile] - Optional mask File object for inpainting.
 * @param {object} options - Optional parameters like size, quality.
 * @returns {Promise<object>} - An object containing the base64 JSON of the edited image and alt text.
 */
export async function editImageWithOpenAI(promptText, imageFileOrFiles, maskFile = null, options = {}) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_PLACEHOLDER") {
    throw new Error("OpenAI API Key is not configured.");
  }
   if (!promptText || typeof promptText !== 'string' || promptText.trim() === '') {
    throw new Error("A valid prompt string is required for OpenAI image editing.");
  }
  if (!imageFileOrFiles) {
    throw new Error("An image file (or array of files) is required for editing.");
  }

  console.log(`[OpenAI] Editing image with prompt: "${promptText}"`);

  const editParams = {
    model: "gpt-image-1",
    prompt: promptText,
    image: imageFileOrFiles, // Directly pass File object(s) as per SDK docs for client-side
    n: options.n || 1,
    size: options.size || "1024x1024",
    response_format: "b64_json",
    // quality: options.quality || "auto", // If supported by edits endpoint
  };

  if (maskFile) {
    editParams.mask = maskFile; // Pass File object for mask
  }

  try {
    const response = await client.images.edit(editParams);
    console.log("[OpenAI] Image edit response:", response);

    if (response.data && response.data.length > 0 && response.data[0].b64_json) {
      return {
        b64_json: response.data[0].b64_json,
        alt: `OpenAI edited image for: ${promptText.substring(0, 50)}`,
        revised_prompt: response.data[0].revised_prompt
      };
    } else {
      throw new Error("No edited image data found in OpenAI response.");
    }
  } catch (error) {
    console.error("[OpenAI] Error editing image:", error);
     if (error.response && error.response.data && error.response.data.error) {
        throw new Error(`OpenAI API Error: ${error.response.data.error.message}`);
    }
    throw error;
  }
}

// Helper to convert dataURL to File object, as OpenAI SDK might prefer File objects
export async function dataUrlToImageFile(dataUrl, filename = 'image.png') {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
}
