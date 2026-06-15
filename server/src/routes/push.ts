import { Router, Request, Response } from 'express';
import db from '../lib/store.js';
import { createNotionClient, createPage, updatePageContent } from '../services/notion.js';
import { markdownToBlocks } from '../lib/markdown-to-notion.js';
import { authMiddleware } from '../middleware/auth.js';
import { pushLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', authMiddleware, pushLimiter, async (req: Request, res: Response) => {
  try {
    const { mode, pageId, title, markdown, databaseId } = req.body as {
      mode?: string;
      pageId?: string;
      title?: string;
      markdown?: string;
      databaseId?: string;
    };

    if (!markdown) {
      return res.status(400).json({ error: 'markdown is required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId!) as any;
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const notion = createNotionClient(user.encrypted_access_token);
    const blocks = await markdownToBlocks(markdown);

    if (mode === 'update') {
      if (!pageId) {
        return res.status(400).json({ error: 'pageId is required for update mode' });
      }
      await updatePageContent(notion, pageId, blocks);
      logSync(req.userId!, 'update', 'success', pageId);
      return res.json({ success: true, pageId });
    }

    const t = title || markdown.split('\n').find(Boolean) || 'Untitled';
    const created = await createPage(notion, { title: t.slice(0, 200), blocks, databaseId });
    logSync(req.userId!, 'create', 'success', created.id);

    res.json({
      success: true,
      pageId: created.id,
      url: `https://www.notion.so/${created.id.replace(/-/g, '')}`,
    });
  } catch (e: any) {
    const detail = e?.response?.data || e.message;
    console.error('Push error:', detail);

    if (e?.response?.status === 429) {
      return res.status(429).json({ error: 'Notion API rate limit exceeded. Please wait and retry.' });
    }

    logSync(req.userId!, req.body?.mode || 'create', 'failed', undefined, typeof detail === 'string' ? detail.slice(0, 500) : String(detail));
    res.status(500).json({ error: 'Push failed', detail: process.env.NODE_ENV === 'development' ? detail : undefined });
  }
});

function logSync(userId: string, action: string, status: string, pageId?: string, message?: string) {
  try {
    db.prepare(`
      INSERT INTO sync_logs (user_id, action, status, page_id, message, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(userId, action, status, pageId || null, message || null);
  } catch {
    // silent
  }
}

export default router;
