import { logger } from "../lib/logger";

export async function generateAnswer(question: string, context: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  const messages = [
    {
      role: "system",
      content: "You are a university information assistant. You ONLY output the direct answer with no thinking, no reasoning, no explanation. Just the facts asked."
    },
    {
      role: "user", 
      content: `Based on this context:\n${context}\n\nAnswer this question with ONLY the direct answer, no reasoning:\n${question}`
    }
  ];

  logger.info({ question: question.substring(0, 100) }, "Sending question to OpenRouter");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      messages,
      max_tokens: 1000,
    }),
  });

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content?.trim() || "";
  
  // Extract last meaningful block (skip reasoning paragraphs)
  const blocks = rawContent.split(/\n{2,}/);
  const lastBlock = blocks.filter((b: string) => b.trim().length > 0).pop() || rawContent;
  
  const answer = lastBlock.trim() || "I could not generate an answer. Please try again.";

  logger.info("OpenRouter response received");
  return answer;
}
