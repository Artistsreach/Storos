import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold, Type } from "@google/genai";

// Log the API key value as soon as the module is loaded for diagnostics
const GEMINI_API_KEY_FROM_ENV = import.meta.env.VITE_GEMINI_API_KEY;
console.log("[geminiImageGeneration Module] VITE_GEMINI_API_KEY loaded:", GEMINI_API_KEY_FROM_ENV ? `"${GEMINI_API_KEY_FROM_ENV.substring(0, 5)}..."` : "Not found");

const REMOVE_BG_API_KEY_FROM_ENV = import.meta.env.VITE_REMOVE_BG_API_KEY;
console.log("[geminiImageGeneration Module] VITE_REMOVE_BG_API_KEY loaded:", REMOVE_BG_API_KEY_FROM_ENV ? `"${REMOVE_BG_API_KEY_FROM_ENV.substring(0, 5)}..."` : "Not found");

const GEMINI_API_KEY = GEMINI_API_KEY_FROM_ENV;
const REMOVE_BG_API_KEY = REMOVE_BG_API_KEY_FROM_ENV;

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

async function getLogoColorType(base64ImageData, mimeType, aiInstance) {
  try {
    const contents = [
      { inlineData: { mimeType, data: base64ImageData } },
      { text: "Describe the main colors of this logo. Is it primarily black, white, or colorful? If black or white, state which. If colorful, list the dominant colors." }
    ];
    const response = await aiInstance.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
      safetySettings,
      config: { responseModalities: [Modality.TEXT] }
    });
    const description = response?.text?.toLowerCase() || "";
    console.log("[getLogoColorType] Gemini color description:", description);
    if (description.includes("primarily black") || description.includes("black logo")) return "black";
    if (description.includes("primarily white") || description.includes("white logo")) return "white";
    if (description.includes("colorful") || description.includes("multiple colors") || description.includes("various colors")) return "colored";
    console.warn("[getLogoColorType] Could not clearly determine logo color type. Defaulting to 'colored'. Desc:", description);
    return "colored";
  } catch (error) {
    console.error("[getLogoColorType] Error analyzing logo color:", error);
    return "colored";
  }
}

