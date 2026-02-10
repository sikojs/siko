/**
 * Babel plugin for instrumenting functions with execution tracking
 */

import { PluginObj, types as t, NodePath } from '@babel/core';
import { FunctionInfo } from '../runtime/types';
import { ModuleType } from '../utils/module-detection';

interface PluginState {
  filename: string;
  functions: FunctionInfo[];
}

interface PluginOptions {
  moduleType?: ModuleType;
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

  // Walk up the tree to find a variable declarator
  // This handles cases like: const Wrapped = React.memo(() => {})
  // where the function is nested inside a call expression
  let currentPath = path.parentPath;
  while (currentPath) {
    const currentParent = currentPath.parent;

    // Check if we found a variable declarator
    if (t.isVariableDeclarator(currentParent) && t.isIdentifier(currentParent.id)) {
      return currentParent.id.name;
    }

    // Check if we found an assignment expression
    if (t.isAssignmentExpression(currentParent) && t.isIdentifier(currentParent.left)) {
      return currentParent.left.name;
    }

    // Stop if we reach certain node types that indicate we've gone too far
    if (
      t.isProgram(currentParent) ||
      t.isFunctionDeclaration(currentParent) ||
      t.isFunctionExpression(currentParent) ||
      t.isArrowFunctionExpression(currentParent)
    ) {
      break;
    }

    currentPath = currentPath.parentPath;
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
function injectTrackingImport(path: NodePath<t.Program>, moduleType: ModuleType): void {
  // Determine the package path - import the runtime via package subpath so
  // Node and TypeScript resolve types via package exports.
  const packagePath = 'siko/runtime';

  if (moduleType === 'esm') {
    // Create ES import: import { __siko_track } from 'siko/dist/runtime';
    const importStatement = t.importDeclaration(
      [t.importSpecifier(t.identifier('__siko_track'), t.identifier('__siko_track'))],
      t.stringLiteral(packagePath)
    );

    // Insert near the top of the file but after any existing imports or
    // prologue statements (e.g., "use strict"). This avoids placing our
    // injected import before TypeScript reference comments or other
    // important directives which can break type resolution in the
    // consumer project.
    let insertIndex = 0;
    for (let i = 0; i < path.node.body.length; i++) {
      const stmt = path.node.body[i];
      // keep moving the index while we see import declarations or
      // require-based variable declarations or expression statements
      // (like 'use strict') so we insert after them.
      if (t.isImportDeclaration(stmt)) {
        insertIndex = i + 1;
        continue;
      }

      if (t.isVariableDeclaration(stmt)) {
        // check if it's a require(...) style import; if so, skip over it
        const decl = stmt.declarations[0];
        if (
          decl &&
          t.isCallExpression(decl.init) &&
          t.isIdentifier(decl.init.callee) &&
          decl.init.callee.name === 'require'
        ) {
          insertIndex = i + 1;
          continue;
        }
      }

      if (t.isExpressionStatement(stmt) && t.isStringLiteral(stmt.expression)) {
        // likely a prologue like 'use strict'
        insertIndex = i + 1;
        continue;
      }

      break;
    }

    // Avoid inserting between a `// @ts-ignore` (or `@ts-expect-error`) and the
    // statement it applies to. If the next statement(s) have leading comments
    // with these directives, move the insertion point after them so the
    // directive still applies to the intended node.
    for (let j = insertIndex; j < path.node.body.length; j++) {
      const nextStmt = path.node.body[j] as any;
      const leading = nextStmt && nextStmt.leadingComments ? nextStmt.leadingComments : [];
      const hasIgnore = leading.some((c: any) => {
        const v = String(c.value || '').trim();
        return v.startsWith('@ts-ignore') || v.startsWith('@ts-expect-error');
      });
      if (hasIgnore) {
        insertIndex = j + 1;
        continue;
      }
      break;
    }

    path.node.body.splice(insertIndex, 0, importStatement);
  } else {
    // Create require statement: const { __siko_track } = require('siko/dist/runtime');
    const requireStatement = t.variableDeclaration('const', [
      t.variableDeclarator(
        t.objectPattern([
          t.objectProperty(t.identifier('__siko_track'), t.identifier('__siko_track'), false, true),
        ]),
        t.callExpression(t.identifier('require'), [t.stringLiteral(packagePath)])
      ),
    ]);

    // Insert near the top (after existing imports/prologues) to avoid
    // interfering with TypeScript reference comments and directives.
    let insertIndex = 0;
    for (let i = 0; i < path.node.body.length; i++) {
      const stmt = path.node.body[i];
      if (t.isImportDeclaration(stmt)) {
        insertIndex = i + 1;
        continue;
      }

      if (t.isVariableDeclaration(stmt)) {
        const decl = stmt.declarations[0];
        if (
          decl &&
          t.isCallExpression(decl.init) &&
          t.isIdentifier(decl.init.callee) &&
          decl.init.callee.name === 'require'
        ) {
          insertIndex = i + 1;
          continue;
        }
      }

      if (t.isExpressionStatement(stmt) && t.isStringLiteral(stmt.expression)) {
        insertIndex = i + 1;
        continue;
      }

      break;
    }

    // Same protection for CommonJS insertion
    for (let j = insertIndex; j < path.node.body.length; j++) {
      const nextStmt = path.node.body[j] as any;
      const leading = nextStmt && nextStmt.leadingComments ? nextStmt.leadingComments : [];
      const hasIgnore = leading.some((c: any) => {
        const v = String(c.value || '').trim();
        return v.startsWith('@ts-ignore') || v.startsWith('@ts-expect-error');
      });
      if (hasIgnore) {
        insertIndex = j + 1;
        continue;
      }
      break;
    }

    path.node.body.splice(insertIndex, 0, requireStatement);
  }
}

/**
 * Check if file should skip instrumentation based on generic TypeScript patterns.
 * This is resilient across all runtimes by detecting TypeScript language features,
 * not runtime-specific globals.
 *
 * Returns true for:
 * 1. .d.ts files (pure type declarations)
 * 2. Files with ambient declarations that need script context (no imports)
 */
function shouldSkipInstrumentation(path: NodePath<t.Program>, state: PluginState): boolean {
  // 1. Skip .d.ts files entirely - they're pure type declarations
  const filename = state.filename || '';
  if (filename.endsWith('.d.ts')) {
    return true;
  }

  // 2. Check if file already has imports/requires - if yes, it's a module, safe to instrument
  const hasImports = path.node.body.some(
    (node) => t.isImportDeclaration(node) ||
    (t.isVariableDeclaration(node) &&
     node.declarations.some(d =>
       t.isCallExpression(d.init) &&
       t.isIdentifier(d.init.callee) &&
       d.init.callee.name === 'require'
     ))
  );

  if (hasImports) {
    return false; // Already a module, safe to add our import
  }

  // 3. Check for ambient declarations that require script context
  // Pattern: top-level `declare namespace Foo` or `declare global` without existing imports
  // Adding imports to these files converts them from script to module, breaking ambient declarations
  let hasAmbientDeclaration = false;

  for (const node of path.node.body) {
    // Check for: declare namespace Foo { ... } or declare global { ... }
    if (t.isTSModuleDeclaration(node) && node.declare) {
      hasAmbientDeclaration = true;
      break;
    }
  }

  return hasAmbientDeclaration;
}

/**
 * Babel plugin to instrument functions
 */
export default function sikoInstrumentationPlugin(
  api: unknown,
  options?: PluginOptions
): PluginObj<PluginState> {
  const moduleType = options?.moduleType || 'commonjs';

  return {
    name: 'siko-instrumentation',

    pre() {
      // Initialize state
      this.functions = [];
    },

    visitor: {
      // Inject tracking import at the top of the file
      Program: {
        enter(path, state) {
          // Skip files with ambient declarations that would break if we add imports
          if (shouldSkipInstrumentation(path, state)) {
            (this as any)._skipFile = true;
            return;
          }

          // Only inject if we haven't already
          if (!hasTrackingImport(path)) {
            injectTrackingImport(path, moduleType);
          }
        },
      },

      // Instrument function declarations: function foo() {}
      FunctionDeclaration(path, state) {
        if ((this as any)._skipFile) return;
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
        if ((this as any)._skipFile) return;
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
        if ((this as any)._skipFile) return;
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
        if ((this as any)._skipFile) return;
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
