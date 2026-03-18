import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { EmailETLPipeline } from "../services/email-etl.js";
import { Email } from "../models/email.model.js";
import { User } from "../models/user.model.js";

const router = Router();

router.post("/sync", authMiddleware, async (req: Request, res: Response) => {
  const fullSync = req.query.full === "true";
  const userId = (req as any).user.sub as string;

  try {
    const user = await User.findOne({ googleId: userId })
      .select("accessToken syncStatus")
      .lean();

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!user.accessToken) {
      res.status(400).json({
        error: "No access token available. Please re-authenticate.",
      });
      return;
    }

    // Guard: reject concurrent syncs
    if (user.syncStatus === "syncing") {
      res.status(409).json({ error: "Sync already in progress" });
      return;
    }

    const pipeline = new EmailETLPipeline(userId, user.accessToken);
    const result = await pipeline.run(fullSync);

    res.status(200).json({
      success: true,
      synced: result.synced,
      errors: result.errors,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "Sync failed", details: message });
  }
});

router.get(
  "/sync/status",
  authMiddleware,
  async (req: Request, res: Response) => {
    const userId = (req as any).user.sub as string;

    try {
      // Run both DB queries in parallel — no dependency between them
      const [user, emailCount] = await Promise.all([
        User.findOne({ googleId: userId })
          .select("syncStatus lastSyncAt")
          .lean(),
        Email.countDocuments({ userId }),
      ]);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({
        syncStatus: user.syncStatus,
        lastSyncAt: user.lastSyncAt ?? null,
        emailCount,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res
        .status(500)
        .json({ error: "Failed to get sync status", details: message });
    }
  },
);

router.get("/list", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user.sub as string;

  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(String(req.query.limit ?? "20"), 10) || 20),
  );
  const skip = (page - 1) * limit;
  const q = req.query.q ? String(req.query.q).trim() : null;
  const label = req.query.label ? String(req.query.label).trim() : null;

  try {
    const filter: Record<string, unknown> = { userId };

    if (q) {
      // Escape regex metacharacters to prevent ReDoS
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { subject: { $regex: escaped, $options: "i" } },
        { snippet: { $regex: escaped, $options: "i" } },
      ];
    }

    if (label) {
      // `labels` is a string[] in the schema; MongoDB matches if any element equals `label`
      filter.labels = label;
    }

    // Fetch page + total count in parallel
    const [emails, total] = await Promise.all([
      Email.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .select("-bodyHtml -bodyPlain") // strip large fields for list view
        .lean(),
      Email.countDocuments(filter),
    ]);

    res.status(200).json({
      emails,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "Failed to fetch emails", details: message });
  }
});

router.get(
  "/thread/:threadId",
  authMiddleware,
  async (req: Request, res: Response) => {
    const userId = (req as any).user.sub as string;
    const { threadId } = req.params;

    try {
      const emails = await Email.find({ userId, threadId })
        .sort({ date: 1 })
        .lean();

      if (emails.length === 0) {
        res.status(404).json({ error: "Thread not found" });
        return;
      }

      res.status(200).json({ threadId, emails });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res
        .status(500)
        .json({ error: "Failed to fetch thread", details: message });
    }
  },
);

router.get(
  "/:messageId",
  authMiddleware,
  async (req: Request, res: Response) => {
    const userId = (req as any).user.sub as string;
    const { messageId } = req.params;

    try {
      const email = await Email.findOne({ userId, messageId }).lean();

      if (!email) {
        res.status(404).json({ error: "Email not found" });
        return;
      }

      res.status(200).json(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res
        .status(500)
        .json({ error: "Failed to fetch email", details: message });
    }
  },
);

export default router;