export async function generateLogoWithGemini(storeName, updateProgressCallback = (progress, message) => console.log(`Logo Progress: ${progress}%, Message: ${message || ''}`)) {
  if (!storeName) throw new Error("Store name is required.");
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured.");

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const initialPrompt = `Create a modern, clean, and professional logo for an e-commerce store named "${storeName}". The logo should be suitable for a website header. Avoid text in the logo itself, or if text is present, ensure it is "${storeName}" and highly legible. Focus on an iconic and memorable design. Generate a square image. The main subject of the logo should be prominent.`;
  let fullResponseText = "";
  let initialImageData = null;
  let initialImageMimeType = null;

  try {
    console.log("[generateLogoWithGemini] Generating initial logo for:", storeName);
    // Assuming initial logo generation is a small step within the logo phase
    updateProgressCallback(undefined, `Generating initial logo for ${storeName}...`); 
    const initialResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: initialPrompt,
      safetySettings,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    });

    if (initialResponse.candidates?.[0]?.content?.parts) {
      for (const part of initialResponse.candidates[0].content.parts) {
        if (part.text) fullResponseText += part.text;
        else if (part.inlineData?.data) {
          initialImageData = part.inlineData.data;
          initialImageMimeType = part.inlineData.mimeType;
          break;
        }
      }
    }
    if (!initialImageData) throw new Error("Failed to generate initial image data. " + (fullResponseText || "No text explanation."));
    console.log("[generateLogoWithGemini] Initial logo generated. MimeType:", initialImageMimeType);

    let logoUrlLight = null;
    let logoUrlDark = null;
    let transparentBase64 = initialImageData; // Start with original
    let currentMimeType = initialImageMimeType;

    if (REMOVE_BG_API_KEY) {
      try {
        console.log("[generateLogoWithGemini] Removing background.");
        updateProgressCallback(undefined, `Removing logo background...`); // Update message
        transparentBase64 = await removeBackgroundFromLogo(initialImageData, initialImageMimeType);
        currentMimeType = 'image/png'; // remove.bg outputs PNG
        console.log("[generateLogoWithGemini] Background removed.");
        updateProgressCallback(undefined, `Background removed.`); // Update message
      } catch (bgError) {
        console.warn("[generateLogoWithGemini] BG removal failed, using original:", bgError.message);
        updateProgressCallback(undefined, `Background removal failed.`);
        // transparentBase64 remains initialImageData, currentMimeType remains initialImageMimeType
      }
    } else {
      console.warn("[generateLogoWithGemini] No REMOVE_BG_API_KEY, skipping BG removal.");
      updateProgressCallback(undefined, `Skipped background removal.`);
    }
    
    // Color type analysis is a smaller step, might not need its own message update unless it's slow
    const colorType = await getLogoColorType(transparentBase64, currentMimeType, ai);
    const transparentDataUrl = `data:${currentMimeType};base64,${transparentBase64}`;

    if (colorType === "black") {
      logoUrlDark = transparentDataUrl; // Black logo for light backgrounds
      try {
        const editResultWhite = await editImageWithGemini(transparentBase64, currentMimeType, "Convert this black logo to a white logo, maintaining transparency and all details precisely. Output only the modified image.");
        if (editResultWhite.editedImageData) {
          logoUrlLight = `data:${editResultWhite.newMimeType};base64,${editResultWhite.editedImageData}`;
        } else { throw new Error("Inversion to white failed."); }
      } catch (invError) {
        console.warn("[generateLogoWithGemini] Failed to make white version:", invError.message);
        logoUrlLight = transparentDataUrl;
      }
    } else if (colorType === "white") {
      logoUrlLight = transparentDataUrl; // White logo for dark backgrounds
      try {
        const editResultBlack = await editImageWithGemini(transparentBase64, currentMimeType, "Convert this white logo to a black logo, maintaining transparency and all details precisely. Output only the modified image.");
        if (editResultBlack.editedImageData) {
          logoUrlDark = `data:${editResultBlack.newMimeType};base64,${editResultBlack.editedImageData}`;
        } else { throw new Error("Inversion to black failed."); }
      } catch (invError) {
        console.warn("[generateLogoWithGemini] Failed to make black version:", invError.message);
        logoUrlDark = transparentDataUrl;
      }
    } else { // Colored or undetermined
      logoUrlLight = transparentDataUrl;
      logoUrlDark = transparentDataUrl;
    }
    return { logoUrlLight, logoUrlDark, textResponse: fullResponseText };

  } catch (error) {
    console.error("[generateLogoWithGemini] Main error:", error.message, error.stack);
    throw new Error(`Logo generation failed: ${error.message || "Unknown error"}`);
  }
}

export async function generateCaptionForImageData(base64ImageData, mimeType, captionUserPrompt) {
  console.warn("Skipping image caption generation due to environment limitations.");
  return ["Generated image description."];
}

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
}

async function removeBackgroundFromLogo(base64ImageData, mimeType) {
  if (!REMOVE_BG_API_KEY) {
    console.warn("[removeBackgroundFromLogo] No API key, skipping.");
    return base64ImageData;
  }
  const imageBlob = base64ToBlob(base64ImageData, mimeType);
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_file", imageBlob, "logo_temp" + (mimeType.startsWith("image/") ? "." + mimeType.substring(6) : ".bin"));
  formData.append("format", "png");

  try {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST", headers: { "X-Api-Key": REMOVE_BG_API_KEY }, body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Remove.bg API Error ${response.status}: ${errorText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
  } catch (error) {
    console.error("[removeBackgroundFromLogo] Error:", error.message);
    throw error; // Re-throw to be caught by caller
  }
}

export async function editImageWithGemini(imageBase64, imageMimeType, editPrompt) {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured.");
  if (!imageBase64 || !imageMimeType || !editPrompt) throw new Error("Image data, MIME type, and prompt required.");

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const contents = [{ text: editPrompt }, { inlineData: { mimeType: imageMimeType, data: imageBase64 } }];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation", contents, safetySettings,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    });
    let editedImageData = null, editTextResponse = "", newMimeType = imageMimeType;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) editTextResponse += part.text;
        else if (part.inlineData?.data) {
          editedImageData = part.inlineData.data;
          newMimeType = part.inlineData.mimeType || imageMimeType;
          break;
        }
      }
    }
    if (!editedImageData) throw new Error("Failed to edit image. " + (editTextResponse || "No text explanation."));
    return { editedImageData, newMimeType, editTextResponse };
  } catch (error) {
    console.error("[editImageWithGemini] Error:", error.message);
    throw new Error(`Image editing failed: ${error.message || "Unknown error"}`);
  }
}

