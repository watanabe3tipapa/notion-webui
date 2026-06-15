# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅ |

This project follows [Semantic Versioning](https://semver.org/).

## Reporting a Vulnerability

If you discover a security vulnerability, please report it via email to the project maintainer.

**Do not report security vulnerabilities through public GitHub issues.**

Please include the following information:

- Type of issue (XSS, CSRF, authentication bypass, etc.)
- Full path of the related source files
- Steps to reproduce
- Proof of concept code (if possible)
- Impact of the issue

You can expect a response within 48 hours.

## Security Measures in This Project

- JWT: Access Token (15min) + Refresh Token (7d, HttpOnly Cookie, rotation)
- CSRF: Double Submit Cookie + SameSite=Strict + timingSafeEqual
- Token Storage: AES-256-GCM encryption for Notion OAuth tokens
- OAuth: State parameter validation (10min TTL)
- Rate Limiting: Per-endpoint limits with express-rate-limit
- HTTP Headers: Helmet middleware for security headers
- Startup Validation: Required env vars fail-fast

## Preferred Languages

English or Japanese.
