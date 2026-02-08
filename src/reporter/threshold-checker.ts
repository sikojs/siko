/**
 * Threshold checking for CI integration
 */

import chalk from 'chalk';
import { SikoConfig } from '../config/types';
import { JsonReport } from './json-reporter';

export interface ThresholdResult {
  passed: boolean;
  failures: string[];
}

/**
 * Check if thresholds are met
 */
export function checkThresholds(report: JsonReport, config: SikoConfig): ThresholdResult {
  const failures: string[] = [];
  const thresholds = config.thresholds || {};

  // Check coverage threshold
  if (thresholds.coverage !== undefined) {
    if (report.summary.coveragePercent < thresholds.coverage) {
      failures.push(
        `Coverage ${report.summary.coveragePercent.toFixed(1)}% is below threshold ${thresholds.coverage}%`
      );
    }
  }

  // Check max unused functions
  if (thresholds.maxUnused !== undefined) {
    if (report.summary.unusedFunctions > thresholds.maxUnused) {
      failures.push(
        `${report.summary.unusedFunctions} unused functions exceeds maximum ${thresholds.maxUnused}`
      );
    }
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

/**
 * Print threshold results
 */
export function printThresholdResults(result: ThresholdResult): void {
  if (result.passed) {
    console.log(chalk.green('\n✅ All thresholds passed!'));
  } else {
    console.log(chalk.red('\n❌ Threshold violations:'));
    result.failures.forEach((failure) => {
      console.log(chalk.red(`  • ${failure}`));
    });
  }
}
