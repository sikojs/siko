/**
 * Tests for JSON reporter
 */

import { generateJsonReport } from '../../src/reporter/json-reporter';
import { ExecutionData, StaticInventory } from '../../src/runtime/types';

describe('JSON Reporter', () => {
  const mockInventory: StaticInventory = {
    timestamp: '2026-01-01T00:00:00.000Z',
    functions: [
      {
        id: 'func1:test.js:1:0',
        name: 'func1',
        file: 'test.js',
        line: 1,
        column: 0,
        type: 'function',
      },
      {
        id: 'func2:test.js:5:0',
        name: 'func2',
        file: 'test.js',
        line: 5,
        column: 0,
        type: 'function',
      },
      {
        id: 'func3:test.js:10:0',
        name: 'func3',
        file: 'test.js',
        line: 10,
        column: 0,
        type: 'function',
      },
    ],
    totalFunctions: 3,
  };

  const mockExecution: ExecutionData = {
    timestamp: '2026-01-01T00:01:00.000Z',
    executions: {
      'func1:test.js:1:0': 2,
      'func2:test.js:5:0': 1,
    },
    totalFunctions: 2,
    totalExecutions: 3,
  };

  test('should generate correct summary', async () => {
    const report = await generateJsonReport(mockInventory, mockExecution, false);

    expect(report.summary.totalFunctions).toBe(3);
    expect(report.summary.executedFunctions).toBe(2);
    expect(report.summary.unusedFunctions).toBe(1);
    expect(report.summary.totalExecutions).toBe(3);
  });

  test('should calculate coverage percentage', async () => {
    const report = await generateJsonReport(mockInventory, mockExecution, false);

    expect(report.summary.coveragePercent).toBeCloseTo(66.67, 1);
  });

  test('should list unused functions', async () => {
    const report = await generateJsonReport(mockInventory, mockExecution, false);

    expect(report.unusedFunctions).toHaveLength(1);
    expect(report.unusedFunctions[0].name).toBe('func3');
  });

  test('should list executed functions with counts', async () => {
    const report = await generateJsonReport(mockInventory, mockExecution, false);

    expect(report.executedFunctions).toHaveLength(2);

    const func1 = report.executedFunctions.find((f) => f.name === 'func1');
    expect(func1?.executionCount).toBe(2);

    const func2 = report.executedFunctions.find((f) => f.name === 'func2');
    expect(func2?.executionCount).toBe(1);
  });

  test('should handle zero coverage', async () => {
    const emptyExecution: ExecutionData = {
      timestamp: '2026-01-01T00:01:00.000Z',
      executions: {},
      totalFunctions: 0,
      totalExecutions: 0,
    };

    const report = await generateJsonReport(mockInventory, emptyExecution, false);

    expect(report.summary.coveragePercent).toBe(0);
    expect(report.unusedFunctions).toHaveLength(3);
  });

  test('should include sourceMapsUsed field', async () => {
    const report = await generateJsonReport(mockInventory, mockExecution, false);

    expect(report.sourceMapsUsed).toBe(false);
  });
});
