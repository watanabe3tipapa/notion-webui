import { Router, Request, Response } from 'express';
import db from '../lib/store.js';
import { createNotionClient, searchPages, listDatabases } from '../services/notion.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/search', authMiddleware, async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query q is required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId!) as any;
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const notion = createNotionClient(user.encrypted_access_token);
    const results = await searchPages(notion, query);

    res.json({ results });
  } catch (e: any) {
    console.error('Search error:', e?.response?.data || e.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/databases', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId!) as any;
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const notion = createNotionClient(user.encrypted_access_token);
    const results = await listDatabases(notion);

    res.json({ results });
  } catch (e: any) {
    console.error('Databases error:', e?.response?.data || e.message);
    res.status(500).json({ error: 'Failed to list databases' });
  }
});

export default router;
