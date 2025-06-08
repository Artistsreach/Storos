import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { podProductsList, productTypeOptions } from '@/lib/constants';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const defaultPodProductNames = ["Shirt", "Mug", "Hat", "Totebag", "Poster"];

export async function analyzeStorePromptForStrategy(userStorePrompt, productTypeNiche) {
  if (!API_KEY) {
    console.error("[geminiPromptAnalysis] VITE_GEMINI_API_KEY is not available.");
    return { error: "API key not configured.", strategy: "error" };
  }
  if (!userStorePrompt) {
    console.warn("[geminiPromptAnalysis] User store prompt is empty. Defaulting to standard strategy.");
    return { strategy: "standard", theme: "General", requestedProductTypes: [], isPod: false, podConfidence: 0, suggestedPodProducts: [] };
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash-latest", safetySettings });

  const podProductNamesString = podProductsList.map(p => p.name).join(", ");
  const productTypeLabel = productTypeOptions.find(pt => pt.value === productTypeNiche)?.label || productTypeNiche || "General";

  const prompt = `
    Analyze the following user prompt for an e-commerce store and the store's product niche.
    User Prompt: "${userStorePrompt}"
    Product Niche: "${productTypeLabel}"
    Available Print-on-Demand (POD) base product types: ${podProductNamesString}.

    Your goal is to determine the best product generation strategy.

    Consider these scenarios:
    1.  If the prompt explicitly mentions "print on demand", "POD", "custom designs on products", "merch", or implies selling items like t-shirts, mugs, posters with custom graphics, or a store themed around a concept (e.g., "Spiderman store", "cat lovers store") where designs are applied to standard products.
    2.  If the prompt requests specific products that are typically print-on-demand (e.g., "I want to sell t-shirts and hoodies with my art", "custom phone cases").
    3.  If the prompt describes a theme (e.g., "a store for coffee lovers", "a store about space exploration") but doesn't specify products, AND the niche is NOT typically print-on-demand (e.g., food, high-end jewelry, complex electronics, furniture). In this case, a POD strategy might be appropriate to offer themed merchandise.
    4.  If the prompt requests products that are clearly NOT print-on-demand (e.g., "gourmet chocolates", "handmade silver necklaces", "custom-built drones", "artisanal wooden tables"), or if the niche itself strongly indicates non-POD products (e.g., "Restaurant", "Tech Repair Service").
    5.  If the prompt is very generic or doesn't give enough information to lean towards POD.

    Based on your analysis, return a JSON object with the following structure:
    {
      "isPod": boolean, // True if the store is likely print-on-demand focused or should use POD products.
      "podConfidence": number, // Confidence score (0.0 to 1.0) for isPod.
      "theme": "string", // A concise theme extracted from the prompt (e.g., "Vintage Cars", "Abstract Art", "Funny Quotes", "Spiderman"). If no clear theme, use "General".
      "requestedProductTypes": ["string"], // Array of specific product names mentioned in the prompt that match or are very similar to the available POD base product types. (e.g., ["Shirt", "Mug"]). Empty if none.
      "suggestedPodProducts": ["string"], // If isPod is true and requestedProductTypes is empty, suggest 3-5 relevant POD base product types from the available list based on the theme/niche. (e.g., ["Shirt", "Mug", "Poster"]). Empty otherwise.
      "generationStrategy": "string" // One of: "standard", "pod_theme_visualization", "pod_specific_products", "error"
    }

    Strategy decision logic:
    -   If "isPod" is true AND "requestedProductTypes" has items: "generationStrategy" should be "pod_specific_products".
    -   If "isPod" is true AND "requestedProductTypes" is empty (implying a themed POD store but no specific products mentioned by user): "generationStrategy" should be "pod_theme_visualization". Use "suggestedPodProducts" for this.
    -   If "isPod" is false: "generationStrategy" should be "standard".
    -   If the niche is something like food, complex tech, high-end jewelry, furniture, and the prompt doesn't strongly push for POD merch, lean towards "standard" even if a theme is mentioned. For example, a "Spiderman themed restaurant" is still "standard" for food products. A "Spiderman store" (general merch) is "pod_theme_visualization".

    Example 1 (Specific POD products):
    User Prompt: "I want to create a store selling t-shirts and coffee mugs with cool dog designs."
    Product Niche: "Fashion & Apparel"
    Expected Output: { "isPod": true, "podConfidence": 0.9, "theme": "Cool Dog Designs", "requestedProductTypes": ["Shirt", "Mug"], "suggestedPodProducts": [], "generationStrategy": "pod_specific_products" }

    Example 2 (Themed POD store, no specific products):
    User Prompt: "A store for fans of classic horror movies, with iconic imagery."
    Product Niche: "General Merchandise"
    Expected Output: { "isPod": true, "podConfidence": 0.8, "theme": "Classic Horror Movies", "requestedProductTypes": [], "suggestedPodProducts": ["Shirt", "Poster", "Mug", "Canvas"], "generationStrategy": "pod_theme_visualization" }

    Example 3 (Standard store, non-POD niche):
    User Prompt: "Selling delicious artisanal cookies and pastries."
    Product Niche: "Food & Beverage"
    Expected Output: { "isPod": false, "podConfidence": 0.1, "theme": "Artisanal Cookies and Pastries", "requestedProductTypes": [], "suggestedPodProducts": [], "generationStrategy": "standard" }

    Example 4 (Themed store, but niche is non-POD, so standard products for niche, POD for merch):
    User Prompt: "A high-tech gadget store with a cyberpunk theme."
    Product Niche: "Electronics & Gadgets"
    Expected Output: { "isPod": false, "podConfidence": 0.3, "theme": "Cyberpunk", "requestedProductTypes": [], "suggestedPodProducts": [], "generationStrategy": "standard" }
    (Note: The task description implies if niche is non-POD but theme is present, we *should* call POD flow. Let's adjust this example's expectation for the AI)
    Revised Example 4 (Themed store, niche non-POD, but POD for merch is desired):
    User Prompt: "A high-tech gadget store with a cyberpunk theme. I want some cool merch too."
    Product Niche: "Electronics & Gadgets"
    Expected Output: { "isPod": true, "podConfidence": 0.7, "theme": "Cyberpunk", "requestedProductTypes": [], "suggestedPodProducts": ["Shirt", "Poster", "Mug"], "generationStrategy": "pod_theme_visualization" }


    Example 5 (Unique products, not POD):
    User Prompt: "I craft unique, handmade wooden sculptures."
    Product Niche: "Art & Collectibles"
    Expected Output: { "isPod": false, "podConfidence": 0.05, "theme": "Handmade Wooden Sculptures", "requestedProductTypes": [], "suggestedPodProducts": [], "generationStrategy": "standard" }

    Example 6 (Generic prompt, default to standard):
    User Prompt: "My new online shop"
    Product Niche: "General Merchandise"
    Expected Output: { "isPod": false, "podConfidence": 0.2, "theme": "General", "requestedProductTypes": [], "suggestedPodProducts": [], "generationStrategy": "standard" }

    Example 7 (Store theme implies POD, niche is general):
    User Prompt: "A store for all things Spiderman!"
    Product Niche: "General Merchandise"
    Expected Output: { "isPod": true, "podConfidence": 0.9, "theme": "Spiderman", "requestedProductTypes": [], "suggestedPodProducts": ["Shirt", "Poster", "Mug", "Hat", "Canvas"], "generationStrategy": "pod_theme_visualization" }

    Ensure the "theme" is concise. If "requestedProductTypes" are found, "suggestedPodProducts" should usually be empty. If "isPod" is true and "requestedProductTypes" is empty, "suggestedPodProducts" MUST be populated with 3-5 relevant items from the available POD list.
    The entire response MUST be a single JSON object.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    let jsonOutput;
    // Try to find JSON within markdown code block ```json ... ```
    const markdownJsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownJsonMatch && markdownJsonMatch[1]) {
      jsonOutput = JSON.parse(markdownJsonMatch[1]);
    } else {
      // If no markdown block, find the first '{' and last '}'
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        jsonOutput = JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } else {
        throw new Error("No JSON object found in response.");
      }
    }

    // Basic validation and default suggestedPodProducts if needed
    if (jsonOutput.isPod && (!jsonOutput.requestedProductTypes || jsonOutput.requestedProductTypes.length === 0) && (!jsonOutput.suggestedPodProducts || jsonOutput.suggestedPodProducts.length === 0)) {
      jsonOutput.suggestedPodProducts = defaultPodProductNames.slice(0, Math.floor(Math.random() * 3) + 3); // Suggest 3-5 random defaults
      console.warn(`[geminiPromptAnalysis] POD strategy indicated but no specific or suggested POD products returned by AI. Defaulting suggestions: ${jsonOutput.suggestedPodProducts.join(', ')}`);
    }
    if (!jsonOutput.strategy) { // Fallback strategy if missing
        if (jsonOutput.isPod && jsonOutput.requestedProductTypes && jsonOutput.requestedProductTypes.length > 0) {
            jsonOutput.strategy = "pod_specific_products";
        } else if (jsonOutput.isPod) {
            jsonOutput.strategy = "pod_theme_visualization";
        } else {
            jsonOutput.strategy = "standard";
        }
    }


    console.log("[geminiPromptAnalysis] Analysis result:", jsonOutput);
    return jsonOutput;

  } catch (error) {
    console.error("[geminiPromptAnalysis] Error analyzing store prompt:", error);
    return { error: error.message, strategy: "error", theme: "General", requestedProductTypes: [], isPod: false, podConfidence: 0, suggestedPodProducts: [] };
  }
}
