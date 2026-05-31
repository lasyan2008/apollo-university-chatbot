import { Pinecone } from "@pinecone-database/pinecone";
import { logger } from "../lib/logger";

let pineconeClient: Pinecone | null = null;

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error("PINECONE_API_KEY environment variable is not set");
    }
    pineconeClient = new Pinecone({ apiKey });
  }
  return pineconeClient;
}

export interface PineconeMatch {
  id: string;
  score: number;
  metadata: {
    branch_id?: string;
    school_id?: string;
    source_file?: string;
    chunk_index?: number;
    text?: string;
  };
}

export async function queryPinecone(
  vector: number[],
  topK: number = 5,
  filter?: Record<string, string>
): Promise<PineconeMatch[]> {
  const client = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX ?? "apollo-university";

  logger.info({ indexName, topK, filter }, "Querying Pinecone");

  const index = client.index(indexName);

  const queryRequest: Parameters<typeof index.query>[0] = {
    vector,
    topK,
    includeMetadata: true,
  };

  if (filter && Object.keys(filter).length > 0) {
    queryRequest.filter = filter;
  }

  const response = await index.query(queryRequest);

  return (response.matches ?? []).map((match) => ({
    id: match.id,
    score: match.score ?? 0,
    metadata: (match.metadata ?? {}) as PineconeMatch["metadata"],
  }));
}
