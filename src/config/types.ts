/**
 * Configuration types for siko
 */

export interface SikoConfig {
  /**
   * Directories to include for instrumentation
   */
  include?: string[];

  /**
   * Patterns to exclude from instrumentation
   */
  exclude?: string[];

  /**
   * File extensions to instrument
   */
  extensions?: string[];

  /**
   * Output file paths
   */
  output?: {
    inventory?: string;
    execution?: string;
  };

  /**
   * Threshold configuration
   */
  thresholds?: {
    /**
     * Minimum coverage percentage (0-100)
     * If coverage is below this, exit with error code
     */
    coverage?: number;

    /**
     * Maximum number of unused functions allowed
     */
    maxUnused?: number;
  };

  /**
   * Report configuration
   */
  report?: {
    /**
     * Default report format
     */
    format?: 'terminal' | 'json' | 'both';

    /**
     * Show verbose output by default
     */
    verbose?: boolean;

    /**
     * Show all statistics by default
     */
    showAll?: boolean;
  };

  /**
   * Source map configuration
   */
  sourceMaps?: {
    /**
     * Enable source map resolution
     */
    enabled?: boolean;
  };
}

export const DEFAULT_CONFIG: SikoConfig = {
  include: ['src', 'lib', 'app'],
  exclude: [
    'node_modules',
    'dist',
    'build',
    'coverage',
    '.git',
    'test',
    'tests',
    '__tests__',
    '*.test.js',
    '*.test.ts',
    '*.spec.js',
    '*.spec.ts',
    // Avoid instrumenting adapter/runtime-test/benchmark code by default —
    // these contain runtime-specific globals (Bun, Deno) and top-level
    // behavior that instrumentation can break. Consumers can opt-in by
    // overriding config.include/exclude.
    'src/adapter',
    'runtime-tests',
    'benchmarks',
  ],
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
  output: {
    inventory: '.siko-signal.inventory.json',
    execution: '.siko-signal.exec.json',
  },
  thresholds: {
    coverage: undefined,
    maxUnused: undefined,
  },
  report: {
    format: 'terminal',
    verbose: false,
    showAll: false,
  },
  sourceMaps: {
    enabled: true,
  },
};
