/**
 * Type definitions for runtime tracking
 */

export interface ExecutionData {
  timestamp: string;
  executions: Record<string, number>;
  totalFunctions: number;
  totalExecutions: number;
}

export interface FunctionInfo {
  id: string;
  name: string;
  file: string;
  line: number;
  column: number;
  type: 'function' | 'method' | 'arrow';
}

export interface StaticInventory {
  timestamp: string;
  functions: FunctionInfo[];
  totalFunctions: number;
}