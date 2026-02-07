# siko

> Runtime execution signal analyzer for JavaScript & TypeScript

**Status:** 🚧 Under active development

## What is siko?

siko reveals which parts of your codebase emit real runtime signal, helping you refactor with confidence. It instruments your code, tracks what actually executes during tests or runs, and generates reports showing unreached functions.

## Installation
```bash
npm install --save-dev siko
```

## Quick Start
```bash
# Run your tests with signal tracking
npx siko run npm test

# Generate report
npx siko report
```

## How It Works

1. **Instrument**: Babel plugin injects lightweight tracking into your functions
2. **Execute**: Run your tests or application normally
3. **Track**: Records which functions actually ran
4. **Report**: Shows you what never executed

## Architecture
```
Source Code → Babel Instrumentation → Runtime Tracking → Signal Report
```

## Documentation

Coming soon at [siko.dev](https://siko.dev)

## Development Status

Currently in active development. Core features being implemented:
- [ ] Babel instrumentation plugin
- [ ] Runtime execution tracker
- [ ] CLI interface (`siko run`, `siko report`)
- [ ] Report generator

## Development
```bash
# Clone the repo
git clone https://github.com/sikojs/signal.git
cd signal

# Install dependencies
npm install

# Build
npm run build

# Test local CLI
node dist/cli/index.js
```

## Contributing

We welcome contributions! Whether it's bug fixes, new features, or documentation improvements.

### Quick Start for Contributors
```bash
# 1. Fork the repo on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/signal.git
cd signal

# 3. Add upstream remote
git remote add upstream https://github.com/sikojs/signal.git

# 4. Install dependencies
npm install

# 5. Create a branch
git checkout -b feat/your-feature

# 6. Make changes, commit, and push
git commit -m "feat: add awesome feature"
git push origin feat/your-feature

# 7. Open a Pull Request on GitHub
```

### Commit Message Format

Please use descriptive commit messages:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Maintenance tasks

**Example:**
```bash
git commit -m "feat: add runtime execution tracker"
git commit -m "fix: resolve CLI crash on exit"
git commit -m "docs: update installation guide"
```




See our [Contributing Guide](CONTRIBUTING.md) for detailed guidelines.

## License

MIT © Mayukh Sinha

## Links

- [GitHub Repository](https://github.com/sikojs/signal)
- [npm Package](https://www.npmjs.com/package/siko)
- [Website](https://siko.dev)
- [Report Issues](https://github.com/sikojs/signal/issues)