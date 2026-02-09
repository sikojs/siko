/**
 * Command runner - instruments files and executes commands
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import * as babel from '@babel/core';
import sikoInstrumentationPlugin from '../instrumentation/babel-plugin';
import { DEFAULT_CONFIG, SikoConfig } from '../config/types';
import { detectModuleType } from '../utils/module-detection';

export interface RunOptions {
  clean?: boolean;
  verbose?: boolean;
  config?: SikoConfig; // <-- Add this line
}

/**
 * Get absolute path to siko runtime
 */
function getRuntimePath(): string {
  // Get path to this file, go up to find dist/runtime
  const currentFile = __dirname; // .../dist/cli
  const distDir = path.dirname(currentFile); // .../dist
  const runtimePath = path.join(distDir, 'runtime');
  return runtimePath;
}

/**
 * Instrument a single file and save source map
 */
function instrumentFile(filePath: string): string {
  const code = fs.readFileSync(filePath, 'utf8');
  const runtimePath = getRuntimePath();
  const moduleContext = detectModuleType(filePath);

  const result = babel.transformSync(code, {
    filename: filePath,
    plugins: [[sikoInstrumentationPlugin, { moduleType: moduleContext.moduleType }]],
    parserOpts: {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    },
    sourceMaps: true,
    sourceFileName: filePath,
  });

  if (!result || !result.code) {
    throw new Error(`Failed to instrument ${filePath}`);
  }

  // Handle path replacement for both ESM and CommonJS
  // For ESM, use the .mjs wrapper to avoid CommonJS module issues
  const instrumented =
    moduleContext.moduleType === 'esm'
      ? result.code.replace(/from ['"]siko\/dist\/runtime['"]/g, `from '${runtimePath}/index.mjs'`)
      : result.code.replace(/require\(['"]siko\/dist\/runtime['"]\)/g, `require('${runtimePath}')`);

  // Save source map alongside instrumented file
  if (result.map) {
    const mapPath = filePath + '.siko.map';
    fs.writeFileSync(mapPath, JSON.stringify(result.map));
  }

  return instrumented;
}

/**
 * Instrument files and run a command
 */
export async function runWithInstrumentation(
  command: string[],
  options: RunOptions = {}
): Promise<number> {
  console.log(chalk.cyan('🔧 siko: Instrumenting code...\n'));

  const config = options.config || DEFAULT_CONFIG;

  // Clean previous run data
  if (options.clean !== false) {
    cleanPreviousData();
  }

  // Find files to instrument
  const { findProjectFiles } = require('../utils');
  const files = findProjectFiles({
    includeDirs: config.include,
    exclude: config.exclude,
    extensions: config.extensions,
  });

  if (files.length === 0) {
    console.log(chalk.yellow('⚠️  No JavaScript/TypeScript files found to instrument'));
    console.log(chalk.gray('Looking in: src/, lib/, app/, or current directory\n'));
    return 1;
  }

  console.log(chalk.gray(`Found ${files.length} file(s) to instrument`));

  // Create instrumented versions
  const instrumentedFiles: Array<{ original: string; backup: string }> = [];

  for (const file of files) {
    try {
      const instrumented = instrumentFile(file);

      // Create backup and write instrumented version
      const backupPath = file + '.siko-backup';
      fs.copyFileSync(file, backupPath);
      fs.writeFileSync(file, instrumented);

      instrumentedFiles.push({ original: file, backup: backupPath });

      if (options.verbose) {
        console.log(chalk.gray(`  ✓ ${path.relative(process.cwd(), file)}`));
      }
    } catch (error) {
      console.error(chalk.red(`  ✗ Failed to instrument ${file}:`), error);
    }
  }

  console.log(chalk.green(`\n✅ Instrumented ${instrumentedFiles.length} file(s)`));
  console.log(chalk.cyan(`\n🏃 Running: ${command.join(' ')}\n`));
  console.log(chalk.gray('─'.repeat(60)) + '\n');

  // Run the command
  const exitCode = await executeCommand(command);

  console.log('\n' + chalk.gray('─'.repeat(60)));

  // Restore original files
  console.log(chalk.cyan('\n🔄 Restoring original files...'));

  for (const { original, backup } of instrumentedFiles) {
    try {
      fs.copyFileSync(backup, original);
      fs.unlinkSync(backup);

      // Clean up source map
      const mapPath = original + '.siko.map';
      if (fs.existsSync(mapPath)) {
        fs.unlinkSync(mapPath);
      }
    } catch (error) {
      console.error(chalk.red(`Failed to restore ${original}`), error);
    }
  }

  console.log(chalk.green('✅ Files restored\n'));

  // Check if data was generated
  if (fs.existsSync('.siko-signal.exec.json')) {
    console.log(chalk.green('✅ Execution data collected'));
    console.log(chalk.gray(`Run ${chalk.cyan('siko report')} to see the analysis\n`));
  } else {
    console.log(chalk.yellow('⚠️  No execution data collected'));
    console.log(chalk.gray('Make sure your command actually runs JavaScript code\n'));
  }

  return exitCode;
}

/**
 * Execute a command and return exit code
 */
function executeCommand(command: string[]): Promise<number> {
  return new Promise((resolve) => {
    const [cmd, ...args] = command;

    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      resolve(code || 0);
    });

    child.on('error', (error) => {
      console.error(chalk.red('Failed to execute command:'), error);
      resolve(1);
    });
  });
}

/**
 * Clean previous execution data
 */
function cleanPreviousData(): void {
  const files = ['.siko-signal.exec.json', '.siko-signal.inventory.json'];

  for (const file of files) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  }
}
