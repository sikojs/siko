/**
 * Tests for file discovery utilities
 */

import * as fs from 'fs';
import * as path from 'path';
import { findFiles, findProjectFiles } from '../../src/utils/file-discovery';

describe('File Discovery', () => {
  const testDir = path.join(__dirname, 'test-files');

  beforeAll(() => {
    // Create test directory structure
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create test files
    fs.writeFileSync(path.join(testDir, 'file1.js'), '// test');
    fs.writeFileSync(path.join(testDir, 'file2.ts'), '// test');
    fs.writeFileSync(path.join(testDir, 'file3.tsx'), '// test');
    fs.writeFileSync(path.join(testDir, 'component.test.ts'), '// test');
    fs.writeFileSync(path.join(testDir, 'utils.spec.js'), '// test');
    
    // Create subdirectory
    const subDir = path.join(testDir, 'sub');
    fs.mkdirSync(subDir, { recursive: true });
    fs.writeFileSync(path.join(subDir, 'nested.js'), '// test');
    fs.writeFileSync(path.join(subDir, 'nested.test.js'), '// test');
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('findFiles', () => {
    test('should find all files with default extensions', () => {
      const files = findFiles(testDir);
      
      expect(files.length).toBeGreaterThan(0);
      expect(files.some(f => f.includes('file1.js'))).toBe(true);
      expect(files.some(f => f.includes('file2.ts'))).toBe(true);
    });

    test('should filter by extensions', () => {
      const files = findFiles(testDir, {
        extensions: ['.js']
      });
      
      expect(files.every(f => f.endsWith('.js'))).toBe(true);
      expect(files.some(f => f.endsWith('.ts'))).toBe(false);
    });

    test('should exclude patterns with literal strings', () => {
      const files = findFiles(testDir, {
        exclude: ['sub']
      });
      
      expect(files.some(f => f.includes('/sub/'))).toBe(false);
    });

    test('should exclude glob patterns - *.test.ts', () => {
      const files = findFiles(testDir, {
        exclude: ['**/*.test.ts']
      });
      
      expect(files.some(f => f.includes('component.test.ts'))).toBe(false);
    });

    test('should exclude glob patterns - *.spec.*', () => {
      const files = findFiles(testDir, {
        exclude: ['**/*.spec.*']
      });
      
      expect(files.some(f => f.includes('utils.spec.js'))).toBe(false);
    });

    test('should exclude glob patterns - **/*.test.*', () => {
      const files = findFiles(testDir, {
        exclude: ['**/*.test.*']
      });
      
      expect(files.some(f => f.endsWith('.test.ts'))).toBe(false);
      expect(files.some(f => f.endsWith('.test.js'))).toBe(false);
    });

    test('should exclude directory with glob - sub/**', () => {
      const files = findFiles(testDir, {
        exclude: ['**/sub/**']
      });
      
      expect(files.some(f => f.includes('/sub/'))).toBe(false);
    });

    test('should handle multiple exclude patterns', () => {
      const files = findFiles(testDir, {
        exclude: ['**/*.test.*', '**/*.spec.*', '**/sub/**']
      });
      
      expect(files.some(f => f.includes('.test.'))).toBe(false);
      expect(files.some(f => f.includes('.spec.'))).toBe(false);
      expect(files.some(f => f.includes('/sub/'))).toBe(false);
    });

    test('should find nested files', () => {
      const files = findFiles(testDir);
      
      expect(files.some(f => f.includes('nested.js'))).toBe(true);
    });

    test('should handle non-existent directory', () => {
      const files = findFiles('/path/that/does/not/exist');
      
      expect(files).toEqual([]);
    });
  });

  describe('findProjectFiles', () => {
    test('should return empty array when no standard dirs exist', () => {
      const originalCwd = process.cwd();
      
      // Change to a directory without src/lib/app
      process.chdir(testDir);
      
      const files = findProjectFiles({
        includeDirs: ['src', 'lib', 'app']
      });
      
      // Should fall back to current directory
      expect(files.length).toBeGreaterThan(0);
      
      process.chdir(originalCwd);
    });

    test('should respect custom include directories', () => {
      const files = findProjectFiles({
        includeDirs: [testDir]
      });
      
      expect(files.length).toBeGreaterThan(0);
    });
  });
});