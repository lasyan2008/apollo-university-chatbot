import { logger } from "../lib/logger";

const SYSTEM_PROMPT = `You are Apollo University's official academic assistant. Answer questions DIRECTLY and CONCISELY based ONLY on the provided context. 
- Give direct answers without explaining your reasoning process
- Use bullet points for lists
- Keep answers short and to the point
- Do not show your thinking process
- If answer is not in context, say 'I don't have information about this. Please contact the university directly.'`;
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
      model: "qwen/qwen3-coder:free",
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
