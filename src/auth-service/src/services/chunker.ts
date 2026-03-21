import { IChunk } from "../types/feature.js";

const WINDOW_SIZE = 500;
const OVERLAP = 50;

interface ChunkMetadata {
  subject: string;
  from: string;
  date: Date;
}

export function chunkText(
  text: string,
  sourceEmailId: string,
  metadata: ChunkMetadata
): IChunk[] {
  const words = text.split(/\s+/).filter((w) => w.length > 0);

  if (words.length === 0) return [];

  if (words.length <= WINDOW_SIZE) {
    return [
      {
        chunkIndex: 0,
        sourceEmailId,
        text: words.join(" "),
        subject: metadata.subject,
        from: metadata.from,
        date: metadata.date,
      },
    ];
  }

  const chunks: IChunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < words.length) {
    const end = Math.min(start + WINDOW_SIZE, words.length);
    chunks.push({
      chunkIndex,
      sourceEmailId,
      text: words.slice(start, end).join(" "),
      subject: metadata.subject,
      from: metadata.from,
      date: metadata.date,
    });

    chunkIndex++;
    start += WINDOW_SIZE - OVERLAP;

    if (start + OVERLAP >= words.length) break;
  }

  return chunks;
}
