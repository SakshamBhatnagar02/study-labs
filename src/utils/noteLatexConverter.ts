/**
 * Deterministic Plain-Text -> KaTeX LaTeX Converter for Practice Notes.
 * Converts prose + formulas/equations into valid $...$ KaTeX expressions
 * while remaining idempotent on already-delimited LaTeX ($...$ / $$...$$).
 */

const SUPERSCRIPT_CHAR_MAP: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁺': '+',
  '⁻': '-',
  '⁼': '=',
  '⁽': '(',
  '⁾': ')',
  'ⁿ': 'n',
  'ⁱ': 'i',
};

const SUBSCRIPT_CHAR_MAP: Record<string, string> = {
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9',
  '₊': '+',
  '₋': '-',
  '₌': '=',
  '₍': '(',
  '₎': ')',
};

const UNICODE_SYMBOL_MAP: Array<[RegExp, string]> = [
  [/θ/g, ' \\theta '],
  [/α/g, ' \\alpha '],
  [/β/g, ' \\beta '],
  [/γ/g, ' \\gamma '],
  [/δ/g, ' \\delta '],
  [/Δ/g, ' \\Delta '],
  [/ε/g, ' \\varepsilon '],
  [/λ/g, ' \\lambda '],
  [/μ/g, ' \\mu '],
  [/ν/g, ' \\nu '],
  [/π/g, ' \\pi '],
  [/ρ/g, ' \\rho '],
  [/σ/g, ' \\sigma '],
  [/τ/g, ' \\tau '],
  [/φ/g, ' \\phi '],
  [/Φ/g, ' \\Phi '],
  [/ψ/g, ' \\psi '],
  [/Ψ/g, ' \\Psi '],
  [/ω/g, ' \\omega '],
  [/Ω/g, ' \\Omega '],
  [/∞/g, ' \\infty '],
  [/×/g, ' \\times '],
  [/÷/g, ' \\div '],
  [/±/g, ' \\pm '],
  [/·/g, ' \\cdot '],
  [/≤/g, ' \\le '],
  [/≥/g, ' \\ge '],
  [/≠/g, ' \\neq '],
  [/≈/g, ' \\approx '],
  [/⇒/g, ' \\implies '],
  [/⟹/g, ' \\implies '],
  [/→/g, ' \\to '],
  [/↔/g, ' \\leftrightarrow '],
  [/⟷/g, ' \\longleftrightarrow '],
  [/∫/g, ' \\int '],
  [/∑/g, ' \\sum '],
  [/∏/g, ' \\prod '],
  [/°/g, '^\\circ '],
];

const GREEK_WORDS_REGEX =
  /(\\)?\b(infinity|theta|alpha|beta|gamma|delta|Delta|epsilon|lambda|mu|nu|pi|rho|sigma|tau|phi|Phi|psi|Psi|omega|Omega|infty)\b/g;

const GREEK_WORD_TO_TEX: Record<string, string> = {
  theta: '\\theta',
  alpha: '\\alpha',
  beta: '\\beta',
  gamma: '\\gamma',
  delta: '\\delta',
  Delta: '\\Delta',
  epsilon: '\\varepsilon',
  lambda: '\\lambda',
  mu: '\\mu',
  nu: '\\nu',
  pi: '\\pi',
  rho: '\\rho',
  sigma: '\\sigma',
  tau: '\\tau',
  phi: '\\phi',
  Phi: '\\Phi',
  psi: '\\psi',
  Psi: '\\Psi',
  omega: '\\omega',
  Omega: '\\Omega',
  infinity: '\\infty',
  infty: '\\infty',
};

const MATH_FUNCS_REGEX =
  /(\\)?\b(arcsin|arccos|arctan|cosec|sinh|cosh|tanh|sin|cos|tan|cot|sec|csc|log|ln|exp|lim)\b/g;

