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

## License

MIT © Mayukh Sinha

## Links

- [GitHub Repository](https://github.com/sikojs/signal)
- [npm Package](https://www.npmjs.com/package/siko)
- [Website](https://siko.dev)
- [Report Issues](https://github.com/sikojs/signal/issues)