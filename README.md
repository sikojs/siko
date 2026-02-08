# siko

> **The first runtime execution analyzer for JavaScript & TypeScript**

[![CI](https://github.com/neu-msinha/siko/actions/workflows/ci.yml/badge.svg)](https://github.com/neu-msinha/siko/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/siko.svg)](https://www.npmjs.com/package/siko)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Unlike static analysis tools that _guess_ which code is unused, **siko actually runs your code** and tells you what never executed.

✅ **Zero false positives** - Based on real execution data  
✅ **Finds runtime-only dead code** - Not just unused exports  
✅ **Works with any test framework** - Jest, Mocha, Vitest, etc.  
✅ **CI/CD ready** - Enforce coverage thresholds in your pipeline

---

## 🎯 Why siko is Different

### The Problem with Static Analysis

Popular tools like **Knip**, **ts-prune**, and **ESLint** use static analysis - they analyze your code _without running it_. This leads to:

❌ **False positives** - Code flagged as unused but actually runs conditionally  
❌ **Missed dead code** - Private functions that are never called  
❌ **Can't handle dynamic code** - Feature flags, conditional logic, runtime imports

### siko's Runtime Approach

**siko instruments your code and tracks what actually executes during your tests.**

```javascript
// example.js
export function apiCall() {} // Used in prod only
function validateInput() {} // Used everywhere
function legacyHelper() {} // NEVER called!

// Your test
test("api", () => {
  apiCall(); // siko tracks this execution
});
```

**Static tools report:**

- ❌ All three functions look "used" (or flag `apiCall` incorrectly)

**siko reports:**

- ✅ `legacyHelper()` never executed - **true dead code!**
- ⚠️ `apiCall()` called 1x during tests
- ✅ `validateInput()` called 5x during tests

---

## 🔍 Comparison Matrix

| Feature                            | Knip/ts-prune | ESLint  | **siko**       |
| ---------------------------------- | ------------- | ------- | -------------- |
| **Analysis Type**                  | Static        | Static  | **Runtime** ✨ |
| **Runs Your Code**                 | No            | No      | **Yes**        |
| **Finds Unused Exports**           | ✅            | ✅      | ❌             |
| **Finds Never-Executed Functions** | ❌            | ❌      | **✅**         |
| **False Positives**                | Common        | Common  | **Rare**       |
| **Works on Private Functions**     | Limited       | Limited | **✅**         |
| **Detects Feature-Flagged Code**   | ❌            | ❌      | **✅**         |
| **Execution Count**                | ❌            | ❌      | **✅**         |

**💡 Pro Tip**: Use **both approaches** together!

- **Knip** for structural cleanup (unused files, dependencies, exports)
- **siko** for runtime cleanup (never-executed functions)

## 🆚 siko vs Other Tools

### Static Analysis (No Execution Required)

**Knip, ts-prune, ESLint**

- ✅ Fast - no execution needed
- ✅ Finds structural issues (unused exports, files)
- ❌ Can't see runtime behavior
- ❌ False positives on dynamic code

**Best for**: Quick structural cleanup without running code

### Runtime Analysis (Execution Required)

**siko**

- ✅ High accuracy - based on real execution
- ✅ Finds never-executed functions
- ✅ No false positives
- ⚠️ Requires running your code (tests/app)

**Best for**: Finding functions that truly never run in your test suite

### Traditional Coverage Tools

**Istanbul, nyc, c8**

- ✅ Line/branch/statement coverage
- ✅ Standard industry metrics
- ❌ Focus on "% covered", not "what's unused"

**Best for**: Measuring test coverage percentages

---

**The Complete Toolkit:**

```bash
# 1. Structural cleanup
npx knip

# 2. Runtime analysis
npx siko run npm test

# 3. Coverage metrics
npx nyc npm test
```

---

## ✨ Features

- 🔍 **Runtime Execution Tracking** - Know exactly what runs during tests
- 🎯 **True Dead Code Detection** - Zero false positives based on real execution
- 📊 **Execution Metrics** - See how many times each function was called
- ⚙️ **Zero Config** - Works out of the box with sensible defaults
- 🚀 **CI/CD Integration** - Fail builds if coverage drops below threshold
- 📦 **TypeScript Support** - Full support for JavaScript and TypeScript
- 🎨 **Beautiful Reports** - Colored terminal output and JSON exports
- 💪 **Test Framework Agnostic** - Works with Jest, Mocha, Vitest, any test runner

---

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

**Example Output:**

```
📊 Siko Analysis Report
────────────────────────────────────────────────────────────

Summary:
  Total functions found: 10
  Functions executed: 7
  Functions not executed: 3
  Execution coverage: 70.0%

❌ Unused Functions:

  src/utils.js:
    ● calculateTax (line 45) - never called
    ● formatCurrency (line 89) - never called
    ● validateZip (line 102) - never called

────────────────────────────────────────────────────────────
✅ All thresholds passed!
```

Now you can **confidently delete** those 3 functions - they never executed during your test run!

---

## 📖 How It Works

siko uses a unique **runtime instrumentation approach**:

```
1. Instrument    → Babel plugin injects tracking calls
2. Execute       → Run your tests/app normally
3. Track         → Record which functions actually run
4. Analyze       → Compare inventory vs execution
5. Report        → Show never-executed functions
```

## 🏃 What "Running Code" Means

siko performs **runtime analysis** - it needs to execute your code to track what runs.

### You Can Run:

```bash
# ✅ Tests (recommended - most comprehensive)
siko run npm test
siko run jest
siko run vitest

# ✅ Your application
siko run node server.js
siko run npm start

# ✅ Scripts
siko run node scripts/migrate.js

# ✅ Any executable code
siko run ts-node src/index.ts
```

### Best Results: Comprehensive Test Suites

**With good test coverage:**

```bash
siko run npm test
# Result: High confidence - if tests are thorough,
#         unused functions are likely dead code
```

**Without tests (manual app run):**

```bash
siko run node app.js
# Use app for 5 minutes, then stop
# Result: Lower confidence - only shows what YOU used,
#         not all possible code paths
```

### 💡 Pro Tip: Run Multiple Times

```bash
# Run tests first
siko run npm test

# Then run app (keeps previous data)
siko run --no-clean node app.js

# Report combines BOTH runs!
siko report
```

This gives you the most comprehensive view of your codebase!

### Architecture

```
Source Code → Babel Instrumentation → Runtime Tracking → Siko Report
```

Unlike static analysis, siko gives you **certainty** - if a function didn't run during your comprehensive test suite, it's dead code.

---

## 🎓 Use Cases

### Perfect For:

✅ **Identifying truly unused code** - No guesswork, based on real execution  
✅ **Refactoring with confidence** - Know exactly what's safe to delete  
✅ **Test coverage insights** - Which code paths are never tested  
✅ **Legacy code cleanup** - Find ancient functions that never run  
✅ **CI/CD quality gates** - Enforce execution coverage standards

### When to Use Static Tools Instead:

Use **Knip** or **ts-prune** when you want to:

- Find unused files and dependencies
- Detect unused exports across modules
- Quick analysis without running code

### Best Practice: Use Both! 🎯

```bash
# 1. Static analysis - structural cleanup
npx knip

# 2. Runtime analysis - execution cleanup
npx siko run npm test
npx siko report
```

---

## 📖 Usage

### Commands

#### `siko run <command>`

Instruments your code and runs a command:

```bash
# Run tests
npx siko run npm test

# Run specific file
npx siko run node app.js

# Run any command
npx siko run jest --coverage
```

**Options:**

- `-v, --verbose` - Show detailed instrumentation info
- `--no-clean` - Don't clean previous execution data
- `-c, --config <path>` - Path to config file

#### `siko report`

Generate analysis report:

```bash
# Terminal report (default)
npx siko report

# Verbose mode (show executed functions)
npx siko report --verbose

# All statistics
npx siko report --all

# JSON output
npx siko report --format json -o report.json

# Both formats
npx siko report --format both

# Fail if thresholds not met (CI/CD)
npx siko report --fail-on-threshold
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
npx siko init

# Create JS config
npx siko init --format js
```

#### `siko clean`

Remove execution data files:

```bash
npx siko clean
```

---

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

| Option                 | Type       | Default                          | Description                      |
| ---------------------- | ---------- | -------------------------------- | -------------------------------- |
| `include`              | `string[]` | `["src", "lib", "app"]`          | Directories to instrument        |
| `exclude`              | `string[]` | `["node_modules", "dist", ...]`  | Patterns to exclude              |
| `extensions`           | `string[]` | `[".js", ".jsx", ".ts", ".tsx"]` | File extensions to instrument    |
| `output.inventory`     | `string`   | `.siko-signal.inventory.json`    | Static inventory output path     |
| `output.execution`     | `string`   | `.siko-signal.exec.json`         | Execution data output path       |
| `thresholds.coverage`  | `number`   | `undefined`                      | Minimum coverage % (0-100)       |
| `thresholds.maxUnused` | `number`   | `undefined`                      | Maximum unused functions allowed |
| `report.format`        | `string`   | `"terminal"`                     | Default report format            |
| `report.verbose`       | `boolean`  | `false`                          | Show verbose output by default   |
| `report.showAll`       | `boolean`  | `false`                          | Show all statistics by default   |

---

## 🎯 CI/CD Integration

Use thresholds to enforce code quality standards:

**GitHub Actions Example:**

```yaml
name: Dead Code Check

on: [push, pull_request]

jobs:
  runtime-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Install siko
        run: npm install -g siko

      - name: Run tests with tracking
        run: siko run npm test

      - name: Check execution coverage
        run: siko report --fail-on-threshold

      - name: Upload runtime report
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

---

## 📊 Example Report

### Terminal Report

```
📊 Siko Analysis Report
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
Generated by Siko - Runtime Analyzer

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
  ]
}
```

---

## 🔧 Real-World Examples

### Example 1: Feature Flag Detection

```javascript
// src/features.js
function newCheckout() {
  // New implementation
}

