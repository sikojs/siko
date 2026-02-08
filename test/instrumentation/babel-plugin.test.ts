/**
 * Tests for Babel instrumentation plugin
 */

import { instrumentCode } from '../../src/instrumentation/instrumenter';

describe('Babel Instrumentation Plugin', () => {
  test('should instrument function declarations', () => {
    const code = `
      function testFunction() {
        console.log('test');
      }
    `;

    const instrumented = instrumentCode(code, { filename: 'test.js' });

    expect(instrumented).toContain('__siko_track');
    expect(instrumented).toContain('testFunction:');
    expect(instrumented).toContain('test.js');
  });

  test('should instrument arrow functions', () => {
    const code = `
      const testFunc = () => {
        console.log('test');
      };
    `;

    const instrumented = instrumentCode(code, { filename: 'test.js' });

    expect(instrumented).toContain('__siko_track');
    expect(instrumented).toContain('testFunc:');
    expect(instrumented).toContain('test.js');
  });

  test('should instrument class methods', () => {
    const code = `
      class TestClass {
        testMethod() {
          console.log('test');
        }
      }
    `;

    const instrumented = instrumentCode(code, { filename: 'test.js' });

    expect(instrumented).toContain('__siko_track');
    expect(instrumented).toContain('testMethod:');
    expect(instrumented).toContain('test.js');
  });

  test('should not instrument anonymous functions', () => {
    const code = `
      setTimeout(function() {
        console.log('test');
      }, 1000);
    `;

    const instrumented = instrumentCode(code, { filename: 'test.js' });

    // Should not add tracking for anonymous function
    expect(instrumented).not.toContain('anonymous');
  });

  test('should inject runtime import', () => {
    const code = `
      function testFunction() {
        console.log('test');
      }
    `;

    const instrumented = instrumentCode(code, { filename: 'test.js' });

    expect(instrumented).toContain('require');
    expect(instrumented).toContain('__siko_track');
  });

  test('should instrument function expressions', () => {
    const code = `
      const myFunc = function() {
        return 42;
      };
    `;

    const instrumented = instrumentCode(code, { filename: 'test.js' });

    expect(instrumented).toContain('__siko_track');
    expect(instrumented).toContain('myFunc:');
  });

  test('should instrument object methods', () => {
    const code = `
      const obj = {
        myMethod() {
          return 'test';
        }
      };
    `;

    const instrumented = instrumentCode(code, { filename: 'test.js' });

    expect(instrumented).toContain('__siko_track');
    expect(instrumented).toContain('myMethod:');
  });

  test('should convert arrow function expression bodies to blocks', () => {
    const code = `
      const add = (a, b) => a + b;
    `;

    const instrumented = instrumentCode(code, { filename: 'test.js' });

    expect(instrumented).toContain('__siko_track');
    expect(instrumented).toContain('return');
  });
});
