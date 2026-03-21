import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { VectorIndexer } from "../services/vector-indexer.js";

const router = Router();

router.post("/process", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user.sub as string;

  try {
    const result = await VectorIndexer.run(userId);

    res.status(200).json({
      success: true,
      emailsProcessed: result.emailsProcessed,
      chunksIndexed: result.chunksIndexed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[feature/process] error: ${message}`);
    res.status(500).json({ error: "Feature pipeline failed", details: message });
  }
});

export default router;