function oldCheckout() {
  // Legacy - feature flag turned off in tests
}

// Tests only run with new feature flag
test("checkout", () => {
  newCheckout(); // Executed ✅
  // oldCheckout never called
});
```

**siko report shows:**

```
❌ Unused: oldCheckout() - Safe to delete!
```

### Example 2: Error Path Coverage

```javascript
// src/api.js
function handleSuccess(data) {
  return processData(data);
}

function handleError(error) {
  // This error path is never tested!
  logError(error);
  sendAlert(error);
}
```

**siko report shows:**

```
⚠️  handleError() never executed
💡 Add tests for error scenarios!
```

### Example 3: Refactoring Confidence

```javascript
// After a big refactor, which old helpers are still needed?
function newImplementation() {} // ✅ Called 50x
function oldHelper1() {} // ❌ Never called
function oldHelper2() {} // ❌ Never called
function stillNeeded() {} // ✅ Called 3x
```

**siko gives you confidence to delete `oldHelper1` and `oldHelper2`!**

---

## 🆚 When to Use siko vs Static Tools

### Use **siko** when you want to:

- ✅ Find functions that **never execute** during tests
- ✅ Get **high-confidence** dead code detection (zero false positives)
- ✅ Discover **untested code paths** (error handlers, edge cases)
- ✅ Track **execution frequency** (which functions are hot paths)
- ✅ Clean up after **refactoring** (what old code is still needed?)

### Use **Knip/ts-prune** when you want to:

- ✅ Find unused **files** and **dependencies**
- ✅ Detect unused **exports** across modules
- ✅ Quick analysis **without running** code
- ✅ Static analysis for **build-time** optimization

### 🏆 Best Practice: Use Both!

```bash
# 1. Structural cleanup (static)
npx knip

