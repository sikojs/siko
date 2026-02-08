/**
 * Babel plugin for instrumenting functions with execution tracking
 */

import { PluginObj, types as t, NodePath } from '@babel/core';
import { FunctionInfo } from '../runtime/types';

interface PluginState {
  filename: string;
  functions: FunctionInfo[];
}

/**
 * Generate a unique function ID
 */
function generateFunctionId(name: string, file: string, line: number, column: number): string {
  return `${name}:${file}:${line}:${column}`;
}

/**
 * Get function name from various function types
 */
function getFunctionName(path: NodePath): string {
  const node = path.node;

  // Named function declaration: function foo() {}
  if (t.isFunctionDeclaration(node) && node.id) {
    return node.id.name;
  }

  // Class method: class Foo { bar() {} }
  if (t.isClassMethod(node) && t.isIdentifier(node.key)) {
    return node.key.name;
  }

  // Object method: { foo() {} }
  if (t.isObjectMethod(node) && t.isIdentifier(node.key)) {
    return node.key.name;
  }

  // Variable with function: const foo = function() {}
  // or arrow function: const foo = () => {}
  const parent = path.parent;
  if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
    return parent.id.name;
  }

  // Assignment: foo = function() {}
  if (t.isAssignmentExpression(parent) && t.isIdentifier(parent.left)) {
    return parent.left.name;
  }

  // Object property: { foo: function() {} }
  if (t.isObjectProperty(parent) && t.isIdentifier(parent.key)) {
    return parent.key.name;
  }

  return '<anonymous>';
}

/**
 * Determine function type
 */
function getFunctionType(path: NodePath): 'function' | 'method' | 'arrow' {
  const node = path.node;

  if (t.isArrowFunctionExpression(node)) {
    return 'arrow';
  }

  if (t.isClassMethod(node) || t.isObjectMethod(node)) {
    return 'method';
  }

  return 'function';
}

/**
 * Check if we should skip instrumenting this function
 */
function shouldSkipFunction(path: NodePath): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node: any = path.node;
  const name = getFunctionName(path);

  // Skip anonymous functions (v1 limitation)
  if (name === '<anonymous>') {
    return true;
  }

  // Skip if already instrumented
  if (t.isBlockStatement(node.body)) {
    const firstStatement = node.body.body[0];
    if (
      firstStatement &&
      t.isExpressionStatement(firstStatement) &&
      t.isCallExpression(firstStatement.expression) &&
      t.isIdentifier(firstStatement.expression.callee) &&
      firstStatement.expression.callee.name === '__siko_track'
    ) {
      return true; // Already instrumented
    }
  }

  return false;
}

/**
 * Check if file already has __siko_track import
 */
function hasTrackingImport(path: NodePath<t.Program>): boolean {
  let hasImport = false;

  for (const statement of path.node.body) {
    // Check for: const { __siko_track } = require(...)
    if (t.isVariableDeclaration(statement) && statement.declarations.length > 0) {
      const declarator = statement.declarations[0];
      if (
        t.isObjectPattern(declarator.id) &&
        declarator.id.properties.some(
          (prop) =>
            t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === '__siko_track'
        )
      ) {
        hasImport = true;
        break;
      }
    }

    // Check for: import { __siko_track } from ...
    if (
      t.isImportDeclaration(statement) &&
      statement.specifiers.some(
        (spec) =>
          t.isImportSpecifier(spec) &&
          t.isIdentifier(spec.imported) &&
          spec.imported.name === '__siko_track'
      )
    ) {
      hasImport = true;
      break;
    }
  }

  return hasImport;
}

/**
 * Inject __siko_track import/require at top of file
 */
function injectTrackingImport(path: NodePath<t.Program>): void {
  // Determine the package path - use relative path to the built siko package
  const packagePath = 'siko/dist/runtime';

  // Create require statement: const { __siko_track } = require('siko/dist/runtime');
  const requireStatement = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.objectPattern([
        t.objectProperty(t.identifier('__siko_track'), t.identifier('__siko_track'), false, true),
      ]),
      t.callExpression(t.identifier('require'), [t.stringLiteral(packagePath)])
    ),
  ]);

  // Insert at the beginning of the file
  path.node.body.unshift(requireStatement);
}

/**
 * Babel plugin to instrument functions
 */
