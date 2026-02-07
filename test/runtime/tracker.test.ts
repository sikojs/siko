/**
 * Tests for runtime tracker
 */

import * as fs from 'fs';
import { tracker, __siko_track } from '../../src/runtime/tracker';

describe('Runtime Tracker', () => {
  const testOutputFile = '.siko-signal.exec.json';

  beforeEach(() => {
    // Clean up before each test
    tracker.clear();
    if (fs.existsSync(testOutputFile)) {
      fs.unlinkSync(testOutputFile);
    }
  });

  afterAll(() => {
    // Clean up after all tests
    if (fs.existsSync(testOutputFile)) {
      fs.unlinkSync(testOutputFile);
    }
  });

  test('should record function execution', () => {
    __siko_track('testFunction:test.js:1:0');
    
    const executions = tracker.getExecutions();
    expect(executions['testFunction:test.js:1:0']).toBe(1);
  });

  test('should count multiple executions', () => {
    __siko_track('testFunction:test.js:1:0');
    __siko_track('testFunction:test.js:1:0');
    __siko_track('testFunction:test.js:1:0');
    
    const executions = tracker.getExecutions();
    expect(executions['testFunction:test.js:1:0']).toBe(3);
  });

  test('should track multiple functions', () => {
    __siko_track('function1:test.js:1:0');
    __siko_track('function2:test.js:5:0');
    __siko_track('function3:test.js:10:0');
    
    const executions = tracker.getExecutions();
    expect(Object.keys(executions)).toHaveLength(3);
    expect(executions['function1:test.js:1:0']).toBe(1);
    expect(executions['function2:test.js:5:0']).toBe(1);
    expect(executions['function3:test.js:10:0']).toBe(1);
  });

  test('should clear executions', () => {
    __siko_track('testFunction:test.js:1:0');
    expect(Object.keys(tracker.getExecutions())).toHaveLength(1);
    
    tracker.clear();
    expect(Object.keys(tracker.getExecutions())).toHaveLength(0);
  });
});