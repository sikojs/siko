/**
 * Utility to instrument JavaScript/TypeScript code
 */

import * as babel from '@babel/core';
import { BabelFileResult } from '@babel/core';
import sikoInstrumentationPlugin from './babel-plugin';
import { detectModuleType } from '../utils/module-detection';

export interface InstrumentOptions {
  filename?: string;
  sourceMap?: boolean;
}

export interface InstrumentResult {
  code: string;
  map?: BabelFileResult['map'];
}

/**
 * Instrument JavaScript/TypeScript code
 */
export function instrumentCode(code: string, options: InstrumentOptions = {}): string {
  const moduleContext = options.filename
    ? detectModuleType(options.filename)
    : { moduleType: 'commonjs' as const };

  const result = babel.transformSync(code, {
    filename: options.filename || 'unknown.js',
    plugins: [[sikoInstrumentationPlugin, { moduleType: moduleContext.moduleType }]],
    parserOpts: {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    },
    sourceMaps: options.sourceMap !== false,
    sourceFileName: options.filename,
  });

  if (!result || !result.code) {
    throw new Error('Failed to instrument code');
  }

  return result.code;
}

/**
 * Instrument code and return with source map
 */
export function instrumentCodeWithMap(
  code: string,
  options: InstrumentOptions = {}
): InstrumentResult {
  const moduleContext = options.filename
    ? detectModuleType(options.filename)
    : { moduleType: 'commonjs' as const };

  const result = babel.transformSync(code, {
    filename: options.filename || 'unknown.js',
    plugins: [[sikoInstrumentationPlugin, { moduleType: moduleContext.moduleType }]],
    parserOpts: {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    },
    sourceMaps: true,
    sourceFileName: options.filename,
  });

  if (!result || !result.code) {
    throw new Error('Failed to instrument code');
  }

  return {
    code: result.code,
    map: result.map,
  };
}
