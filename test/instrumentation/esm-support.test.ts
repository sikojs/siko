/**
 * Tests for ES Module support in instrumentation
 */

import { instrumentCode } from '../../src/instrumentation/instrumenter';
import * as fs from 'fs';
import * as path from 'path';
import { clearModuleDetectionCache } from '../../src/utils/module-detection';

describe('ES Module Support', () => {
  const testDir = path.join(__dirname, 'esm-test-files');

  beforeEach(() => {
    // Clear module detection cache before each test
    clearModuleDetectionCache();
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('ES Module import injection', () => {
    test('should inject ES import for .mjs files', () => {
      const code = `
export function hello() {
  console.log('hello');
}
`;

      const instrumented = instrumentCode(code, { filename: '/test/file.mjs' });

      expect(instrumented).toContain('import { __siko_track } from');
      expect(instrumented).toContain('__siko_track');
      expect(instrumented).not.toContain('require(');
    });

    test('should inject ES import for .js files in ESM package', () => {
      // Create test directory with ESM package.json
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ type: 'module' }));

      const testFile = path.join(testDir, 'file.js');
      const code = `
export function hello() {
  console.log('hello');
}
`;

      const instrumented = instrumentCode(code, { filename: testFile });

      expect(instrumented).toContain('import { __siko_track } from');
      expect(instrumented).not.toContain('require(');
    });

    test('should inject ES import for .ts files in ESM package', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ type: 'module' }));

      const testFile = path.join(testDir, 'file.ts');
      const code = `
export function hello(): void {
  console.log('hello');
}
`;

      const instrumented = instrumentCode(code, { filename: testFile });

      expect(instrumented).toContain('import { __siko_track } from');
    });
  });

  describe('CommonJS require injection', () => {
    test('should inject require for .cjs files', () => {
      const code = `
function hello() {
  console.log('hello');
}
module.exports = { hello };
`;

      const instrumented = instrumentCode(code, { filename: '/test/file.cjs' });

      expect(instrumented).toContain('require(');
      expect(instrumented).toContain('__siko_track');
      expect(instrumented).not.toContain('import {');
    });

    test('should inject require for .js files without package.json', () => {
      // Use a path far outside any project directory
      const testFile = '/tmp/siko-test-no-package/file.js';

      const code = `
function hello() {
  console.log('hello');
}
module.exports = { hello };
`;

      const instrumented = instrumentCode(code, { filename: testFile });

      expect(instrumented).toContain('require(');
      expect(instrumented).not.toContain('import {');
    });

    test('should inject require for .js files in CommonJS package', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ type: 'commonjs' }));

      const testFile = path.join(testDir, 'file.js');
      const code = `
function hello() {
  console.log('hello');
}
module.exports = { hello };
`;

      const instrumented = instrumentCode(code, { filename: testFile });

      expect(instrumented).toContain('require(');
    });
  });

  describe('Function instrumentation with ESM', () => {
    test('should instrument arrow functions in ESM', () => {
      const code = `
export const greet = () => {
  return 'hello';
};
`;

      const instrumented = instrumentCode(code, { filename: '/test/file.mjs' });

      expect(instrumented).toContain('import { __siko_track }');
      expect(instrumented).toContain('__siko_track("greet:');
      expect(instrumented).toContain("return 'hello'");
    });

    test('should instrument function declarations in ESM', () => {
      const code = `
export function greet() {
  return 'hello';
}
`;

      const instrumented = instrumentCode(code, { filename: '/test/file.mjs' });

      expect(instrumented).toContain('import { __siko_track }');
      expect(instrumented).toContain('__siko_track("greet:');
    });

    test('should instrument class methods in ESM', () => {
      const code = `
export class Greeter {
  greet() {
    return 'hello';
  }
}
`;

      const instrumented = instrumentCode(code, { filename: '/test/file.mjs' });

      expect(instrumented).toContain('import { __siko_track }');
      expect(instrumented).toContain('__siko_track("greet:');
    });
  });

  describe('Top-level await (ESM-only feature)', () => {
    test('should handle top-level await in .mjs files', () => {
      const code = `
const data = await fetch('/api/data');

export function process() {
  return data;
}
`;

      // Should not throw error
      expect(() => {
        const instrumented = instrumentCode(code, { filename: '/test/file.mjs' });
        expect(instrumented).toContain('import { __siko_track }');
        expect(instrumented).toContain('await fetch');
      }).not.toThrow();
    });
  });

  describe('Mixed function types', () => {
    test('should handle mix of named and arrow functions in ESM', () => {
      const code = `
export function namedFunc() {
  return 'named';
}

export const arrowFunc = () => {
  return 'arrow';
};

export class MyClass {
  method() {
    return 'method';
  }
}
`;

      const instrumented = instrumentCode(code, { filename: '/test/file.mjs' });

      expect(instrumented).toContain('import { __siko_track }');
      expect(instrumented).toContain('__siko_track("namedFunc:');
      expect(instrumented).toContain('__siko_track("arrowFunc:');
      expect(instrumented).toContain('__siko_track("method:');
    });
  });

  describe('Source maps', () => {
    test('should generate source maps for ESM files', () => {
      const code = `
export function hello() {
  console.log('hello');
}
`;

      const result = instrumentCode(code, {
        filename: '/test/file.mjs',
        sourceMap: true,
      });

      expect(result).toBeTruthy();
      expect(result).toContain('import { __siko_track }');
    });
  });

  describe('Regression tests', () => {
    test('should not double-inject import statement', () => {
      const code = `
import { __siko_track } from 'siko/dist/runtime';

export function hello() {
  __siko_track("hello:/test/file.mjs:1:0");
  console.log('hello');
}
`;

      const instrumented = instrumentCode(code, { filename: '/test/file.mjs' });

      // Count occurrences of import statement
      const importMatches = instrumented.match(/import { __siko_track }/g);
      expect(importMatches).toHaveLength(1);
    });

    test('should not double-inject require statement', () => {
      const code = `
const { __siko_track } = require('siko/dist/runtime');

function hello() {
  __siko_track("hello:/test/file.js:1:0");
  console.log('hello');
}
`;

      const instrumented = instrumentCode(code, { filename: '/test/file.cjs' });

      // Count occurrences of require statement
      const requireMatches = instrumented.match(/require\(['"]siko\/dist\/runtime['"]\)/g);
      expect(requireMatches).toHaveLength(1);
    });
  });
});
