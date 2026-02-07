/**
 * JSON reporter - outputs structured data
 */

import * as fs from 'fs';
import { ExecutionData, StaticInventory } from '../runtime/types';

export interface JsonReport {
  summary: {
    totalFunctions: number;
    executedFunctions: number;
    unusedFunctions: number;
    coveragePercent: number;
    totalExecutions: number;
  };
  unusedFunctions: Array<{
    name: string;
    file: string;
    line: number;
    column: number;
    type: string;
  }>;
  executedFunctions: Array<{
    name: string;
    file: string;
    line: number;
    column: number;
    type: string;
    executionCount: number;
  }>;
  timestamp: string;
}

/**
 * Generate JSON report
 */
export function generateJsonReport(
  inventory: StaticInventory,
  execution: ExecutionData
): JsonReport {
  const executedIds = new Set(Object.keys(execution.executions));
  const unusedFunctions = inventory.functions.filter(f => !executedIds.has(f.id));
  const usedFunctions = inventory.functions.filter(f => executedIds.has(f.id));

  const coveragePercent = inventory.totalFunctions > 0
    ? (execution.totalFunctions / inventory.totalFunctions) * 100
    : 0;

  return {
    summary: {
      totalFunctions: inventory.totalFunctions,
      executedFunctions: execution.totalFunctions,
      unusedFunctions: unusedFunctions.length,
      coveragePercent: parseFloat(coveragePercent.toFixed(2)),
      totalExecutions: execution.totalExecutions
    },
    unusedFunctions: unusedFunctions.map(f => ({
      name: f.name,
      file: f.file,
      line: f.line,
      column: f.column,
      type: f.type
    })),
    executedFunctions: usedFunctions.map(f => ({
      name: f.name,
      file: f.file,
      line: f.line,
      column: f.column,
      type: f.type,
      executionCount: execution.executions[f.id] || 0
    })),
    timestamp: new Date().toISOString()
  };
}

/**
 * Write JSON report to file
 */
export function writeJsonReport(
  report: JsonReport,
  filePath: string = 'siko-report.json'
): void {
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
}

/**
 * Print JSON report to console
 */
export function printJsonReport(report: JsonReport): void {
  console.log(JSON.stringify(report, null, 2));
}