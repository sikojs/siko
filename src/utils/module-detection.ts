/**
 * Module type detection utilities
 * Detects whether a file should use ES modules or CommonJS based on Node.js resolution rules
 */

import * as fs from 'fs';
import * as path from 'path';

export type ModuleType = 'esm' | 'commonjs';

export interface ModuleContext {
  moduleType: ModuleType;
  filePath: string;
}

/**
 * Cache for package.json lookups
 * Maps directory path to module type
 */
const packageTypeCache = new Map<string, 'module' | 'commonjs'>();

/**
 * Read and parse package.json from a directory
 */
function readPackageJson(dirPath: string): { type?: string } | null {
  const packageJsonPath = path.join(dirPath, 'package.json');

  try {
    if (!fs.existsSync(packageJsonPath)) {
      return null;
    }

    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);

    return packageJson;
  } catch {
    // Handle corrupt JSON or read errors gracefully
    return null;
  }
}

/**
 * Walk up directory tree to find nearest package.json and determine module type
 */
function findPackageJsonType(startPath: string): 'module' | 'commonjs' {
  let currentDir = path.dirname(startPath);
  const root = path.parse(currentDir).root;

  // Walk up directory tree
  while (true) {
    // Check cache first
    if (packageTypeCache.has(currentDir)) {
      return packageTypeCache.get(currentDir)!;
    }

    // Try to read package.json
    const packageJson = readPackageJson(currentDir);

    if (packageJson !== null) {
      // Found package.json, check type field
      const moduleType = packageJson.type === 'module' ? 'module' : 'commonjs';

      // Cache the result
      packageTypeCache.set(currentDir, moduleType);

      return moduleType;
    }

    // Check if we've reached the filesystem root
    if (currentDir === root) {
      break;
    }

    // Move up one directory
    const parentDir = path.dirname(currentDir);

    // Prevent infinite loop
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  // No package.json found, default to CommonJS
  return 'commonjs';
}

/**
 * Detect module type for a given file path
 *
 * Detection priority (follows Node.js spec):
 * 1. .mjs extension → ESM
 * 2. .cjs extension → CommonJS
 * 3. .js, .jsx, .ts, .tsx → Check nearest package.json "type" field
 */
export function detectModuleType(filePath: string): ModuleContext {
  const ext = path.extname(filePath);

  // .mjs files are always ES modules
  if (ext === '.mjs') {
    return {
      moduleType: 'esm',
      filePath,
    };
  }

  // .cjs files are always CommonJS
  if (ext === '.cjs') {
    return {
      moduleType: 'commonjs',
      filePath,
    };
  }

  // For .js, .jsx, .ts, .tsx - check package.json
  const packageType = findPackageJsonType(filePath);

  return {
    moduleType: packageType === 'module' ? 'esm' : 'commonjs',
    filePath,
  };
}

/**
 * Clear the package type cache (useful for testing)
 */
export function clearModuleDetectionCache(): void {
  packageTypeCache.clear();
}
