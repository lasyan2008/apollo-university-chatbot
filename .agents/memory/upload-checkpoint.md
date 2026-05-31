---
name: Upload script checkpoint
description: The Pinecone upload script uses .upload_checkpoint.json to resume interrupted runs.
---

`scripts/src/uploadDocs.ts` writes `.upload_checkpoint.json` at the workspace root after each file completes. On re-run, any file listed in the checkpoint is skipped.

**Why:** The embedding + upsert loop takes several minutes for 42 large files (~10k+ total chunks). The bash tool has a 2-minute timeout, so the script needed resume capability to make incremental progress.

**How to apply:**
- To resume an interrupted upload: just re-run `pnpm --filter @workspace/scripts run upload` — it picks up where it left off.
- To re-upload everything from scratch: delete `.upload_checkpoint.json` first, then run the script.
- Pinecone upserts are idempotent (same ID = overwrite), so partial re-uploads are safe.
