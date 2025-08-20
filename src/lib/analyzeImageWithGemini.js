import { GoogleGenAI } from '@google/genai';

export async function analyzeImageDataUrl(dataUrl, prompt = 'Analyze this screenshot and summarize key UI elements, active files, and any potential issues or next actions.') {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*);base64/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  const contents = [
    { inlineData: { data: base64, mimeType } },
    { text: prompt },
  ];

  const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents });
  return res.text?.trim() || '(No response)';
}
