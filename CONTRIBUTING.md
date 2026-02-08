# Contributing to siko

Thank you for your interest in contributing to siko! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Code Formatting](#code-formatting)
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
   - Go to https://github.com/sikojs/siko
   - Click the "Fork" button in the top right

2. **Clone your fork**
```bash
   git clone https://github.com/YOUR_USERNAME/siko.git
   cd siko
```

3. **Add upstream remote**
```bash
   git remote add upstream https://github.com/sikojs/siko.git
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
   npm run format:check
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
- **Format your code with Prettier**

### 4. Test Your Changes
```bash
# Run all checks
npm run build         # TypeScript compilation
npm test              # Jest tests
npm run lint          # ESLint
npm run format:check  # Prettier formatting

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

We use ESLint with TypeScript to enforce code style and quality.

### Key Principles

- **TypeScript**: Use proper types, avoid `any` unless necessary
- **Naming**: Use camelCase for variables/functions, PascalCase for classes
- **Functions**: Keep functions small and focused
- **Comments**: Explain "why", not "what"
- **Error Handling**: Use proper error types, not strings
- **Async/Await**: Prefer async/await over promises
- **Imports**: Group and order imports logically

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

## Code Formatting

We use **Prettier** to maintain consistent code formatting across the entire project.

### Before Committing

**Always format your code before committing:**
```bash
# Format all files
npm run format

# Check formatting without changes
npm run format:check
```

### CI Enforcement

⚠️ **Important**: The CI pipeline runs `npm run format:check` on every PR. 

**Unformatted code will fail CI and block your PR from being merged.**

### Prettier Configuration

Prettier is configured in `.prettierrc.json`:

- **Line width**: 100 characters
- **Quotes**: Single quotes (`'`)
- **Semicolons**: Yes (always)
- **Tab width**: 2 spaces
- **Trailing commas**: ES5 compatible
- **Arrow function parentheses**: Always

### IDE Integration

#### VSCode

1. Install [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

2. Add to your workspace settings (`.vscode/settings.json`):
```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "[typescript]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     }
   }
```

#### Other IDEs

Check Prettier's [editor integration guide](https://prettier.io/docs/en/editors.html) for WebStorm, Sublime, Vim, etc.

### Pre-commit Hook (Optional)

Want to auto-format before every commit?
```bash
# Install husky and lint-staged
npm install --save-dev husky lint-staged
npx husky init

# Add to package.json:
{
  "lint-staged": {
    "*.{ts,js}": ["prettier --write", "eslint --fix"],
    "*.{json,md}": "prettier --write"
  }
}

# Create pre-commit hook:
npx husky add .husky/pre-commit "npx lint-staged"
```

This automatically formats and lints staged files before each commit!

## Testing

We use Jest for testing with ts-jest for TypeScript support.

### Test Structure
```
test/
├── runtime/           # Runtime tracker tests
├── instrumentation/   # Babel plugin tests
├── config/           # Configuration tests
├── reporter/         # Reporter tests
└── utils/            # Utility function tests
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

  test('should handle edge cases', async () => {
    const result = await asyncFunction();
    expect(result).toBeDefined();
  });
});
```

### Test Guidelines

- ✅ **Do**: Test behavior, not implementation
- ✅ **Do**: Use descriptive test names
- ✅ **Do**: Keep tests isolated and independent
- ✅ **Do**: Test edge cases and error conditions
- ✅ **Do**: Use async/await for async tests
- ❌ **Don't**: Test internal implementation details
- ❌ **Don't**: Make tests dependent on each other
- ❌ **Don't**: Leave commented-out test code

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tracker.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="source map"

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests with verbose output
npm test -- --verbose
```

### Coverage Requirements

- Aim for 80%+ code coverage
- New features should include tests
- Bug fixes should include regression tests
- Critical paths require 100% coverage

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

- [ ] Code builds successfully: `npm run build`
- [ ] All tests pass: `npm test`
- [ ] Linter passes: `npm run lint`
- [ ] **Code is formatted: `npm run format`**
- [ ] Format check passes: `npm run format:check`
- [ ] Commits follow guidelines
- [ ] Documentation is updated
- [ ] Tests added for new features
- [ ] CHANGELOG.md is NOT updated (maintainers handle this)

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

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the project's code style
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My commits follow the commit guidelines
- [ ] All tests pass locally
- [ ] I have added tests for my changes
- [ ] Code is formatted with Prettier
- [ ] Linter passes without warnings

## Related Issues
Closes #123
Relates to #456
```

### Review Process

1. **Automated Checks**: CI must pass
   - ✅ Tests (Node 18 & 20)
   - ✅ ESLint
   - ✅ **Prettier formatting**
   - ✅ TypeScript build
   
2. **Code Review**: Maintainer will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, maintainer will merge

### Common Review Comments

- "Please run `npm run format` to fix formatting"
- "Add tests for the new functionality"
- "Update types to avoid using `any`"
- "Add JSDoc comments for public APIs"

### After Your PR is Merged

1. Delete your feature branch
2. Sync your fork with upstream
3. Celebrate! 🎉

## Project Structure
```
siko/
├── src/
│   ├── cli/              # CLI commands and interface
│   ├── config/           # Configuration loader and types
│   ├── instrumentation/  # Babel plugin for code instrumentation
│   ├── reporter/         # Report generation (terminal, JSON)
│   ├── runtime/          # Runtime execution tracker
│   └── utils/            # Utility functions (file discovery, source maps)
├── test/                 # Test files (mirrors src/ structure)
│   ├── runtime/
│   ├── instrumentation/
│   ├── config/
│   ├── reporter/
│   ├── utils/
│   └── integration/      # Integration tests
├── .github/
│   └── workflows/        # CI/CD workflows (ci.yml, publish.yml)
├── docs/                 # Additional documentation
└── dist/                 # Compiled output (generated, not committed)
```

### Key Files

- `src/cli/index.ts` - Main CLI entry point with command definitions
- `src/instrumentation/babel-plugin.ts` - Core instrumentation logic
- `src/runtime/tracker.ts` - Execution tracking and data collection
- `src/reporter/terminal-reporter.ts` - Terminal output formatting
- `src/reporter/json-reporter.ts` - JSON report generation
- `src/utils/source-map.ts` - Source map reading and position mapping
- `src/utils/file-discovery.ts` - File discovery with glob patterns
- `jest.config.js` - Jest test configuration
- `eslint.config.js` - ESLint configuration
- `.prettierrc.json` - Prettier formatting rules
- `tsconfig.json` - TypeScript compiler configuration

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
   - Checks formatting
   - Runs linter
   - Publishes to npm
   - Creates GitHub release

## Questions?

- **Bug Reports**: [Open an issue](https://github.com/sikojs/siko/issues/new)
- **Feature Requests**: [Open an issue](https://github.com/sikojs/siko/issues/new)
- **Questions**: [GitHub Discussions](https://github.com/sikojs/siko/discussions)

## Recognition

Contributors will be recognized in:
- Release notes
- README.md (future contributors section)
- Project documentation

Thank you for contributing to siko! 🚀

---