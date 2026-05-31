import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers";
import { Pinecone } from "@pinecone-database/pinecone";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, "../../docs");
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

let embeddingPipeline: FeatureExtractionPipeline | null = null;

async function getEmbeddingPipeline(): Promise<FeatureExtractionPipeline> {
  if (!embeddingPipeline) {
    console.log("Loading embedding model...");
    embeddingPipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("Model loaded");
  }
  return embeddingPipeline;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const pipe = await getEmbeddingPipeline();
  const output = await pipe(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

interface DocFile {
  filePath: string;
  branch_id: string;
  school_id: string;
  source_file: string;
}

function collectDocFiles(dir: string, baseDir: string = dir): DocFile[] {
  const results: DocFile[] = [];

  if (!fs.existsSync(dir)) {
    console.warn(`Docs directory not found: ${dir}`);
    return results;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectDocFiles(fullPath, baseDir));
    } else if (entry.name.endsWith(".txt")) {
      const relativePath = path.relative(baseDir, fullPath);
      const parts = relativePath.split(path.sep);
      let branch_id: string;
      let school_id: string;

      if (parts.length === 1) {
        // Root level file like academic_calendar.txt
        branch_id = path.basename(entry.name, ".txt");
        school_id = "general";
      } else {
        school_id = parts[0];
        branch_id = path.basename(entry.name, ".txt");
      }

      results.push({
        filePath: fullPath,
        branch_id,
        school_id,
        source_file: relativePath,
      });
    }
  }

  return results;
}

async function main() {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    console.error("PINECONE_API_KEY is not set");
    process.exit(1);
  }

  const indexName = process.env.PINECONE_INDEX ?? "apollo-university";
  const pinecone = new Pinecone({ apiKey });
  const index = pinecone.index(indexName);

  const docFiles = collectDocFiles(DOCS_DIR);
  console.log(`Found ${docFiles.length} document files`);

  for (const doc of docFiles) {
    const text = fs.readFileSync(doc.filePath, "utf-8");
    const chunks = chunkText(text);
    console.log(`\nProcessing ${doc.source_file} — ${chunks.length} chunks`);

    const vectors = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`  Uploading chunk ${i + 1} of ${chunks.length} from ${doc.source_file}...`);
      const embedding = await generateEmbedding(chunks[i]);
      vectors.push({
        id: `${doc.branch_id}_chunk_${i}`,
        values: embedding,
        metadata: {
          branch_id: doc.branch_id,
          school_id: doc.school_id,
          source_file: doc.source_file,
          chunk_index: i,
          text: chunks[i],
        },
      });
    }

    // Upload in batches of 100
    const BATCH_SIZE = 100;
    for (let b = 0; b < vectors.length; b += BATCH_SIZE) {
      const batch = vectors.slice(b, b + BATCH_SIZE);
      await index.upsert(batch);
      console.log(`  Uploaded batch ${Math.floor(b / BATCH_SIZE) + 1}`);
    }

    console.log(`  Done: ${doc.source_file}`);
  }

  console.log("\nAll documents uploaded successfully!");
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
