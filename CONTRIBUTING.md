# Contributing to siko

Thank you for your interest in contributing to siko! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Release Process](#release-process)

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions. We're building a welcoming community where everyone can contribute.

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- Git
- A GitHub account

### Fork and Clone

1. **Fork the repository** on GitHub
   - Go to https://github.com/sikojs/signal
   - Click the "Fork" button in the top right

2. **Clone your fork**
```bash
   git clone https://github.com/YOUR_USERNAME/signal.git
   cd signal
```

3. **Add upstream remote**
```bash
   git remote add upstream https://github.com/sikojs/signal.git
   git remote -v
```

4. **Install dependencies**
```bash
   npm install
```

5. **Verify setup**
```bash
   npm run build
   npm test
   npm run lint
```

All commands should complete successfully!

## Development Workflow

### 1. Sync with Upstream

Always start with the latest code:
```bash
git checkout main
git pull upstream main
git push origin main
```

### 2. Create a Feature Branch

Use descriptive branch names:
```bash
# For new features
git checkout -b feat/add-source-map-support

# For bug fixes
git checkout -b fix/resolve-windows-path-issue

# For documentation
git checkout -b docs/update-api-documentation

# For CI/CD improvements
git checkout -b ci/add-coverage-reporting
```

### 3. Make Your Changes

- Write clean, maintainable code
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits focused and atomic

### 4. Test Your Changes
```bash
# Run all checks
npm run build    # TypeScript compilation
npm test         # Jest tests
npm run lint     # ESLint

# Run tests in watch mode during development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### 5. Commit Your Changes

Follow our [commit guidelines](#commit-guidelines):
```bash
git add .
git commit -m "feat: add source map support for TypeScript"
```

### 6. Push and Create PR
```bash
git push origin feat/add-source-map-support
```

Then go to GitHub and create a Pull Request.

## Code Style

We use ESLint with TypeScript to enforce code style.

### Key Principles

- **TypeScript**: Use proper types, avoid `any` unless necessary
- **Naming**: Use camelCase for variables/functions, PascalCase for classes
- **Functions**: Keep functions small and focused
- **Comments**: Explain "why", not "what"
- **Error Handling**: Use proper error types, not strings

### ESLint Rules

The project follows:
- ESLint recommended rules
- TypeScript ESLint recommended rules
- Custom rules in `eslint.config.js`

Run linter:
```bash
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Example Code Style
```typescript
// ✅ Good
function calculateCoverage(total: number, executed: number): number {
  if (total === 0) return 0;
  return (executed / total) * 100;
}

// ❌ Bad
function calc(t: any, e: any) {
  return (e / t) * 100;
}
```

## Testing

We use Jest for testing with ts-jest for TypeScript support.

### Test Structure
```
test/
├── runtime/           # Runtime tracker tests
├── instrumentation/   # Babel plugin tests
├── config/           # Configuration tests
└── reporter/         # Reporter tests
```

### Writing Tests
```typescript
describe('YourFeature', () => {
  test('should do something specific', () => {
    // Arrange
    const input = createTestInput();
    
    // Act
    const result = yourFunction(input);
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

### Test Guidelines

- ✅ **Do**: Test behavior, not implementation
- ✅ **Do**: Use descriptive test names
- ✅ **Do**: Keep tests isolated and independent
- ✅ **Do**: Test edge cases and error conditions
- ❌ **Don't**: Test internal implementation details
- ❌ **Don't**: Make tests dependent on each other

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tracker.test.ts

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Coverage Requirements

- Aim for 80%+ code coverage
- New features should include tests
- Bug fixes should include regression tests

## Commit Guidelines

We use descriptive commit messages to maintain clear project history.

### Commit Message Format
```
<type>: <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add HTML report generator` |
| `fix` | Bug fix | `fix: resolve memory leak in tracker` |
| `docs` | Documentation | `docs: update installation guide` |
| `style` | Code style/formatting | `style: format code with prettier` |
| `refactor` | Code refactoring | `refactor: simplify CLI argument parsing` |
| `test` | Add/update tests | `test: add edge case tests for reporter` |
| `chore` | Maintenance | `chore: update dependencies` |
| `ci` | CI/CD changes | `ci: add Node 22 to test matrix` |
| `perf` | Performance improvements | `perf: optimize tracker memory usage` |

### Subject Line Rules

- Use imperative mood: "add feature" not "added feature"
- Don't capitalize first letter
- No period at the end
- Keep under 72 characters

### Examples
```bash
# Good ✅
feat: add support for ES modules
fix: handle null values in execution data
docs: add API documentation for reporters
test: add tests for configuration loader
refactor: extract report formatting logic

# Bad ❌
Added new feature
Fixed bug
updated docs
WIP
```

### Multi-line Commits

For complex changes:
```bash
git commit -m "feat: add source map support

- Parse source maps for TypeScript files
- Map instrumented locations to original source
- Update reporter to show original line numbers
- Add tests for source map resolution

Closes #42"
```

## Pull Request Process

### Before Submitting

- [ ] Code builds successfully (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Commits follow guidelines
- [ ] Documentation is updated
- [ ] CHANGELOG.md is NOT updated (maintainers will do this)

### PR Title

Use the same format as commit messages:
```
feat: add HTML report generation
fix: resolve CLI crash on Windows
docs: improve configuration examples
```

### PR Description Template
```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran and their results

## Checklist
- [ ] My code follows the project's code style
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My commits follow the commit guidelines
- [ ] All tests pass locally
- [ ] I have added tests for my changes

## Related Issues
Closes #123
Relates to #456
```

### Review Process

1. **Automated Checks**: CI must pass (tests, lint, build)
2. **Code Review**: Maintainer will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, maintainer will merge

### After Your PR is Merged

1. Delete your feature branch
2. Sync your fork with upstream
3. Celebrate! 🎉

## Project Structure
```
signal/
├── src/
│   ├── cli/              # CLI commands and interface
│   ├── config/           # Configuration loader and types
│   ├── instrumentation/  # Babel plugin for code instrumentation
│   ├── reporter/         # Report generation (terminal, JSON)
│   ├── runtime/          # Runtime execution tracker
│   └── utils/            # Utility functions
├── test/                 # Test files (mirrors src/ structure)
├── .github/
│   └── workflows/        # CI/CD workflows
├── docs/                 # Additional documentation
└── dist/                 # Compiled output (generated)
```

### Key Files

- `src/cli/index.ts` - Main CLI entry point
- `src/instrumentation/babel-plugin.ts` - Core instrumentation logic
- `src/runtime/tracker.ts` - Execution tracking
- `src/reporter/terminal-reporter.ts` - Terminal output formatting
- `jest.config.js` - Jest configuration
- `eslint.config.js` - ESLint configuration
- `tsconfig.json` - TypeScript configuration

## Release Process

**Note**: Only maintainers can publish releases.

### For Contributors

You don't need to worry about releases! Just:
1. Make your changes
2. Follow the guidelines
3. Submit your PR

Maintainers will handle versioning and publishing.

### For Maintainers

1. **Update CHANGELOG.md**
```bash
   # Add new version section with changes
```

2. **Bump version**
```bash
   npm version patch   # 0.3.0 → 0.3.1 (bug fixes)
   npm version minor   # 0.3.0 → 0.4.0 (new features)
   npm version major   # 0.3.0 → 1.0.0 (breaking changes)
```

3. **Push with tags**
```bash
   git push origin main --follow-tags
```

4. **GitHub Actions handles the rest**
   - Runs tests
   - Publishes to npm
   - Creates GitHub release

## Questions?

- **Bug Reports**: [Open an issue](https://github.com/sikojs/signal/issues/new)
- **Feature Requests**: [Open an issue](https://github.com/sikojs/signal/issues/new)
- **Questions**: [GitHub Discussions](https://github.com/sikojs/signal/discussions)

## Recognition

Contributors will be recognized in:
- Release notes
- README.md (future)
- Project documentation

Thank you for contributing to siko! 🚀

---

**Made with ❤️ by the siko community**