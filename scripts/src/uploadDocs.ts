import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers";
import { Pinecone } from "@pinecone-database/pinecone";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, "../../docs");
const CHECKPOINT_FILE = path.resolve(__dirname, "../../.upload_checkpoint.json");
const CHUNK_SIZE = 3000;
const CHUNK_OVERLAP = 300;
const BATCH_SIZE = 100;

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
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
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

function loadCheckpoint(): Set<string> {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, "utf-8")) as string[];
    return new Set(data);
  }
  return new Set();
}

function saveCheckpoint(done: Set<string>): void {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify([...done], null, 2));
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
        branch_id = path.basename(entry.name, ".txt");
        school_id = "general";
      } else {
        school_id = parts[0];
        branch_id = path.basename(entry.name, ".txt");
      }
      results.push({ filePath: fullPath, branch_id, school_id, source_file: relativePath });
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
  const done = loadCheckpoint();

  const remaining = docFiles.filter((d) => !done.has(d.source_file));
  const skipped = docFiles.length - remaining.length;

  console.log(`Found ${docFiles.length} document files`);
  if (skipped > 0) console.log(`Skipping ${skipped} already-uploaded files (checkpoint)\n`);

  let totalUploaded = 0;

  for (const doc of remaining) {
    const rawText = fs.readFileSync(doc.filePath, "utf-8");
    const chunks = chunkText(rawText);

    if (chunks.length === 0) {
      console.log(`Skipping ${doc.source_file} — no content`);
      done.add(doc.source_file);
      saveCheckpoint(done);
      continue;
    }

    console.log(`Processing ${doc.source_file} — ${chunks.length} chunks`);

    let batch: Array<{ id: string; values: number[]; metadata: Record<string, unknown> }> = [];
    let batchNum = 0;

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i]);
      batch.push({
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

      if (batch.length >= BATCH_SIZE || i === chunks.length - 1) {
        if (batch.length > 0) {
          await index.upsert({ records: batch });
          batchNum++;
          console.log(`  Batch ${batchNum} (chunks ${i - batch.length + 2}–${i + 1} of ${chunks.length})`);
          totalUploaded += batch.length;
          batch = [];
        }
      }
    }

    done.add(doc.source_file);
    saveCheckpoint(done);
    console.log(`  ✓ Done: ${doc.source_file}\n`);
  }

  if (remaining.length === 0) {
    console.log("All documents already uploaded! To re-upload, delete .upload_checkpoint.json");
  } else {
    console.log(`\nUpload complete! Total vectors upserted this run: ${totalUploaded}`);
    console.log(`Total files done: ${done.size}/${docFiles.length}`);
  }
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