export default function sikoInstrumentationPlugin(): PluginObj<PluginState> {
  return {
    name: 'siko-instrumentation',

    pre() {
      // Initialize state
      this.functions = [];
    },

    visitor: {
      // Inject tracking import at the top of the file
      Program: {
        enter(path) {
          // Only inject if we haven't already
          if (!hasTrackingImport(path)) {
            injectTrackingImport(path);
          }
        },
      },

      // Instrument function declarations: function foo() {}
      FunctionDeclaration(path, state) {
        if (shouldSkipFunction(path)) return;

        const node = path.node;
        const name = getFunctionName(path);
        const loc = node.loc?.start || { line: 0, column: 0 };
        const filename = state.filename || 'unknown';

        const functionId = generateFunctionId(name, filename, loc.line, loc.column);

        // Add to static inventory
        this.functions.push({
          id: functionId,
          name,
          file: filename,
          line: loc.line,
          column: loc.column,
          type: getFunctionType(path),
        });

        // Inject tracking call at the beginning
        const trackingCall = t.expressionStatement(
          t.callExpression(t.identifier('__siko_track'), [t.stringLiteral(functionId)])
        );

        // Insert at the beginning of function body
        if (t.isBlockStatement(node.body)) {
          node.body.body.unshift(trackingCall);
        }
      },

      // Instrument function expressions: const foo = function() {}
      FunctionExpression(path, state) {
        if (shouldSkipFunction(path)) return;

        const node = path.node;
        const name = getFunctionName(path);
        const loc = node.loc?.start || { line: 0, column: 0 };
        const filename = state.filename || 'unknown';

        const functionId = generateFunctionId(name, filename, loc.line, loc.column);

        this.functions.push({
          id: functionId,
          name,
          file: filename,
          line: loc.line,
          column: loc.column,
          type: getFunctionType(path),
        });

        const trackingCall = t.expressionStatement(
          t.callExpression(t.identifier('__siko_track'), [t.stringLiteral(functionId)])
        );

        if (t.isBlockStatement(node.body)) {
          node.body.body.unshift(trackingCall);
        }
      },

      // Instrument arrow functions: const foo = () => {}
      ArrowFunctionExpression(path, state) {
        if (shouldSkipFunction(path)) return;

        const node = path.node;
        const name = getFunctionName(path);
        const loc = node.loc?.start || { line: 0, column: 0 };
        const filename = state.filename || 'unknown';

        const functionId = generateFunctionId(name, filename, loc.line, loc.column);

        this.functions.push({
          id: functionId,
          name,
          file: filename,
          line: loc.line,
          column: loc.column,
          type: getFunctionType(path),
        });

        // Arrow functions might have expression body, convert to block if needed
        if (!t.isBlockStatement(node.body)) {
          const returnStatement = t.returnStatement(node.body as t.Expression);
          node.body = t.blockStatement([returnStatement]);
        }

        const trackingCall = t.expressionStatement(
          t.callExpression(t.identifier('__siko_track'), [t.stringLiteral(functionId)])
        );

        if (t.isBlockStatement(node.body)) {
          node.body.body.unshift(trackingCall);
        }
      },

      // Instrument class methods: class Foo { bar() {} }
      ClassMethod(path, state) {
        if (shouldSkipFunction(path)) return;

        const node = path.node;
        const name = getFunctionName(path);
        const loc = node.loc?.start || { line: 0, column: 0 };
        const filename = state.filename || 'unknown';

        const functionId = generateFunctionId(name, filename, loc.line, loc.column);

        this.functions.push({
          id: functionId,
          name,
          file: filename,
          line: loc.line,
          column: loc.column,
          type: getFunctionType(path),
        });

        const trackingCall = t.expressionStatement(
          t.callExpression(t.identifier('__siko_track'), [t.stringLiteral(functionId)])
        );

        if (t.isBlockStatement(node.body)) {
          node.body.body.unshift(trackingCall);
        }
      },

      // Instrument object methods: { foo() {} }
      ObjectMethod(path, state) {
        if (shouldSkipFunction(path)) return;

        const node = path.node;
        const name = getFunctionName(path);
        const loc = node.loc?.start || { line: 0, column: 0 };
        const filename = state.filename || 'unknown';

        const functionId = generateFunctionId(name, filename, loc.line, loc.column);

        this.functions.push({
          id: functionId,
          name,
          file: filename,
          line: loc.line,
          column: loc.column,
          type: getFunctionType(path),
        });

        const trackingCall = t.expressionStatement(
          t.callExpression(t.identifier('__siko_track'), [t.stringLiteral(functionId)])
        );

        if (t.isBlockStatement(node.body)) {
          node.body.body.unshift(trackingCall);
        }
      },
    },

    post() {
      // Store static inventory for this file
      if (this.functions.length > 0) {
        const fs = require('fs');

        let inventory: {
          functions: FunctionInfo[];
          timestamp?: string;
          totalFunctions?: number;
        } = { functions: [] };
        const inventoryPath = '.siko-signal.inventory.json';

        // Read existing inventory
        if (fs.existsSync(inventoryPath)) {
          try {
            inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
          } catch {
            inventory = { functions: [] };
          }
        }

        // Add our functions (avoid duplicates by function ID)
        const existingIds = new Set(inventory.functions.map((f: FunctionInfo) => f.id));
        for (const func of this.functions) {
          if (!existingIds.has(func.id)) {
            inventory.functions.push(func);
          }
        }

        // Write updated inventory
        inventory.timestamp = new Date().toISOString();
        inventory.totalFunctions = inventory.functions.length;

        fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
      }
    },
  };
}
