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
7. If the question is partially answerable, answer what you can and note what is missing.`;

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
