import { Router, type IRouter } from "express";
import { generateEmbedding } from "../services/embeddings";
import { queryPinecone } from "../services/pinecone";
import { generateAnswer } from "../services/groq";
import { SendChatMessageBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { question, branch_id } = parsed.data;

  try {
    const embedding = await generateEmbedding(question);

    const [branchMatches, calendarMatches] = await Promise.all([
      queryPinecone(embedding, 15, { branch_id }),
      queryPinecone(embedding, 3, { branch_id: "academic_calendar" }),
    ]);

    const allMatches = [...branchMatches, ...calendarMatches];

    if (allMatches.length === 0) {
      res.json({ answer: "Syllabus for this programme is not available yet. Please contact the university directly.", sources: [] });
      return;
    }

    const context = allMatches
      .filter((m) => m.metadata.text)
      .map((m) => `[Source: ${m.metadata.source_file ?? "unknown"}]\n${(m.metadata.text as string).slice(0, 800)}`)
      .join("\n\n---\n\n");

    if (!context.trim()) {
      res.json({ answer: "Syllabus for this programme is not available yet. Please contact the university directly.", sources: [] });
      return;
    }

    const answer = await generateAnswer(question, context);

    const sources = [
      ...new Set(
        allMatches
          .filter((m) => m.metadata.source_file)
          .map((m) => m.metadata.source_file as string)
      ),
    ];

    res.json({ answer, sources });
  } catch (err) {
    req.log.error({ err }, "Chat request failed");
    res.status(500).json({
      error: "I encountered an error while processing your question. Please try again.",
    });
  }
});

export default router;
