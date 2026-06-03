import { logger } from "../lib/logger";

const SYSTEM_PROMPT = `You are Apollo University's official academic assistant. Answer questions DIRECTLY and CONCISELY based ONLY on the provided context.
- Give direct answers without explaining your reasoning process
- Never show your thinking or reasoning process
- Answer immediately without preamble
- Use bullet points for lists
- Keep answers short and to the point
- For dates, give the exact date only
- For subject lists, list all subjects found in context
- If answer is not in context, say 'I don't have information about this. Please contact the university directly.'`;

export async function generateAnswer(question: string, context: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  const prompt = `Context from official university documents:
${context}

Question: ${question}

Answer directly and concisely based only on the context above.`;

  logger.info({ question: question.substring(0, 100) }, "Sending question to OpenRouter");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      max_tokens: 800,
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const reasoning = data.choices?.[0]?.message?.reasoning ?? "";
  
  const answer = content.trim() || reasoning.trim() || "I could not generate an answer. Please try again.";

  logger.info("OpenRouter response received");
  return answer;
}
