# siko

> Runtime execution signal analyzer for JavaScript & TypeScript

[![npm version](https://badge.fury.io/js/siko.svg)](https://www.npmjs.com/package/siko)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**siko** reveals which parts of your codebase emit real runtime signal during execution, helping you identify and remove dead code with confidence.

## ✨ Features

- 🔍 **Runtime Analysis** - Tracks which functions actually execute during test runs
- 🎯 **Dead Code Detection** - Identifies unused functions with precision
- 📊 **Coverage Reports** - Shows execution statistics and coverage percentages
- ⚙️ **Configurable** - Flexible configuration via JSON or JS files
- 🚀 **CI/CD Ready** - Threshold enforcement with proper exit codes
- 📦 **Zero Config** - Works out of the box with sensible defaults
- 🎨 **Beautiful Reports** - Colored terminal output and JSON exports
- 💪 **TypeScript Support** - Full support for JavaScript and TypeScript

## 🚀 Quick Start

### Installation
```bash
npm install --save-dev siko
```

### Basic Usage
```bash
# Run your tests with instrumentation
npx siko run npm test

# Generate report
npx siko report
```

That's it! siko will show you which functions were never executed.

## 📖 Usage

### Commands

#### `siko run <command>`

Instruments your code and runs a command:
```bash
# Run tests
siko run npm test

# Run specific file
siko run node app.js

# Run any command
siko run jest --coverage
```

**Options:**
- `-v, --verbose` - Show detailed instrumentation info
- `--no-clean` - Don't clean previous execution data
- `-c, --config <path>` - Path to config file

#### `siko report`

Generate analysis report:
```bash
# Terminal report (default)
siko report

# Verbose mode (show executed functions)
siko report --verbose

# All statistics
siko report --all

# JSON output
siko report --format json -o report.json

# Both formats
siko report --format both

# Fail if thresholds not met (CI/CD)
siko report --fail-on-threshold
```

**Options:**
- `-v, --verbose` - Show executed functions with call counts
- `-a, --all` - Show all statistics
- `-f, --format <format>` - Output format: `terminal`, `json`, or `both`
- `-o, --output <path>` - Output file for JSON format
- `--fail-on-threshold` - Exit with error code if thresholds not met

#### `siko init`

Create a configuration file:
```bash
# Create JSON config (default)
siko init

# Create JS config
siko init --format js
```

#### `siko clean`

Remove execution data files:
```bash
siko clean
```

## ⚙️ Configuration

Create a `siko.config.json` or `siko.config.js` file:
```json
{
  "include": ["src", "lib"],
  "exclude": ["node_modules", "dist", "*.test.js", "*.spec.js"],
  "extensions": [".js", ".jsx", ".ts", ".tsx"],
  "output": {
    "inventory": ".siko-signal.inventory.json",
    "execution": ".siko-signal.exec.json"
  },
  "thresholds": {
    "coverage": 80,
    "maxUnused": 10
  },
  "report": {
    "format": "terminal",
    "verbose": false,
    "showAll": false
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `include` | `string[]` | `["src", "lib", "app"]` | Directories to instrument |
| `exclude` | `string[]` | `["node_modules", "dist", ...]` | Patterns to exclude |
| `extensions` | `string[]` | `[".js", ".jsx", ".ts", ".tsx"]` | File extensions to instrument |
| `output.inventory` | `string` | `.siko-signal.inventory.json` | Static inventory output path |
| `output.execution` | `string` | `.siko-signal.exec.json` | Execution data output path |
| `thresholds.coverage` | `number` | `undefined` | Minimum coverage % (0-100) |
| `thresholds.maxUnused` | `number` | `undefined` | Maximum unused functions allowed |
| `report.format` | `string` | `"terminal"` | Default report format |
| `report.verbose` | `boolean` | `false` | Show verbose output by default |
| `report.showAll` | `boolean` | `false` | Show all statistics by default |

## 🎯 CI/CD Integration

Use thresholds to enforce code quality standards:

**GitHub Actions Example:**
```yaml
name: Dead Code Check

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install siko
        run: npm install -g siko
      
      - name: Run tests with tracking
        run: siko run npm test
      
      - name: Check dead code thresholds
        run: siko report --fail-on-threshold
      
      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: siko-report
          path: siko-report.json
```

**siko.config.json:**
```json
{
  "thresholds": {
    "coverage": 80,
    "maxUnused": 5
  }
}
```

If thresholds are not met, the build will fail with exit code 1.

## 📊 Example Output

### Terminal Report
```
📊 siko Signal Analysis Report
────────────────────────────────────────────────────────────

Summary:
  Total functions found: 10
  Functions executed: 8
  Functions not executed: 2
  Execution coverage: 80.0%

❌ Unused Functions:

  src/utils.js:
    ● calculateTax (line 45)
    ● formatCurrency (line 89)

────────────────────────────────────────────────────────────
Generated by siko - Runtime Signal Analyzer

✅ All thresholds passed!
```

### JSON Report
```json
{
  "summary": {
    "totalFunctions": 10,
    "executedFunctions": 8,
    "unusedFunctions": 2,
    "coveragePercent": 80,
    "totalExecutions": 45
  },
  "unusedFunctions": [
    {
      "name": "calculateTax",
      "file": "src/utils.js",
      "line": 45,
      "column": 0,
      "type": "function"
    }
  ],
  "executedFunctions": [
    {
      "name": "processOrder",
      "file": "src/orders.js",
      "line": 12,
      "column": 0,
      "type": "function",
      "executionCount": 15
    }
  ],
  "timestamp": "2026-02-07T18:30:00.000Z"
}
```

## 🔧 How It Works

1. **Instrumentation**: Babel plugin injects lightweight tracking calls into your functions
2. **Execution**: Your tests/code runs normally with tracking enabled
3. **Collection**: Runtime tracker records which functions execute
4. **Analysis**: Compares static inventory vs. runtime execution
5. **Reporting**: Shows which functions were never called
```
Source Code → Babel Instrumentation → Runtime Tracking → Signal Report
```

## 🎓 Use Cases

- **Refactoring** - Safely remove unused code with confidence
- **Code Review** - Identify dead code in pull requests
- **Technical Debt** - Track and reduce unused functions over time
- **CI/CD** - Enforce code quality standards in pipelines
- **Documentation** - Understand which code paths are actually used

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development
```bash
# Clone repository
git clone https://github.com/sikojs/signal.git
cd signal

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 License

MIT © Mayukh Sinha

## 🔗 Links

- [GitHub Repository](https://github.com/sikojs/signal)
- [npm Package](https://www.npmjs.com/package/siko)
- [Issue Tracker](https://github.com/sikojs/signal/issues)
- [Contributing Guide](CONTRIBUTING.md)

## 💡 Inspiration

siko was built to solve the challenge of identifying truly unused code in JavaScript and TypeScript projects. Static analysis can't tell you what actually runs - only runtime analysis can.

---

**Made with ❤️ by [Mayukh Sinha](https://github.com/neu-msinha)**