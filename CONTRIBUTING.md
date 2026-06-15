# Contributing to Notion WebUI

Thank you for considering contributing to this project!

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/watanabe3tipapa/notion-webui/issues)
2. Create an issue with a clear title and description
3. Include steps to reproduce the bug
4. Add relevant labels (bug, etc.)

### Suggesting Features

1. Check if the feature has already been suggested
2. Create an issue with a clear title and description
3. Explain why this feature would be useful
4. Add relevant labels (enhancement, etc.)

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run `npm run build -w server && npm run build -w webui` to ensure builds pass
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## Development Setup

```bash
git clone https://github.com/watanabe3tipapa/notion-webui.git
cd notion-webui
npm install
cp .env.example .env
npm run dev -w server
npm run dev -w webui
```

## Code Style

- The project uses TypeScript with strict mode
- Use consistent formatting (Prettier recommended)
- Write meaningful commit messages
- Update documentation if needed

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
