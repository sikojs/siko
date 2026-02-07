#!/usr/bin/env node

/**
 * siko CLI
 * Runtime execution signal analyzer for JavaScript & TypeScript
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import { generateReport } from '../reporter';
import { ExecutionData, StaticInventory } from '../runtime/types';
import { runWithInstrumentation } from './runner';

const program = new Command();

program
  .name('siko')
  .description('Runtime execution signal analyzer for JavaScript & TypeScript')
  .version('0.2.0');

/**
 * siko run <command>
 * Instrument and run a command
 */
program
  .command('run')
  .description('Instrument code and run a command')
  .argument('<command...>', 'Command to run (e.g., "npm test" or "node app.js")')
  .option('-v, --verbose', 'Show detailed instrumentation info')
  .option('--no-clean', 'Don\'t clean previous execution data')
  .action(async (commandArgs: string[], options) => {
    try {
      const exitCode = await runWithInstrumentation(commandArgs, {
        verbose: options.verbose,
        clean: options.clean
      });

      process.exit(exitCode);
    } catch (error) {
      console.error(chalk.red('❌ Failed to run command:'), error);
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
  .option('-v, --verbose', 'Show detailed execution information')
  .option('-a, --all', 'Show all statistics')
  .action((options) => {
    const inventoryPath = '.siko-signal.inventory.json';
    const executionPath = '.siko-signal.exec.json';

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

    try {
      // Read data files
      const inventory: StaticInventory = JSON.parse(
        fs.readFileSync(inventoryPath, 'utf8')
      );
      const execution: ExecutionData = JSON.parse(
        fs.readFileSync(executionPath, 'utf8')
      );

      // Generate report
      generateReport(inventory, execution, {
        verbose: options.verbose,
        showAll: options.all
      });
    } catch (error) {
      console.error(chalk.red('❌ Failed to generate report:'), error);
      process.exit(1);
    }
  });

/**
 * siko clean
 * Clean execution data files
 */
program
  .command('clean')
  .description('Remove execution data files')
  .action(() => {
    const files = ['.siko-signal.exec.json', '.siko-signal.inventory.json'];
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
  });

// Show help if no command provided
if (process.argv.length === 2) {
  program.help();
}

program.parse();