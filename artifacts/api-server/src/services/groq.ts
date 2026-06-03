import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../lib/logger";

let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

const SYSTEM_PROMPT = `You are Apollo University's academic assistant. Answer ONLY from the provided context. List ALL subjects/items found in context. If not in context, say 'I don't have information about this. Please contact the university directly.'`;

export async function generateAnswer(question: string, context: string): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `${SYSTEM_PROMPT}

Context from official university documents:
${context}

Question: ${question}

Please answer based only on the context provided above.`;

  logger.info({ question: question.substring(0, 100) }, "Sending question to Gemini");

  const result = await model.generateContent(prompt);
  const answer = result.response.text();

  logger.info("Gemini response received");
  return answer;
}
