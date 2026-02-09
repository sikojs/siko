/**
 * ES Module wrapper for runtime
 * This allows the runtime to be imported from ES module projects
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import the CommonJS runtime
const runtime = require('./index.js');

// Re-export everything
export const __siko_track = runtime.__siko_track;
export const tracker = runtime.tracker;
export const RuntimeTracker = runtime.RuntimeTracker;
