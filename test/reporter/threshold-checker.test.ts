/**
 * Tests for threshold checker
 */

import { checkThresholds } from '../../src/reporter/threshold-checker';
import { SikoConfig } from '../../src/config/types';
import { JsonReport } from '../../src/reporter/json-reporter';

describe('Threshold Checker', () => {
  const mockReport: JsonReport = {
    summary: {
      totalFunctions: 10,
      executedFunctions: 7,
      unusedFunctions: 3,
      coveragePercent: 70,
      totalExecutions: 15,
    },
    unusedFunctions: [],
    executedFunctions: [],
    timestamp: '2026-01-01T00:00:00.000Z',
    sourceMapsUsed: false, // Add this line
  };

  test('should pass when no thresholds configured', () => {
    const config: SikoConfig = {};

    const result = checkThresholds(mockReport, config);

    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  test('should pass when coverage meets threshold', () => {
    const config: SikoConfig = {
      thresholds: {
        coverage: 60,
      },
    };

    const result = checkThresholds(mockReport, config);

    expect(result.passed).toBe(true);
  });

  test('should fail when coverage below threshold', () => {
    const config: SikoConfig = {
      thresholds: {
        coverage: 80,
      },
    };

    const result = checkThresholds(mockReport, config);

    expect(result.passed).toBe(false);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toContain('70.0%');
    expect(result.failures[0]).toContain('80%');
  });

  test('should pass when unused functions within limit', () => {
    const config: SikoConfig = {
      thresholds: {
        maxUnused: 5,
      },
    };

    const result = checkThresholds(mockReport, config);

    expect(result.passed).toBe(true);
  });

  test('should fail when too many unused functions', () => {
    const config: SikoConfig = {
      thresholds: {
        maxUnused: 2,
      },
    };

    const result = checkThresholds(mockReport, config);

    expect(result.passed).toBe(false);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toContain('3 unused');
    expect(result.failures[0]).toContain('2');
  });

  test('should report multiple threshold failures', () => {
    const config: SikoConfig = {
      thresholds: {
        coverage: 80,
        maxUnused: 1,
      },
    };

    const result = checkThresholds(mockReport, config);

    expect(result.passed).toBe(false);
    expect(result.failures).toHaveLength(2);
  });
});
