---
name: Groq model deprecation
description: llama3-8b-8192 is decommissioned; current replacement is llama-3.3-70b-versatile.
---

`llama3-8b-8192` was decommissioned by Groq as of mid-2025. Attempting to use it returns HTTP 400 `model_decommissioned`.

**Current model in use:** `llama-3.3-70b-versatile`

**Why:** Groq periodically retires older model versions. Check https://console.groq.com/docs/deprecations if the model starts failing again.

**How to apply:** If chat requests start returning 400 errors from Groq, check the model name in `artifacts/api-server/src/services/groq.ts` first.
