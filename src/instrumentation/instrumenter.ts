/**
 * Utility to instrument JavaScript/TypeScript code
 */

import * as babel from '@babel/core';
import sikoInstrumentationPlugin from './babel-plugin';

export interface InstrumentOptions {
  filename?: string;
}

/**
 * Instrument JavaScript/TypeScript code
 */
export function instrumentCode(
  code: string,
  options: InstrumentOptions = {}
): string {
  const result = babel.transformSync(code, {
    filename: options.filename || 'unknown.js',
    plugins: [sikoInstrumentationPlugin],
    parserOpts: {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    }
  });

  if (!result || !result.code) {
    throw new Error('Failed to instrument code');
  }

  return result.code;
}