/**
 * Tests for module detection utilities
 */

import * as fs from 'fs';
import * as path from 'path';
import { detectModuleType, clearModuleDetectionCache } from '../../src/utils/module-detection';

describe('Module Detection', () => {
  const testDir = path.join(__dirname, 'module-test-files');

  beforeEach(() => {
    // Clear cache before each test
    clearModuleDetectionCache();
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('detectModuleType', () => {
    test('should detect .mjs files as ESM', () => {
      const result = detectModuleType('/test/file.mjs');

      expect(result.moduleType).toBe('esm');
      expect(result.filePath).toBe('/test/file.mjs');
    });

    test('should detect .cjs files as CommonJS', () => {
      const result = detectModuleType('/test/file.cjs');

      expect(result.moduleType).toBe('commonjs');
      expect(result.filePath).toBe('/test/file.cjs');
    });

    test('should detect .js file with "type": "module" in package.json as ESM', () => {
      // Create test directory with package.json
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ type: 'module' }));

      const testFile = path.join(testDir, 'file.js');
      const result = detectModuleType(testFile);

      expect(result.moduleType).toBe('esm');
    });

    test('should detect .js file with "type": "commonjs" in package.json as CommonJS', () => {
      // Create test directory with package.json
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ type: 'commonjs' }));

      const testFile = path.join(testDir, 'file.js');
      const result = detectModuleType(testFile);

      expect(result.moduleType).toBe('commonjs');
    });

    test('should default to CommonJS when no package.json found', () => {
      // Use a path where no package.json exists up the tree
      const testFile = path.join(testDir, 'no-package', 'file.js');
      fs.mkdirSync(path.dirname(testFile), { recursive: true });

      const result = detectModuleType(testFile);

      expect(result.moduleType).toBe('commonjs');
    });

    test('should default to CommonJS when package.json has no "type" field', () => {
      // Create test directory with package.json without type field
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(
        path.join(testDir, 'package.json'),
        JSON.stringify({ name: 'test-package' })
      );

      const testFile = path.join(testDir, 'file.js');
      const result = detectModuleType(testFile);

      expect(result.moduleType).toBe('commonjs');
    });

    test('should handle .ts files the same as .js files', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ type: 'module' }));

      const testFile = path.join(testDir, 'file.ts');
      const result = detectModuleType(testFile);

      expect(result.moduleType).toBe('esm');
    });

    test('should handle .tsx files the same as .js files', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ type: 'module' }));

      const testFile = path.join(testDir, 'component.tsx');
      const result = detectModuleType(testFile);

      expect(result.moduleType).toBe('esm');
    });

    test('should handle .jsx files the same as .js files', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ type: 'module' }));

      const testFile = path.join(testDir, 'component.jsx');
      const result = detectModuleType(testFile);

      expect(result.moduleType).toBe('esm');
    });

    test('should walk up directory tree to find package.json', () => {
      // Create nested directory structure
      const nestedDir = path.join(testDir, 'a', 'b', 'c');
      fs.mkdirSync(nestedDir, { recursive: true });

      // Put package.json at root of testDir
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ type: 'module' }));

      // Test file deep in nested structure
      const testFile = path.join(nestedDir, 'file.js');
      const result = detectModuleType(testFile);

      expect(result.moduleType).toBe('esm');
    });

    test('should use nearest package.json in monorepo structure', () => {
      // Create monorepo structure
      const rootDir = path.join(testDir, 'monorepo');
      const pkgADir = path.join(rootDir, 'packages', 'pkg-a');
      const pkgBDir = path.join(rootDir, 'packages', 'pkg-b');

      fs.mkdirSync(pkgADir, { recursive: true });
      fs.mkdirSync(pkgBDir, { recursive: true });

      // Root package.json - CommonJS
      fs.writeFileSync(path.join(rootDir, 'package.json'), JSON.stringify({ type: 'commonjs' }));

      // Package A - ESM
      fs.writeFileSync(path.join(pkgADir, 'package.json'), JSON.stringify({ type: 'module' }));

      // Package B - no type (defaults to CommonJS)
      fs.writeFileSync(path.join(pkgBDir, 'package.json'), JSON.stringify({ name: 'pkg-b' }));

      // Test files in each package
      const fileA = path.join(pkgADir, 'file.js');
      const fileB = path.join(pkgBDir, 'file.js');

      expect(detectModuleType(fileA).moduleType).toBe('esm');
      expect(detectModuleType(fileB).moduleType).toBe('commonjs');
    });

    test('should handle corrupt package.json gracefully', () => {
      fs.mkdirSync(testDir, { recursive: true });

      // Write invalid JSON
      fs.writeFileSync(path.join(testDir, 'package.json'), '{ invalid json }');

      const testFile = path.join(testDir, 'file.js');
      const result = detectModuleType(testFile);

      // Should default to CommonJS when package.json is corrupt
      expect(result.moduleType).toBe('commonjs');
    });

    test('should handle missing package.json file gracefully', () => {
      const testFile = path.join(testDir, 'nonexistent', 'file.js');

      const result = detectModuleType(testFile);

      expect(result.moduleType).toBe('commonjs');
    });
  });

  describe('caching', () => {
    test('should cache package.json lookups for performance', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ type: 'module' }));

      const file1 = path.join(testDir, 'file1.js');
      const file2 = path.join(testDir, 'file2.js');

      // First call - reads package.json
      const result1 = detectModuleType(file1);

      // Second call - should use cache
      const result2 = detectModuleType(file2);

      expect(result1.moduleType).toBe('esm');
      expect(result2.moduleType).toBe('esm');

      // Both should have found the same package.json (cached)
    });

    test('clearModuleDetectionCache should clear the cache', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ type: 'module' }));

      const testFile = path.join(testDir, 'file.js');

      // Detect once to populate cache
      detectModuleType(testFile);

      // Clear cache
      clearModuleDetectionCache();

      // Change package.json
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ type: 'commonjs' }));

      // Detect again - should read new value
      const result = detectModuleType(testFile);

      expect(result.moduleType).toBe('commonjs');
    });
  });
});
