
import { GoogleGenAI } from "@google/genai";

// Initialize GoogleGenAI with API key directly from environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function summarizeImpact(programData: string) {
  try {
    // Generate content using the recommended model and passing model name + prompt directly
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the impact and provide a call to action based on this program data: ${programData}`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    // Access the text property directly from the response object
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate summary at this time.";
  }
}
