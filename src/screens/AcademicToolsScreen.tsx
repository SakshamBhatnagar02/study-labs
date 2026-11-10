import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  F_BLOCK_GROUP_INFO,
  PERIODIC_GROUPS,
  PERIODIC_TABLE,
  calculateMolarMass,
  getElementExtendedMeta,
} from '../data/periodicTable';
import { PHYSICAL_CONSTANTS, REACTIVITY_SERIES } from '../data/academicConstants';
import { PeriodicElement, PeriodicGroupInfo } from '../types';
import { evaluateMathExpression, MathAngleMode } from '../utils/mathEvaluator';
import { AppIcon, IconName } from '../components/common/AppIcon';
import { EmptyResourceCard } from '../components/common/StateFeedbackCard';
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FlaskConical,
  Grid3X3,
  Layers,
  LayoutGrid,
  Search,
  Sparkles,
  X,
} from 'lucide-react-native';

type ToolSection = 'calc' | 'periodic' | 'converter' | 'constants' | 'reactivity';
type ConvCategory =
  | 'length'
  | 'mass'
  | 'temp'
  | 'energy'
  | 'pressure'
  | 'volume'
  | 'speed'
  | 'time';

const UNIT_FACTORS: Record<Exclude<ConvCategory, 'temp'>, Record<string, number>> = {
  length: {
    km: 1000,
    m: 1,
    cm: 0.01,
    mm: 0.001,
    miles: 1609.344,
    feet: 0.3048,
    inch: 0.0254,
  },
  mass: {
    kg: 1,
    g: 0.001,
    mg: 1e-6,
    lb: 0.45359237,
    oz: 0.0283495,
  },
  energy: {
    J: 1,
    kJ: 1000,
    cal: 4.184,
    kcal: 4184,
    eV: 1.602176634e-19,
  },
  pressure: {
    Pa: 1,
    kPa: 1000,
    bar: 100000,
    atm: 101325,
    mmHg: 133.322368,
  },
  volume: {
    'm³': 1000,
    L: 1,
    mL: 0.001,
    'cm³': 0.001,
  },
  speed: {
    'm/s': 1,
    'km/h': 1 / 3.6,
    mph: 0.44704,
  },
  time: {
    s: 1,
    min: 60,
    h: 3600,
    day: 86400,
  },
};

const CONV_CATEGORIES: Array<{
  key: ConvCategory;
  label: string;
  units: string[];
  defaultFrom: string;
  defaultTo: string;
}> = [
  { key: 'length', label: 'Length', units: ['km', 'm', 'cm', 'mm', 'miles', 'feet', 'inch'], defaultFrom: 'km', defaultTo: 'm' },
  { key: 'mass', label: 'Mass', units: ['kg', 'g', 'mg', 'lb', 'oz'], defaultFrom: 'kg', defaultTo: 'g' },
  { key: 'temp', label: 'Temp', units: ['°C', '°F', 'K'], defaultFrom: '°C', defaultTo: 'K' },
  { key: 'energy', label: 'Energy', units: ['J', 'kJ', 'cal', 'kcal', 'eV'], defaultFrom: 'J', defaultTo: 'cal' },
  { key: 'pressure', label: 'Pressure', units: ['Pa', 'kPa', 'bar', 'atm', 'mmHg'], defaultFrom: 'atm', defaultTo: 'kPa' },
  { key: 'volume', label: 'Volume', units: ['m³', 'L', 'mL', 'cm³'], defaultFrom: 'L', defaultTo: 'mL' },
  { key: 'speed', label: 'Speed', units: ['m/s', 'km/h', 'mph'], defaultFrom: 'm/s', defaultTo: 'km/h' },
  { key: 'time', label: 'Time', units: ['s', 'min', 'h', 'day'], defaultFrom: 'h', defaultTo: 's' },
];

function formatSmartNumber(num: number): string {
  if (!Number.isFinite(num)) return '0';
  const abs = Math.abs(num);
  if (abs === 0) return '0';
  if (abs >= 1e6 || abs < 1e-4) {
    return num.toExponential(4);
  }
  return parseFloat(num.toFixed(6)).toString();
}