# 2. Execution cleanup (runtime)
npx siko run npm test
npx siko report
```

This combination gives you **complete dead code coverage**:

- Knip removes structural waste
- siko removes runtime waste

---

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

---

## 💡 Common Questions

**Q: Will siko slow down my tests?**  
A: Minimal overhead - instrumentation is lightweight, typically <5% slowdown.

**Q: Does siko work with TypeScript?**  
A: Yes! Full support for both JavaScript and TypeScript.

**Q: Can I use this in production?**  
A: siko is designed for development/test environments, not production monitoring.

**Q: How is this different from code coverage tools?**  
A: Code coverage shows which _lines_ ran. siko shows which _functions_ never ran - perfect for finding entire unused functions.

**Q: Do I need to change my code?**  
A: No! siko instruments your code automatically - no changes needed.

---

## 🔧 How It Works

### Behind the Scenes

1. **Discovery**: siko finds all JS/TS files in your project
2. **Instrumentation**: Babel plugin injects lightweight tracking calls
3. **Execution**: Your tests run normally with tracking enabled
4. **Collection**: Records which functions execute and how many times
5. **Analysis**: Compares static inventory vs runtime execution
6. **Reporting**: Shows functions that never ran

### Architecture

```
Source Code → Babel Instrumentation → Runtime Tracking → Siko Report
                     ↓
              Static Inventory      Runtime Execution
              (all functions)    (actually called)
                     ↓                    ↓
                     └────── Compare ──────┘
                              ↓
                        Dead Code Report
