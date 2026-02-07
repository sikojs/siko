/**
 * @siko/signal - Runtime execution signal analyzer
 * @author Mayukh Sinha
 */

export const version = '0.2.0';

// Export runtime tracker for instrumented code
export { __siko_track } from './runtime';

// Export types
export type { ExecutionData, FunctionInfo, StaticInventory } from './runtime/types';