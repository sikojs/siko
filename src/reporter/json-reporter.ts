/**
 * JSON reporter - outputs structured data
 */

import * as fs from 'fs';
import { ExecutionData, StaticInventory } from '../runtime/types';
import { mapToOriginal } from '../utils/source-map';

interface MappedFunctionBase {
  name: string;
  file: string;
  line: number;
  column: number;
  type: string;
  originalFile?: string;
  originalLine?: number;
}

interface MappedExecutedFunction extends MappedFunctionBase {
  executionCount: number;
}

export interface JsonReport {
  summary: {
    totalFunctions: number;
    executedFunctions: number;
    unusedFunctions: number;
    coveragePercent: number;
    totalExecutions: number;
  };
  unusedFunctions: MappedFunctionBase[];
  executedFunctions: MappedExecutedFunction[];
  timestamp: string;
  sourceMapsUsed: boolean;
}

/**
 * Map function to original position with source maps
 */
async function mapFunctionWithSourceMap(func: {
  name: string;
  file: string;
  line: number;
  column: number;
  type: string;
  id: string;
}): Promise<MappedFunctionBase> {
  const mapped = await mapToOriginal(func.file, func.line, func.column);

  const result: MappedFunctionBase = {
    name: func.name,
    file: mapped.source || func.file,
    line: mapped.line,
    column: mapped.column,
    type: func.type,
  };

  // Add original file info only if different and not null
  if (mapped.source && mapped.source !== func.file) {
    result.originalFile = mapped.source;
    result.originalLine = mapped.line;
  }

  return result;
}

/**
 * Generate JSON report
 */
export async function generateJsonReport(
  inventory: StaticInventory,
  execution: ExecutionData,
  useSourceMaps: boolean = true
): Promise<JsonReport> {
  const executedIds = new Set(Object.keys(execution.executions));
  const unusedFunctions = inventory.functions.filter((f) => !executedIds.has(f.id));
  const usedFunctions = inventory.functions.filter((f) => executedIds.has(f.id));

  const coveragePercent =
    inventory.totalFunctions > 0 ? (execution.totalFunctions / inventory.totalFunctions) * 100 : 0;

  let sourceMapsUsed = false;

  // Map to original positions if source maps enabled
  if (useSourceMaps) {
    try {
      const mappedUnused = await Promise.all(
        unusedFunctions.map((f) => mapFunctionWithSourceMap(f))
      );

      const mappedUsed = await Promise.all(usedFunctions.map((f) => mapFunctionWithSourceMap(f)));

      sourceMapsUsed = true;

      return {
        summary: {
          totalFunctions: inventory.totalFunctions,
          executedFunctions: execution.totalFunctions,
          unusedFunctions: unusedFunctions.length,
          coveragePercent: parseFloat(coveragePercent.toFixed(2)),
          totalExecutions: execution.totalExecutions,
        },
        unusedFunctions: mappedUnused,
        executedFunctions: mappedUsed.map((f, idx) => ({
          ...f,
          executionCount: execution.executions[usedFunctions[idx].id] || 0,
        })),
        timestamp: new Date().toISOString(),
        sourceMapsUsed,
      };
    } catch {
      // Fall back to non-source-mapped version
      sourceMapsUsed = false;
    }
  }

  // Fallback: No source maps
  return {
    summary: {
      totalFunctions: inventory.totalFunctions,
      executedFunctions: execution.totalFunctions,
      unusedFunctions: unusedFunctions.length,
      coveragePercent: parseFloat(coveragePercent.toFixed(2)),
      totalExecutions: execution.totalExecutions,
    },
    unusedFunctions: unusedFunctions.map((f) => ({
      name: f.name,
      file: f.file,
      line: f.line,
      column: f.column,
      type: f.type,
    })),
    executedFunctions: usedFunctions.map((f) => ({
      name: f.name,
      file: f.file,
      line: f.line,
      column: f.column,
      type: f.type,
      executionCount: execution.executions[f.id] || 0,
    })),
    timestamp: new Date().toISOString(),
    sourceMapsUsed,
  };
}

/**
 * Write JSON report to file
 */
export function writeJsonReport(report: JsonReport, filePath: string = 'siko-report.json'): void {
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
}

/**
 * Print JSON report to console
 */
export function printJsonReport(report: JsonReport): void {
  console.log(JSON.stringify(report, null, 2));
}