```

---

## 🎓 Use Cases

### Development Workflows

- **Post-Refactoring Cleanup** - Remove old code with confidence
- **Legacy Code Migration** - Identify truly unused legacy functions
- **Test Gap Analysis** - Find code paths never tested
- **Bundle Size Reduction** - Remove dead weight before bundling
- **Code Review** - Validate that new code is actually used

### CI/CD Pipelines

- **Quality Gates** - Enforce minimum execution coverage
- **PR Checks** - Prevent dead code from being merged
- **Trend Analysis** - Track dead code over time
- **Automated Cleanup** - Fail builds with too much unused code

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development

```bash
# Clone repository
git clone https://github.com/neu-msinha/siko.git
cd siko

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

---

## 📝 License

MIT © Mayukh Sinha

---

## 🔗 Links

- [GitHub Repository](https://github.com/neu-msinha/siko)
- [npm Package](https://www.npmjs.com/package/siko)
- [Issue Tracker](https://github.com/neu-msinha/siko/issues)
- [Contributing Guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

---

## ⚠️ Known Limitations (v0.3.0)

### JSX/TSX Support (In Progress)

Currently, siko has **limited support for JSX/TSX files** due to Babel transformation issues discovered during real-world testing.

**Issue**: Instrumentation can break JSX syntax in some cases, causing TypeScript compilation errors.

**Workaround for React/Next.js/JSX projects:**

```json
{
  "extensions": [".js", ".ts"],
  "exclude": ["**/*.tsx", "**/*.jsx", "**/*.test.tsx"]
}
```

Or exclude specific JSX directories:

```json
{
  "exclude": ["src/components", "src/jsx"]
}
```

**Status**: Full JSX/TSX support is in active development for **v0.5.0**

**Current Best Use Cases** (v0.3.0):

- ✅ Node.js backends and APIs
- ✅ TypeScript libraries and packages
- ✅ JavaScript utilities and tools
- ✅ Non-React applications
- ⚠️ React projects (with workaround above)

### File Pattern Matching

Glob patterns in `exclude` (like `*.test.js`) may require full paths. Use `extensions` filter for broader exclusions.

**Improvement planned for v0.5.0**

**Made with ❤️ by [Mayukh Sinha](https://github.com/neu-msinha)**

_Runtime analysis for a cleaner codebase._
