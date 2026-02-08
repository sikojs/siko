#!/usr/bin/env node

/**
 * siko CLI
 * Runtime execution signal analyzer for JavaScript & TypeScript
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import {
  generateReport,
  generateJsonReport,
  writeJsonReport,
  printJsonReport,
  checkThresholds,
  printThresholdResults,
} from '../reporter';
import { ExecutionData, StaticInventory } from '../runtime/types';
import { runWithInstrumentation } from './runner';
import { loadConfig, validateConfig } from '../config';

const program = new Command();

program
  .name('siko')
  .description('Runtime execution signal analyzer for JavaScript & TypeScript')
  .version('0.3.1');

/**
 * siko run <command>
 * Instrument and run a command
 */
program
  .command('run')
  .description('Instrument code and run a command')
  .argument('<command...>', 'Command to run (e.g., "npm test" or "node app.js")')
  .option('-c, --config <path>', 'Path to config file')
  .option('-v, --verbose', 'Show detailed instrumentation info')
  .option('--no-clean', "Don't clean previous execution data")
  .action(async (commandArgs: string[], options) => {
    try {
      // Load config
      const config = loadConfig(options.config);
      validateConfig(config);

      const exitCode = await runWithInstrumentation(commandArgs, {
        verbose: options.verbose,
        clean: options.clean,
        config,
      });

      process.exit(exitCode);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Failed to run command:'), message);
      process.exit(1);
    }
  });

/**
 * siko report
 * Generate analysis report
 */
