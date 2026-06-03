import { logger } from "../lib/logger";

const SYSTEM_PROMPT = `You are Apollo University's academic assistant. Answer ONLY from the provided context. List ALL subjects/items found in context. If not in context, say 'I don't have information about this. Please contact the university directly.'`;

export async function generateAnswer(question: string, context: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  const prompt = `${SYSTEM_PROMPT}

Context from official university documents:
${context}

Question: ${question}

Please answer based only on the context provided above.`;

  logger.info({ question: question.substring(0, 100) }, "Sending question to OpenRouter");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 800,
    }),
  });

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content ?? "I could not generate an answer. Please try again.";

  logger.info("OpenRouter response received");
  return answer;
}
