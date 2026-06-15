/**
 * Zed → Notion Extension
 *
 * This extension provides:
 * 1. A command "Push to Notion" that sends the current selection or file content
 * 2. A WebView panel for preview and configuration
 *
 * Zed Extension API is in active development; adapt calls as needed.
 * See: https://zed.dev/docs/extensions
 */

// --- Pseudo-API types (replace with actual Zed extension types) ---
declare const zed: {
  editor: {
    getSelection(): string;
    getText(): string;
    getFilePath(): string;
  };
  workspace: {
    showMessage(message: string): void;
    openUrl(url: string): void;
  };
  webview: {
    create(html: string): { show: () => void };
  };
};

interface PushResponse {
  success: boolean;
  pageId: string;
  url?: string;
}

const SERVER_BASE = 'http://localhost:4000';

async function getAccessToken(): Promise<string | null> {
  try {
    const resp = await fetch(`${SERVER_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.accessToken;
  } catch {
    return null;
  }
}

async function pushToNotion(
  markdown: string,
  title: string,
  mode: 'create' | 'update' = 'create',
  pageId?: string
): Promise<PushResponse | null> {
  const token = await getAccessToken();
  if (!token) {
    zed.workspace.showMessage('Notion WebUI: Not authenticated. Open http://localhost:4000 to login.');
    return null;
  }

  try {
    const resp = await fetch(`${SERVER_BASE}/api/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ mode, title: title.slice(0, 200), markdown, pageId }),
    });

    if (!resp.ok) {
      const err = await resp.json();
      zed.workspace.showMessage(`Notion WebUI Error: ${err.error}`);
      return null;
    }

    const data: PushResponse = await resp.json();
    return data;
  } catch (e: any) {
    zed.workspace.showMessage(`Notion WebUI: Network error - ${e.message}`);
    return null;
  }
}

function guessTitle(text: string): string {
  const lines = text.split('\n').filter(Boolean);
  for (const line of lines) {
    const match = line.match(/^#\s+(.+)/);
    if (match) return match[1].trim();
  }
  return lines[0]?.slice(0, 100) || 'Untitled from Zed';
}

async function pushSelection() {
  const selection = zed.editor.getSelection();
  const text = selection || zed.editor.getText();
  if (!text) {
    zed.workspace.showMessage('Notion WebUI: No text selected or file empty');
    return;
  }

  const title = guessTitle(text);
  const result = await pushToNotion(text, title, 'create');

  if (result?.url) {
    zed.workspace.openUrl(result.url);
  }
}

async function openPushPanel() {
  const selection = zed.editor.getSelection() || zed.editor.getText();
  const title = guessTitle(selection || '');

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Push to Notion</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, sans-serif; padding: 16px; background: #1e1e1e; color: #ccc; font-size: 13px; }
    label { display: block; margin-top: 12px; margin-bottom: 4px; color: #888; font-size: 11px; text-transform: uppercase; }
    input, textarea, select { width: 100%; padding: 8px; border: 1px solid #333; border-radius: 4px; background: #2a2a2a; color: #ddd; font-size: 13px; }
    textarea { font-family: monospace; resize: vertical; min-height: 120px; }
    button { margin-top: 16px; width: 100%; padding: 10px; background: #4a9eff; color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; }
    button:hover { background: #3a8eef; }
    .status { margin-top: 8px; font-size: 12px; text-align: center; }
    .success { color: #4caf50; }
    .error { color: #f44336; }
  </style>
</head>
<body>
  <label>Title</label>
  <input id="title" value="${escapeHtml(title)}" />

  <label>Mode</label>
  <select id="mode">
    <option value="create">Create new page</option>
    <option value="update">Update existing page</option>
  </select>

  <label>Content</label>
  <textarea id="markdown">${escapeHtml(selection || '')}</textarea>

  <button id="pushBtn">Push to Notion</button>
  <div id="status" class="status"></div>

  <script>
    document.getElementById('pushBtn').addEventListener('click', async () => {
      const title = document.getElementById('title').value;
      const mode = document.getElementById('mode').value;
      const markdown = document.getElementById('markdown').value;
      const status = document.getElementById('status');

      status.className = 'status';
      status.textContent = 'Sending...';

      try {
        const token = await (${getAccessToken.toString()})();
        if (!token) {
          status.className = 'status error';
          status.textContent = 'Not authenticated. Open http://localhost:4000 to login.';
          return;
        }

        const resp = await fetch('${SERVER_BASE}/api/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ mode, title, markdown, pageId: undefined }),
        });

        if (!resp.ok) {
          const err = await resp.json();
          status.className = 'status error';
          status.textContent = 'Error: ' + (err.error || 'Unknown');
          return;
        }

        const data = await resp.json();
        status.className = 'status success';
        status.textContent = 'Success! Page: ' + data.pageId;
      } catch (e) {
        status.className = 'status error';
        status.textContent = 'Network error: ' + e.message;
      }
    });
  </script>
</body>
</html>`;

  const panel = zed.webview.create(html);
  panel.show();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Extension commands ---
// Register these in your extension manifest:
// - "Push to Notion (Selection)" → pushSelection
// - "Push to Notion (Panel)" → openPushPanel

export { pushSelection, openPushPanel };
