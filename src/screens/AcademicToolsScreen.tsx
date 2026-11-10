import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { PERIODIC_TABLE, CATEGORY_COLORS } from '../data/periodicTable';
import { PHYSICAL_CONSTANTS, REACTIVITY_SERIES } from '../data/academicConstants';
import { PeriodicElement } from '../types';
import { evaluateMathExpression } from '../utils/mathEvaluator';
import { AppIcon, IconName } from '../components/common/AppIcon';
import { 
  Droplets
} from 'lucide-react-native';

export const AcademicToolsScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const [activeSection, setActiveSection] = useState<'calc' | 'periodic' | 'converter' | 'constants' | 'reactivity'>('calc');

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcExpr, setCalcExpr] = useState('');

  // Unit Converter State
  const [converterVal, setConverterVal] = useState('1');
  const [convCategory, setConvCategory] = useState<'length' | 'mass' | 'temp'>('length');
  const [fromUnit, setFromUnit] = useState('km');
  const [toUnit, setToUnit] = useState('m');

  // Periodic Table Modal State
  const [selectedElement, setSelectedElement] = useState<PeriodicElement | null>(null);

  // Calculator logic
  const handleCalcPress = (btn: string) => {
    if (btn === 'C') {
      setCalcDisplay('0');
      setCalcExpr('');
      return;
    }
    if (btn === '=') {
      const res = evaluateMathExpression(calcExpr);
      if (res.success && res.formatted !== undefined) {
        setCalcDisplay(res.formatted);
        setCalcExpr(res.formatted);
      } else {
        setCalcDisplay(res.error || 'Error');
      }
      return;
    }

    if (btn === '⌫') {
      const next = calcExpr.slice(0, -1);
      setCalcExpr(next);
      setCalcDisplay(next || '0');
      return;
    }

    const nextExpr = calcExpr === '0' && !['+', '-', '×', '÷', '.'].includes(btn) ? btn : calcExpr + btn;
    setCalcExpr(nextExpr);
    setCalcDisplay(nextExpr);
  };

  // Converter calculations
  const calculateConversion = () => {
    const val = parseFloat(converterVal) || 0;
    if (convCategory === 'length') {
      // to meters
      let meters = val;
      if (fromUnit === 'km') meters = val * 1000;
      else if (fromUnit === 'cm') meters = val * 0.01;
      else if (fromUnit === 'mm') meters = val * 0.001;
      else if (fromUnit === 'miles') meters = val * 1609.34;
      else if (fromUnit === 'feet') meters = val * 0.3048;

      if (toUnit === 'km') return (meters / 1000).toFixed(4);
      if (toUnit === 'm') return meters.toFixed(2);
      if (toUnit === 'cm') return (meters * 100).toFixed(2);
      if (toUnit === 'mm') return (meters * 1000).toFixed(2);
      if (toUnit === 'miles') return (meters / 1609.34).toFixed(4);
      if (toUnit === 'feet') return (meters / 0.3048).toFixed(2);
    }
    if (convCategory === 'mass') {
      let kg = val;
      if (fromUnit === 'g') kg = val / 1000;
      else if (fromUnit === 'mg') kg = val / 1000000;
      else if (fromUnit === 'lb') kg = val * 0.453592;

      if (toUnit === 'kg') return kg.toFixed(4);
      if (toUnit === 'g') return (kg * 1000).toFixed(2);
      if (toUnit === 'mg') return (kg * 1000000).toFixed(0);
      if (toUnit === 'lb') return (kg / 0.453592).toFixed(4);
    }
    if (convCategory === 'temp') {
      if (fromUnit === '°C' && toUnit === '°F') return (val * 1.8 + 32).toFixed(2);
      if (fromUnit === '°C' && toUnit === 'K') return (val + 273.15).toFixed(2);
      if (fromUnit === '°F' && toUnit === '°C') return (((val - 32) * 5) / 9).toFixed(2);
      if (fromUnit === '°F' && toUnit === 'K') return (((val - 32) * 5) / 9 + 273.15).toFixed(2);
      if (fromUnit === 'K' && toUnit === '°C') return (val - 273.15).toFixed(2);
      if (fromUnit === 'K' && toUnit === '°F') return ((val - 273.15) * 1.8 + 32).toFixed(2);
    }
    return val.toString();
  };

  const calcButtons = [
    ['sin(', 'cos(', 'tan(', 'C'],
    ['log(', 'ln(', '√(', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '='],
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tool Navigation Chips */}
      <View
        style={[
          styles.navWrapper,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.navScroll}
          contentContainerStyle={styles.navRowContent}
        >
          {[
            { key: 'calc', label: 'Scientific Calc', iconName: 'calculator' as IconName },
            { key: 'periodic', label: 'Periodic Table', iconName: 'flask' as IconName },
            { key: 'converter', label: 'Unit Converter', iconName: 'scale' as IconName },
            { key: 'constants', label: 'Constants', iconName: 'atom' as IconName },
            { key: 'reactivity', label: 'Reactivity Series', iconName: 'flame' as IconName },
          ].map((item) => {
            const isSelected = activeSection === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.7}
                onPress={() => {
                  setActiveSection(item.key as any);
                }}
                style={[
                  styles.navChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <AppIcon
                  name={item.iconName}
                  size="xs"
                  color={isSelected ? '#FFFFFF' : colors.primary}
                />
                <Text
                  style={[
                    styles.navChipText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: SCIENTIFIC CALCULATOR */}
        {activeSection === 'calc' && (
          <View style={styles.calcContainer}>
            <Card style={styles.calcDisplayCard}>
              <Text style={[styles.calcExpression, { color: colors.textSecondary }]}>
                {calcExpr || ' '}
              </Text>
              <Text style={[styles.calcMainDisplay, { color: colors.text }]} numberOfLines={1}>
                {calcDisplay}
              </Text>
            </Card>

            <View style={styles.keypad}>
              {calcButtons.map((row, rIdx) => (
                <View key={rIdx} style={styles.keypadRow}>
                  {row.map((btn) => {
                    const isOp = ['÷', '×', '-', '+', '='].includes(btn);
                    const isSpecial = ['sin(', 'cos(', 'tan(', 'log(', 'ln(', '√(', 'C', '⌫'].includes(btn);
                    const isEquals = btn === '=';

                    let btnBg = colors.card;
                    let btnTextColor = colors.text;

                    if (isEquals) {
                      btnBg = colors.primary;
                      btnTextColor = '#FFFFFF';
                    } else if (isOp) {
                      btnBg = mode === 'dark' ? '#431407' : '#FFEDD5';
                      btnTextColor = colors.primary;
                    } else if (isSpecial) {
                      btnBg = colors.surface;
                      btnTextColor = mode === 'dark' ? colors.text : colors.textSecondary;
                    }

                    return (
                      <TouchableOpacity
                        key={btn}
                        activeOpacity={0.7}
                        onPress={() => handleCalcPress(btn)}
                        style={[
                          styles.keyBtn,
                          {
                            backgroundColor: btnBg,
                            borderColor: isEquals || isOp ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.keyBtnText,
                            {
                              color: btnTextColor,
                              fontWeight: isOp || isEquals ? '800' : '600',
                            },
                          ]}
                        >
                          {btn}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SECTION 2: PERIODIC TABLE */}
        {activeSection === 'periodic' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Periodic Table of Elements ({PERIODIC_TABLE.length})
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Tap any element to inspect mass, group, period & electron orbital configurations.
            </Text>

            <View style={styles.elementGrid}>
              {PERIODIC_TABLE.map((el) => {
                const catColor = CATEGORY_COLORS[el.category] || colors.primary;
                return (
                  <TouchableOpacity
                    key={el.number}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedElement(el);
                    }}
                    style={[
                      styles.elementCard,
                      { backgroundColor: colors.card, borderColor: catColor },
                    ]}
                  >
                    <View style={styles.elHeader}>
                      <Text style={[styles.elNumber, { color: colors.textSecondary }]}>{el.number}</Text>
                      <View style={[styles.elDot, { backgroundColor: catColor }]} />
                    </View>
                    <Text style={[styles.elSymbol, { color: colors.text }]}>{el.symbol}</Text>
                    <Text style={[styles.elName, { color: colors.textSecondary }]} numberOfLines={1}>
                      {el.name}
                    </Text>
                    <Text style={[styles.elMass, { color: catColor }]}>{el.mass}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* SECTION 3: UNIT CONVERTER */}
        {activeSection === 'converter' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Scientific Unit Converter</Text>
            
            {/* Category tabs */}
            <View style={[styles.convTabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {(['length', 'mass', 'temp'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setConvCategory(cat);
                    if (cat === 'length') { setFromUnit('km'); setToUnit('m'); }
                    else if (cat === 'mass') { setFromUnit('kg'); setToUnit('g'); }
                    else if (cat === 'temp') { setFromUnit('°C'); setToUnit('°F'); }
                  }}
                  style={[
                    styles.convTab,
                    convCategory === cat && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.convTabText,
                      { color: convCategory === cat ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {cat.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Card style={styles.converterCard}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Input Value</Text>
              <TextInput
                style={[
                  styles.convInput,
                  { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.primary },
                ]}
                keyboardType="numeric"
                value={converterVal}
                onChangeText={setConverterVal}
              />

              <View style={styles.unitSelectRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>From ({fromUnit})</Text>
                  <View style={styles.pillOptions}>
                    {(convCategory === 'length' 
                      ? ['km', 'm', 'cm', 'mm'] 
                      : convCategory === 'mass' 
                      ? ['kg', 'g', 'mg', 'lb'] 
                      : ['°C', '°F', 'K']
                    ).map((u) => (
                      <TouchableOpacity
                        key={u}
                        onPress={() => { setFromUnit(u); }}
                        style={[
                          styles.unitPill,
                          {
                            backgroundColor: fromUnit === u ? colors.primary : colors.surface,
                            borderColor: fromUnit === u ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: fromUnit === u ? '#FFFFFF' : colors.text }}>
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>To ({toUnit})</Text>
                  <View style={styles.pillOptions}>
                    {(convCategory === 'length' 
                      ? ['km', 'm', 'cm', 'mm'] 
                      : convCategory === 'mass' 
                      ? ['kg', 'g', 'mg', 'lb'] 
                      : ['°C', '°F', 'K']
                    ).map((u) => (
                      <TouchableOpacity
                        key={u}
                        onPress={() => { setToUnit(u); }}
                        style={[
                          styles.unitPill,
                          {
                            backgroundColor: toUnit === u ? colors.primary : colors.surface,
                            borderColor: toUnit === u ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: toUnit === u ? '#FFFFFF' : colors.text }}>
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Conversion Result Box */}
              <View
                style={[
                  styles.resultBox,
                  {
                    backgroundColor: mode === 'dark' ? colors.surface : '#FFEDD5',
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Converted Result</Text>
                <Text style={[styles.resultValue, { color: colors.primary }]}>
                  {calculateConversion()} {toUnit}
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* SECTION 4: PHYSICAL CONSTANTS */}
        {activeSection === 'constants' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Universal Physical Constants</Text>
            {PHYSICAL_CONSTANTS.map((c) => (
              <Card key={c.symbol} style={styles.constantCard}>
                <View style={styles.constHeader}>
                  <Text style={[styles.constName, { color: colors.text }]}>{c.name}</Text>
                  <Badge label={c.symbol} variant="primary" size="sm" />
                </View>
                <Text style={[styles.constValue, { color: colors.primary }]}>{c.value} {c.unit}</Text>
                <Text style={[styles.constDesc, { color: colors.textSecondary }]}>{c.description}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* SECTION 5: REACTIVITY SERIES */}
        {activeSection === 'reactivity' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Metal Reactivity Series</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Ordered from most reactive (top) to least reactive noble metals (bottom).
            </Text>

            {REACTIVITY_SERIES.map((m) => (
              <Card key={m.rank} style={styles.reactivityCard}>
                <View style={styles.reactivityRow}>
                  <View style={[styles.rankBadge, { backgroundColor: m.rank <= 3 ? colors.primary : colors.surface }]}>
                    <Text style={[styles.rankNum, { color: m.rank <= 3 ? '#FFFFFF' : colors.text }]}>
                      #{m.rank}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.reactivityMetal, { color: colors.text }]}>{m.metal}</Text>
                    <Text style={[styles.reactivityLevel, { color: m.rank <= 3 ? colors.error : colors.textSecondary }]}>
                      Reactivity: {m.reactivity}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Droplets size={12} color={colors.info} />
                      <Text style={[styles.reactivityWater, { color: colors.textSecondary }]}>
                        {m.reactionWithWater}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Element Detail Modal */}
      <Modal visible={selectedElement !== null} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {selectedElement && (
              <>
                <View style={styles.modalHeader}>
                  <Badge label={`ATOMIC #${selectedElement.number}`} variant="primary" size="sm" />
                  <Badge label={selectedElement.category.replace('_', ' ').toUpperCase()} variant="info" size="sm" />
                </View>
                <Text style={[styles.modalSymbol, { color: colors.primary }]}>{selectedElement.symbol}</Text>
                <Text style={[styles.modalName, { color: colors.text }]}>{selectedElement.name}</Text>
                <Text style={[styles.modalMass, { color: colors.textSecondary }]}>
                  Atomic Mass: {selectedElement.mass} u
                </Text>

                <View style={[styles.modalInfoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.infoRow, { color: colors.text }]}>
                    <Text style={{ fontWeight: '700' }}>Group:</Text> {selectedElement.group} · <Text style={{ fontWeight: '700' }}>Period:</Text> {selectedElement.period}
                  </Text>
                  <Text style={[styles.infoRow, { color: colors.text, marginTop: 4 }]}>
                    <Text style={{ fontWeight: '700' }}>Electron Config:</Text> {selectedElement.electronConfig}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedElement(null)}
                  style={[styles.closeBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navWrapper: {
    flexGrow: 0,
    flexShrink: 0,
    borderBottomWidth: 1,
  },
  navScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  navRowContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  navChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  navChipText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  mainScroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  calcContainer: {
    gap: 12,
  },
  calcDisplayCard: {
    padding: 16,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 90,
  },
  calcExpression: {
    fontSize: 14,
    marginBottom: 4,
  },
  calcMainDisplay: {
    fontSize: 32,
    fontWeight: '800',
  },
  keypad: {
    gap: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keyBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBtnText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  elementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  elementCard: {
    width: '23%',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  elHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  elNumber: {
    fontSize: 10,
    fontWeight: '700',
  },
  elDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  elSymbol: {
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 2,
  },
  elName: {
    fontSize: 9,
    fontWeight: '500',
  },
  elMass: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  convTabs: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 12,
  },
  convTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  convTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  converterCard: {
    padding: 16,
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  convInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '800',
  },
  unitSelectRow: {
    flexDirection: 'row',
  },
  pillOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  unitPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  resultBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    marginTop: 6,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  constantCard: {
    padding: 14,
    marginBottom: 10,
  },
  constHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  constName: {
    fontSize: 14,
    fontWeight: '700',
  },
  constValue: {
    fontSize: 14,
    fontWeight: '800',
    marginVertical: 2,
  },
  constDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  reactivityCard: {
    padding: 14,
    marginBottom: 8,
  },
  reactivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNum: {
    fontSize: 12,
    fontWeight: '800',
  },
  reactivityMetal: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  reactivityLevel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  reactivityWater: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  modalSymbol: {
    fontSize: 48,
    fontWeight: '900',
  },
  modalName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalMass: {
    fontSize: 13,
    marginBottom: 14,
  },
  modalInfoBox: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoRow: {
    fontSize: 13,
  },
  closeBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

