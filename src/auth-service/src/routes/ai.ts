import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { generateReply } from "../services/gemini.js";
import type { IGenerateReplyRequest, IGenerateReplyResponse } from "../types/ai.js";

const router = Router();

router.post(
  "/generate-reply",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { subject, from, bodyPlain } = req.body as Partial<IGenerateReplyRequest>;

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      res.status(400).json({ error: "subject is required and must be a non-empty string" });
      return;
    }

    if (!from || typeof from !== "string" || from.trim().length === 0) {
      res.status(400).json({ error: "from is required and must be a non-empty string" });
      return;
    }

    if (!bodyPlain || typeof bodyPlain !== "string" || bodyPlain.trim().length === 0) {
      res.status(400).json({ error: "bodyPlain is required and must be a non-empty string" });
      return;
    }

    try {
      const reply = await generateReply({
        subject: subject.trim(),
        from: from.trim(),
        bodyPlain: bodyPlain.trim(),
      });

      const response: IGenerateReplyResponse = { reply };
      res.status(200).json(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[ai] generate-reply failed: ${message}`);
      res.status(500).json({ error: "Failed to generate reply", details: message });
    }
  },
);

export default router;
