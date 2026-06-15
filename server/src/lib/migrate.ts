import db from './store.js';

const migrations = [
  `CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    run_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    notion_user_id TEXT,
    encrypted_access_token TEXT NOT NULL,
    workspace_id TEXT,
    scopes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS sync_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    page_id TEXT,
    message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sync_logs_user ON sync_logs(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sync_logs_created ON sync_logs(created_at)`,
];

function runMigrations() {
  const applied = new Set(
    db.prepare('SELECT name FROM migrations').all().map((r: any) => r.name)
  );

  for (const sql of migrations) {
    const name = sql.split('\n')[0].slice(0, 60);
    if (applied.has(name)) continue;
    db.exec(sql);
    db.prepare('INSERT INTO migrations (name) VALUES (?)').run(name);
    console.log(`Applied migration: ${name}`);
  }
  console.log('All migrations applied.');
}

runMigrations();
export default runMigrations;
