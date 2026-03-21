import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || undefined;

export const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  ...(QDRANT_API_KEY && { apiKey: QDRANT_API_KEY }),
});

export async function ensureUserCollection(userId: string): Promise<string> {
  const collectionName = `user_${userId}`;

  const { collections } = await qdrantClient.getCollections();
  const exists = collections.some((c) => c.name === collectionName);

  if (!exists) {
    await qdrantClient.createCollection(collectionName, {
      vectors: { size: 768, distance: "Cosine" },
    });
    console.log(`Created Qdrant collection: ${collectionName}`);
  }

  return collectionName;
}
