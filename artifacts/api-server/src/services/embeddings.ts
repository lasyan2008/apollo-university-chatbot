import { logger } from "../lib/logger";

// Disable image processor loading to avoid sharp native module issues
process.env["TRANSFORMERS_SKIP_IMAGE_PROCESSOR"] = "1";

let pipeline: ((text: string, options: Record<string, unknown>) => Promise<{ data: Float32Array }>) | null = null;

async function getEmbeddingPipeline() {
  if (!pipeline) {
    logger.info("Loading embedding model Xenova/all-MiniLM-L6-v2...");
    const { pipeline: createPipeline } = await import("@xenova/transformers");
    pipeline = await createPipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2") as typeof pipeline;
    logger.info("Embedding model loaded");
  }
  return pipeline!;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const pipe = await getEmbeddingPipeline();
  const output = await pipe(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}
