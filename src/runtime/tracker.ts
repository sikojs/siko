/**
 * Runtime execution tracker
 * Records which functions are executed during runtime
 */

interface ExecutionRecord {
  [functionId: string]: number; // functionId -> execution count
}

class RuntimeTracker {
  private executions: ExecutionRecord = {};
  private outputFile: string = '.siko-signal.exec.json';
  private isInitialized: boolean = false;

  /**
   * Initialize the tracker and set up exit handler
   */
  initialize(): void {
    if (this.isInitialized) return;

    // Write execution data on process exit
    process.on('exit', () => this.writeExecutionData());
    
    // Handle different exit scenarios
    process.on('SIGINT', () => process.exit(0));
    process.on('SIGTERM', () => process.exit(0));
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      process.exit(1);
    });

    this.isInitialized = true;
  }

  /**
   * Record a function execution
   * @param functionId Unique identifier for the function
   */
  recordExecution(functionId: string): void {
    if (!this.executions[functionId]) {
      this.executions[functionId] = 0;
    }
    this.executions[functionId]++;
  }

  /**
   * Write execution data to JSON file
   */
  private writeExecutionData(): void {
    const fs = require('fs');
    const data = {
      timestamp: new Date().toISOString(),
      executions: this.executions,
      totalFunctions: Object.keys(this.executions).length,
      totalExecutions: Object.values(this.executions).reduce((a, b) => a + b, 0)
    };

    try {
      fs.writeFileSync(this.outputFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to write execution data:', error);
    }
  }

  /**
   * Get current execution counts (for testing)
   */
  getExecutions(): ExecutionRecord {
    return { ...this.executions };
  }

  /**
   * Clear all execution data (for testing)
   */
  clear(): void {
    this.executions = {};
  }
}

// Singleton instance
const tracker = new RuntimeTracker();

// Auto-initialize on import
tracker.initialize();

/**
 * Global function to record executions
 * This will be called by instrumented code
 */
export function __siko_track(functionId: string): void {
  tracker.recordExecution(functionId);
}

export { RuntimeTracker, tracker };