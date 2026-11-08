import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../theme';

interface MathRendererProps {
  math: string;
  displayMode?: boolean;
  fontSize?: number;
  color?: string;
  style?: any;
}

// Simple fallback parser for instant local/offline rendering of standard expressions
function formatSimpleMath(latex: string): string {
  return latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
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
    .replace(/\\mu/g, 'μ')
    .replace(/\\int/g, '∫')
    .replace(/\\sum/g, '∑')
    .replace(/\\infty/g, '∞')
    .replace(/\\to/g, '→')
    .replace(/\\cdot/g, '·')
    .replace(/\^\{([^}]+)\}/g, '^$1')
    .replace(/\_\{([^}]+)\}/g, '_$1')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/[{}]/g, '');
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  math,
  displayMode = false,
  fontSize = 15,
  color,
  style,
}) => {
  const { colors, mode } = useTheme();
  const [webViewFailed, setWebViewFailed] = useState(false);

  const textColor = color || colors.text;
  const isDark = mode === 'dark';
  const cleanMath = (math || '').trim();

  // If cleanMath is empty, return empty view
  if (!cleanMath) {
    return null;
  }

  // Generate self-contained KaTeX HTML page
  // Uses reliable cdnjs KaTeX with immediate local fallback
  const katexHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/mhchem.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: ${displayMode ? 'center' : 'flex-start'};
      background-color: transparent;
      color: ${textColor};
      font-size: ${fontSize}px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #math-container {
      display: inline-block;
      max-width: 100%;
      word-wrap: break-word;
    }
    .katex {
      font-size: 1.05em !important;
      color: ${textColor} !important;
    }
    .katex-display {
      margin: 4px 0 !important;
    }
    .error-fallback {
      color: #DC2626;
      font-family: monospace;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div id="math-container"></div>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      var rawExpr = ${JSON.stringify(cleanMath)};
      var container = document.getElementById("math-container");
      try {
        if (window.katex) {
          katex.render(rawExpr, container, {
            displayMode: ${displayMode},
            throwOnError: false,
            errorColor: "#DC2626",
            trust: true
          });
        } else {
          container.textContent = rawExpr;
        }
      } catch (e) {
        container.innerHTML = '<span class="error-fallback">' + rawExpr + '</span>';
      }
    });
  </script>
</body>
</html>
  `;

  // On Web or if WebView is not desired/supported for micro inline snippets,
  // we can use standard formatted math or WebView depending on complexity
  const isComplex =
    cleanMath.includes('\\frac') ||
    cleanMath.includes('\\int') ||
    cleanMath.includes('\\sum') ||
    cleanMath.includes('\\sqrt') ||
    cleanMath.includes('\\matrix') ||
    cleanMath.includes('\\begin') ||
    displayMode;

  if (Platform.OS === 'web' && !isComplex) {
    return (
      <View style={[styles.inlineContainer, style]}>
        <Text style={[styles.mathText, { color: textColor, fontSize }]}>
          {formatSimpleMath(cleanMath)}
        </Text>
      </View>
    );
  }

  if (webViewFailed) {
    return (
      <View style={[styles.inlineContainer, style]}>
        <Text style={[styles.fallbackText, { color: textColor, fontSize }]}>
          {formatSimpleMath(cleanMath)}
        </Text>
      </View>
    );
  }

  const height = displayMode ? Math.max(54, fontSize * 3.2) : Math.max(34, fontSize * 1.9);

  return (
    <View style={[styles.container, { height }, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: katexHtml }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={[styles.webView, { backgroundColor: 'transparent' }]}
        onError={() => setWebViewFailed(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginVertical: 4,
  },
  inlineContainer: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  webView: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  mathText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  fallbackText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '500',
  },
});
