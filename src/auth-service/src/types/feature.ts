export interface IChunk {
  chunkIndex: number;
  sourceEmailId: string;
  text: string;
  subject: string;
  from: string;
  date: Date;
}

export interface IEmbeddedChunk extends IChunk {
  embedding: number[];
}


export interface IVectorPoint {

  id: string;
  vector: number[];
  payload: {
    sourceEmailId: string;
    chunkIndex: number;
    text: string;
    subject: string;
    from: string;
    date: string;
  }
}


export interface IFeaturePipelineResult {
  emailsProcessed: number;
  chunksIndexed: number;
}
