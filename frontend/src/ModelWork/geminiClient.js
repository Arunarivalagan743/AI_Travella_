import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODEL = "gemini-1.5-flash";
const configuredModel = import.meta.env.VITE_GOOGLE_GEMINI_MODEL;
const GEMINI_MODEL = (configuredModel && configuredModel.trim()) || DEFAULT_MODEL;

export const getGeminiModel = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: GEMINI_MODEL });
};

export const GEMINI_MODEL_NAME = GEMINI_MODEL;
