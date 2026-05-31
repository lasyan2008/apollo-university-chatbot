# Apollo University Smart Chatbot

A full-stack RAG chatbot that lets students ask questions about their academic programme — syllabus, attendance rules, exam schedules, and more — with answers grounded in uploaded university documents.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/scripts run upload` — chunk and upload docs from `/docs/` to Pinecone

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (artifacts/apollo-chatbot)
- Backend: Express 5 (artifacts/api-server)
- Vector DB: Pinecone (index: `apollo-university`, 384 dims, cosine)
- LLM: Groq API (`llama3-8b-8192`)
- Embeddings: `@xenova/transformers` — `Xenova/all-MiniLM-L6-v2` running locally (no API call needed)
- Styling: Tailwind CSS with Apollo navy (#1a237e) + gold (#ffd700) theme
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas
- `artifacts/api-server/src/services/` — embeddings, Pinecone, Groq service modules
- `artifacts/api-server/src/lib/schoolsData.ts` — hardcoded schools/branches data
- `artifacts/apollo-chatbot/src/` — React frontend (all 4 screens in App.tsx)
- `docs/` — place `.txt` documents here by school folder (SOT/, SOM/, SOHS/, AIPS/, SOSS/)
- `scripts/src/uploadDocs.ts` — document chunking + Pinecone upload script

## Architecture decisions

- Embeddings run **locally** via `@xenova/transformers` (Xenova/all-MiniLM-L6-v2) — no HuggingFace API call needed at chat time. The model is downloaded on first use and cached.
- `@xenova/transformers` is **externalized** in esbuild (not bundled) so it loads from node_modules at runtime.
- The chat route queries Pinecone **twice** per request: once filtered by `branch_id` (5 results) and once by `academic_calendar` (2 results), then merges context.
- All 4 UI screens (Greeting → Schools → Programmes → Chat) are **state-driven** in a single React component — no routing needed.
- Schools data is **hardcoded** in `schoolsData.ts` on the server and exposed via `GET /api/schools`.

## Product

- Step 1: Greeting screen with "Get Started" button
- Step 2: School selection (5 schools shown as cards with programme counts)
- Step 3: Programme selection for the chosen school
- Step 4: Chat window with suggested question chips, real-time RAG answers, and source citations

## Uploading Documents

1. Place `.txt` files in `docs/<SCHOOL_ID>/<branch_id>.txt` (e.g. `docs/SOT/btech_cse.txt`)
2. Place `docs/academic_calendar.txt` for general calendar content
3. Run: `pnpm --filter @workspace/scripts run upload`
4. The script chunks text (500 chars, 50 overlap), generates embeddings locally, and upserts to Pinecone

## Required Secrets

- `GROQ_API_KEY` — from console.groq.com
- `PINECONE_API_KEY` — from app.pinecone.io
- `HUGGING_FACE_API_KEY` — optional, not used at runtime (embeddings are local)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `@xenova/transformers` must be **externalized** in `build.mjs` — it cannot be bundled by esbuild because it uses dynamic imports and ONNX model files. It's already listed in the `external` array.
- `onnxruntime-node` and `sharp` must be in `pnpm-workspace.yaml` → `onlyBuiltDependencies` so their native binaries are compiled on install.
- The Pinecone index must be created manually at app.pinecone.io with **384 dimensions** and **cosine** metric before uploading docs.
- Run `pnpm --filter @workspace/scripts run upload` **before** the first chat — without documents in Pinecone, all answers will say "not available yet".
- Do NOT run `pnpm dev` at the workspace root — use workflows or `pnpm --filter` per package.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
