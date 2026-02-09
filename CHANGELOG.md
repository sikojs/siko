## [0.4.6] - 2026-02-09

### Fixed
- **CRITICAL: ES Module Runtime Error** - Fixed "module is not defined" error in ESM projects
  - Added `.mjs` wrapper for runtime to support ES module imports
  - Runner now uses `index.mjs` for ESM projects, `index.js` for CommonJS
  - Fixes compatibility with projects like Hono that use `"type": "module"`
  - This was a critical bug in 0.4.5 that prevented ESM projects from running

### Changed
- Build script updated to automatically copy ESM runtime wrapper

---

## [0.4.5] - 2026-02-09

⚠️ **Note:** This version had a critical bug with ES module projects. Please upgrade to 0.4.6.

### Added
- **Full ES Module Support** (with bug - fixed in 0.4.6)
  - Automatic module type detection (ESM vs CommonJS)
  - Respects package.json "type" field
  - .mjs and .cjs extension handling
  - Mixed module project support
  - ES import statements generated for ESM files
  - CommonJS require maintained for CJS files

- **Enhanced JSX/TSX Support**
  - Comprehensive JSX pattern support validated
  - React hooks, HOCs, fragments fully supported
  - TypeScript generics with JSX
  - Class component support
  - Async components
  - Conditional rendering
  - Full test coverage for React patterns (26 new tests)

- **Smart HOC Tracking**
  - Functions passed to HOCs now tracked by variable name
  - Works with React.memo, forwardRef, and custom HOCs
  - AST tree walking to find variable assignments
  - Examples: `const Wrapped = React.memo(() => {})` → Tracks "Wrapped"

### Changed
- Module import injection now context-aware (import vs require)
- Babel plugin signature updated to properly handle options
- Function name detection enhanced to walk up AST tree
- Documentation updated to remove JSX/TSX limitations

### Testing
- Added 55 new tests (115% increase in test coverage)
- 15 tests for module detection
- 14 tests for ES module instrumentation
- 26 tests for JSX/TSX patterns
- All tests passing (116 total)

---

## [0.4.4] - 2026-02-08

### Changed
- Updated README with repository rename and improved documentation

---

## [0.4.3] - 2026-02-08

### Changed
- Repository transferred to `neu-msinha/siko` (all links updated)

---

## [0.4.2] - 2026-02-08

### Changed
- **Repository renamed** from `sikojs/signal` to `sikojs/siko` for better brand alignment
- Updated all documentation links to reflect new repository name
- Package name and repository name now match

### Fixed
- Configuration options now properly applied to file discovery
- Extensions filter correctly excludes .tsx/.jsx files
- Exclude patterns properly respected during instrumentation

All existing GitHub links automatically redirect to new repository URL.

---

## [0.4.1] - 2026-02-08

### Fixed
- **Critical**: Configuration options now properly applied to file discovery
- Extensions filter now correctly excludes .tsx/.jsx files
- Exclude patterns now properly respected during instrumentation
- Config settings were being ignored in v0.4.0

This fixes JSX/TSX instrumentation issues in React projects.

---

## [0.4.0] - 2026-02-08

### Added
- **Source map support** - Reports now show original TypeScript line numbers
- **Glob pattern exclusions** - Use `**/*.test.ts`, `*.tsx`, `src/jsx/**` patterns
- Prettier code formatting with CI enforcement
- `--no-source-maps` flag to disable source map resolution

### Fixed
- JSX/TSX file exclusion now works correctly with glob patterns
- Line number accuracy in TypeScript projects
- Exclude patterns like `*.test.js` now properly recognized

### Improved
- CI optimized - runs only on PRs, 2x faster
- File discovery with robust glob pattern matching
- Developer experience for TypeScript users

---

## [0.3.1] - 2026-02-07

### Fixed

- Glob pattern support for exclude patterns (e.g., `**/*.test.ts`, `*.tsx`)
- File exclusion now properly handles wildcard patterns
- JSX/TSX files can now be excluded using glob patterns

### Added

- minimatch library for robust glob pattern matching
- Comprehensive file discovery tests (12 new tests)
- Support for nested directory exclusions (e.g., `src/jsx/**`)

### Improved

- File discovery logic with proper glob matching
- Documentation for exclude pattern usage
- React/JSX project compatibility via proper exclusions

---

## [0.3.0] - 2026-02-07

### Added

- Comprehensive test suite with Jest (28 tests, all passing)
- ESLint configuration with TypeScript support
- GitHub Actions CI/CD workflows
- Automated testing on Node 18 and 20
- Code coverage reporting
- Lint checks in CI pipeline
- ESLint with recommended rules and custom overrides
- Type guards for proper error handling
- CHANGELOG.md for version tracking
- API.md for detailed API documentation

### Improved

- Build process with proper TypeScript compilation
- Error handling with type narrowing
- Code quality with linting rules
- Documentation structure

### CI/CD

- Automated tests on every push and PR
- ESLint checks in CI
- Multi-version Node.js testing (18.x, 20.x)
- Build verification checks

### Testing

- Runtime tracker tests
- Babel instrumentation tests
- Configuration loader tests
- JSON reporter tests
- Threshold checker tests
- 88%+ code coverage

---

## [0.1.0] - 2026-02-05

### Added

- Initial package setup
- Basic placeholder CLI

---

## Upcoming Features

### Planned

#### v0.6.0
- HTML report generation with interactive UI
- Performance optimizations (parallel processing, caching)
- Watch mode for continuous analysis
- Historical trend analysis and comparison
- Integration with popular test frameworks (Jest plugins, Vitest integration)

#### v0.7.0+
- Browser environment support
- Code coverage integration (merge with Istanbul/nyc)
- IDE extensions (VSCode, WebStorm)

#### Known Limitations (v0.4.5)

**Truly Anonymous Functions**
- Functions without any variable assignment are not instrumented
- Example: `React.memo(() => {})` (no `const name =`) - not tracked
- However: `const Name = React.memo(() => {})` - tracked as "Name" ✓
- Functions must be assigned to a variable or have a name to be tracked

**Returned Anonymous Functions**
- Functions returned without assignment are not tracked
- Example in HOC: `return (props) => <div/>` - inner function not tracked
- Workaround: Use named functions: `return function Wrapper(props) { ... }`

**Current Best Use Cases:**
- ✅ Node.js backends (CommonJS and ESM)
- ✅ TypeScript libraries (CommonJS and ESM)
- ✅ React/JSX projects (including HOCs with variable assignment)
- ✅ ES module projects
- ✅ Mixed module environments
