/**
 * File discovery utilities
 * Find JavaScript and TypeScript files to instrument
 */

import * as fs from 'fs';
import * as path from 'path';
import { minimatch } from 'minimatch';

export interface FileDiscoveryOptions {
  extensions?: string[];
  exclude?: string[];
  includeDirs?: string[];
}

const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];

const DEFAULT_EXCLUDE = [
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  '.siko-signal.exec.json',
  '.siko-signal.inventory.json'
];

/**
 * Check if a path should be excluded using glob patterns
 */
function shouldExclude(filePath: string, excludePatterns: string[]): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  return excludePatterns.some(pattern => {
    // Try glob matching first
    if (pattern.includes('*') || pattern.includes('?')) {
      // It's a glob pattern
      return minimatch(normalizedPath, pattern, { dot: true });
    }
    
    // Direct string match for literal paths
    if (normalizedPath.includes(pattern)) {
      return true;
    }
    
    // Check if any parent directory matches
    const parts = normalizedPath.split('/');
    return parts.includes(pattern);
  });
}

/**
 * Recursively find files with given extensions
 */
export function findFiles(
  dir: string,
  options: FileDiscoveryOptions = {}
): string[] {
  const extensions = options.extensions || DEFAULT_EXTENSIONS;
  const exclude = [...DEFAULT_EXCLUDE, ...(options.exclude || [])];
  const results: string[] = [];

  function walk(currentDir: string): void {
    if (!fs.existsSync(currentDir)) {
      return;
    }

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(process.cwd(), fullPath);

      // Skip excluded paths
      if (shouldExclude(relativePath, exclude)) {
        continue;
      }

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return results;
}

/**
 * Find files to instrument based on common project patterns
 */
export function findProjectFiles(options: FileDiscoveryOptions = {}): string[] {
  const dirs = options.includeDirs || ['src', 'lib', 'app'];
  const allFiles: string[] = [];

  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      const files = findFiles(dir, options);
      allFiles.push(...files);
    }
  }

  // If no standard directories found, scan current directory
  if (allFiles.length === 0) {
    const files = findFiles('.', {
      ...options,
      exclude: [...DEFAULT_EXCLUDE, ...(options.exclude || [])]
    });
    return files;
  }

  return allFiles;
}