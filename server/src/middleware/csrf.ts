import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config.js';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.includes(req.method)) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf-token', token, {
      sameSite: 'strict',
      secure: config.isProduction,
      httpOnly: false,
      path: '/',
    });
    res.locals.csrfToken = token;
    return next();
  }

  const headerToken = req.headers['x-csrf-token'] as string;
  const cookieToken = req.cookies?.['csrf-token'];

  if (!headerToken || !cookieToken) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }
  if (!crypto.timingSafeEqual(Buffer.from(headerToken), Buffer.from(cookieToken))) {
    return res.status(403).json({ error: 'CSRF token mismatch' });
  }
  next();
}
