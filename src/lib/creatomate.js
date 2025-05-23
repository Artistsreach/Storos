import { Client as CreatomateClient } from 'creatomate';

const CREATOMATE_API_KEY = import.meta.env.VITE_CREATOMATE_API_KEY; // Read from .env

const VOICECHOVER_TEMPLATE_ID = 'cdaca80d-b8aa-4b20-a693-223f5ef24f77'; 
const PRODUCT_SHOWCASE_TEMPLATE_ID = 'd22afb81-612a-47da-9923-090afeac32a1';

let client;
if (CREATOMATE_API_KEY) {
  client = new CreatomateClient(CREATOMATE_API_KEY);
} else {
  console.error("Creatomate API Key is missing! Ensure VITE_CREATOMATE_API_KEY is set in your .env file.");
  // Optionally, create a dummy client or throw an error to prevent further operations
  // For now, functions will check for client availability.
}

/**
 * Renders a video using Creatomate's Voiceover Template.
 * @param {Array<object>} timelineItems - Array of items from the timeline, e.g., [{ url, caption, type }]
 *                                       Expects items to have 'url' for image/video source and 'caption' for voiceover.
 * @returns {Promise<object>} - A promise that resolves to the Creatomate render object (likely the first element of the renders array).
 */
export async function renderVoiceoverVideoWithCreatomate(timelineItems) {
  if (!client) {
    throw new Error("Creatomate client is not initialized. Check API Key.");
  }
  if (!timelineItems || timelineItems.length === 0) {
    throw new Error("Timeline items are required for the voiceover video.");
  }
  if (timelineItems.length > 4) {
    console.warn("Voiceover template currently supports up to 4 items. Using the first 4.");
    timelineItems = timelineItems.slice(0, 4);
  }

  const modifications = {};
  timelineItems.forEach((item, index) => {
    const itemNumber = index + 1;
    if (item.type === 'image') {
      modifications[`Image-${itemNumber}.source`] = item.url;
    } else if (item.isVideo) {
      modifications[`Image-${itemNumber}.source`] = "https://creatomate-static.s3.amazonaws.com/demo/transparent.png"; 
      console.warn(`Item ${itemNumber} is a video. Using placeholder image for Voiceover Slideshow. Caption will be used for voiceover.`);
    } else {
      modifications[`Image-${itemNumber}.source`] = "https://creatomate-static.s3.amazonaws.com/demo/image1.jpg";
    }
    modifications[`Voiceover-${itemNumber}.source`] = item.caption || "";
  });

  for (let i = timelineItems.length + 1; i <= 4; i++) {
    modifications[`Image-${i}.source`] = "https://creatomate-static.s3.amazonaws.com/demo/transparent.png";
    modifications[`Voiceover-${i}.source`] = "";
  }

  const options = {
    templateId: VOICECHOVER_TEMPLATE_ID,
    modifications: modifications,
  };

  console.log('Rendering with Creatomate SDK (Voiceover):', JSON.stringify(options, null, 2));
  try {
    const renders = await client.render(options);
    console.log('Creatomate SDK Response (Voiceover):', renders);
    if (renders && renders.length > 0) {
      return renders[0]; // Assuming client.render resolves with an array when successful
    } else {
      throw new Error('Creatomate SDK did not return render data for voiceover template.');
    }
  } catch (error) {
    console.error('Error rendering voiceover video with Creatomate SDK:', error);
    throw error;
  }
}

/**
 * Renders a video using Creatomate's Product Showcase Template.
 * @param {object} productItem - The main product item from the timeline { url, caption, name?, description? }
 * @param {object} branding - Optional branding info { websiteUrl, ctaText }
 * @returns {Promise<object>} - A promise that resolves to the Creatomate render object (likely the first element of the renders array).
 */
export async function renderProductShowcaseVideoWithCreatomate(productItem, branding = {}) {
  if (!client) {
    throw new Error("Creatomate client is not initialized. Check API Key.");
  }
  if (!productItem || !productItem.url) {
    throw new Error("A product item with an image URL is required for the product showcase video.");
  }
  // Ensure productItem is an image, not a video for Product-Image.source
  if (productItem.type !== 'image' && productItem.isVideo) {
      console.warn(`Product item for showcase is a video. This template expects an image for 'Product-Image.source'. Attempting to use video URL, but may fail or show first frame.`);
      // Or, strictly throw an error:
      // throw new Error("Product Showcase template requires an image item for 'Product-Image.source'.");
  }


  let productName = "Awesome Product";
  let productDescription = "Check out this amazing product, now available!";
  
  if (productItem.caption) {
      const parts = productItem.caption.split('-');
      if (parts.length > 0) productName = parts[0].trim();
      if (parts.length > 1) productDescription = parts.slice(1).join('-').trim();
  }
  productName = productItem.name || productName;
  productDescription = productItem.description || productDescription;

  const modifications = {
    "Product-Image.source": productItem.url,
    "Product-Name.text": productName,
    "Product-Description.text": productDescription,
    "Normal-Price.text": productItem.normalPrice || "$ 109.99",
    "Discounted-Price.text": productItem.discountedPrice || "$ 89.99",
    "CTA.text": branding.ctaText || "Follow us for more!",
    "Website.text": branding.websiteUrl || "www.example.com"
  };

  const options = {
    templateId: PRODUCT_SHOWCASE_TEMPLATE_ID,
    modifications: modifications,
  };

  console.log('Rendering with Creatomate SDK (Product Showcase):', JSON.stringify(options, null, 2));
  try {
    const renders = await client.render(options);
    console.log('Creatomate SDK Response (Product Showcase):', renders);
     if (renders && renders.length > 0) {
      return renders[0];
    } else {
      throw new Error('Creatomate SDK did not return render data for product showcase template.');
    }
  } catch (error) {
    console.error('Error rendering product showcase video with Creatomate SDK:', error);
    throw error;
  }
}

// Manual polling is no longer needed if client.render() waits for completion.
// If client.render() queues and returns immediately, polling or webhooks would be needed.
// The SDK documentation example `client.render(options).then((renders) => ...)`
// implies it waits. If not, the `pollCreatomateRenderStatus` function would need to be
// kept and adapted, or webhooks implemented. For now, assuming `client.render` is sufficient.
// Removing pollCreatomateRenderStatus as SDK's render method should handle waiting.
// export async function pollCreatomateRenderStatus(renderId, onProgress, interval = 5000, timeout = 300000) { ... }
