// IMPORTANT: Store API keys securely, preferably in environment variables.
// For this example, using the key directly as provided in the prompt.
// Consider moving to import.meta.env.VITE_CREATOMATE_API_KEY
const CREATOMATE_API_KEY = 'c2114f1afad54a67a665c87bc092660810d6af4dec54aae7ae2712a2cdaff7458eb3528478f75a4c3998f59f2e2c9922';
const CREATOMATE_API_URL = 'https://api.creatomate.com/v1/renders';

const VOICECHOVER_TEMPLATE_ID = '543a4dfc-2286-45f1-acf5-86070a961708';
const PRODUCT_SHOWCASE_TEMPLATE_ID = '4cc27f0e-4641-44c2-a768-6b757225e11f';

async function callCreatomateAPI(payload) {
  console.log('Calling Creatomate API with payload:', JSON.stringify(payload, null, 2));
  if (!CREATOMATE_API_KEY) {
    console.error("Creatomate API Key is missing!");
    throw new Error("Creatomate API Key is not configured.");
  }

  try {
    const response = await fetch(CREATOMATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CREATOMATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();
    console.log('Creatomate API Raw Response:', responseData);

    if (!response.ok) {
      // Log more details from responseData if available
      const errorDetails = responseData.message || responseData.error || JSON.stringify(responseData);
      console.error(`Creatomate API Error ${response.status}: ${errorDetails}`);
      throw new Error(`Creatomate API Error (${response.status}): ${errorDetails}`);
    }
    
    // Expecting an array of render objects
    if (Array.isArray(responseData) && responseData.length > 0) {
      // For simplicity, returning the first render object. 
      // Real implementation might need to handle multiple renders or specific IDs.
      return responseData[0]; 
    } else {
      console.error('Creatomate API did not return the expected array of renders:', responseData);
      throw new Error('Unexpected response format from Creatomate API.');
    }

  } catch (error) {
    console.error('Error in callCreatomateAPI:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

/**
 * Renders a video using Creatomate's Voiceover Template.
 * @param {Array<object>} timelineItems - Array of items from the timeline, e.g., [{ url, caption, type }]
 *                                       Expects items to have 'url' for image/video source and 'caption' for voiceover.
 * @returns {Promise<object>} - A promise that resolves to the Creatomate render object.
 */
export async function renderVoiceoverVideoWithCreatomate(timelineItems) {
  if (!timelineItems || timelineItems.length === 0) {
    throw new Error("Timeline items are required for the voiceover video.");
  }
  if (timelineItems.length > 4) {
    // Template supports up to 4 images/voiceovers based on example
    console.warn("Voiceover template currently supports up to 4 items. Using the first 4.");
    timelineItems = timelineItems.slice(0, 4);
  }

  const modifications = {};
  timelineItems.forEach((item, index) => {
    const itemNumber = index + 1;
    if (item.type === 'image' || item.isVideo) { // Treat timeline videos as images for this template
      modifications[`Image-${itemNumber}.source`] = item.url;
    } else {
       // Fallback if not an image or video URL, or handle differently
      modifications[`Image-${itemNumber}.source`] = "https://creatomate-static.s3.amazonaws.com/demo/image1.jpg"; // Default placeholder
    }
    modifications[`Voiceover-${itemNumber}.source`] = item.caption || ""; // Use caption for voiceover
  });

  // Fill remaining template slots if fewer than 4 items provided
  for (let i = timelineItems.length + 1; i <= 4; i++) {
    modifications[`Image-${i}.source`] = "https://creatomate-static.s3.amazonaws.com/demo/transparent.png"; // Placeholder for unused image slots
    modifications[`Voiceover-${i}.source`] = ""; // Empty voiceover for unused slots
  }

  const payload = {
    template_id: VOICECHOVER_TEMPLATE_ID,
    modifications: modifications,
    // webhook_url: "YOUR_WEBHOOK_URL" // Optional: for status updates
  };

  return callCreatomateAPI(payload);
}

/**
 * Renders a video using Creatomate's Product Showcase Template.
 * Assumes the first timeline item is the main product.
 * @param {object} productItem - The main product item from the timeline { url, caption, name?, description? }
 * @param {object} branding - Optional branding info { websiteUrl, ctaText }
 * @returns {Promise<object>} - A promise that resolves to the Creatomate render object.
 */
export async function renderProductShowcaseVideoWithCreatomate(productItem, branding = {}) {
  if (!productItem || !productItem.url) {
    throw new Error("A product item with an image URL is required for the product showcase video.");
  }

  // Extract details. Product name and description might come from the caption or dedicated fields.
  // For this example, let's try to parse from caption or use defaults.
  let productName = "Awesome Product";
  let productDescription = "Check out this amazing product, now available!";
  
  if (productItem.caption) {
      // Simple split, real app might have structured data
      const parts = productItem.caption.split('-');
      if (parts.length > 0) productName = parts[0].trim();
      if (parts.length > 1) productDescription = parts.slice(1).join('-').trim();
  }
  // If productItem has name/description properties, prefer those
  productName = productItem.name || productName;
  productDescription = productItem.description || productDescription;


  const modifications = {
    "Product-Image.source": productItem.url,
    "Product-Name.text": productName,
    "Product-Description.text": productDescription,
    "Normal-Price.text": productItem.normalPrice || "$ 109.99", // Example, make dynamic
    "Discounted-Price.text": productItem.discountedPrice || "$ 89.99", // Example, make dynamic
    "CTA.text": branding.ctaText || "Follow us for more!",
    "Website.text": branding.websiteUrl || "www.example.com"
  };

  const payload = {
    template_id: PRODUCT_SHOWCASE_TEMPLATE_ID,
    modifications: modifications,
  };

  return callCreatomateAPI(payload);
}


/**
 * Polls the Creatomate API for the status of a render.
 * @param {string} renderId - The ID of the render to poll.
 * @param {function} onProgress - Optional callback for progress updates.
 * @param {number} interval - Polling interval in milliseconds.
 * @param {number} timeout - Total timeout in milliseconds.
 * @returns {Promise<object>} - A promise that resolves to the final render object when 'succeeded' or 'failed'.
 */
export async function pollCreatomateRenderStatus(renderId, onProgress, interval = 5000, timeout = 300000) { // 5 min timeout
  if (!CREATOMATE_API_KEY) {
    throw new Error("Creatomate API Key is not configured.");
  }
  const startTime = Date.now();

  return new Promise(async (resolve, reject) => {
    const checkStatus = async () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Polling timed out for render ID: ${renderId}`));
        return;
      }

      try {
        const response = await fetch(`${CREATOMATE_API_URL}/${renderId}`, {
          headers: {
            'Authorization': `Bearer ${CREATOMATE_API_KEY}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorDetails = errorData.message || JSON.stringify(errorData);
          console.error(`Error polling Creatomate status ${response.status}: ${errorDetails}`);
          // Depending on error, might want to retry or fail
          if (response.status === 404) { // Render ID not found, likely permanent failure
            reject(new Error(`Render ID ${renderId} not found. Polling failed.`));
            return;
          }
          // For other errors, continue polling or implement retry logic
        } else {
            const renderData = await response.json();
            if (onProgress) {
                onProgress(renderData); // Call progress callback
            }

            console.log(`Poll status for ${renderId}: ${renderData.status}`);

            if (renderData.status === 'succeeded') {
                resolve(renderData);
                return;
            } else if (renderData.status === 'failed') {
                console.error(`Render ${renderId} failed: ${renderData.error_message}`);
                reject(new Error(renderData.error_message || `Render failed for ID: ${renderId}`));
                return;
            }
        }
      } catch (error) {
        console.error(`Error during polling for render ${renderId}:`, error);
        // Continue polling on network errors, or reject based on error type
      }

      setTimeout(checkStatus, interval);
    };

    checkStatus();
  });
}