export async function generateGenericProductImageWithGemini(productName, productDescription) {
  if (!productName) throw new Error("Product name required.");
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured.");

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  let prompt = `Generate a clean, commercial-style product image for "${productName}".`;
  if (productDescription) prompt += ` Description: "${productDescription}".`;
  prompt += ` Main focus on product, simple/neutral/white background for e-commerce. Square image.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation", contents: prompt, safetySettings,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    });
    let imageData = null, textResponse = "", imageMimeType = 'image/png';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) textResponse += part.text;
        else if (part.inlineData?.data) {
          imageData = part.inlineData.data;
          imageMimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }
    }
    if (!imageData) throw new Error("Failed to generate product image. " + (textResponse || "No text explanation."));
    
    if (REMOVE_BG_API_KEY) {
      try {
        const transparentImageData = await removeBackgroundFromLogo(imageData, imageMimeType);
        return { imageData: transparentImageData, textResponse }; // remove.bg outputs PNG
      } catch (bgError) {
        console.warn("[generateGenericProductImageWithGemini] BG removal failed, using original:", bgError.message);
        // Fallback to original if BG removal fails
      }
    }
    return { imageData, textResponse }; // Return original if no BG key or BG removal failed
  } catch (error) {
    console.error("[generateGenericProductImageWithGemini] Error:", error.message);
    throw new Error(`Product image generation failed: ${error.message || "Unknown error"}`);
  }
}

export async function generateImageFromPromptForPod({ prompt, referenceImage }) {
  if (!prompt) throw new Error("Prompt required.");
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured.");

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  let contents;
  // Reinstated a system prompt that wraps the user's prompt for better POD results.
  const basePodPrompt = `Generate visually appealing image/print design to place on a product based on the following user prompt for a store generator: "${prompt}". Solely the image/design alone that is intended to go on products (canvas, t-shirts, mugs) not the products themselves. Square image.`;

  if (referenceImage?.base64Data && referenceImage?.mimeType) {
    contents = [
      // When a reference image is used, the prompt can be more direct about using it.
      { text: `Using the provided image as a reference, generate a new image based on the following concept: "${prompt}". Ensure the output is suitable for print-on-demand merchandise and is a square image.` },
      { inlineData: { mimeType: referenceImage.mimeType, data: referenceImage.base64Data } },
    ];
  } else {
    contents = basePodPrompt;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation", contents, safetySettings,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    });
    let imageData = null, imageMimeType = null, textResponse = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) textResponse += part.text;
        else if (part.inlineData?.data) {
          imageData = part.inlineData.data;
          imageMimeType = part.inlineData.mimeType;
          break;
        }
      }
    }
    if (!imageData) throw new Error("Failed to generate image from prompt. " + (textResponse || "No text explanation."));
    return { imageData, imageMimeType, textResponse };
  } catch (error) {
    console.error("[generateImageFromPromptForPod] Error:", error.message);
    throw new Error(`Image generation for POD failed: ${error.message || "Unknown error"}`);
  }
}

// Helper function to fetch an image URL and return its base64 data and mime type
async function fetchImageAsBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      // Try with a proxy if direct fetch fails (useful for CORS issues in some environments)
      // This is a common pattern; the actual proxy URL would need to be configured.
      // For now, let's assume direct fetch or that the environment handles CORS.
      console.warn(`Direct fetch for ${imageUrl} failed with status ${response.status}. Retrying without proxy for now.`);
      // const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
      // const proxiedResponse = await fetch(proxyUrl);
      // if (!proxiedResponse.ok) {
      //   throw new Error(`Failed to fetch image via proxy ${imageUrl}: ${proxiedResponse.statusText}`);
      // }
      // const blob = await proxiedResponse.blob();
      throw new Error(`Failed to fetch image ${imageUrl}: ${response.statusText}`);
    }
    const blob = await response.blob();
    const mimeType = blob.type;
    if (!mimeType.startsWith('image/')) {
      throw new Error(`Fetched content from ${imageUrl} is not an image. MIME type: ${mimeType}`);
    }
    const arrayBuffer = await blob.arrayBuffer();
    const base64Data = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    return { base64Data, mimeType };
  } catch (error) {
    console.error(`Error in fetchImageAsBase64 for ${imageUrl}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
}

