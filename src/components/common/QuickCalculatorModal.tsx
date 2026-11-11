import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { evaluateMathExpression, MathAngleMode } from '../../utils/mathEvaluator';
import { Calculator, X } from 'lucide-react-native';

interface QuickCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenFullTools?: () => void;
}

export const QuickCalculatorModal: React.FC<QuickCalculatorModalProps> = ({
  visible,
  onClose,
  onOpenFullTools,
}) => {
  const { colors, mode } = useTheme();
  const [display, setDisplay] = useState('0');
  const [expr, setExpr] = useState('');
  const [angleMode, setAngleMode] = useState<MathAngleMode>('deg');
  const [secondFn, setSecondFn] = useState(false);
  const [lastAns, setLastAns] = useState('0');
  const [history, setHistory] = useState<Array<{ expr: string; res: string }>>([]);

  const buttons = useMemo(
    () => [
      [secondFn ? 'asin(' : 'sin(', secondFn ? 'acos(' : 'cos(', secondFn ? 'atan(' : 'tan(', '(', ')', 'C'],
      ['log(', 'ln(', secondFn ? 'x²' : '√(', 'π', 'e', '⌫'],
      ['7', '8', '9', '÷', '^', '!'],
      ['4', '5', '6', '×', '%', 'ANS'],
      ['1', '2', '3', '-', '0', '+'],
    ],
    [secondFn]
  );

  const handlePress = (btn: string) => {
    if (btn === 'C') {
      setDisplay('0');
      setExpr('');
      return;
    }
    if (btn === 'ANS') {
      const nextExpr = expr === '0' || !expr ? lastAns : `${expr}${lastAns}`;
      setExpr(nextExpr);
      setDisplay(nextExpr);
      return;
    }
    if (btn === '=') {
      if (!expr.trim()) return;
      const result = evaluateMathExpression(expr, angleMode);
      if (result.success && result.formatted !== undefined) {
        setHistory((prev) => [{ expr, res: result.formatted! }, ...prev].slice(0, 5));
        setLastAns(result.formatted);
        setDisplay(result.formatted);
        setExpr(result.formatted);
      } else {
        setDisplay(result.error || 'Error');
      }
      return;
    }
    if (btn === '⌫') {
      const next = expr.slice(0, -1);
      setExpr(next);
      setDisplay(next || '0');
      return;
    }
    const mapped = btn === 'x²' ? '^2' : btn;
    const isBinary = ['+', '-', '×', '÷', '^', '.', '%', '!'].includes(mapped);
    const nextExpr = expr === '0' && !isBinary ? mapped : expr + mapped;
    setExpr(nextExpr);
    setDisplay(nextExpr);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <View style={[styles.iconBadge, { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5' }]}>
                <Calculator size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Quick Scientific Calc</Text>
                <Text style={[styles.sub, { color: colors.textSecondary }]}>
                  Popup workspace overlay · Zero progress loss
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close quick calculator">
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={[styles.displayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modeRow}>
                <View style={styles.modePills}>
                  <TouchableOpacity
                    onPress={() => setAngleMode((m) => (m === 'deg' ? 'rad' : 'deg'))}
                    style={[
                      styles.modePill,
                      {
                        backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5',
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 10.5, fontWeight: '800', color: colors.primary }}>
                      {angleMode.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSecondFn((s) => !s)}
                    style={[
                      styles.modePill,
                      {
                        backgroundColor: secondFn ? colors.primary : colors.card,
                        borderColor: secondFn ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 10.5, fontWeight: '800', color: secondFn ? '#FFFFFF' : colors.text }}>
                      2nd
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 10.5, color: colors.textSecondary, fontWeight: '600' }}>
                  ANS: {lastAns}
                </Text>
              </View>

              <Text style={[styles.exprText, { color: colors.textSecondary }]} numberOfLines={1}>
                {expr || ' '}
              </Text>
              <Text style={[styles.mainDisplay, { color: colors.text }]} numberOfLines={1}>
                {display}
              </Text>
            </View>

            {history.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tapeRow}>
                {history.map((item, idx) => (
                  <TouchableOpacity
                    key={`${item.expr}_${idx}`}
                    onPress={() => {
                      setExpr(item.res);
                      setDisplay(item.res);
                    }}
                    style={[styles.tapePill, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <Text style={{ fontSize: 10.5, color: colors.textSecondary }}>
                      {item.expr} = <Text style={{ color: colors.primary, fontWeight: '800' }}>{item.res}</Text>
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.keypad}>
              {buttons.map((row, rIdx) => (
                <View key={rIdx} style={styles.keyRow}>
                  {row.map((btn) => {
                    const isOp = ['÷', '×', '-', '+', '^', '%', '!'].includes(btn);
                    const isFunc = !/^[0-9]$/.test(btn) && !isOp;
                    return (
                      <TouchableOpacity
                        key={btn}
                        activeOpacity={0.75}
                        onPress={() => handlePress(btn)}
                        style={[
                          styles.keyBtn,
                          {
                            backgroundColor: isOp
                              ? mode === 'dark'
                                ? '#431407'
                                : '#FFEDD5'
                              : isFunc
                              ? colors.surface
                              : colors.card,
                            borderColor: isOp ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: btn.length > 3 ? 11 : 13.5,
                            fontWeight: isOp ? '800' : '600',
                            color: isOp ? colors.primary : colors.text,
                          }}
                        >
                          {btn}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              <View style={styles.bottomActions}>
                <Pressable
                  focusable={false}
                  onPress={() => handlePress('=')}
                  style={({ pressed }) => [
                    styles.evalBtn,
                    { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={styles.evalText}>= Evaluate</Text>
                </Pressable>
                {onOpenFullTools && (
                  <Pressable
                    focusable={false}
                    onPress={() => {
                      onClose();
                      onOpenFullTools();
                    }}
                    style={({ pressed }) => [
                      styles.fullToolsBtn,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        opacity: pressed ? 0.78 : 1,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                      Full Lab Tools
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '800' },
  sub: { fontSize: 11, marginTop: 1 },
  closeBtn: { padding: 4 },
  body: { padding: 14, gap: 10 },
  displayCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modePills: { flexDirection: 'row', gap: 6 },
  modePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  exprText: { fontSize: 12, textAlign: 'right', minHeight: 16 },
  mainDisplay: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  tapeRow: { gap: 6 },
  tapePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  keypad: { gap: 6 },
  keyRow: { flexDirection: 'row', gap: 6 },
  keyBtn: {
    flex: 1,
    height: 39,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bottomActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  evalBtn: {
    flex: 1.4,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  evalText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  fullToolsBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

