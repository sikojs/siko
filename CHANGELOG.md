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

- Source map support for TypeScript
- HTML report generation
- Watch mode
- Historical trend analysis
- Integration with popular test frameworks
- Browser environment support
- Code coverage integration
- IDE extensions
- Performance optimizations