program
  .command('report')
  .description('Generate execution analysis report')
  .option('-c, --config <path>', 'Path to config file')
  .option('-v, --verbose', 'Show detailed execution information')
  .option('-a, --all', 'Show all statistics')
  .option('-f, --format <format>', 'Output format: terminal, json, or both', 'terminal')
  .option('-o, --output <path>', 'Output file for JSON format')
  .option('--fail-on-threshold', 'Exit with error code if thresholds not met')
  .option('--no-source-maps', 'Disable source map resolution')
  .action(async (options) => {
    try {
      // Load config
      const config = loadConfig(options.config);
      validateConfig(config);

      const inventoryPath = config.output?.inventory || '.siko-signal.inventory.json';
      const executionPath = config.output?.execution || '.siko-signal.exec.json';

      // Check if files exist
      if (!fs.existsSync(inventoryPath)) {
        console.error(chalk.red('❌ No inventory file found'));
        console.log(chalk.yellow('\nRun your instrumented code first to generate data.'));
        console.log(chalk.gray(`Example: ${chalk.cyan('siko run npm test')}\n`));
        process.exit(1);
      }

      if (!fs.existsSync(executionPath)) {
        console.error(chalk.red('❌ No execution data found'));
        console.log(chalk.yellow('\nRun your instrumented code first to generate execution data.'));
        console.log(chalk.gray(`Example: ${chalk.cyan('siko run npm test')}\n`));
        process.exit(1);
      }

      // Read data files
      const inventory: StaticInventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
      const execution: ExecutionData = JSON.parse(fs.readFileSync(executionPath, 'utf8'));

      // Determine format from config or options
      const format = options.format || config.report?.format || 'terminal';
      const verbose = options.verbose ?? config.report?.verbose ?? false;
      const showAll = options.all ?? config.report?.showAll ?? false;
      const useSourceMaps = options.sourceMaps && config.sourceMaps?.enabled !== false;

      // Generate JSON report with source maps (async)
      const jsonReport = await generateJsonReport(inventory, execution, useSourceMaps);

      // Output based on format
      if (format === 'json') {
        if (options.output) {
          writeJsonReport(jsonReport, options.output);
          console.log(chalk.green(`✅ Report written to ${options.output}`));
        } else {
          printJsonReport(jsonReport);
        }
      } else if (format === 'both') {
        // Terminal output (async for source maps)
        await generateReport(inventory, execution, {
          verbose,
          showAll,
          useSourceMaps,
        });

        // JSON output
        const jsonPath = options.output || 'siko-report.json';
        writeJsonReport(jsonReport, jsonPath);
        console.log(chalk.gray(`\n📄 JSON report: ${jsonPath}`));
      } else {
        // Terminal only (default) - async for source maps
        await generateReport(inventory, execution, {
          verbose,
          showAll,
          useSourceMaps,
        });
      }

      // Check thresholds
      if (config.thresholds?.coverage !== undefined || config.thresholds?.maxUnused !== undefined) {
        const thresholdResult = checkThresholds(jsonReport, config);
        printThresholdResults(thresholdResult);

        if (options.failOnThreshold && !thresholdResult.passed) {
          process.exit(1);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Failed to generate report:'), message);
      process.exit(1);
    }
  });

/**
 * siko init
 * Create a config file
 */
program
  .command('init')
  .description('Create a siko configuration file')
  .option('-f, --format <format>', 'Config format: js or json', 'json')
  .action((options) => {
    const format = options.format;
    const filename = format === 'js' ? 'siko.config.js' : 'siko.config.json';

    if (fs.existsSync(filename)) {
      console.log(chalk.yellow(`⚠️  ${filename} already exists`));
      process.exit(1);
    }

    const configContent = format === 'js' ? generateJsConfig() : generateJsonConfig();

    fs.writeFileSync(filename, configContent);
    console.log(chalk.green(`✅ Created ${filename}`));
    console.log(chalk.gray('\nEdit the file to customize your configuration.'));
  });

/**
 * siko clean
 * Clean execution data files
 */
program
  .command('clean')
  .description('Remove execution data files')
  .option('-c, --config <path>', 'Path to config file')
  .action((options) => {
    try {
      const config = loadConfig(options.config);

      const files = [
        config.output?.inventory || '.siko-signal.inventory.json',
        config.output?.execution || '.siko-signal.exec.json',
        'siko-report.json',
      ];

      let cleaned = 0;

      for (const file of files) {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          cleaned++;
          console.log(chalk.gray(`  Removed ${file}`));
        }
      }

      if (cleaned > 0) {
        console.log(chalk.green(`\n✅ Cleaned ${cleaned} file(s)`));
      } else {
        console.log(chalk.gray('No files to clean'));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Failed to clean:'), message);
      process.exit(1);
    }
  });

// Show help if no command provided
if (process.argv.length === 2) {
  program.help();
}

program.parse();

/**
 * Generate JS config template
 */
function generateJsConfig(): string {
  return `module.exports = {
  // Directories to include for instrumentation
  include: ['src', 'lib', 'app'],

  // Patterns to exclude from instrumentation
  exclude: [
    'node_modules',
    'dist',
    'build',
    'coverage',
    '*.test.js',
    '*.spec.js'
  ],

  // File extensions to instrument
  extensions: ['.js', '.jsx', '.ts', '.tsx'],

  // Output file paths
  output: {
    inventory: '.siko-signal.inventory.json',
    execution: '.siko-signal.exec.json'
  },

  // Source map configuration
  sourceMaps: {
    enabled: true
  },

  // Threshold configuration for CI
  thresholds: {
    // Minimum coverage percentage (0-100)
    coverage: 80,
    // Maximum number of unused functions
    maxUnused: 10
  },

  // Report configuration
  report: {
    format: 'terminal', // 'terminal', 'json', or 'both'
    verbose: false,
    showAll: false
  }
};
`;
}

/**
 * Generate JSON config template
 */
function generateJsonConfig(): string {
  return (
    JSON.stringify(
      {
        include: ['src', 'lib', 'app'],
        exclude: ['node_modules', 'dist', 'build', 'coverage', '*.test.js', '*.spec.js'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        output: {
          inventory: '.siko-signal.inventory.json',
          execution: '.siko-signal.exec.json',
        },
        sourceMaps: {
          enabled: true,
        },
        thresholds: {
          coverage: 80,
          maxUnused: 10,
        },
        report: {
          format: 'terminal',
          verbose: false,
          showAll: false,
        },
      },
      null,
      2
    ) + '\n'
  );
}
