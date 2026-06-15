[![Notion WebUI](https://via.placeholder.com/150x50?text=Notion+WebUI)](https://github.com/watanabe3tipapa/notion-webui)

<!-- badges -->
[![License](https://img.shields.io/github/license/watanabe3tipapa/notion-webui.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-20%2B-339933.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6.svg)](https://www.typescriptlang.org)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[English](README_EN.md) | [日本語](README.md)

# Notion WebUI

A local-first tool for seamless content delivery from Zed Editor to Notion.
Also supports automatic Obsidian Vault synchronization.

- **Simple Push** — Push selected text to Notion in 2 clicks. Automatic title extraction, Markdown→Notion block conversion
- **🔒 Security First** — JWT two-layer auth + HttpOnly Cookie + CSRF protection. Notion tokens encrypted with AES-256-GCM
- **⌨️ Zed Extension** — Send directly from the command palette. WebView panel with preview
- **📓 Obsidian Integration** — Watch Vault with chokidar, auto-sync with 3s debounce
- **🎨 Composer** — Markdown editor + live preview + property editing + page search
- **🐳 Easy Deploy** — One-command Docker Compose. SQLite-based, no extra infrastructure

## Screenshot

<!-- Add screenshots here -->
*(Coming soon)*

## Installation

```bash
git clone https://github.com/watanabe3tipapa/notion-webui.git
cd notion-webui
npm install
cp .env.example .env
# Edit .env: NOTION_CLIENT_ID, NOTION_CLIENT_SECRET, JWT_SECRET, ENCRYPTION_KEY
```

## Usage

```bash
# Start dev server (hot reload)
npm run dev -w server

# Open browser → click "Connect Notion" for OAuth
# http://localhost:4000
```

For detailed usage, see the [tutorial site](https://watanabe3tipapa.github.io/notion-webui/).

## Project Structure

| Directory | Description |
|-----------|-------------|
| `server/` | Express + TypeScript backend (API + static) |
| `webui/` | React + Vite + Tailwind CSS frontend |
| `zed-extension/` | Zed Editor extension |
| `obsidian-agent/` | Obsidian Vault watcher agent |
| `docs/` | VitePress tutorial site |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Server | Express + TypeScript |
| Database | better-sqlite3 |
| Auth | JWT (HS256) + Notion OAuth 2.0 |
| Encryption | AES-256-GCM |
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Zustand |
| UI | Headless UI + Heroicons |
| Markdown | remark + remark-gfm |

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- JWT (Access Token 15min + Refresh Token 7d HttpOnly Cookie)
- CSRF: Double Submit Cookie + SameSite=Strict + timingSafeEqual
- Notion Token: AES-256-GCM encrypted at rest
- OAuth state parameter validation (10min TTL)
- Helmet + Rate Limiting per endpoint
- Required env vars validated at startup (fail-fast)

## License

MIT License - see the [LICENSE](LICENSE) file for details.

