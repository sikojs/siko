/**
 * Configuration file loader
 */

import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import { SikoConfig, DEFAULT_CONFIG } from './types';
import { detectModuleType } from '../utils/module-detection';
// Use an indirect dynamic import to avoid TypeScript transpiling `import()` to `require()`
// which breaks when using file:// URLs. `new Function` preserves the runtime import.
const dynamicImport = (s: string) => new Function('s', 'return import(s)')(s) as Promise<any>;

const CONFIG_FILES = [
  'siko.config.js',
  'siko.config.cjs',
  'siko.config.json',
  '.sikorc.json',
  '.sikorc.js',
  '.sikorc.cjs',
];

/**
 * Load configuration from file
 */
export async function loadConfig(configPath?: string): Promise<SikoConfig> {
  let config: Partial<SikoConfig> = {};

  // If explicit path provided, use it
  if (configPath) {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }
    config = await loadConfigFile(configPath);
  } else {
    // Search for config file in current directory
    for (const filename of CONFIG_FILES) {
      const filePath = path.join(process.cwd(), filename);
      if (fs.existsSync(filePath)) {
          config = await loadConfigFile(filePath);
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
async function loadConfigFile(filePath: string): Promise<Partial<SikoConfig>> {
  const ext = path.extname(filePath);

  if (ext === '.json') {
    // Load JSON config
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  }

  const absolutePath = path.resolve(filePath);

  if (ext === '.cjs') {
    // Load CommonJS config via require
    try {
      const resolved = require.resolve(absolutePath);
      delete require.cache[resolved];
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(absolutePath);
    return mod.default || mod;
  }

  if (ext === '.mjs') {
    // Load ESM config via dynamic import
  const mod = await dynamicImport(pathToFileURL(absolutePath).href);
    return mod.default || mod;
  }

  if (ext === '.js') {
    // Decide based on nearest package.json type
    const moduleType = detectModuleType(absolutePath).moduleType;
    if (moduleType === 'esm') {
  const mod = await dynamicImport(pathToFileURL(absolutePath).href);
  return mod.default || mod;
    }

    try {
      const resolved = require.resolve(absolutePath);
      delete require.cache[resolved];
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(absolutePath);
    return mod.default || mod;
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
