import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { 
  Activity, 
  Layers, 
  RotateCcw, 
  Sliders, 
  Share2, 
  Info,
  Maximize2
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = Math.min(width - 48, 380);
const GRAPH_HEIGHT = 220;

type Mode = 'math' | 'physics' | 'chemistry';

export const GraphPlaygroundScreen: React.FC = () => {
  const { colors, mode: themeMode } = useTheme();
  const [activeMode, setActiveMode] = useState<Mode>('math');
  
  // Math parameters: y = A * sin(B * x) or y = m*x + c or y = a*x^2
  const [mathFunc, setMathFunc] = useState<'sine' | 'quadratic' | 'exponential'>('sine');
  const [paramA, setParamA] = useState<number>(1.5);
  const [paramB, setParamB] = useState<number>(1.0);

  // Physics presets: projectile, shm, kinematics
  const [physicsPreset, setPhysicsPreset] = useState<'projectile' | 'shm' | 'vt_graph'>('projectile');

  // Chemistry functional groups
  const [chemPreset, setChemPreset] = useState<'alkane' | 'benzene' | 'ester' | 'alcohol'>('benzene');

  // Generate sample points for graph plotting
  const generateGraphPoints = () => {
    const points: { x: number; y: number }[] = [];
    const steps = 40;

    for (let i = 0; i <= steps; i++) {
      const normX = (i / steps) * 2 - 1; // -1 to +1
      let normY = 0;

      if (activeMode === 'math') {
        if (mathFunc === 'sine') {
          normY = paramA * Math.sin(paramB * normX * Math.PI * 2) * 0.4;
        } else if (mathFunc === 'quadratic') {
          normY = paramA * (normX * normX) * 0.8 - 0.4;
        } else {
          // Exponential
          normY = (Math.exp(paramA * normX) / Math.E) * 0.8 - 0.4;
        }
      } else if (activeMode === 'physics') {
        if (physicsPreset === 'projectile') {
          // Inverted parabola
          normY = 0.6 * (1 - normX * normX) - 0.2;
        } else if (physicsPreset === 'shm') {
          // Damped harmonic oscillator
          normY = 0.5 * Math.exp(-0.8 * (normX + 1)) * Math.cos(normX * 8);
        } else {
          // Velocity-Time accelerating then constant
          normY = normX < 0 ? 0.4 * (normX + 1) - 0.3 : 0.1;
        }
      }

      // Clamp between -0.9 and 0.9 for canvas viewport
      normY = Math.max(-0.9, Math.min(0.9, normY));

      // Screen coordinates:
      const screenX = (i / steps) * GRAPH_WIDTH;
      const screenY = (GRAPH_HEIGHT / 2) - (normY * (GRAPH_HEIGHT / 2));
      points.push({ x: screenX, y: screenY });
    }
    return points;
  };

  const points = generateGraphPoints();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>STEM Graph Playground</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Interactive 2D function plotting, kinematics & chemistry
          </Text>
        </View>
        <Badge label="Interactive" variant="primary" />
      </View>

      {/* Mode Switcher */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle }]}>
        <TouchableOpacity
          onPress={() => { setActiveMode('math'); }}
          style={[styles.tabBtn, activeMode === 'math' && { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.tabText, { color: activeMode === 'math' ? '#FFF' : colors.textSecondary }]}>
            2D Math Graphs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setActiveMode('physics'); }}
          style={[styles.tabBtn, activeMode === 'physics' && { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.tabText, { color: activeMode === 'physics' ? '#FFF' : colors.textSecondary }]}>
            Physics Kinematics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setActiveMode('chemistry'); }}
          style={[styles.tabBtn, activeMode === 'chemistry' && { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.tabText, { color: activeMode === 'chemistry' ? '#FFF' : colors.textSecondary }]}>
            Organic Structures
          </Text>
        </TouchableOpacity>
      </View>

      {/* Canvas Viewport */}
      {activeMode !== 'chemistry' ? (
        <Card style={styles.canvasCard}>
          <View style={styles.canvasMeta}>
            <Text style={[styles.equationLabel, { color: colors.primary }]}>
              {activeMode === 'math' 
                ? mathFunc === 'sine' ? `f(x) = ${paramA} · sin(${paramB} · 2πx)` 
                  : mathFunc === 'quadratic' ? `f(x) = ${paramA} · x²` 
                  : `f(x) = e^(${paramA} · x)`
                : physicsPreset === 'projectile' ? 'Trajectory: y = x · tan(θ) - (g·x²)/(2v₀²·cos²θ)'
                : physicsPreset === 'shm' ? 'Damped SHM: x(t) = A·e^(-γt)·cos(ωt)'
                : 'Kinematics: Velocity vs Time (v-t)'
              }
            </Text>
            <View style={styles.canvasButtons}>
              <TouchableOpacity 
                onPress={() => { setParamA(1.0); setParamB(1.0); }}
                style={[styles.iconBtn, { backgroundColor: colors.surface }]}
              >
                <RotateCcw size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Graph Simulation Canvas */}
          <View style={[styles.canvasFrame, { backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FAFAFA', borderColor: colors.border }]}>
            {/* Grid Lines */}
            <View style={[styles.axisX, { top: GRAPH_HEIGHT / 2, backgroundColor: colors.border }]} />
            <View style={[styles.axisY, { left: GRAPH_WIDTH / 2, backgroundColor: colors.border }]} />
            
            {/* Plotted Points & Segments */}
            {points.map((pt, idx) => (
              <View
                key={idx}
                style={[
                  styles.pointDot,
                  {
                    left: pt.x - 2.5,
                    top: pt.y - 2.5,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            ))}
          </View>

          {/* Sliders / Variable Adjustments */}
          {activeMode === 'math' && (
            <View style={styles.controlsRow}>
              <View style={styles.controlGroup}>
                <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Amplitude / Factor (A): {paramA.toFixed(1)}</Text>
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
                <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Frequency / Modifier (B): {paramB.toFixed(1)}</Text>
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
          )}

          {/* Preset Buttons */}
          <View style={styles.presetRow}>
            {activeMode === 'math' ? (
              <>
                {(['sine', 'quadratic', 'exponential'] as const).map((func) => (
                  <TouchableOpacity
                    key={func}
                    onPress={() => { setMathFunc(func); }}
                    style={[
                      styles.presetBtn,
                      {
                        backgroundColor: mathFunc === func ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: mathFunc === func ? colors.primary : colors.borderSubtle,
                      }
                    ]}
                  >
                    <Text style={{ color: mathFunc === func ? '#FFF' : colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
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
                    onPress={() => { setPhysicsPreset(p); }}
                    style={[
                      styles.presetBtn,
                      {
                        backgroundColor: physicsPreset === p ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: physicsPreset === p ? colors.primary : colors.borderSubtle,
                      }
                    ]}
                  >
                    <Text style={{ color: physicsPreset === p ? '#FFF' : colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
                      {p === 'projectile' ? 'Projectile' : p === 'shm' ? 'Damped SHM' : 'v-t Graph'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </Card>
      ) : (
        /* Chemistry Structural Explorer */
        <Card style={styles.canvasCard}>
          <Text style={[styles.equationLabel, { color: colors.primary, marginBottom: 12 }]}>
            IUPAC Structure & 2D Bonding Schema
          </Text>

          <View style={[styles.chemVisualBox, { backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FAFAFA', borderColor: colors.border }]}>
            {chemPreset === 'benzene' && (
              <View style={styles.chemCenter}>
                <Text style={[styles.chemFormula, { color: colors.primary }]}>C₆H₆</Text>
                <Text style={[styles.chemIupac, { color: colors.textPrimary }]}>Benzene (Aromatic Ring)</Text>
                <Text style={[styles.chemDetails, { color: colors.textSecondary }]}>
                  Delocalized 6 π-electrons with planar sp² hybridization and resonance stabilization energy of 36 kcal/mol.
                </Text>
              </View>
            )}
            {chemPreset === 'ester' && (
              <View style={styles.chemCenter}>
                <Text style={[styles.chemFormula, { color: colors.primary }]}>CH₃-COO-CH₂CH₃</Text>
                <Text style={[styles.chemIupac, { color: colors.textPrimary }]}>Ethyl Ethanoate (Ester)</Text>
                <Text style={[styles.chemDetails, { color: colors.textSecondary }]}>
                  Formed by Fischer esterification of ethanoic acid and ethanol in acidic medium. Distinctive fruity aroma.
                </Text>
              </View>
            )}
            {chemPreset === 'alcohol' && (
              <View style={styles.chemCenter}>
                <Text style={[styles.chemFormula, { color: colors.primary }]}>CH₃-CH₂-OH</Text>
                <Text style={[styles.chemIupac, { color: colors.textPrimary }]}>Ethanol (Primary Alcohol)</Text>
                <Text style={[styles.chemDetails, { color: colors.textSecondary }]}>
                  Undergoes oxidation with acidified K₂Cr₂O₇ to form ethanal and subsequently ethanoic acid.
                </Text>
              </View>
            )}
            {chemPreset === 'alkane' && (
              <View style={styles.chemCenter}>
                <Text style={[styles.chemFormula, { color: colors.primary }]}>CH₃-CH(CH₃)-CH₃</Text>
                <Text style={[styles.chemIupac, { color: colors.textPrimary }]}>2-Methylpropane (Isobutane)</Text>
                <Text style={[styles.chemDetails, { color: colors.textSecondary }]}>
                  Branched alkane showing tetrahedral geometry (109.5° bond angle) with 1 tertiary carbon atom.
                </Text>
              </View>
            )}
          </View>

          {/* Chemistry selector */}
          <View style={styles.presetRow}>
            {(['benzene', 'ester', 'alcohol', 'alkane'] as const).map((cp) => (
              <TouchableOpacity
                key={cp}
                onPress={() => { setChemPreset(cp); }}
                style={[
                  styles.presetBtn,
                  {
                    backgroundColor: chemPreset === cp ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: chemPreset === cp ? colors.primary : colors.borderSubtle,
                  }
                ]}
              >
                <Text style={{ color: chemPreset === cp ? '#FFF' : colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
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
            Supports real-time function evaluation for competitive exams (JEE Main, Advanced, NEET, CBSE). Adjust parameters to observe changes dynamically.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  canvasCard: {
    padding: 16,
    marginBottom: 16,
  },
  canvasMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  equationLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    flex: 1,
  },
  canvasButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasFrame: {
    width: '100%',
    height: GRAPH_HEIGHT,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  axisX: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  axisY: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
  },
  pointDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  controlGroup: {
    flex: 1,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paramBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  chemVisualBox: {
    height: GRAPH_HEIGHT,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chemCenter: {
    alignItems: 'center',
  },
  chemFormula: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  chemIupac: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  chemDetails: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoCard: {
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
});

