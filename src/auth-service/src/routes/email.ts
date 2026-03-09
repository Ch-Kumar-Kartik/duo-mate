// src/auth-service/src/routes/email.ts
// TODO: Implement email sync routes

/**
 * Email Routes
 *
 * These endpoints trigger and manage the email ETL pipeline.
 * All routes here require authentication (use authMiddleware).
 *
 * Mount in index.ts: app.use('/email', emailRoutes);
 */

import { Router } from 'express';
// import { authMiddleware } from '../middleware/auth.js';
// import { EmailETLPipeline } from '../services/email-etl.js';
// import { Email } from '../models/email.model.js';
// import { User } from '../models/user.model.js';

const router = Router();

/**
 * POST /email/sync
 *
 * Triggers an email sync for the authenticated user.
 *
 * Steps:
 * 1. Apply authMiddleware to get user info from JWT
 * 2. Get the user's Google ID from (req as any).user.sub
 * 3. Look up the user in MongoDB to get their accessToken
 * 4. Create an EmailETLPipeline instance
 * 5. Run the pipeline (consider: run in background vs. await)
 * 6. Return the sync result { synced, errors }
 *
 * Query params:
 * - full=true → forces a full sync instead of incremental
 *
 * Response:
 * - 200: { success: true, synced: 42, errors: 0 }
 * - 401: { error: 'Not authenticated' }
 * - 500: { error: 'Sync failed', details: '...' }
 *
 * NOTE: For large inboxes, this can take a while. In production,
 * you'd want to run this as a background job and return immediately
 * with a job ID. For now (development), it's fine to await it.
 */
router.post('/sync', /* authMiddleware, */ async (req, res) => {
    // TODO: Implement
    // const fullSync = req.query.full === 'true';
    // const userId = (req as any).user.sub;
    res.status(501).json({ error: 'Not implemented' });
});

/**
 * GET /email/sync/status
 *
 * Returns the current sync status for the authenticated user.
 *
 * Steps:
 * 1. Get user from MongoDB by googleId
 * 2. Return { syncStatus, lastSyncAt, emailCount }
 * 3. emailCount = await Email.countDocuments({ userId })
 */
router.get('/sync/status', /* authMiddleware, */ async (req, res) => {
    // TODO: Implement
    res.status(501).json({ error: 'Not implemented' });
});

/**
 * GET /email/list
 *
 * Returns paginated list of synced emails for the authenticated user.
 *
 * Steps:
 * 1. Get userId from JWT
 * 2. Parse query params: page (default 1), limit (default 20), sort (default -date)
 * 3. Query MongoDB:
 *    const emails = await Email.find({ userId })
 *        .sort({ date: -1 })
 *        .skip((page - 1) * limit)
 *        .limit(limit)
 *        .select('-bodyHtml -bodyPlain');  // Exclude large fields for list view
 * 4. Get total count for pagination
 * 5. Return { emails, total, page, totalPages }
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - q: string (optional search query — search subject and snippet)
 * - label: string (optional — filter by Gmail label)
 */
router.get('/list', /* authMiddleware, */ async (req, res) => {
    // TODO: Implement
    res.status(501).json({ error: 'Not implemented' });
});

/**
 * GET /email/:messageId
 *
 * Returns a single email by its Gmail message ID.
 *
 * Steps:
 * 1. Get userId from JWT
 * 2. Find email: Email.findOne({ userId, messageId: req.params.messageId })
 * 3. Return 404 if not found
 * 4. Return the full email (including body)
 */
router.get('/:messageId', /* authMiddleware, */ async (req, res) => {
    // TODO: Implement
    res.status(501).json({ error: 'Not implemented' });
});

/**
 * GET /email/thread/:threadId
 *
 * Returns all emails in a thread, sorted by date.
 *
 * Steps:
 * 1. Get userId from JWT
 * 2. Find emails: Email.find({ userId, threadId }).sort({ date: 1 })
 * 3. Return the email thread
 */
router.get('/thread/:threadId', /* authMiddleware, */ async (req, res) => {
    // TODO: Implement
    res.status(501).json({ error: 'Not implemented' });
});

export default router;