export const AcademicToolsScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const { width: viewportWidth } = useWindowDimensions();
  const [activeSection, setActiveSection] = useState<ToolSection>('calc');

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcExpr, setCalcExpr] = useState('');
  const [angleMode, setAngleMode] = useState<MathAngleMode>('deg');
  const [secondFn, setSecondFn] = useState(false);
  const [lastAns, setLastAns] = useState('0');
  const [calcHistory, setCalcHistory] = useState<Array<{ expr: string; res: string }>>([]);

  // Periodic Table + Molar Mass State
  const [selectedElement, setSelectedElement] = useState<PeriodicElement | null>(null);
  const [selectedGroupInfo, setSelectedGroupInfo] = useState<PeriodicGroupInfo | null>(null);
  const [periodicView, setPeriodicView] = useState<'grid' | 'classic'>('grid');
  const [elementQuery, setElementQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [molarFormula, setMolarFormula] = useState('H2SO4');

  // Unit Converter State
  const [converterVal, setConverterVal] = useState('1');
  const [convCategory, setConvCategory] = useState<ConvCategory>('length');
  const [fromUnit, setFromUnit] = useState('km');
  const [toUnit, setToUnit] = useState('m');

  // Constants Search / Filter State
  const [constantQuery, setConstantQuery] = useState('');
  const [constantCategory, setConstantCategory] = useState<string>('All');

  // Calculator logic
  const handleCalcPress = (btn: string) => {
    if (btn === 'C') {
      setCalcDisplay('0');
      setCalcExpr('');
      return;
    }
    if (btn === 'ANS') {
      const token = lastAns || '0';
      const nextExpr = calcExpr === '0' || calcExpr === '' ? token : `${calcExpr}${token}`;
      setCalcExpr(nextExpr);
      setCalcDisplay(nextExpr);
      return;
    }
    if (btn === '=') {
      if (!calcExpr.trim()) return;
      const res = evaluateMathExpression(calcExpr, angleMode);
      if (res.success && res.formatted !== undefined) {
        setCalcHistory((prev) => [{ expr: calcExpr, res: res.formatted! }, ...prev].slice(0, 6));
        setLastAns(res.formatted);
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

    const tokenMap: Record<string, string> = {
      'x²': '^2',
    };
    const insertToken = tokenMap[btn] ?? btn;
    const isBinaryOp = ['+', '-', '×', '÷', '^', '.', '%', '!'].includes(insertToken);
    const nextExpr = calcExpr === '0' && !isBinaryOp ? insertToken : calcExpr + insertToken;
    setCalcExpr(nextExpr);
    setCalcDisplay(nextExpr);
  };

  const calcButtons = useMemo(
    () => [
      [secondFn ? 'asin(' : 'sin(', secondFn ? 'acos(' : 'cos(', secondFn ? 'atan(' : 'tan(', '(', ')', 'C'],
      ['log(', 'ln(', secondFn ? 'x²' : '√(', 'π', 'e', '⌫'],
      ['7', '8', '9', '÷', '^', '!'],
      ['4', '5', '6', '×', '%', 'ANS'],
      ['1', '2', '3', '-', '0', '+'],
    ],
    [secondFn]
  );

  // Unit Converter logic
  const activeConvMeta = useMemo(
    () => CONV_CATEGORIES.find((c) => c.key === convCategory) || CONV_CATEGORIES[0],
    [convCategory]
  );

  const calculateConversion = () => {
    const val = parseFloat(converterVal);
    if (isNaN(val)) return '0';

    if (convCategory === 'temp') {
      let celsius = val;
      if (fromUnit === '°F') celsius = ((val - 32) * 5) / 9;
      else if (fromUnit === 'K') celsius = val - 273.15;

      if (toUnit === '°C') return formatSmartNumber(celsius);
      if (toUnit === '°F') return formatSmartNumber(celsius * 1.8 + 32);
      if (toUnit === 'K') return formatSmartNumber(celsius + 273.15);
      return formatSmartNumber(val);
    }

    const factors = UNIT_FACTORS[convCategory];
    const fromFactor = factors[fromUnit] ?? 1;
    const toFactor = factors[toUnit] ?? 1;
    const converted = (val * fromFactor) / toFactor;
    return formatSmartNumber(converted);
  };

  // Filtered Periodic Table
  const filteredElements = useMemo(() => {
    const q = elementQuery.trim().toLowerCase();
    return PERIODIC_TABLE.filter((el) => {
      if (categoryFilter !== 'all' && el.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase() === q ||
        el.symbol.toLowerCase().includes(q) ||
        String(el.number) === q
      );
    });
  }, [elementQuery, categoryFilter]);

  const molarResult = useMemo(() => calculateMolarMass(molarFormula), [molarFormula]);

  // 18-column Classic Periodic Table Lookup
  const mainTableCellMap = useMemo(() => {
    const map = new Map<string, PeriodicElement>();
    for (const el of PERIODIC_TABLE) {
      if (el.category === 'lanthanide' && el.number !== 57) continue;
      if (el.category === 'actinide' && el.number !== 89) continue;
      map.set(`${el.period}-${el.group}`, el);
    }
    return map;
  }, []);

  const lanthanides = useMemo(() => PERIODIC_TABLE.filter((e) => e.number >= 57 && e.number <= 71), []);
  const actinides = useMemo(() => PERIODIC_TABLE.filter((e) => e.number >= 89 && e.number <= 103), []);

  const elementCardWidth = useMemo(() => {
    const usable = Math.max(300, Math.min(viewportWidth, 720) - 32);
    const cols = usable >= 580 ? 6 : 4;
    const gapTotal = (cols - 1) * 8;
    return Math.floor((usable - gapTotal) / cols);
  }, [viewportWidth]);

  // Filtered Physical Constants
  const filteredConstants = useMemo(() => {
    const q = constantQuery.trim().toLowerCase();
    return PHYSICAL_CONSTANTS.filter((c) => {
      if (constantCategory !== 'All' && c.category !== constantCategory) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [constantQuery, constantCategory]);

  const navigateModalElement = (delta: number) => {
    if (!selectedElement) return;
    const idx = PERIODIC_TABLE.findIndex((e) => e.number === selectedElement.number);
    const nextIdx = (idx + delta + PERIODIC_TABLE.length) % PERIODIC_TABLE.length;
    setSelectedElement(PERIODIC_TABLE[nextIdx]);
  };

  const groupElementsList = useMemo(() => {
    if (!selectedGroupInfo) return [];
    if (selectedGroupInfo.id === 'lanthanides') return lanthanides;
    if (selectedGroupInfo.id === 'actinides') return actinides;
    return PERIODIC_TABLE.filter((el) => {
      if (selectedGroupInfo.groupNumber === 3) {
        return el.group === 3 && (el.number === 21 || el.number === 39 || el.number === 57 || el.number === 89);
      }
      return el.group === selectedGroupInfo.groupNumber;
    });
  }, [selectedGroupInfo, lanthanides, actinides]);

  const navigateModalGroup = (delta: number) => {
    if (!selectedGroupInfo) return;
    const currentNum = selectedGroupInfo.groupNumber || 1;
    const nextNum = ((currentNum - 1 + delta + 18) % 18) + 1;
    setSelectedGroupInfo(PERIODIC_GROUPS[nextNum]);
  };

  const selectedElementMeta = useMemo(
    () => (selectedElement ? getElementExtendedMeta(selectedElement) : null),
    [selectedElement]
  );

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
            { key: 'periodic', label: 'Periodic (118)', iconName: 'flask' as IconName },
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
                  setActiveSection(item.key as ToolSection);
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
        {/* SECTION 1: SCIENTIFIC CALCULATOR (with Deg/Rad, 2nd trig, Factorial, History Tape) */}
        {activeSection === 'calc' && (
          <View style={styles.calcContainer}>
            <Card style={styles.calcDisplayCard}>
              <View style={styles.calcTopMetaRow}>
                <View style={styles.calcModePillGroup}>
                  <TouchableOpacity
                    onPress={() => setAngleMode((m) => (m === 'deg' ? 'rad' : 'deg'))}
                    style={[
                      styles.calcModeChip,
                      {
                        backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5',
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>
                      {angleMode.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSecondFn((s) => !s)}
                    style={[
                      styles.calcModeChip,
                      {
                        backgroundColor: secondFn ? colors.primary : colors.surface,
                        borderColor: secondFn ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: secondFn ? '#FFFFFF' : colors.text }}>
                      2nd
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '600' }}>
                  ANS: {lastAns}
                </Text>
              </View>

              <Text style={[styles.calcExpression, { color: colors.textSecondary }]} numberOfLines={1}>
                {calcExpr || ' '}
              </Text>
              <Text style={[styles.calcMainDisplay, { color: colors.text }]} numberOfLines={1}>
                {calcDisplay}
              </Text>
            </Card>

            {calcHistory.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyTape}>
                {calcHistory.map((item, i) => (
                  <TouchableOpacity
                    key={`${item.expr}_${i}`}
                    onPress={() => {
                      setCalcExpr(item.res);
                      setCalcDisplay(item.res);
                    }}
                    style={[styles.historyPill, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      {item.expr} = <Text style={{ color: colors.primary, fontWeight: '800' }}>{item.res}</Text>
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.keypad}>
              {calcButtons.map((row, rIdx) => (
                <View key={rIdx} style={styles.keypadRow}>
                  {row.map((btn) => {
                    const isOp = ['÷', '×', '-', '+', '^', '%', '!'].includes(btn);
                    const isSpecial = ['sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'log(', 'ln(', '√(', 'x²', '(', ')', 'π', 'e', 'C', '⌫', 'ANS'].includes(btn);

                    let btnBg = colors.card;
                    let btnTextColor = colors.text;

                    if (isOp) {
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
                            borderColor: isOp ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.keyBtnText,
                            {
                              color: btnTextColor,
                              fontSize: btn.length > 3 ? 12.5 : 15,
                              fontWeight: isOp ? '800' : '600',
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {btn}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleCalcPress('=')}
                style={[styles.equalsFullBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.equalsFullText}>= Evaluate Expression</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SECTION 2: COMPLETE PERIODIC TABLE (ALL 118 ELEMENTS + CLASSIC 18-COL VIEW + MOLAR MASS) */}
        {activeSection === 'periodic' && (
          <View style={{ gap: 12 }}>
            <View style={styles.periodicHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Periodic Table ({PERIODIC_TABLE.length} Elements)
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, marginBottom: 0 }]}>
                  All 118 IUPAC elements · Tap any tile to inspect orbitals
                </Text>
              </View>

              <View style={[styles.viewToggleGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => setPeriodicView('grid')}
                  style={[
                    styles.viewToggleBtn,
                    periodicView === 'grid' && { backgroundColor: colors.primary },
                  ]}
                >
                  <LayoutGrid size={14} color={periodicView === 'grid' ? '#FFFFFF' : colors.textSecondary} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: periodicView === 'grid' ? '#FFFFFF' : colors.textSecondary }}>
                    Grid
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPeriodicView('classic')}
                  style={[
                    styles.viewToggleBtn,
                    periodicView === 'classic' && { backgroundColor: colors.primary },
                  ]}
                >
                  <Grid3X3 size={14} color={periodicView === 'classic' ? '#FFFFFF' : colors.textSecondary} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: periodicView === 'classic' ? '#FFFFFF' : colors.textSecondary }}>
                    18-Col
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Molar Mass Calculator Card */}
            <Card style={[styles.molarCard, { borderColor: colors.primary }]}>
              <View style={styles.molarTitleRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <FlaskConical size={16} color={colors.primary} />
                  <Text style={[styles.molarTitle, { color: colors.text }]}>Molar Mass Calculator</Text>
                </View>
                <Badge
                  label={molarResult.success ? `${molarResult.molarMass} g/mol` : 'Check Syntax'}
                  variant={molarResult.success ? 'primary' : 'warning'}
                  size="sm"
                />
              </View>

              <TextInput
                value={molarFormula}
                onChangeText={setMolarFormula}
                placeholder="e.g. H2SO4, Ca(OH)2, CuSO4.5H2O"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.searchInput,
                  { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
              />

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.molarPresetRow}>
                {['H2O', 'H2SO4', 'Ca(OH)2', 'C6H12O6', 'CuSO4.5H2O', 'Al2(SO4)3'].map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setMolarFormula(f)}
                    style={[
                      styles.molarPresetPill,
                      {
                        backgroundColor: molarFormula === f ? colors.primary : colors.surface,
                        borderColor: molarFormula === f ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: molarFormula === f ? '#FFFFFF' : colors.text }}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {molarResult.success && molarResult.breakdown ? (
                <Text style={{ fontSize: 11.5, color: colors.textSecondary }}>
                  {molarResult.breakdown
                    .map((b) => `${b.symbol}×${b.count} (${b.subtotal})`)
                    .join(' + ')}{' '}
                  = <Text style={{ color: colors.primary, fontWeight: '800' }}>{molarResult.molarMass} g/mol</Text>
                </Text>
              ) : (
                <Text style={{ fontSize: 11.5, color: colors.error }}>{molarResult.error}</Text>
              )}
            </Card>

            {/* Search & Category Filter */}
            <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Search size={15} color={colors.textSecondary} />
              <TextInput
                value={elementQuery}
                onChangeText={setElementQuery}
                placeholder="Search by element name, symbol (Au), or atomic # (79)..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.searchBoxInput, { color: colors.text }]}
              />
              {elementQuery.length > 0 && (
                <TouchableOpacity onPress={() => setElementQuery('')}>
                  <X size={15} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catFilterRow}>
              <TouchableOpacity
                onPress={() => setCategoryFilter('all')}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: categoryFilter === 'all' ? colors.primary : colors.card,
                    borderColor: categoryFilter === 'all' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: categoryFilter === 'all' ? '#FFFFFF' : colors.text }}>
                  All ({PERIODIC_TABLE.length})
                </Text>
              </TouchableOpacity>
              {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => {
                const active = categoryFilter === catKey;
                const tint = CATEGORY_COLORS[catKey] || colors.primary;
                return (
                  <TouchableOpacity
                    key={catKey}
                    onPress={() => setCategoryFilter(active ? 'all' : catKey)}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: active ? tint : colors.card,
                        borderColor: active ? tint : colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.catDot, { backgroundColor: active ? '#FFFFFF' : tint }]} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                      {catLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Interactive Group 1-18 & f-Block Families Guide Strip */}
            <View style={styles.groupStripBox}>
              <View style={styles.groupStripHeader}>
                <Layers size={13} color={colors.primary} />
                <Text style={[styles.groupStripLabel, { color: colors.textSecondary }]}>
                  Inspect Group Trends, Valence Shell & Compounds (G1–G18):
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.groupStripScroll}
              >
                {Array.from({ length: 18 }, (_, i) => i + 1).map((gNum) => {
                  const info = PERIODIC_GROUPS[gNum];
                  const shortFam = info.familyName.split('(')[0].replace('Group', '').trim();
                  return (
                    <TouchableOpacity
                      key={`grp_${gNum}`}
                      activeOpacity={0.75}
                      onPress={() => setSelectedGroupInfo(info)}
                      style={[
                        styles.groupGuidePill,
                        { backgroundColor: colors.card, borderColor: colors.border },
                      ]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>
                        G{gNum}
                      </Text>
                      <Text style={{ fontSize: 10.5, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                        {shortFam}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setSelectedGroupInfo(F_BLOCK_GROUP_INFO.lanthanide)}
                  style={[styles.groupGuidePill, { backgroundColor: colors.card, borderColor: CATEGORY_COLORS.lanthanide }]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: CATEGORY_COLORS.lanthanide }}>4f</Text>
                  <Text style={{ fontSize: 10.5, fontWeight: '600', color: colors.text }}>Lanthanides</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setSelectedGroupInfo(F_BLOCK_GROUP_INFO.actinide)}
                  style={[styles.groupGuidePill, { backgroundColor: colors.card, borderColor: CATEGORY_COLORS.actinide }]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: CATEGORY_COLORS.actinide }}>5f</Text>
                  <Text style={{ fontSize: 10.5, fontWeight: '600', color: colors.text }}>Actinides</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {periodicView === 'grid' ? (
              <View style={styles.elementGrid}>
                {filteredElements.map((el) => {
                  const catColor = CATEGORY_COLORS[el.category] || colors.primary;
                  return (
                    <TouchableOpacity
                      key={el.number}
                      activeOpacity={0.8}
                      onPress={() => setSelectedElement(el)}
                      style={[
                        styles.elementCard,
                        {
                          width: elementCardWidth,
                          backgroundColor: colors.card,
                          borderColor: catColor,
                        },
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
                {filteredElements.length === 0 && (
                  <EmptyResourceCard
                    title="Element Not Found"
                    message={
                      elementQuery.trim()
                        ? `No element matched "${elementQuery}" in the selected category filter.`
                        : 'No elements match this category filter right now.'
                    }
                    actionLabel="Clear Search & Filters"
                    onAction={() => {
                      setElementQuery('');
                      setCategoryFilter('all');
                    }}
                  />
                )}
              </View>
            ) : (
              <Card style={{ padding: 10 }}>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 8 }}>
                  Scroll horizontally across all 18 IUPAC groups. Tap any G1–G18 header for group trends, or tap any element tile.
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator>
                  <View style={{ gap: 4 }}>
                    {/* Interactive G1-G18 Group Headers */}
                    <View style={styles.classicRow}>
                      {Array.from({ length: 18 }, (_, gIdx) => {
                        const group = gIdx + 1;
                        return (
                          <TouchableOpacity
                            key={`hdr_${group}`}
                            onPress={() => setSelectedGroupInfo(PERIODIC_GROUPS[group])}
                            style={[
                              styles.classicGroupHdr,
                              {
                                backgroundColor: mode === 'dark' ? '#1E293B' : '#FFF7ED',
                                borderColor: colors.primary,
                              },
                            ]}
                          >
                            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.primary }}>
                              G{group}
                            </Text>
                            <Text style={{ fontSize: 8, fontWeight: '700', color: colors.textSecondary }} numberOfLines={1}>
                              {PERIODIC_GROUPS[group].casGroup}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {[1, 2, 3, 4, 5, 6, 7].map((period) => (
                      <View key={`p_${period}`} style={styles.classicRow}>
                        {Array.from({ length: 18 }, (_, gIdx) => {
                          const group = gIdx + 1;
                          const el = mainTableCellMap.get(`${period}-${group}`);
                          if (!el) {
                            return <View key={`e_${period}_${group}`} style={styles.classicSpacer} />;
                          }
                          const catColor = CATEGORY_COLORS[el.category] || colors.primary;
                          const dimmed =
                            (categoryFilter !== 'all' && el.category !== categoryFilter) ||
                            (elementQuery.trim() !== '' &&
                              !el.name.toLowerCase().includes(elementQuery.trim().toLowerCase()) &&
                              !el.symbol.toLowerCase().includes(elementQuery.trim().toLowerCase()) &&
                              String(el.number) !== elementQuery.trim());
                          return (
                            <TouchableOpacity
                              key={el.number}
                              onPress={() => setSelectedElement(el)}
                              style={[
                                styles.classicCell,
                                {
                                  backgroundColor: colors.surface,
                                  borderColor: catColor,
                                  opacity: dimmed ? 0.25 : 1,
                                },
                              ]}
                            >
                              <Text style={[styles.classicNum, { color: colors.textSecondary }]}>
                                {el.number}
                              </Text>
                              <Text style={[styles.classicSym, { color: colors.text }]}>{el.symbol}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))}

                    <View style={{ height: 6 }} />
                    {[lanthanides, actinides].map((series, sIdx) => (
                      <View key={`f_${sIdx}`} style={styles.classicRow}>
                        <View style={styles.classicFLabel}>
                          <Text style={{ fontSize: 9, fontWeight: '800', color: colors.textSecondary }}>
                            {sIdx === 0 ? '57–71' : '89–103'}
                          </Text>
                        </View>
                        {series.map((el) => {
                          const catColor = CATEGORY_COLORS[el.category] || colors.primary;
                          return (
                            <TouchableOpacity
                              key={el.number}
                              onPress={() => setSelectedElement(el)}
                              style={[
                                styles.classicCell,
                                { backgroundColor: colors.surface, borderColor: catColor },
                              ]}
                            >
                              <Text style={[styles.classicNum, { color: colors.textSecondary }]}>
                                {el.number}
                              </Text>
                              <Text style={[styles.classicSym, { color: colors.text }]}>{el.symbol}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </Card>
            )}
          </View>
        )}

        {/* SECTION 3: 8-CATEGORY SCIENTIFIC UNIT CONVERTER */}
        {activeSection === 'converter' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Scientific Unit Converter</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              8 physical dimensions · Instant precision conversion with unit swap
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0, marginBottom: 12 }}
              contentContainerStyle={styles.convTabScroll}
            >
              {CONV_CATEGORIES.map((cat) => {
                const active = convCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => {
                      setConvCategory(cat.key);
                      setFromUnit(cat.defaultFrom);
                      setToUnit(cat.defaultTo);
                    }}
                    style={[
                      styles.convTabChip,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.convTabText,
                        { color: active ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

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
                    {activeConvMeta.units.map((u) => (
                      <TouchableOpacity
                        key={u}
                        onPress={() => setFromUnit(u)}
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

                <TouchableOpacity
                  onPress={() => {
                    const prevFrom = fromUnit;
                    setFromUnit(toUnit);
                    setToUnit(prevFrom);
                  }}
                  style={[styles.swapBtn, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                  accessibilityLabel="Swap units"
                >
                  <ArrowLeftRight size={15} color={colors.primary} />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>To ({toUnit})</Text>
                  <View style={styles.pillOptions}>
                    {activeConvMeta.units.map((u) => (
                      <TouchableOpacity
                        key={u}
                        onPress={() => setToUnit(u)}
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

              <View
                style={[
                  styles.resultBox,
                  {
                    backgroundColor: mode === 'dark' ? colors.surface : '#FFEDD5',
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                  {converterVal || '0'} {fromUnit} =
                </Text>
                <Text style={[styles.resultValue, { color: colors.primary }]}>
                  {calculateConversion()} {toUnit}
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* SECTION 4: SEARCHABLE UNIVERSAL PHYSICAL CONSTANTS (21 CONSTANTS) */}
        {activeSection === 'constants' && (
          <View style={{ gap: 10 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Universal Physical Constants ({filteredConstants.length})
            </Text>

            <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Search size={15} color={colors.textSecondary} />
              <TextInput
                value={constantQuery}
                onChangeText={setConstantQuery}
                placeholder="Search constants (e.g. Planck, Faraday, Gas, Electron)..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.searchBoxInput, { color: colors.text }]}
              />
              {constantQuery.length > 0 && (
                <TouchableOpacity onPress={() => setConstantQuery('')}>
                  <X size={15} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catFilterRow}>
              {['All', 'Quantum & Atomic', 'Electromagnetism', 'Thermodynamics', 'Mechanics & Universal'].map((cat) => {
                const active = constantCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setConstantCategory(cat)}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {filteredConstants.map((c) => (
              <Card key={c.symbol} style={styles.constantCard}>
                <View style={styles.constHeader}>
                  <Text style={[styles.constName, { color: colors.text, flex: 1, paddingRight: 8 }]}>
                    {c.name}
                  </Text>
                  <Badge label={c.symbol} variant="primary" size="sm" />
                </View>
                <Text style={[styles.constValue, { color: colors.primary }]}>
                  {c.value} {c.unit}
                </Text>
                <Text style={[styles.constDesc, { color: colors.textSecondary }]}>{c.description}</Text>
              </Card>
            ))}

            {filteredConstants.length === 0 && (
              <EmptyResourceCard
                title="Physical Constant Not Found"
                message={
                  constantQuery.trim()
                    ? `No physical constant matched "${constantQuery}" under ${constantCategory}.`
                    : 'No physical constants found in this category.'
                }
                actionLabel="Reset Constant Filter"
                onAction={() => {
                  setConstantQuery('');
                  setConstantCategory('All');
                }}
              />
            )}
          </View>
        )}

        {/* SECTION 5: ELECTROCHEMICAL & METAL REACTIVITY SERIES */}
        {activeSection === 'reactivity' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Metal Reactivity & E° Series ({REACTIVITY_SERIES.length})
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Ordered from strongest reducing agents to noble metals with Standard Reduction Potential E°.
            </Text>

            {REACTIVITY_SERIES.map((m) => (
              <Card key={m.rank} style={styles.reactivityCard}>
                <View style={styles.reactivityRow}>
                  <View
                    style={[
                      styles.rankBadge,
                      {
                        backgroundColor:
                          m.rank <= 3 ? colors.primary : m.symbol === 'H₂' ? colors.info : colors.surface,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rankNum,
                        { color: m.rank <= 3 || m.symbol === 'H₂' ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      #{m.rank}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <Text style={[styles.reactivityMetal, { color: colors.text }]}>{m.metal}</Text>
                      <Badge label={`E° ${m.potentialV}`} variant={m.potentialV.startsWith('-') ? 'warning' : 'info'} size="sm" />
                    </View>
                    <Text style={[styles.reactivityLevel, { color: m.rank <= 3 ? colors.error : colors.textSecondary }]}>
                      Reactivity: {m.reactivity}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginTop: 3 }}>
                      <Droplets size={12} color={colors.info} style={{ marginTop: 2 }} />
                      <Text style={[styles.reactivityWater, { color: colors.textSecondary, flex: 1 }]}>
                        Water: {m.reactionWithWater}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginTop: 2 }}>
                      <Sparkles size={12} color={colors.warning} style={{ marginTop: 2 }} />
                      <Text style={[styles.reactivityWater, { color: colors.textSecondary, flex: 1 }]}>
                        Acid: {m.reactionWithAcid}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Element Detail Modal with Extended Physical/Chemical Metadata & Group Inspection */}
      <Modal
        visible={selectedElement !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedElement(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {selectedElement && selectedElementMeta && (
              <>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{ width: '100%', maxHeight: 460 }}
                  contentContainerStyle={{ alignItems: 'center', paddingBottom: 8 }}
                >
                  <View style={styles.modalHeader}>
                    <Badge label={`ATOMIC #${selectedElement.number}`} variant="primary" size="sm" />
                    <Badge
                      label={(CATEGORY_LABELS[selectedElement.category] || selectedElement.category).toUpperCase()}
                      variant="info"
                      size="sm"
                    />
                    <Badge label={selectedElementMeta.stateAtStp.toUpperCase()} variant="neutral" size="sm" />
                  </View>
                  <Text style={[styles.modalSymbol, { color: CATEGORY_COLORS[selectedElement.category] || colors.primary }]}>
                    {selectedElement.symbol}
                  </Text>
                  <Text style={[styles.modalName, { color: colors.text }]}>{selectedElement.name}</Text>
                  <Text style={[styles.modalMass, { color: colors.textSecondary }]}>
                    Standard Atomic Mass: {selectedElement.mass} u
                  </Text>

                  {/* Clickable Group Family Banner */}
                  <TouchableOpacity
                    activeOpacity={0.78}
                    onPress={() => {
                      const info = selectedElementMeta.groupInfo;
                      setSelectedElement(null);
                      setSelectedGroupInfo(info);
                    }}
                    style={[
                      styles.groupLinkBanner,
                      {
                        backgroundColor: mode === 'dark' ? '#1E293B' : '#FFF7ED',
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Layers size={15} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: colors.primary }}>
                        {selectedElementMeta.groupInfo.iupacGroup} ({selectedElementMeta.groupInfo.casGroup})
                      </Text>
                      <Text style={{ fontSize: 11.5, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                        {selectedElementMeta.groupInfo.familyName}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>
                      Group Info →
                    </Text>
                  </TouchableOpacity>

                  <View style={[styles.modalInfoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.infoRow, { color: colors.text }]}>
                      <Text style={{ fontWeight: '700' }}>Period:</Text> {selectedElement.period} ·{' '}
                      <Text style={{ fontWeight: '700' }}>Block:</Text> {selectedElementMeta.block} ·{' '}
                      <Text style={{ fontWeight: '700' }}>STP State:</Text> {selectedElementMeta.stateAtStp}
                    </Text>
                    <Text style={[styles.infoRow, { color: colors.text, marginTop: 6 }]}>
                      <Text style={{ fontWeight: '700' }}>Electron Config:</Text> {selectedElement.electronConfig}
                    </Text>
                    <Text style={[styles.infoRow, { color: colors.text, marginTop: 6 }]}>
                      <Text style={{ fontWeight: '700' }}>Valence Shell:</Text> {selectedElementMeta.groupInfo.valenceShell}
                    </Text>
                    <Text style={[styles.infoRow, { color: colors.text, marginTop: 6 }]}>
                      <Text style={{ fontWeight: '700' }}>Oxidation States:</Text> {selectedElementMeta.oxidationStates}
                    </Text>
                    <Text style={[styles.infoRow, { color: colors.text, marginTop: 6 }]}>
                      <Text style={{ fontWeight: '700' }}>Pauling Electronegativity:</Text>{' '}
                      {selectedElementMeta.electronegativity !== undefined
                        ? `${selectedElementMeta.electronegativity}`
                        : 'N/A (Noble Gas / Synthetic)'}
                    </Text>
                    <Text style={[styles.infoTrendNote, { color: colors.textSecondary, marginTop: 8 }]}>
                      {selectedElementMeta.groupInfo.periodicTrends}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.modalNavRow}>
                  <TouchableOpacity
                    onPress={() => navigateModalElement(-1)}
                    style={[styles.modalNavBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <ChevronLeft size={16} color={colors.text} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>Prev</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSelectedElement(null)}
                    style={[styles.closeBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.closeBtnText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigateModalElement(1)}
                    style={[styles.modalNavBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>Next</Text>
                    <ChevronRight size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Group 1-18 & f-Block Series Information Modal */}
      <Modal
        visible={selectedGroupInfo !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedGroupInfo(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.groupModalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {selectedGroupInfo && (
              <>
                <View style={styles.groupModalHeader}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Badge label={selectedGroupInfo.iupacGroup.toUpperCase()} variant="primary" size="sm" />
                      <Badge label={`CAS: ${selectedGroupInfo.casGroup}`} variant="info" size="sm" />
                      <Badge label={selectedGroupInfo.block} variant="neutral" size="sm" />
                    </View>
                    <Text style={[styles.groupModalTitle, { color: colors.text }]}>
                      {selectedGroupInfo.familyName}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedGroupInfo(null)} hitSlop={8}>
                    <X size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                  <View style={[styles.modalInfoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.infoRow, { color: colors.text }]}>
                      <Text style={{ fontWeight: '700' }}>Valence Configuration:</Text> {selectedGroupInfo.valenceShell}
                    </Text>
                    <Text style={[styles.infoRow, { color: colors.text, marginTop: 6 }]}>
                      <Text style={{ fontWeight: '700' }}>Common Oxidation States:</Text> {selectedGroupInfo.commonOxidationStates}
                    </Text>
                    <Text style={[styles.infoRow, { color: colors.text, marginTop: 6 }]}>
                      <Text style={{ fontWeight: '700' }}>Bonding Character:</Text> {selectedGroupInfo.bondingCharacter}
                    </Text>
                  </View>

                  <Text style={[styles.groupSectionHeading, { color: colors.primary }]}>
                    Periodic Trends Down the Group
                  </Text>
                  <Text style={[styles.groupBodyText, { color: colors.text }]}>
                    {selectedGroupInfo.periodicTrends}
                  </Text>

                  <Text style={[styles.groupSectionHeading, { color: colors.primary, marginTop: 12 }]}>
                    Key Chemical & Physical Highlights
                  </Text>
                  {selectedGroupInfo.keyProperties.map((prop, pIdx) => (
                    <View key={pIdx} style={styles.groupBulletRow}>
                      <Text style={{ color: colors.primary, fontWeight: '900' }}>•</Text>
                      <Text style={[styles.groupBodyText, { color: colors.textSecondary, flex: 1 }]}>
                        {prop}
                      </Text>
                    </View>
                  ))}

                  <Text style={[styles.groupSectionHeading, { color: colors.primary, marginTop: 12 }]}>
                    High-Yield Compounds
                  </Text>
                  <View style={styles.compoundChipsRow}>
                    {selectedGroupInfo.signatureCompounds.map((comp) => (
                      <View
                        key={comp}
                        style={[styles.compoundChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      >
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.text }}>{comp}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={[styles.groupSectionHeading, { color: colors.primary, marginTop: 14 }]}>
                    Elements in {selectedGroupInfo.iupacGroup} ({groupElementsList.length})
                  </Text>
                  <View style={styles.groupElementsGrid}>
                    {groupElementsList.map((el) => {
                      const tint = CATEGORY_COLORS[el.category] || colors.primary;
                      return (
                        <TouchableOpacity
                          key={el.number}
                          onPress={() => {
                            setSelectedGroupInfo(null);
                            setSelectedElement(el);
                          }}
                          style={[styles.groupElChip, { backgroundColor: colors.surface, borderColor: tint }]}
                        >
                          <Text style={{ fontSize: 9.5, fontWeight: '700', color: colors.textSecondary }}>
                            #{el.number}
                          </Text>
                          <Text style={{ fontSize: 14, fontWeight: '900', color: colors.text }}>
                            {el.symbol}
                          </Text>
                          <Text style={{ fontSize: 9.5, color: colors.textSecondary }} numberOfLines={1}>
                            {el.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                <View style={[styles.modalNavRow, { marginTop: 12 }]}>
                  <TouchableOpacity
                    onPress={() => navigateModalGroup(-1)}
                    style={[styles.modalNavBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <ChevronLeft size={16} color={colors.text} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>Prev Grp</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSelectedGroupInfo(null)}
                    style={[styles.closeBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.closeBtnText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigateModalGroup(1)}
                    style={[styles.modalNavBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>Next Grp</Text>
                    <ChevronRight size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  navWrapper: { flexGrow: 0, flexShrink: 0, borderBottomWidth: 1 },
  navScroll: { flexGrow: 0, flexShrink: 0 },
  navRowContent: { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
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
    overflow: 'hidden',
  },
  navChipText: { fontSize: 12.5, fontWeight: '700' },
  mainScroll: { flex: 1 },
  content: { padding: 16, paddingTop: 12, paddingBottom: 40 },
  calcContainer: { gap: 10 },
  calcDisplayCard: { padding: 16, alignItems: 'flex-end', justifyContent: 'center', minHeight: 112 },
  calcTopMetaRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calcModePillGroup: { flexDirection: 'row', gap: 6 },
  calcModeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  calcExpression: { fontSize: 14, marginBottom: 4, alignSelf: 'flex-end' },
  calcMainDisplay: { fontSize: 30, fontWeight: '800', alignSelf: 'flex-end' },
  historyTape: { gap: 8, paddingVertical: 2 },
  historyPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  keypad: { gap: 8 },
  keypadRow: { flexDirection: 'row', gap: 6 },
  keyBtn: {
    flex: 1,
    height: 46,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBtnText: { fontSize: 15 },
  equalsFullBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  equalsFullText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 3 },
  sectionSubtitle: { fontSize: 12, marginBottom: 12 },
  periodicHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  viewToggleGroup: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    gap: 4,
  },
  viewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
  },
  molarCard: { padding: 14, borderWidth: 1, gap: 10 },
  molarTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  molarTitle: { fontSize: 14, fontWeight: '800' },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13.5,
    fontWeight: '700',
  },
  molarPresetRow: { gap: 6 },
  molarPresetPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchBoxInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  catFilterRow: { gap: 6, paddingVertical: 2 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  catDot: { width: 7, height: 7, borderRadius: 4 },
  elementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  elementCard: {
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
  elNumber: { fontSize: 10, fontWeight: '700' },
  elDot: { width: 6, height: 6, borderRadius: 3 },
  elSymbol: { fontSize: 17, fontWeight: '800', marginVertical: 2 },
  elName: { fontSize: 9, fontWeight: '500' },
  elMass: { fontSize: 9, fontWeight: '700', marginTop: 2 },
  classicRow: { flexDirection: 'row', gap: 4 },
  classicSpacer: { width: 42, height: 42 },
  classicFLabel: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  classicCell: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  classicNum: { fontSize: 8.5, fontWeight: '700' },
  classicSym: { fontSize: 13, fontWeight: '800' },
  convTabScroll: { gap: 8, paddingVertical: 2 },
  convTabChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  convTabText: { fontSize: 11.5, fontWeight: '700' },
  converterCard: { padding: 16, gap: 12 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  convInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '800',
  },
  unitSelectRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  swapBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  pillOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  unitPill: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  resultBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    marginTop: 6,
  },
  resultLabel: { fontSize: 11.5, fontWeight: '600', marginBottom: 4 },
  resultValue: { fontSize: 23, fontWeight: '800' },
  constantCard: { padding: 14 },
  constHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  constName: { fontSize: 14, fontWeight: '700' },
  constValue: { fontSize: 14, fontWeight: '800', marginVertical: 2 },
  constDesc: { fontSize: 11.5, lineHeight: 16 },
  reactivityCard: { padding: 14, marginBottom: 8 },
  reactivityRow: { flexDirection: 'row', alignItems: 'flex-start' },
  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  rankNum: { fontSize: 12, fontWeight: '800' },
  reactivityMetal: { fontSize: 14.5, fontWeight: '700' },
  reactivityLevel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  reactivityWater: { fontSize: 11.5, lineHeight: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  modalSymbol: { fontSize: 48, fontWeight: '900' },
  modalName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  modalMass: { fontSize: 13, marginBottom: 14 },
  modalInfoBox: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoRow: { fontSize: 13 },
  modalNavRow: { flexDirection: 'row', width: '100%', gap: 8, alignItems: 'center' },
  modalNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  closeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  closeBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  groupStripBox: {
    gap: 6,
  },
  groupStripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  groupStripLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  groupStripScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  groupGuidePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 11,
    borderWidth: 1,
    overflow: 'hidden',
  },
  classicGroupHdr: {
    width: 42,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    overflow: 'hidden',
  },
  groupLinkBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  infoTrendNote: {
    fontSize: 11.5,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  groupModalContent: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    overflow: 'hidden',
  },
  groupModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  groupModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
  },
  groupSectionHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  groupBodyText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  groupBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  compoundChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  compoundChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  groupElementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    paddingBottom: 6,
  },
  groupElChip: {
    width: 68,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1.25,
    alignItems: 'center',
    overflow: 'hidden',
  },
});