export async function visualizeImageOnProductWithGemini(promptGeneratedBase64, promptGeneratedMimeType, baseProductImageUrl, originalUserPrompt, productName) {
  if (!GEMINI_API_KEY) {
    console.error("[visualizeImageOnProductWithGemini] Gemini API key not configured.");
    throw new Error("Gemini API key not configured.");
  }
  if (!promptGeneratedBase64 || !promptGeneratedMimeType || !baseProductImageUrl || !originalUserPrompt || !productName) {
    console.error("[visualizeImageOnProductWithGemini] Missing required parameters.");
    throw new Error("Missing required parameters for product visualization.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  try {
    console.log(`[visualizeImageOnProductWithGemini] Fetching base product image from: ${baseProductImageUrl}`);
    const { base64Data: mockupBase64, mimeType: mockupMimeType } = await fetchImageAsBase64(baseProductImageUrl);
    console.log(`[visualizeImageOnProductWithGemini] Fetched mockup: ${mockupMimeType}, length: ${mockupBase64.length}`);

    const designImagePart = {
      inlineData: {
        mimeType: promptGeneratedMimeType,
        data: promptGeneratedBase64,
      },
    };

    const mockupImagePart = {
      inlineData: {
        mimeType: mockupMimeType,
        data: mockupBase64,
      },
    };

    // Construct the prompt carefully to guide Gemini
    const textPrompt = `You are an expert product visualization AI.
Task: Place the first provided image (the 'design') onto the second provided image (the '${productName}' mockup).
Design Details: The design was conceptualized with the idea: "${originalUserPrompt}".
Mockup: The mockup is a '${productName}'.
Instructions:
1. Realistically superimpose the design onto the mockup.
2. Ensure the design conforms to the shape and texture of the mockup.
3. Maintain the original quality and details of both the design and the mockup where appropriate.
4. Output only the final visualized product image. Do not add any extra text or explanations in the image itself.
`;

    const contents = [
      { text: textPrompt },
      designImagePart, // Design image
      mockupImagePart,   // Mockup image
    ];

    console.log(`[visualizeImageOnProductWithGemini] Calling Gemini API for ${productName} with prompt: "${originalUserPrompt}"`);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation", // Or a model specifically for image editing if available and preferred
      contents: contents,
      safetySettings,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    });

    let visualizedImageData = null;
    let visualizedImageMimeType = null;
    let apiTextResponse = "";

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          apiTextResponse += part.text;
        } else if (part.inlineData?.data) {
          visualizedImageData = part.inlineData.data;
          visualizedImageMimeType = part.inlineData.mimeType;
          break; // Assuming the first image part is the result
        }
      }
    }
    
    console.log(`[visualizeImageOnProductWithGemini] API Text Response: ${apiTextResponse}`);

    if (!visualizedImageData) {
      console.error("[visualizeImageOnProductWithGemini] Failed to get visualized image data from API.", apiTextResponse);
      throw new Error("Failed to visualize product. API did not return image data. " + (apiTextResponse || "No text explanation."));
    }

    console.log(`[visualizeImageOnProductWithGemini] Visualization successful for ${productName}. MimeType: ${visualizedImageMimeType}`);
    return {
      visualizedImageData,
      visualizedImageMimeType,
      productDetails: { // Keep existing structure for product details
        title: `Custom ${productName} (Viz)`, // Added (Viz) for clarity if needed
        price: 24.99, // This might need to be dynamic or passed in if it varies
        description: `Unique ${productName} featuring the design: "${originalUserPrompt}".`,
      },
      apiTextResponse: apiTextResponse // Optional: return API's text response for debugging
    };

  } catch (error) {
    console.error(`[visualizeImageOnProductWithGemini] Error visualizing ${productName}:`, error);
    // Return a structure consistent with expected failures, but with error details
    return {
      visualizedImageData: null,
      visualizedImageMimeType: null,
      productDetails: {
        title: `Custom ${productName}`,
        price: 24.99,
        description: `Failed to visualize design on ${productName}. Error: ${error.message}`,
      },
      error: error.message,
    };
  }
}

