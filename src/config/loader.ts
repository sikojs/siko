/**
 * Configuration file loader
 */

import * as fs from 'fs';
import * as path from 'path';
import { SikoConfig, DEFAULT_CONFIG } from './types';

const CONFIG_FILES = ['siko.config.js', 'siko.config.json', '.sikorc.json', '.sikorc.js'];

/**
 * Load configuration from file
 */
export function loadConfig(configPath?: string): SikoConfig {
  let config: Partial<SikoConfig> = {};

  // If explicit path provided, use it
  if (configPath) {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }
    config = loadConfigFile(configPath);
  } else {
    // Search for config file in current directory
    for (const filename of CONFIG_FILES) {
      const filePath = path.join(process.cwd(), filename);
      if (fs.existsSync(filePath)) {
        config = loadConfigFile(filePath);
        break;
      }
    }
  }

  // Merge with defaults
  return mergeConfig(DEFAULT_CONFIG, config);
}

/**
 * Load config from a specific file
 */
function loadConfigFile(filePath: string): Partial<SikoConfig> {
  const ext = path.extname(filePath);

  if (ext === '.json') {
    // Load JSON config
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } else if (ext === '.js') {
    // Load JS config
    const absolutePath = path.resolve(filePath);
    // Clear require cache
    delete require.cache[absolutePath];
    const module = require(absolutePath);
    return module.default || module;
  }

  throw new Error(`Unsupported config file type: ${ext}`);
}

/**
 * Deep merge configurations
 */
function mergeConfig(defaults: SikoConfig, custom: Partial<SikoConfig>): SikoConfig {
  return {
    include: custom.include || defaults.include,
    exclude: custom.exclude ? [...(defaults.exclude || []), ...custom.exclude] : defaults.exclude,
    extensions: custom.extensions || defaults.extensions,
    output: {
      ...defaults.output,
      ...custom.output,
    },
    thresholds: {
      ...defaults.thresholds,
      ...custom.thresholds,
    },
    report: {
      ...defaults.report,
      ...custom.report,
    },
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: SikoConfig): void {
  if (config.thresholds?.coverage !== undefined) {
    if (config.thresholds.coverage < 0 || config.thresholds.coverage > 100) {
      throw new Error('Coverage threshold must be between 0 and 100');
    }
  }

  if (config.thresholds?.maxUnused !== undefined) {
    if (config.thresholds.maxUnused < 0) {
      throw new Error('maxUnused threshold must be >= 0');
    }
  }
}