function normalizeUnicodeSuperSub(input: string): string {
  return input
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱ]+/g, (match) => {
      const mapped = Array.from(match)
        .map((c) => SUPERSCRIPT_CHAR_MAP[c] || c)
        .join('');
      return mapped.length === 1 ? `^${mapped}` : `^{${mapped}}`;
    })
    .replace(/[₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎]+/g, (match) => {
      const mapped = Array.from(match)
        .map((c) => SUBSCRIPT_CHAR_MAP[c] || c)
        .join('');
      return mapped.length === 1 ? `_${mapped}` : `_{${mapped}}`;
    });
}

function replaceBalancedCall(
  input: string,
  fnName: string,
  formatter: (inner: string) => string
): string {
  let out = input;
  const searchToken = `${fnName}(`;
  let cursor = 0;

  while (cursor < out.length) {
    const idx = out.indexOf(searchToken, cursor);
    if (idx === -1) break;
    // Ensure whole identifier match before fnName
    if (idx > 0 && /[a-zA-Z0-9_\\]/.test(out[idx - 1])) {
      cursor = idx + searchToken.length;
      continue;
    }

    const openParen = idx + fnName.length;
    let depth = 0;
    let closeParen = -1;
    for (let i = openParen; i < out.length; i++) {
      if (out[i] === '(') depth++;
      else if (out[i] === ')') {
        depth--;
        if (depth === 0) {
          closeParen = i;
          break;
        }
      }
    }

    if (closeParen === -1) {
      cursor = openParen + 1;
      continue;
    }

    const inner = out.slice(openParen + 1, closeParen);
    const replacement = formatter(inner);
    out = out.slice(0, idx) + replacement + out.slice(closeParen + 1);
    cursor = idx + replacement.length;
  }

  return out;
}

function replaceParenthesizedFractions(input: string): string {
  let out = input;
  let i = 0;

  while (i < out.length) {
    const slashIdx = out.indexOf(')/(', i);
    if (slashIdx === -1) break;

    // Walk backward from slashIdx to find matching '('
    let depth = 0;
    let numStart = -1;
    for (let k = slashIdx; k >= 0; k--) {
      if (out[k] === ')') depth++;
      else if (out[k] === '(') {
        depth--;
        if (depth === 0) {
          numStart = k;
          break;
        }
      }
    }

    // Walk forward from slashIdx + 2 to find matching ')'
    let denDepth = 0;
    let denEnd = -1;
    for (let k = slashIdx + 2; k < out.length; k++) {
      if (out[k] === '(') denDepth++;
      else if (out[k] === ')') {
        denDepth--;
        if (denDepth === 0) {
          denEnd = k;
          break;
        }
      }
    }

    if (numStart === -1 || denEnd === -1) {
      i = slashIdx + 3;
      continue;
    }

    const rawNum = out.slice(numStart + 1, slashIdx).trim();
    const rawDen = out.slice(slashIdx + 3, denEnd).trim();
    const convNum = convertInnerMathExpression(rawNum);
    const convDen = convertInnerMathExpression(rawDen);
    const fracExpr = `\\frac{${convNum}}{${convDen}}`;

    out = out.slice(0, numStart) + fracExpr + out.slice(denEnd + 1);
    i = numStart + fracExpr.length;
  }

  return out;
}

