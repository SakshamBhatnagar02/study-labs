/**
 * Pure TypeScript LaTeX & Markdown HTML formatting helpers for Study Labs.
 * Shared by MathRenderer / RichMathText and Node unit tests.
 */

export function normalizeMathDelimiters(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner) => `$$${inner}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner) => `$${inner}$`);
}

export function hasRichMathOrMarkdown(raw: string): boolean {
  if (!raw) return false;
  const text = normalizeMathDelimiters(raw);
  if (/(^|[^\\])\$[\s\S]+?\$/.test(text)) return true;
  if (
    /\\(frac|int|sum|sqrt|vec|hat|text|mathbf|sin|cos|tan|theta|pi|alpha|beta|gamma|mu|lambda|Phi|Delta|times|cdot|implies|approx|overset|ddot|longleftrightarrow)/.test(
      text
    )
  ) {
    return true;
  }
  if (/^\s*\|.+\|\s*$/m.test(text) && /^\s*\|[\s:-]+\|/m.test(text)) return true;
  if (/^#{1,4}\s+/m.test(text) || /\*\*[^*]+\*\*/.test(text)) return true;
  return false;
}

export function formatSimpleMath(latex: string): string {
  return (latex || '')
    .replace(/^\$\$|\$\$$/g, '')
    .replace(/^\$|\$$/g, '')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1 / $2)')
    .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
    .replace(/\\vec\{([^{}]+)\}/g, '$1⃗')
    .replace(/\\hat\{([^{}]+)\}/g, '$1̂')
    .replace(/\\overset\{([^}]+)\}\{([^}]+)\}/g, '$2^$1')
    .replace(/\\ddot\{([^{}]+)\}/g, '$1̈')
    .replace(/\\implies/g, '⇒')
    .replace(/\\longleftrightarrow/g, '⟷')
    .replace(/\\leftrightarrow/g, '↔')
    .replace(/\\approx/g, '≈')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\pi/g, 'π')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\Phi/g, 'Φ')
    .replace(/\\nu/g, 'ν')
    .replace(/\\mu/g, 'μ')
    .replace(/\\gg/g, '≫')
    .replace(/\\ll/g, '≪')
    .replace(/\\int/g, '∫')
    .replace(/\\sum/g, '∑')
    .replace(/\\infty/g, '∞')
    .replace(/\\to/g, '→')
    .replace(/\\cdot/g, '·')
    .replace(/\\,/g, ' ')
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\\mathbf\{([^{}]*)\}/g, '$1')
    .replace(/\\mathrm\{([^{}]*)\}/g, '$1')
    .replace(/\\(sin|cos|tan|log|ln|arcsin|arctan)/g, '$1')
    .replace(/\^\{([^{}]+)\}/g, '^($1)')
    .replace(/_\{([^{}]+)\}/g, '_$1')
    .replace(/[{}]/g, '')
    .trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatInlineMarkdownHtml(escaped: string, accentColor: string): string {
  return escaped
    .replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/\\([\\*_`$])/g, '$1')
    .replace(
      /<code class="inline-code">/g,
      `<code class="inline-code" style="color:${accentColor}">`
    );
}

function splitMarkdownTableRow(rowLine: string): string[] {
  const trimmed = rowLine.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((c) => c.trim());
}

