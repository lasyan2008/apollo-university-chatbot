import Groq from "groq-sdk";
import { logger } from "../lib/logger";

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is not set");
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

const SYSTEM_PROMPT = `You are Apollo University's official academic assistant.

Your job is to answer student questions using the provided context excerpts from the university's official documents.

Rules:
1. Read ALL the context carefully before answering.
2. Synthesize information across multiple context sections — the answer may be spread across several excerpts.
3. If the context contains relevant information, provide a clear, complete answer with specific details (course names, credit hours, percentages, dates, etc.).
4. Format your answers with bullet points or numbered lists when listing subjects, rules, or steps.
5. Only say "I don't have information about this" if the context genuinely contains NO relevant details whatsoever.
6. Never make up information — only use what is explicitly stated in the context.
7. If the question is partially answerable, answer what you can and note what is missing.

CRITICAL — Batch Year Matching:
- The academic calendar context contains sections for DIFFERENT admitted batches (e.g. "2021-22 ADMITTED BATCH", "2022-23 ADMITTED BATCH", "2023-24 ADMITTED BATCH", "2024-25 ADMITTED BATCH", "2025-26 ADMITTED BATCH").
- Each section header looks like: === 2024-25 ADMITTED BATCH - III SEMESTER ===
- If the student's question mentions a specific batch year (e.g. "2024-25 batch"), you MUST ONLY use dates from the section whose header exactly matches that batch year.
- NEVER mix dates from different batch years. If you see "2023-24" and "2024-25" sections in the context, pick only the one that matches the question.
- If no batch year is mentioned in the question, use the most recent batch section available.`;

export async function generateAnswer(question: string, context: string): Promise<string> {
  const client = getGroqClient();

  const userMessage = `Context from official university documents:
${context}

Question: ${question}

Please answer based only on the context provided above.`;

  logger.info({ question: question.substring(0, 100) }, "Sending question to Groq");

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.1,
    max_tokens: 1024,
  });

  const answer = completion.choices[0]?.message?.content ?? "I could not generate an answer. Please try again.";
  logger.info("Groq response received");
  return answer;
}
