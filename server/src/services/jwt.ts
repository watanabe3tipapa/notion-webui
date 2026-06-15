import jwt from 'jsonwebtoken';
import { config } from '../config.js';

interface AccessPayload {
  sub: string;
  userId: string;
  type: 'access';
}

interface RefreshPayload {
  sub: string;
  userId: string;
  type: 'refresh';
  jti: string;
}

export function signAccessToken(userId: string): string {
  return jwt.sign(
    { sub: userId, userId, type: 'access' } satisfies AccessPayload,
    config.jwtSecret,
    { expiresIn: '15m' }
  );
}

export function signRefreshToken(userId: string, jti: string): string {
  return jwt.sign(
    { sub: userId, userId, type: 'refresh', jti } satisfies RefreshPayload,
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

export function verifyAccessToken(token: string): AccessPayload {
  const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }) as AccessPayload;
  if (payload.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return payload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }) as RefreshPayload;
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return payload;
}
