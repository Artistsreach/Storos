import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

/**
 * Analyzes the content of a given URL using Gemini.
 * @param {string} url The URL to analyze.
 * @returns {Promise<string>} A promise that resolves to the analysis text.
 */
export const analyzeUrlContent = async (url) => {
  if (!url) {
    throw new Error("URL is required for analysis.");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-preview-0514",
      tools: [{ "urlContext": {} }],
    });

    const prompt = `
      Analyze the content of the provided URL and extract the following information:
      1.  **Primary Topic/Theme:** What is the main subject of the page? (e.g., "E-commerce site for handmade leather goods", "Blog about minimalist interior design").
      2.  **Brand/Store Name:** Identify the name of the brand or store.
      3.  **Key Products/Services:** List the main products or services offered.
      4.  **Target Audience:** Describe the likely target audience.
      5.  **Visual Style/Aesthetics:** Describe the visual design, color palette, and overall aesthetic of the website.
      6.  **Key Marketing Phrases/Slogans:** Extract any prominent marketing messages or slogans.

      URL: ${url}
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`Error analyzing URL ${url}:`, error);
    throw new Error(`Failed to analyze content for URL: ${url}.`);
  }
};

/**
 * Analyzes a list of URLs and synthesizes the findings.
 * @param {string[]} urls An array of URLs to analyze.
 * @returns {Promise<string>} A promise that resolves to a synthesized analysis.
 */
export const analyzeMultipleUrls = async (urls) => {
  if (!urls || urls.length === 0) {
    return "";
  }

  try {
    const analyses = await Promise.all(urls.map(url => analyzeUrlContent(url)));
    
    if (analyses.length === 1) {
      return analyses[0];
    }

    // If multiple URLs, synthesize the results
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-preview-0514" });
    const synthesisPrompt = `
      You have been provided with analyses from multiple URLs. Synthesize this information into a single, coherent summary. 
      Identify common themes, brand identity, product categories, and target audience. 
      If there are conflicting details, note them. The goal is to create a unified creative brief that can be used to generate a new online store.

      Analyses:
      ${analyses.join("\n\n---\n\n")}
    `;
    
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: synthesisPrompt }] }],
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error synthesizing URL analyses:", error);
    throw new Error("Failed to synthesize analyses from multiple URLs.");
  }
};
