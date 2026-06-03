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

const SYSTEM_PROMPT = `You are Apollo University's academic assistant. Answer ONLY from the provided context. List ALL subjects/items found in context. If not in context, say 'I don't have information about this. Please contact the university directly.'`;
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
    max_tokens: 800,
  });

  const answer = completion.choices[0]?.message?.content ?? "I could not generate an answer. Please try again.";
  logger.info("Groq response received");
  return answer;
}
