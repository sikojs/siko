# siko

> **The first runtime execution analyzer for JavaScript & TypeScript**

[![CI](https://github.com/neu-msinha/siko/actions/workflows/ci.yml/badge.svg)](https://github.com/neu-msinha/siko/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/siko.svg)](https://www.npmjs.com/package/siko)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Unlike static analysis tools that _guess_ which code is unused, **siko actually runs your code** and tells you what never executed.

✅ Zero false positives — based on real execution data  
✅ Finds runtime-only dead code — not just unused exports  
✅ Works with any test framework — Jest, Mocha, Vitest, etc.  
✅ CI/CD ready — enforce coverage thresholds in your pipeline

---

## 🚀 Quick Start

```bash
# Install
npm install --save-dev siko

# Run your tests with instrumentation
npx siko run npm test

# See what never executed
npx siko report
```

**Output:**

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

Those 3 functions never ran — you can confidently delete them.

---

## 🔧 How It Works

siko instruments your code via a Babel plugin, runs your tests normally, and tracks which functions actually execute.

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

You can run it against anything — tests, your app, scripts:

```bash
siko run npm test              # ✅ Tests (recommended)
siko run node server.js        # ✅ Your application
siko run node scripts/migrate.js  # ✅ Scripts
```

**Pro Tip** — combine multiple runs for the most comprehensive results:

```bash
siko run npm test                  # Run tests first
siko run --no-clean node app.js    # Then run app (keeps previous data)
siko report                        # Report combines BOTH runs
```

---

## 📖 Commands

### `siko run <command>`

Instruments your code and runs a command.

```bash
npx siko run npm test
npx siko run jest --coverage
npx siko run node app.js
```

| Option | Description |
| --- | --- |
| `-v, --verbose` | Show detailed instrumentation info |
| `--no-clean` | Keep previous execution data |
| `-c, --config <path>` | Path to config file |

### `siko report`

Generate analysis report from collected execution data.

```bash
npx siko report                          # Terminal report
npx siko report --verbose                # Include executed functions with call counts
npx siko report --all                    # All statistics
npx siko report --format json -o report.json  # JSON output
npx siko report --format both            # Terminal + JSON
npx siko report --fail-on-threshold      # Exit code 1 if thresholds not met (CI/CD)
```

| Option | Description |
| --- | --- |
| `-v, --verbose` | Show executed functions with call counts |
| `-a, --all` | Show all statistics |
| `-f, --format <format>` | `terminal`, `json`, or `both` |
| `-o, --output <path>` | Output file for JSON format |
| `--fail-on-threshold` | Fail if thresholds not met |

### `siko init`

Create a configuration file.

```bash
npx siko init             # JSON config (default)
npx siko init --format js # JS config
```

### `siko clean`

Remove execution data files.

```bash
npx siko clean
```

---

## ⚙️ Configuration

Create a `siko.config.json` or `siko.config.js`:

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

| Option | Default | Description |
| --- | --- | --- |
| `include` | `["src", "lib", "app"]` | Directories to instrument |
| `exclude` | `["node_modules", "dist", ...]` | Patterns to exclude |
| `extensions` | `[".js", ".jsx", ".ts", ".tsx"]` | File extensions to instrument |
| `output.inventory` | `.siko-signal.inventory.json` | Static inventory output path |
| `output.execution` | `.siko-signal.exec.json` | Execution data output path |
| `thresholds.coverage` | `undefined` | Minimum coverage % (0-100) |
| `thresholds.maxUnused` | `undefined` | Maximum unused functions allowed |
| `report.format` | `"terminal"` | Default report format |
| `report.verbose` | `false` | Show verbose output by default |
| `report.showAll` | `false` | Show all statistics by default |

---

## 🔧 Real-World Examples

### Feature Flag Detection

```javascript
function newCheckout() { /* new implementation */ }
function oldCheckout() { /* legacy - flag turned off */ }

test("checkout", () => {
  newCheckout(); // Executed ✅
  // oldCheckout never called
});
```

```
❌ Unused: oldCheckout() - Safe to delete!
```

### Error Path Coverage

```javascript
function handleSuccess(data) { return processData(data); }
function handleError(error) { logError(error); sendAlert(error); }
// Tests only cover the happy path...
```

```
⚠️  handleError() never executed — add tests for error scenarios!
```

### Post-Refactoring Cleanup

```javascript
function newImplementation() {} // ✅ Called 50x
function oldHelper1() {}        // ❌ Never called
function oldHelper2() {}        // ❌ Never called
function stillNeeded() {}       // ✅ Called 3x
```

siko gives you confidence to delete `oldHelper1` and `oldHelper2`.

---

## 🎯 CI/CD Integration

**GitHub Actions:**

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
      - run: npm ci
      - run: npm install -g siko
      - run: siko run npm test
      - run: siko report --fail-on-threshold
      - name: Upload runtime report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: siko-report
          path: siko-report.json
```

With thresholds configured, the build fails with exit code 1 if standards aren't met.

---

## 🔍 siko vs Static Analysis

Static tools like **Knip**, **ts-prune**, and **ESLint** analyze code _without running it_. They're great for finding unused files, dependencies, and exports — but they can't see runtime behavior, leading to false positives on dynamic code.

siko takes a different approach: it tracks what _actually executes_, so it catches dead code that static tools miss (like private functions that are never called, or feature-flagged code paths).

| Feature | Knip/ts-prune | ESLint | **siko** |
| --- | --- | --- | --- |
| **Analysis Type** | Static | Static | **Runtime** ✨ |
| **Runs Your Code** | No | No | **Yes** |
| **Finds Unused Exports** | ✅ | ✅ | ❌ |
| **Finds Never-Executed Functions** | ❌ | ❌ | **✅** |
| **False Positives** | Common | Common | **Rare** |
| **Works on Private Functions** | Limited | Limited | **✅** |
| **Execution Count** | ❌ | ❌ | **✅** |

**Best practice** — use both for complete coverage:

```bash
npx knip              # Structural cleanup (unused files, exports)
npx siko run npm test # Runtime cleanup (never-executed functions)
npx siko report
```

---

## 💡 FAQ

**Will siko slow down my tests?**  
Minimal overhead — typically <5% slowdown.

**Can I use this in production?**  
siko is designed for development/test environments, not production monitoring.

**How is this different from coverage tools like Istanbul?**  
Coverage tools show which _lines_ ran. siko shows which _functions_ never ran — perfect for finding entire unused functions you can delete.

---

## ⚠️ Known Limitations (v0.4.3)

**JSX/TSX Support** — Instrumentation can break JSX syntax in some cases. Workaround:

```json
{
  "extensions": [".js", ".ts"],
  "exclude": ["**/*.tsx", "**/*.jsx"]
}
```

Full JSX/TSX support is in active development for **v0.5.0**. Current best fit: Node.js backends, TypeScript libraries, JS utilities, and non-React applications.

**File Pattern Matching** — Glob patterns in `exclude` may require full paths. Use `extensions` for broader exclusions. Improvement planned for v0.5.0.

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

```bash
git clone https://github.com/neu-msinha/siko.git
cd siko
npm install
npm run build
npm test
```

---

## 📝 License

MIT © Mayukh Sinha

## 🔗 Links

[GitHub](https://github.com/neu-msinha/siko) · [npm](https://www.npmjs.com/package/siko) · [Issues](https://github.com/neu-msinha/siko/issues) · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)

---