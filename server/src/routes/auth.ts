import { Router, Request, Response } from 'express';
import axios from 'axios';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import { config } from '../config.js';
import db from '../lib/store.js';
import { encrypt, hashToken } from '../services/crypto.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/jwt.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict' as const,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// In-memory store for OAuth state values (volatile, sufficient for single-process)
const oauthStates = new Map<string, { createdAt: number }>();

function getUserById(id: string) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
}

function saveUser(id: string, notionUserId: string, encryptedToken: string, workspaceId: string | null, scopes: string) {
  db.prepare(`
    INSERT INTO users (id, notion_user_id, encrypted_access_token, workspace_id, scopes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(id, notionUserId, encryptedToken, workspaceId, scopes);
}

function saveRefreshToken(userId: string, tokenHash: string, expiresAt: string) {
  db.prepare(`
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run(userId, tokenHash, expiresAt);
}

function revokeRefreshToken(tokenHash: string) {
  db.prepare('DELETE FROM refresh_tokens WHERE token_hash = ?').run(tokenHash);
}

router.get('/start', (_req: Request, res: Response) => {
  const state = crypto.randomBytes(32).toString('hex');
  oauthStates.set(state, { createdAt: Date.now() });
  const url = `https://api.notion.com/v1/oauth/authorize?owner=user&response_type=code&client_id=${config.notionClientId}&redirect_uri=${encodeURIComponent(config.notionRedirectUri)}&state=${state}`;
  res.json({ url });
});

router.get('/callback', authLimiter, async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!code) {
      return res.status(400).send('Missing authorization code');
    }

    if (!state) {
      return res.status(400).send('Missing OAuth state parameter');
    }

    const storedState = oauthStates.get(state);
    if (!storedState) {
      return res.status(400).send('Invalid or expired OAuth state');
    }
    oauthStates.delete(state);

    if (Date.now() - storedState.createdAt > 10 * 60 * 1000) {
      return res.status(400).send('OAuth state expired');
    }

    const tokenResp = await axios.post(
      'https://api.notion.com/v1/oauth/token',
      {
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.notionRedirectUri,
        client_id: config.notionClientId,
        client_secret: config.notionClientSecret,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const data = tokenResp.data;
    const notionUserId = data.owner?.user?.id || nanoid();
    const userId = nanoid();
    const encryptedToken = encrypt(data.access_token);
    const workspaceId = data.owner?.workspace?.id || null;
    const scopes = (data.scope || '').toString();

    saveUser(userId, notionUserId, encryptedToken, workspaceId, scopes);

    const accessToken = signAccessToken(userId);
    const jti = nanoid();
    const refreshToken = signRefreshToken(userId, jti);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    saveRefreshToken(userId, hashToken(refreshToken), refreshExpiry);

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({ accessToken, userId });
  } catch (e: any) {
    const detail = e?.response?.data || e.message;
    console.error('OAuth callback error:', detail);
    res.status(500).json({ error: 'OAuth authentication failed' });
  }
});

router.post('/refresh', authLimiter, (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'Refresh token missing' });
    }

    const payload = verifyRefreshToken(token);
    const tokenHash = hashToken(token);

    const stored = db.prepare('SELECT * FROM refresh_tokens WHERE token_hash = ? AND user_id = ?')
      .get(tokenHash, payload.userId) as any;
    if (!stored) {
      return res.status(401).json({ error: 'Refresh token revoked' });
    }

    revokeRefreshToken(tokenHash);

    const user = getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const newAccessToken = signAccessToken(payload.userId);
    const newJti = nanoid();
    const newRefreshToken = signRefreshToken(payload.userId, newJti);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    saveRefreshToken(payload.userId, hashToken(newRefreshToken), refreshExpiry);

    res.cookie('refreshToken', newRefreshToken, cookieOptions);
    res.json({ accessToken: newAccessToken, userId: payload.userId });
  } catch (e: any) {
    console.error('Refresh error:', e.message);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    revokeRefreshToken(hashToken(token));
  }
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ success: true });
});

export default router;
