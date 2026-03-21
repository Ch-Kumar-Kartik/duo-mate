import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "gemini-embedding-001";
const OUTPUT_DIMENSIONALITY = parseInt(process.env.EMBEDDING_DIMENSIONS || "768", 10);
const MAX_RETRIES = 5;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  let retries = 0;

  while (retries <= MAX_RETRIES) {
    try {
      const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: texts,
        config: {
          outputDimensionality: OUTPUT_DIMENSIONALITY,
        },
      });

      if (!response.embeddings || response.embeddings.length === 0) {
        throw new Error("Gemini embedding API returned no embeddings");
      }

      return response.embeddings.map((e: { values?: number[] }) => e.values ?? []);
    } catch (err: any) {
      const status = err?.status ?? err?.code ?? err?.response?.status;

      if (status === 429 && retries < MAX_RETRIES) {
        const wait = 2 ** retries * 2000;
        console.warn(
          `Rate limited, retrying in ${wait / 1000}s (${retries + 1}/${MAX_RETRIES})`
        );
        await sleep(wait);
        retries++;
        continue;
      }

      throw new Error(`Gemini embedding error: ${JSON.stringify(err?.message || err)}`);
    }
  }

  throw new Error("Gemini embedding: max retries exceeded (rate limited)");
}
