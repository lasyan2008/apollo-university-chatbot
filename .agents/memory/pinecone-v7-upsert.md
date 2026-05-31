---
name: Pinecone v7 upsert API
description: Pinecone SDK v7 changed the upsert call signature — must pass { records: batch } not the array directly.
---

In Pinecone SDK v7 (`@pinecone-database/pinecone@7.x`), the `upsert` method no longer accepts a plain array.

**Correct:**
```ts
await index.upsert({ records: batch });
```

**Wrong (v3/v4 style — throws "Must pass in at least 1 record"):**
```ts
await index.upsert(batch);
```

**Why:** The validator in `UpsertCommand` checks `options.records`, not the top-level argument. Passing a bare array means `options.records` is `undefined`, so the guard fires even with a full batch.

**How to apply:** Any time you write or review Pinecone upsert code in this project, ensure `{ records: ... }` wrapping is present.
