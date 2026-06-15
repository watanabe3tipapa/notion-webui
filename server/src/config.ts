import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`FATAL: Required environment variable ${name} is not set. Check .env file.`);
  }
  return val;
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  baseUrl: process.env.BASE_URL || 'http://localhost:4000',
  notionClientId: requireEnv('NOTION_CLIENT_ID'),
  notionClientSecret: requireEnv('NOTION_CLIENT_SECRET'),
  notionRedirectUri: process.env.NOTION_REDIRECT_URI || 'http://localhost:4000/api/auth/callback',
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtAccessExpiresIn: '15m',
  jwtRefreshExpiresIn: '7d',
  encryptionKey: requireEnv('ENCRYPTION_KEY'),
  isProduction: process.env.NODE_ENV === 'production',
};
