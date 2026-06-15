# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Express + TypeScript backend with SQLite storage
- Notion OAuth 2.0 authentication flow with JWT (HS256)
- JWT two-layer auth: Access Token (15min) + Refresh Token (7d, HttpOnly Cookie, rotation)
- CSRF protection: Double Submit Cookie + SameSite=Strict + timingSafeEqual
- AES-256-GCM encryption for Notion OAuth tokens
- OAuth state parameter validation (10min TTL)
- Rate limiting per endpoint (express-rate-limit)
- Helmet security headers
- Push API: Markdown → Notion block conversion with remark/remark-gfm
- Page search and database listing endpoints
- Sync log tracking with SQLite
- React + Vite + Tailwind CSS frontend (webui)
- Quick Push modal (selection → title auto-extract → send)
- Composer (Markdown editor + live preview + property editor)
- PagePicker with debounced search
- Sync Dashboard with activity log
- Zustand state management with toast notifications
- Zed Editor extension (command palette + WebView panel)
- Obsidian Agent (chokidar watcher, 3s debounce)
- VitePress tutorial site (7 pages)
- GitHub Actions workflow for docs deployment
- Dockerfile + docker-compose.yml
- README in Japanese and English
- CONTRIBUTING, SECURITY, CODE_OF_CONDUCT (Japanese/English)
- MIT License

### Security

- Env vars validated at startup (fail-fast on missing NOTION_CLIENT_ID, JWT_SECRET, ENCRYPTION_KEY)
- Algorithm restriction on JWT verify (`algorithms: ['HS256']`)
- Conditional Secure flag on cookies based on NODE_ENV
- `trust proxy` setting for correct IP behind reverse proxy
- Mounted ref pattern to prevent setState after unmount in React components
- Timing-safe comparison for CSRF token validation
