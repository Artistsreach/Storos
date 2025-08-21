import { GoogleGenAI } from "@google/genai";
// import { createWriteStream } from "fs"; // Not needed if we only return the URI
// import { Readable } from "stream"; // Not needed if we only return the URI

// Ensure your VITE_GEMINI_API_KEY is set in your environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is not set. Video generation will fail.");
}
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a video using Veo 2 based on a text prompt.
 * @param {string} prompt - The text prompt for the video.
 * @param {object} config - Optional configuration for video generation.
 * @returns {Promise<string>} - A promise that resolves to the URI of the generated video.
 */
export const generateVideoWithVeo = async (prompt, config = {}) => {
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured.");
  }
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error("A valid prompt string is required.");
  }

  console.log(`Starting video generation with prompt: "${prompt}"`);

  try {
    let operation = await ai.models.generateVideos({
      model: "veo-3.0-generate-preview",
      prompt: prompt,
      config: {
        aspectRatio: "16:9",
        negativePrompt: config.negativePrompt,
        // Veo 3 text-to-video supports personGeneration: "allow_all" only.
        personGeneration: "allow_all",
        ...config,
      },
    });

    console.log("Video generation operation started:", operation.name);

    // Poll for completion
    while (!operation.done) {
      console.log(`Polling operation ${operation.name}, current status: ${operation.metadata?.state || 'UNKNOWN'}`);
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Poll every 10 seconds
      operation = await ai.operations.getVideosOperation({
        operation: operation, // Pass the whole operation object
      });
    }

    console.log("Video generation operation completed:", operation.name, "Done:", operation.done);

    if (operation.error) {
      console.error("Error during video generation operation:", operation.error);
      throw new Error(`Video generation failed: ${operation.error.message || 'Unknown error'}`);
    }
    
    const generatedVideos = operation.response?.generatedVideos;
    if (generatedVideos && generatedVideos.length > 0) {
      const videoRef = generatedVideos[0].video;
      // If SDK returns a direct URI (some backends do), use it.
      const directUri = videoRef?.uri;
      if (directUri) {
        const videoUriWithKey = `${directUri}${directUri.includes('?') ? '&' : '?'}key=${apiKey}`;
        console.log("Generated video URI (with key appended):", videoUriWithKey);
        return videoUriWithKey;
      }
      // Browser-friendly download fallback: get blob and create an object URL
      try {
        const fileBlob = await ai.files.download({ file: videoRef });
        const blob = fileBlob instanceof Blob ? fileBlob : new Blob([fileBlob], { type: 'video/mp4' });
        const objectUrl = URL.createObjectURL(blob);
        console.log("Generated video via blob URL:", objectUrl);
        return objectUrl;
      } catch (e) {
        console.error("Download fallback failed:", e);
      }
    }
    console.error("No video reference found in the response:", operation.response);
    throw new Error("Video generation completed, but no video URI was returned.");
  } catch (error) {
    console.error("Failed to generate video with Veo:", error);
    // More specific error handling based on error type if needed
    if (error.message && error.message.includes("Quota")) {
        throw new Error("Video generation failed due to quota limits. Please check your Google Cloud project quotas.");
    }
    if (error.message && error.message.includes("API key not valid")) {
        throw new Error("Video generation failed due to an invalid API key. Please check your VITE_GEMINI_API_KEY.");
    }
    throw error; // Re-throw the original or a new error
  }
};

// Example usage (for testing purposes, can be removed)
/*
async function testVeo() {
  try {
    const prompt = "A serene beach at sunset with gentle waves.";
    console.log(`Testing Veo with prompt: "${prompt}"`);
    const videoUrl = await generateVideoWithVeo(prompt);
    console.log("Test successful. Video URL:", videoUrl);
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}
// testVeo(); 
*/

/**
 * Generates a video using Veo 2 from a text prompt and an initial image.
 * @param {string} prompt - The text prompt for the video.
 * @param {string} base64ImageData - Base64 encoded string of the initial image.
 * @param {string} mimeType - MIME type of the initial image (e.g., 'image/jpeg', 'image/png').
 * @param {object} config - Optional configuration for video generation.
 * @returns {Promise<string>} - A promise that resolves to the URI of the generated video (with API key).
 */
export const generateVideoWithVeoFromImage = async (prompt, base64ImageData, mimeType, config = {}) => {
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured.");
  }
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error("A valid prompt string is required.");
  }
  if (!base64ImageData || typeof base64ImageData !== 'string') {
    throw new Error("Valid base64 image data string is required.");
  }
  if (!mimeType || typeof mimeType !== 'string') {
    throw new Error("Valid image MIME type string is required.");
  }

  console.log(`Starting image-to-video generation with prompt: "${prompt}" and image (mimeType: ${mimeType})`);

  try {
    const videoGenerationPayload = {
      model: "veo-3.0-generate-preview",
      prompt: prompt,
      image: {
        imageBytes: base64ImageData,
        mimeType: mimeType,
      },
      config: {
        aspectRatio: "16:9",
        negativePrompt: config.negativePrompt,
        // Veo 3 image-to-video requires allow_adult for person generation per docs.
        personGeneration: "allow_adult",
        ...config,
      },
    };

    console.log("Veo image-to-video payload (excluding imageBytes):", { ...videoGenerationPayload, image: { mimeType: videoGenerationPayload.image.mimeType, imageBytes: '...' }});


    let operation = await ai.models.generateVideos(videoGenerationPayload);

    console.log("Image-to-video generation operation started:", operation.name);

    // Poll for completion
    while (!operation.done) {
      console.log(`Polling operation ${operation.name}, current status: ${operation.metadata?.state || 'UNKNOWN'}`);
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Poll every 10 seconds
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      });
    }

    console.log("Image-to-video generation operation completed:", operation.name, "Done:", operation.done);

    if (operation.error) {
      console.error("Error during image-to-video generation operation:", operation.error);
      throw new Error(`Image-to-video generation failed: ${operation.error.message || 'Unknown error'}`);
    }
    
    const generatedVideos = operation.response?.generatedVideos;
    if (generatedVideos && generatedVideos.length > 0) {
      const videoRef = generatedVideos[0].video;
      const directUri = videoRef?.uri;
      if (directUri) {
        const videoUriWithKey = `${directUri}${directUri.includes('?') ? '&' : '?'}key=${apiKey}`;
        console.log("Generated image-to-video URI (with key appended):", videoUriWithKey);
        return videoUriWithKey;
      }
      try {
        const fileBlob = await ai.files.download({ file: videoRef });
        const blob = fileBlob instanceof Blob ? fileBlob : new Blob([fileBlob], { type: 'video/mp4' });
        const objectUrl = URL.createObjectURL(blob);
        console.log("Generated image-to-video via blob URL:", objectUrl);
        return objectUrl;
      } catch (e) {
        console.error("Download fallback failed (image-to-video):", e);
      }
    }
    console.error("No video reference found in the image-to-video response:", operation.response);
    throw new Error("Image-to-video generation completed, but no video URI was returned.");
  } catch (error) {
    console.error("Failed to generate image-to-video with Veo:", error);
    if (error.message && error.message.includes("Quota")) {
        throw new Error("Image-to-video generation failed due to quota limits.");
    }
    if (error.message && error.message.includes("API key not valid")) {
        throw new Error("Image-to-video generation failed due to an invalid API key.");
    }
    throw error;
  }
};