function convertInnerMathExpression(rawExpr: string): string {
  let s = normalizeUnicodeSuperSub(rawExpr.trim());

  for (const [regex, sym] of UNICODE_SYMBOL_MAP) {
    s = s.replace(regex, sym);
  }

  // Handle nested roots / parenthesized fractions first
  s = replaceBalancedCall(s, 'cbrt', (inner) => `\\sqrt[3]{${convertInnerMathExpression(inner)}}`);
  s = replaceBalancedCall(s, 'sqrt', (inner) => `\\sqrt{${convertInnerMathExpression(inner)}}`);
  s = replaceParenthesizedFractions(s);

  // Unicode root without parentheses e.g. √2 or √gL
  s = s.replace(/√\s*\(([^()]+)\)/g, (_m, inner) => `\\sqrt{${convertInnerMathExpression(inner)}}`);
  s = s.replace(/√\s*([a-zA-Z0-9]+(?:\^[a-zA-Z0-9]+)?)/g, '\\sqrt{$1}');

  // ASCII multi-char operators -> TeX
  s = s
    .replace(/<->|<=>/g, ' \\leftrightarrow ')
    .replace(/=>/g, ' \\implies ')
    .replace(/->/g, ' \\to ')
    .replace(/<=/g, ' \\le ')
    .replace(/>=/g, ' \\ge ')
    .replace(/!=/g, ' \\neq ')
    .replace(/\+\/-/g, ' \\pm ')
    .replace(/~/g, ' \\approx ')
    .replace(/\*/g, ' \\cdot ');

  // Convert standalone Greek words & math functions without double-escaping existing \commands
  s = s.replace(GREEK_WORDS_REGEX, (full, slash, word) =>
    slash ? full : GREEK_WORD_TO_TEX[word] || full
  );
  s = s.replace(MATH_FUNCS_REGEX, (full, slash, fn) => (slash ? full : `\\${fn}`));

  // Parenthesized fraction left as `(1/2)` -> \frac{1}{2}
  s = s.replace(
    /\(([a-zA-Z0-9_^\\]+)\s*\/\s*([a-zA-Z0-9_^\\]+)\)/g,
    (_m, num, den) => `\\frac{${num}}{${den}}`
  );

  // Simple math fractions like 2/3, dy/dx, L/g, v^2/r (avoiding prose words, no lookbehind)
  s = s.replace(
    /(^|[^a-zA-Z0-9\\])([a-zA-Z0-9_^\\{}]+)\s*\/\s*([a-zA-Z0-9_^\\{}]+)(?![a-zA-Z0-9])/g,
    (full, prefix, a, b) => {
      const aPlainWords = /^[a-zA-Z]{2,}$/.test(a) && !/^d[a-zA-Z]$/.test(a);
      const bPlainWords = /^[a-zA-Z]{2,}$/.test(b) && !/^d[a-zA-Z]$/.test(b);
      if (aPlainWords && bPlainWords) return full;
      return `${prefix}\\frac{${a}}{${b}}`;
    }
  );

  // Fix multi-char exponents and subscripts: x^-19 -> x^{-19}, k_max -> k_{\max}
  s = s.replace(/\^(\([^()]+\))/g, (_m, grp) => `^{${grp.slice(1, -1)}}`);
  s = s.replace(/\^(-?\d{2,}|-[a-zA-Z0-9]+|[a-zA-Z]{2,})/g, '^{$1}');
  s = s.replace(/_(max|min|in|out|net|total|avg|eq|eff|axis|dia)\b/gi, (_m, sub) => `_{\\text{${sub}}}`);
  s = s.replace(/_([a-zA-Z0-9]{2,})/g, '_{$1}');

  return s.replace(/\s+/g, ' ').trim();
}

function isChemicalToken(token: string): boolean {
  // e.g. H2O, CO2, H2SO4, N2+, O2^2-, Fe2O3, CH4, NH4+
  if (!/^(?:[A-Z][a-z]?\d*){1,}[A-Z]?[a-z]?\d*(?:\^?[0-9]*[+-])?$/.test(token)) {
    return false;
  }
  return /\d/.test(token) || /[+-]$/.test(token);
}

function formatChemicalToken(token: string): string {
  // Strip optional charge suffix e.g. 2-, +, -
  let base = token;
  let charge = '';
  const chargeMatch = token.match(/\^?(\d*[+-])$/);
  if (chargeMatch) {
    charge = chargeMatch[1];
    base = token.slice(0, token.length - chargeMatch[0].length);
  }
  const formattedBase = base.replace(/([A-Za-z]+)|(\d+)/g, (_m, elem, num) => {
    if (elem) return `\\text{${elem}}`;
    if (num) return num.length > 1 ? `_{${num}}` : `_${num}`;
    return '';
  });
  if (!charge) return formattedBase;
  return `${formattedBase}^{${charge}}`;
}

