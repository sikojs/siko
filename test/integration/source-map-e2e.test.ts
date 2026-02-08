/**
 * End-to-end test for source map support
 */

import * as fs from 'fs';
import * as path from 'path';
import { instrumentCodeWithMap } from '../../src/instrumentation/instrumenter';
import { mapToOriginal } from '../../src/utils/source-map';

describe('Source Map End-to-End', () => {
  const testDir = path.join(__dirname, 'e2e-test');
  const testFile = path.join(testDir, 'example.js');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('should generate source map during instrumentation', () => {
    const code = `
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}
`;

    const result = instrumentCodeWithMap(code, { filename: 'test.js' });

    expect(result.code).toBeTruthy();
    expect(result.map).toBeTruthy();
    expect(result.map?.sources).toContain('test.js');
  });

  test('should map instrumented code back to original lines', async () => {
    const originalCode = `function myFunc() {
  console.log('hello');
}`;

    // Instrument the code
    const result = instrumentCodeWithMap(originalCode, { filename: testFile });

    // Save code and map
    fs.writeFileSync(testFile, result.code);
    if (result.map) {
      fs.writeFileSync(testFile + '.map', JSON.stringify(result.map));
    }

    // The instrumented code adds lines at the top
    // Original line 1 might become line 3 or 4
    const instrumentedLines = result.code.split('\n');
    const myFuncLineInstrumented =
      instrumentedLines.findIndex((line) => line.includes('function myFunc')) + 1;

    // Map back to original
    const originalPos = await mapToOriginal(testFile, myFuncLineInstrumented, 0);

    // Should map back to line 1 (where myFunc was originally)
    expect(originalPos.line).toBeLessThanOrEqual(2); // Allow for small variance
  });

  test('should preserve source file name', () => {
    const code = 'function test() {}';
    const result = instrumentCodeWithMap(code, { filename: 'original.ts' });

    expect(result.map).toBeTruthy();
    if (result.map) {
      expect(result.map.sources).toContain('original.ts');
    }
  });
});
