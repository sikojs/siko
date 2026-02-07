# Contributing to siko

Thank you for your interest in contributing! This guide will help you get started.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Getting Started

### 1. Fork the Repository

1. Go to https://github.com/sikojs/signal
2. Click **"Fork"** in the top right
3. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/signal.git
cd signal
```

### 2. Add Upstream Remote
```bash
git remote add upstream https://github.com/sikojs/signal.git
git remote -v
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Build and Test
```bash
npm run build    # Build TypeScript
npm test         # Run tests
npm run lint     # Run linter
```

## Development Workflow

### 1. Sync Your Fork

Always start with the latest code:
```bash
git checkout main
git pull upstream main
git push origin main
```

### 2. Create a Branch
```bash
# For new features
git checkout -b feat/your-feature-name

# For bug fixes
git checkout -b fix/bug-description

# For documentation
git checkout -b docs/what-you-changed
```

### 3. Make Your Changes

- Write clean, maintainable code
- Follow existing code style
- Add tests for new features
- Update documentation as needed

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add awesome feature"
```

See [Commit Guidelines](#commit-guidelines) below.

### 5. Push to Your Fork
```bash
git push origin feat/your-feature-name
```

### 6. Create Pull Request

1. Go to https://github.com/sikojs/signal
2. Click **"Compare & pull request"**
3. Fill in the PR template
4. Submit!

## Commit Guidelines

We use descriptive commit messages with prefixes:

### Commit Format
```
<type>: <description>

[optional body]
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style/formatting (no logic changes)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (deps, config, etc.)
- `perf:` - Performance improvements

### Examples
```bash
# Good ✅
git commit -m "feat: add babel instrumentation plugin"
git commit -m "fix: resolve memory leak in tracker"
git commit -m "docs: update installation instructions"
git commit -m "refactor: simplify CLI argument parsing"

# Bad ❌
git commit -m "update stuff"
git commit -m "fix"
git commit -m "WIP"
```

### Multi-line Commits

For larger changes, add a body:
```bash
git commit -m "feat: add runtime tracker

- Implement execution recording
- Add memory-efficient storage
- Include process exit handler"
```

## Pull Request Process

### Before Submitting

- [ ] Code builds successfully: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] Linter passes: `npm run lint`
- [ ] Commits are descriptive and clear
- [ ] Documentation is updated (if needed)

### PR Title

Use the same format as commits:
```
feat: add instrumentation plugin
fix: resolve CLI crash on Windows
docs: improve README examples
```

### PR Description Template
```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How has this been tested?

## Checklist
- [ ] My code builds without errors
- [ ] I have tested my changes
- [ ] I have updated documentation
- [ ] My commits follow the commit guidelines
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Changes will be included in the next release

## Release Process

### How Releases Work

We use **version-based releases**:

1. When ready to release, a maintainer updates `package.json` version
2. Merging that change to `main` triggers automatic npm publish
3. A GitHub release is created automatically

### Version Numbers

We follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.2.0 → 0.2.1): Bug fixes, small improvements
- **Minor** (0.2.0 → 0.3.0): New features, backwards compatible
- **Major** (0.2.0 → 1.0.0): Breaking changes

### For Maintainers Only

To release a new version:
```bash
# Patch release (bug fixes)
npm version patch

# Minor release (new features)
npm version minor

# Major release (breaking changes)
npm version major

# Push to trigger release
git push origin main
```

The GitHub Action will:
- ✅ Detect version change
- ✅ Build the project
- ✅ Publish to npm
- ✅ Create GitHub release

## Questions?

- Check existing [issues](https://github.com/sikojs/signal/issues)
- Open a new issue for bugs or feature requests
- Ask questions in pull requests

Thank you for contributing! 🎉