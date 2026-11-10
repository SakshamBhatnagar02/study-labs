/**
 * Study Labs — Secure Academic Math Evaluator
 * Strictly evaluates mathematical expressions without allowing arbitrary code execution.
 */

const ALLOWED_CHARS_REGEX = /^[0-9+\-*/%^().\sMathSafeTrigFactasincolgepqrtPIE,_]+$/;

export type MathAngleMode = 'rad' | 'deg';

export interface MathEvalResult {
  success: boolean;
  value?: number;
  formatted?: string;
  error?: string;
}

function safeFactorial(n: number): number {
  if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n) {
    throw new Error('Factorial requires a non-negative integer');
  }
  if (n > 170) return Infinity;
  let acc = 1;
  for (let i = 2; i <= n; i++) acc *= i;
  return acc;
}

/**
 * Rewrites `x!` or `(expr)!` into `_fact(x)` or `_fact(expr)` safely from left to right.
 */
function rewriteFactorials(input: string): string {
  let out = input;
  let guard = 0;
  while (out.includes('!') && guard++ < 25) {
    const bangIdx = out.indexOf('!');
    if (bangIdx <= 0) throw new Error('Invalid factorial syntax');
    const prevChar = out[bangIdx - 1];

    let startIdx = bangIdx - 1;
    if (prevChar === ')') {
      let depth = 0;
      for (let i = bangIdx - 1; i >= 0; i--) {
        if (out[i] === ')') depth++;
        else if (out[i] === '(') depth--;
        if (depth === 0) {
          startIdx = i;
          // Include leading function name if any (e.g. Math.sin(...))
          while (startIdx > 0 && /[A-Za-z0-9._]/.test(out[startIdx - 1])) {
            startIdx--;
          }
          break;
        }
      }
    } else if (/[0-9.]/.test(prevChar)) {
      while (startIdx > 0 && /[0-9.]/.test(out[startIdx - 1])) {
        startIdx--;
      }
    } else {
      throw new Error('Invalid operand before !');
    }

    const operand = out.slice(startIdx, bangIdx);
    out = `${out.slice(0, startIdx)}_fact(${operand})${out.slice(bangIdx + 1)}`;
  }
  return out;
}

export function evaluateMathExpression(
  rawExpr: string,
  angleMode: MathAngleMode = 'rad'
): MathEvalResult {
  if (!rawExpr || !rawExpr.trim()) {
    return { success: false, error: 'Empty expression' };
  }

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
    if (rawExpr.includes(pattern)) {
      return { success: false, error: 'Invalid characters in mathematical expression' };
    }
  }

  try {
    // 1. Normalize custom symbols (single-pass for π/pi; full numbers and `)%` for percentage)
    let expr = rawExpr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π|\bpi\b/gi, 'Math.PI')
      .replace(/(^|[^A-Za-z0-9_.])e\b/g, '$1Math.E')
      .replace(/(\d+(?:\.\d+)?)\s*%/g, '($1*0.01)')
      .replace(/\)\s*%/g, ')*0.01')
      .replace(/\^/g, '**')
      .replace(/\basin\(/g, '_Trig.asin(')
      .replace(/\bacos\(/g, '_Trig.acos(')
      .replace(/\batan\(/g, '_Trig.atan(')
      .replace(/\bsin\(/g, '_Trig.sin(')
      .replace(/\bcos\(/g, '_Trig.cos(')
      .replace(/\btan\(/g, '_Trig.tan(')
      .replace(/\blog\(/g, 'Math.log10(')
      .replace(/\bln\(/g, 'Math.log(')
      .replace(/√\(/g, 'Math.sqrt(')
      .replace(/\bsqrt\(/g, 'Math.sqrt(');

    if (expr.includes('!')) {
      expr = rewriteFactorials(expr);
    }

    // Double-check against injection after rewrite
    for (const pattern of forbiddenPatterns) {
      if (expr.includes(pattern)) {
        return { success: false, error: 'Invalid characters in mathematical expression' };
      }
    }

    if (!ALLOWED_CHARS_REGEX.test(expr)) {
      return { success: false, error: 'Disallowed characters in expression' };
    }

    const toRad = (v: number) => (angleMode === 'deg' ? (v * Math.PI) / 180 : v);
    const fromRad = (v: number) => (angleMode === 'deg' ? (v * 180) / Math.PI : v);
    const Trig = {
      sin: (x: number) => {
        const res = Math.sin(toRad(x));
        return Math.abs(res) < 1e-12 ? 0 : res;
      },
      cos: (x: number) => {
        const res = Math.cos(toRad(x));
        return Math.abs(res) < 1e-12 ? 0 : res;
      },
      tan: (x: number) => Math.tan(toRad(x)),
      asin: (x: number) => fromRad(Math.asin(x)),
      acos: (x: number) => fromRad(Math.acos(x)),
      atan: (x: number) => fromRad(Math.atan(x)),
    };

    // eslint-disable-next-line no-new-func
    const evaluator = new Function(
      'Math',
      '_Trig',
      '_fact',
      `"use strict"; return (${expr});`
    );
    const result = evaluator(Math, Trig, safeFactorial);

    if (typeof result !== 'number' || isNaN(result)) {
      return { success: false, error: 'Expression did not resolve to a valid real number' };
    }

    if (!isFinite(result)) {
      return { success: true, value: result, formatted: 'Infinity' };
    }

    // Format cleanly up to 8 significant decimal digits without trailing zeroes
    const rounded = Math.abs(result) < 1e-12 ? 0 : parseFloat(result.toFixed(8));
    const formatted = rounded.toString();
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
