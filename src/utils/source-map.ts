/**
 * Source map utilities for mapping instrumented code back to original
 */

import * as fs from 'fs';
import { SourceMapConsumer, RawSourceMap } from 'source-map';

export interface OriginalPosition {
  source: string | null;
  line: number;
  column: number;
}

/**
 * Read source map for a file
 */
export async function readSourceMap(filePath: string): Promise<RawSourceMap | null> {
  // Try inline source map comment
  const sourceMapPath = filePath + '.map';

  if (fs.existsSync(sourceMapPath)) {
    try {
      const mapContent = fs.readFileSync(sourceMapPath, 'utf8');
      return JSON.parse(mapContent);
    } catch {
      return null;
    }
  }

  // Try reading from file content
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const match = content.match(/\/\/# sourceMappingURL=data:application\/json;base64,(.+)/);

      if (match) {
        const base64Data = match[1];
        const mapContent = Buffer.from(base64Data, 'base64').toString('utf8');
        return JSON.parse(mapContent);
      }
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Map instrumented position back to original source position
 */
export async function mapToOriginal(
  filePath: string,
  line: number,
  column: number
): Promise<OriginalPosition> {
  const sourceMap = await readSourceMap(filePath);

  if (!sourceMap) {
    // No source map available, return as-is
    return { source: filePath, line, column };
  }

  try {
    const consumer = await new SourceMapConsumer(sourceMap);

    const original = consumer.originalPositionFor({
      line,
      column,
    });

    consumer.destroy();

    if (original.source && original.line !== null) {
      // Return original position
      return {
        source: original.source,
        line: original.line,
        column: original.column || 0,
      };
    }
  } catch {
    // If mapping fails, return as-is
  }

  // Fallback to instrumented position
  return { source: filePath, line, column };
}

/**
 * Batch map multiple positions
 */
export async function mapMultipleToOriginal(
  positions: Array<{ file: string; line: number; column: number }>
): Promise<OriginalPosition[]> {
  const results: OriginalPosition[] = [];

  for (const pos of positions) {
    const mapped = await mapToOriginal(pos.file, pos.line, pos.column);
    results.push(mapped);
  }

  return results;
}
