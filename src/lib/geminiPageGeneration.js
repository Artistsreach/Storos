import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from "@google/genai";
import { fetchPexelsImages, fetchPexelsVideos } from "./utils.js";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const genAI = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The title of the website.",
    },
    primaryColor: {
      type: Type.STRING,
      description: "The primary color of the website, in hex format.",
    },
    imageQuery: {
      type: Type.STRING,
      description: "A search query for Pexels to find relevant images.",
    },
    videoQuery: {
      type: Type.STRING,
      description: "A search query for Pexels to find relevant videos.",
    },
    htmlContent: {
      type: Type.STRING,
      description: "The complete HTML code for the website, including CSS and JavaScript. Use placeholders like {{PEXELS_IMAGE_1}}, {{PEXELS_VIDEO_1}} for images and videos.",
    },
  },
  required: ["title", "primaryColor", "imageQuery", "videoQuery", "htmlContent"],
};

const modelConfig = {
  model: "gemini-2.5-pro",
  safetySettings,
  systemInstruction: `
    You are an expert web developer. Your task is to generate a complete, single-file HTML website based on the user's prompt.
    The generated file should include HTML, CSS, and JavaScript all in one file.
    The CSS should be included in a <style> tag in the <head>.
    The JavaScript should be included in a <script> tag at the end of the <body>.
    The website should be visually appealing, responsive, and fully functional. Any button with a link when clicked should open in a new tab.
    Every generated website must have a header with a backdrop-blur effect and a dark/light mode toggle.
    Use placeholders like {{PEXELS_IMAGE_1}}, {{PEXELS_VIDEO_1}} for images and videos that you want to be replaced with stock footage.
    Do not include any placeholder comments or explanations in the code.
    The output must be a JSON object with the keys "title", "primaryColor", "imageQuery", "videoQuery", and "htmlContent".
  `,
  config: {
    responseMimeType: "application/json",
    responseSchema,
    thinkingConfig: {
      includeThoughts: true,
      thinkingBudget: 8192,
    },
  },
};

export function startChat() {
  if (!API_KEY) {
    console.error("[geminiPageGeneration] VITE_GEMINI_API_KEY is not available.");
    throw new Error("Gemini API key is not configured.");
  }
  return genAI.chats.create(modelConfig);
}

export async function* continueChat(chat, prompt) {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      console.log(`[geminiPageGeneration] Attempt ${attempts} to continue chat...`);
      const stream = await chat.sendMessageStream({ message: prompt });

      let fullResponseText = "";
      for await (const chunk of stream) {
        for (const part of chunk.candidates[0].content.parts) {
          if (part.thought) {
            yield { type: 'thought', content: part.text };
          } else {
            fullResponseText += part.text;
          }
        }
        if (chunk.promptFeedback && chunk.promptFeedback.blockReason) {
            console.error(`[geminiPageGeneration] Prompt was blocked during streaming. Reason: ${chunk.promptFeedback.blockReason}`);
            throw new Error(`The prompt was blocked for safety reasons: ${chunk.promptFeedback.blockReason}`);
        }
      }
      
      const parsedResponse = JSON.parse(fullResponseText);
      let { title, primaryColor, imageQuery, videoQuery, htmlContent } = parsedResponse;

      if (htmlContent && htmlContent.trim().toLowerCase().startsWith('<!doctype html>')) {
        const [images, videos] = await Promise.all([
          fetchPexelsImages(imageQuery, 5),
          fetchPexelsVideos(videoQuery, 5),
        ]);

        for (let i = 0; i < 5; i++) {
          if (images[i]) {
            htmlContent = htmlContent.replace(new RegExp(`{{PEXELS_IMAGE_${i + 1}}}`, 'g'), images[i].src.large);
          }
          if (videos[i]) {
            htmlContent = htmlContent.replace(new RegExp(`{{PEXELS_VIDEO_${i + 1}}}`, 'g'), videos[i].url);
          }
        }

        // Ensure all links open in a new tab
        htmlContent = htmlContent.replace(/<a\s+(?!.*\btarget=)href=/g, '<a target="_blank" href=');

        console.log(`[geminiPageGeneration] Successfully generated website on attempt ${attempts}.`);
        yield { type: 'result', content: { title, primaryColor, htmlContent } };
        return;
      } else {
        console.warn(`[geminiPageGeneration] Attempt ${attempts} did not return valid HTML. Retrying...`);
      }
    } catch (error) {
      console.error(`[geminiPageGeneration] Error during attempt ${attempts}:`, error);
      if (attempts >= maxAttempts) {
        throw new Error("Failed to generate website after multiple attempts. Please check the console for details.");
      }
    }
  }
  throw new Error("Failed to generate a valid website after all attempts.");
}
