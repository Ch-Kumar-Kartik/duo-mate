import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY must be set in environment variables");
}

const model = process.env.MODEL;
if (!model) {
  throw new Error("MODEL must be set in environment variables");
}

export const GEMINI_MODEL = model;

export const ai = new GoogleGenAI({ apiKey });
