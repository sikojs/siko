# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-02-07

### Added
- Complete runtime execution signal analyzer
- Babel instrumentation plugin for automatic function tracking
- Runtime tracker with execution counting
- CLI interface with multiple commands
- Configuration system with JSON/JS support
- Threshold checking for CI/CD integration
- JSON report export
- Terminal reporter with colored output
- File discovery with configurable patterns
- Comprehensive test suite

### Commands
- `siko run <command>` - Instrument and run commands
- `siko report` - Generate analysis reports
- `siko init` - Create configuration files
- `siko clean` - Remove data files

### Features
- Support for functions, arrow functions, class methods, object methods
- Skip anonymous functions (intentional v1 limitation)
- Execution count tracking
- Coverage percentage calculation
- Multiple output formats (terminal, JSON, both)
- Configurable thresholds with proper exit codes
- Beautiful colored terminal output
- File backup and restoration during instrumentation

## [0.1.0] - 2026-02-05

### Added
- Initial package setup
- Basic placeholder CLI

---

## Upcoming Features

### v0.3.0 (Planned)
- Source map support for TypeScript
- HTML report generation
- Watch mode
- Historical trend analysis
- Integration with popular test frameworks

### v0.4.0 (Planned)
- Browser environment support
- Code coverage integration
- IDE extensions
- Performance optimizations

---

For detailed release notes, see [GitHub Releases](https://github.com/sikojs/signal/releases).