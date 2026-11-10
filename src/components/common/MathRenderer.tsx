import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useTheme } from '../../theme';
import {
  buildKatexDocumentHtml,
  estimateMathHeight,
  formatSimpleMath,
  hasRichMathOrMarkdown,
  markdownAndLatexToBodyHtml,
  normalizeMathDelimiters,
} from '../../utils/mathFormatting';

export { normalizeMathDelimiters, hasRichMathOrMarkdown, formatSimpleMath };

export interface MathRendererProps {
  math: string;
  displayMode?: boolean;
  fontSize?: number;
  color?: string;
  style?: any;
}

export interface RichMathTextProps {
  content: string;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  accentColor?: string;
  style?: any;
  compact?: boolean;
  /** Disable direct touch events on embedded math views so parent TouchableOpacity cards stay clickable */
  nonInteractive?: boolean;
}

export const RichMathText: React.FC<RichMathTextProps> = ({
  content,
  fontSize = 15,
  lineHeight,
  color,
  accentColor,
  style,
  compact = false,
  nonInteractive = true,
}) => {
  const { colors, mode } = useTheme();
  const resolvedLineHeight = lineHeight ?? Math.round(fontSize * 1.48);
  const textColor = color || colors.text;
  const resolvedAccent = accentColor || colors.primary;
  const surfaceBg = mode === 'dark' ? 'rgba(30, 44, 67, 0.85)' : 'rgba(241, 245, 249, 0.9)';
  const borderColor = colors.border;
  const clean = (content || '').trim();

  const initialHeight = useMemo(
    () => estimateMathHeight(clean, fontSize, resolvedLineHeight, compact),
    [clean, fontSize, resolvedLineHeight, compact]
  );

  const [measuredHeight, setMeasuredHeight] = useState<number>(initialHeight);
  const [webViewFailed, setWebViewFailed] = useState(false);

  useEffect(() => {
    setMeasuredHeight(initialHeight);
    setWebViewFailed(false);
  }, [clean, initialHeight]);

  const needsRichRenderer = useMemo(() => hasRichMathOrMarkdown(clean), [clean]);

  const fullHtml = useMemo(() => {
    if (!clean || !needsRichRenderer) return '';
    const bodyHtml = markdownAndLatexToBodyHtml(clean, resolvedAccent);
    return buildKatexDocumentHtml({
      bodyHtml,
      textColor,
      accentColor: resolvedAccent,
      mutedColor: colors.textSecondary,
      surfaceBg,
      borderColor,
      fontSize,
      lineHeight: resolvedLineHeight,
      compact,
    });
  }, [
    clean,
    needsRichRenderer,
    resolvedAccent,
    textColor,
    colors.textSecondary,
    surfaceBg,
    borderColor,
    fontSize,
    resolvedLineHeight,
    compact,
  ]);

  if (!clean) return null;

  if (!needsRichRenderer || webViewFailed) {
    return (
      <Text
        style={[
          styles.plainText,
          { color: textColor, fontSize, lineHeight: resolvedLineHeight },
          style,
        ]}
      >
        {formatSimpleMath(normalizeMathDelimiters(clean))}
      </Text>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <WebRichMathFrame
        html={fullHtml}
        initialHeight={initialHeight}
        style={style}
        nonInteractive={nonInteractive}
      />
    );
  }

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      if (payload?.type === 'resize' && typeof payload.height === 'number' && payload.height > 12) {
        const nextHeight = Math.ceil(payload.height) + (compact ? 4 : 8);
        setMeasuredHeight((prev) => (Math.abs(prev - nextHeight) >= 1 ? nextHeight : prev));
      }
    } catch {
      // Ignore unrelated WebView messages
    }
  };

  return (
    <View
      pointerEvents={nonInteractive ? 'none' : 'auto'}
      style={[styles.richContainer, { height: measuredHeight }, style]}
    >
      <WebView
        originWhitelist={['*']}
        source={{ html: fullHtml }}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        setSupportMultipleWindows={false}
        style={styles.webView}
        onMessage={handleMessage}
        onError={() => setWebViewFailed(true)}
      />
    </View>
  );
};

const WebRichMathFrame: React.FC<{
  html: string;
  initialHeight: number;
  style?: any;
  nonInteractive?: boolean;
}> = ({ html, initialHeight, style, nonInteractive }) => {
  const [height, setHeight] = useState(initialHeight);
  const iframeRef = useRef<any>(null);

  useEffect(() => {
    setHeight(initialHeight);
  }, [html, initialHeight]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncIframeHeight = () => {
      try {
        const doc = iframeRef.current?.contentDocument;
        const root = doc?.getElementById?.('root');
        if (root) {
          const h = Math.ceil(
            Math.max(root.getBoundingClientRect().height || 0, root.scrollHeight || 0)
          );
          if (h > 12) {
            const nextH = h + 8;
            setHeight((prev) => (Math.abs(prev - nextH) >= 1 ? nextH : prev));
          }
        }
      } catch {
        // Ignore cross-origin checks
      }
    };
    const timer = setInterval(syncIframeHeight, 250);
    return () => clearInterval(timer);
  }, [html]);

  return (
    <View
      pointerEvents={nonInteractive ? 'none' : 'auto'}
      style={[styles.richContainer, { height }, style]}
    >
      {React.createElement('iframe', {
        ref: iframeRef,
        srcDoc: html,
        sandbox: 'allow-scripts allow-same-origin',
        scrolling: 'no',
        style: {
          border: 'none',
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          overflow: 'hidden',
          pointerEvents: nonInteractive ? 'none' : 'auto',
        },
      })}
    </View>
  );
};

export const MathRenderer: React.FC<MathRendererProps> = ({
  math,
  displayMode = false,
  fontSize = 15,
  color,
  style,
}) => {
  const cleanMath = (math || '').trim();
  if (!cleanMath) return null;

  const wrapped =
    cleanMath.includes('$') || cleanMath.includes('\\(') || cleanMath.includes('\\[')
      ? cleanMath
      : displayMode
      ? `$$${cleanMath}$$`
      : `$${cleanMath}$`;

  return (
    <RichMathText
      content={wrapped}
      fontSize={fontSize}
      color={color}
      style={style}
      compact={!displayMode}
    />
  );
};

const styles = StyleSheet.create({
  richContainer: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
    opacity: 0.99,
  },
  plainText: {
    fontWeight: '500',
  },
});