function convertPlainLine(line: string): string {
  if (!line.trim()) return line;

  // Stash balanced parenthesized fractions, roots, and explicit commands so spaces inside don't fragment
  const stashedAtoms: string[] = [];
  const stashAtom = (tex: string) => {
    const idx = stashedAtoms.length;
    stashedAtoms.push(tex);
    return `@@ATOM_${idx}@@`;
  };

  let working = normalizeUnicodeSuperSub(line);

  for (const [regex, sym] of UNICODE_SYMBOL_MAP) {
    working = working.replace(regex, sym);
  }

  working = replaceBalancedCall(working, 'cbrt', (inner) =>
    stashAtom(`\\sqrt[3]{${convertInnerMathExpression(inner)}}`)
  );
  working = replaceBalancedCall(working, 'sqrt', (inner) =>
    stashAtom(`\\sqrt{${convertInnerMathExpression(inner)}}`)
  );
  working = working.replace(/√\s*\(([^()]+)\)/g, (_m, inner) =>
    stashAtom(`\\sqrt{${convertInnerMathExpression(inner)}}`)
  );
  working = working.replace(/√\s*([a-zA-Z0-9]+(?:\^[a-zA-Z0-9]+)?)/g, (_m, inner) =>
    stashAtom(`\\sqrt{${inner}}`)
  );
  working = replaceParenthesizedFractions(working);
  // Stash any newly created \frac{...}{...}
  working = working.replace(/\\frac\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, (tex) =>
    stashAtom(tex)
  );

  // Replace ASCII operators before word-splitting
  working = working
    .replace(/<->|<=>/g, ' \\leftrightarrow ')
    .replace(/=>/g, ' \\implies ')
    .replace(/->/g, ' \\to ')
    .replace(/<=/g, ' \\le ')
    .replace(/>=/g, ' \\ge ')
    .replace(/!=/g, ' \\neq ')
    .replace(/\+\/-/g, ' \\pm ');

  // Normalize trig(arg) or fn^2(arg) into atomic math tokens without touching already-escaped \fn
  working = working.replace(
    /(\\)?\b(arcsin|arccos|arctan|sin|cos|tan|cot|sec|csc|log|ln|exp)(\^[a-zA-Z0-9{}]+)?\s*\(([^()\n]+)\)/g,
    (_m, _slash, fn, pow, arg) => {
      const inner = convertInnerMathExpression(arg);
      return stashAtom(`\\${fn}${pow || ''}(${inner})`);
    }
  );

  // Split preserving whitespace sequences
  const parts = working.split(/(\s+)/);

  type Annotated = {
    raw: string;
    isWs: boolean;
    leading: string;
    core: string;
    trailing: string;
    tex: string;
    strength: 'none' | 'weak' | 'op' | 'strong';
  };

  const annotated: Annotated[] = parts.map((part) => {
    if (/^\s+$/.test(part)) {
      return { raw: part, isWs: true, leading: '', core: '', trailing: '', tex: part, strength: 'none' };
    }

    // Separate trailing sentence punctuation that shouldn't live inside $...$
    let core = part;
    let leading = '';
    let trailing = '';

    // Only strip unmatched outer sentence punctuation (keep balanced parens)
    const leadMatch = core.match(/^["'‘“]+/);
    if (leadMatch) {
      leading = leadMatch[0];
      core = core.slice(leading.length);
    }

    const trailMatch = core.match(/[.,;:!?]+$/);
    if (trailMatch && !/^[a-zA-Z]+\.$/.test(core)) {
      trailing = trailMatch[0];
      core = core.slice(0, core.length - trailing.length);
    }

    if (!core) {
      return { raw: part, isWs: false, leading, core, trailing, tex: core, strength: 'none' };
    }

    // Check stashed atom token
    if (/^@@ATOM_\d+@@$/.test(core)) {
      return { raw: part, isWs: false, leading, core, trailing, tex: core, strength: 'strong' };
    }

    // Explicit LaTeX command already produced above
    if (/^\\(?:theta|alpha|beta|gamma|delta|Delta|varepsilon|lambda|mu|nu|pi|rho|sigma|tau|phi|Phi|psi|Psi|omega|Omega|infty|times|div|pm|cdot|le|ge|neq|approx|implies|to|leftrightarrow|longleftrightarrow|int|sum|prod|frac|sqrt|text)/.test(core)) {
      const isOp = /^\\(?:times|div|pm|cdot|le|ge|neq|approx|implies|to|leftrightarrow|longleftrightarrow)$/.test(
        core
      );
      return {
        raw: part,
        isWs: false,
        leading,
        core,
        trailing,
        tex: core,
        strength: isOp ? 'op' : 'strong',
      };
    }

    // Pure math operator token
    if (/^(?:[=+\-*/<>]|\\le|\\ge|\\neq|\\approx|\\to|\\implies)$/.test(core)) {
      const texOp = core === '*' ? '\\cdot' : core;
      return { raw: part, isWs: false, leading, core, trailing, tex: texOp, strength: 'op' };
    }

    // Hyphenated English prose like "step-by-step" or "X-axis" should stay prose
    if (/^[a-zA-Z]{2,}-[a-zA-Z]{2,}$/.test(core)) {
      return { raw: part, isWs: false, leading, core, trailing, tex: core, strength: 'none' };
    }

    // Greek word in prose (theta, alpha, pi...)
    if (Object.prototype.hasOwnProperty.call(GREEK_WORD_TO_TEX, core)) {
      return {
        raw: part,
        isWs: false,
        leading,
        core,
        trailing,
        tex: GREEK_WORD_TO_TEX[core],
        strength: 'strong',
      };
    }

    // Chemical formula like H2O, CO2, N2+, SO4^2-
    if (isChemicalToken(core)) {
      return {
        raw: part,
        isWs: false,
        leading,
        core,
        trailing,
        tex: formatChemicalToken(core),
        strength: 'strong',
      };
    }

    // Token containing explicit math chars (^, _, =, <, >, *, /, @@ATOM_)
    const hasExplicitMathChar =
      /[=^_*<>\\]/.test(core) ||
      /@@ATOM_\d+@@/.test(core) ||
      (/[/]/.test(core) &&
        !/^[a-zA-Z]{2,}\/[a-zA-Z]{2,}$/.test(core) &&
        !/^https?:/.test(core));

    if (hasExplicitMathChar) {
      const exprTex = convertInnerMathExpression(core);
      return {
        raw: part,
        isWs: false,
        leading,
        core,
        trailing,
        tex: exprTex,
        strength: 'strong',
      };
    }

    // Numeric or single-letter math candidate (absorbed if adjacent to an operator/math token)
    if (/^[+-]?\d+(?:\.\d+)?$/.test(core) || /^[a-zA-Z]$/.test(core) || /^\([^()]{1,12}\)$/.test(core)) {
      return {
        raw: part,
        isWs: false,
        leading,
        core,
        trailing,
        tex: convertInnerMathExpression(core),
        strength: 'weak',
      };
    }

    // Common trig words when inside equations
    if (/^(sin|cos|tan|cot|sec|csc|log|ln|exp)$/.test(core)) {
      return {
        raw: part,
        isWs: false,
        leading,
        core,
        trailing,
        tex: `\\${core}`,
        strength: 'weak',
      };
    }

    return { raw: part, isWs: false, leading, core, trailing, tex: core, strength: 'none' };
  });

  // Expand weak tokens ONLY when connected via an 'op' or strong math group cleanly
  const isMath = annotated.map((a) => a.strength === 'strong' || a.strength === 'op');

  // Pull weak tokens adjacent (across single space) to an 'op' into math!
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < annotated.length; i++) {
      if (annotated[i].isWs || annotated[i].strength !== 'weak' || isMath[i]) continue;

      // Look left (skipping 1 whitespace token, only if no trailing comma/period ended prior token)
      const prevNonWs = i - 2;
      const nextNonWs = i + 2;

      const linkedLeft =
        prevNonWs >= 0 &&
        !annotated[prevNonWs].trailing &&
        (annotated[prevNonWs].strength === 'op' ||
          (isMath[prevNonWs] &&
            (/^(sin|cos|tan|cot|sec|csc|log|ln|exp)$/.test(annotated[i].core) ||
              (annotated[prevNonWs].core === '\\int' || annotated[prevNonWs].core === '\\sum'))));

      const linkedRight =
        !annotated[i].trailing &&
        nextNonWs < annotated.length &&
        (annotated[nextNonWs].strength === 'op' ||
          (/^(sin|cos|tan|cot|sec|csc|log|ln|exp)$/.test(annotated[i].core) &&
            isMath[nextNonWs]));

      if (linkedLeft || linkedRight) {
        isMath[i] = true;
        changed = true;
      }
    }
  }

  // Note: If an 'op' like hyphen `-` has NO math neighbor on either side, demote it back to prose!
  for (let i = 0; i < annotated.length; i++) {
    if (annotated[i].strength === 'op' && annotated[i].core === '-') {
      const leftMath = i - 2 >= 0 && isMath[i - 2] && !annotated[i - 2].trailing;
      const rightMath = i + 2 < annotated.length && isMath[i + 2];
      if (!leftMath || !rightMath) {
        isMath[i] = false;
      }
    }
  }

  // Merge contiguous math spans (across whitespace when no trailing punctuation breaks the span)
  let result = '';
  let idx = 0;
  while (idx < annotated.length) {
    if (!isMath[idx]) {
      result += annotated[idx].raw;
      idx++;
      continue;
    }

    // Start math span
    const spanTokens: string[] = [];
    const spanLead = annotated[idx].leading;
    let spanTrail = '';

    while (idx < annotated.length) {
      const item = annotated[idx];
      if (item.isWs) {
        const nextItem = annotated[idx + 1];
        if (nextItem && isMath[idx + 1] && !spanTrail) {
          spanTokens.push(' ');
          idx++;
          continue;
        }
        break;
      }
      if (!isMath[idx]) break;
      if (item.leading && spanTokens.length > 0) {
        spanTokens.push(item.leading);
      }
      spanTokens.push(item.tex);
      if (item.trailing) {
        spanTrail = item.trailing;
        idx++;
        break;
      }
      idx++;
    }

    let combinedTex = spanTokens.join('').replace(/\s+/g, ' ').trim();
    combinedTex = combinedTex.replace(/@@ATOM_(\d+)@@/g, (_m, n) => stashedAtoms[Number(n)] || '');
    result += `${spanLead}$${combinedTex}$${spanTrail}`;
  }

  // Unstash any remaining atom tokens (if any)
  result = result.replace(/@@ATOM_(\d+)@@/g, (_m, n) => `$${stashedAtoms[Number(n)] || ''}$`);
  return result;
}

/**
 * Converts an entire user note (plain-text formulas, fractions, roots, Greek symbols,
 * chemical equations, powers) into valid KaTeX $...$ notation while keeping
 * existing $...$ / $$...$$ / \[...\] / \(...\) blocks untouched.
 */
export function convertPlainTextToLatex(raw: string): string {
  if (!raw) return '';

  // Tokenize preserving existing math delimiters and escaped dollars
  const existingMathRegex =
    /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\\\$|\$[^$\n]+?\$)/g;

  const segments = raw.split(existingMathRegex);

  return segments
    .map((seg, i) => {
      if (!seg) return '';
      // Odd capture indices come from existingMathRegex -> keep untouched!
      if (i % 2 === 1) return seg;

      return seg
        .split('\n')
        .map((line) => convertPlainLine(line))
        .join('\n');
    })
    .join('');
}
