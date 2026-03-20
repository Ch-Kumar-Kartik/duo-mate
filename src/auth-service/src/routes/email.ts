import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { EmailETLPipeline } from "../services/email-etl.js";
import { refreshAccessToken } from "../services/oauth.js";
import { Email } from "../models/email.model.js";
import { User } from "../models/user.model.js";

const router = Router();

router.post("/sync", authMiddleware, async (req: Request, res: Response) => {
  const fullSync = req.query.full === "true";
  const syncLimit = Math.min(
    500,
    Math.max(1, parseInt(String(req.query.limit ?? "50"), 10) || 50),
  );
  const userId = (req as any).user.sub as string;

  try {
    console.log(`[sync] starting for userId=${userId} fullSync=${fullSync}`);

    const user = await User.findOne({ googleId: userId })
      .select("accessToken refreshToken tokenExpiresAt syncStatus")
      .lean();

    if (!user) {
      console.warn(`[sync] user not found: ${userId}`);
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!user.accessToken) {
      console.warn(`[sync] no accessToken on user: ${userId}`);
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

    // ── Proactive token refresh ─────────────────────────────────────────────
    // Google access tokens expire in ~1 hour. Refresh before starting the
    // ETL pipeline so that listAllMessages never sees a stale token.
    let accessToken = user.accessToken;
    const fiveMinutesMs = 5 * 60 * 1000;
    const tokenExpired =
      user.tokenExpiresAt &&
      user.tokenExpiresAt.getTime() < Date.now() + fiveMinutesMs;

    if (tokenExpired) {
      console.log(`[sync] access token expired or expiring soon — refreshing`);

      if (!user.refreshToken) {
        res.status(401).json({
          error:
            "Access token expired and no refresh token stored. Please re-authenticate.",
        });
        return;
      }

      try {
        const newTokens = await refreshAccessToken(user.refreshToken);
        accessToken = newTokens.access_token;

        await User.findOneAndUpdate(
          { googleId: userId },
          {
            $set: {
              accessToken: newTokens.access_token,
              tokenExpiresAt: new Date(
                Date.now() + newTokens.expires_in * 1000,
              ),
            },
          },
        );

        console.log(`[sync] access token refreshed successfully`);
      } catch (refreshErr) {
        const msg =
          refreshErr instanceof Error ? refreshErr.message : String(refreshErr);
        console.error(`[sync] token refresh failed: ${msg}`);
        res.status(401).json({
          error: "Token refresh failed. Please re-authenticate.",
          details: msg,
        });
        return;
      }
    } else {
      const expiresIn = user.tokenExpiresAt
        ? Math.round((user.tokenExpiresAt.getTime() - Date.now()) / 1000)
        : "unknown";
      console.log(`[sync] access token valid — expires in ${expiresIn}s`);
    }

    // ── Run ETL ─────────────────────────────────────────────────────────────
    console.log(`[sync] handing off to EmailETLPipeline — limit=${syncLimit}`);
    const pipeline = new EmailETLPipeline(userId, accessToken, 50, syncLimit);
    const result = await pipeline.run(fullSync);

    console.log(
      `[sync] finished — synced=${result.synced} errors=${result.errors}`,
    );

    res.status(200).json({
      success: true,
      synced: result.synced,
      errors: result.errors,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sync] unhandled error: ${message}`);
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
