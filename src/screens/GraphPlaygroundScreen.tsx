import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Info, RotateCcw } from 'lucide-react-native';

const GRAPH_HEIGHT = 220;

type PlaygroundMode = 'math' | 'physics' | 'chemistry';

export const GraphPlaygroundScreen: React.FC = () => {
  const { colors, mode: themeMode } = useTheme();
  const { width: winWidth } = useWindowDimensions();
  const canvasWidth = Math.max(240, Math.min(winWidth - 68, 520));

  const [activeMode, setActiveMode] = useState<PlaygroundMode>('math');
  const [mathFunc, setMathFunc] = useState<'sine' | 'quadratic' | 'exponential'>('sine');
  const [paramA, setParamA] = useState<number>(1.5);
  const [paramB, setParamB] = useState<number>(1.0);
  const [physicsPreset, setPhysicsPreset] = useState<'projectile' | 'shm' | 'vt_graph'>('projectile');
  const [chemPreset, setChemPreset] = useState<'benzene' | 'ester' | 'alcohol' | 'alkane'>('benzene');

  const polylinePoints = useMemo(() => {
    const steps = 120;
    const pts: string[] = [];

    for (let i = 0; i <= steps; i++) {
      const normX = (i / steps) * 2 - 1; // -1..+1
      let normY = 0;

      if (activeMode === 'math') {
        if (mathFunc === 'sine') {
          normY = paramA * Math.sin(paramB * normX * Math.PI * 2) * 0.36;
        } else if (mathFunc === 'quadratic') {
          normY = paramA * (normX * normX) * 0.55 - 0.35;
        } else {
          normY = (Math.exp(paramA * normX) / Math.E) * 0.68 - 0.35;
        }
      } else if (activeMode === 'physics') {
        if (physicsPreset === 'projectile') {
          normY = 0.72 * paramA * (1 - normX * normX) * 0.65 - 0.3;
        } else if (physicsPreset === 'shm') {
          normY =
            0.55 *
            paramA *
            0.6 *
            Math.exp(-0.7 * (normX + 1)) *
            Math.cos(normX * 6 * paramB);
        } else {
          normY = normX < 0 ? 0.45 * paramA * (normX + 1) - 0.35 : 0.45 * paramA - 0.35;
        }
      }

      const clampedY = Math.max(-0.92, Math.min(0.92, normY));
      const sx = (i / steps) * canvasWidth;
      const sy = GRAPH_HEIGHT / 2 - clampedY * (GRAPH_HEIGHT / 2);
      pts.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [activeMode, mathFunc, paramA, paramB, physicsPreset, canvasWidth]);

  const axisColor = themeMode === 'dark' ? '#475569' : '#CBD5E1';
  const gridColor = themeMode === 'dark' ? '#1E293B' : '#E2E8F0';
  const strokeColor = colors.primary;
  const atomStroke = themeMode === 'dark' ? '#E2E8F0' : '#1E293B';

  const renderChemicalSvg = () => {
    if (chemPreset === 'benzene') {
      const cx = 120;
      const cy = 76;
      const r = 46;
      const hexPts = Array.from({ length: 6 }, (_, i) => {
        const ang = (Math.PI / 3) * i - Math.PI / 2;
        return `${(cx + r * Math.cos(ang)).toFixed(1)},${(cy + r * Math.sin(ang)).toFixed(1)}`;
      }).join(' ');
      return (
        <Svg width={240} height={152} viewBox="0 0 240 152">
          <Polyline
            points={`${hexPts} ${hexPts.split(' ')[0]}`}
            fill="none"
            stroke={colors.primary}
            strokeWidth={3}
          />
          <Circle
            cx={cx}
            cy={cy}
            r={28}
            fill="none"
            stroke={colors.cyan}
            strokeWidth={2}
            strokeDasharray="6 4"
          />
          <SvgText x={cx - 12} y={20} fill={atomStroke} fontSize={11} fontWeight="700">
            sp²
          </SvgText>
          <SvgText x={cx - 18} y={cy + 4} fill={colors.primary} fontSize={12} fontWeight="800">
            6π e⁻
          </SvgText>
        </Svg>
      );
    }

    if (chemPreset === 'ester') {
      return (
        <Svg width={260} height={152} viewBox="0 0 260 152">
          {/* CH3 - C(=O) - O - CH2 - CH3 */}
          <Line x1={42} y1={90} x2={88} y2={90} stroke={atomStroke} strokeWidth={2.5} />
          <Line x1={85} y1={90} x2={85} y2={42} stroke={colors.primary} strokeWidth={2.5} />
          <Line x1={91} y1={90} x2={91} y2={42} stroke={colors.primary} strokeWidth={2.5} />
          <Line x1={88} y1={90} x2={132} y2={114} stroke={atomStroke} strokeWidth={2.5} />
          <Line x1={146} y1={114} x2={188} y2={90} stroke={atomStroke} strokeWidth={2.5} />
          <Line x1={188} y1={90} x2={228} y2={112} stroke={atomStroke} strokeWidth={2.5} />
          <SvgText x={14} y={94} fill={atomStroke} fontSize={12} fontWeight="700">
            CH₃
          </SvgText>
          <SvgText x={82} y={34} fill={colors.primary} fontSize={13} fontWeight="800">
            O
          </SvgText>
          <SvgText x={133} y={128} fill={colors.cyan} fontSize={13} fontWeight="800">
            O
          </SvgText>
          <SvgText x={180} y={80} fill={atomStroke} fontSize={11} fontWeight="700">
            CH₂
          </SvgText>
          <SvgText x={226} y={120} fill={atomStroke} fontSize={12} fontWeight="700">
            CH₃
          </SvgText>
        </Svg>
      );
    }

    if (chemPreset === 'alcohol') {
      return (
        <Svg width={250} height={152} viewBox="0 0 250 152">
          <Line x1={48} y1={96} x2={102} y2={62} stroke={atomStroke} strokeWidth={2.8} />
          <Line x1={102} y1={62} x2={156} y2={96} stroke={atomStroke} strokeWidth={2.8} />
          <Line x1={156} y1={96} x2={204} y2={70} stroke={colors.primary} strokeWidth={2.8} />
          <SvgText x={18} y={102} fill={atomStroke} fontSize={13} fontWeight="700">
            H₃C
          </SvgText>
          <SvgText x={90} y={50} fill={atomStroke} fontSize={12} fontWeight="700">
            CH₂
          </SvgText>
          <SvgText x={148} y={118} fill={colors.cyan} fontSize={13} fontWeight="800">
            O
          </SvgText>
          <SvgText x={208} y={73} fill={colors.primary} fontSize={14} fontWeight="800">
            H
          </SvgText>
        </Svg>
      );
    }

    // Alkane: Isobutane 2-methylpropane
    return (
      <Svg width={250} height={152} viewBox="0 0 250 152">
        <Line x1={125} y1={78} x2={125} y2={28} stroke={colors.primary} strokeWidth={2.8} />
        <Line x1={125} y1={78} x2={68} y2={114} stroke={atomStroke} strokeWidth={2.8} />
        <Line x1={125} y1={78} x2={182} y2={114} stroke={atomStroke} strokeWidth={2.8} />
        <SvgText x={112} y={20} fill={colors.primary} fontSize={12.5} fontWeight="800">
          CH₃
        </SvgText>
        <SvgText x={114} y={96} fill={colors.cyan} fontSize={12.5} fontWeight="800">
          CH
        </SvgText>
        <SvgText x={36} y={124} fill={atomStroke} fontSize={12.5} fontWeight="700">
          CH₃
        </SvgText>
        <SvgText x={186} y={124} fill={atomStroke} fontSize={12.5} fontWeight="700">
          CH₃
        </SvgText>
      </Svg>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header (flex-safe so badge never clips off-screen) */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>STEM Graph Playground</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Interactive 2D function plotting, kinematics & chemistry
          </Text>
        </View>
        <Badge label="Interactive" variant="primary" />
      </View>

      {/* Clean Non-Colliding 3-Tab Mode Switcher */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle },
        ]}
      >
        {(
          [
            { id: 'math', label: 'Math Plots' },
            { id: 'physics', label: 'Kinematics' },
            { id: 'chemistry', label: 'Structures' },
          ] as const
        ).map((tab) => {
          const active = activeMode === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveMode(tab.id)}
              style={[styles.tabBtn, active && { backgroundColor: colors.primary }]}
            >
              <Text
                numberOfLines={1}
                style={[styles.tabText, { color: active ? '#FFFFFF' : colors.textSecondary }]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Canvas Viewport */}
      {activeMode !== 'chemistry' ? (
        <Card style={styles.canvasCard}>
          <View style={styles.canvasMeta}>
            <Text style={[styles.equationLabel, { color: colors.primary }]} numberOfLines={2}>
              {activeMode === 'math'
                ? mathFunc === 'sine'
                  ? `f(x) = ${paramA.toFixed(1)} · sin(${paramB.toFixed(1)} · 2πx)`
                  : mathFunc === 'quadratic'
                  ? `f(x) = ${paramA.toFixed(1)} · x²`
                  : `f(x) = e^(${paramA.toFixed(1)} · x)`
                : physicsPreset === 'projectile'
                ? `y = x·tan(θ) - g·x² / (2v₀²cos²θ) · Scale ${paramA.toFixed(1)}`
                : physicsPreset === 'shm'
                ? `x(t) = ${paramA.toFixed(1)}·e^(-0.7t)·cos(${paramB.toFixed(1)}ωt)`
                : `Kinematics v(t) · Gain ${paramA.toFixed(1)}`}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setParamA(1.0);
                setParamB(1.0);
              }}
              style={[styles.iconBtn, { backgroundColor: colors.surface }]}
              accessibilityLabel="Reset graph parameters"
            >
              <RotateCcw size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Responsive Smooth SVG Graph */}
          <View
            style={[
              styles.canvasFrame,
              {
                backgroundColor: themeMode === 'dark' ? '#0B1324' : '#FAFAFA',
                borderColor: colors.border,
              },
            ]}
          >
            <Svg width={canvasWidth} height={GRAPH_HEIGHT}>
              {/* Vertical & Horizontal Grid Subdivisions */}
              {[0.25, 0.75].map((frac) => (
                <Line
                  key={`gx_${frac}`}
                  x1={canvasWidth * frac}
                  y1={0}
                  x2={canvasWidth * frac}
                  y2={GRAPH_HEIGHT}
                  stroke={gridColor}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              ))}
              {[0.25, 0.75].map((frac) => (
                <Line
                  key={`gy_${frac}`}
                  x1={0}
                  y1={GRAPH_HEIGHT * frac}
                  x2={canvasWidth}
                  y2={GRAPH_HEIGHT * frac}
                  stroke={gridColor}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              ))}

              {/* Main Axes */}
              <Line
                x1={0}
                y1={GRAPH_HEIGHT / 2}
                x2={canvasWidth}
                y2={GRAPH_HEIGHT / 2}
                stroke={axisColor}
                strokeWidth={1.25}
              />
              <Line
                x1={canvasWidth / 2}
                y1={0}
                x2={canvasWidth / 2}
                y2={GRAPH_HEIGHT}
                stroke={axisColor}
                strokeWidth={1.25}
              />

              {/* Axis Labels */}
              <SvgText x={canvasWidth / 2 + 5} y={13} fill={axisColor} fontSize={10}>
                +y
              </SvgText>
              <SvgText x={canvasWidth - 18} y={GRAPH_HEIGHT / 2 - 5} fill={axisColor} fontSize={10}>
                +x
              </SvgText>

              {/* Smooth Curve */}
              <Polyline
                points={polylinePoints}
                fill="none"
                stroke={strokeColor}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          {/* Aligned Single-Line Parameter Controls */}
          <View style={styles.controlsRow}>
            <View style={styles.controlGroup}>
              <Text style={[styles.controlLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                Amplitude (A): {paramA.toFixed(1)}
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  onPress={() => setParamA((prev) => Math.max(0.5, prev - 0.25))}
                  style={[styles.paramBtn, { backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>- 0.25</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setParamA((prev) => Math.min(2.5, prev + 0.25))}
                  style={[styles.paramBtn, { backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>+ 0.25</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.controlGroup}>
              <Text style={[styles.controlLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                Frequency (B): {paramB.toFixed(1)}
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  onPress={() => setParamB((prev) => Math.max(0.5, prev - 0.25))}
                  style={[styles.paramBtn, { backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>- 0.25</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setParamB((prev) => Math.min(2.5, prev + 0.25))}
                  style={[styles.paramBtn, { backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>+ 0.25</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Preset Buttons */}
          <View style={styles.presetRow}>
            {activeMode === 'math' ? (
              <>
                {(['sine', 'quadratic', 'exponential'] as const).map((func) => (
                  <TouchableOpacity
                    key={func}
                    onPress={() => setMathFunc(func)}
                    style={[
                      styles.presetBtn,
                      {
                        backgroundColor: mathFunc === func ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: mathFunc === func ? colors.primary : colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: mathFunc === func ? '#FFF' : colors.textPrimary,
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      {func.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <>
                {(['projectile', 'shm', 'vt_graph'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPhysicsPreset(p)}
                    style={[
                      styles.presetBtn,
                      {
                        backgroundColor: physicsPreset === p ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: physicsPreset === p ? colors.primary : colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: physicsPreset === p ? '#FFF' : colors.textPrimary,
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      {p === 'projectile' ? 'Projectile' : p === 'shm' ? 'Damped SHM' : 'v-t Graph'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </Card>
      ) : (
        /* Chemistry Structural Explorer with Live 2D SVG Skeletal Diagrams */
        <Card style={styles.canvasCard}>
          <Text style={[styles.equationLabel, { color: colors.primary, marginBottom: 10 }]}>
            IUPAC 2D Molecular Bonding Explorer
          </Text>

          <View
            style={[
              styles.chemVisualBox,
              {
                backgroundColor: themeMode === 'dark' ? '#0B1324' : '#FAFAFA',
                borderColor: colors.border,
              },
            ]}
          >
            {renderChemicalSvg()}
            <Text style={[styles.chemIupac, { color: colors.textPrimary }]}>
              {chemPreset === 'benzene'
                ? 'Benzene (C₆H₆)'
                : chemPreset === 'ester'
                ? 'Ethyl Ethanoate (CH₃COOCH₂CH₃)'
                : chemPreset === 'alcohol'
                ? 'Ethanol (CH₃CH₂OH)'
                : '2-Methylpropane · Isobutane'}
            </Text>
            <Text style={[styles.chemDetails, { color: colors.textSecondary }]}>
              {chemPreset === 'benzene'
                ? 'Planar aromatic ring with 6 delocalized π-electrons (sp² hybridized) and 36 kcal/mol resonance energy.'
                : chemPreset === 'ester'
                ? 'Ester linkage formed by Fischer esterification of ethanoic acid + ethanol in acid medium.'
                : chemPreset === 'alcohol'
                ? 'Primary alcohol oxidized stepwise to ethanal and ethanoic acid with acidic K₂Cr₂O₇.'
                : 'Branched alkane with sp³ tetrahedral carbon (109.5°) and one tertiary C-H center.'}
            </Text>
          </View>

          <View style={styles.presetRow}>
            {(['benzene', 'ester', 'alcohol', 'alkane'] as const).map((cp) => (
              <TouchableOpacity
                key={cp}
                onPress={() => setChemPreset(cp)}
                style={[
                  styles.presetBtn,
                  {
                    backgroundColor: chemPreset === cp ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: chemPreset === cp ? colors.primary : colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={{
                    color: chemPreset === cp ? '#FFF' : colors.textPrimary,
                    fontSize: 11.5,
                    fontWeight: '700',
                  }}
                >
                  {cp.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {/* Educational Notice */}
      <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <View style={styles.infoRow}>
          <Info size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Supports real-time SVG curve plotting and molecular schematics for JEE, NEET, and CBSE.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  headerTextCol: { flex: 1, paddingRight: 8, minWidth: 0 },
  title: { fontSize: 21, fontWeight: '800' },
  subtitle: { fontSize: 12.5, marginTop: 2 },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: { fontSize: 12, fontWeight: '700' },
  canvasCard: { padding: 16, marginBottom: 16 },
  canvasMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  equationLabel: { fontSize: 13.5, fontWeight: '700', flex: 1 },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasFrame: {
    width: '100%',
    height: GRAPH_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  controlGroup: { flex: 1 },
  controlLabel: { fontSize: 11.5, fontWeight: '700', marginBottom: 6 },
  btnRow: { flexDirection: 'row', gap: 8 },
  paramBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetRow: { flexDirection: 'row', gap: 8 },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  chemVisualBox: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  chemIupac: { fontSize: 15.5, fontWeight: '800', marginTop: 4, marginBottom: 4, textAlign: 'center' },
  chemDetails: { fontSize: 12, textAlign: 'center', lineHeight: 17 },
  infoCard: { padding: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 12, flex: 1, lineHeight: 17 },
});
