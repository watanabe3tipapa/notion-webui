import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';

type FileChangeHandler = (filePath: string, markdown: string) => void | Promise<void>;

const pendingChanges = new Map<string, ReturnType<typeof setTimeout>>();
const DEBOUNCE_MS = 3000;

export function watchVault(vaultPath: string, onChange: FileChangeHandler) {
  const watcher = chokidar.watch(vaultPath, {
    ignored: /(^|[\/\\])\..|(^|[\/\\])_/,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 500,
    },
  });

  function handleFile(filePath: string) {
    if (!filePath.endsWith('.md')) return;

    if (pendingChanges.has(filePath)) {
      clearTimeout(pendingChanges.get(filePath)!);
    }

    pendingChanges.set(
      filePath,
      setTimeout(async () => {
        pendingChanges.delete(filePath);
        try {
          const markdown = fs.readFileSync(filePath, 'utf-8');
          if (markdown.trim()) {
            await onChange(filePath, markdown);
          }
        } catch (e: any) {
          console.error(`Error reading ${filePath}: ${e.message}`);
        }
      }, DEBOUNCE_MS)
    );
  }

  watcher.on('add', handleFile);
  watcher.on('change', handleFile);

  const stats = fs.statSync(vaultPath, { throwIfNoEntry: false });
  if (stats?.isDirectory()) {
    const files = fs.readdirSync(vaultPath).filter(f => f.endsWith('.md'));
    console.log(`  Found ${files.length} markdown files in vault`);
  }

  console.log('Obsidian Agent is watching for changes...');

  return watcher;
}
