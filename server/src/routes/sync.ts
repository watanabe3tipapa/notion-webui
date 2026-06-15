import { Router, Request, Response } from 'express';
import db from '../lib/store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/logs', authMiddleware, (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = parseInt(req.query.offset as string) || 0;

  const logs = db.prepare(`
    SELECT id, action, status, page_id, message, created_at
    FROM sync_logs
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.userId!, limit, offset);

  const total = db.prepare('SELECT COUNT(*) as count FROM sync_logs WHERE user_id = ?')
    .get(req.userId!) as any;

  res.json({ logs, total: total.count });
});

router.delete('/logs', authMiddleware, (req: Request, res: Response) => {
  db.prepare('DELETE FROM sync_logs WHERE user_id = ?').run(req.userId!);
  res.json({ success: true });
});

router.post('/push-note', authMiddleware, async (req: Request, res: Response) => {
  const { markdown, title } = req.body as { markdown?: string; title?: string };
  if (!markdown) {
    return res.status(400).json({ error: 'markdown is required' });
  }

  try {
    const { createNotionClient, createPage } = await import('../services/notion.js');
    const { markdownToBlocks } = await import('../lib/markdown-to-notion.js');

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId!) as any;
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const notion = createNotionClient(user.encrypted_access_token);
    const blocks = await markdownToBlocks(markdown);
    const t = title || markdown.split('\n').find(Boolean) || 'Untitled';
    const created = await createPage(notion, { title: t.slice(0, 200), blocks, databaseId: req.body.databaseId });

    res.json({ success: true, pageId: created.id });
  } catch (e: any) {
    console.error('Sync push error:', e.message);
    res.status(500).json({ error: 'Sync push failed' });
  }
});

export default router;
