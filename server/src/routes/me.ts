import { Router, Request, Response } from 'express';
import db from '../lib/store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, (req: Request, res: Response) => {
  const user = db.prepare('SELECT id, notion_user_id, workspace_id, scopes, created_at FROM users WHERE id = ?')
    .get(req.userId!) as any;

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ authenticated: true, ...user });
});

export default router;
