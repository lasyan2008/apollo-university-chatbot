import { logger } from "../lib/logger";

const HF_API_URL =
  "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.HUGGING_FACE_API_KEY;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  logger.info("Generating embedding via HuggingFace Inference API");

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error({ status: response.status, error: errorText }, "HuggingFace API error");
    throw new Error(`HuggingFace API error ${response.status}: ${errorText}`);
  }

  const result = (await response.json()) as number[] | number[][];

  // API may return [embedding] or embedding directly depending on input type
  const embedding = Array.isArray(result[0]) ? (result[0] as number[]) : (result as number[]);

  logger.info({ dims: embedding.length }, "Embedding generated");
  return embedding;
}
