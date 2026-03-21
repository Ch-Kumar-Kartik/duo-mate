import { randomUUID } from "crypto";
import { Email } from "../models/email.model.js";
import { qdrantClient, ensureUserCollection } from "../config/qdrant.js";
import { cleanEmailBody } from "./text-cleaner.js";
import { chunkText } from "./chunker.js";
import { embedBatch } from "./embedder.js";
import type { IChunk, IVectorPoint, IFeaturePipelineResult } from "../types/feature.js";

const EMBEDDING_BATCH_SIZE = parseInt(process.env.EMBEDDING_BATCH_SIZE || "32", 10);

export class VectorIndexer {
  static async run(userId: string): Promise<IFeaturePipelineResult> {
    const emails = await Email.find({ userId, processed: false });

    if (emails.length === 0) {
      return { emailsProcessed: 0, chunksIndexed: 0 };
    }

    const allChunks: IChunk[] = [];

    for (const email of emails) {
      const cleanText = cleanEmailBody(email.bodyPlain, email.bodyHtml);
      if (!cleanText) continue;

      const chunks = chunkText(cleanText, email.messageId, {
        subject: email.subject,
        from: email.from,
        date: email.date,
      });
      allChunks.push(...chunks);
    }

    if (allChunks.length === 0) {
      await Email.updateMany(
        { userId, processed: false },
        { $set: { processed: true } }
      );
      return { emailsProcessed: emails.length, chunksIndexed: 0 };
    }

    const points: IVectorPoint[] = [];

    for (let i = 0; i < allChunks.length; i += EMBEDDING_BATCH_SIZE) {
      const batch = allChunks.slice(i, i + EMBEDDING_BATCH_SIZE);
      const texts = batch.map((c) => c.text);

      console.log(
        `[feature] embedding batch ${Math.floor(i / EMBEDDING_BATCH_SIZE) + 1}/${Math.ceil(allChunks.length / EMBEDDING_BATCH_SIZE)} (${texts.length} chunks)`
      );

      const embeddings = await embedBatch(texts);

      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        points.push({
          id: randomUUID(),
          vector: embeddings[j],
          payload: {
            sourceEmailId: chunk.sourceEmailId,
            chunkIndex: chunk.chunkIndex,
            text: chunk.text,
            subject: chunk.subject,
            from: chunk.from,
            date: chunk.date.toISOString(),
          },
        });
      }

      // Delay between batches to respect rate limits
      if (i + EMBEDDING_BATCH_SIZE < allChunks.length) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    const collectionName = await ensureUserCollection(userId);

    await qdrantClient.upsert(collectionName, {
      wait: true,
      points,
    });

    await Email.updateMany(
      { userId, processed: false },
      { $set: { processed: true } }
    );

    return {
      emailsProcessed: emails.length,
      chunksIndexed: points.length,
    };
  }
}