export function markdownAndLatexToBodyHtml(raw: string, accentColor: string): string {
  const normalized = normalizeMathDelimiters(raw || '').trim();
  if (!normalized) return '';

  const protectedTokens: string[] = [];
  const stashToken = (html: string) => {
    const id = protectedTokens.length;
    protectedTokens.push(html);
    return `@@MATHTOKEN_${id}@@`;
  };

  let working = '';
  let i = 0;

  while (i < normalized.length) {
    if (normalized[i] === '\\' && normalized[i + 1] === '$') {
      working += '$';
      i += 2;
      continue;
    }

    if (normalized.startsWith('```', i)) {
      const endFence = normalized.indexOf('```', i + 3);
      if (endFence !== -1) {
        const inner = normalized.slice(i + 3, endFence).replace(/^[a-zA-Z0-9_-]*\n/, '');
        working += stashToken(`<pre class="code-block"><code>${escapeHtml(inner)}</code></pre>`);
        i = endFence + 3;
        continue;
      }
    }

    if (normalized.startsWith('$$', i)) {
      const endDisplay = normalized.indexOf('$$', i + 2);
      if (endDisplay !== -1) {
        const expr = normalized.slice(i + 2, endDisplay).trim();
        working +=
          '\n' +
          stashToken(
            `<div class="math-display" data-tex="${escapeHtml(expr)}">$$${escapeHtml(expr)}$$</div>`
          ) +
          '\n';
        i = endDisplay + 2;
        continue;
      }
    }

    if (normalized[i] === '$') {
      let endInline = -1;
      let j = i + 1;
      while (j < normalized.length) {
        if (normalized[j] === '\n') break;
        if (normalized[j] === '\\' && normalized[j + 1] === '$') {
          j += 2;
          continue;
        }
        if (normalized[j] === '$') {
          endInline = j;
          break;
        }
        j++;
      }

      if (endInline !== -1 && endInline > i + 1) {
        const expr = normalized.slice(i + 1, endInline).trim();
        working += stashToken(
          `<span class="math-inline" data-tex="${escapeHtml(expr)}">$${escapeHtml(expr)}$</span>`
        );
        i = endInline + 1;
        continue;
      }
    }

    working += normalized[i];
    i++;
  }

  const lines = working.split('\n');
  const htmlBlocks: string[] = [];
  let lineIdx = 0;

  while (lineIdx < lines.length) {
    const line = lines[lineIdx];
    const trimmed = line.trim();

    if (!trimmed) {
      lineIdx++;
      continue;
    }

    const tokenOnly = trimmed.match(/^@@MATHTOKEN_(\d+)@@$/);
    if (tokenOnly) {
      const tok = protectedTokens[Number(tokenOnly[1])] || '';
      if (tok.startsWith('<div ') || tok.startsWith('<pre ')) {
        htmlBlocks.push(tok);
        lineIdx++;
        continue;
      }
    }

    if (
      trimmed.startsWith('|') &&
      lineIdx + 1 < lines.length &&
      /^\s*\|[\s:|-]+\|\s*$/.test(lines[lineIdx + 1])
    ) {
      const headers = splitMarkdownTableRow(trimmed).map((h) =>
        formatInlineMarkdownHtml(escapeHtml(h), accentColor)
      );
      lineIdx += 2;
      const bodyRows: string[][] = [];
      while (lineIdx < lines.length && lines[lineIdx].trim().startsWith('|')) {
        bodyRows.push(
          splitMarkdownTableRow(lines[lineIdx].trim()).map((c) =>
            formatInlineMarkdownHtml(escapeHtml(c), accentColor)
          )
        );
        lineIdx++;
      }
      const thHtml = headers.map((h) => `<th>${h}</th>`).join('');
      const trHtml = bodyRows
        .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
        .join('');
      htmlBlocks.push(
        `<div class="table-wrap"><table><thead><tr>${thHtml}</tr></thead><tbody>${trHtml}</tbody></table></div>`
      );
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = Math.min(4, Math.max(2, headingMatch[1].length));
      const contentHtml = formatInlineMarkdownHtml(escapeHtml(headingMatch[2]), accentColor);
      htmlBlocks.push(`<h${level} class="md-h${level}">${contentHtml}</h${level}>`);
      lineIdx++;
      continue;
    }

    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (lineIdx < lines.length && /^[-*•]\s+/.test(lines[lineIdx].trim())) {
        const itemRaw = lines[lineIdx].trim().replace(/^[-*•]\s+/, '');
        items.push(`<li>${formatInlineMarkdownHtml(escapeHtml(itemRaw), accentColor)}</li>`);
        lineIdx++;
      }
      htmlBlocks.push(`<ul class="md-list">${items.join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (lineIdx < lines.length && /^\d+\.\s+/.test(lines[lineIdx].trim())) {
        const itemRaw = lines[lineIdx].trim().replace(/^\d+\.\s+/, '');
        items.push(`<li>${formatInlineMarkdownHtml(escapeHtml(itemRaw), accentColor)}</li>`);
        lineIdx++;
      }
      htmlBlocks.push(`<ol class="md-list">${items.join('')}</ol>`);
      continue;
    }

    const paraLines: string[] = [formatInlineMarkdownHtml(escapeHtml(trimmed), accentColor)];
    lineIdx++;
    while (lineIdx < lines.length) {
      const nextTrim = lines[lineIdx].trim();
      if (
        !nextTrim ||
        /^#{1,4}\s+/.test(nextTrim) ||
        /^[-*•]\s+/.test(nextTrim) ||
        /^\d+\.\s+/.test(nextTrim) ||
        nextTrim.startsWith('|') ||
        /^@@MATHTOKEN_(\d+)@@$/.test(nextTrim)
      ) {
        break;
      }
      paraLines.push(formatInlineMarkdownHtml(escapeHtml(nextTrim), accentColor));
      lineIdx++;
    }
    htmlBlocks.push(`<p class="md-p">${paraLines.join('<br/>')}</p>`);
  }

  let assembled = htmlBlocks.join('');
  assembled = assembled.replace(
    /@@MATHTOKEN_(\d+)@@/g,
    (_m, idxStr) => protectedTokens[Number(idxStr)] || ''
  );
  return assembled;
}

export function buildKatexDocumentHtml(params: {
  bodyHtml: string;
  textColor: string;
  accentColor: string;
  mutedColor: string;
  surfaceBg: string;
  borderColor: string;
  fontSize: number;
  lineHeight: number;
  centerAlign?: boolean;
  compact?: boolean;
}): string {
  const {
    bodyHtml,
    textColor,
    accentColor,
    mutedColor,
    surfaceBg,
    borderColor,
    fontSize,
    lineHeight,
    centerAlign = false,
    compact = false,
  } = params;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" crossorigin="anonymous" />
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" crossorigin="anonymous"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/mhchem.min.js" crossorigin="anonymous"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" crossorigin="anonymous"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: transparent !important;
      color: ${textColor};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: ${fontSize}px;
      line-height: ${lineHeight}px;
      overflow-x: hidden;
      -webkit-text-size-adjust: 100%;
    }
    #root {
      display: flow-root;
      width: 100%;
      padding: ${compact ? '2px 0 4px 0' : '4px 0 10px 0'};
      text-align: ${centerAlign ? 'center' : 'left'};
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .md-p {
      margin: ${compact ? '0' : '0 0 8px 0'};
    }
    .md-p:last-child {
      margin-bottom: 0;
    }
    .md-h2, .md-h3, .md-h4 {
      margin: 4px 0 8px 0;
      color: ${accentColor};
      font-weight: 800;
      line-height: 1.3;
    }
    .md-h2 { font-size: ${Math.round(fontSize * 1.2)}px; }
    .md-h3 { font-size: ${Math.round(fontSize * 1.12)}px; }
    .md-h4 { font-size: ${fontSize}px; }
    .md-list {
      margin: 4px 0 8px 0;
      padding-left: 18px;
    }
    .md-list li {
      margin-bottom: 4px;
    }
    .inline-code {
      font-family: Menlo, Consolas, monospace;
      font-size: 0.9em;
      background: ${surfaceBg};
      padding: 1px 5px;
      border-radius: 4px;
    }
    .code-block {
      margin: 8px 0;
      padding: 10px;
      border-radius: 8px;
      background: ${surfaceBg};
      border: 1px solid ${borderColor};
      overflow-x: auto;
      font-family: Menlo, Consolas, monospace;
      font-size: 0.88em;
    }
    .table-wrap {
      width: 100%;
      overflow-x: auto;
      margin: 8px 0;
      border-radius: 8px;
      border: 1px solid ${borderColor};
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: ${Math.max(11, fontSize - 2)}px;
      line-height: 1.4;
    }
    th, td {
      padding: 6px 8px;
      text-align: left;
      border-bottom: 1px solid ${borderColor};
    }
    th {
      background: ${surfaceBg};
      color: ${accentColor};
      font-weight: 700;
    }
    .math-display {
      width: 100%;
      overflow-x: auto;
      margin: ${compact ? '4px 0' : '8px 0'};
      padding: ${compact ? '4px 6px' : '6px 8px'};
      border-radius: 8px;
      background: ${compact ? 'transparent' : surfaceBg};
      text-align: center;
    }
    .math-display:last-child {
      margin-bottom: 0;
    }
    .katex {
      font-size: 1.06em !important;
      color: ${textColor} !important;
    }
    .katex-display {
      margin: 2px 0 !important;
      overflow-x: auto;
      overflow-y: hidden;
    }
    .of-math {
      font-family: "Times New Roman", Georgia, serif;
      font-style: normal;
      color: ${textColor};
    }
    .of-frac {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      vertical-align: middle;
      margin: 0 3px;
      font-size: 0.9em;
      line-height: 1.15;
    }
    .of-num {
      border-bottom: 1.2px solid currentColor;
      padding: 0 3px 1px 3px;
    }
    .of-den {
      padding: 1px 3px 0 3px;
    }
    .of-sqrt-body {
      border-top: 1.2px solid currentColor;
      padding: 0 2px;
      margin-left: 1px;
    }
    .of-sup { font-size: 0.72em; vertical-align: super; line-height: 0; }
    .of-sub { font-size: 0.72em; vertical-align: sub; line-height: 0; }
    .of-muted { color: ${mutedColor}; }
  </style>
</head>
<body>
  <div id="root">${bodyHtml}</div>
  <script>
    (function() {
      var lastSentHeight = 0;

      function readBraced(str, startIdx) {
        if (str[startIdx] !== '{') {
          return { val: str[startIdx] || '', next: startIdx + 1 };
        }
        var depth = 0;
        var out = '';
        for (var k = startIdx; k < str.length; k++) {
          var ch = str[k];
          if (ch === '{') {
            if (depth > 0) out += ch;
            depth++;
          } else if (ch === '}') {
            depth--;
            if (depth === 0) return { val: out, next: k + 1 };
            out += ch;
          } else {
            out += ch;
          }
        }
        return { val: out, next: str.length };
      }

      var GREEK_OPS = {
        'theta': 'θ', 'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'lambda': 'λ',
        'mu': 'μ', 'pi': 'π', 'sigma': 'σ', 'omega': 'ω', 'phi': 'φ', 'Phi': 'Φ',
        'Delta': 'Δ', 'nu': 'ν', 'int': '∫', 'sum': '∑', 'prod': '∏', 'infty': '∞',
        'times': '×', 'div': '÷', 'pm': '±', 'cdot': '·', 'implies': '⇒',
        'longleftrightarrow': '⟷', 'leftrightarrow': '↔', 'to': '→', 'approx': '≈',
        'le': '≤', 'ge': '≥', 'neq': '≠', 'll': '≪', 'gg': '≫', 'circ': '°',
        'sin': 'sin', 'cos': 'cos', 'tan': 'tan', 'log': 'log', 'ln': 'ln',
        'arcsin': 'arcsin', 'arctan': 'arctan', 'left': '', 'right': ''
      };

      function texToOfflineHtml(tex) {
        var s = (tex || '').trim();
        var html = '';
        var idx = 0;
        while (idx < s.length) {
          var ch = s[idx];
          if (ch === '\\\\') {
            if (s[idx + 1] === ',' || s[idx + 1] === ';') { html += ' '; idx += 2; continue; }
            if (s[idx + 1] === '\\\\') { html += '<br/>'; idx += 2; continue; }
            var cmdMatch = s.slice(idx + 1).match(/^[a-zA-Z]+/);
            if (cmdMatch) {
              var cmd = cmdMatch[0];
              var afterCmd = idx + 1 + cmd.length;
              while (s[afterCmd] === ' ') afterCmd++;
              if (cmd === 'frac' || cmd === 'dfrac') {
                var a1 = readBraced(s, afterCmd);
                while (s[a1.next] === ' ') a1.next++;
                var a2 = readBraced(s, a1.next);
                html += '<span class="of-frac"><span class="of-num">' + texToOfflineHtml(a1.val) + '</span><span class="of-den">' + texToOfflineHtml(a2.val) + '</span></span>';
                idx = a2.next;
                continue;
              }
              if (cmd === 'sqrt') {
                var sq = readBraced(s, afterCmd);
                html += '√<span class="of-sqrt-body">' + texToOfflineHtml(sq.val) + '</span>';
                idx = sq.next;
                continue;
              }
              if (cmd === 'text' || cmd === 'mathrm' || cmd === 'mathbf') {
                var tx = readBraced(s, afterCmd);
                var safeTxt = tx.val.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                html += cmd === 'mathbf' ? '<b>' + safeTxt + '</b>' : '<span>' + safeTxt + '</span>';
                idx = tx.next;
                continue;
              }
              if (cmd === 'vec' || cmd === 'hat' || cmd === 'bar' || cmd === 'ddot') {
                var innerArg = readBraced(s, afterCmd);
                var mark = cmd === 'vec' ? '⃗' : cmd === 'hat' ? '̂' : cmd === 'ddot' ? '̈' : '̄';
                html += '<span>' + texToOfflineHtml(innerArg.val) + mark + '</span>';
                idx = innerArg.next;
                continue;
              }
              if (cmd === 'overset') {
                var topA = readBraced(s, afterCmd);
                while (s[topA.next] === ' ') topA.next++;
                var botA = readBraced(s, topA.next);
                html += '<span>' + texToOfflineHtml(botA.val) + '<span class="of-sup">' + texToOfflineHtml(topA.val) + '</span></span>';
                idx = botA.next;
                continue;
              }
              if (Object.prototype.hasOwnProperty.call(GREEK_OPS, cmd)) {
                html += GREEK_OPS[cmd];
                idx = idx + 1 + cmd.length;
                continue;
              }
              html += cmd;
              idx = idx + 1 + cmd.length;
              continue;
            }
            html += s[idx + 1] || '';
            idx += 2;
            continue;
          }
          if (ch === '^') {
            var supA = readBraced(s, idx + 1);
            html += '<span class="of-sup">' + texToOfflineHtml(supA.val) + '</span>';
            idx = supA.next;
            continue;
          }
          if (ch === '_') {
            var subA = readBraced(s, idx + 1);
            html += '<span class="of-sub">' + texToOfflineHtml(subA.val) + '</span>';
            idx = subA.next;
            continue;
          }
          if (ch === '{' || ch === '}') {
            idx++;
            continue;
          }
          if (ch === '<') html += '&lt;';
          else if (ch === '>') html += '&gt;';
          else html += ch;
          idx++;
        }
        return html;
      }

      function renderOfflineFallback(root) {
        var nodes = root.querySelectorAll('.math-inline, .math-display');
        for (var n = 0; n < nodes.length; n++) {
          var el = nodes[n];
          var tex = el.getAttribute('data-tex') || el.textContent || '';
          el.innerHTML = '<span class="of-math">' + texToOfflineHtml(tex) + '</span>';
        }
      }

      function reportHeight() {
        var root = document.getElementById('root');
        if (!root || !window.ReactNativeWebView) return;
        var rectH = root.getBoundingClientRect ? root.getBoundingClientRect().height : 0;
        var scrollH = root.scrollHeight || 0;
        var bodyH = document.body ? document.body.scrollHeight : 0;
        var h = Math.ceil(Math.max(rectH || 0, scrollH, bodyH));
        if (h > 0 && Math.abs(h - lastSentHeight) >= 1) {
          lastSentHeight = h;
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'resize', height: h }));
        }
      }

      function renderAllMath() {
        var root = document.getElementById('root');
        if (!root) return;
        try {
          if (typeof window.renderMathInElement === 'function') {
            window.renderMathInElement(root, {
              delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '\\\\[', right: '\\\\]', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\\\(', right: '\\\\)', display: false }
              ],
              throwOnError: false,
              strict: false,
              trust: false
            });
          } else {
            renderOfflineFallback(root);
          }
        } catch (err) {
          renderOfflineFallback(root);
        }
        reportHeight();
        setTimeout(reportHeight, 50);
        setTimeout(reportHeight, 180);
        setTimeout(reportHeight, 450);
        setTimeout(reportHeight, 900);
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderAllMath);
      } else {
        renderAllMath();
      }
      window.addEventListener('load', renderAllMath);

      if (typeof ResizeObserver !== 'undefined') {
        var ro = new ResizeObserver(function() { reportHeight(); });
        ro.observe(document.getElementById('root'));
      }
      if (typeof MutationObserver !== 'undefined') {
        var mo = new MutationObserver(function() { reportHeight(); });
        mo.observe(document.getElementById('root'), { childList: true, subtree: true });
      }
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(reportHeight);
      }
    })();
  </script>
</body>
</html>`;
}

export function estimateMathHeight(
  text: string,
  fontSize: number,
  lineHeight: number,
  compact?: boolean
): number {
  const normalized = normalizeMathDelimiters(text || '');
  const lines = normalized.split('\n');
  const approxLines = lines.reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed) return acc + 0.45;
    const wrapped = Math.max(1, Math.ceil(line.length / 32));
    const displayExtra =
      trimmed.includes('$$') || trimmed.includes('\\frac') || trimmed.includes('\\int')
        ? 1.6
        : /^#{1,4}\s+/.test(trimmed) || /^[-*•\d.]/.test(trimmed)
        ? 0.35
        : 0;
    return acc + wrapped + displayExtra;
  }, 0);
  const minH = compact ? Math.max(26, lineHeight + 4) : Math.max(36, lineHeight + 12);
  return Math.max(minH, Math.ceil(approxLines * lineHeight + (compact ? 6 : 16)));
}

