/**
 * integration tests for runner with configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import { findProjectFiles } from '../../src/utils';

describe('Runner Config Integration', () => {
  const testDir = path.join(__dirname, 'runner-test');
  const srcDir = path.join(testDir, 'src');

  beforeAll(() => {
    // Create test project structure
    fs.mkdirSync(srcDir, { recursive: true });

    // Create various file types
    fs.writeFileSync(path.join(srcDir, 'app.js'), 'function app() {}');
    fs.writeFileSync(path.join(srcDir, 'utils.ts'), 'export function util() {}');
    fs.writeFileSync(path.join(srcDir, 'component.tsx'), 'export function Component() {}');
    fs.writeFileSync(path.join(srcDir, 'app.test.ts'), 'test("app", () => {})');
    fs.writeFileSync(path.join(srcDir, 'utils.spec.ts'), 'test("util", () => {})');
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('should respect extensions filter - only .js and .ts', () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);

    const files = findProjectFiles({
      includeDirs: ['src'],
      extensions: ['.js', '.ts'], // Exclude .tsx
    });

    process.chdir(originalCwd);

    // Should NOT include .tsx files
    expect(files.some((f) => f.endsWith('.tsx'))).toBe(false);

    // Should include .ts and .js
    expect(files.some((f) => f.endsWith('.ts'))).toBe(true);
    expect(files.some((f) => f.endsWith('.js'))).toBe(true);
  });

  test('should respect exclude glob patterns - *.test.ts', () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);

    const files = findProjectFiles({
      includeDirs: ['src'],
      exclude: ['**/*.test.ts'],
    });

    process.chdir(originalCwd);

    // Should NOT include test files
    expect(files.some((f) => f.includes('.test.ts'))).toBe(false);

    // Should include non-test files
    expect(files.some((f) => f.includes('utils.ts'))).toBe(true);
  });

  test('should respect exclude glob patterns - *.spec.*', () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);

    const files = findProjectFiles({
      includeDirs: ['src'],
      exclude: ['**/*.spec.*'],
    });

    process.chdir(originalCwd);

    expect(files.some((f) => f.includes('.spec.'))).toBe(false);
  });

  test('should combine extensions AND exclude filters', () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);

    const files = findProjectFiles({
      includeDirs: ['src'],
      extensions: ['.ts'], // Only .ts
      exclude: ['**/*.test.ts', '**/*.spec.ts'], // But not test files
    });

    process.chdir(originalCwd);

    // Should have ONLY utils.ts (not test, not spec, not .js, not .tsx)
    expect(files.length).toBe(1);
    expect(files[0]).toContain('utils.ts');
    expect(files[0]).not.toContain('.test.');
    expect(files[0]).not.toContain('.spec.');
  });

  test('should exclude entire directory with glob', () => {
    // Create jsx subdirectory
    const jsxDir = path.join(srcDir, 'jsx');
    fs.mkdirSync(jsxDir, { recursive: true });
    fs.writeFileSync(path.join(jsxDir, 'component.tsx'), 'export function JSX() {}');
    fs.writeFileSync(path.join(jsxDir, 'helper.ts'), 'export function helper() {}');

    const originalCwd = process.cwd();
    process.chdir(testDir);

    const files = findProjectFiles({
      includeDirs: ['src'],
      exclude: ['**/jsx/**'],
    });

    process.chdir(originalCwd);

    // Should NOT include anything from jsx directory
    expect(files.some((f) => f.includes('/jsx/'))).toBe(false);

    // Cleanup
    fs.rmSync(jsxDir, { recursive: true, force: true });
  });

  test('should use default include dirs when not specified', () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);

    const files = findProjectFiles({
      extensions: ['.js', '.ts'],
    });

    process.chdir(originalCwd);

    // Should find files in src/ (default include dir)
    expect(files.length).toBeGreaterThan(0);
  });

  test('should handle empty results gracefully', () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);

    const files = findProjectFiles({
      includeDirs: ['src'],
      extensions: ['.php'], // No PHP files
    });

    process.chdir(originalCwd);

    expect(files).toEqual([]);
  });

  test('config options should actually be applied in runner', () => {
    // This is the KEY test that would have caught the bug
    const originalCwd = process.cwd();
    process.chdir(testDir);

    // When config specifies extensions: ['.js']
    const jsOnlyFiles = findProjectFiles({
      includeDirs: ['src'],
      extensions: ['.js'],
    });

    // When config specifies extensions: ['.ts']
    const tsOnlyFiles = findProjectFiles({
      includeDirs: ['src'],
      extensions: ['.ts'],
    });

    process.chdir(originalCwd);

    // Results should be DIFFERENT based on config
    expect(jsOnlyFiles).not.toEqual(tsOnlyFiles);

    // .js config should only find .js
    expect(jsOnlyFiles.every((f) => f.endsWith('.js'))).toBe(true);

    // .ts config should only find .ts
    expect(tsOnlyFiles.every((f) => f.endsWith('.ts'))).toBe(true);
  });
});
