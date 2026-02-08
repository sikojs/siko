/**
 * Tests for source map utilities
 */

import * as fs from 'fs';
import * as path from 'path';
import { readSourceMap, mapToOriginal } from '../../src/utils/source-map';
import { RawSourceMap } from 'source-map';

describe('Source Map Utilities', () => {
  const testDir = path.join(__dirname, 'test-source-maps');
  const testFile = path.join(testDir, 'test.js');
  const testMapFile = path.join(testDir, 'test.js.map');

  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up test files after each test
    if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    if (fs.existsSync(testMapFile)) fs.unlinkSync(testMapFile);
  });

  describe('readSourceMap', () => {
    test('should read source map from .map file', async () => {
      const sourceMap: RawSourceMap = {
        version: 3,
        sources: ['test.ts'],
        names: [],
        mappings: 'AAAA',
        file: 'test.js',
      };

      fs.writeFileSync(testFile, '// test code');
      fs.writeFileSync(testMapFile, JSON.stringify(sourceMap));

      const result = await readSourceMap(testFile);

      expect(result).not.toBeNull();
      expect(result?.version).toBe(3);
      expect(result?.sources).toContain('test.ts');
    });

    test('should read inline source map from file', async () => {
      const sourceMap: RawSourceMap = {
        version: 3,
        sources: ['test.ts'],
        names: [],
        mappings: 'AAAA',
        file: 'test.js',
      };

      const base64Map = Buffer.from(JSON.stringify(sourceMap)).toString('base64');
      const codeWithInlineMap = `// test code
//# sourceMappingURL=data:application/json;base64,${base64Map}`;

      fs.writeFileSync(testFile, codeWithInlineMap);

      const result = await readSourceMap(testFile);

      expect(result).not.toBeNull();
      expect(result?.version).toBe(3);
    });

    test('should return null when no source map exists', async () => {
      fs.writeFileSync(testFile, '// test code');

      const result = await readSourceMap(testFile);

      expect(result).toBeNull();
    });

    test('should return null for invalid source map', async () => {
      fs.writeFileSync(testFile, '// test code');
      fs.writeFileSync(testMapFile, 'invalid json');

      const result = await readSourceMap(testFile);

      expect(result).toBeNull();
    });

    test('should return null for non-existent file', async () => {
      const result = await readSourceMap('/path/that/does/not/exist.js');

      expect(result).toBeNull();
    });
  });

  describe('mapToOriginal', () => {
    test('should map instrumented position to original', async () => {
      // Simple source map: line 3 in compiled → line 1 in source
      const sourceMap: RawSourceMap = {
        version: 3,
        sources: ['test.ts'],
        names: [],
        mappings: ';;AAAA', // Maps line 3 to line 1
        file: 'test.js',
      };

      fs.writeFileSync(testFile, '// line 1\n// line 2\n// line 3');
      fs.writeFileSync(testMapFile, JSON.stringify(sourceMap));

      const result = await mapToOriginal(testFile, 3, 0);

      expect(result.line).toBe(1);
      expect(result.source).toContain('test.ts');
    });

    test('should return original position when no source map exists', async () => {
      fs.writeFileSync(testFile, '// test code');

      const result = await mapToOriginal(testFile, 5, 10);

      expect(result.line).toBe(5);
      expect(result.column).toBe(10);
      expect(result.source).toBe(testFile);
    });

    test('should handle mapping failure gracefully', async () => {
      const invalidMap: RawSourceMap = {
        version: 3,
        sources: [],
        names: [],
        mappings: 'invalid',
        file: 'test.js',
      };

      fs.writeFileSync(testFile, '// test');
      fs.writeFileSync(testMapFile, JSON.stringify(invalidMap));

      const result = await mapToOriginal(testFile, 1, 0);

      // Should fall back to original position
      expect(result.line).toBe(1);
      expect(result.column).toBe(0);
    });

    test('should handle files without source maps', async () => {
      const result = await mapToOriginal('/non/existent/file.js', 10, 5);

      expect(result.line).toBe(10);
      expect(result.column).toBe(5);
    });
  });
});
