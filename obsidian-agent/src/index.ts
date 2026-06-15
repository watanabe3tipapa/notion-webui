import { watchVault } from './watcher.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const VAULT_PATH = process.env.VAULT_PATH || '';
const SERVER_URL = process.env.SERVER_PUSH_URL || 'http://localhost:4000/api/push';
const USER_ID = process.env.USER_ID || '';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '';

if (!VAULT_PATH) {
  console.error('Error: VAULT_PATH environment variable is required.');
  console.error('Usage: VAULT_PATH=/path/to/vault USER_ID=<userId> npm start');
  process.exit(1);
}

if (!USER_ID) {
  console.error('Error: USER_ID environment variable is required.');
  console.error('Get your userId after authenticating at http://localhost:4000/settings');
  process.exit(1);
}

if (!ACCESS_TOKEN) {
  console.error('Error: ACCESS_TOKEN environment variable is required.');
  console.error('Get your access token after authenticating at http://localhost:4000');
  process.exit(1);
}

if (!fs.existsSync(VAULT_PATH)) {
  console.error(`Error: Vault path does not exist: ${VAULT_PATH}`);
  process.exit(1);
}

console.log(`Obsidian Agent starting...`);
console.log(`  Vault: ${VAULT_PATH}`);
console.log(`  Server: ${SERVER_URL}`);
console.log(`  User: ${USER_ID}`);

watchVault(VAULT_PATH, async (filePath: string, markdown: string) => {
  const title = path.basename(filePath, '.md');
  try {
    const { default: axios } = await import('axios');
    const resp = await axios.post(
      SERVER_URL,
      {
        userId: USER_ID,
        mode: 'create',
        title,
        markdown,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    console.log(`[OK] Pushed: ${filePath} → ${resp.data.pageId}`);
  } catch (e: any) {
    const detail = e?.response?.data?.error || e.message;
    console.error(`[FAIL] ${filePath}: ${detail}`);
  }
});
