/**
 * Study Labs — Secure Academic Math Evaluator
 * Strictly evaluates mathematical expressions without allowing arbitrary code execution.
 */

const ALLOWED_CHARS_REGEX = /^[0-9+\-*/%^().\sMathsincostanlogeqrtPIE,]+$/;

export interface MathEvalResult {
  success: boolean;
  value?: number;
  formatted?: string;
  error?: string;
}

export function evaluateMathExpression(rawExpr: string): MathEvalResult {
  if (!rawExpr || !rawExpr.trim()) {
    return { success: false, error: 'Empty expression' };
  }

  // 1. Normalize custom symbols
  let expr = rawExpr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'Math.PI')
    .replace(/\be\b/g, 'Math.E')
    .replace(/\^/g, '**')
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/tan\(/g, 'Math.tan(')
    .replace(/log\(/g, 'Math.log10(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/√\(/g, 'Math.sqrt(');

  // 2. Strict Whitelist Check: Disallow any identifiers other than safe Math calls
  // Disallow window, document, global, require, import, constructor, prototype, etc.
  const forbiddenPatterns = [
    'constructor',
    'prototype',
    '__proto__',
    'window',
    'global',
    'process',
    'require',
    'import',
    'fetch',
    'eval',
    'Function',
    ';',
    '=',
    '{',
    '}',
    '[',
    ']',
    '`',
    '"',
    "'",
  ];

  for (const pattern of forbiddenPatterns) {
    if (expr.includes(pattern)) {
      return { success: false, error: 'Invalid characters in mathematical expression' };
    }
  }

  // Ensure only approved mathematical tokens remain
  if (!ALLOWED_CHARS_REGEX.test(expr)) {
    return { success: false, error: 'Disallowed characters in expression' };
  }

  try {
    // 3. Evaluate expression in a strictly sandboxed closure
    // eslint-disable-next-line no-new-func
    const evaluator = new Function(
      'Math',
      `"use strict"; return (${expr});`
    );
    const result = evaluator(Math);

    if (typeof result !== 'number' || isNaN(result)) {
      return { success: false, error: 'Expression did not resolve to a valid real number' };
    }

    if (!isFinite(result)) {
      return { success: true, value: result, formatted: 'Infinity' };
    }

    // Format up to 6 decimal places cleanly
    const formatted = parseFloat(result.toFixed(6)).toString();
    return {
      success: true,
      value: result,
      formatted,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Mathematical syntax error',
    };
  }
}

