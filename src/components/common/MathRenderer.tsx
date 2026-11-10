import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Move, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react-native';
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
  allowPanModal?: boolean;
  panTitle?: string;
}

export interface RichMathTextProps {
  content: string;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  accentColor?: string;
  style?: any;
  compact?: boolean;
  /** Disable direct touch events on embedded math views so parent pressable cards stay clickable */
  nonInteractive?: boolean;
  /** Show a compact Move / Pan button to open a 2D zoomable & scrollable inspector modal */
  allowPanModal?: boolean;
  panTitle?: string;
}

const ZOOM_LEVELS = [0.85, 1.0, 1.25, 1.5, 1.85];

export const MathPanModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  content: string;
  title?: string;
  accentColor?: string;
}> = ({ visible, onClose, content, title = 'Interactive Math & Solution Canvas', accentColor }) => {
  const { colors, mode } = useTheme();
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const [zoomIdx, setZoomIdx] = useState(1);
  const zoomScale = ZOOM_LEVELS[zoomIdx] || 1.0;

  const baseFont = Math.round(15 * zoomScale);
  const lineH = Math.round(baseFont * 1.5);
  const viewportWidth = Math.max(260, winWidth - 52);
  const canvasWidth =
    zoomScale > 1
      ? Math.round(viewportWidth * zoomScale)
      : Math.min(760, Math.max(viewportWidth, 340));
  const resolvedAccent = accentColor || colors.primary;
  const surfaceBg = mode === 'dark' ? 'rgba(30, 44, 67, 0.92)' : 'rgba(241, 245, 249, 0.96)';

  const clean = (content || '').trim();
  const needsRich = useMemo(() => hasRichMathOrMarkdown(clean), [clean]);

  const panHtml = useMemo(() => {
    if (!clean || !needsRich) return '';
    const bodyHtml = markdownAndLatexToBodyHtml(clean, resolvedAccent);
    return buildKatexDocumentHtml({
      bodyHtml,
      textColor: colors.text,
      accentColor: resolvedAccent,
      mutedColor: colors.textSecondary,
      surfaceBg,
      borderColor: colors.border,
      fontSize: baseFont,
      lineHeight: lineH,
      panCanvas: true,
    });
  }, [
    clean,
    needsRich,
    resolvedAccent,
    colors.text,
    colors.textSecondary,
    surfaceBg,
    colors.border,
    baseFont,
    lineH,
  ]);

  const initialHeight = useMemo(
    () => Math.max(Math.round(winHeight * 0.56), estimateMathHeight(clean, baseFont, lineH) + 40),
    [clean, baseFont, lineH, winHeight]
  );

  const [measuredHeight, setMeasuredHeight] = useState(initialHeight);
  useEffect(() => {
    setMeasuredHeight(initialHeight);
  }, [initialHeight, panHtml]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.panOverlay}>
        <View
          style={[
            styles.panSheet,
            { backgroundColor: colors.card, borderColor: colors.border, maxHeight: Math.round(winHeight * 0.88) },
          ]}
        >
          <View style={[styles.panHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.panTitleGroup}>
              <Move size={16} color={colors.primary} />
              <Text style={[styles.panHeaderTitle, { color: colors.text }]} numberOfLines={1}>
                {title}
              </Text>
            </View>
            <View style={styles.panControls}>
              <Pressable
                focusable={false}
                onPress={() => setZoomIdx((i) => Math.max(0, i - 1))}
                style={[styles.zoomBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <ZoomOut size={14} color={colors.text} />
              </Pressable>
              <Text style={[styles.zoomLabel, { color: colors.primary }]}>
                {Math.round(zoomScale * 100)}%
              </Text>
              <Pressable
                focusable={false}
                onPress={() => setZoomIdx((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))}
                style={[styles.zoomBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <ZoomIn size={14} color={colors.text} />
              </Pressable>
              <Pressable
                focusable={false}
                onPress={() => setZoomIdx(1)}
                style={[styles.zoomBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <RotateCcw size={13} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                focusable={false}
                accessibilityRole="button"
                accessibilityLabel="Close math pan view"
                onPress={onClose}
                style={[styles.zoomBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <X size={15} color={colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={[styles.panTipBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.panTipText, { color: colors.textSecondary }]}>
              Swipe horizontally or vertically to inspect wide tables, equations & steps without clipping.
            </Text>
          </View>

          <ScrollView style={{ flex: 1 }} nestedScrollEnabled showsVerticalScrollIndicator>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator
              contentContainerStyle={{ minWidth: canvasWidth, padding: 12 }}
            >
              {!needsRich ? (
                <Text
                  selectable
                  style={[
                    styles.plainText,
                    { color: colors.text, fontSize: baseFont, lineHeight: lineH, minWidth: canvasWidth - 24 },
                  ]}
                >
                  {formatSimpleMath(normalizeMathDelimiters(clean))}
                </Text>
              ) : Platform.OS === 'web' ? (
                <WebRichMathFrame
                  html={panHtml}
                  initialHeight={measuredHeight}
                  minWidth={canvasWidth - 24}
                  expandWidthToContent
                  nonInteractive={false}
                />
              ) : (
                <View style={{ width: canvasWidth - 24, height: measuredHeight }}>
                  <WebView
                    originWhitelist={['*']}
                    source={{ html: panHtml }}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    showsHorizontalScrollIndicator={true}
                    showsVerticalScrollIndicator={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    style={styles.webView}
                    onMessage={(ev) => {
                      try {
                        const payload = JSON.parse(ev.nativeEvent.data);
                        if (payload?.type === 'resize' && typeof payload.height === 'number') {
                          setMeasuredHeight(Math.max(220, Math.ceil(payload.height) + 18));
                        }
                      } catch {
                        // Ignore
                      }
                    }}
                  />
                </View>
              )}
            </ScrollView>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export const RichMathText: React.FC<RichMathTextProps> = ({
  content,
  fontSize = 15,
  lineHeight,
  color,
  accentColor,
  style,
  compact = false,
  nonInteractive = true,
  allowPanModal = false,
  panTitle,
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
  const [panOpen, setPanOpen] = useState(false);

  useEffect(() => {
    setMeasuredHeight(initialHeight);
    setWebViewFailed(false);
  }, [clean, initialHeight]);

  const needsRichRenderer = useMemo(() => hasRichMathOrMarkdown(clean), [clean]);
  const effectiveNonInteractive = allowPanModal ? false : nonInteractive;

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

  const renderPanToolbar = () =>
    allowPanModal ? (
      <View style={styles.panTriggerRow}>
        <Pressable
          focusable={false}
          onPress={() => setPanOpen(true)}
          style={({ pressed }) => [
            styles.panTriggerBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.72 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Move and zoom math view"
        >
          <Move size={11} color={colors.primary} />
          <Text style={[styles.panTriggerText, { color: colors.primary }]}>Move / Zoom</Text>
        </Pressable>
      </View>
    ) : null;

  const renderCore = () => {
    if (!needsRichRenderer || webViewFailed) {
      return (
        <Text
          selectable={allowPanModal}
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
          nonInteractive={effectiveNonInteractive}
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
        pointerEvents={effectiveNonInteractive ? 'none' : 'auto'}
        style={[styles.richContainer, { height: measuredHeight }, style]}
      >
        <WebView
          originWhitelist={['*']}
          source={{ html: fullHtml }}
          scrollEnabled={!effectiveNonInteractive}
          nestedScrollEnabled={!effectiveNonInteractive}
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

  if (!allowPanModal) {
    return renderCore();
  }

  return (
    <View style={styles.richWithPanWrap}>
      {renderPanToolbar()}
      {renderCore()}
      <MathPanModal
        visible={panOpen}
        onClose={() => setPanOpen(false)}
        content={clean}
        title={panTitle || 'Moveable Math & Solution Canvas'}
        accentColor={resolvedAccent}
      />
    </View>
  );
};

const WebRichMathFrame: React.FC<{
  html: string;
  initialHeight: number;
  style?: any;
  nonInteractive?: boolean;
  minWidth?: number;
  expandWidthToContent?: boolean;
}> = ({ html, initialHeight, style, nonInteractive, minWidth, expandWidthToContent = false }) => {
  const [height, setHeight] = useState(initialHeight);
  const [contentWidth, setContentWidth] = useState<number | undefined>(minWidth);
  const iframeRef = useRef<any>(null);

  useEffect(() => {
    setHeight(initialHeight);
    setContentWidth(minWidth);
  }, [html, initialHeight, minWidth]);

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
          if (expandWidthToContent && minWidth) {
            const w = Math.ceil(root.scrollWidth || 0);
            const nextW = w > minWidth ? w + 12 : minWidth;
            setContentWidth((prev) => (prev !== nextW ? nextW : prev));
          }
        }
      } catch {
        // Ignore cross-origin checks
      }
    };
    const timer = setInterval(syncIframeHeight, 250);
    return () => clearInterval(timer);
  }, [html, expandWidthToContent, minWidth]);

  return (
    <View
      pointerEvents={nonInteractive ? 'none' : 'auto'}
      style={[
        styles.richContainer,
        { height },
        contentWidth ? { width: contentWidth } : undefined,
        style,
      ]}
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
  allowPanModal = false,
  panTitle,
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
      allowPanModal={allowPanModal}
      panTitle={panTitle}
      nonInteractive={!allowPanModal}
    />
  );
};

const styles = StyleSheet.create({
  richWithPanWrap: {
    width: '100%',
  },
  panTriggerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  panTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  panTriggerText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
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
  panOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
    justifyContent: 'center',
    padding: 14,
  },
  panSheet: {
    width: '100%',
    maxWidth: 740,
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 340,
  },
  panHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    gap: 8,
  },
  panTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
    minWidth: 0,
  },
  panHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    flexShrink: 1,
  },
  panControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  zoomBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    minWidth: 36,
    textAlign: 'center',
  },
  panTipBar: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  panTipText: {
    fontSize: 11,
  },
});
