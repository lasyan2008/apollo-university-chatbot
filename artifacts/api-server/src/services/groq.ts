import { logger } from "../lib/logger";

const SYSTEM_PROMPT = `You are Apollo University's official academic assistant. Answer questions DIRECTLY and CONCISELY based ONLY on the provided context.
- Give direct answers without explaining your reasoning process
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
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
 const rawContent = data.choices?.[0]?.message?.content?.trim() || "";

// Split into paragraphs and find the last meaningful answer block
const paragraphs = rawContent.split(/\n{2,}/).filter((p: string) => p.trim().length > 0);

// Find last paragraph that looks like an actual answer (not reasoning)
let answer = "";
for (let i = paragraphs.length - 1; i >= 0; i--) {
  const para = paragraphs[i].trim();
  // Skip paragraphs that are pure reasoning
  if (para.match(/^(Let me|I need|Looking|I see|I find|However|But|So|Given|Actually|Now|First|Okay|We need|The question|Based on)/i)) {
    continue;
  }
  answer = para;
  break;
}

answer = answer || rawContent || "I could not generate an answer. Please try again.";
  logger.info("OpenRouter response received");
  return answer;
}