export async function generateDifferentAnglesFromImage(base64ImageData, mimeType, productName) {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured.");
  if (!base64ImageData || !mimeType || !productName) throw new Error("Image data, MIME type, and product name required.");

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const prompts = [
    `Show this product, "${productName}", from a slightly high front-left angle. Maintain product integrity.`,
    `Show this product, "${productName}", from a direct side view. Maintain product integrity.`,
    `Show this product, "${productName}", from a top-down perspective. Maintain product integrity.`
  ];
  const generatedImages = [];

  try {
    for (const promptText of prompts) {
      const contents = [{ text: promptText }, { inlineData: { mimeType, data: base64ImageData } }];
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation", contents, safetySettings,
        config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
      });
      let angleImageData = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            angleImageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            generatedImages.push(angleImageData);
            break;
          }
        }
      }
      if (!angleImageData) console.warn(`[generateDifferentAnglesFromImage] No image data for one angle.`);
    }
    if (generatedImages.length === 0) throw new Error("Failed to generate any additional angle images.");
    return generatedImages;
  } catch (error) {
    console.error("[generateDifferentAnglesFromImage] Error:", error.message);
    throw new Error(`Generating different angles failed: ${error.message || "Unknown error"}`);
  }
}

export async function generateCollectionImageWithGemini(collectionName, collectionDescription) {
  if (!collectionName) throw new Error("Collection name is required to generate an image.");
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured.");

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  let prompt = `Generate a visually appealing banner image for an e-commerce collection named "${collectionName}".`;
  if (collectionDescription) {
    prompt += ` The collection is described as: "${collectionDescription}".`;
  }
  prompt += ` The image should be thematic or abstract, suitable for a collection header or card. It should evoke the essence of the collection. Consider a wide aspect ratio like 16:9 or a square image if more appropriate for a card.`;

  try {
    console.log(`[generateCollectionImageWithGemini] Generating image for collection: ${collectionName}`);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: [{ role: "user", parts: [{text: prompt}]}], // Simple text prompt
      safetySettings,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    });

    let imageData = null;
    let imageMimeType = 'image/png'; // Default MIME type
    let textResponse = "";

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          textResponse += part.text;
        } else if (part.inlineData?.data) {
          imageData = part.inlineData.data;
          imageMimeType = part.inlineData.mimeType || imageMimeType; // Use provided MIME type or default
          // Assuming we only need the first image part found
          break; 
        }
      }
    }

    if (!imageData) {
      throw new Error("Failed to generate image data for the collection. " + (textResponse || "No text explanation from AI."));
    }

    return { imageData, imageMimeType, textResponse };

  } catch (error) {
    console.error(`[generateCollectionImageWithGemini] Error generating image for collection "${collectionName}":`, error);
    throw new Error(`Collection image generation failed for "${collectionName}": ${error.message || "Unknown error"}`);
  }
}

export async function generateImage(prompt, ingredients = []) {
  if (!prompt) throw new Error("Prompt is required.");
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured.");

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const contents = [{ text: prompt }];
  ingredients.forEach(ingredient => {
    contents.push({ inlineData: { mimeType: ingredient.mimeType, data: ingredient.data } });
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: contents,
      safetySettings,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    });

    let imageData = null;
    let textResponse = "";

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          textResponse += part.text;
        } else if (part.inlineData?.data) {
          imageData = part.inlineData.data;
          break;
        }
      }
    }

    if (!imageData) {
      throw new Error(textResponse || "Failed to generate image. No image data returned.");
    }

    return { imageData, text: textResponse };
  } catch (error) {
    console.error("[generateImage] Error:", error.message);
    throw new Error(`Image generation failed: ${error.message || "Unknown error"}`);
  }
}

export async function editImage(prompt, imageBase64, imageMimeType, ingredients = []) {
  if (!prompt || !imageBase64 || !imageMimeType) {
    throw new Error("Prompt, image data, and MIME type are required.");
  }
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured.");

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const contents = [
    { text: prompt },
    { inlineData: { mimeType: imageMimeType, data: imageBase64 } },
  ];
  ingredients.forEach(ingredient => {
    contents.push({ inlineData: { mimeType: ingredient.mimeType, data: ingredient.data } });
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents,
      safetySettings,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    });

    let imageData = null;
    let textResponse = "";

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          textResponse += part.text;
        } else if (part.inlineData?.data) {
          imageData = part.inlineData.data;
          break;
        }
      }
    }

    if (!imageData) {
      throw new Error(textResponse || "Failed to edit image. No image data returned.");
    }

    return { imageData, text: textResponse };
  } catch (error) {
    console.error("[editImage] Error:", error.message);
    throw new Error(`Image editing failed: ${error.message || "Unknown error"}`);
  }
}
